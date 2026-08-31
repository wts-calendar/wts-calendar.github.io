import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import ts from 'typescript';

const root = resolve(import.meta.dirname, '..');
const readJson = (path) => JSON.parse(readFileSync(resolve(root, path), 'utf8'));
const examples = readJson('src/app/premium-integration-data.json');
const guides = readJson('src/app/premium-feature-data.json');
assert.equal(examples.length, guides.length, 'Each Premium guide needs one integration example');
assert.deepEqual(new Set(examples.map((item) => item.id)), new Set(guides.map((item) => item.id)));

const files = new Map();
for (const example of examples) {
  assert.match(example.install, /^npm install @wts-calendar\/core(?: moment)?$/);
  assert.match(example.code, /verifyCalendarLicense\('YOUR_WTS_LICENSE_KEY'\)/);
  assert.ok(example.notes.length > 0, 'Missing integration responsibilities: ' + example.id);
  assert.ok(
    !/eyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/.test(JSON.stringify(example)),
    'Do not embed a real license or credential',
  );
  // A migration method's exact identifier is API syntax, not marketing copy.
  assert.ok(
    !/full[\s-]*calend[ae]r/i.test(
      JSON.stringify(example).replaceAll('migrateFullCalendarOptions', 'migrationMethod'),
    ),
    'Competitor branding outside required API syntax',
  );
  assert.ok(!example.markup || example.markup === '<div id="calendar"></div>');
  if (example.markup) {
    assert.equal(
      example.stylesheet,
      "@import '@wts-calendar/core/styles/calendar.css';",
      'UI example needs the stylesheet: ' + example.id,
    );
    assert.ok(
      existsSync(resolve(root, 'node_modules/@wts-calendar/core/dist/styles/calendar.css')),
    );
    assert.match(example.code, /plugins: \[(resourceSchedulingModule|repeatedTasksModule)\]/);
    assert.ok(
      example.code.includes('calendar.destroy()'),
      'UI example needs cleanup: ' + example.id,
    );
  }
  files.set(resolve(root, '.premium-doc-check', example.id + '.ts'), example.code);
}

// Compile virtual source files against the registry dependency. Never execute snippets
// and never write generated sources or replace the application's installed package.
const options = {
  noEmit: true,
  strict: true,
  noUnusedLocals: true,
  noUnusedParameters: true,
  noPropertyAccessFromIndexSignature: true,
  exactOptionalPropertyTypes: true,
  skipLibCheck: true,
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  lib: ['lib.es2022.d.ts', 'lib.dom.d.ts'],
};
const host = ts.createCompilerHost(options);
const getSourceFile = host.getSourceFile.bind(host);
host.getSourceFile = (path, languageVersion, onError, shouldCreateNewSourceFile) =>
  files.has(path)
    ? ts.createSourceFile(path, files.get(path), languageVersion, true)
    : getSourceFile(path, languageVersion, onError, shouldCreateNewSourceFile);
const program = ts.createProgram([...files.keys()], options, host);
const diagnostics = ts.getPreEmitDiagnostics(program);
if (diagnostics.length) {
  console.error(
    ts.formatDiagnosticsWithColorAndContext(diagnostics, {
      getCanonicalFileName: (file) => file,
      getCurrentDirectory: () => root,
      getNewLine: () => '\n',
    }),
  );
  process.exitCode = 1;
} else {
  const version = readJson('node_modules/@wts-calendar/core/package.json').version;
  console.log(
    examples.length +
      ' inert Premium snippets type-check against @wts-calendar/core@' +
      version +
      '; placeholders and complete guide coverage verified.',
  );
}
