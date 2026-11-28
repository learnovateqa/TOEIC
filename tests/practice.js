// Plays practice sets end to end: Listening (audio once, moves on by itself), Reading (timer, Back/Next),
// a drill and the live tools; checks scoring, the Error Log and answer-position balance.
const assert = require('assert');
const { chromium } = require('playwright');
const { makeBackend } = require('./fake-gas');
const { serve, FAKE_SPEECH, signInStudent } = require('./helpers');

async function openStep(page, n, tool) {
  await page.evaluate(h => { location.hash = h; }, 'session-' + n);
  await page.waitForSelector('#tab-hub');
  await page.click('#tab-hub');
  const gate = await page.$('#gate-open:visible');
  if (gate) await gate.click();
  await page.waitForSelector(`#tool-${tool} .step-head`);
  if (await page.$(`#tool-${tool} .tool.closed`)) await page.click(`#tool-${tool} .step-head`);
  await page.click(`#tool-${tool} [data-si-start]`);
}
async function playThrough(page, tool, sel, value) {
  for (let i = 0; i < 800 && !(await page.$(`#tool-${tool} .result`)); i++) {
    const r = await page.$(`#tool-${tool} ${sel} input[value="${value}"]:not(:checked)`);
    if (r) await r.check({ force: true });
    await page.waitForTimeout(40);
  }
}

(async () => {
  const backend = makeBackend();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(FAKE_SPEECH);
  await serve(page, backend);
  await signInStudent(page, backend);

  // answer positions are spread across the letters
  const bal = await page.evaluate(() => {
    const c = { 3: [0, 0, 0], 4: [0, 0, 0, 0] };
    Object.values(QUIZ).forEach(q => { const qs = q.kind === 'mc' ? q.qs : flatQs(quizParts(q)).map(f => f.x); qs.forEach(x => { if (!x.fixed) c[x.o.length][x.a]++; }); });
    return c;
  });
  console.log('Answer positions · A–D:', bal[4].join(' / '), '· A–C:', bal[3].join(' / '));
  const spread = a => Math.max(...a) - Math.min(...a);
  assert.ok(spread(bal[4]) <= 3, 'A–D answers are not balanced');
  assert.ok(spread(bal[3]) <= 2, 'A–C answers are not balanced');

  // Listening Part 2: answer A every time and let it play through
  await openStep(page, 2, 'L2');
  await playThrough(page, 'L2', '.lt-let', 0);
  const res = await page.evaluate(() => results()['2:L2']);
  assert.ok(res && res.total === 10, 'Part 2 set was not scored');
  const spoken = await page.evaluate(() => window.__spoken.join(' | '));
  assert.ok(/Number 1\./.test(spoken) && /C\. /.test(spoken) && !/D\. /.test(spoken), 'Part 2 should read three choices, A–C');
  const log1 = await page.evaluate(() => store.get('log', []));
  assert.equal(log1.length, 10 - res.score);
  assert.ok(log1.every(e => e.cause && e.auto && e.why && e.part === 2), 'Error Log entries need part, why and a cause');
  console.log(`Part 2 set: ${res.score}/${res.total}; causes: ${[...new Set(log1.map(e => e.cause))].join(', ')}`);

  // Listening Part 1 with photos (four statements, A–D)
  await openStep(page, 2, 'L1');
  await page.waitForSelector('#tool-L1 .lt-photo svg', { timeout: 15000 });
  await playThrough(page, 'L1', '.lt-let', 3);
  const r1 = await page.evaluate(() => results()['2:L1']);
  assert.equal(r1.total, 6);
  console.log(`Part 1 set: ${r1.score}/${r1.total}`);

  // Listening Part 3 with a graphic: questions printed while the audio plays
  await openStep(page, 3, 'L4');
  await page.waitForSelector('#tool-L4 .lt-q');
  await playThrough(page, 'L4', '.lt-q', 1);
  const r3 = await page.evaluate(() => results()['3:L4']);
  assert.equal(r3.total, 9);
  assert.ok(await page.$('#tool-L4 .lt-graphic'), 'the graphic should be in the review');
  console.log(`Part 3 set: ${r3.score}/${r3.total}`);

  // Reading Part 5: answer the first page, go forward and back, finish
  await openStep(page, 4, 'R2');
  await page.waitForSelector('#tool-R2 .rt-five');
  for (const r of await page.$$('#tool-R2 .lt-q input[value="2"]')) await r.check();
  await page.click('#tool-R2 [data-rt="next"]');
  await page.click('#tool-R2 [data-rt="prev"]');
  assert.equal(await page.$$eval('#tool-R2 .lt-q input[value="2"]:checked', x => x.length), 5, 'answers are kept when you go back');
  page.once('dialog', d => d.accept());
  await page.click('#tool-R2 [data-rt="finish"]');
  await page.waitForSelector('#tool-R2 .result');
  const rr = await page.evaluate(() => results()['4:R2']);
  assert.equal(rr.total, 10);
  const p5 = await page.evaluate(() => store.get('log', []).filter(e => e.part === 5).map(e => e.cause));
  assert.ok(p5.every(c => c === 'grammar' || c === 'timing'), 'Part 5 grammar misses: grammar, or timing when blank');
  console.log(`Part 5 set: ${rr.score}/${rr.total}`);

  // Part 7 renders passages and the sentence-position question
  await openStep(page, 6, 'R6');
  await page.waitForSelector('#tool-R6 .rt-doc');
  await page.click('#tool-R6 [data-rt="next"]');
  assert.ok(/\[2\]/.test(await page.textContent('#tool-R6 .rt-panes')));

  // a drill scores and explains
  await openStep(page, 5, 'G1');
  await page.click('#tool-G1 [data-submit]');
  assert.ok(await page.$('#tool-G1 .result'));

  // live tools respond
  await page.evaluate(() => { location.hash = 'session-5'; });
  await page.waitForSelector('#tab-live');
  await page.click('#tab-live');
  await page.click('[data-widget="sorter"] .lw-item [data-g="1"]');
  await page.click('[data-widget="sorter"] [data-check]');
  assert.ok(/correct/.test(await page.textContent('[data-widget="sorter"] [data-out]')));
  await page.click('[data-widget="mark"] .seg');
  await page.click('[data-widget="mark"] [data-mk-key]');
  await page.click('[data-widget="poll"] [data-vote="0"]');
  await page.click('[data-widget="poll"] [data-po-reveal]');
  assert.ok(await page.$('[data-widget="poll"] .poll-opt.right'));

  // the Error Log page shows How to fix
  await page.evaluate(() => { location.hash = 'log'; });
  await page.waitForSelector('.fixbox');
  await browser.close();
  if (errors.length) { console.log('PAGE ERRORS:\n' + errors.join('\n')); process.exit(1); }
  console.log('Practice checks passed.');
})().catch(e => { console.error(e); process.exit(1); });
