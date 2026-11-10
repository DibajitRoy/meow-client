"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";
import { authClient } from "@/lib/auth-client";

const links = [
  { href: "/", label: "Home" },
  { href: "/sitters", label: "Find Sitters" },
  { href: "/#how", label: "How it Works" },
  { href: "/#services", label: "Services" },
];

export default function Navbar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { data: session } = authClient.useSession();

  async function logout() {
    await authClient.signOut();
    router.replace("/");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-brand-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" aria-label="Meow home">
          <Logo className="h-12" />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm font-medium text-gray-600 hover:text-brand-600">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {session ? (
            <>
              <Link href="/dashboard" className="btn-primary">Dashboard</Link>
              <button onClick={logout} className="btn-ghost">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost">Login</Link>
              <Link href="/register" className="btn-primary">Sign Up</Link>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="space-y-1 border-t border-brand-100 bg-white px-4 py-3 md:hidden">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-brand-50">
              {l.label}
            </Link>
          ))}
          <div className="flex gap-2 pt-2">
            {session ? (
              <>
                <Link href="/dashboard" className="btn-primary flex-1">Dashboard</Link>
                <button onClick={logout} className="btn-outline flex-1">Logout</button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-outline flex-1">Login</Link>
                <Link href="/register" className="btn-primary flex-1">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
