import manifest from './premium-screenshot-manifest.json';

const screenshots = new Map(manifest.captures.map((capture) => [capture.id, capture]));
export function premiumScreenshot(id: string) {
  const screenshot = screenshots.get(id);
  if (!screenshot) throw new Error('Missing actual-package screenshot: ' + id);
  return screenshot;
}
