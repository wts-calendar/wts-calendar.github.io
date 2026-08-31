import { WtsCalendar, verifyCalendarLicense } from '/package/all.esm.js';
import { AdvancedResourcePlanner } from '/package/advanced-resource-planning.esm.js';
import { PremiumCalendarInteroperability } from '/package/premium-interoperability.esm.js';
import { EnterpriseCalendarWorkflow } from '/package/enterprise-workflow.esm.js';
import { serializeICalendar } from '/package/icalendar.esm.js';
import token from '/license.mjs';

const content = document.querySelector('#content');
const status = document.querySelector('#capture-status');
const calendars = [];
const evidence = [];
const D = '2026-09-07';
const time = (hour, date = D) => date + 'T' + hour + ':00Z';
const event = (id, title, resourceId, start = '09:00', end = '10:00') => ({ id, title, resourceId, start: time(start), end: time(end) });
const resources = [
  { id: 'design', title: 'Design studio', capacity: 4, color: '#3477b5', extendedProps: { location: 'London', region: 'East' } },
  { id: 'engineering', title: 'Engineering', capacity: 8, color: '#188878', extendedProps: { location: 'Remote', region: 'East' } },
  { id: 'operations', title: 'Operations', capacity: 3, color: '#9c6fb6', extendedProps: { location: 'Berlin', region: 'West' } },
];
const events = [event('design-review', 'Design review', 'design', '09:00', '10:30'), event('sprint', 'Sprint planning', 'engineering', '10:00', '12:00'), event('ops', 'Operations review', 'operations', '11:00', '12:00')];
const range = { start: time('08:00'), end: time('14:00') };
let license;
function el(tag, text, parent = content, className) { const node = document.createElement(tag); if (text !== undefined) node.textContent = String(text); if (className) node.className = className; parent.append(node); return node; }
function note(text, warning = false) { el('p', text, content, warning ? 'result warning' : 'result'); }
function table(title, columns, rows) {
  el('h2', title); const t = el('table'); const tr = el('tr', undefined, el('thead', undefined, t));
  columns.forEach(column => el('th', column, tr)); const body = el('tbody', undefined, t);
  rows.forEach(row => { const tr = el('tr', undefined, body); row.forEach(value => el('td', typeof value === 'object' ? JSON.stringify(value) : value ?? '—', tr)); });
  evidence.push({ title, columns, rows });
}
async function calendar(options = {}, short = false) {
  const host = el('div', undefined, content, short ? 'calendar short' : 'calendar');
  const height = short ? 320 : options.view === 'weekly-repeated-task' ? 560 : 450;
  host.style.height = height + 'px'; host.style.setProperty('--calendar-height', height + 'px'); host.style.setProperty('--calendar-body-height', (height - 80) + 'px');
  const c = new WtsCalendar({ container: host, document, license, view: 'resource-timeline', viewDate: D, timeZone: 'UTC', locale: 'en-US', startOfWeek: 1, weekends: false,
    ...(options.view === 'weekly-repeated-task' ? { headerToolbar: { start: 'prev', center: 'title', end: 'next' } } : {}),
    resources, events: !options.view ? events.map((e, i) => ({ ...e, start: '2026-09-0' + (7 + i), end: '2026-09-' + (10 + i), isAllDay: true })) : events, height, slotMinTime: '08:00', slotMaxTime: '14:00', resourceTimeGrid: { columnWidth: 340 },
    dayView: { hourSegment: 60, segmentHeight: 44 }, weekView: { hourSegment: 60, segmentHeight: 44 },
    resourceTimeline: { durationDays: 7, slotWidth: 174, rowMinHeight: 66, resourceAreaWidth: 220 }, ...options });
  calendars.push(c); await c.whenIdle(); evidence.push({ view: c.viewName, events: c.getEvents().length, resources: c.getResources().length }); return c;
}
function planner(overrides = {}) {
  return new AdvancedResourcePlanner({ license, timeZone: 'UTC', resources: resources.map(r => ({ ...r, capacity: r.id === 'engineering' ? 4 : 2 })),
    profiles: resources.map(r => ({ resourceId: r.id, shifts: [{ id: 'morning', startTime: '08:00', endTime: '12:00' }, { id: 'afternoon', startTime: '13:00', endTime: '17:00' }] })),
    events: events.map((e, i) => ({ ...e, resourceUnits: i === 1 ? 3 : 1 })), ...overrides });
}
function workflow(overrides = {}) {
  let sequence = 0, tick = 0;
  return new EnterpriseCalendarWorkflow({ license, actor: { id: 'editor-1', roles: ['editor'] }, online: false, autoFlush: false,
    events: [event('release', 'Release window', 'design')], defaultPermission: 'allow',
    idGenerator: () => 'capture-' + ++sequence, now: () => new Date(Date.UTC(2026, 8, 7, 8, 0, tick++)),
    stateMachines: [{ id: 'release', initialState: 'draft', states: ['draft', 'review', 'approved'], transitions: [{ name: 'submit', from: 'draft', to: 'review' }, { name: 'approve', from: 'review', to: 'approved' }] }],
    defaultStateMachineId: 'release', ...overrides });
}
const interop = () => new PremiumCalendarInteroperability({ license });
const nativeIds = new Set(['resource-grid', 'resource-daygrid', 'resource-timegrid', 'resource-non-resource-timeline', 'dates-above-resources', 'resource-crud-sources', 'resource-hierarchy', 'resource-grouping-ordering-filtering', 'resource-columns-render-hooks', 'resource-availability-assignment', 'capacity-skills-roles', 'resource-virtualization-print', 'repeated-task-views']);
const providerIds = new Set(['two-way-google-calendar-synchronization', 'microsoft-365-outlook-adapter', 'caldav-adapter']);

