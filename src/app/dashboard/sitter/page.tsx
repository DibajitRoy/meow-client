"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarCheck, CheckCircle2, Inbox, Star, Wallet } from "lucide-react";
import { api } from "@/lib/api";
import { formatRange, money } from "@/lib/format";
import type { Booking } from "@/lib/types";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import Avatar from "@/components/ui/Avatar";
import StatusBadge from "@/components/ui/StatusBadge";

type Data = {
  profileStatus: "none" | "pending" | "verified" | "rejected";
  stats: { totalBookings: number; pendingRequests: number; completedJobs: number; averageRating: number; earnings: number };
  recentRequests: Booking[];
  upcoming: Booking[];
};

function ProfileBanner({ status }: { status: Data["profileStatus"] }) {
  if (status === "verified") return null;
  const map = {
    none: ["bg-brand-50 text-brand-800", "Create your sitter profile so owners can find you.", "Create Profile"],
    pending: ["bg-amber-50 text-amber-800", "Your profile is waiting for admin verification. You will appear in search after approval.", "View Profile"],
    rejected: ["bg-red-50 text-red-700", "Your profile was rejected. Please update it and submit again.", "Update Profile"],
  } as const;
  const [cls, text, label] = map[status];
  return (
    <div className={`mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4 text-sm ${cls}`}>
      <p>{text}</p>
      <Link href="/dashboard/sitter/profile" className="btn-primary">{label}</Link>
    </div>
  );
}

function BookingRow({ b }: { b: Booking }) {
  return (
    <li className="flex items-center gap-3 rounded-xl p-2">
      <Avatar src={b.owner?.image} name={b.owner?.name ?? "O"} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{b.owner?.name}</p>
        <p className="truncate text-xs text-gray-500">{formatRange(b.from, b.to)} · {b.cat.name}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold">{money(b.subtotal)}</p>
        <StatusBadge status={b.status} />
      </div>
    </li>
  );
}

export default function SitterDashboardPage() {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Data>("/api/dashboard/sitter")
      .then(setData)
      .catch((e) => setError((e as Error).message));
  }, []);

  if (error) return <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>;
  if (!data) return <p className="text-sm text-gray-500">Loading...</p>;

  const { stats, recentRequests, upcoming } = data;

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Your sitting activity at a glance" />
      <ProfileBanner status={data.profileStatus} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={CalendarCheck} label="Total Bookings" value={stats.totalBookings} />
        <StatCard icon={Inbox} label="Pending Requests" value={stats.pendingRequests} />
        <StatCard icon={CheckCircle2} label="Completed Jobs" value={stats.completedJobs} />
        <StatCard icon={Star} label="Average Rating" value={stats.averageRating ? stats.averageRating.toFixed(1) : "—"} />
        <StatCard icon={Wallet} label="Earnings" value={money(stats.earnings)} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-brand-900">Recent Requests</h2>
            <Link href="/dashboard/sitter/requests" className="text-sm font-medium text-brand-600">View all</Link>
          </div>
          {recentRequests.length === 0 ? (
            <p className="text-sm text-gray-500">No pending requests.</p>
          ) : (
            <ul>{recentRequests.map((b) => <BookingRow key={b._id} b={b} />)}</ul>
          )}
        </section>

        <section className="card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-brand-900">Upcoming Bookings</h2>
            <Link href="/dashboard/sitter/bookings" className="text-sm font-medium text-brand-600">View all</Link>
          </div>
          {upcoming.length === 0 ? (
            <p className="text-sm text-gray-500">No upcoming bookings.</p>
          ) : (
            <ul>{upcoming.map((b) => <BookingRow key={b._id} b={b} />)}</ul>
          )}
        </section>
      </div>
    </>
  );
}