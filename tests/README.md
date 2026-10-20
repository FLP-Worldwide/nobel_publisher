# Pagination regression

Run `node tests/build-pagination-check.mjs` from the frontend directory, start the local app, and open `/canvas-regression.html`. The generated page exercises the real pagination and typography modules in a browser using all five presets and both 5 × 8 and 6 × 9 trim sizes.

Checks cover text retention, page capacity, bold/italic/underline retention, line breaks, nested manual breaks, and long Hindi tokens. Hindi regressions also cover clipboard Unicode preservation, source-font span cleanup, intentional ZWJ/ZWNJ, formatted syllables crossing DOM nodes, Hindi language codes, and bundled-font loading. Read `#results` for JSON results. Delete the generated `public/canvas-regression.html` before shipping; it contains synthetic text only.

API workflow evidence and browser screenshots are stored in the workspace's `.audit/evidence` directory.

# Authentication regression

Run `npm run test:auth`. The checks compile the real middleware with Next's SWC
compiler and use signed synthetic sessions, with no production accounts or API
calls. They cover HTTPS session detection when `NEXTAUTH_URL` has no scheme,
chunked cookies, login redirects, reader/admin route permissions, invalid
sessions, HTTP development, and rejection of non-secure cookies on HTTPS.

# Continuous chapter writing check

Use a long chapter in the manuscript editor. The writing area should be one continuous vertical document with one chapter heading, without page counters, columns, canvas zoom or horizontal page navigation. Edit in the middle and at the end: Enter adds a paragraph, Shift+Enter adds a line break, and the caret/scroll should stay near the edited text through React state updates. Check bold/undo and the Hindi paste modes. A print-break marker should only appear as a divider while writing; Book Preview must still paginate the chapter and retain all text. Save-before-preview remains part of the real manuscript route.

The 19 October local browser check used a disposable 90-paragraph Hindi chapter in the actual EditorArea and BookPreview components. Enter kept the bottom scroll position (5518 → 5556.5 px), horizontal overflow was absent, and the same chapter produced 18 preview pages with one chapter heading. Temporary routes and generated HTML were removed before the production build.

# Chapter creation recovery

Check with a book containing more than ten chapters. Adding after a selected chapter must preserve the chapter order and existing text. Repeated clicks while adding are disabled. Simulate a response lost after the server commits: Try again must send the same Idempotency-Key, show exactly one new chapter, and preserve the current editor on failure. A failed follow-up list request must not turn successful creation into a failure. If the author types while addition is pending, leave the current draft open and offer the new chapter in the list.

The 19 October disposable local browser fixture exercised the real manuscript page with a simulated lost response, starting with ten chapters. The second POST reused the first key and returned the one created chapter. The fixture was removed before the production build. Server regressions run with npm run test:commerce in the API project.

# Review submission recovery

Run `node --test tests/review-submission.test.mjs`. The isolated workflow checks cover a response lost after commit, rollback followed by retry, failed status recovery, a failed draft save, missing details and expired sessions. No production accounts, payments or books are used. After an uncertain submission, status is checked before saving again so an already locked edition continues to its existing review/payment screen. Save-draft recovery must only save the draft; submission recovery may submit after checking status.

The API's `npm run test:commerce` also covers a 40-chapter Hindi review snapshot, unchanged-snapshot guards, reuse of an existing submission, and full rollback on an injected transaction timeout.
