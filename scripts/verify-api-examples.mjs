import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { resolve, join } from 'node:path';
import ts from 'typescript';

const root = resolve(import.meta.dirname, '..');
async function load(name) {
  const source = readFileSync(resolve(root, 'src/app', name), 'utf8');
  const code = ts.transpile(source, {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  });
  return import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'));
}
const { optionGuide, METHOD_EXAMPLES } = await load('api-guidance.ts');
const { CLIENT_OPTIONS, CLIENT_METHODS, CLIENT_EVENTS } = await load(
  'api-reference-data.generated.ts',
);
const temporary = mkdtempSync(join(root, '.api-examples-'));
try {
  const files = [];
  for (const option of CLIENT_OPTIONS) {
    const guide = optionGuide(option.name);
    assert.notEqual(
      guide.description || option.description,
      'Typed calendar option.',
      'Missing explanation: ' + option.name,
    );
    if (!guide.value) continue;
    const path = join(temporary, 'option-' + option.name + '.ts');
    writeFileSync(
      path,
      `import type {CalendarOptions} from '@wts-calendar/core';\nconst options = {${option.name}: ${guide.value}} satisfies Partial<CalendarOptions>;`,
    );
    files.push(path);
  }
  for (const [name, code] of Object.entries(METHOD_EXAMPLES)) {
    assert.ok(
      CLIENT_METHODS.some((m) => m.name === name),
      'Unknown method: ' + name,
    );
    const path = join(temporary, 'method-' + name + '.ts');
    writeFileSync(
      path,
      `import type {WtsCalendar} from '@wts-calendar/core';\ndeclare const calendar: WtsCalendar;\n${code}`,
    );
    files.push(path);
  }
  const events = join(temporary, 'events.ts');
  writeFileSync(
    events,
    `import type {WtsCalendar} from '@wts-calendar/core';\ndeclare const calendar: WtsCalendar;\n` +
      CLIENT_EVENTS.map((name) => `calendar.on('${name}', detail => console.log(detail));`).join(
        '\n',
      ),
  );
  files.push(events);
  const program = ts.createProgram(files, {
    strict: true,
    noEmit: true,
    skipLibCheck: true,
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    types: [],
  });
  const diagnostics = ts.getPreEmitDiagnostics(program);
  if (diagnostics.length)
    throw new Error(
      ts.formatDiagnosticsWithColorAndContext(diagnostics, {
        getCurrentDirectory: () => root,
        getCanonicalFileName: (f) => f,
        getNewLine: () => '\n',
      }),
    );
  console.log(
    `Verified ${files.length - 1} option/method examples and ${CLIENT_EVENTS.length} event subscriptions against published declarations; all options have explanations.`,
  );
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
