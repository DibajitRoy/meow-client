"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarCheck, Cat, CircleDollarSign, Clock3, PawPrint, Users } from "lucide-react";
import { api } from "@/lib/api";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatRange, money } from "@/lib/format";

type Stats = {
  totals: { totalUsers: number; owners: number; sitters: number; cats: number; totalBookings: number; pendingSitters: number };
  bookingsByStatus: Record<string, number>;
  monthlyBookings: { month: string; count: number }[];
  revenue: { gross: number; fees: number };
  recentBookings: { _id: string; status: string; from: string; to: string; total: number; cat: string; owner: { name: string } | null; sitter: { name: string } | null }[];
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Stats>("/api/admin/stats").then(setData).catch((e) => setError((e as Error).message));
  }, []);

  return (
    <>
      <PageHeader title="Admin Dashboard" subtitle="Monitor users, sitter verification, bookings, and reviews" />
      {error && <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      {!data && !error && <p className="text-sm text-gray-500">Loading platform summary...</p>}
      {data && <>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={Users} label="Total Users" value={data.totals.totalUsers} />
          <StatCard icon={PawPrint} label="Sitters" value={data.totals.sitters} />
          <StatCard icon={Cat} label="Cats" value={data.totals.cats} />
          <StatCard icon={CalendarCheck} label="Bookings" value={data.totals.totalBookings} />
          <StatCard icon={Clock3} label="Sitters Awaiting Review" value={data.totals.pendingSitters} />
          <StatCard icon={CircleDollarSign} label="Completed Booking Value" value={money(data.revenue.gross)} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-brand-900">Bookings by status</h2>
              <Link href="/dashboard/admin/users" className="text-sm font-medium text-brand-600">Manage users</Link>
            </div>
            <ul className="space-y-3">
              {Object.entries(data.bookingsByStatus).length === 0 && <li className="text-sm text-gray-500">No bookings yet.</li>}
              {Object.entries(data.bookingsByStatus).map(([status, count]) => <li key={status} className="flex items-center justify-between text-sm"><StatusBadge status={status} /><span className="font-semibold">{count}</span></li>)}
            </ul>
            <p className="mt-4 border-t border-brand-100 pt-3 text-xs text-gray-500">Service fees recorded: {money(data.revenue.fees)}</p>
          </section>
          <section className="card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-brand-900">Recent bookings</h2>
              <Link href="/dashboard/admin/sitters" className="text-sm font-medium text-brand-600">Review sitters</Link>
            </div>
            {data.recentBookings.length === 0 ? <p className="text-sm text-gray-500">No booking activity yet.</p> : (
              <ul className="divide-y divide-brand-100">
                {data.recentBookings.map((booking) => <li key={booking._id} className="flex flex-wrap items-center gap-3 py-3 text-sm">
                  <div className="min-w-0 flex-1"><p className="font-medium">{booking.cat}</p><p className="text-xs text-gray-500">{booking.owner?.name ?? "Owner"} with {booking.sitter?.name ?? "Sitter"} · {formatRange(booking.from, booking.to)}</p></div>
                  <span className="font-semibold">{money(booking.total)}</span><StatusBadge status={booking.status} />
                </li>)}
              </ul>
            )}
          </section>
        </div>
      </>}
    </>
  );
}
