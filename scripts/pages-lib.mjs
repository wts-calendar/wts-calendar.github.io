import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { JSDOM } from 'jsdom';
import assert from 'node:assert/strict';

export const siteOrigin = 'https://wts-calendar.github.io';
export const buildRoot = resolve(import.meta.dirname, '../dist/wts-calendar-angular-example');
export const directory = join(buildRoot, 'browser');
export const baseHref = process.argv[2] ?? '/wts-calendar-angular-example/';
assert.ok(
  ['/', '/wts-calendar-angular-example/'].includes(baseHref),
  'Unsupported Pages base path',
);

export function indexFiles(root = directory) {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const path = join(root, entry.name);
    return entry.isDirectory() ? indexFiles(path) : entry.name === 'index.html' ? [path] : [];
  });
}
export const parse = (file) => new JSDOM(readFileSync(file, 'utf8'));
export const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[char],
  );
