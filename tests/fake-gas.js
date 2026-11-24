// A small in-memory stand-in for the Google Apps Script services that apps-script/Code.gs uses.
// It loads the real Code.gs, so the Playwright tests exercise the real backend logic.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function makeBackend(opts = {}) {
  const sheets = {};
  const props = Object.assign({ TEACHER_PASSWORD: 'teach123' }, opts.props || {});
  const mail = [];
  const files = [];
  const sheetApi = name => {
    const rows = sheets[name];
    return {
      getDataRange: () => ({ getValues: () => rows.map(r => r.slice()) }),
      getRange: (r, c, nr, nc) => ({
        setValue: v => { rows[r - 1][c - 1] = v; },
        setValues: vals => { vals[0].forEach((v, j) => { rows[r - 1][c - 1 + j] = v; }); },
        setNumberFormat: () => {}
      }),
      appendRow: vals => { rows.push(vals.slice()); },
      deleteRow: r => { rows.splice(r - 1, 1); },
      setFrozenRows: () => {}
    };
  };
  const ss = {
    getSheetByName: n => (sheets[n] ? sheetApi(n) : null),
    insertSheet: n => { sheets[n] = []; return sheetApi(n); }
  };
  const folder = name => ({
    name,
    getFoldersByName: n => ({ hasNext: () => true, next: () => folder(n) }),
    createFolder: n => folder(n),
    createFile: blob => { files.push(blob); return { getUrl: () => 'https://drive.google.com/file/d/FAKE' + files.length, getId: () => 'FAKE' + files.length }; }
  });
  const ctx = {
    console,
    SpreadsheetApp: { getActiveSpreadsheet: () => ss, getUi: () => ({}) },
    PropertiesService: { getScriptProperties: () => ({ getProperty: k => (k in props ? props[k] : null), setProperty: (k, v) => { props[k] = String(v); }, deleteProperty: k => { delete props[k]; } }) },
    LockService: { getScriptLock: () => ({ waitLock: () => {}, releaseLock: () => {} }) },
    ContentService: { MimeType: { JSON: 'json' }, createTextOutput: t => ({ text: t, setMimeType() { return this; } }) },
    Utilities: {
      getUuid: () => require('crypto').randomUUID(),
      formatDate: (d) => new Date(d).toISOString().slice(0, 16).replace('T', ' '),
      base64Decode: s => Buffer.from(s, 'base64'),
      newBlob: (data, type, name) => ({ data, type, name })
    },
    Session: { getScriptTimeZone: () => 'UTC', getEffectiveUser: () => ({ getEmail: () => 'teacher@example.com' }) },
    MailApp: { sendEmail: m => { mail.push(m); }, getRemainingDailyQuota: () => 100 },
    DriveApp: { getRootFolder: () => folder('root') },
    UrlFetchApp: { fetch: () => { throw new Error('no network in tests'); } }
  };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'apps-script', 'Code.gs'), 'utf8'), ctx);
  vm.runInContext('setup()', ctx);
  return {
    sheets, props, mail, files,
    post(body) { const out = ctx.doPost({ postData: { contents: body } }); return out.text; }
  };
}
module.exports = { makeBackend };
