"use client";

import { useState } from "react";
import { ChevronDown, Mail, Phone } from "lucide-react";
import { api } from "@/lib/api";
import { todayLocal } from "@/lib/calendar";
import { formatRange, money } from "@/lib/format";
import type { Booking, BookingStatus } from "@/lib/types";
import Avatar from "@/components/ui/Avatar";
import StatusBadge from "@/components/ui/StatusBadge";

type Props = {
  b: Booking;
  onAction: (b: Booking, status: BookingStatus) => void;
};

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className="text-sm text-gray-700">{value}</dd>
    </div>
  );
}

export default function SitterBookingCard({ b, onAction }: Props) {
  const [open, setOpen] = useState(false);
  const [contact, setContact] = useState<{ phone?: string | null; email?: string } | null>(null);
  const started = todayLocal() >= b.from;
  const showContact = b.status === "accepted" || b.status === "completed";

  async function toggle() {
    const next = !open;
    setOpen(next);
    // Owner er phone/email shudhu accepted/completed booking e pawa jay
    if (next && showContact && !contact) {
      try {
        const r = await api<{ booking: Booking }>(`/api/bookings/${b._id}`);
        setContact({ phone: r.booking.owner?.phone, email: r.booking.owner?.email });
      } catch {
        /* contact na pele-o card kaj korbe */
      }
    }
  }

  return (
    <div className="card">
      <div className="flex flex-wrap items-center gap-4">
        <Avatar src={b.owner?.image} name={b.owner?.name ?? "O"} size={52} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-brand-900">{b.owner?.name}</p>
          <p className="truncate text-sm text-gray-500">{formatRange(b.from, b.to)} · {b.nights} {b.nights === 1 ? "day" : "days"}</p>
          <p className="truncate text-xs text-gray-500">Service: {b.serviceType ?? "Cat sitting"}</p>
          <p className="truncate text-xs text-gray-400">Cat: {b.cat.name}{b.cat.breed ? ` (${b.cat.breed})` : ""}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold">{money(b.subtotal)}</p>
          <StatusBadge status={b.status} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {b.status === "pending" && (
          <>
            <button className="btn-primary" onClick={() => onAction(b, "accepted")}>Accept</button>
            <button
              className="rounded-xl border border-red-300 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100"
              onClick={() => onAction(b, "rejected")}
            >
              Reject
            </button>
          </>
        )}
        {b.status === "accepted" && (
          <>
            <button
              className="btn-primary"
              disabled={!started}
              title={started ? "" : "You can complete a booking after it starts"}
              onClick={() => onAction(b, "completed")}
            >
              Mark as Completed
            </button>
            <button
              className="rounded-xl border border-red-300 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100"
              onClick={() => onAction(b, "cancelled")}
            >
              Cancel
            </button>
          </>
        )}
        <button onClick={toggle} className="btn-ghost ml-auto">
          Details <ChevronDown size={16} className={`transition ${open ? "rotate-180" : ""}`} />
        </button>
      </div>

      {open && (
        <dl className="mt-4 grid gap-3 border-t border-brand-100 pt-4 sm:grid-cols-2">
          <Row label="Feeding schedule" value={b.cat.feedingSchedule} />
          <Row label="Care instructions" value={b.cat.careInstructions} />
          <Row label="Medical notes" value={b.cat.medicalNotes} />
          <Row label="Emergency contact" value={b.cat.emergencyContact} />
          <Row label="Note from owner" value={b.note} />
          <Row label="Total (owner pays)" value={money(b.total)} />
          {contact && (
            <div className="space-y-1 text-sm text-gray-700 sm:col-span-2">
              {contact.phone && <p className="flex items-center gap-2"><Phone size={14} /> {contact.phone}</p>}
              {contact.email && <p className="flex items-center gap-2"><Mail size={14} /> {contact.email}</p>}
            </div>
          )}
        </dl>
      )}
    </div>
  );
}
