import { test } from 'node:test';
import assert from 'node:assert/strict';
import { submitReview, publicationErrorNotice } from '../src/utils/reviewSubmission.mjs';

const options = { apiBase: 'https://test.invalid/api', bookId: 1, headers: { Authorization: 'Bearer synthetic-test-token' }, message: 'Review note' };

test('a lost response after commit checks status and continues without another submission or save', async () => {
  let saves = 0, posts = 0;
  const request = async (url, init) => {
    if (init.method === 'POST') { posts++; throw new TypeError('Network response lost'); }
    assert.match(url, /review-status$/);
    return Response.json({ status: 'PAYMENT_PENDING', review: { id: 8 } });
  };
  await submitReview({ ...options, saveDraft: async () => { saves++; }, request });
  assert.equal(saves, 1); assert.equal(posts, 1);
  await submitReview({ ...options, saveDraft: async () => { saves++; }, request, recoverFirst: true });
  assert.equal(saves, 1); assert.equal(posts, 1);
});

test('a rolled-back timeout preserves a saved form and retry checks status before resubmitting', async () => {
  let saves = 0, posts = 0;
  const calls = [];
  const request = async (url, init) => {
    if (init.method === 'POST') {
      calls.push('submit'); posts++;
      return posts === 1 ? Response.json({ message: 'Private Prisma stack', code: 'SUBMISSION_UNAVAILABLE' }, { status: 503 }) : Response.json({ book: { status: 'PAYMENT_PENDING' } }, { status: 201 });
    }
    calls.push('status'); return Response.json({ status: 'DRAFT', review: null });
  };
  const saveDraft = async () => { calls.push('save'); saves++; };
  let error;
  try { await submitReview({ ...options, request, saveDraft }); } catch (failure) { error = failure; }
  const notice = publicationErrorNotice(error);
  assert.equal(notice.retry, true); assert.match(notice.title, /draft is saved/);
  assert.doesNotMatch(JSON.stringify(notice), /Prisma|Private|500/);
  await submitReview({ ...options, request, saveDraft, recoverFirst: true });
  assert.deepEqual(calls, ['save', 'submit', 'status', 'status', 'save', 'submit']);
  assert.equal(saves, 2); assert.equal(posts, 2);
});

test('a failed recovery status check sends no save or submit and keeps recovery available', async () => {
  let saves = 0;
  await assert.rejects(submitReview({ ...options, recoverFirst: true, saveDraft: async () => { saves++; }, request: async (_url, init) => {
    assert.equal(init.method, undefined); throw new TypeError('Offline');
  } }), error => {
    assert.equal(error.phase, 'check'); assert.equal(publicationErrorNotice(error).retry, true); return true;
  });
  assert.equal(saves, 0);
});

test('an unsaved draft never submits or claims it was saved', async () => {
  await assert.rejects(submitReview({ ...options, saveDraft: async () => { throw new TypeError('Offline'); }, request: async () => { assert.fail('Must not submit an unsaved draft'); } }), error => {
    const notice = publicationErrorNotice(error);
    assert.equal(error.phase, 'save'); assert.match(notice.title, /couldn’t be saved/); return true;
  });
});

test('missing publication details stay actionable and session errors are clearly explained', async () => {
  await assert.rejects(submitReview({ ...options, saveDraft: async () => {}, request: async () => Response.json({ issues: ['Design or upload a front cover'] }, { status: 422 }) }), error => {
    const notice = publicationErrorNotice(error);
    assert.deepEqual(notice.issues, ['Design or upload a front cover']); assert.equal(notice.retry, undefined); return true;
  });
  assert.match(publicationErrorNotice({ status: 401 }).title, /sign in again/);
});
