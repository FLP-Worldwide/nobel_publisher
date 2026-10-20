export async function readPublicationResponse(response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw Object.assign(new Error('Publication request could not be completed'), {
      status: response.status, code: body.code,
      issues: response.status === 422 && Array.isArray(body.issues) ? body.issues.filter(item => typeof item === 'string') : [],
    });
  }
  return body;
}

function confirmedSubmission(result) {
  return Boolean(result?.review && ['PAYMENT_PENDING', 'IN_REVIEW', 'APPROVED', 'PUBLISHED', 'REJECTED'].includes(result.status));
}

// A response can be lost after the server commits. Check before saving again:
// the submitted draft will be locked, and its existing payment must be reused.
export async function submitReview({ apiBase, bookId, headers, message, saveDraft, recoverFirst = false, request = fetch }) {
  const check = async () => readPublicationResponse(await request(`${apiBase}/books/${bookId}/review-status`, { headers, cache: 'no-store' }));
  if (recoverFirst) {
    try { if (confirmedSubmission(await check())) return; }
    catch (error) { throw Object.assign(error, { phase: 'check', retryable: true }); }
  }
  try { await saveDraft(); }
  catch (error) { throw Object.assign(error, { phase: 'save' }); }
  try {
    return await readPublicationResponse(await request(`${apiBase}/books/${bookId}/submit-review`, {
      method: 'POST', headers, body: JSON.stringify({ message: message.trim() || undefined }),
    }));
  } catch (error) {
    if (!error.status || error.status >= 500 || error.status === 409) {
      try { if (confirmedSubmission(await check())) return; } catch { /* Keep the saved form open for recovery. */ }
    }
    throw Object.assign(error, { phase: 'submit', retryable: !error.status || error.status >= 500 });
  }
}

export function publicationErrorNotice(error) {
  if (error.status === 401) return { type: 'error', title: 'Please sign in again', text: 'Your session has ended. Keep this page open and sign in in another tab before trying again.' };
  if (error.status === 403) return { type: 'error', title: 'This book needs its author’s account', text: 'Sign in with the account that owns this book to continue.' };
  if (error.status === 404) return { type: 'error', title: 'We couldn’t find this book', text: 'Return to your author dashboard and open the book again.' };
  if (error.issues?.length) return { type: 'error', title: 'A few details need your attention', text: 'Complete the following items, then submit again.', issues: error.issues };
  if (error.status === 409) return { type: 'error', title: 'Your book has changed', text: 'Check the latest book details and review status before submitting again.', statusLink: true };
  if (error.phase === 'check') return { type: 'error', title: 'We’re checking your submission', text: 'We couldn’t confirm the review status yet. Your details are still here. Try again in a moment.', retry: true };
  if (error.phase === 'submit') return { type: 'error', title: 'Your draft is saved. Let’s check the submission.', text: 'We couldn’t confirm that your book reached review. Try again to check its status and continue safely.', retry: error.retryable };
  return { type: 'error', title: 'Your draft couldn’t be saved yet', text: 'Your details are still on this page. Check your connection and try again.', retry: true };
}
