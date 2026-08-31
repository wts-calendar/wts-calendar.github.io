import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import {
  SITE_NAME,
  SITE_ORIGIN,
  SOCIAL_IMAGE,
  SOCIAL_IMAGE_ALT,
  seoForUrl,
  structuredData,
} from './seo-data';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly document = inject(DOCUMENT);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);

  update(url: string): void {
    const page = seoForUrl(url);
    const canonicalUrl = SITE_ORIGIN + page.path;
    this.title.setTitle(page.title);
    this.meta.updateTag({ name: 'description', content: page.description });
    this.meta.updateTag({
      name: 'robots',
      content: page.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large',
    });
    for (const [property, content] of Object.entries({
      'og:type': 'website',
      'og:site_name': SITE_NAME,
      'og:locale': 'en_US',
      'og:title': page.title,
      'og:description': page.description,
      'og:url': canonicalUrl,
      'og:image': SOCIAL_IMAGE,
      'og:image:secure_url': SOCIAL_IMAGE,
      'og:image:type': 'image/png',
      'og:image:width': '1200',
      'og:image:height': '630',
      'og:image:alt': SOCIAL_IMAGE_ALT,
    }))
      this.meta.updateTag({ property, content });
    for (const [name, content] of Object.entries({
      'twitter:card': 'summary_large_image',
      'twitter:title': page.title,
      'twitter:description': page.description,
      'twitter:image': SOCIAL_IMAGE,
      'twitter:image:alt': SOCIAL_IMAGE_ALT,
    }))
      this.meta.updateTag({ name, content });

    let canonical = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (page.noindex) {
      canonical?.remove();
      this.document.getElementById('portal-structured-data')?.remove();
      return;
    }
    if (!canonical) {
      canonical = this.document.createElement('link');
      canonical.rel = 'canonical';
      this.document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;
    let schema = this.document.getElementById('portal-structured-data');
    if (!schema) {
      schema = this.document.createElement('script');
      schema.id = 'portal-structured-data';
      schema.setAttribute('type', 'application/ld+json');
      this.document.head.appendChild(schema);
    }
    schema.textContent = JSON.stringify(structuredData(page)).replace(/</g, '\\u003c');
  }
}
