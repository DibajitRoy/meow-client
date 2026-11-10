"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import AuthShell from "@/components/AuthShell";
import PasswordInput from "@/components/PasswordInput";

const googleEnabled = process.env.NEXT_PUBLIC_GOOGLE_ENABLED === "true";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await authClient.signIn.email({ email, password });
    setLoading(false);
    if (error) return setError(error.message ?? "Login failed");
    router.push("/dashboard");
  }

  async function handleGoogle() {
    await authClient.signIn.social({ provider: "google", callbackURL: "/dashboard" });
  }

  return (
    <AuthShell image="/images/login.png" heading="Welcome back 🐾" subheading="Your cat's favourite people are waiting.">
      <div>
        <h1 className="text-2xl font-bold text-brand-900">Welcome Back!</h1>
        <p className="text-sm text-gray-500">Login to continue</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
        <PasswordInput value={password} onChange={setPassword} />
        <div className="text-right"><Link href="/forgot-password" className="text-xs font-medium text-brand-600 hover:text-brand-700">Forgot password?</Link></div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={loading} className="btn-primary w-full">
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {googleEnabled && <>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="h-px flex-1 bg-brand-100" /> or continue with <span className="h-px flex-1 bg-brand-100" />
        </div>
        <button onClick={handleGoogle} className="btn-outline w-full">
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.5l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" />
            <path fill="#FBBC05" d="M10.5 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.100 0 24s.9 7.600 2.600 10.800l7.900-6.100z" />
            <path fill="#34A853" d="M24 48c6.500 0 11.900-2.100 15.900-5.800l-7.500-5.800c-2.100 1.400-4.800 2.300-8.400 2.300-6.300 0-11.600-4.100-13.500-9.800l-7.900 6.100C6.500 42.600 14.600 48 24 48z" />
          </svg>
          Google
        </button>
      </>}

      <p className="text-sm text-gray-600">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-brand-600">Sign up</Link>
      </p>
    </AuthShell>
  );
}
