// Backend checks against the real Code.gs (in memory): ratings, mock removal, progress sync.
const assert = require('assert');
const { makeBackend } = require('./fake-gas');
const b = makeBackend();
const call = o => JSON.parse(b.post(JSON.stringify(o)));
const T = o => call(Object.assign({ pass: 'teach123' }, o));
assert.equal(call({ action: 'teacher.login', pass: 'wrong' }).error, 'bad_password');
const bt = T({ action: 'teacher.batch.save', batch: { name: 'B1' } }).batch;
T({ action: 'teacher.student.save', student: { code: 'TOE-TEST1', name: 'Sam Lee', batch: bt.id } });
const code = 'TOE-TEST1';
// progress with a mock attempt
const old = Date.now() - 1000;
call({ action: 'student.save', code, progress: { res: { 'mock:M1L': { score: 70, total: 100, at: old }, '2:L1': { score: 3, total: 4, at: old } }, log: [{ id: old, session: 'Mock 1', item: 'x' }], updatedAt: old } });
// TOEIC ratings: out-of-range values are dropped
const r = T({ action: 'teacher.mockscore', code, mock: '1', data: { S: { 1: { pr: 3, it: 2 }, 3: { sc: 3 }, 11: { sc: 5 }, 4: { sc: 7 } }, W: { 1: { sc: 3 }, 6: { sc: 4 }, 8: { sc: 5 }, 2: { sc: 4 } }, note: 'Good work' } });
assert.deepEqual(r.mockScores['1'].S['1'], { pr: 3, it: 2 });
assert.deepEqual(r.mockScores['1'].S['11'], { sc: 5 });
assert.deepEqual(r.mockScores['1'].S['4'], {});      // 7 is above 3
assert.deepEqual(r.mockScores['1'].W['2'], {});      // picture sentences max 3
assert.deepEqual(r.mockScores['1'].W['6'], { sc: 4 });
// remove the mock attempt: it stays removed even if the old copy is uploaded again
const rs = T({ action: 'teacher.mockreset', code, mock: '1' });
assert.ok(!rs.progress.res['mock:M1L'] && rs.progress.res['2:L1'] && !rs.mockScores['1']);
call({ action: 'student.save', code, progress: { res: { 'mock:M1L': { score: 70, total: 100, at: old }, '2:L1': { score: 3, total: 4, at: old } }, log: [{ id: old, session: 'Mock 1', item: 'x' }], updatedAt: Date.now() } });
const login = call({ action: 'student.login', code });
assert.ok(!login.progress.res['mock:M1L'], 'removed mock came back');
assert.equal(login.progress.log.length, 0);
assert.equal(login.student.name, 'Sam Lee');
// AI scoring is off without a key in Script Properties
assert.equal(call({ action: 'student.score', code, text: 'word '.repeat(40), task: { type: 'email' } }).error, 'ai_off');
console.log('Backend checks passed.');
