import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
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
  .replace(
    "status.dataset.status = 'ready'; status.textContent = 'Captured from the package runtime · ' + (kind === 'package-ui' ? 'Native calendar rendering' : 'Application-owned result table');",
    `status.dataset.status = 'ready'; status.textContent = 'Running from @wts-calendar/core@' + build.version + ' · ' + (kind === 'package-ui' ? 'Interactive calendar UI' : 'Actual package API results');
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
    main{width:100%;margin:0;padding:16px;background:#fff;display:flow-root}#content{display:flow-root;padding:0}
    #capture-info{display:flex;align-items:center;justify-content:space-between;gap:16px;margin:0 0 14px;padding:0 0 12px;border-bottom:1px solid #d4ddd8}
    #capture-info h1{font-size:16px;margin:0}#subtitle,#provenance{display:none}#capture-status{font-size:12px;color:#5d6a65;text-align:right}
    #capture-status[data-status="error"]{color:#9b2c2c}.calendar{height:450px;--calendar-height:450px;--calendar-body-height:370px;--month-day-cell-height:60px}
    .calendar.short{height:320px;--calendar-height:320px;--calendar-body-height:250px}h2{font-size:16px;margin:12px 0}
    table{border-collapse:collapse;width:100%;font-size:13px;margin:10px 0 20px;table-layout:fixed}th,td{text-align:left;padding:10px 12px;border:1px solid #d4ddd8;overflow-wrap:anywhere}
    th{background:#f1f4f2;color:#31463f;font-size:11px}tbody tr:nth-child(even){background:#fbfcfa}.result{background:#eaf5ef;padding:11px 14px;border-left:3px solid #0b6b5f;margin:14px 0}
    .warning{background:#fff7e6;border-left-color:#a87721}@media(max-width:640px){main{padding:10px}#capture-info{align-items:flex-start;flex-direction:column}#capture-status{text-align:left}th,td{padding:8px}.calendar{height:420px;--calendar-height:420px;--calendar-body-height:340px}}
  </style>
</head>
<body>
  <main id="capture" data-presentation="live-demo">
    <aside id="capture-info" aria-label="Live demo status"><h1 id="title">Loading Premium demo</h1><p id="subtitle"></p><div id="provenance"></div><div id="capture-status" role="status">Verifying demo access…</div></aside>
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
