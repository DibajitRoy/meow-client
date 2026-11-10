"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  LayoutDashboard, Cat, Search, CalendarCheck, Star, User, Inbox, Bell,
  CalendarDays, Users, ShieldCheck, LogOut, Menu, X, Home, ChevronDown, type LucideIcon,
} from "lucide-react";
import Logo from "@/components/Logo";
import { authClient } from "@/lib/auth-client";

type Item = { href: string; label: string; icon: LucideIcon; exact?: boolean };

const NAV: Record<string, Item[]> = {
  owner: [
    { href: "/dashboard/owner", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/dashboard/owner/cats", label: "My Cats", icon: Cat },
    { href: "/sitters", label: "Find Sitters", icon: Search },
    { href: "/dashboard/owner/bookings", label: "My Bookings", icon: CalendarCheck },
    { href: "/dashboard/owner/reviews", label: "Reviews", icon: Star },
    { href: "/dashboard/profile", label: "Profile", icon: User },
    { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  ],
  sitter: [
    { href: "/dashboard/sitter", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/dashboard/sitter/requests", label: "Requests", icon: Inbox },
    { href: "/dashboard/sitter/bookings", label: "Bookings", icon: CalendarCheck },
    { href: "/dashboard/sitter/availability", label: "Availability", icon: CalendarDays },
    { href: "/dashboard/sitter/reviews", label: "Reviews", icon: Star },
    { href: "/dashboard/sitter/profile", label: "Sitter Profile", icon: User },
    { href: "/dashboard/profile", label: "Account Profile", icon: User },
    { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  ],
  admin: [
    { href: "/dashboard/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/dashboard/admin/users", label: "Users", icon: Users },
    { href: "/dashboard/admin/sitters", label: "Sitters", icon: ShieldCheck },
    { href: "/dashboard/admin/reviews", label: "Reviews", icon: Star },
    { href: "/dashboard/profile", label: "Profile", icon: User },
    { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  ],
};

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !session && !loggingOut) router.replace("/login");
    if (!isPending && session) {
      const role = session.user.role ?? "owner";
      const ownerOnly = pathname.startsWith("/dashboard/owner") || pathname.startsWith("/dashboard/book/");
      const sitterOnly = pathname.startsWith("/dashboard/sitter");
      const adminOnly = pathname.startsWith("/dashboard/admin");
      if ((ownerOnly && role !== "owner") || (sitterOnly && role !== "sitter") || (adminOnly && role !== "admin")) {
        router.replace(`/dashboard/${role}`);
      }
    }
  }, [isPending, session, loggingOut, router, pathname]);

  useEffect(() => {
    if (!profileMenuOpen) return;
    function closeOnOutsideClick(event: PointerEvent) {
      if (event.target instanceof Node && !profileMenuRef.current?.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setProfileMenuOpen(false);
    }
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [profileMenuOpen]);

  if (isPending) {
    // Keep the route's own loading UI in the prefetched shell while the
    // browser resolves its Better Auth session. The API still enforces access.
    return <div className="flex min-h-screen flex-1 bg-brand-50/50"><main className="flex-1 p-4 md:p-6">{children}</main></div>;
  }

  if (!session) {
    return <div className="flex flex-1 items-center justify-center text-sm text-gray-500">Loading...</div>;
  }

  const role = session.user.role ?? "owner";
  const items = NAV[role] ?? NAV.owner;

  async function logout() {
    setLoggingOut(true);
    await authClient.signOut();
    router.replace("/");
  }

  const sidebar = (
    <aside className="flex h-full w-64 flex-col bg-gradient-to-b from-brand-400 to-brand-500 p-4 text-white">
      <Link href="/" className="mb-6 block rounded-2xl bg-white p-1">
        <Logo className="h-14" />
      </Link>
      <nav className="flex-1 space-y-1">
        {items.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active ? "bg-white/25" : "hover:bg-white/15"
              }`}
            >
              <item.icon size={18} /> {item.label}
            </Link>
          );
        })}
      </nav>
      <button onClick={logout} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-white/15">
        <LogOut size={18} /> Logout
      </button>
    </aside>
  );

  return (
    <div className="flex min-h-screen flex-1 bg-brand-50/50">
      <div className="sticky top-0 hidden h-screen md:block">{sidebar}</div>

      {open && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {sidebar}
          <button className="flex-1 bg-black/40" onClick={() => setOpen(false)} aria-label="Close menu" />
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-brand-100 bg-white px-4">
          <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X /> : <Menu />}
          </button>
          <p className="hidden text-sm text-gray-600 md:block">
            Welcome back, <b className="text-brand-800">{session.user.name}</b> 👋
          </p>
          <div className="flex items-center gap-2">
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setProfileMenuOpen((value) => !value)}
                aria-label="Open profile menu"
                aria-haspopup="menu"
                aria-expanded={profileMenuOpen}
                className="flex items-center gap-2 rounded-full p-1 pr-2 transition hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
              >
                <span className="badge capitalize">{role}</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-sm font-semibold text-white">
                  {session.user.name.charAt(0).toUpperCase()}
                </span>
                <ChevronDown size={15} className={`text-gray-500 transition-transform ${profileMenuOpen ? "rotate-180" : ""}`} />
              </button>
              {profileMenuOpen && (
                <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-brand-100 bg-white p-2 shadow-xl shadow-brand-900/10">
                  <div className="border-b border-brand-100 px-3 py-3">
                    <p className="truncate text-sm font-semibold text-brand-900">{session.user.name}</p>
                    <p className="mt-0.5 truncate text-xs text-gray-500">{session.user.email}</p>
                  </div>
                  <div className="space-y-1 py-2">
                    <Link
                      href="/"
                      role="menuitem"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-700 transition hover:bg-brand-50 hover:text-brand-700"
                    >
                      <Home size={17} /> Home page
                    </Link>
                    <Link
                      href="/dashboard/profile"
                      role="menuitem"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-700 transition hover:bg-brand-50 hover:text-brand-700"
                    >
                      <User size={17} /> Account profile
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => void logout()}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50"
                    >
                      <LogOut size={17} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