async function render(id) {
  if (id === 'resource-grid') return calendar({ view: 'resource', events: events.map((e, i) => ({ ...e, start: '2026-09-0' + (7 + i), end: '2026-09-' + (10 + i), isAllDay: true })) });
  if (id === 'resource-daygrid') return calendar({ view: 'resource-day-grid-day', events });
  if (id === 'resource-timegrid') return calendar({ view: 'resource-time-grid-day' });
  if (id === 'resource-non-resource-timeline') return calendar({ events: events.map((e, i) => ({ ...e, start: '2026-09-0' + (7 + i), end: '2026-09-' + (10 + i), isAllDay: true })) });
  if (id === 'dates-above-resources') {
    const options = { view: 'resource-time-grid-week', hiddenDays: [0, 3, 4, 5, 6], resources: resources.slice(0, 2).map((r, i) => ({ ...r, title: 'Room ' + (i ? 'B' : 'A') })), events: events.slice(0, 2), resourceTimeGrid: { columnWidth: 250 }, slotMinTime: '09:00', slotMaxTime: '11:00' };
    el('h2', 'Date-first headings'); await calendar({ ...options, datesAboveResources: true }, true);
    el('h2', 'Resource-first headings'); return calendar({ ...options, datesAboveResources: false }, true);
  }
  if (id === 'resource-crud-sources') {
    const c = await calendar({ resources: [], events: [], resourceSources: [{ id: 'local-directory', loader: async () => resources }] });
    c.addResource({ id: 'support', title: 'Support desk', capacity: 2 });
    c.updateResource('support', { title: 'Support — updated through API' });
    c.addEvent(event('support-shift', 'Support shift', 'support'));
    table('Actual resource API snapshot', ['ID', 'Title', 'Capacity'], c.getResources().map(r => [r.id, r.title, r.capacity])); return;
  }
  if (id === 'resource-hierarchy') return calendar({ resources: [{ id: 'delivery', title: 'Product delivery' }, ...resources.map(r => ({ ...r, parentId: 'delivery' })), { id: 'support', title: 'Customer support' }] });
  if (id === 'resource-grouping-ordering-filtering') return calendar({ resourceGroupFields: [{ field: 'region', label: 'Region' }], resourceOrder: '-capacity,title', resources: [...resources, { id: 'archived', title: 'Archived team', extendedProps: { archived: true } }], resourceFilter: ({ resource }) => !resource.extendedProps?.archived });
  if (id === 'resource-columns-render-hooks') return calendar({ resourceTimeline: { durationDays: 4, slotWidth: 120, rowMinHeight: 74, resourceAreaColumns: [{ field: 'title', header: 'Team', width: 210 }, { field: 'capacity', header: 'Capacity', width: 90 }, { field: 'location', header: 'Location', width: 110 }] }, resourceLabelContent: ({ resource }) => resource.title + ' · team' });
  if (id === 'resource-availability-assignment') return calendar({ view: 'resource-time-grid-day', resources: resources.map(r => ({ ...r, availability: { workingHours: { daysOfWeek: [1, 2, 3, 4, 5], startTime: '09:00', endTime: '14:00' }, unavailable: [{ start: time('12:00'), end: time('13:00'), reason: 'Lunch / unavailable' }] } })) });
  if (id === 'capacity-skills-roles') {
    const c = await calendar({ view: 'resource-time-grid-day', resources: resources.map(r => ({ ...r, assignmentPolicy: { skills: ['research'], roles: ['reviewer'] } })), events: [] });
    const rows = [];
    for (const [title, requirements] of [['Research reviewer', { skills: ['research'], roles: ['reviewer'] }], ['Missing skill', { skills: ['welding'] }], ['Missing role', { roles: ['supervisor'] }]]) {
      try { c.addEvent({ ...event(title, title, 'design'), resourceRequirements: requirements }); rows.push([title, 'Accepted']); }
      catch (error) { rows.push([title, error.message]); }
    }
    table('Actual assignment validation', ['Request', 'Package result'], rows); return;
  }
  if (id === 'resource-virtualization-print') {
    const c = await calendar({ resources: Array.from({ length: 300 }, (_, i) => ({ id: 'r' + i, title: 'Resource ' + String(i + 1).padStart(3, '0') })), events: Array.from({ length: 8 }, (_, i) => ({ ...event('task' + i, 'Scheduled work ' + (i + 1), 'r' + i), end: '2026-09-09T11:00:00Z' })), resourceTimeline: { durationDays: 30, slotWidth: 100, rowMinHeight: 42, resourceAreaWidth: 200, resourceVirtualizationThreshold: 20, resourceOverscan: 2, slotVirtualizationThreshold: 15, slotOverscan: 2 } });
    return c;
  }
  if (id === 'repeated-task-views') return calendar({ view: 'weekly-repeated-task', resources: [], events: [], task: ['Equipment checks', 'Team reviews', 'Inventory'].map((title, i) => ({ id: 'category' + i, name: 'category' + i, title, enable: true, color: resources[i].color, icon: '', data: Array.from({ length: 4 }, (_, day) => ({ id: 'task' + i + day, start: '2026-09-' + String(7 + day).padStart(2, '0'), end: '2026-09-' + String(7 + day).padStart(2, '0'), reason: ['Safety inspection', 'Review checklist', 'Stock count'][i], status: day < 2 ? 'completed' : 'pending' })) })) });
  if (id === 'utilization-capacity-heatmaps') {
    const heatmap = planner().createCapacityHeatmap({ ...range, bucketMinutes: 60 });
    table('createCapacityHeatmap() — actual returned buckets', ['Resource', 'UTC hour', 'Booked / usable', 'Utilization', 'State'], heatmap.cells.filter(c => c.resourceId === 'design' || c.resourceId === 'engineering').map(c => [c.resourceId, c.start.toISOString().slice(11, 16), c.bookedUnits + ' / ' + c.usableCapacity, (c.utilizationPercent ?? 0) + '%', c.state])); return;
  }
  if (id === 'split-shifts-rotating-schedules') {
    const p = planner({ profiles: [{ resourceId: 'design', shifts: [{ id: 'morning', startTime: '08:00', endTime: '12:00', rotation: { anchor: D, cycleDays: 4, activeDays: [0, 1] } }, { id: 'evening', startTime: '16:00', endTime: '20:00', rotation: { anchor: D, cycleDays: 4, activeDays: [0, 1] } }] }] });
    table('getShiftOccurrences() — two days on / two days off', ['Resource', 'Shift', 'Start (UTC)', 'End (UTC)', 'Rotation day'], p.getShiftOccurrences('design', D, '2026-09-12').map(s => [s.resourceId, s.shiftId, s.start.toISOString().slice(0, 16), s.end.toISOString().slice(0, 16), s.rotationDay])); return;
  }
  if (id === 'resource-dependencies-substitutes') {
    const p = planner({ resources: resources.map(r => ({ ...r, capacity: r.id === 'engineering' ? 4 : 1 })), profiles: [{ resourceId: 'design', dependencies: [{ resourceId: 'operations' }], substituteIds: ['engineering'] }] });
    const request = { resourceId: 'design', start: time('11:00'), end: time('12:00') };
    const decision = p.evaluateBooking(request), alternatives = p.findSubstitutes(request);
    table('evaluateBooking()', ['Resource', 'Allowed', 'Issue'], [[decision.resourceId, decision.allowed, decision.issues.map(i => i.code).join(', ') || 'None']]);
    table('findSubstitutes()', ['Alternative', 'Allowed', 'Projected utilization'], alternatives.map(a => [a.resource.title, a.evaluation.allowed, a.evaluation.projectedUtilizationPercent + '%'])); return;
  }
  if (id === 'overbooking-policies') {
    const rows = ['block', 'warn', 'allow'].map(mode => { const p = planner({ resources: [{ id: 'design', title: 'Design', capacity: 1 }], profiles: [{ resourceId: 'design', overbooking: { mode } }], events: [events[0]] }); const result = p.evaluateBooking({ resourceId: 'design', start: time('09:30'), end: time('10:00'), units: 1 }); return [mode, result.allowed, result.projectedUtilizationPercent + '%', result.issues.map(i => i.severity + ': ' + i.code).join(', ')]; });
    table('evaluateBooking() — identical request under three policies', ['Policy', 'Allowed', 'Projected utilization', 'Returned issues'], rows); return;
  }
  if (id === 'demand-availability-forecasting') {
    const forecast = planner().forecastDemand({ ...range, bucketMinutes: 60, demand: [{ start: time('08:00'), end: time('11:00'), units: 3 }, { start: time('11:00'), end: time('14:00'), units: 10 }] });
    table('forecastDemand() — actual capacity comparison', ['UTC hour', 'Demand', 'Scheduled', 'Available', 'Shortfall', 'State'], forecast.buckets.map(b => [b.start.toISOString().slice(11, 16), b.demandUnits, b.scheduledUnits, b.availableUnits, b.unmetUnits, b.state])); note('Returned total coverage: ' + forecast.coveragePercent.toFixed(1) + '%'); return;
  }
  if (id === 'dependencies-critical-paths') {
    const result = planner().analyzeCriticalPath([{ id: 'design', durationMinutes: 90 }, { id: 'build', durationMinutes: 180, dependencyIds: ['design'] }, { id: 'inspect', durationMinutes: 45, dependencyIds: ['build'] }, { id: 'notes', durationMinutes: 30, dependencyIds: ['design'] }]);
    table('analyzeCriticalPath()', ['Task', 'Duration', 'Earliest start', 'Earliest finish', 'Float', 'Critical'], result.tasks.map(t => [t.id, t.durationMinutes, t.earliestStartMinutes, t.earliestFinishMinutes, t.totalFloatMinutes, t.critical])); note('Project duration: ' + result.projectDurationMinutes + ' minutes. Critical path: ' + result.criticalPathIds.join(' → ')); return;
  }
  if (providerIds.has(id)) return provider(id);
  if (id === 'ics-change-detection-reconciliation') {
    const t = interop(), base = [event('review', 'Original review', undefined)]; const current = [{ ...base[0], title: 'Updated review' }, event('new', 'New workshop', undefined, '12:00', '13:00')];
    const serialize = data => serializeICalendar(data, { timeZone: 'UTC', now: '2026-09-01T00:00:00Z' });
    const diff = t.diffICalendar(serialize(base), serialize(current), 'UTC');
    table('diffICalendar()', ['Change', 'Event IDs'], Object.entries(diff).map(([kind, items]) => [kind, items.map(item => item.id).join(', ') || 'None']));
    const result = t.reconcile(base, [{ ...base[0], title: 'Local edit' }], [{ ...base[0], title: 'Remote edit' }], 'manual');
    table('reconcile() — manual conflict policy', ['ID', 'Resolution', 'Proposed title'], result.conflicts.map(c => [c.id, c.resolution, result.events[0].title])); return;
  }
  if (id === 'moment-luxon-migration-toolkit') {
    const t = interop(), date = new Date(time('09:30')), context = { locale: 'en-US', timeZone: 'UTC' };
    const rows = [];
    for (const [kind, pattern] of [['moment', 'dddd, MMMM D YYYY [at] HH:mm'], ['luxon3', "cccc, LLLL d yyyy 'at' HH:mm"]]) { const plugin = await t.loadDateFormattingCompatibility(kind); rows.push([plugin.name, pattern, plugin.format(date, pattern, context)]); }
    table('loadDateFormattingCompatibility() — real installed peers', ['Plugin', 'Format pattern', 'Returned label'], rows); return;
  }
  if (id === 'configuration-migration-assistant') {
    const result = interop().migrateFullCalendarOptions({ initialView: 'resourceTimelineWeek', initialDate: D, editable: true, firstDay: 1, slotDuration: '00:30:00', customLegacySetting: true });
    table('Configuration mapping — actual returned draft', ['Output field', 'Value'], Object.entries(result.options));
    table('Migration diagnostics', ['Required modules', 'Unmapped options'], [[result.requiredModules.join(', '), result.unmappedOptions.join(', ')]]); return;
  }
  if (id === 'multi-stage-approvals') {
    const w = workflow({ approvalFlows: [{ id: 'review-flow', stages: [{ id: 'manager', approverRoles: ['manager'] }, { id: 'director', approverRoles: ['director'] }] }] });
    let mutation = await w.submit({ type: 'update', eventId: 'release', changes: { title: 'Approved release' }, approvalFlowId: 'review-flow' });
    const rows = [['Submitted', mutation.state, mutation.approvalStageId, mutation.approvals.length]];
    for (const role of ['manager', 'director']) { mutation = await w.approve(mutation.id, { id: role + '-1', roles: [role] }); rows.push([role + ' approved', mutation.state, mutation.approvalStageId ?? 'Complete', mutation.approvals.length]); }
    table('submit() / approve() — actual mutation snapshots', ['Action', 'State', 'Current stage', 'Approvals'], rows); note('All stages approved. Mutation remains queued until delivery.'); return;
  }
  if (id === 'configurable-event-state-machines') {
    const w = workflow({ online: true }), rows = [['Initial', w.getEvent('release').state]];
    for (const transition of ['submit', 'approve']) { await w.submit({ type: 'transition', eventId: 'release', transition }); await w.flush(); rows.push([transition, w.getEvent('release').state]); }
    table('getEvent() — state after each valid transition', ['Transition', 'Returned state'], rows);
    try { await w.submit({ type: 'transition', eventId: 'release', transition: 'submit' }); } catch (error) { note(error.message, true); } return;
  }
  if (id === 'immutable-audit-history') {
    const w = workflow(); await w.submit({ type: 'update', eventId: 'release', changes: { title: 'Reviewed release' } }); w.setOnline(true); await w.flush();
    const history = w.getAuditHistory(); table('getAuditHistory() — abbreviated hashes', ['Sequence', 'Action', 'Actor', 'Previous hash', 'Hash'], history.map(a => [a.sequence, a.action, a.actorId, a.previousHash.slice(0, 14), a.hash.slice(0, 14)]));
    note('verifyAuditHistory(): ' + await w.verifyAuditHistory() + ' · immutable snapshot: ' + Object.isFrozen(history)); return;
  }
  if (id === 'permissions-field-level-policies') {
    const w = workflow({ defaultPermission: 'deny', permissionPolicies: [{ id: 'editor-update', effect: 'allow', actions: ['update'], roles: ['editor'] }, { id: 'protect-resource', effect: 'deny', actions: ['update'], roles: ['editor'], fields: ['resourceId'] }, { id: 'manager-update', effect: 'allow', actions: ['update'], roles: ['manager'] }] });
    const rows = []; for (const role of ['viewer', 'editor', 'manager']) for (const field of ['title', 'resourceId']) { const d = w.permissionDecision('update', w.getEvent('release').event, [field], { id: role, roles: [role] }); rows.push([role, field, d.allowed, d.matchedPolicyIds.join(', ') || 'Default deny']); }
    table('permissionDecision() — actual policy decisions', ['Role', 'Field', 'Allowed', 'Matched policy'], rows); return;
  }
  if (id === 'optimistic-offline-mutation-queues') {
    const w = workflow(), m = await w.submit({ type: 'update', eventId: 'release', changes: { title: 'Optimistic release title' } });
    const rows = [['Offline update', m.state, w.getMutationQueue().length, w.getEvent('release').event.title]]; w.setOnline(true); const [result] = await w.flush();
    rows.push(['Online flush', result.state, w.getMutationQueue().length, w.getEvent('release').event.title]);
    table('submit() / flush() — queue snapshots', ['Stage', 'Mutation state', 'Queue length', 'Visible title'], rows); return;
  }
  if (id === 'existing-backend-interfaces') {
    const requests = []; const w = workflow({ backend: { async sendMutation({ mutation, actor }) { requests.push([mutation.type, mutation.eventId, actor.id, 'committed']); return { status: 'committed' }; } } });
    await w.submit({ type: 'update', eventId: 'release', changes: { title: 'Backend-approved release' } }); w.setOnline(true); const [result] = await w.flush();
    table('sendMutation() — customer-adapter invocation', ['Action', 'Event', 'Actor', 'Adapter response'], requests); table('flush() result', ['Mutation state', 'Queued mutations'], [[result.state, w.getMutationQueue().length]]); return;
  }
  throw new Error('No actual-package capture implemented for ' + id);
}

