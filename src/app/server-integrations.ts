export interface ServerIntegration {
  readonly id: 'php' | 'slim' | 'laravel' | 'aspnetcore';
  readonly name: string;
  readonly installLabel: string;
  readonly install: string;
  readonly codeLabel: string;
  readonly codeKind: string;
  readonly code: string;
  readonly note: string;
  readonly packageLabel: string;
  readonly packageUrl: string;
  readonly exampleLabel: string;
  readonly exampleUrl: string;
}

export const PHP_PACKAGE_URL = 'https://packagist.org/packages/wts-calendar/server-php';
export const PHP_EXAMPLE_URL = 'https://github.com/Suman201/calendar-server-php-example';
export const DOTNET_PACKAGE_URL = 'https://www.nuget.org/packages/Wts.Calendar.AspNetCore/1.0.0';
export const DOTNET_REPOSITORY_URL = 'https://github.com/wts-calendar/server-dotnet';
export const DOTNET_SAMPLE_URL =
  DOTNET_REPOSITORY_URL + '/tree/main/samples/Wts.Calendar.AspNetCore.Example';

export const SERVER_INTEGRATIONS: readonly ServerIntegration[] = [
  {
    id: 'php',
    name: 'PHP / PSR-15',
    installLabel: 'Composer install',
    install: 'composer require wts-calendar/server-php:^1.0 nyholm/psr7',
    codeLabel: 'Framework-neutral PHP handler',
    codeKind: 'php-server-integration',
    note: 'Use any PSR-7 request, PSR-17 factories, and a durable CalendarEventStoreInterface implementation owned by your application.',
    packageLabel: 'Open the Packagist package',
    packageUrl: PHP_PACKAGE_URL,
    exampleLabel: 'Open the runnable PHP example',
    exampleUrl: PHP_EXAMPLE_URL,
    code: `<?php

use Nyholm\\Psr7\\Factory\\Psr17Factory;
use WtsCalendar\\Server\\CalendarApiHandler;
use WtsCalendar\\Server\\CalendarApiOptions;
use WtsCalendar\\Server\\CalendarEventStoreInterface;

$psr17 = new Psr17Factory();
$handler = new CalendarApiHandler(
    $container->get(CalendarEventStoreInterface::class),
    $psr17,
    $psr17,
    new CalendarApiOptions(
        requireIfMatchForUpdate: true,
        requireIfMatchForDelete: true,
    ),
);

// $request is the host application's PSR-7 ServerRequestInterface.
$response = $handler->handle($request);`,
  },
  {
    id: 'slim',
    name: 'Slim 4',
    installLabel: 'Composer install',
    install: 'composer require wts-calendar/server-php:^1.0 slim/slim:^4 slim/psr7',
    codeLabel: 'Slim 4 route',
    codeKind: 'php-server-integration',
    note: 'Slim already uses PSR requests and responses, so the calendar handler can sit behind normal authentication, authorization, CORS, and rate-limit middleware.',
    packageLabel: 'Open the Packagist package',
    packageUrl: PHP_PACKAGE_URL,
    exampleLabel: 'Open the runnable PHP example',
    exampleUrl: PHP_EXAMPLE_URL,
    code: `<?php

use Psr\\Http\\Message\\ResponseInterface;
use Psr\\Http\\Message\\ServerRequestInterface;
use Slim\\Factory\\AppFactory;
use Slim\\Psr7\\Factory\\ResponseFactory;
use Slim\\Psr7\\Factory\\StreamFactory;
use WtsCalendar\\Server\\CalendarApiHandler;
use WtsCalendar\\Server\\CalendarApiOptions;

$app = AppFactory::create();
$handler = new CalendarApiHandler(
    $store,
    new ResponseFactory(),
    new StreamFactory(),
    new CalendarApiOptions(
        requireIfMatchForUpdate: true,
        requireIfMatchForDelete: true,
    ),
);

$app->map(
    ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    '/api/calendar/events[/{id}]',
    fn (ServerRequestInterface $request): ResponseInterface =>
        $handler->handle($request),
);`,
  },
  {
    id: 'laravel',
    name: 'Laravel',
    installLabel: 'Composer install',
    install:
      'composer require wts-calendar/server-php:^1.0 nyholm/psr7 symfony/psr-http-message-bridge',
    codeLabel: 'Laravel controller and API route',
    codeKind: 'php-server-integration',
    note: 'Bind CalendarEventStoreInterface to your Eloquent, PDO, or service-backed store. The bridge preserves the package HTTP contract while Laravel owns authentication and persistence.',
    packageLabel: 'Open the Packagist package',
    packageUrl: PHP_PACKAGE_URL,
    exampleLabel: 'Open the runnable PHP example',
    exampleUrl: PHP_EXAMPLE_URL,
    code: `<?php

// app/Http/Controllers/CalendarController.php
namespace App\\Http\\Controllers;

use Illuminate\\Http\\Request;
use Nyholm\\Psr7\\Factory\\Psr17Factory;
use Symfony\\Bridge\\PsrHttpMessage\\Factory\\HttpFoundationFactory;
use Symfony\\Bridge\\PsrHttpMessage\\Factory\\PsrHttpFactory;
use Symfony\\Component\\HttpFoundation\\Response;
use WtsCalendar\\Server\\CalendarApiHandler;
use WtsCalendar\\Server\\CalendarApiOptions;
use WtsCalendar\\Server\\CalendarEventStoreInterface;

final class CalendarController
{
    public function __invoke(Request $request): Response
    {
        $psr17 = new Psr17Factory();
        $psrRequest = (new PsrHttpFactory(
            $psr17,
            $psr17,
            $psr17,
            $psr17,
        ))->createRequest($request);
        $handler = new CalendarApiHandler(
            app(CalendarEventStoreInterface::class),
            $psr17,
            $psr17,
            new CalendarApiOptions(
                requireIfMatchForUpdate: true,
                requireIfMatchForDelete: true,
            ),
        );

        return (new HttpFoundationFactory())->createResponse(
            $handler->handle($psrRequest),
        );
    }
}

// routes/api.php
use App\\Http\\Controllers\\CalendarController;
use Illuminate\\Support\\Facades\\Route;

Route::match(
    ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    'calendar/events/{id?}',
    CalendarController::class,
)->middleware('auth:sanctum');`,
  },
  {
    id: 'aspnetcore',
    name: 'ASP.NET Core',
    installLabel: '.NET CLI install',
    install: 'dotnet add package Wts.Calendar.AspNetCore --version 1.0.0',
    codeLabel: 'Minimal API and durable store registration',
    codeKind: 'csharp-server-integration',
    note: 'Register an IWtsCalendarEventStore backed by EF Core, Dapper, MongoDB, or your existing service. ASP.NET Core keeps ownership of authentication, authorization, CORS, persistence, and observability.',
    packageLabel: 'Open the NuGet package',
    packageUrl: DOTNET_PACKAGE_URL,
    exampleLabel: 'Open the ASP.NET Core source and sample',
    exampleUrl: DOTNET_SAMPLE_URL,
    code: `using Wts.Calendar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddWtsCalendarAspNetCore(options =>
{
    options.MaxPageSize = 500;
    options.RequireIfMatchForUpdate = true;
    options.RequireIfMatchForDelete = true;
});

builder.Services.AddSingleton<IWtsCalendarEventStore, SqlCalendarEventStore>();

var app = builder.Build();

var calendarApi = app.MapWtsCalendarEvents("/api/calendar/events");
calendarApi.RequireAuthorization("calendar-api");

app.Run();`,
  },
];

