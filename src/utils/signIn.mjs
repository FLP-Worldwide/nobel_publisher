const messages = {
  CredentialsSignin: "The email or password is incorrect. Please check and try again.",
  SignInUnavailable: "Sign-in is temporarily unavailable. Please try again in a few minutes.",
  SignInRateLimited: "Too many sign-in attempts. Please wait a few minutes and try again.",
  SignInAdminOnly: "Use Admin sign in for this account.",
  SignInAuthorOnly: "Use Author sign in for this account.",
  SignInReaderOnly: "Use Reader sign in for this account.",
  SignInAccountType: "Use the sign-in page for your account type.",
};

// Only display our own messages, never an upstream response or exception.
export function signInMessage(code) {
  return messages[code] || messages.SignInUnavailable;
}

export async function authorizeCredentials(credentials, {
  apiUrl, fetchImpl = fetch, timeoutMs = 15000,
} = {}) {
  const accountType = credentials?.accountType || "author";
  if (!["admin", "author", "buyer"].includes(accountType)) {
    throw new Error("SignInAccountType");
  }
  if (!credentials?.email || !credentials?.password) throw new Error("CredentialsSignin");
  if (!apiUrl?.trim()) throw new Error("SignInUnavailable");
  const endpoint = accountType === "admin" ? "/auth/admin/login" : "/auth/login";
  let res, data;
  try {
    res = await fetchImpl(`${apiUrl.trim().replace(/\/+$/, "")}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs),
      body: JSON.stringify({
        email: credentials.email, password: credentials.password, accountType,
      }),
    });
    // Hosting failures can return plain text or HTML, even with a JSON header.
    data = await res.json().catch(() => null);
  } catch {
    throw new Error("SignInUnavailable");
  }
  if (res.status === 429) throw new Error("SignInRateLimited");
  if (res.status === 401) throw new Error("CredentialsSignin");
  if (res.status === 403) {
    const roleMessages = {
      "Use Admin sign in for this account": "SignInAdminOnly",
      "This sign in is for administrators only": "SignInAdminOnly",
      "Use Author sign in for this account": "SignInAuthorOnly",
      "Use Reader sign in for this account": "SignInReaderOnly",
    };
    throw new Error(roleMessages[data?.message] || "SignInAccountType");
  }
  if (!res.ok || !data?.user?.id || typeof data?.token !== "string" || !data.token.trim()) {
    throw new Error("SignInUnavailable");
  }
  if (data.user.role !== accountType) throw new Error("SignInAccountType");
  return {
    id: data.user.id, name: data.user.name, email: data.user.email,
    role: data.user.role, token: data.token,
  };
}
