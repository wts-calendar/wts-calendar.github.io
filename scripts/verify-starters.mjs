import { mkdtemp, rm } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const root = resolve(import.meta.dirname, '..');
const temporary = await mkdtemp(join(tmpdir(), 'wts-starter-validation-'));
function run(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, env: { ...process.env, NG_BUILD_MAX_WORKERS: '2' } });
    let log = '';
    child.stdout.on('data', (chunk) => {
      log += chunk;
    });
    child.stderr.on('data', (chunk) => {
      log += chunk;
    });
    child.on('error', reject);
    child.on('close', (code) => (code === 0 ? resolve(log) : reject(new Error(log))));
  });
}
try {
  for (const id of ['javascript', 'react', 'vue', 'web-component', 'angular']) {
    await run(
      'tar',
      ['-xzf', join(root, 'public/starters', id + '.tar.gz'), '-C', temporary],
      root,
    );
    const directory = join(temporary, id);
    await run('npm', ['install', '--no-audit', '--no-fund'], directory);
    await run('npm', ['run', 'build'], directory);
    console.log(id + ': fresh published dependencies and production build passed');
  }
} finally {
  await rm(temporary, { recursive: true, force: true });
}
