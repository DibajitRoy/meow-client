"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import AuthShell from "@/components/AuthShell";
import PasswordInput from "@/components/PasswordInput";

export default function ResetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError("");
    if (!token) return setError("This reset link is invalid or has expired. Request a new one.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("Passwords do not match.");
    setBusy(true);
    const result = await authClient.resetPassword({ newPassword: password, token });
    setBusy(false);
    if (result.error) return setError(result.error.message ?? "Could not reset password");
    router.replace("/login?reset=success");
  }

  return <AuthShell image="/images/login.png" heading="Choose a new password" subheading="Set a password you have not used before.">
    <div><h1 className="text-2xl font-bold text-brand-900">Reset password</h1><p className="text-sm text-gray-500">The reset link is valid for one hour.</p></div>
    <form onSubmit={submit} className="space-y-4">
      <PasswordInput value={password} onChange={setPassword} placeholder="New password (min 8)" />
      <PasswordInput value={confirm} onChange={setConfirm} placeholder="Confirm new password" />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button disabled={busy || !token} className="btn-primary w-full">{busy ? "Saving..." : "Set new password"}</button>
    </form>
    <Link href="/login" className="text-sm font-semibold text-brand-600">Back to login</Link>
  </AuthShell>;
}
