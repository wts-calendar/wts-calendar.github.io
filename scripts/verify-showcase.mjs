import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import './verify-premium-integration.mjs';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const files = readdirSync(resolve(root, 'src/app')).filter(
  (file) => /\.(ts|html)$/.test(file) && !file.endsWith('.spec.ts'),
);
const premiumContent = read('src/app/premium-feature-data.json');
const source = files.map((file) => read('src/app/' + file)).join('\n') + premiumContent;
assert.ok(
  !/full[\s-]*calend[ae]r/i.test(source + read('src/index.html') + read('README.md')),
  'Keep competitor branding out of public showcase copy',
);
const docs = [
  ...new Set(
    [...source.matchAll(/(?:docs\/[A-Z][A-Z0-9-]+\.md|README\.md)/g)].map((match) => match[0]),
  ),
];
for (const path of docs)
  assert.ok(existsSync(resolve(root, 'package-docs/core', path)), 'Missing guide: ' + path);
assert.ok(existsSync(resolve(root, 'package-docs/angular/README.md')));
assert.ok(
  !/from\s+['"]@wts-calendar\/core\/(?:all|resource-scheduling|repeated-tasks|advanced-resource-planning|premium-interoperability|enterprise-workflow)['"]/.test(
    source,
  ),
  'Premium static import in showcase',
);
assert.ok(
  !/import\(['"]@wts-calendar\/core\/(?:all|resource-scheduling|repeated-tasks|advanced-resource-planning|premium-interoperability|enterprise-workflow)['"]\)/.test(
    source,
  ),
  'Premium dynamic import in showcase',
);
assert.ok(
  !/issues\/new/.test(
    read('src/app/site-data.ts') +
      read('src/app/pricing-page.ts') +
      read('src/app/premium-feature-page.ts'),
  ),
  'Public license issue link is forbidden',
);
function previewFiles(directory) {
  return readdirSync(resolve(root, directory), { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? previewFiles(directory + '/' + entry.name)
      : [directory + '/' + entry.name],
  );
}
const previews = previewFiles('public/previews');
for (const file of previews) {
  assert.ok(file.endsWith('.jpg'), 'Unexpected preview type: ' + file);
  assert.equal(
    readFileSync(resolve(root, file)).readUInt16BE(0),
    0xffd8,
    'Invalid screenshot: ' + file,
  );
}
const premium = JSON.parse(premiumContent);
assert.equal(new Set(premium.map((feature) => feature.id)).size, premium.length);
for (const feature of premium) {
  assert.ok(existsSync(resolve(root, 'public/previews/premium', feature.id + '.jpg')));
  assert.ok(feature.configuration.length >= 3 && feature.steps.length >= 3);
  assert.ok(feature.behavior.length >= 2 && feature.limits.length >= 2);
  assert.ok(existsSync(resolve(root, 'package-docs/core', feature.guide)));
}
if (process.argv.includes('--require-contact')) {
  const contact = read('src/app/site-data.ts').match(
    /PREMIUM_CONTACT_EMAIL(?::\s*string)?\s*=\s*['"]([^'"]*)['"]/,
  )?.[1];
  assert.match(
    contact ?? '',
    /^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/,
    'Set the owner-confirmed premium contact email before publishing.',
  );
}
console.log(
  'Showcase checks passed: ' +
    docs.length +
    ' local guide targets, ' +
    premium.length +
    ' Premium guides, safe static previews, standard-only runtime modules, email-only license contact.',
);
