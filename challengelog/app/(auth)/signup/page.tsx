"use client"

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const HanldeGoogleAuth = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      signIn("google", { callbackUrl: "/dashboard" });
  }

  const handleCredentialsAuth = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setLoading(true);
      setError("");

      try {
          const res = await fetch("/api/auth/register", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name, email, password }),
          });

          if (res.ok) {
              const signInRes = await signIn("credentials", {
                  email,
                  password,
                  redirect: false,
              });
              if (signInRes?.error) {
                  setError("Registration successful, but login failed.");
              } else {
                  router.push("/dashboard");
              }
          } else {
              const data = await res.json();
              setError(data.message || "Something went wrong.");
          }
      } catch (err: any) {
          setError("Something went wrong.");
      } finally {
          setLoading(false);
      }
  }
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-10">

        {/* Logo */}
        {/* <div className="flex items-center gap-2 mb-8">
          <div className="w-7 h-7 bg-zinc-900 dark:bg-white rounded-md flex items-center justify-center">
            <span className="text-white dark:text-zinc-900 text-xs font-bold">CL</span>
          </div>
          <span className="text-sm font-medium text-zinc-900 dark:text-white">ChangeLog</span>
        </div> */}

        {/* Heading */}
        <h1 className="text-2xl font-medium text-zinc-900 dark:text-white mb-1">Welcome Signup page</h1>
        <p className="text-sm text-zinc-500 mb-8">Sign in to your account to continue</p>

        {/* Form */}
        <form className="flex flex-col gap-4" onSubmit={handleCredentialsAuth}>
          {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">Username</label>
            <input
              type="text"
              placeholder="sh....."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
            />
        </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">Email</label>
            <input
              type="email"
              placeholder="you@studio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-medium text-zinc-500">Password</label>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
            />
          </div>

          <button type="submit" disabled={loading} className="w-full mt-1 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading ? "Signing up..." : "Sign up"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
          <span className="text-xs text-zinc-400">or</span>
          <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
        </div>

        {/* Google */}
        <button className="w-full flex items-center justify-center gap-2.5 py-2.5 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors" onClick={HanldeGoogleAuth}> 
          {/* paste Google SVG icon here */}
          Continue with Google
        </button>

        {/* Sign up link */}
        <p className="text-center text-sm text-zinc-500 mt-6">
          Don't have an account?{" "}
          <a href="/signin" className="text-zinc-900 dark:text-white font-medium hover:underline">Sign In</a>
        </p>

      </div>
    </div>
  );
}