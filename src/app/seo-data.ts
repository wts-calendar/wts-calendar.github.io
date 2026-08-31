import { DEMOS } from './site-data';

export const SITE_ORIGIN = 'https://wts-calendar.github.io';
export const SITE_NAME = 'WTS Calendar';
export const SOCIAL_IMAGE = SITE_ORIGIN + '/social-preview.png';
export const SOCIAL_IMAGE_ALT =
  'WTS Calendar — JavaScript calendars, framework integrations, and scheduling examples';

export interface PageSeo {
  path: string;
  label: string;
  title: string;
  description: string;
  noindex?: boolean;
}

export const SEO_PAGES: readonly PageSeo[] = [
  {
    path: '/',
    label: 'Home',
    title: 'WTS Calendar | JavaScript Calendar & Framework Integrations',
    description:
      'Build interactive calendars with WTS Calendar. Explore JavaScript, Angular, React and Vue integrations, live scheduling examples, and Premium capabilities.',
  },
  {
    path: '/features/',
    label: 'Features',
    title: 'Calendar Features & Scheduling Capabilities | WTS Calendar',
    description:
      'Explore WTS Calendar views, recurring events, editing, time zones and developer tools. Compare Standard capabilities with separately licensed Premium features.',
  },
  {
    path: '/pricing/',
    label: 'Pricing & licensing',
    title: 'Standard & Premium Calendar Licensing | WTS Calendar',
    description:
      'Compare MIT-licensed Standard features and Premium resource planning, interoperability and workflows. Contact WTS Calendar for pricing and a license key.',
  },
  {
    path: '/docs/',
    label: 'Documentation',
    title: 'Calendar Documentation & Framework Setup | WTS Calendar',
    description:
      'Get started with WTS Calendar in JavaScript, Angular, React, Vue, Web Components or React Native. Find setup examples, API references, and integration guides.',
  },
  ...DEMOS.map((demo) => ({
    path: '/examples/' + demo.id + '/',
    label: demo.title + ' example',
    title: demo.title + ' Calendar Example | WTS Calendar',
    description: demo.description + ' Explore the live WTS Calendar example and its configuration.',
  })),
];

export function seoForUrl(url: string): PageSeo {
  const path = (url.split(/[?#]/, 1)[0].replace(/\/+$/, '') || '') + '/';
  return (
    SEO_PAGES.find((page) => page.path === path) ?? {
      path,
      label: 'Page not found',
      title: 'Page Not Found | WTS Calendar',
      description:
        'This page is not available. Explore WTS Calendar documentation, features, and interactive calendar examples.',
      noindex: true,
    }
  );
}

export function structuredData(page: PageSeo): Record<string, unknown> {
  const url = SITE_ORIGIN + page.path;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': SITE_ORIGIN + '/#organization',
        name: SITE_NAME,
        url: SITE_ORIGIN + '/',
        logo: SITE_ORIGIN + '/favicon.svg',
        sameAs: ['https://github.com/wts-calendar', 'https://www.npmjs.com/org/wts-calendar'],
      },
      {
        '@type': 'WebSite',
        '@id': SITE_ORIGIN + '/#website',
        name: SITE_NAME,
        url: SITE_ORIGIN + '/',
        inLanguage: 'en',
        publisher: { '@id': SITE_ORIGIN + '/#organization' },
      },
      {
        '@type': 'WebPage',
        '@id': url + '#webpage',
        url,
        name: page.title,
        description: page.description,
        inLanguage: 'en',
        isPartOf: { '@id': SITE_ORIGIN + '/#website' },
        primaryImageOfPage: { '@type': 'ImageObject', url: SOCIAL_IMAGE, width: 1200, height: 630 },
        ...(page.path !== '/' ? { breadcrumb: { '@id': url + '#breadcrumb' } } : {}),
      },
      ...(page.path === '/'
        ? [
            {
              '@type': 'SoftwareSourceCode',
              '@id': SITE_ORIGIN + '/#showcase',
              name: 'WTS Calendar Angular showcase',
              codeRepository: 'https://github.com/wts-calendar/wts-calendar.github.io',
              programmingLanguage: ['TypeScript', 'JavaScript'],
              runtimePlatform: 'Web browser',
              description:
                'An Angular showcase for WTS Calendar features, examples and framework integrations.',
              url: SITE_ORIGIN + '/',
            },
          ]
        : [
            {
              '@type': 'BreadcrumbList',
              '@id': url + '#breadcrumb',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_ORIGIN + '/' },
                { '@type': 'ListItem', position: 2, name: page.label, item: url },
              ],
            },
          ]),
    ],
  };
}
