import React from "react";

export default function Login() {
  return (
    <div className="min-h-90 flex items-center justify-center py-4 bg-gray-50">
      <div className="flex bg-white shadow-lg rounded-lg overflow-hidden max-w-4xl w-full">
        
        {/* Left Image / Text Section */}
        <div className="w-1/2 bg-blue-400 flex flex-col justify-center items-center text-white p-8">
          <h2 className="text-2xl font-bold mb-4 text-center">
            Join the fastest growing publishing platform in the world
          </h2>
          <p className="text-sm italic text-center">
            "An Excellent and Dedicated Team with an established presence in the publishing industry."
          </p>
          <p className="mt-2 text-sm font-semibold">- Vivek Sreedhar</p>
        </div>

        {/* Right Form Section */}
        <div className="w-1/2 p-8">
          <h2 className="text-2xl font-bold text-blue-700 mb-6">Login</h2>
          <form className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Your email
              </label>
              <input
                type="email"
                id="email"
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="name@example.com"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Your password
              </label>
              <input
                type="password"
                id="password"
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                className="w-4 h-4 border border-gray-300 rounded"
              />
              <label
                htmlFor="remember"
                className="ml-2 text-sm font-medium text-gray-900"
              >
                Remember me
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg text-sm px-5 py-2.5"
            >
              Login
            </button>

            <p className="text-sm text-gray-600 mt-4">
              Don’t have an account?{" "}
              <a href="/login/create" className="text-blue-500 font-medium hover:underline">
                Sign up here
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
