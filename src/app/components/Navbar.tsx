"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="bg-white border-b shadow-sm fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo / App Title */}
        <Link href="/" className="text-xl font-bold text-black">
          DocFlow<span className="text-blue-600">AI</span>
        </Link>

        {/* Right Side Buttons */}
        <div className="flex gap-4">
          {status === "loading" ? (
            <span className="text-gray-500">Loading...</span>
          ) : session?.user ? (
            <>
              <span className="text-gray-700 pt-2">
                Hello, <strong>{session.user.name}</strong>
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
