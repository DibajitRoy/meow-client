"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import PageHeader from "@/components/ui/PageHeader";
import Avatar from "@/components/ui/Avatar";

type Profile = { id: string; name: string; email: string; phone?: string | null; image?: string | null };

export default function AccountProfilePage() {
  const { data: session } = authClient.useSession();
  const [loaded, setLoaded] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<{ user: Profile }>("/api/users/me").then(({ user }) => {
      setProfile(user); setName(user.name); setPhone(user.phone ?? "");
    }).catch((e) => setError((e as Error).message)).finally(() => setLoaded(true));
  }, []);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      await api("/api/users/me", { method: "PUT", body: JSON.stringify({ name: name.trim(), phone: phone.trim() }) });
      const { user } = await api<{ user: Profile }>("/api/users/me"); setProfile(user); setMessage("Profile updated.");
    } catch (e) { setError((e as Error).message); }
    setBusy(false);
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault(); setError(""); setMessage("");
    if (newPassword.length < 8) return setError("New password must be at least 8 characters.");
    if (newPassword !== confirmPassword) return setError("New passwords do not match.");
    setBusy(true);
    try {
      const result = await authClient.changePassword({ currentPassword, newPassword, revokeOtherSessions: true });
      if (result.error) throw new Error(result.error.message ?? "Could not change password");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); setMessage("Password changed. Other sessions were signed out.");
    } catch (e) { setError((e as Error).message); }
    setBusy(false);
  }

  if (!loaded) return <p className="text-sm text-gray-500">Loading profile...</p>;
  const current = profile ?? (session ? { id: session.user.id, name: session.user.name, email: session.user.email, image: session.user.image } : null);

  return <>
    <PageHeader title="Account Profile" subtitle="Update your account details and password" />
    {error && <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}
    {message && <p className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}
    <div className="grid max-w-4xl gap-6 lg:grid-cols-2">
      <form onSubmit={saveProfile} className="card space-y-4">
        <h2 className="font-semibold text-brand-900">Personal details</h2>
        <div className="flex items-center gap-3"><Avatar src={session?.user.image || profile?.image || null} name={name || current?.name || "User"} size={56} /><span className="text-sm text-gray-500">Photo from the account you used to sign in</span></div>
        <label className="block text-sm font-medium">Full name<input required minLength={2} maxLength={60} className="input mt-1" value={name} onChange={(e) => setName(e.target.value)} /></label>
        <label className="block text-sm font-medium">Email<input readOnly className="input mt-1 bg-gray-50" value={current?.email ?? ""} /></label>
        <label className="block text-sm font-medium">Phone<input className="input mt-1" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Optional phone number" /></label>
        <button disabled={busy} className="btn-primary">{busy ? "Saving..." : "Save profile"}</button>
      </form>
      <form onSubmit={changePassword} className="card space-y-4">
        <h2 className="font-semibold text-brand-900">Change password</h2>
        <p className="text-sm text-gray-500">Confirm your current password before choosing a new one.</p>
        <label className="block text-sm font-medium">Current password<input required type="password" autoComplete="current-password" className="input mt-1" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} /></label>
        <label className="block text-sm font-medium">New password<input required minLength={8} type="password" autoComplete="new-password" className="input mt-1" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /></label>
        <label className="block text-sm font-medium">Confirm new password<input required minLength={8} type="password" autoComplete="new-password" className="input mt-1" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /></label>
        <button disabled={busy} className="btn-primary">{busy ? "Saving..." : "Change password"}</button>
      </form>
    </div>
  </>;
}
