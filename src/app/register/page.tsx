"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Cat, PawPrint } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import AuthShell from "@/components/AuthShell";
import PasswordInput from "@/components/PasswordInput";

const googleEnabled = process.env.NEXT_PUBLIC_GOOGLE_ENABLED === "true";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"owner" | "sitter">("owner");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) return setError("Password must be at least 8 characters");
    if (password !== confirm) return setError("Passwords do not match");
    if (phone && !/^\+?[0-9\s-]{7,15}$/.test(phone)) return setError("Invalid phone number");
    if (!agree) return setError("Please accept the terms to continue");

    setLoading(true);
    const { error } = await authClient.signUp.email({
      name,
      email,
      password,
      role,
      ...(phone ? { phone } : {}),
    });
    setLoading(false);
    if (error) return setError(error.message ?? "Registration failed");
    router.push("/dashboard");
  }

  async function handleGoogle() {
    await authClient.signIn.social({ provider: "google", callbackURL: "/dashboard" });
  }

  const roles = [
    { value: "owner" as const, label: "Cat Owner", text: "I need a cat sitter", icon: Cat },
    { value: "sitter" as const, label: "Cat Sitter", text: "I want to offer care", icon: PawPrint },
  ];

  return (
    <AuthShell image="/images/register.png" heading="Join the Meow family 🐱" subheading="Create an account in less than a minute.">
      <div>
        <h1 className="text-2xl font-bold text-brand-900">Create Your Account</h1>
        <p className="text-sm text-gray-500">Join our cat loving community</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {roles.map((r) => (
            <button
              type="button"
              key={r.value}
              onClick={() => setRole(r.value)}
              className={`rounded-xl border p-3 text-left transition ${
                role === r.value ? "border-brand-500 bg-brand-50 ring-2 ring-brand-200" : "border-brand-200 hover:bg-brand-50"
              }`}
            >
              <r.icon size={20} className="text-brand-500" />
              <p className="mt-1 text-sm font-semibold">{r.label}</p>
              <p className="text-xs text-gray-500">{r.text}</p>
            </button>
          ))}
        </div>

        <input required placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className="input" />
        <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
        <input placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} className="input" />
        <PasswordInput value={password} onChange={setPassword} placeholder="Password (min 8)" />
        <PasswordInput value={confirm} onChange={setConfirm} placeholder="Confirm password" />

        <label className="flex items-start gap-2 text-xs text-gray-600">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 accent-brand-500" />
          I agree to the Terms & Conditions and Privacy Policy
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={loading} className="btn-primary w-full">
          {loading ? "Creating..." : "Create Account"}
        </button>
      </form>

      {googleEnabled && <button onClick={handleGoogle} className="btn-outline w-full">Sign up with Google</button>}

      <p className="text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand-600">Login</Link>
      </p>
    </AuthShell>
  );
}