async function provider(id) {
  const t = interop(), calls = [], json = data => new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
  const localEvent = event('local-review', 'Review from adapter', undefined);
  const fetch = async (url, init = {}) => {
    calls.push([init.method ?? 'GET', new URL(url).pathname, new Headers(init.headers).get('if-match') ?? '—']);
    if (id === 'two-way-google-calendar-synchronization') return init.method === 'GET' ? json({ items: [{ id: 'remote-review', etag: 'v1', summary: localEvent.title, start: { dateTime: localEvent.start }, end: { dateTime: localEvent.end } }], nextSyncToken: 'sample-cursor-2' }) : json({ id: 'remote-review', etag: 'v2' });
    if (id === 'microsoft-365-outlook-adapter') return init.method === 'GET' ? json({ value: [{ id: 'remote-review', '@odata.etag': 'v1', subject: localEvent.title, start: { dateTime: localEvent.start.slice(0, -1), timeZone: 'UTC' }, end: { dateTime: localEvent.end.slice(0, -1), timeZone: 'UTC' } }], '@odata.deltaLink': 'https://provider.test/delta?cursor=2' }) : json({ id: 'remote-review', '@odata.etag': 'v2' });
    if (init.method === 'REPORT') return new Response('<?xml version="1.0"?><d:multistatus xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav"><d:response><d:href>/calendar/review.ics</d:href><d:propstat><d:prop><d:getetag>"v1"</d:getetag><c:calendar-data><![CDATA[' + serializeICalendar([localEvent], { timeZone: 'UTC', now: '2026-09-01T00:00:00Z' }) + ']]></c:calendar-data></d:prop><d:status>HTTP/1.1 200 OK</d:status></d:propstat></d:response><d:sync-token>sample-cursor-2</d:sync-token></d:multistatus>', { status: 207, headers: { 'Content-Type': 'application/xml' } });
    return new Response(null, { status: 204, headers: { etag: '"v2"' } });
  };
  const adapter = id === 'two-way-google-calendar-synchronization' ? t.createGoogleCalendarAdapter({ calendarId: 'primary', accessToken: 'local-fixture-only', baseUrl: 'https://provider.test', fetch, timeZone: 'UTC' }) : id === 'microsoft-365-outlook-adapter' ? t.createMicrosoft365Adapter({ accessToken: 'local-fixture-only', baseUrl: 'https://provider.test', fetch, timeZone: 'UTC' }) : t.createCalDavAdapter({ calendarUrl: 'https://provider.test/calendar/', authorization: 'Bearer local-fixture-only', fetch, timeZone: 'UTC' });
  const pulled = await adapter.pull(range);
  const pushed = await adapter.push([{ type: 'update', localId: localEvent.id, remoteId: pulled.events[0].remoteId, etag: pulled.events[0].etag, event: { ...pulled.events[0].event, title: 'Updated review' } }]);
  table('pull() / push() results', ['Remote ID', 'Parsed title', 'Write status', 'New ETag'], [[pulled.events[0].remoteId, pulled.events[0].event.title, pushed[0].status, pushed[0].etag]]);
  table('Requests produced by the package', ['Method', 'Path', 'If-Match'], calls);
}

