import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';

const root = resolve(import.meta.dirname, '..');
const features = JSON.parse(
  readFileSync(resolve(root, 'src/app/premium-feature-data.json'), 'utf8'),
);
const directory = resolve(root, 'public/previews/premium');
const check = process.argv.includes('--check');
const ink = '#183d33',
  muted = '#597168',
  line = '#d6e3dc',
  green = '#13685a';
const fills = ['#d9ece2', '#e2eaf6', '#f8ecd0', '#ece4f3'];
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char],
  );
const rect = (x, y, w, h, fill = '#fff', radius = 10, stroke = line) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${fill}" stroke="${stroke}"/>`;
const text = (x, y, value, size = 18, color = ink, weight = 400) =>
  `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" font-weight="${weight}">${escape(value)}</text>`;
const path = (d, color = line, width = 2, arrow = false, dash = false) =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}"${arrow ? ' marker-end="url(#arrow)"' : ''}${dash ? ' stroke-dasharray="7 6"' : ''}/>`;
const node = (x, y, w, label, detail = '', fill = fills[0]) =>
  rect(x, y, w, 92, fill) +
  text(x + 20, y + 38, label, 18, ink, 600) +
  text(x + 20, y + 66, detail, 14, muted);
const badge = (x, y, label, fill = fills[0], width = 130) =>
  rect(x, y, width, 34, fill, 17, fill) + text(x + 14, y + 23, label, 14, ink, 600);
const rowGrid = (labels, cols = ['MON', 'TUE', 'WED', 'THU', 'FRI']) => {
  let out = rect(62, 170, 996, 330);
  cols.forEach((col, i) => {
    out += text(260 + i * 156, 202, col, 14, muted, 600);
    if (i) out += path(`M${240 + i * 156} 170V500`);
  });
  labels.forEach((label, i) => {
    const y = 228 + i * 88;
    out += text(80, y + 45, label, 16, ink, 600) + path(`M62 ${y}H1058`);
  });
  return out + path('M240 170V500');
};
const pipeline = (labels, note, variant = 'pipeline') => {
  let out = '';
  labels.forEach((label, i) => {
    out += node(
      64 + i * 352,
      240,
      288,
      label,
      ['Application state', 'Explicit contract', 'Customer system'][i],
      fills[i],
    );
    if (i < 2) {
      out += path(`M${354 + i * 352} 283H${405 + i * 352}`, green, 2, true);
      if (variant === 'sync') out += path(`M${405 + i * 352} 307H${354 + i * 352}`, green, 2, true);
    }
  });
  out += text(64, 408, note ?? 'Your application controls the integration lifecycle', 17, muted);
  if (variant === 'migration')
    out +=
      badge(64, 447, 'Mapped', fills[0]) +
      badge(212, 447, 'Review required', fills[2], 190) +
      badge(420, 447, 'Unmapped', fills[3], 150);
  if (variant === 'backend')
    out +=
      badge(64, 447, 'REST', fills[0], 110) +
      badge(192, 447, 'GraphQL', fills[1], 130) +
      badge(340, 447, 'RPC / other', fills[3], 160);
  return out;
};

function renderVisual(v) {
  const labels = v.labels;
  switch (v.layout) {
    case 'lanes': {
      let out = rowGrid(labels);
      labels.forEach((label, i) => {
        const x = 254 + i * 85,
          y = 248 + i * 88,
          w = Math.min(v.bars[i] * 140, 1040 - x);
        out +=
          rect(x, y, w, 42, fills[i], 6, fills[i]) +
          text(x + 12, y + 27, ['Planning', 'Delivery', 'Review'][i], 15);
      });
      return out;
    }
    case 'daygrid': {
      let out = rect(64, 178, 992, 328);
      labels.forEach((label, i) => {
        const x = 64 + i * 331;
        out += rect(x, 178, 331, 54, fills[i], 0) + text(x + 20, 212, label, 18, ink, 600);
        if (i) out += path(`M${x} 232V506`);
        out +=
          text(x + 20, 267, 'MONDAY 07', 14, muted) +
          rect(x + 18, 293, 294, 48, fills[i], 6) +
          text(x + 32, 323, ['Workshop', 'Team planning', 'Client review'][i], 16) +
          text(x + 20, 390, 'TUESDAY 08', 14, muted) +
          rect(x + 18, 418, 294, 48, fills[(i + 1) % 3], 6) +
          text(x + 32, 448, ['Design session', 'Release prep', 'Research'][i], 16);
      });
      return out + path('M64 365H1056');
    }
    case 'timegrid': {
      let out = rect(64, 178, 992, 330);
      labels.forEach((label, i) => {
        const x = 156 + i * 300;
        out += text(x + 18, 210, label, 18, ink, 600) + path(`M${x} 178V508`);
      });
      ['09:00', '10:00', '11:00', '12:00'].forEach((hour, i) => {
        out += text(77, 257 + i * 64, hour, 14, muted) + path(`M156 ${232 + i * 64}H1056`);
      });
      labels.forEach((_, i) => {
        const x = 166 + i * 300,
          y = 247 + (i % 2) * 64;
        out +=
          rect(x, y, 278, i === 1 ? 111 : 52, fills[i], 6) +
          text(x + 14, y + 29, ['Workshop', 'Planning', 'Review'][i], 17);
      });
      return out;
    }
    case 'headers': {
      let out =
        text(64, 192, 'DATE FIRST', 14, muted, 600) +
        text(598, 192, 'RESOURCE FIRST', 14, muted, 600);
      [64, 598].forEach((base, j) => {
        out += rect(base, 210, 458, 252);
        [0, 1].forEach((i) => {
          out +=
            rect(base + i * 229, 210, 229, 60, fills[j], 0) +
            text(base + i * 229 + 22, 247, labels[j ? i + 2 : i], 18, ink, 600);
          [0, 1].forEach((k) => {
            const x = base + i * 229 + k * 114.5;
            out +=
              rect(x, 270, 114.5, 50, '#f6f9f7', 0) +
              text(x + 12, 301, labels[j ? k : k + 2], 14) +
              path(`M${x} 320V462`) +
              rect(x + 12, 346 + (k % 2) * 43, 90, 32, fills[k + 1], 4);
          });
        });
      });
      return out;
    }
    case 'pipeline':
    case 'sync':
    case 'migration':
    case 'backend':
      return pipeline(labels, v.note, v.layout);
    case 'hierarchy':
      return (
        path('M560 242V296H304V340M560 296H814V340', green, 2) +
        path('M304 420V468H208M814 420V468H904', green, 2) +
        node(377, 158, 366, labels[0], 'Parent resource') +
        node(137, 338, 334, labels[1], 'Expandable group', fills[1]) +
        node(647, 338, 334, labels[2], 'Expandable group', fills[2]) +
        badge(144, 468, labels[3], fills[1], 180) +
        badge(798, 468, labels[4], fills[2], 180)
      );
    case 'groups': {
      let out = rect(64, 174, 992, 348) + badge(820, 190, 'Sorted by capacity', fills[1], 216);
      labels.forEach((label, i) => {
        const y = 194 + i * 60;
        out +=
          rect(84, y, 700, 45, i === 0 || i === 3 ? fills[0] : '#fff', 5) +
          text(
            i === 0 || i === 3 ? 102 : 132,
            y + 29,
            label,
            17,
            ink,
            i === 0 || i === 3 ? 600 : 400,
          );
      });
      return out;
    }
    case 'columns': {
      let out = rect(64, 190, 992, 286);
      const xs = [64, 505, 714],
        widths = [441, 209, 342];
      xs.forEach((x, i) => {
        out +=
          rect(x, 190, widths[i], 58, fills[i], 0) +
          text(x + 22, 227, labels[i], 18, ink, 600) +
          path(`M${x} 248V476`);
      });
      [0, 1, 2].forEach((i) => {
        out +=
          path(`M64 ${248 + i * 76}H1056`) +
          text(88, 296 + i * 76, [labels[3], 'Engineering', 'Operations'][i], 18) +
          text(526, 296 + i * 76, [labels[4], '8 seats', '6 seats'][i], 18) +
          text(736, 296 + i * 76, [labels[5], 'Remote', 'Berlin'][i], 18);
      });
      return (
        out +
        path('M505 182V490', green, 4) +
        text(416, 529, 'Resize with pointer, touch, or keyboard', 16, muted)
      );
    }
    case 'availability': {
      let out = rowGrid([labels[0], 'Room B', 'Room C']);
      out +=
        rect(248, 236, 785, 65, '#e8f4ec', 0, '#e8f4ec') +
        rect(575, 236, 146, 65, '#f1d9d2', 0, '#f1d9d2') +
        rect(270, 250, 232, 37, fills[0], 5, green) +
        text(290, 275, labels[3], 16, green, 600);
      return (
        out + badge(64, 526, labels[1], fills[0], 170) + badge(254, 526, labels[2], '#f1d9d2', 170)
      );
    }
    case 'capacity':
      return (
        node(64, 192, 444, labels[0], 'Weighted capacity and matching requirements') +
        rect(88, 330, 944, 38, '#eef3ef', 19) +
        rect(88, 330, 708, 38, green, 19, green) +
        text(88, 415, labels[1], 32, green, 600) +
        badge(64, 470, labels[2], fills[1], 230) +
        badge(312, 470, labels[3], fills[3], 220) +
        text(660, 415, '1 unit remaining', 20, muted)
      );
    case 'virtual': {
      let out = rect(64, 174, 640, 352);
      for (let i = 0; i < 8; i++)
        out +=
          rect(84, 190 + i * 38, 600, 30, i > 1 && i < 6 ? fills[0] : '#f2f5f2', 3) +
          text(104, 211 + i * 38, 'Resource ' + String(i + 48), 14);
      return (
        out +
        rect(760, 208, 294, 248, '#fff', 8) +
        text(786, 245, labels[2], 20, ink, 600) +
        path('M785 270H1028M785 306H1028M785 342H1028M785 378H1028M868 270V418M948 270V418') +
        badge(64, 538, labels[0], fills[0], 205) +
        badge(287, 538, labels[1], fills[1], 150)
      );
    }
    case 'tasks': {
      let out = rowGrid(labels);
      labels.forEach((_, i) => {
        for (let j = 0; j < 5; j++)
          out +=
            rect(273 + j * 156, 248 + i * 88, 44, 42, (i + j) % 3 === 0 ? '#fff' : fills[i], 8) +
            text(285 + j * 156, 276 + i * 88, (i + j) % 3 === 0 ? '—' : '✓', 19, green, 600);
      });
      return out;
    }
    case 'heatmap': {
      let out = rowGrid(labels),
        levels = ['#eef4ef', '#d7e9da', '#a9cfb5', '#72ad8b', '#f3d398'];
      labels.forEach((_, i) => {
        for (let j = 0; j < 5; j++) {
          const level = (i * 2 + j) % 5;
          out +=
            rect(252 + j * 156, 244 + i * 88, 138, 59, levels[level], 5) +
            text(294 + j * 156, 282 + i * 88, [0, 25, 50, 75, 110][level] + '%', 19, ink, 600);
        }
      });
      return (
        out +
        text(64, 553, 'SAMPLE UTILIZATION', 14, muted, 600) +
        text(272, 553, 'Idle', 15) +
        rect(322, 535, 160, 22, levels[1], 4) +
        text(516, 553, 'High', 15) +
        rect(569, 535, 160, 22, levels[3], 4) +
        text(763, 553, 'Over capacity', 15) +
        rect(881, 535, 150, 22, levels[4], 4)
      );
    }
    case 'shifts':
      return (
        rowGrid(
          ['Split shift', 'Rotation day 1', 'Rotation day 2'],
          ['08:00', '12:00', '16:00', '20:00', '24:00'],
        ) +
        rect(250, 250, 230, 42, fills[0], 6) +
        text(268, 277, labels[0], 16) +
        rect(480, 250, 110, 42, '#f7f7f3', 0) +
        text(507, 277, labels[1], 15) +
        rect(590, 250, 220, 42, fills[1], 6) +
        text(608, 277, labels[2], 16) +
        rect(738, 338, 294, 42, fills[3], 6) +
        text(756, 365, labels[3], 16) +
        rect(738, 426, 294, 42, fills[3], 6) +
        text(756, 453, 'Repeats from anchor', 16)
      );
    case 'dependencies':
      return (
        node(64, 218, 300, labels[0], 'Primary resource') +
        node(756, 182, 300, labels[1], 'Required companion', fills[1]) +
        node(756, 366, 300, labels[2], labels[3], fills[2]) +
        path('M366 264H558V228H740', green, 2, true) +
        path('M366 284H558V412H740', green, 2, true, true) +
        text(409, 211, 'Requires', 16, muted) +
        text(407, 447, 'If allowed and available', 16, muted)
      );
    case 'policies': {
      let out = text(64, 202, labels[3], 24, ink, 600);
      ['Reject proposal', 'Continue with warning', 'Continue with issues'].forEach((detail, i) => {
        out += node(64 + i * 338, 270, 316, labels[i], detail, ['#f4ded8', fills[2], fills[0]][i]);
      });
      return out + text(64, 439, 'Typed issue + severity + decision', 22, green, 600);
    }
    case 'forecast': {
      let out = path('M102 180V488H1056', muted, 2);
      const demand = [130, 170, 260, 220, 140],
        available = [180, 190, 180, 175, 210];
      labels.forEach((label, i) => {
        const x = 154 + i * 176;
        out +=
          rect(x, 488 - demand[i], 48, demand[i], fills[1], 3) +
          rect(x + 55, 488 - available[i], 48, available[i], fills[0], 3) +
          text(x - 5, 519, label, 15);
        if (demand[i] > available[i])
          out += text(x - 5, 488 - demand[i] - 20, 'Shortfall', 14, '#8b4a24', 600);
      });
      return (
        out + badge(64, 538, 'Demand', fills[1], 140) + badge(222, 538, 'Available', fills[0], 160)
      );
    }
    case 'critical':
      return (
        node(64, 214, 290, labels[0], 'Critical', fills[2]) +
        node(416, 214, 290, labels[1], 'Critical', fills[2]) +
        node(768, 214, 290, labels[2], 'Critical', fills[2]) +
        path('M356 260H403M708 260H755', green, 3, true) +
        node(416, 398, 290, labels[3], 'Parallel task with float', fills[1]) +
        path('M210 308V444H401', muted, 2, true, true) +
        text(64, 541, 'Earliest / latest times and total float are analysis outputs', 17, muted)
      );
    case 'reconcile':
      return (
        node(372, 162, 376, labels[0], 'Last shared snapshot') +
        node(64, 318, 412, labels[1], 'Title: Design review', fills[1]) +
        node(644, 318, 412, labels[2], 'Title: Customer review', fills[3]) +
        path('M465 254V291H270V307M655 254V291H850V307', green, 2, true) +
        badge(398, 460, labels[3], fills[2], 320) +
        text(268, 541, 'Keep base, local, and remote values for the decision', 17, muted)
      );
    case 'workflow':
    case 'queue': {
      let out = '';
      labels.forEach((label, i) => {
        out += node(
          64 + i * 252,
          240,
          236,
          label,
          ['Step 1', 'Step 2', 'Step 3', 'Step 4'][i],
          fills[i],
        );
        if (i < 3) out += path(`M${302 + i * 252} 286H${311 + i * 252}`, green, 2, true);
      });
      return (
        out +
        text(
          64,
          439,
          v.layout === 'workflow' ? 'Actor and role selectors determine who can approve' : v.note,
          18,
          muted,
        )
      );
    }
    case 'states':
      return (
        node(64, 216, 280, labels[0], 'Initial state') +
        node(422, 216, 280, labels[1], 'Guarded transition', fills[1]) +
        node(780, 216, 276, labels[2], 'Accepted state', fills[0]) +
        path('M346 262H408M704 262H766', green, 2, true) +
        node(422, 422, 280, labels[3], 'Allowed cancellation', fills[3]) +
        path('M204 310V468H408M560 310V408', muted, 2, true)
      );
    case 'audit': {
      let out = '';
      labels.forEach((label, i) => {
        out += node(64 + i * 352, 210, 288, label, 'Actor · action · version', fills[i]);
        out +=
          rect(64 + i * 352, 328, 288, 54, '#f5f8f6', 6) +
          text(84 + i * 352, 362, i ? 'Previous hash → hash' : 'Origin → first hash', 16);
        if (i < 2) out += path(`M${354 + i * 352} 355H${404 + i * 352}`, green, 2, true);
      });
      return (
        out +
        text(64, 461, 'Verify the supplied chain before relying on its integrity', 18, green, 600)
      );
    }
    case 'permissions': {
      let out = rect(64, 184, 992, 282);
      ['Actor / role', ...labels.slice(0, 3)].forEach(
        (label, i) =>
          (out +=
            rect(64 + i * 248, 184, 248, 62, fills[i], 0) +
            text(85 + i * 248, 223, label, 18, ink, 600)),
      );
      labels.slice(3).forEach((role, i) => {
        out += text(88, 304 + i * 104, role, 18, ink, 600) + path(`M64 ${246 + i * 104}H1056`);
        for (let j = 0; j < 3; j++)
          out += badge(
            342 + j * 248,
            275 + i * 104,
            i === 0 && j === 2 ? 'Denied' : 'Allowed',
            i === 0 && j === 2 ? '#f4ded8' : fills[0],
            152,
          );
      });
      return (
        out + text(64, 527, 'Deny rules take precedence · default permission is deny', 17, muted)
      );
    }
    default:
      throw new Error('Unknown preview layout: ' + v.layout);
  }
}

if (!check) mkdirSync(directory, { recursive: true });
for (const feature of features) {
  assert.match(feature.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  const v = feature.visual;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1120" height="640" viewBox="0 0 1120 640" role="img" aria-labelledby="title desc"><title id="title">${escape(v.title)}</title><desc id="desc">${escape(v.subtitle + '. ' + v.labels.join(', ') + '. Static illustration, not a live calendar or product screenshot.')}</desc><defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${green}"/></marker></defs><style>text{font-family:Arial,Helvetica,sans-serif}</style>${rect(1, 1, 1118, 638, '#f7faf7', 18)}${rect(24, 24, 1072, 592, '#fff', 14)}${text(64, 86, v.title, 27, ink, 600)}${text(64, 122, v.subtitle, 18, muted)}${renderVisual(v)}${text(64, 589, v.note ?? 'Sample data · feature concept, not a product screenshot', 14, muted)}${text(64, 612, 'WTS CALENDAR  /  PREMIUM  /  STATIC ILLUSTRATION', 11, muted, 600)}</svg>\n`;
  const file = resolve(directory, feature.id + '.svg');
  if (check) assert.equal(readFileSync(file, 'utf8'), svg, 'Regenerate preview: ' + feature.id);
  else writeFileSync(file, svg);
}
console.log(
  `${check ? 'Verified' : 'Generated'} ${features.length} distinct Premium feature illustrations.`,
);
