"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-white border-b shadow-sm fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo / App Title */}
        <Link href="/" className="text-xl font-bold text-black">
          DocFlow<span className="text-blue-600">AI</span>
        </Link>

        {/* Right Side Buttons */}
        <div className="flex gap-4">
          <Link
            href="/signup"
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Sign Up
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 rounded-md border border-blue-600 text-blue-600 hover:bg-blue-50 transition"
          >
            Log In
          </Link>
        </div>
      </div>
    </nav>
  );
}
