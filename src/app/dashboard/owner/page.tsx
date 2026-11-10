"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarCheck, CalendarClock, CheckCircle2, Plus, Cat as CatIcon, type LucideIcon } from "lucide-react";
import { api } from "@/lib/api";
import { catMeta, formatRange, money } from "@/lib/format";
import type { Booking, Cat, Review } from "@/lib/types";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import Avatar from "@/components/ui/Avatar";
import { Stars } from "@/components/ui/Stars";

type DashboardData = {
  stats: { totalCats: number; activeBookings: number; pendingBookings: number; completedBookings: number };
  upcoming: Booking[];
  cats: Cat[];
  recentReviews: Review[];
};

function StatCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: number }) {
  return (
    <div className="card flex items-center gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
        <Icon size={22} />
      </div>
      <div>
        <p className="text-2xl font-bold text-brand-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}

export default function OwnerDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<DashboardData>("/api/dashboard/owner")
      .then(setData)
      .catch((e) => setError((e as Error).message));
  }, []);

  if (error) return <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>;
  if (!data) return <p className="text-sm text-gray-500">Loading...</p>;

  const { stats, upcoming, cats, recentReviews } = data;

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Here is what is happening with your cats"
        action={
          <Link href="/sitters" className="btn-primary">Find a Sitter</Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={CatIcon} label="Total Cats" value={stats.totalCats} />
        <StatCard icon={CalendarCheck} label="Active Bookings" value={stats.activeBookings} />
        <StatCard icon={CalendarClock} label="Pending Bookings" value={stats.pendingBookings} />
        <StatCard icon={CheckCircle2} label="Completed Bookings" value={stats.completedBookings} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-brand-900">Upcoming Bookings</h2>
            <Link href="/dashboard/owner/bookings" className="text-sm font-medium text-brand-600">View all</Link>
          </div>
          {upcoming.length === 0 ? (
            <p className="text-sm text-gray-500">No upcoming bookings.</p>
          ) : (
            <ul className="space-y-3">
              {upcoming.map((b) => (
                <li key={b._id}>
                  <Link href={`/dashboard/owner/bookings/${b._id}`} className="flex items-center gap-3 rounded-xl p-2 hover:bg-brand-50">
                    <Avatar src={b.sitter?.image} name={b.sitter?.name ?? "S"} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{b.sitter?.name}</p>
                      <p className="truncate text-xs text-gray-500">{formatRange(b.from, b.to)} · {b.cat.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{money(b.total)}</p>
                      <StatusBadge status={b.status} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-brand-900">Recent Reviews</h2>
            <Link href="/dashboard/owner/reviews" className="text-sm font-medium text-brand-600">See all</Link>
          </div>
          {recentReviews.length === 0 ? (
            <p className="text-sm text-gray-500">You have not written any review yet.</p>
          ) : (
            <ul className="space-y-4">
              {recentReviews.map((r) => (
                <li key={r._id} className="flex gap-3">
                  <Avatar src={r.sitter?.image} name={r.sitter?.name ?? "S"} size={40} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{r.sitter?.name}</p>
                    <Stars value={r.rating} size={14} />
                    <p className="mt-1 line-clamp-2 text-xs text-gray-600">{r.comment}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="card mt-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-brand-900">My Cats</h2>
          <Link href="/dashboard/owner/cats/new" className="inline-flex items-center gap-1 text-sm font-medium text-brand-600">
            <Plus size={14} /> Add Cat
          </Link>
        </div>
        {cats.length === 0 ? (
          <p className="text-sm text-gray-500">No cats added yet.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {cats.map((c) => (
              <Link key={c._id} href={`/dashboard/owner/cats/${c._id}/edit`} className="flex items-center gap-3 rounded-xl border border-brand-100 p-3 hover:bg-brand-50">
                <Avatar src={c.photo} name={c.name} size={48} rounded="xl" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{c.name}</p>
                  <p className="truncate text-xs text-gray-500">{catMeta(c)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}