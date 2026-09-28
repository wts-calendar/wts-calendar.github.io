import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  ViewEncapsulation,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';

type MountedPremiumDemo = {
  destroy(): void;
};

type PremiumDemoModule = {
  mountPremiumDemo(container: HTMLElement, featureId: string): Promise<MountedPremiumDemo>;
};

@Component({
  selector: 'app-premium-live-demo',
  encapsulation: ViewEncapsulation.None,
  template: `
    <section class="premium-live-demo" [attr.aria-label]="title() + ' demo'">
      <div class="premium-live-demo-stage" [class.demo-ready]="state() === 'ready'">
        @if (state() === 'loading') {
          <div class="premium-demo-loading" role="status">Loading interactive demo…</div>
        } @else if (state() === 'error') {
          <p class="premium-demo-error" role="alert">
            The interactive demo could not start. The integration example is available below.
          </p>
        }
        <div #host class="premium-demo-host"></div>
      </div>
    </section>
  `,
  styles: `
    app-premium-live-demo {
      display: block;
      margin: 28px 0;
    }
    .premium-live-demo,
    .premium-live-demo-stage {
      background: #fff;
    }
    .premium-live-demo-stage {
      position: relative;
    }
    .premium-demo-loading,
    .premium-demo-error {
      margin: 0;
      min-height: 112px;
      display: grid;
      place-items: center;
      color: var(--muted);
      background: var(--paper);
      border-block: 1px solid var(--line);
      text-align: center;
    }
    .premium-demo-host {
      width: 100%;
    }
    .premium-demo-host .calendar {
      width: 100%;
      min-width: 0;
      --month-day-cell-height: 60px;
    }
    .premium-demo-host .calendar.short {
      height: 320px;
      --calendar-height: 320px;
      --calendar-body-height: 250px;
    }
    .premium-demo-host .calendar[style*='height: auto'] {
      height: auto;
      --calendar-height: auto;
      --calendar-body-height: auto;
    }
    .premium-demo-host .calendar[style*='height: auto'] .wts-calender-body {
      min-height: 0;
    }
    .premium-demo-host .resource-day-grid .resource-time-grid-corner {
      overflow: hidden;
      padding: 0;
      border-right: 0;
      color: transparent;
    }
    .premium-demo-host .calendar.calendar-height-constrained
      > .wts-calender-body:has(> .resource-timeline) {
      overflow: hidden;
    }
    .premium-demo-host .calendar.calendar-height-constrained
      > .wts-calender-body
      > .resource-timeline {
      height: 100%;
      min-height: 0;
    }
    .premium-demo-host .calendar.calendar-height-constrained .resource-timeline-scroller {
      box-sizing: border-box;
      height: 100%;
      max-height: 100%;
    }
    .premium-demo-host h2 {
      margin: 24px 0 10px;
      color: var(--ink);
      font-size: 15px;
      line-height: 1.35;
    }
    .premium-demo-host h2:first-child {
      margin-top: 0;
    }
    .premium-demo-host .premium-result-table {
      width: 100%;
      overflow-x: auto;
      border: 1px solid var(--line);
      border-radius: 10px;
      background: #fff;
    }
    .premium-demo-host table {
      width: 100%;
      margin: 0;
      border-collapse: separate;
      border-spacing: 0;
      table-layout: fixed;
      font-size: 13px;
    }
    .premium-demo-host th,
    .premium-demo-host td {
      padding: 10px 12px;
      border: 0;
      border-bottom: 1px solid var(--line);
      border-right: 1px solid var(--line);
      overflow-wrap: anywhere;
      text-align: left;
    }
    .premium-demo-host th:last-child,
    .premium-demo-host td:last-child {
      border-right: 0;
    }
    .premium-demo-host tbody tr:last-child td {
      border-bottom: 0;
    }
    .premium-demo-host th {
      background: var(--wash);
      color: var(--muted);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .premium-demo-host tbody tr:nth-child(even) {
      background: var(--paper);
    }
    .premium-demo-host .result {
      margin: 14px 0;
      padding: 11px 14px;
      border-left: 3px solid var(--green);
      background: #eaf5ef;
    }
    .premium-demo-host .warning {
      border-left-color: #a87721;
      background: #fff7e6;
    }
    @media (max-width: 640px) {
      .premium-demo-host .premium-result-table table {
        min-width: 580px;
      }
      .premium-demo-host th,
      .premium-demo-host td {
        padding: 8px;
      }
    }
  `,
})
export class PremiumLiveDemo implements OnDestroy {
  readonly featureId = input.required<string>();
  readonly title = input.required<string>();

  private readonly platformId = inject(PLATFORM_ID);
  private readonly host = viewChild<ElementRef<HTMLElement>>('host');
  private mounted?: MountedPremiumDemo;
  private renderId = 0;
  readonly state = signal<'loading' | 'ready' | 'error'>('loading');

  private readonly mountEffect = effect((onCleanup) => {
    const host = this.host()?.nativeElement;
    const featureId = this.featureId();
    if (!host || !isPlatformBrowser(this.platformId)) return;

    const renderId = ++this.renderId;
    this.state.set('loading');
    this.mounted?.destroy();
    this.mounted = undefined;
    host.replaceChildren();
    void this.mount(host, featureId, renderId);

    onCleanup(() => {
      if (renderId !== this.renderId) return;
      this.mounted?.destroy();
      this.mounted = undefined;
    });
  });

  private async mount(host: HTMLElement, featureId: string, renderId: number): Promise<void> {
    try {
      const source = new URL('premium-runtime/inline-demo.mjs', document.baseURI).href;
      const runtime = (await import(/* @vite-ignore */ source)) as PremiumDemoModule;
      const mounted = await runtime.mountPremiumDemo(host, featureId);
      if (renderId !== this.renderId) {
        mounted.destroy();
        return;
      }
      this.mounted = mounted;
      this.state.set('ready');
    } catch (error) {
      if (renderId !== this.renderId) return;
      host.replaceChildren();
      this.state.set('error');
      console.error('Premium demo failed to load', error);
    }
  }

  ngOnDestroy(): void {
    this.renderId += 1;
    this.mounted?.destroy();
    this.mounted = undefined;
  }
}
