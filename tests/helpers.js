// Shared test helpers: serve the site from disk, route the Apps Script URL to the in-memory backend,
// and replace browser speech with a fast stand-in so listening sets can be played through.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const API = 'https://script.google.com/macros/s/TEST/exec';
const SITE = 'http://toeic.test/';
const TYPES = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.pdf': 'application/pdf', '.svg': 'image/svg+xml', '.png': 'image/png' };

async function serve(page, backend) {
  await page.route('**/*', async route => {
    const url = route.request().url();
    if (url.startsWith('https://script.google.com/')) return route.fulfill({ status: 200, contentType: 'application/json', body: backend.post(route.request().postData() || '{}') });
    if (url.startsWith(SITE)) {
      const p = decodeURIComponent(new URL(url).pathname).replace(/^\//, '') || 'index.html';
      const f = path.join(ROOT, p);
      if (!fs.existsSync(f)) return route.fulfill({ status: 404, body: 'not found' });
      let data = fs.readFileSync(f);
      if (p === 'index.html') data = Buffer.from(data.toString('utf8').replace(/API_URL:'[^']*'/, `API_URL:'${API}'`));
      return route.fulfill({ status: 200, contentType: TYPES[path.extname(f)] || 'application/octet-stream', body: data });
    }
    return route.fulfill({ status: 200, contentType: 'text/plain', body: '' });
  });
}

// runs in the page before the app: fast timers and a speech stand-in that records what is spoken
function FAKE_SPEECH() {
  window.__TOEIC_FAST = true;
  window.__spoken = [];
  const voices = [{ name: 'Test Samantha', lang: 'en-US' }, { name: 'Test Daniel', lang: 'en-GB' }, { name: 'Test Karen', lang: 'en-AU' }, { name: 'Test Alex', lang: 'en-US' }];
  const fake = { paused: false, speak(u) { window.__spoken.push(u.text); setTimeout(() => u.onend && u.onend(), 5); }, cancel() {}, resume() {}, getVoices: () => voices, addEventListener() {} };
  Object.defineProperty(window, 'speechSynthesis', { value: fake, configurable: true, writable: true });
  window.SpeechSynthesisUtterance = function (t) { this.text = t; };
}

async function signInStudent(page, backend, code = 'TOE-TEST1') {
  if (!backend.sheets.Students.some(r => r[0] === code)) backend.post(JSON.stringify({ action: 'teacher.student.save', pass: 'teach123', student: { code, name: 'Test Student' } }));
  await page.goto(SITE + 'index.html#home');
  await page.fill('#login-code', code);
  await page.click('#login-btn');
  await page.waitForSelector('.skills4');
}

module.exports = { serve, FAKE_SPEECH, signInStudent, SITE, ROOT };
