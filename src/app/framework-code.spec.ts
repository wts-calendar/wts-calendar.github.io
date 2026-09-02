import { describe, expect, it } from 'vitest';
import ts from 'typescript';
import { createDemoSetup } from './demo-setup';
import { CODE_FRAMEWORKS, frameworkCode, type CodeContext } from './framework-code';
import { DEMOS } from './site-data';

async function context(id: string): Promise<CodeContext> {
  const demo = DEMOS.find((item) => item.id === id)!;
  return {
    demo,
    setup: await createDemoSetup(id, demo.view, () => {}),
    changes: { theme: 'breezy', colorScheme: 'dark', weekends: false },
    view: demo.view,
    date: '2026-09-21',
  };
}
function syntax(code: string, framework: string): void {
  const source =
    framework === 'vue'
      ? (code.match(/<script setup lang="ts">([\s\S]*?)<\/script>/)?.[1] ?? '')
      : code;
  expect(source).not.toBe('');
  const result = ts.transpileModule(source, {
    fileName: framework === 'angular' ? 'example.ts' : 'example.tsx',
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.Preserve,
      experimentalDecorators: true,
    },
    reportDiagnostics: true,
  });
  expect(
    result.diagnostics?.map((item) => ts.flattenDiagnosticMessageText(item.messageText, '\n')),
  ).toEqual([]);
}

describe('Framework-specific current configuration', () => {
  for (const id of [
    'themes',
    'rrule',
    'locale-rtl',
    'multi-month',
    'event-editor',
    'event-sources',
    'ics',
  ]) {
    it('generates complete web-wrapper setup for ' + id, async () => {
      const input = await context(id);
      for (const framework of ['angular', 'react', 'vue'] as const) {
        const code = frameworkCode(framework, input);
        expect(code.supported).toBe(true);
        expect(code.setup).toContain('@wts-calendar/' + framework);
        expect(code.setup).toContain('"viewDate": "2026-09-21"');
        expect(code.setup).toContain('"colorScheme": "dark"');
        expect(code.setup).toContain('"weekends": false');
        expect(code.setup).toContain(input.setup.events[0].title);
        expect(code.setup).not.toContain('new WtsCalendar(');
        expect(code.setup).not.toContain('document.querySelector');
        for (const plugin of input.setup.pluginNames) expect(code.setup).toContain(plugin);
        expect(code.runtime).toContain('calendar.setOptions(');
        expect(code.install).toContain('@wts-calendar/' + framework);
        if (id === 'event-editor') {
          expect(code.setup).toContain('createCalendarEventEditor');
          expect(code.setup).toContain('options.dateClick');
          expect(code.setup).toContain('options.select');
          expect(code.setup).toContain('options.eventClick');
        }
        if (id === 'event-sources')
          expect(code.setup).toContain('loader: async () => sampleEvents');
        syntax(code.setup, framework);
      }
    });
  }
  it('uses the selected view and preserves nested setup options', async () => {
    const input = await context('multi-month');
    input.changes = { multiMonth: { columns: 2 } };
    const result = frameworkCode('react', input);
    expect(result.setup).toContain('"durationMonths": 3');
    expect(result.setup).toContain('"columns": 2');
    expect(result.runtime).toContain('"columns": 2');
  });
  it('maps native options without emitting unsupported browser APIs or CSS', async () => {
    const input = await context('themes');
    input.changes = { locale: 'bn-BD', startOfWeek: 0, weekends: false, colorScheme: 'dark' };
    const result = frameworkCode('react-native', input);
    expect(result.supported).toBe(true);
    expect(result.setup).toContain('WtsCalendarNative');
    expect(result.setup).toContain('"locale": "bn-BD"');
    expect(result.setup).toContain('"firstDay": 0');
    expect(result.setup).toContain('"hiddenDays": [\n    0,\n    6\n  ]');
    expect(result.setup).not.toContain('styles/calendar.css');
    expect(result.setup).not.toContain('document.');
    expect(result.runtime).toContain('calendar.setView("month")');
    expect(result.runtime).not.toContain('calendar.setOptions(');
    expect(result.notes.join(' ')).toContain('mount-only');
    syntax(result.setup, 'react-native');
  });
  it('aligns native list ranges and never claims unsupported feature parity', async () => {
    const input = await context('list');
    input.view = 'list-month';
    const month = frameworkCode('react-native', input);
    expect(month.setup).toContain('"viewDate": "2026-09-01"');
    expect(month.setup).toContain('"listDayCount": 30');
    input.view = 'list-year';
    input.date = '2028-09-21';
    expect(frameworkCode('react-native', input).setup).toContain('"listDayCount": 366');
    for (const id of [
      'multi-month',
      'year',
      'event-editor',
      'event-sources',
      'interactions',
      'ics',
    ]) {
      const result = frameworkCode('react-native', await context(id));
      expect(result.supported).toBe(false);
      expect(result.setup).toBe('');
      expect(result.notes.length).toBeGreaterThan(0);
    }
  });
  it('offers exactly the five requested targets', () => {
    expect(CODE_FRAMEWORKS.map((item) => item.id)).toEqual([
      'javascript',
      'angular',
      'react',
      'vue',
      'react-native',
    ]);
  });
});
