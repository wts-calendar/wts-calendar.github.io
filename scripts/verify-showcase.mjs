import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const files = readdirSync(resolve(root, 'src/app')).filter(
  (file) => /\.(ts|html)$/.test(file) && !file.endsWith('.spec.ts'),
);
const source = files.map((file) => read('src/app/' + file)).join('\n');
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
  !/issues\/new/.test(read('src/app/site-data.ts') + read('src/app/pricing-page.ts')),
  'Public license issue link is forbidden',
);
for (const file of readdirSync(resolve(root, 'public/previews'))) {
  const svg = read('public/previews/' + file);
  assert.ok(!/full[\s-]*calend[ae]r/i.test(svg), 'Competitor branding in preview: ' + file);
  assert.ok(
    !/<script|<foreignObject|\bon\w+=|https?:\/\//i.test(
      svg.replace('http://www.w3.org/2000/svg', ''),
    ),
    'Unsafe preview: ' + file,
  );
  assert.ok(svg.includes('Static illustration'), 'Preview must not pretend to be a screenshot');
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
    ' local guide targets, static previews, free-only modules, email-only license contact.',
);
