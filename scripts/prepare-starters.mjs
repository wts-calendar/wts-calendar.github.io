import { readFile, writeFile, mkdir, mkdtemp, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import ts from 'typescript';

// Generate downloadable projects from the same files displayed in the docs.
const root = resolve(import.meta.dirname, '..');
const portalPackage = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
const coreVersion = portalPackage.dependencies['@wts-calendar/core'];
const angularVersion = portalPackage.dependencies['@angular/core'];
const source = (await readFile(join(root, 'src/app/quick-starts.ts'), 'utf8')).replace(
  "import { DOCS_BASE, DOCS_ROOT } from './site-data';",
  'const DOCS_BASE = ""; const DOCS_ROOT = "";',
);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const { QUICK_STARTS } = await import(
  'data:text/javascript;base64,' + Buffer.from(outputText).toString('base64')
);
const output = join(root, 'public/starters');
await mkdir(output, { recursive: true });
const temporary = await mkdtemp(join(tmpdir(), 'wts-starters-'));
try {
  for (const starter of QUICK_STARTS.filter((item) => item.name !== 'React Native')) {
    const id = starter.name.toLowerCase().replaceAll(' ', '-');
    const directory = join(temporary, id);
    const write = async (name, content) => {
      const path = join(directory, name);
      await mkdir(resolve(path, '..'), { recursive: true });
      await writeFile(
        path,
        typeof content === 'string' ? content : JSON.stringify(content, null, 2),
      );
    };
    const angular = id === 'angular';
    const dependencies = { '@wts-calendar/core': coreVersion };
    const devDependencies = { typescript: '~6.0.2' };
    if (id === 'react')
      Object.assign(dependencies, {
        '@wts-calendar/react': '1.0.1',
        react: '19.1.1',
        'react-dom': '19.1.1',
      });
    if (id === 'vue') Object.assign(dependencies, { '@wts-calendar/vue': '1.0.1', vue: '3.5.21' });
    if (angular) {
      Object.assign(dependencies, {
        '@wts-calendar/angular': '1.0.1',
        '@angular/core': angularVersion,
        '@angular/common': angularVersion,
        '@angular/compiler': angularVersion,
        '@angular/platform-browser': angularVersion,
        rxjs: '~7.8.0',
        tslib: '^2.3.0',
      });
      Object.assign(devDependencies, {
        '@angular/build': angularVersion,
        '@angular/cli': angularVersion,
        '@angular/compiler-cli': angularVersion,
      });
      await write('angular.json', {
        version: 1,
        projects: {
          starter: {
            projectType: 'application',
            root: '',
            sourceRoot: 'src',
            architect: {
              build: {
                builder: '@angular/build:application',
                options: {
                  browser: 'src/main.ts',
                  index: 'index.html',
                  tsConfig: 'tsconfig.json',
                  styles: ['src/styles.css'],
                },
              },
              serve: {
                builder: '@angular/build:dev-server',
                options: { buildTarget: 'starter:build' },
              },
            },
          },
        },
      });
      await write('tsconfig.json', {
        compilerOptions: {
          target: 'ES2022',
          module: 'preserve',
          moduleResolution: 'bundler',
          experimentalDecorators: true,
          strict: true,
          skipLibCheck: true,
          lib: ['ES2022', 'DOM'],
        },
        angularCompilerOptions: { strictTemplates: true },
        files: ['src/main.ts'],
      });
      await write(
        'src/main.ts',
        "import { provideZonelessChangeDetection } from '@angular/core';\nimport { bootstrapApplication } from '@angular/platform-browser';\nimport { App } from './app/app';\nbootstrapApplication(App, { providers: [provideZonelessChangeDetection()] }).catch(console.error);\n",
      );
    } else {
      devDependencies.vite = '7.3.6';
      if (id === 'vue') {
        devDependencies['@vitejs/plugin-vue'] = '6.0.1';
        await write(
          'vite.config.ts',
          "import { defineConfig } from 'vite';\nimport vue from '@vitejs/plugin-vue';\nexport default defineConfig({ plugins: [vue()] });\n",
        );
      }
      if (id === 'react') {
        await write(
          'vite.config.ts',
          "import { defineConfig } from 'vite';\nexport default defineConfig({ esbuild: { jsx: 'automatic' } });\n",
        );
        await write(
          'src/main.tsx',
          "import { StrictMode } from 'react';\nimport { createRoot } from 'react-dom/client';\nimport App from './App';\nimport './index.css';\ncreateRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);\n",
        );
      }
      if (id === 'vue')
        await write(
          'src/main.ts',
          "import { createApp } from 'vue';\nimport App from './App.vue';\nimport './style.css';\ncreateApp(App).mount('#app');\n",
        );
    }
    await write(
      'index.html',
      '<!doctype html>\n<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><base href="/"><title>WTS Calendar starter</title></head><body>' +
        (angular
          ? '<app-root></app-root>'
          : '<div id="' +
            (id === 'react' ? 'root' : 'app') +
            '"></div><script type="module" src="/src/main.' +
            (id === 'react' ? 'tsx' : 'ts') +
            '"></script>') +
        '</body></html>',
    );
    for (const file of starter.files) await write(file.name, file.code);
    await write('package.json', {
      name: 'wts-calendar-' + id + '-starter',
      private: true,
      version: '1.0.0',
      type: 'module',
      engines: { node: '>=22.22.3 <25' },
      scripts: { dev: angular ? 'ng serve' : 'vite', build: angular ? 'ng build' : 'vite build' },
      dependencies,
      devDependencies,
    });
    await write(
      'README.md',
      '# WTS Calendar ' +
        starter.name +
        ' starter\n\nUse Node.js 22.22.3. In this directory run:\n\n```sh\nnpm install\nnpm run dev\n```\n\nOpen the local address printed in your terminal. Expect September 2026 with Team planning on September 7.\n\nThe standard calendar needs no license key. This project uses published packages.\n\nContinue: https://wts-calendar.github.io/docs/\n',
    );
    const result = spawnSync('tar', ['-czf', join(output, id + '.tar.gz'), '-C', temporary, id], {
      encoding: 'utf8',
    });
    if (result.status !== 0) throw new Error(result.stderr || 'Starter archive failed');
  }
  console.log('Prepared five downloadable web starters from the displayed quickstart files.');
} finally {
  await rm(temporary, { recursive: true, force: true });
}
