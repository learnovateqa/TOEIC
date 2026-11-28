// Picture kit for the Part 1 photographs, Speaking "describe a picture" and Writing picture sentences.
// Simple, original flat illustrations built from a few drawing helpers. SCENES[key] = SVG markup; SCENE_ALT[key] = description.
(function () {
  const S = window.SCENES = window.SCENES || {}, ALT = window.SCENE_ALT = window.SCENE_ALT || {};
  const SKIN = ['#F2C8A0', '#D9A06B', '#A86B3C', '#7A4A2A', '#E8B98F'];
  const r = (x, y, w, h, f, rx = 0, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${f}" ${extra}/>`;
  const ln = (x1, y1, x2, y2, c, w) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
  const circ = (x, y, rr, f) => `<circle cx="${x}" cy="${y}" r="${rr}" fill="${f}"/>`;
  const K = {
    // backgrounds
    office: () => r(0, 0, 400, 260, '#E9EEF5') + r(0, 196, 400, 64, '#C9D2DE') + ln(0, 196, 400, 196, '#B3BECC', 2),
    room: (wall = '#F3EBDD', floor = '#D8C3A5') => r(0, 0, 400, 260, wall) + r(0, 200, 400, 60, floor),
    outdoor: (ground = '#9CCB78') => r(0, 0, 400, 260, '#CFE8F7') + circ(350, 40, 18, '#FFD166') + r(0, 190, 400, 70, ground),
    street: () => r(0, 0, 400, 260, '#CFE8F7') + r(0, 175, 400, 30, '#BDBDBD') + r(0, 205, 400, 55, '#6E7680') + [20, 110, 200, 290, 380].map(x => r(x, 230, 40, 5, '#F4F4F4')).join(''),
    warehouse: () => r(0, 0, 400, 260, '#DCDDE0') + r(0, 205, 400, 55, '#A9ADB3') + [0, 1, 2, 3, 4].map(i => ln(i * 100, 0, i * 100 + 40, 0, '#C3C6CB', 6)).join(''),
    // furniture and objects
    window: (x, y, w = 90, h = 70) => r(x, y, w, h, '#BFE0F5', 3, 'stroke="#8A9BAE" stroke-width="4"') + ln(x + w / 2, y, x + w / 2, y + h, '#8A9BAE', 3),
    whiteboard: (x, y, w = 120, h = 70) => r(x, y, w, h, '#FFFFFF', 3, 'stroke="#9AA4B2" stroke-width="3"') + ln(x + 15, y + 20, x + w - 30, y + 20, '#4A7BD0', 3) + ln(x + 15, y + 35, x + w - 50, y + 35, '#D04A4A', 3),
    table: (x, y, w = 140, c = '#A9784A') => r(x, y, w, 8, c, 2) + r(x + 8, y + 8, 6, 200 - y - 8, c) + r(x + w - 14, y + 8, 6, 200 - y - 8, c),
    desk: (x, y, w = 150) => r(x, y, w, 8, '#8C6A4F', 2) + r(x + w - 50, y + 8, 46, 200 - y - 8, '#7A5C44', 2) + r(x + 6, y + 8, 6, 200 - y - 8, '#7A5C44'),
    chair: (x, y = 200, c = '#3D5A80') => r(x, y - 45, 34, 6, c, 2) + r(x + 26, y - 85, 6, 46, c, 2) + ln(x + 4, y - 39, x + 2, y, c, 4) + ln(x + 30, y - 39, x + 32, y, c, 4),
    laptop: (x, y, open = true) => (open ? `<polygon points="${x + 4},${y} ${x + 40},${y} ${x + 46},${y - 26} ${x + 10},${y - 26}" fill="#59606B"/>` : '') + r(x, y, 46, 4, '#3B4049', 1),
    monitor: (x, y) => r(x, y - 40, 56, 36, '#2F3540', 3) + r(x + 4, y - 36, 48, 28, '#7FB3E6', 2) + r(x + 24, y - 4, 8, 4, '#2F3540'),
    papers: (x, y) => r(x, y - 3, 30, 3, '#FFFFFF', 0, 'stroke="#B8C0CC"') + r(x + 3, y - 6, 30, 3, '#FFFFFF', 0, 'stroke="#B8C0CC"'),
    cup: (x, y) => r(x, y - 12, 10, 12, '#FFFFFF', 2, 'stroke="#8A9BAE"'),
    plant: (x, y = 200, h = 60) => r(x - 14, y - 28, 28, 28, '#C0603A', 3) + `<ellipse cx="${x}" cy="${y - 28 - h / 2}" rx="${h / 3}" ry="${h / 2}" fill="#3F8F4A"/>` + `<ellipse cx="${x - 14}" cy="${y - 34 - h / 4}" rx="${h / 5}" ry="${h / 3}" fill="#4FA35A"/>`,
    smallplant: (x, y) => r(x - 7, y - 12, 14, 12, '#C0603A', 2) + `<ellipse cx="${x}" cy="${y - 20}" rx="9" ry="11" fill="#3F8F4A"/>`,
    ladder: (x, y = 200, h = 140) => ln(x, y, x + 14, y - h, '#C9A227', 5) + ln(x + 34, y, x + 48, y - h, '#C9A227', 5) + [1, 2, 3, 4, 5, 6].map(i => { const t = i / 7; return ln(x + 14 * t, y - h * t, x + 34 + 14 * t, y - h * t, '#C9A227', 4); }).join(''),
    box: (x, y, w = 40, h = 32, c = '#C89B63') => r(x, y - h, w, h, c, 2, 'stroke="#A47A45" stroke-width="2"') + ln(x, y - h + 8, x + w, y - h + 8, '#A47A45', 2),
    shelf: (x, y = 200, w = 120, h = 150, rows = 4, items = true) => r(x, y - h, w, h, '#8C6A4F', 2) + Array.from({ length: rows }, (_, i) => r(x + 5, y - h + 6 + i * (h / rows), w - 10, h / rows - 10, '#F2E6D4') + (items ? [0, 1, 2].map(j => r(x + 10 + j * ((w - 20) / 3), y - h + 6 + i * (h / rows) + 8, (w - 20) / 3 - 6, h / rows - 20, ['#4A7BD0', '#D04A4A', '#3F8F4A', '#E8A33D'][(i + j) % 4], 1)).join('') : '')).join(''),
    cart: (x, y = 200, w = 90) => r(x, y - 22, w, 8, '#5B6573', 2) + ln(x + w, y - 22, x + w + 10, y - 70, '#5B6573', 4) + circ(x + 12, y - 6, 6, '#333') + circ(x + w - 12, y - 6, 6, '#333'),
    car: (x, y = 225, c = '#D04A4A') => `<path d="M${x} ${y - 14} L${x + 18} ${y - 34} L${x + 82} ${y - 34} L${x + 104} ${y - 14} L${x + 120} ${y - 12} L${x + 120} ${y + 4} L${x} ${y + 4} Z" fill="${c}"/>` + r(x + 24, y - 30, 26, 14, '#BFE0F5', 2) + r(x + 56, y - 30, 24, 14, '#BFE0F5', 2) + circ(x + 26, y + 6, 11, '#222') + circ(x + 94, y + 6, 11, '#222'),
    bus: (x, y = 225, c = '#E8A33D') => r(x, y - 60, 190, 62, c, 8) + [0, 1, 2, 3, 4].map(i => r(x + 12 + i * 34, y - 52, 26, 22, '#BFE0F5', 2)).join('') + circ(x + 36, y + 4, 12, '#222') + circ(x + 156, y + 4, 12, '#222'),
    bike: (x, y = 200) => `<circle cx="${x}" cy="${y - 16}" r="16" fill="none" stroke="#333" stroke-width="3"/><circle cx="${x + 52}" cy="${y - 16}" r="16" fill="none" stroke="#333" stroke-width="3"/>` + ln(x, y - 16, x + 22, y - 40, '#2A9D8F', 4) + ln(x + 22, y - 40, x + 52, y - 16, '#2A9D8F', 4) + ln(x + 22, y - 40, x + 44, y - 40, '#2A9D8F', 4) + ln(x + 44, y - 40, x + 52, y - 16, '#2A9D8F', 4),
    tree: (x, y = 190, s = 1) => r(x - 6 * s, y - 50 * s, 12 * s, 50 * s, '#7A5230') + circ(x, y - 70 * s, 32 * s, '#3F8F4A') + circ(x - 20 * s, y - 55 * s, 20 * s, '#4FA35A'),
    bench: (x, y = 200) => r(x, y - 30, 90, 7, '#8B5A2B', 2) + r(x, y - 48, 90, 6, '#8B5A2B', 2) + ln(x + 8, y - 23, x + 8, y, '#5E3C1C', 4) + ln(x + 82, y - 23, x + 82, y, '#5E3C1C', 4),
    umbrella: (x, y, c = '#4A7BD0') => `<path d="M${x - 26} ${y} Q${x} ${y - 34} ${x + 26} ${y} Z" fill="${c}"/>` + ln(x, y, x, y + 34, '#333', 2),
    counter: (x, y, w = 160) => r(x, y, w, 200 - y, '#B07D52', 2) + r(x - 4, y - 6, w + 8, 8, '#8C6A4F', 2),
    sign: (x, y, text, c = '#2F6FA8') => r(x, y, Math.max(60, text.length * 8 + 16), 24, c, 4) + `<text x="${x + 8}" y="${y + 16}" font-family="Arial, sans-serif" font-size="12" font-weight="700" fill="#fff">${text}</text>`,
    clock: (x, y) => circ(x, y, 14, '#FFFFFF') + `<circle cx="${x}" cy="${y}" r="14" fill="none" stroke="#555" stroke-width="2"/>` + ln(x, y, x, y - 9, '#333', 2) + ln(x, y, x + 6, y, '#333', 2),
    door: (x, y = 200, c = '#8C6A4F') => r(x, y - 110, 56, 110, c, 3) + circ(x + 46, y - 55, 3, '#E8C35A'),
    printer: (x, y) => r(x, y - 34, 60, 34, '#D7DBE0', 4, 'stroke="#9AA4B2" stroke-width="2"') + r(x + 10, y - 40, 40, 8, '#FFFFFF', 1, 'stroke="#9AA4B2"'),
    can: (x, y) => r(x, y - 22, 26, 22, '#2A9D8F', 4) + ln(x + 26, y - 16, x + 44, y - 26, '#2A9D8F', 4),
    flowers: (x, y) => [0, 1, 2, 3].map(i => circ(x + i * 12, y - 8 - (i % 2) * 6, 5, ['#E63946', '#FFD166', '#C77DFF', '#F4A261'][i])).join('') + r(x - 6, y - 4, 52, 6, '#7A5230', 2),
    suitcase: (x, y = 200, c = '#4A4E69') => r(x, y - 40, 30, 40, c, 4) + r(x + 9, y - 48, 12, 8, 'none', 2, `stroke="${c}" stroke-width="3"`),
    cones: (x, y = 225) => [0, 1, 2].map(i => `<polygon points="${x + i * 40},${y} ${x + i * 40 + 10},${y - 28} ${x + i * 40 + 20},${y}" fill="#F77F00"/>`).join(''),
    // a person. o: pose 'stand' | 'sit' | 'kneel'; arm 'down' | 'forward' | 'up' | 'type' | 'hold' | 'point' | 'phone'; face 1 (right) or -1 (left)
    person: (x, y = 200, o = {}) => {
      const sk = o.skin || SKIN[0], sh = o.shirt || '#3D5A80', pa = o.pants || '#2B2D42', hr = o.hair || '#3B2A1E', f = o.face || 1, sc = o.scale || 1;
      let g = '';
      let hipY, legs;
      if (o.pose === 'sit') { hipY = y - 45; legs = ln(x, hipY, x + 30 * f, hipY, pa, 10) + ln(x + 30 * f, hipY, x + 30 * f, y, pa, 9); }
      else if (o.pose === 'kneel') { hipY = y - 38; legs = ln(x, hipY, x + 20 * f, y - 6, pa, 10) + ln(x + 20 * f, y - 6, x - 6 * f, y - 4, pa, 9); }
      else { hipY = y - 58; legs = ln(x - 5, hipY, x - 7, y, pa, 10) + ln(x + 5, hipY, x + 7, y, pa, 10); }
      const shY = hipY - 42, headY = shY - 15;
      g += legs + r(x - 13, shY - 2, 26, 46, sh, 9);
      const arm = (dx, dy) => ln(x + 9 * f, shY + 6, x + 9 * f + dx * f, shY + 6 + dy, sk, 7);
      const back = ln(x - 9 * f, shY + 6, x - 11 * f, shY + 36, sk, 7);
      const A = { down: arm(2, 32), forward: arm(30, 6), up: arm(8, -34), type: arm(28, 20), hold: arm(22, 16), point: arm(32, -12), phone: ln(x + 9 * f, shY + 6, x + 4 * f, shY - 14, sk, 7) };
      g += back + (A[o.arm] || A.down);
      if (o.arm === 'phone') g += r(x + (f > 0 ? 0 : -6), shY - 24, 6, 12, '#222', 1);
      if (o.item === 'box') g += K.box(x + 18 * f - 16, shY + 30, 32, 24);
      if (o.item === 'papers') g += r(x + 26 * f - 10, shY + 14, 22, 14, '#FFFFFF', 1, 'stroke="#B8C0CC"');
      if (o.item === 'cup') g += K.cup(x + 34 * f - 5, shY + 14);
      if (o.item === 'bag') g += r(x - 16 * f - 8, shY + 30, 16, 18, '#8B5A2B', 3);
      g += circ(x, headY, 12, sk);
      g += o.long ? `<path d="M${x - 13} ${headY + 10} Q${x - 14} ${headY - 16} ${x} ${headY - 13} Q${x + 14} ${headY - 16} ${x + 13} ${headY + 10} L${x + 9} ${headY + 2} Q${x} ${headY - 8} ${x - 9} ${headY + 2} Z" fill="${hr}"/>`
        : `<path d="M${x - 12} ${headY - 1} Q${x - 10} ${headY - 15} ${x} ${headY - 13} Q${x + 11} ${headY - 15} ${x + 12} ${headY - 1} Q${x} ${headY - 7} ${x - 12} ${headY - 1} Z" fill="${hr}"/>`;
      if (o.hat) g += r(x - 13, headY - 18, 26, 7, o.hat, 3);
      return sc === 1 ? g : `<g transform="translate(${x * (1 - sc)} ${y * (1 - sc)}) scale(${sc})">${g}</g>`;
    }
  };
  window.SCENE_KIT = K;
  // define(key, alt, svg parts)
  window.defScene = function (key, alt, parts) {
    ALT[key] = alt;
    S[key] = `<svg class="scene" viewBox="0 0 400 260" role="img" aria-label="${alt.replace(/"/g, '&quot;')}">${parts.join('')}</svg>`;
  };
})();
