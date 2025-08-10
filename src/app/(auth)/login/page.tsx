"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
    });

    if (result?.error) {
      setError("Invalid email or password");
    } else if (result?.ok) {
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">Welcome Back</h2>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            className="w-full mt-1 p-2 border rounded-md text-gray-900 placeholder:text-gray-400"
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full mt-1 p-2 border rounded-md text-gray-900 placeholder:text-gray-400"
            onChange={handleChange}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            Log In
          </button>
        </form>

        <p className="text-sm text-center text-gray-600 mt-4">
          Don’t have an account?{" "}
          <Link href="/signup" className="text-blue-600 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}


