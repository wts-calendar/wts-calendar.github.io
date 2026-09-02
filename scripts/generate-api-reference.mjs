import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import ts from 'typescript';
import { format } from 'prettier';

const root = resolve(import.meta.dirname, '..');
const typesPath = resolve(root, 'node_modules/@wts-calendar/core/dist/types/type.d.ts');
const corePath = resolve(root, 'node_modules/@wts-calendar/core/dist/index.d.ts');
const packagePath = resolve(root, 'node_modules/@wts-calendar/core/package.json');
const outputPath = resolve(root, 'src/app/api-reference-data.generated.ts');
const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
const entrypointExports = Object.entries(packageJson.exports)
  .filter(([entrypoint]) => entrypoint !== './package.json' && entrypoint !== './styles/*')
  .map(([entrypoint, target]) => ({
    entrypoint,
    path: resolve(root, 'node_modules/@wts-calendar/core', target.types),
  }));
const entrypoints = entrypointExports.map(({ entrypoint }) => entrypoint);
const program = ts.createProgram(
  [...new Set([typesPath, corePath, ...entrypointExports.map(({ path }) => path)])],
  {
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    skipLibCheck: true,
  },
);
const checker = program.getTypeChecker();
const typesSource = program.getSourceFile(typesPath);
const coreSource = program.getSourceFile(corePath);
assert.ok(
  typesSource && coreSource,
  'The installed @wts-calendar/core declaration files are required',
);

const immutableOptions = new Set([
  'container',
  'document',
  'plugins',
  'views',
  'initialView',
  'initialDate',
  'license',
  'apikey',
  'events',
  'eventSources',
  'googleCalendarApiKey',
  'resources',
  'resourceSources',
  'taskSources',
  'styleUrl',
  'customHTML',
  'extraClass',
  'hideHeader',
  'droppable',
  'dropAccept',
  'externalEventData',
  'eventTransferMode',
]);

const premiumOption =
  /^(resource|resources|resourceSources|task|taskSources|repeatedTask|datesAboveResources|eventResourceEditable|filterResourcesWithEvents|columnResizing)/i;
const callbacks =
  /(?:^|[A-Z])(DidMount|WillUnmount|Content|ClassNames|Click|MouseEnter|MouseLeave|Change|Allow|Receive|Drop|Resize|Select|Unselect|Set|Loading|Success|Failure|Invalid)$/;

function textOf(symbol, fallback) {
  const text = symbol ? ts.displayPartsToString(symbol.getDocumentationComment(checker)) : '';
  return (text || fallback || 'Typed calendar option.')
    .replace(/full[\s-]*calend[ae]r\s+v7-compatible/gi, 'v7-compatible')
    .replace(/full[\s-]*calend[ae]r-compatible/gi, 'compatibility')
    .replace(/full[\s-]*calend[ae]r/gi, 'legacy calendar')
    .replace(/\s+/g, ' ')
    .trim();
}

function tagsOf(symbol) {
  return (
    symbol?.getJsDocTags(checker).map((tag) => ({
      name: tag.name,
      text:
        tag.text
          ?.map((part) => part.text)
          .join('')
          .replace(/\s+/g, ' ')
          .trim() || '',
    })) ?? []
  );
}

function categoryOf(name) {
  if (/^(resource|task|repeatedTask)/i.test(name)) return 'Resources & tasks';
  if (
    /^(event|events|displayEvent|editable|droppable|drop|select|unselect|drag|resize)/i.test(name)
  )
    return 'Events & interaction';
  if (
    /^(date|day|week|month|multiMonth|year|list|timeGrid|slot|scroll|now|business|view|visible|initialView)/i.test(
      name,
    )
  )
    return 'Views & time';
  if (
    /^(locale|direction|timeZone|calendarSystem|numberingSystem|firstDay|startOfWeek)/i.test(name)
  )
    return 'Localization';
  if (/^(header|footer|toolbar|button|title|heading|customButton|hideHeader)/i.test(name))
    return 'Toolbar';
  if (
    /^(theme|color|style|class|extraClass|customHTML|height|contentHeight|aspect|expand|sticky|table|border)/i.test(
      name,
    )
  )
    return 'Appearance & layout';
  if (/^(plugin|license|apikey|google|source|eventSource|resourceSource|taskSource)/i.test(name))
    return 'Data & integrations';
  if (callbacks.test(name)) return 'Callbacks & hooks';
  return 'Core configuration';
}

