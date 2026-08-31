import type { CalendarEventInput } from '@wts-calendar/core';
export const DEMO_DATE = '2026-09-07';
export function sampleEvents(): CalendarEventInput[] {
  return [
    {
      id: 'roadmap',
      title: 'Roadmap review',
      start: '2026-09-07T10:00:00Z',
      end: '2026-09-07T11:00:00Z',
      color: '#227568',
    },
    {
      id: 'design',
      title: 'Design workshop',
      start: '2026-09-08T13:00:00Z',
      end: '2026-09-08T14:30:00Z',
      color: '#426da0',
    },
    {
      id: 'research',
      title: 'User research',
      start: '2026-09-09T09:00:00Z',
      end: '2026-09-09T10:30:00Z',
      color: '#996619',
    },
    {
      id: 'planning',
      title: 'Sprint planning',
      start: '2026-09-10T11:00:00Z',
      end: '2026-09-10T12:00:00Z',
      color: '#77639c',
    },
    {
      id: 'retro',
      title: 'Team retrospective',
      start: '2026-09-11T14:00:00Z',
      end: '2026-09-11T15:00:00Z',
      color: '#227568',
    },
    {
      id: 'offsite',
      title: 'Team offsite',
      start: '2026-09-14',
      end: '2026-09-17',
      isAllDay: true,
      color: '#426da0',
    },
    { id: 'launch', title: 'Launch day', start: '2026-09-23', isAllDay: true, color: '#77639c' },
    {
      id: 'customer',
      title: 'Customer catch-up',
      start: '2026-09-08T15:00:00Z',
      end: '2026-09-08T16:00:00Z',
      color: '#b06147',
    },
  ];
}
