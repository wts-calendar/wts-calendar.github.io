// These snippets target the portal's pinned @wts-calendar/core release.
export const APPEARANCE_EXAMPLES = {
  contrast: `import { WtsCalendar } from '@wts-calendar/core';
import '@wts-calendar/core/styles/calendar.css';

// The page contains <div id="calendar"></div>.
const container = document.getElementById('calendar')!;
const calendar = new WtsCalendar({
  container,
  view: 'month',
  viewDate: '2026-09-16',
  eventColor: '#143d59',
  eventContrastColor: 'auto',
  events: [{ title: 'Review', start: '2026-09-16T10:00:00Z' }],
});

calendar.setOption('eventContrastColor', '#ffffff'); // fixed color
calendar.setOption('eventContrastColor', undefined); // restore theme styling`,
  narrow: `import { WtsCalendar } from '@wts-calendar/core';
import '@wts-calendar/core/styles/calendar.css';

const container = document.getElementById('calendar')!;
const calendar = new WtsCalendar({
  container,
  dayNarrowWidth: 100, // default, in CSS pixels
  dayHeaderClassNames: ({ isNarrow }) => isNarrow ? 'compact-heading' : '',
});

calendar.setOption('dayNarrowWidth', 120);
calendar.setOption('dayNarrowWidth', 0); // disable compact labels`,
  mui: `import { useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import { WtsCalendarReact } from '@wts-calendar/react';
import { createMuiCalendarTheme } from '@wts-calendar/core/theme-mui';
import '@wts-calendar/core/styles/calendar.css';

// Render inside your existing MUI ThemeProvider.
export function Calendar() {
  const theme = useTheme();
  const appearance = useMemo(() => createMuiCalendarTheme(theme), [theme]);
  return <WtsCalendarReact
    initialOptions={{ ...appearance, view: 'month' }}
    options={appearance}
    events={[]}
  />;
}`,
  shadcn: `'use client';
import { WtsCalendarReact } from '@wts-calendar/react';
import { createShadcnCalendarTheme } from '@wts-calendar/core/theme-shadcn';
import '@wts-calendar/core/styles/calendar.css';

const appearance = createShadcnCalendarTheme();
// Older themes with bare HSL channels: { colorFormat: 'hsl' }
export function Calendar() {
  return <WtsCalendarReact
    initialOptions={{ ...appearance, view: 'month' }}
    events={[]}
  />;
}`,
  materialStyles: `// Keep calendar.css in the application's global styles list.
@use '@angular/material' as mat;
html {
  color-scheme: light dark;
  @include mat.theme((
    color: mat.$violet-palette,
    typography: Roboto,
    density: 0,
  ));
}
html.light-mode { color-scheme: light; }
html.dark-mode { color-scheme: dark; }`,
  material: `import { Component } from '@angular/core';
import { WtsCalendarAngularComponent } from '@wts-calendar/angular';
import { createAngularMaterialCalendarTheme } from '@wts-calendar/core/theme-angular-material';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [WtsCalendarAngularComponent],
  template: '<wts-calendar-angular [initialOptions]="options" />',
})
export class CalendarComponent {
  readonly options = {
    ...createAngularMaterialCalendarTheme(),
    view: 'month' as const,
  };
}`,
} as const;
