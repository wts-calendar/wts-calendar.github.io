import {
  cpSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, 'public/premium-runtime');
const core = resolve(root, 'node_modules/@wts-calendar/core');
const packageData = JSON.parse(readFileSync(resolve(core, 'package.json'), 'utf8'));
const catalog = JSON.parse(
  readFileSync(resolve(root, 'src/app/premium-feature-data.json'), 'utf8'),
);

rmSync(output, { recursive: true, force: true });
mkdirSync(resolve(output, 'vendor'), { recursive: true });
cpSync(resolve(core, 'dist'), resolve(output, 'package'), { recursive: true });
cpSync(
  resolve(root, 'node_modules/@js-temporal/polyfill/dist/index.esm.js'),
  resolve(output, 'vendor/temporal.esm.js'),
);
cpSync(resolve(root, 'node_modules/jsbi/dist/jsbi.mjs'), resolve(output, 'vendor/jsbi.mjs'));
cpSync(resolve(root, 'node_modules/moment/dist/moment.js'), resolve(output, 'vendor/moment.js'));
cpSync(
  resolve(root, 'node_modules/luxon/build/es6/luxon.mjs'),
  resolve(output, 'vendor/luxon.mjs'),
);

const browserImports = new Map([
  ['@wts-calendar/core', resolve(output, 'package/index.esm.js')],
  ['@wts-calendar/core/all', resolve(output, 'package/all.esm.js')],
  ['@wts-calendar/core/google-calendar', resolve(output, 'package/google-calendar.esm.js')],
  ['@wts-calendar/core/icalendar', resolve(output, 'package/icalendar.esm.js')],
  ['@wts-calendar/core/interaction', resolve(output, 'package/interaction.esm.js')],
  ['@wts-calendar/core/rrule', resolve(output, 'package/rrule.esm.js')],
  ['@js-temporal/polyfill', resolve(output, 'vendor/temporal.esm.js')],
  ['jsbi', resolve(output, 'vendor/jsbi.mjs')],
  ['moment', resolve(output, 'vendor/moment.js')],
  ['luxon', resolve(output, 'vendor/luxon.mjs')],
]);

function relativeModulePath(sourceFile, targetFile) {
  const path = relative(dirname(sourceFile), targetFile).split(sep).join('/');
  return path.startsWith('.') ? path : `./${path}`;
}

function rewriteBrowserImports(directory) {
  for (const entry of readdirSync(directory)) {
    const file = resolve(directory, entry);
    if (statSync(file).isDirectory()) {
      rewriteBrowserImports(file);
      continue;
    }
    if (!/\.(?:m?js)$/.test(entry)) continue;

    let source = readFileSync(file, 'utf8');
    for (const [specifier, target] of browserImports) {
      const replacement = relativeModulePath(file, target);
      source = source
        .replaceAll(`from"${specifier}"`, `from"${replacement}"`)
        .replaceAll(`from'${specifier}'`, `from'${replacement}'`)
        .replaceAll(`import"${specifier}"`, `import"${replacement}"`)
        .replaceAll(`import'${specifier}'`, `import'${replacement}'`);
    }
    writeFileSync(file, source);
  }
}

rewriteBrowserImports(resolve(output, 'package'));
rewriteBrowserImports(resolve(output, 'vendor'));

const deploymentKey = (process.env.WTS_CALENDAR_DEMO_LICENSE_KEY ?? '').trim();
writeFileSync(
  resolve(root, 'public/premium-demo-config.json'),
  JSON.stringify({ licenseKey: deploymentKey }) + '\n',
  { mode: 0o600 },
);
writeFileSync(resolve(output, 'catalog.json'), JSON.stringify(catalog));
writeFileSync(
  resolve(output, 'build.json'),
  JSON.stringify({
    package: packageData.name,
    version: packageData.version,
    distSha256: packageData.version,
    build: 'published-package',
  }),
);

