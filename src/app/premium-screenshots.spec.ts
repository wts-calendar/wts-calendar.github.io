import { describe, expect, it } from 'vitest';
import manifest from './premium-screenshot-manifest.json';
import guides from './premium-feature-data.json';
import { premiumScreenshot } from './premium-screenshots';

describe('Actual-package screenshot provenance', () => {
  it('covers every Premium guide with a unique capture and real image dimensions', () => {
    expect(manifest.package).toBe('@wts-calendar/core');
    expect(manifest.distSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(new Set(manifest.captures.map(c => c.id))).toEqual(new Set(guides.map(g => g.id)));
    expect(new Set(manifest.captures.map(c => c.sha256)).size).toBe(guides.length);
    for (const guide of guides) {
      const image = premiumScreenshot(guide.id);
      expect(image.file).toBe(guide.id + '.jpg');
      expect(image.width).toBeGreaterThanOrEqual(1000);
      expect(image.height).toBeGreaterThanOrEqual(100);
      expect(manifest.presentation).toBe('content-only');
      expect(image.caption).toContain(`@wts-calendar/core@${manifest.version} (unpublished)`);
    }
  });
  it('distinguishes native UI, application-owned API tables, and local provider fixtures', () => {
    expect(manifest.captures.filter(c => c.kind === 'package-ui')).toHaveLength(13);
    expect(manifest.captures.filter(c => c.kind === 'adapter-output')).toHaveLength(3);
    for (const image of manifest.captures) {
      if (image.kind !== 'package-ui') expect(image.caption).toContain('application-owned');
      if (image.kind === 'adapter-output') expect(image.caption).toContain('local test responses');
    }
  });
  it('does not silently substitute an illustration for an absent capture', () => {
    expect(() => premiumScreenshot('missing-feature')).toThrow('Missing actual-package screenshot');
  });
});