export const BROWSER_SERVER_ADAPTER = `import {
  CalendarDataClient,
  createRestCalendarDataAdapter,
} from '@wts-calendar/core/data-adapter-sdk';

const endpoint = 'https://api.example.com/api/calendar/events';

export const calendarEvents = new CalendarDataClient(
  createRestCalendarDataAdapter({
    url: endpoint,
    mutationUrl: ({ type, id }) =>
      type === 'create'
        ? endpoint
        : \`\${endpoint}/\${encodeURIComponent(id ?? '')}\`,
    headers: async () => ({
      authorization: \`Bearer \${await accessToken()}\`,
    }),
  }),
);`;

export const REACT_NATIVE_SERVER_CLIENT = `import { useEffect, useState } from 'react';
import { WtsCalendarNative } from '@wts-calendar/react-native';
import type { NativeCalendarEventInput } from '@wts-calendar/react-native';

const endpoint = 'https://api.example.com/api/calendar/events';

export function Schedule({ accessToken }: { accessToken: string }) {
  const [events, setEvents] = useState<readonly NativeCalendarEventInput[]>([]);

  useEffect(() => {
    const query = new URLSearchParams({
      start: '2026-09-01T00:00:00Z',
      end: '2026-10-01T00:00:00Z',
      timeZone: 'UTC',
    });
    fetch(\`\${endpoint}?\${query}\`, {
      headers: { authorization: \`Bearer \${accessToken}\` },
    })
      .then((response) => {
        if (!response.ok) throw new Error('Calendar request failed');
        return response.json();
      })
      .then((page) => setEvents(page.records));
  }, [accessToken]);

  return <WtsCalendarNative events={events} />;
}`;
