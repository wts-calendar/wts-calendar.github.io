// Copies already captured browser JPEGs; never generates or draws substitutes.
import { readFileSync, writeFileSync, copyFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const source = process.argv[2];
const buildHash = process.argv[3];
const version = process.argv[4];
assert.ok(source && version && /^[a-f0-9]{64}$/.test(buildHash), 'Pass screenshot directory, captured dist SHA-256, and package version');
const guides = JSON.parse(readFileSync(resolve(root, 'src/app/premium-feature-data.json'), 'utf8'));
const native = new Set(guides.filter(g => ['resource-scheduling', 'repeated-tasks'].includes(g.module)).map(g => g.id));
const adapters = new Set(['two-way-google-calendar-synchronization', 'microsoft-365-outlook-adapter', 'caldav-adapter']);
const sha = data => createHash('sha256').update(data).digest('hex');
const fixtureSha256 = sha(['fixture.html', 'fixture.mjs'].map(name => readFileSync(resolve(root, 'scripts/premium-previews', name), 'utf8')).join('\n'));
function dimensions(bytes) {
  assert.equal(bytes.readUInt16BE(0), 0xffd8, 'Screenshot must be a JPEG');
  for (let p = 2; p + 9 < bytes.length;) {
    const marker = bytes.readUInt16BE(p);
    if ([0xffc0, 0xffc1, 0xffc2].includes(marker)) return { width: bytes.readUInt16BE(p + 7), height: bytes.readUInt16BE(p + 5) };
    p += 2 + bytes.readUInt16BE(p + 2);
  }
  throw new Error('Missing screenshot dimensions');
}
const target = resolve(root, 'public/previews/premium');
mkdirSync(target, { recursive: true });
const captures = guides.map(guide => {
  const file = guide.id + '.jpg';
  const bytes = readFileSync(resolve(source, file));
  const size = dimensions(bytes);
  assert.ok(size.width >= 1000 && size.height >= 100);
  const kind = native.has(guide.id) ? 'package-ui' : adapters.has(guide.id) ? 'adapter-output' : 'api-output';
  copyFileSync(resolve(source, file), resolve(target, file));
  return { id: guide.id, file, kind, module: guide.module, ...size, sha256: sha(bytes),
    caption: (kind === 'package-ui'
      ? 'Screenshot of the actual WTS Calendar package with sample data. Static image, not a live demo.'
      : kind === 'adapter-output'
        ? 'Screenshot of actual package adapter results using local test responses. The result table is application-owned, not a built-in screen or a live provider connection.'
        : 'Screenshot of actual package API results with sample data. The read-only result table is application-owned; this feature does not provide this screen as built-in UI.')
      + (['resource-crud-sources', 'capacity-skills-roles'].includes(guide.id) ? ' The supplementary API result table is application-owned.' : '')
      + (['optimistic-offline-mutation-queues', 'existing-backend-interfaces'].includes(guide.id) ? ' Uses an in-memory test backend; no external service is connected.' : '')
      + ` Preview build: @wts-calendar/core@${version} (unpublished).` };
});
const manifest = { schema: 1, presentation: 'content-only', package: '@wts-calendar/core', version, build: 'local-unpublished', distSha256: buildHash, fixtureSha256, capturedAt: new Date().toISOString(), captures };
writeFileSync(resolve(root, 'src/app/premium-screenshot-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log('Imported ' + captures.length + ' browser screenshots with file hashes and build provenance.');
