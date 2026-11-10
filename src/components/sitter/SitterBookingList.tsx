"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Booking, BookingStatus } from "@/lib/types";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import SitterBookingCard from "./SitterBookingCard";

type Props = {
  title: string;
  subtitle: string;
  tabs: [string, string][];
  emptyTitle: string;
  emptyText: string;
};

type Result = { bookings: Booking[]; total: number; page: number; pages: number };

export default function SitterBookingList({ title, subtitle, tabs, emptyTitle, emptyText }: Props) {
  const [tab, setTab] = useState(tabs[0][0]);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [pending, setPending] = useState<{ b: Booking; status: BookingStatus } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let ignore = false;
    api<Result>(`/api/bookings?page=${page}${tab ? `&status=${tab}` : ""}`)
      .then((r) => {
        if (!ignore) {
          setData(r);
          setError("");
        }
      })
      .catch((e) => {
        if (!ignore) setError((e as Error).message);
      });
    return () => {
      ignore = true;
    };
  }, [tab, page, reload]);

  async function run(b: Booking, status: BookingStatus) {
    setBusy(true);
    try {
      await api(`/api/bookings/${b._id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
      setReload((n) => n + 1);
    } catch (e) {
      setError((e as Error).message);
    }
    setPending(null);
    setBusy(false);
  }

  function onAction(b: Booking, status: BookingStatus) {
    // Accept/complete shorashori hoy, reject/cancel e confirm chay
    if (status === "accepted" || status === "completed") run(b, status);
    else setPending({ b, status });
  }

  return (
    <>
      <PageHeader title={title} subtitle={subtitle} />

      {tabs.length > 1 && (
        <div className="mb-4 flex gap-1 overflow-x-auto border-b border-brand-100">
          {tabs.map(([value, label]) => (
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
      )}

      {error && <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      {!data && !error && <p className="text-sm text-gray-500">Loading...</p>}
      {data && data.bookings.length === 0 && <EmptyState title={emptyTitle} text={emptyText} />}

      {data && data.bookings.length > 0 && (
        <div className="space-y-3">
          {data.bookings.map((b) => (
            <SitterBookingCard key={b._id} b={b} onAction={onAction} />
          ))}
        </div>
      )}

      {data && <Pagination page={page} pages={data.pages} onChange={setPage} />}

      <ConfirmDialog
        open={!!pending}
        title={pending?.status === "rejected" ? "Reject this request?" : "Cancel this booking?"}
        message="The owner will be notified. This cannot be undone."
        confirmLabel={pending?.status === "rejected" ? "Yes, reject" : "Yes, cancel"}
        loading={busy}
        onConfirm={() => pending && run(pending.b, pending.status)}
        onCancel={() => setPending(null)}
      />
    </>
  );
}