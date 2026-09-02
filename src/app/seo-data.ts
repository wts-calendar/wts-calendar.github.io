import { DEMOS, PREMIUM_FEATURES } from './site-data';

export const SITE_ORIGIN = 'https://wts-calendar.github.io';
export const SITE_NAME = 'WTS Calendar';
export const SOCIAL_IMAGE = SITE_ORIGIN + '/social-preview.png';
export const SOCIAL_IMAGE_ALT =
  'WTS Calendar — JavaScript calendars, PHP and ASP.NET Core APIs, framework integrations, and scheduling examples';

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
      'Build interactive calendars with WTS Calendar. Explore Angular, React, Vue, React Native, PHP, Laravel and ASP.NET Core integrations, live examples, and Premium capabilities.',
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
    title: 'Calendar Documentation, PHP & ASP.NET Core APIs | WTS Calendar',
    description:
      'Get started with WTS Calendar in JavaScript, Angular, React, Vue, React Native, PHP, Laravel or ASP.NET Core. Find frontend setup, REST API, ETag, and storage examples.',
  },
  {
    path: '/docs/api/',
    label: 'API reference',
    title: 'Complete Calendar API & Options Reference | WTS Calendar',
    description:
      'Search every WTS Calendar client option and public method plus complete PHP and ASP.NET Core routes, settings, event fields, errors, storage, and production guidance.',
  },
  {
    path: '/docs/api/methods/',
    label: 'Calendar methods',
    title: 'Calendar Methods & Instance API Reference | WTS Calendar',
    description:
      'Search every public WtsCalendar method, property, getter, lifecycle operation, event mutation, resource API, navigation command, formatter, and runtime option method.',
  },
  {
    path: '/docs/api/events/',
    label: 'Events and modules',
    title: 'Calendar Events & Module Entrypoints | WTS Calendar',
    description:
      'Find all typed WTS Calendar event-bus names and every public package entrypoint for views, interaction, recurrence, data adapters, testing, tooling, and Premium modules.',
  },
  {
    path: '/docs/api/exports/',
    label: 'Exported symbols',
    title: 'Complete Exported Symbols Reference | WTS Calendar',
    description:
      'Search every public class, interface, type, function, value, module, and default export across all WTS Calendar package entrypoints, with signatures and import paths.',
  },
  {
    path: '/docs/api/server/',
    label: 'Server APIs',
    title: 'PHP & ASP.NET Core Server API Reference | WTS Calendar',
    description:
      'Review complete WTS Calendar PHP and ASP.NET Core routes, settings, defaults, event fields, storage interfaces, ETags, errors, runtime requirements, and production guidance.',
  },
  ...DEMOS.map((demo) => ({
    path: '/examples/' + demo.id + '/',
    label: demo.title + ' example',
    title: demo.title + ' Calendar Example | WTS Calendar',
    description: demo.description + ' Explore the live WTS Calendar example and its configuration.',
  })),
  ...PREMIUM_FEATURES.map((feature) => ({
    path: '/premium/' + feature.id + '/',
    label: feature.title,
    title: feature.title + ' — Premium Guide | WTS Calendar',
    description:
      feature.description +
      ' View actual WTS Calendar package output, read the Premium guide, and review integration requirements.',
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
              programmingLanguage: ['TypeScript', 'JavaScript', 'PHP', 'C#'],
              runtimePlatform: ['Web browser', 'PHP 8.2+', 'ASP.NET Core on .NET 8 or 10'],
              description:
                'An Angular showcase for WTS Calendar features, frontend integrations, and optional PHP and ASP.NET Core calendar REST APIs.',
              url: SITE_ORIGIN + '/',
            },
          ]
        : [
            {
              '@type': 'BreadcrumbList',
              '@id': url + '#breadcrumb',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_ORIGIN + '/' },
                ...(page.path.startsWith('/premium/')
                  ? [
                      {
                        '@type': 'ListItem',
                        position: 2,
                        name: 'Features',
                        item: SITE_ORIGIN + '/features/',
                      },
                    ]
                  : []),
                {
                  '@type': 'ListItem',
                  position: page.path.startsWith('/premium/') ? 3 : 2,
                  name: page.label,
                  item: url,
                },
              ],
            },
          ]),
    ],
  };
}
