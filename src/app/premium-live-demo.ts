import { isPlatformBrowser } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import {
  Component,
  ElementRef,
  HostListener,
  PLATFORM_ID,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';

type DemoMessage = {
  type?: unknown;
  state?: unknown;
  feature?: unknown;
  height?: unknown;
};

@Component({
  selector: 'app-premium-live-demo',
  template: `
    <section class="premium-live-demo" [attr.aria-label]="title() + ' demo'">
      <div class="premium-live-demo-stage" [class.demo-ready]="state() === 'ready'">
        <figure class="premium-feature-figure premium-demo-fallback">
          <img
            [src]="'previews/premium/' + screenshotFile()"
            [alt]="title() + ' preview'"
            [width]="screenshotWidth()"
            [height]="screenshotHeight()"
            fetchpriority="high"
          />
        </figure>

        @if (browser) {
          <iframe
            #frame
            class="premium-demo-frame"
            [src]="source()"
            [title]="title() + ' interactive Premium demo'"
            [style.height.px]="frameHeight()"
            loading="lazy"
            sandbox="allow-scripts allow-same-origin"
          ></iframe>
        }
      </div>
    </section>
  `,
  styles: `
    :host {
      display: block;
      margin: 28px 0;
    }
    .premium-live-demo {
      overflow: hidden;
      border: 1px solid var(--line);
      border-radius: 10px;
      background: #fff;
      box-shadow: 0 14px 34px rgb(23 33 30 / 8%);
    }
    .premium-live-demo-stage {
      position: relative;
      min-height: 360px;
      background: #fff;
    }
    .premium-feature-figure {
      margin: 0;
      padding: 16px;
    }
    .premium-feature-figure img {
      display: block;
      width: 100%;
      height: auto;
      border-radius: 6px;
    }
    .premium-feature-figure figcaption {
      margin-top: 9px;
      color: var(--muted);
      font-size: 12px;
    }
    .premium-demo-frame {
      position: absolute;
      inset: 0;
      width: 100%;
      min-height: 360px;
      border: 0;
      opacity: 0;
      pointer-events: none;
      background: #fff;
    }
    .demo-ready .premium-demo-fallback {
      display: none;
    }
    .demo-ready .premium-demo-frame {
      position: relative;
      opacity: 1;
      pointer-events: auto;
    }
    @media (max-width: 640px) {
      .premium-feature-figure {
        padding: 10px;
      }
    }
  `,
})
export class PremiumLiveDemo {
  readonly featureId = input.required<string>();
  readonly title = input.required<string>();
  readonly screenshotFile = input.required<string>();
  readonly screenshotWidth = input.required<number>();
  readonly screenshotHeight = input.required<number>();

  private readonly platformId = inject(PLATFORM_ID);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly frame = viewChild<ElementRef<HTMLIFrameElement>>('frame');
  readonly browser = isPlatformBrowser(this.platformId);
  readonly state = signal<'loading' | 'ready' | 'error'>('loading');
  readonly frameHeight = signal(560);
  readonly source = computed(() =>
    this.sanitizer.bypassSecurityTrustResourceUrl(
      'premium-runtime/demo.html?feature=' + encodeURIComponent(this.featureId()),
    ),
  );

  @HostListener('window:message', ['$event'])
  onMessage(event: MessageEvent<DemoMessage>): void {
    if (!this.browser || event.origin !== window.location.origin) return;
    if (event.source !== this.frame()?.nativeElement.contentWindow) return;
    const message = event.data;
    if (message?.type !== 'wts-premium-demo') return;
    if (message.feature && message.feature !== this.featureId()) return;
    if (typeof message.height === 'number' && Number.isFinite(message.height)) {
      this.frameHeight.set(Math.max(360, Math.min(1400, Math.ceil(message.height))));
    }
    if (message.state === 'ready') this.state.set('ready');
    if (message.state === 'error') this.state.set('error');
  }
}
