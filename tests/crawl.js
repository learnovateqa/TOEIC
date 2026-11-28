// Crawl every route as the teacher and as a student, at desktop and phone widths, in light and dark mode.
// Uses a stand-in Apps Script backend (tests/fake-gas.js runs the real Code.gs in memory).
// Run: node tests/crawl.js   (needs the pre-installed Playwright)
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { makeBackend } = require('./fake-gas');

const ROOT = path.join(__dirname, '..');
const API = 'https://script.google.com/macros/s/TEST/exec';
const SITE = 'http://toeic.test/';
const TYPES = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.pdf': 'application/pdf', '.pptx': 'application/octet-stream', '.svg': 'image/svg+xml', '.png': 'image/png' };
const backend = makeBackend();
const problems = [];

async function setup(page) {
  await page.route('**/*', async route => {
    const url = route.request().url();
    if (url.startsWith('https://script.google.com/')) {
      const body = route.request().postData() || '{}';
      return route.fulfill({ status: 200, contentType: 'application/json', body: backend.post(body) });
    }
    if (url.startsWith(SITE)) {
      let p = decodeURIComponent(new URL(url).pathname).replace(/^\//, '') || 'index.html';
      const f = path.join(ROOT, p);
      if (!fs.existsSync(f)) return route.fulfill({ status: 404, body: 'not found' });
      let data = fs.readFileSync(f);
      if (p === 'index.html') data = Buffer.from(data.toString('utf8').replace(/API_URL:'[^']*'/, `API_URL:'${API}'`));
      return route.fulfill({ status: 200, contentType: TYPES[path.extname(f)] || 'application/octet-stream', body: data });
    }
    return route.fulfill({ status: 200, contentType: 'text/plain', body: '' }); // fonts, external scripts: offline in tests
  });
}

async function check(page, label) {
  await page.waitForTimeout(250);
  const r = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const wide = [...document.querySelectorAll('body *')].filter(el => {
      const b = el.getBoundingClientRect(); if (!b.width) return false;
      if (el.closest('.tablewrap,.deck,pre,.mk-box')) return false;
      return b.right > vw + 1 || b.left < -1;
    }).slice(0, 3).map(el => el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ').join('.') : '') + ' ' + Math.round(el.getBoundingClientRect().right));
    const bad = (document.body.innerText.match(/\bNaN\b|\bundefined\b|\[object Object\]/g) || []);
    return { sw: document.documentElement.scrollWidth, vw, wide, text: document.body.innerText.length, bad };
  });
  if (r.sw > r.vw + 1) problems.push(`${label}: sideways scroll (${r.sw} > ${r.vw}) ${r.wide.join(' | ')}`);
  if (r.bad.length) problems.push(`${label}: shows ${[...new Set(r.bad)].join(', ')}`);
  if (r.text < 200) problems.push(`${label}: page looks empty`);
}

async function run({ name, viewport, scheme, mobile }) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport, colorScheme: scheme, isMobile: !!mobile, hasTouch: !!mobile, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on('pageerror', e => problems.push(`${name}: page error ${e.message}`));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::ERR/.test(m.text())) problems.push(`${name}: console ${m.text()}`); });
  await setup(page);
  const go = async (hash, label) => { await page.goto(SITE + 'index.html#' + hash); await page.waitForTimeout(150); await page.evaluate(h => { if (location.hash !== '#' + h) location.hash = h; }, hash); await page.waitForTimeout(200); await check(page, `${name} ${label || hash}`); };

  // ---- teacher ----
  await page.goto(SITE + 'index.html#teacher');
  await check(page, `${name} teacher login`);
  await page.fill('#tlogin-pass', 'teach123');
  await page.click('#tlogin-btn');
  await page.waitForSelector('#t-new');
  if (!(await page.$('[data-batch]'))) {
    await page.click('#t-new');
    await page.fill('#nb-name', 'Evening Batch');
    await page.fill('#nb-sched', 'Sun & Tue · 6–8 pm');
    await page.click('#nb-save');
    await page.waitForSelector('#t-addstu');
    await page.click('#t-addstu');
    await page.fill('#sf-name', 'Amira Test');
    await page.fill('#sf-email', 'amira@example.com');
    await page.click('#sf-save');
    await page.waitForSelector('#t-share-text');
  }
  await check(page, `${name} teacher portal`);
  const code = await page.$eval('table.roster .codechip', el => el.textContent.trim());
  await page.click('tr[data-stu]');
  await page.waitForSelector('#t-detail');
  await check(page, `${name} student detail`);
  await page.fill('#sm-body', 'Welcome to the course!');
  await page.click('#sm-send');
  await page.waitForTimeout(300);
  for (const h of ['home', 'syllabus', 'mocks', 'templates', 'teacher']) await go(h);
  for (let n = 1; n <= 12; n++) await go('session-' + n);
  await page.click('#signout');
  await page.waitForTimeout(300);

  // ---- student ----
  await go('home', 'login page');
  await page.fill('#login-code', code);
  await page.click('#login-btn');
  await page.waitForSelector('.skills4');
  await check(page, `${name} student dashboard`);
  for (const h of ['syllabus', 'mocks', 'log', 'messages', 'templates']) await go(h);
  for (let n = 1; n <= 12; n++) {
    await go('session-' + n, `session-${n} live`);
    await page.click('#tab-hub');
    await check(page, `${name} session-${n} hub`);
    await page.click('#tab-live');
  }
  await go('messages');
  await page.fill('#s-body', 'Hello Ms. Maria, I have a question about Part 5.');
  await page.click('#s-send');
  await page.waitForTimeout(400);
  await check(page, `${name} message sent`);
  await page.click('#signout');
  await browser.close();
}

(async () => {
  const runs = [
    { name: 'desktop', viewport: { width: 1280, height: 900 }, scheme: 'light' },
    { name: 'phone', viewport: { width: 390, height: 844 }, scheme: 'light', mobile: true },
    { name: 'phone-dark', viewport: { width: 360, height: 780 }, scheme: 'dark', mobile: true },
    { name: 'desktop-dark', viewport: { width: 1440, height: 900 }, scheme: 'dark' }
  ];
  for (const r of runs) await run(r);
  const msgs = backend.sheets.Messages.length - 1;
  console.log(`Backend: ${backend.sheets.Students.length - 1} student(s), ${msgs} message(s)`);
  if (problems.length) { console.log('PROBLEMS:\n' + [...new Set(problems)].join('\n')); process.exit(1); }
  console.log('All routes OK at desktop and phone widths, light and dark.');
})().catch(e => { console.error(e); process.exit(1); });