let fixture = readFileSync(resolve(root, 'scripts/premium-previews/fixture.mjs'), 'utf8');
fixture = fixture
  .replaceAll('Actual resource API snapshot', 'Resource API snapshot')
  .replaceAll('Actual assignment validation', 'Assignment validation')
  .replaceAll("['Request', 'Package result']", "['Request', 'Result']")
  .replaceAll('createCapacityHeatmap() — actual returned buckets', 'createCapacityHeatmap()')
  .replaceAll('forecastDemand() — actual capacity comparison', 'forecastDemand()')
  .replaceAll('Returned total coverage:', 'Total coverage:')
  .replaceAll(
    'loadDateFormattingCompatibility() — real installed peers',
    'loadDateFormattingCompatibility()',
  )
  .replaceAll(
    "['Plugin', 'Format pattern', 'Returned label']",
    "['Plugin', 'Format pattern', 'Label']",
  )
  .replaceAll('Configuration mapping — actual returned draft', 'Configuration mapping')
  .replaceAll('submit() / approve() — actual mutation snapshots', 'submit() / approve()')
  .replaceAll('permissionDecision() — actual policy decisions', 'permissionDecision()')
  .replace(
    "import { WtsCalendar, verifyCalendarLicense } from '/package/all.esm.js';",
    "import { WtsCalendar, connectCalendarLicense } from './package/all.esm.js';",
  )
  .replaceAll("from '/package/", "from './package/")
  .replace(
    "import token from '/license.mjs';",
    `const runtimeConfig = await fetch('../premium-demo-config.json', { cache: 'no-store' }).then((response) => {
  if (!response.ok) throw new Error('The live Premium demo configuration is unavailable.');
  return response.json();
});
const token = typeof runtimeConfig.licenseKey === 'string' ? runtimeConfig.licenseKey.trim() : '';
if (!token) throw new Error('The live Premium demo key is not configured.');`,
  )
  .replace("fetch('/catalog.json')", "fetch('./catalog.json')")
  .replace("fetch('/build.json')", "fetch('./build.json')")
  .replace(
    'license = await verifyCalendarLicense(token);',
    'license = await connectCalendarLicense({ licenseKey: token, document });',
  )
  .replace("  document.querySelector('#title').textContent = feature.visual.title;\n", '')
  .replace(
    "  document.querySelector('#subtitle').textContent = kind === 'package-ui' ? 'Actual package UI • Sample data • September 2026' : 'Actual package API results • Read-only capture table, not a built-in product screen';\n",
    '',
  )
  .replace(
    "  document.querySelector('#provenance').textContent = build.package + '@' + build.version + ' / ' + feature.module + ' · Local unpublished build';\n",
    '',
  );

const inlineFixture = fixture
  .replace(
    "fetch('../premium-demo-config.json', {",
    "fetch(new URL('../premium-demo-config.json', import.meta.url), {",
  )
  .replace("fetch('./catalog.json')", "fetch(new URL('./catalog.json', import.meta.url))")
  .replace("fetch('./build.json')", "fetch(new URL('./build.json', import.meta.url))")
  .replace(
    "const content = document.querySelector('#content');",
    'export async function mountPremiumDemo(content, id) {',
  )
  .replace(
    "const status = document.querySelector('#capture-status');",
    "const status = { dataset: {}, textContent: '' };",
  )
  .replace("  const id = new URLSearchParams(location.search).get('feature');\n", '')
  .replace("  document.querySelector('#capture').dataset.feature = id;\n", '')
  .replace("  document.querySelector('#capture').dataset.kind = kind;\n", '')
  .replace("  document.querySelector('#capture').dataset.build = build.distSha256;\n", '')
  .replace(
    "status.dataset.status = 'ready'; status.textContent = 'Captured from the package runtime · ' + (kind === 'package-ui' ? 'Native calendar rendering' : 'Application-owned result table');",
    `status.dataset.status = 'ready'; status.textContent = '';
  return {
    destroy() {
      calendars.splice(0).forEach((calendar) => calendar.destroy());
      license?.destroy();
      content.replaceChildren();
      delete content.dataset.demoKind;
    },
  };`,
  )
  .replace(
    "} catch (error) { status.dataset.status = 'error'; status.textContent = error.stack ?? error.message; console.error(error); }",
    `} catch (error) {
  calendars.splice(0).forEach((calendar) => calendar.destroy());
  license?.destroy();
  content.replaceChildren();
  throw error;
}
}`,
  );
