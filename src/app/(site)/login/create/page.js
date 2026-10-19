"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateAccount({ accountType = "author" }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/signup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, accountType }),
        }
      );

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data?.message || "Something went wrong");
        return;
      }

      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => router.push(accountType === "buyer" ? "/buyer/login" : "/login"), 1500);
    } catch (err) {
      console.error("Signup error:", err);
      setError("Server error. Please try again later.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-90 flex items-center py-4 justify-center bg-gray-50">
      <div className="flex bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden max-w-4xl w-full">
        {/* Left Section */}
        <div className="hidden md:flex w-1/2 bg-[#19334c] flex-col justify-center items-center text-white p-8">
          <h2 className="text-xl font-semibold mb-4 text-center">
            {accountType === "buyer" ? "Your next great read" : "Start self-publishing for free"}
          </h2>
          <p className="text-center text-sm leading-6">
            {accountType === "buyer" ? "Discover independent authors and keep track of every order." : "Write, design your cover and preview your book for free. Pay a one-time ₹199 fee when you submit for review. Printing, shipping and retail commission are separate."}
          </p>
        </div>

        {/* Right Form */}
        <div className="w-full md:w-1/2 p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{accountType === "buyer" ? "Create a reader account" : "Create your author account"}</h3>
          <p className="mb-6 text-sm leading-6 text-gray-600">{accountType === "buyer" ? "Buy books and follow your orders." : "Free writing, cover and preview tools. Your ₹199 review fee is due only when you submit your book."}</p>

          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md p-2">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className="mt-1 text-dark w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="mt-1 w-full text-dark p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                className="mt-1 w-full text-dark p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="mt-1 w-full text-dark p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-4 text-center text-gray-600">
            Already have an account?{" "}
            <a
              href={accountType === "buyer" ? "/buyer/login" : "/login"}
              className="text-blue-600 font-semibold hover:underline"
            >
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
