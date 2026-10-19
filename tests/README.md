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
