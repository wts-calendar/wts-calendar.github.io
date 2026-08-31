// Development-only capture server. Never copied into the public Angular build.
import { createServer } from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import { resolve, dirname, extname, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';

const here = dirname(fileURLToPath(import.meta.url));
const portal = resolve(here, '../..');
if (!process.argv[2]) throw new Error('Usage: npm run preview:premium -- /path/to/libraries/projects/calendar');
const core = resolve(process.argv[2]);
const pkg = JSON.parse(await readFile(resolve(core, 'package.json'), 'utf8'));
if (pkg.name !== '@wts-calendar/core') throw new Error('Pass the built @wts-calendar/core directory');
const token = process.env.WTS_CALENDAR_PREVIEW_LICENSE ??
  (await import(pathToFileURL(resolve(core, 'test/fixtures/premium-license-token.mjs')).href)).PREMIUM_LICENSE_TOKEN;
const features = JSON.parse(await readFile(resolve(portal, 'src/app/premium-feature-data.json'), 'utf8'));
const digest = createHash('sha256');
async function hashTree(directory, prefix = '') {
  for (const entry of (await readdir(directory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
    const name = prefix + entry.name;
    if (entry.isDirectory()) await hashTree(resolve(directory, entry.name), name + '/');
    else { digest.update(name); digest.update(await readFile(resolve(directory, entry.name))); }
  }
}
await hashTree(resolve(core, 'dist'));
const build = { package: pkg.name, version: pkg.version, distSha256: digest.digest('hex'), build: 'local-unpublished' };
const mime = { '.html': 'text/html', '.mjs': 'text/javascript', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://127.0.0.1:4181');
    if (!['127.0.0.1:4181', 'localhost:4181'].includes(req.headers.host)) throw new Error('Invalid host');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'none'");
    if (url.pathname === '/catalog.json') {
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(features));
    }
    if (url.pathname === '/build.json') {
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(build));
    }
    if (url.pathname === '/license.mjs') {
      res.setHeader('Content-Type', 'text/javascript');
      return res.end('export default ' + JSON.stringify(token));
    }
    let root = here, relative = url.pathname === '/' ? 'fixture.html' : url.pathname.slice(1);
    if (url.pathname.startsWith('/package/')) { root = resolve(core, 'dist'); relative = url.pathname.slice(9); }
    if (url.pathname.startsWith('/vendor/')) { root = resolve(core, 'node_modules'); relative = url.pathname.slice(8); }
    const file = resolve(root, decodeURIComponent(relative));
    if (!file.startsWith(root + sep)) throw new Error('Invalid path');
    if (root === here && !['fixture.html', 'fixture.mjs'].includes(relative)) throw new Error('Not public');
    res.setHeader('Content-Type', mime[extname(file)] ?? 'application/octet-stream');
    res.end(await readFile(file));
  } catch (error) { res.writeHead(404).end('Capture resource unavailable'); }
});
server.listen(4181, '127.0.0.1', () => console.log('Local package capture: http://127.0.0.1:4181 — ' + pkg.version));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
