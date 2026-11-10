"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import AuthShell from "@/components/AuthShell";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    const result = await authClient.requestPasswordReset({ email, redirectTo: `${window.location.origin}/reset-password` });
    setBusy(false);
    if (result.error) return setError(result.error.message ?? "Could not request a reset link");
    setSent(true);
  }

  return <AuthShell image="/images/login.png" heading="Reset your password" subheading="We will send a secure reset link if the account exists.">
    <div><h1 className="text-2xl font-bold text-brand-900">Forgot password?</h1><p className="text-sm text-gray-500">Enter the email address on your account.</p></div>
    {sent ? <div role="status" className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">If an account uses that email, a password reset link has been sent. Check your inbox.</div> : <form onSubmit={submit} className="space-y-4">
      <label className="block text-sm font-medium">Email<input required type="email" autoComplete="email" className="input mt-1" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button disabled={busy} className="btn-primary w-full">{busy ? "Sending..." : "Send reset link"}</button>
    </form>}
    <Link href="/login" className="text-sm font-semibold text-brand-600">Back to login</Link>
  </AuthShell>;
}
