"use client";

import React, { Suspense, useState } from "react";
import { getSession, signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { loginDestination } from "@/utils/loginRedirect";

function LoginForm({ accountType = "author" }) {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false); // optional, see note below
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
  
    const res = await signIn("credentials", {
      email,
      password,
      accountType,
      redirect: false,
    });
  
    setLoading(false);
  
    if (res?.ok) {
      let loggedInSession = null;
      try {
        // ✅ get accessToken after login
        loggedInSession = await getSession();
        const accessToken = loggedInSession?.user?.accessToken;
  
        // ✅ load guest cart
        const guestCart = JSON.parse(localStorage.getItem("guest_cart") || "[]");
  
        if (guestCart.length > 0 && accessToken) {
          for (const item of guestCart) {
            const { bookId, qty } = item;
  
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/items`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify({ bookId, qty }),
            });
          }
  
          // ✅ clear only after syncing
          localStorage.removeItem("guest_cart");
        }
      } catch (err) {
        console.error("Cart sync error:", err);
      }
  
      // remember me
      if (remember) localStorage.setItem("rememberMe", "1");
      else localStorage.removeItem("rememberMe");
  
      const callbackUrl = searchParams.get("callbackUrl");
      const destination = loginDestination(loggedInSession?.user?.role, callbackUrl);
      // Refresh the document so a prefetched unauthenticated redirect is not reused.
      window.location.assign(destination);
    } else {
      setError(res?.error || "Invalid email or password.");
    }
  }


  
  return (
    <div className="min-h-[65vh] flex items-center justify-center px-4 py-10 bg-[#f1f4f6]">
      <div className="flex bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden max-w-4xl w-full">
        {/* Left Image / Text Section */}
        <div className="hidden md:flex w-1/2 bg-[#19334c] flex-col justify-center items-center text-white p-8">
          <h2 className="text-xl font-semibold mb-4 text-center">
            {accountType === "buyer" ? "Your reading journey" : "Your book starts here"}
          </h2>
          <p className="text-sm text-center text-blue-50">
            {accountType === "buyer" ? "Browse independent books and track your orders in your reader account." : "Write privately, preview every page, and pay a one-time ₹199 fee for editorial review. Set your price and publish after approval."}
          </p>
        </div>

        {/* Right Form Section */}
        <div className="w-full md:w-1/2 p-8">
          <h2 className="text-xl font-semibold text-blue-700 mb-6">{accountType === "buyer" ? "Reader sign in" : "Author sign in"}</h2>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <p className="mb-5 text-sm text-stone-500">{accountType === "buyer" ? "Here to publish?" : "Here to buy books?"} <a className="font-semibold text-[#244d43] underline" href={`${accountType === "buyer" ? "/login" : "/buyer/login"}${searchParams.get("callbackUrl") ? `?callbackUrl=${encodeURIComponent(searchParams.get("callbackUrl"))}` : ""}`}>{accountType === "buyer" ? "Author sign in" : "Reader sign in"}</a></p>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">
                Your email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-dark p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="name@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">
                Your password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-dark p-2.5 pr-12 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute inset-y-0 right-2 my-1 px-2 text-sm text-gray-600 hover:text-gray-900"
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 border border-gray-300 rounded"
              />
              <label htmlFor="remember" className="ml-2 text-sm font-medium text-gray-900">
                Remember me
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#19334c] hover:bg-blue-600 disabled:opacity-70 disabled:cursor-not-allowed text-white font-medium rounded-lg text-sm px-5 py-2.5"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <p className="text-sm text-gray-600 mt-4">
              Don’t have an account?{" "}
              <a href={accountType === "buyer" ? "/buyer/signup" : "/login/create"} className="text-blue-500 font-medium hover:underline">
                Sign up here
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function Login({ accountType = "author" }) {
  return (
    <Suspense fallback={<div className="min-h-90 bg-gray-50 py-16 text-center text-sm text-gray-600">Opening sign in…</div>}>
      <LoginForm accountType={accountType} />
    </Suspense>
  );
}