try {
  const [catalog, build] = await Promise.all([fetch('/catalog.json').then(r => r.json()), fetch('/build.json').then(r => r.json())]);
  const id = new URLSearchParams(location.search).get('feature');
  const feature = catalog.find(f => f.id === id); if (!feature) throw new Error('Select a feature from the capture catalog');
  license = await verifyCalendarLicense(token);
  const kind = nativeIds.has(id) ? 'package-ui' : providerIds.has(id) ? 'adapter-output' : 'api-output';
  document.querySelector('#title').textContent = feature.visual.title;
  document.querySelector('#subtitle').textContent = kind === 'package-ui' ? 'Actual package UI • Sample data • September 2026' : 'Actual package API results • Read-only capture table, not a built-in product screen';
  document.querySelector('#provenance').textContent = build.package + '@' + build.version + ' / ' + feature.module + ' · Local unpublished build';
  await render(id);
  await document.fonts.ready;
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  document.querySelector('#capture').dataset.feature = id;
  document.querySelector('#capture').dataset.kind = kind;
  document.querySelector('#capture').dataset.build = build.distSha256;
  status.dataset.status = 'ready'; status.textContent = 'Captured from the package runtime · ' + (kind === 'package-ui' ? 'Native calendar rendering' : 'Application-owned result table');
} catch (error) { status.dataset.status = 'error'; status.textContent = error.stack ?? error.message; console.error(error); }