function optionEntries(interfaceName, inherited = new Set()) {
  const declaration = typesSource.statements.find(
    (node) => ts.isInterfaceDeclaration(node) && node.name.text === interfaceName,
  );
  assert.ok(declaration, `Missing ${interfaceName} declaration`);
  return declaration.members.flatMap((member) => {
    if (!ts.isPropertySignature(member) || !member.name) return [];
    const name = member.name.getText(typesSource).replace(/^['"]|['"]$/g, '');
    if (inherited.has(name)) return [];
    const symbol = checker.getSymbolAtLocation(member.name);
    const tags = tagsOf(symbol);
    const deprecated = tags.find((tag) => tag.name === 'deprecated')?.text || '';
    const description = textOf(symbol);
    const defaultMatch = description.match(/(?:Defaults? to|Default(?:s)?(?: is|:))\s+([^.;]+)/i);
    return [
      {
        name,
        type: member.type?.getText(typesSource).replace(/\s+/g, ' ').trim() || 'unknown',
        required: !member.questionToken,
        runtime:
          interfaceName === 'CalendarOptions' &&
          !immutableOptions.has(name) &&
          name !== 'pluginOptions',
        access: premiumOption.test(name) ? 'Premium' : 'Standard',
        category: categoryOf(name),
        description,
        defaultValue: defaultMatch?.[1]?.trim() || '',
        deprecated,
        source: interfaceName,
      },
    ];
  });
}

const baseOptions = optionEntries('CalendarOptions');
const options = [
  ...baseOptions,
  ...optionEntries('CalendarRepeatedTaskOptions', new Set(baseOptions.map(({ name }) => name))),
].sort((a, b) => a.name.localeCompare(b.name));

const calendarClass = coreSource.statements.find(
  (node) => ts.isClassDeclaration(node) && node.name?.text === 'WtsCalendar',
);
assert.ok(calendarClass, 'Missing WtsCalendar declaration');
const methods = calendarClass.members.flatMap((member) => {
  if (member.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.PrivateKeyword))
    return [];
  if (!member.name || ts.isConstructorDeclaration(member)) return [];
  const name = member.name.getText(coreSource).replace(/^['"]|['"]$/g, '');
  const symbol = checker.getSymbolAtLocation(member.name);
  const description = textOf(
    symbol,
    `Public WtsCalendar ${ts.isGetAccessorDeclaration(member) ? 'property' : 'API method'}.`,
  );
  const deprecated = tagsOf(symbol).find((tag) => tag.name === 'deprecated')?.text || '';
  if (ts.isPropertyDeclaration(member)) {
    return [
      {
        name,
        signature: `${name}: ${member.type?.getText(coreSource) || 'unknown'}`,
        kind: 'Method',
        description,
        deprecated,
      },
    ];
  }
  if (ts.isMethodDeclaration(member)) {
    return [
      {
        name,
        signature: member.getText(coreSource).replace(/\s+/g, ' ').trim(),
        kind: 'Method',
        description,
        deprecated,
      },
    ];
  }
  if (ts.isGetAccessorDeclaration(member)) {
    return [
      {
        name,
        signature: `readonly ${name}: ${member.type?.getText(coreSource) || 'unknown'}`,
        kind: 'Property',
        description,
        deprecated,
      },
    ];
  }
  return [];
});

const eventAlias = typesSource.statements.find(
  (node) => ts.isTypeAliasDeclaration(node) && node.name.text === 'iMethods',
);
assert.ok(eventAlias && ts.isUnionTypeNode(eventAlias.type), 'Missing iMethods event union');
const events = eventAlias.type.types
  .filter((node) => ts.isLiteralTypeNode(node) && ts.isStringLiteral(node.literal))
  .map((node) => node.literal.text);
function symbolKind(symbol) {
  if (symbol.flags & ts.SymbolFlags.Class) return 'Class';
  if (symbol.flags & ts.SymbolFlags.Interface) return 'Interface';
  if (symbol.flags & ts.SymbolFlags.TypeAlias) return 'Type';
  if (symbol.flags & ts.SymbolFlags.Function) return 'Function';
  if (symbol.flags & ts.SymbolFlags.Enum) return 'Enum';
  if (symbol.flags & ts.SymbolFlags.ValueModule) return 'Module';
  if (symbol.flags & ts.SymbolFlags.Variable) return 'Value';
  return 'Export';
}

function symbolSignature(symbol) {
  const declaration = symbol.declarations?.[0];
  if (!declaration) return symbol.name;
  const source = declaration.getSourceFile();
  if (ts.isTypeAliasDeclaration(declaration))
    return `type ${symbol.name} = ${declaration.type.getText(source).replace(/\s+/g, ' ')}`;
  if (ts.isFunctionDeclaration(declaration) || ts.isVariableDeclaration(declaration)) {
    const type = checker.getTypeOfSymbolAtLocation(symbol, declaration);
    return `${symbol.name}: ${checker.typeToString(type, declaration, ts.TypeFormatFlags.NoTruncation)}`;
  }
  return `${symbolKind(symbol)} ${symbol.name}`;
}

const symbolMap = new Map();
for (const { entrypoint, path } of entrypointExports) {
  const source = program.getSourceFile(path);
  const moduleSymbol = source && checker.getSymbolAtLocation(source);
  assert.ok(source && moduleSymbol, `Missing declarations for ${entrypoint}`);
  for (const exported of checker.getExportsOfModule(moduleSymbol)) {
    const symbol =
      exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
    const name = exported.name;
    const kind = symbolKind(symbol);
    const signature = symbolSignature(symbol);
    const key = `${name}\0${kind}\0${signature}`;
    const existing = symbolMap.get(key);
    if (existing) existing.exportedFrom.push(entrypoint);
    else
      symbolMap.set(key, {
        name,
        kind,
        signature,
        description: textOf(symbol, `Public ${kind.toLocaleLowerCase()} export.`),
        exportedFrom: [entrypoint],
      });
  }
}
const symbols = [...symbolMap.values()].sort(
  (a, b) => a.name.localeCompare(b.name) || a.kind.localeCompare(b.kind),
);

const generated = await format(
  `// Generated by scripts/generate-api-reference.mjs from @wts-calendar/core declarations.\n// Do not edit by hand. Run npm run docs:api:generate after changing the pinned package.\n\nexport const CLIENT_PACKAGE = ${JSON.stringify({ name: packageJson.name, version: packageJson.version, entrypoints }, null, 2)} as const;\n\nexport const CLIENT_OPTIONS = ${JSON.stringify(options, null, 2)} as const;\n\nexport const CLIENT_METHODS = ${JSON.stringify(methods, null, 2)} as const;\n\nexport const CLIENT_EVENTS = ${JSON.stringify(events, null, 2)} as const;\n\nexport const CLIENT_SYMBOLS = ${JSON.stringify(symbols, null, 2)} as const;\n\nexport const CLIENT_API_COUNTS = { options: CLIENT_OPTIONS.length, methods: CLIENT_METHODS.length, events: CLIENT_EVENTS.length, symbols: CLIENT_SYMBOLS.length, entrypoints: CLIENT_PACKAGE.entrypoints.length } as const;\n`,
  { parser: 'typescript', printWidth: 100, singleQuote: true },
);

if (process.argv.includes('--check')) {
  assert.equal(
    readFileSync(outputPath, 'utf8'),
    generated,
    'Generated API reference is stale. Run npm run docs:api:generate.',
  );
  console.log(
    `API reference is current: ${options.length} options, ${methods.length} public APIs, ${events.length} events, and ${symbols.length} exports.`,
  );
} else {
  writeFileSync(outputPath, generated);
  console.log(
    `Generated ${options.length} options, ${methods.length} public APIs, ${events.length} events, and ${symbols.length} exports.`,
  );
}
