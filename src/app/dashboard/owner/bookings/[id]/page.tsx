"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import { api } from "@/lib/api";
import type { Booking } from "@/lib/types";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import Avatar from "@/components/ui/Avatar";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import BookingInfo from "@/components/bookings/BookingInfo";

export default function OwnerBookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [b, setB] = useState<Booking | null>(null);
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await api<{ booking: Booking }>(`/api/bookings/${id}`);
      setB(r.booking);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [id]);

  useEffect(() => {
    let ignore = false;
    api<{ booking: Booking }>(`/api/bookings/${id}`)
      .then((r) => { if (!ignore) setB(r.booking); })
      .catch((e) => { if (!ignore) setError((e as Error).message); });
    return () => { ignore = true; };
  }, [id]);

  async function cancel() {
    setBusy(true);
    try {
      await api(`/api/bookings/${id}/status`, { method: "PATCH", body: JSON.stringify({ status: "cancelled" }) });
      setConfirm(false);
      await load();
    } catch (e) {
      setError((e as Error).message);
      setConfirm(false);
    }
    setBusy(false);
  }

  if (error && !b) return <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>;
  if (!b) return <p className="text-sm text-gray-500">Loading...</p>;

  const canCancel = b.status === "pending" || b.status === "accepted";

  return (
    <>
      <Link href="/dashboard/owner/bookings" className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600">
        <ArrowLeft size={14} /> Back
      </Link>
      <PageHeader title="Booking Details" action={<StatusBadge status={b.status} />} />

      {error && <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      <section className="card mb-6 flex flex-wrap items-center gap-4">
        <Avatar src={b.sitter?.image} name={b.sitter?.name ?? "S"} size={60} />
        <div className="min-w-0 flex-1">
          <p className="text-lg font-semibold text-brand-900">{b.sitter?.name}</p>
          <Link href={`/sitters/${b.sitterId}`} className="text-sm text-brand-600">View profile</Link>
        </div>
        {(b.sitter?.phone || b.sitter?.email) && (
          <div className="space-y-1 text-sm text-gray-600">
            {b.sitter?.phone && <p className="flex items-center gap-2"><Phone size={14} /> {b.sitter.phone}</p>}
            {b.sitter?.email && <p className="flex items-center gap-2"><Mail size={14} /> {b.sitter.email}</p>}
          </div>
        )}
      </section>

      <BookingInfo b={b} />

      <div className="mt-6 flex flex-wrap gap-3">
        {b.status === "completed" && !b.reviewed && (
          <Link href={`/dashboard/owner/bookings/${b._id}/review`} className="btn-primary">Write a Review</Link>
        )}
        {b.status === "completed" && b.reviewed && <span className="badge">You reviewed this booking</span>}
        {canCancel && (
          <button onClick={() => setConfirm(true)} className="rounded-xl border border-red-300 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100">
            Cancel Booking
          </button>
        )}
      </div>

      <ConfirmDialog
        open={confirm}
        title="Cancel this booking?"
        message="The sitter will be notified. This cannot be undone."
        confirmLabel="Yes, cancel"
        loading={busy}
        onConfirm={cancel}
        onCancel={() => setConfirm(false)}
      />
    </>
  );
}
