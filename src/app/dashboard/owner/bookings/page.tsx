"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatRange, money } from "@/lib/format";
import type { Booking } from "@/lib/types";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import Avatar from "@/components/ui/Avatar";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";

const TABS = [
  ["", "All"],
  ["pending", "Pending"],
  ["accepted", "Accepted"],
  ["completed", "Completed"],
  ["cancelled", "Cancelled"],
  ["rejected", "Rejected"],
];

type Result = { bookings: Booking[]; total: number; page: number; pages: number };

export default function OwnerBookingsPage() {
  const [tab, setTab] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Result | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    api<Result>(`/api/bookings?page=${page}${tab ? `&status=${tab}` : ""}`)
      .then((r) => {
        if (!ignore) setData(r);
      })
      .catch((e) => {
        if (!ignore) setError((e as Error).message);
      });
    return () => {
      ignore = true;
    };
  }, [tab, page]);

  return (
    <>
      <PageHeader
        title="My Bookings"
        subtitle="Track all your booking requests"
        action={<Link href="/sitters" className="btn-primary">Find a Sitter</Link>}
      />

      <div className="mb-4 flex gap-1 overflow-x-auto border-b border-brand-100">
        {TABS.map(([value, label]) => (
          <button
            key={label}
            onClick={() => {
              setTab(value);
              setPage(1);
            }}
            className={`whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium ${
              tab === value ? "border-brand-500 text-brand-700" : "border-transparent text-gray-500 hover:text-brand-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      {!data && !error && <p className="text-sm text-gray-500">Loading...</p>}

      {data && data.bookings.length === 0 && (
        <EmptyState title="No bookings here" text="Bookings you send will show up in this list." />
      )}

      {data && data.bookings.length > 0 && (
        <div className="space-y-3">
          {data.bookings.map((b) => (
            <Link key={b._id} href={`/dashboard/owner/bookings/${b._id}`} className="card flex items-center gap-4 transition hover:border-brand-300">
              <Avatar src={b.sitter?.image} name={b.sitter?.name ?? "S"} size={52} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-brand-900">{b.sitter?.name}</p>
                <p className="truncate text-sm text-gray-500">{formatRange(b.from, b.to)}</p>
                <p className="truncate text-xs text-gray-400">Cat: {b.cat.name}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{money(b.total)}</p>
                <StatusBadge status={b.status} />
              </div>
            </Link>
          ))}
        </div>
      )}

      {data && <Pagination page={page} pages={data.pages} onChange={setPage} />}
    </>
  );
}