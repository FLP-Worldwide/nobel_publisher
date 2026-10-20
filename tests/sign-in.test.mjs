import assert from "node:assert/strict";
import { test } from "node:test";
import { authorizeCredentials, signInMessage } from "../src/utils/signIn.mjs";

const credentials = { email: "author@example.test", password: "test-only", accountType: "author" };
const options = { apiUrl: "https://api.example.test/api/" };
const authorize = (response) => authorizeCredentials(credentials, {
  ...options, fetchImpl: async () => response,
});

test("hosting text, HTML, empty and malformed JSON errors never reach the user", async () => {
  for (const body of ["A server error has occurred", "<html>Bad gateway</html>", "", "{"]) {
    await assert.rejects(authorize(new Response(body, { status: 500 })), { message: "SignInUnavailable" });
  }
  await assert.rejects(authorize(new Response("not JSON", { status: 200 })), { message: "SignInUnavailable" });
  await assert.rejects(authorize(Response.json({ message: "private database details" }, { status: 503 })),
    { message: "SignInUnavailable" });
});

test("invalid credentials and throttling remain distinct from a server outage", async () => {
  await assert.rejects(authorize(Response.json({ message: "Invalid credentials" }, { status: 401 })),
    { message: "CredentialsSignin" });
  await assert.rejects(authorize(new Response("", { status: 429 })), { message: "SignInRateLimited" });
});

test("network failures and timeouts become recoverable sign-in errors", async () => {
  for (const error of [new TypeError("fetch failed"), new DOMException("Timed out", "TimeoutError")]) {
    await assert.rejects(authorizeCredentials(credentials, { ...options, fetchImpl: async () => { throw error; } }),
      { message: "SignInUnavailable" });
  }
});

test("known role messages guide the user without echoing arbitrary backend messages", async () => {
  for (const [message, code] of [
    ["Use Admin sign in for this account", "SignInAdminOnly"],
    ["Use Author sign in for this account", "SignInAuthorOnly"],
    ["Use Reader sign in for this account", "SignInReaderOnly"],
    ["private backend exception", "SignInAccountType"],
  ]) {
    await assert.rejects(authorize(Response.json({ message }, { status: 403 })), { message: code });
  }
});

test("all roles use the correct endpoint and require a complete, role-matched session", async () => {
  for (const role of ["author", "buyer", "admin"]) {
    const result = await authorizeCredentials({ ...credentials, accountType: role }, {
      ...options, fetchImpl: async (url, init) => {
        assert.equal(url, `https://api.example.test/api/auth/${role === "admin" ? "admin/" : ""}login`);
        assert.equal(JSON.parse(init.body).accountType, role);
        assert.equal(init.cache, "no-store");
        assert.ok(init.signal instanceof AbortSignal);
        return Response.json({ user: { id: 7, name: "Test", email: credentials.email, role }, token: "test-token" });
      },
    });
    assert.equal(result.role, role);
    assert.equal(result.token, "test-token");
  }
  await assert.rejects(authorize(Response.json({ user: { id: 7, role: "author" } })), { message: "SignInUnavailable" });
  await assert.rejects(authorize(Response.json({ user: { id: 7, role: "admin" }, token: "test-token" })),
    { message: "SignInAccountType" });
});

test("missing configuration makes no request and unknown UI errors are never displayed raw", async () => {
  await assert.rejects(authorizeCredentials(credentials, { fetchImpl: () => assert.fail("must not fetch") }),
    { message: "SignInUnavailable" });
  for (const code of [undefined, "Unexpected token 'A'", "https://private.example.test", "Configuration"]) {
    assert.equal(signInMessage(code), signInMessage("SignInUnavailable"));
  }
  assert.match(signInMessage("CredentialsSignin"), /email or password/);
});