writeFileSync(resolve(output, 'inline-demo.mjs'), inlineFixture);

fixture = fixture
  .replace(
    "status.dataset.status = 'ready'; status.textContent = 'Captured from the package runtime · ' + (kind === 'package-ui' ? 'Native calendar rendering' : 'Application-owned result table');",
    `status.dataset.status = 'ready'; status.textContent = '';
  window.parent.postMessage({ type: 'wts-premium-demo', state: 'ready', feature: id, height: document.documentElement.scrollHeight }, location.origin);`,
  )
  .replace(
    "} catch (error) { status.dataset.status = 'error'; status.textContent = error.stack ?? error.message; console.error(error); }",
    `} catch (error) {
  const message = error instanceof Error ? error.message : 'The live Premium demo could not start.';
  status.dataset.status = 'error'; status.textContent = message; console.error(error);
  window.parent.postMessage({ type: 'wts-premium-demo', state: 'error', message }, location.origin);
}

new ResizeObserver(() => {
  window.parent.postMessage({
    type: 'wts-premium-demo',
    state: status.dataset.status === 'ready' ? 'ready' : 'resizing',
    feature: new URLSearchParams(location.search).get('feature'),
    height: document.documentElement.scrollHeight,
  }, location.origin);
}).observe(document.body);
window.addEventListener('pagehide', () => {
  calendars.splice(0).forEach((calendar) => calendar.destroy());
  license?.destroy();
}, { once: true });`,
  );
writeFileSync(resolve(output, 'fixture.mjs'), fixture);

writeFileSync(
  resolve(output, 'demo.html'),
  `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,nofollow">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://package-portal.dedicateddevelopers.us; img-src 'self' data:; object-src 'none'; base-uri 'none'; form-action 'none'">
  <title>WTS Calendar Premium live demo</title>
  <link rel="stylesheet" href="./package/styles/calendar.css">
  <script type="importmap">{"imports":{"@wts-calendar/core":"./package/index.esm.js","@js-temporal/polyfill":"./vendor/temporal.esm.js","jsbi":"./vendor/jsbi.mjs","moment":"./vendor/moment.js","luxon":"./vendor/luxon.mjs"}}</script>
  <style>
    *{box-sizing:border-box}html{background:#fff}body{margin:0;font:14px/1.5 Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#17211e;background:#fff}
    main{width:100%;margin:0;padding:0;background:#fff;display:flow-root}#content{display:flow-root;padding:0}
    #capture-info{display:none}.calendar{height:450px;--calendar-height:450px;--calendar-body-height:370px;--month-day-cell-height:60px}
    .calendar.short{height:320px;--calendar-height:320px;--calendar-body-height:250px}h2{font-size:16px;margin:12px 0}
    table{border-collapse:collapse;width:100%;font-size:13px;margin:10px 0 20px;table-layout:fixed}th,td{text-align:left;padding:10px 12px;border:1px solid #d4ddd8;overflow-wrap:anywhere}
    th{background:#f1f4f2;color:#31463f;font-size:11px}tbody tr:nth-child(even){background:#fbfcfa}.result{background:#eaf5ef;padding:11px 14px;border-left:3px solid #0b6b5f;margin:14px 0}
    .warning{background:#fff7e6;border-left-color:#a87721}@media(max-width:640px){th,td{padding:8px}}
  </style>
</head>
<body>
  <main id="capture" data-presentation="live-demo">
    <aside id="capture-info" hidden><h1 id="title"></h1><p id="subtitle"></p><div id="provenance"></div><div id="capture-status"></div></aside>
    <section id="content"></section>
  </main>
  <script type="module" src="./fixture.mjs"></script>
</body>
</html>\n`,
);

console.log(
  `Prepared ${catalog.length} Premium live demos from ${packageData.name}@${packageData.version}` +
    (deploymentKey ? ' with deployment-key configuration.' : ' with screenshot fallback only.'),
);
