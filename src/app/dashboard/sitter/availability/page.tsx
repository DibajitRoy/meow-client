"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { expandMarks, todayLocal } from "@/lib/calendar";
import { formatRange } from "@/lib/format";
import type { AvailabilityBlock, Booking } from "@/lib/types";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import MonthCalendar from "@/components/ui/MonthCalendar";

export default function AvailabilityPage() {
  const today = todayLocal();
  const [blocks, setBlocks] = useState<AvailabilityBlock[] | null>(null);
  const [booked, setBooked] = useState<Booking[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [status, setStatus] = useState<"unavailable" | "holiday">("unavailable");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let ignore = false;
    Promise.all([
      api<{ blocks: AvailabilityBlock[] }>("/api/availability"),
      api<{ bookings: Booking[] }>("/api/bookings?status=accepted&limit=50"),
    ])
      .then(([a, b]) => {
        if (!ignore) {
          setBlocks(a.blocks);
          setBooked(b.bookings);
        }
      })
      .catch((e) => {
        if (!ignore) setError((e as Error).message);
      });
    return () => {
      ignore = true;
    };
  }, [reload]);

  const marks = expandMarks([
    ...(blocks ?? []).map((b) => ({ from: b.from, to: b.to, type: b.status })),
    ...booked.map((b) => ({ from: b.from, to: b.to, type: "booked" })),
  ]);

  // Calendar e click: prothom click = shuru, dwitiyo click = shesh
  function pick(date: string) {
    if (date < today) return;
    if (!from || from !== to || date < from) {
      setFrom(date);
      setTo(date);
    } else {
      setTo(date);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!from || !to) return setError("Select a start and end date");
    if (to < from) return setError("End date cannot be before start date");
    setSaving(true);
    try {
      await api("/api/availability", {
        method: "POST",
        body: JSON.stringify({ from, to, status, ...(note.trim() ? { note: note.trim() } : {}) }),
      });
      setFrom("");
      setTo("");
      setNote("");
      setReload((n) => n + 1);
    } catch (err) {
      setError((err as Error).message);
    }
    setSaving(false);
  }

  async function remove(id: string) {
    try {
      await api(`/api/availability/${id}`, { method: "DELETE" });
      setReload((n) => n + 1);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <>
      <PageHeader title="Availability" subtitle="Block dates when you cannot take bookings. All other days stay available." />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card">
          <MonthCalendar marks={marks} onDayClick={pick} />
          <p className="mt-3 text-xs text-gray-500">Click a start date, then an end date to select a range.</p>
        </section>

        <form onSubmit={save} className="card h-fit space-y-4">
          <h2 className="font-semibold text-brand-900">Block dates</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium">
              From
              <input type="date" min={today} value={from} onChange={(e) => setFrom(e.target.value)} className="input mt-1" />
            </label>
            <label className="block text-sm font-medium">
              To
              <input type="date" min={from || today} value={to} onChange={(e) => setTo(e.target.value)} className="input mt-1" />
            </label>
          </div>
          <label className="block text-sm font-medium">
            Type
            <select value={status} onChange={(e) => setStatus(e.target.value as "unavailable" | "holiday")} className="input mt-1">
              <option value="unavailable">Unavailable</option>
              <option value="holiday">Holiday</option>
            </select>
          </label>
          <label className="block text-sm font-medium">
            Note (optional)
            <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={200} className="input mt-1" placeholder="e.g. Family trip" />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button disabled={saving} className="btn-primary w-full">{saving ? "Saving..." : "Save"}</button>
        </form>
      </div>

      <section className="card mt-6">
        <h2 className="mb-3 font-semibold text-brand-900">Blocked dates</h2>
        {!blocks && <p className="text-sm text-gray-500">Loading...</p>}
        {blocks && blocks.length === 0 && <p className="text-sm text-gray-500">No blocked dates. You are available every day.</p>}
        {blocks && blocks.length > 0 && (
          <ul className="divide-y divide-brand-100">
            {blocks.map((b) => (
              <li key={b._id} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{formatRange(b.from, b.to)}</p>
                  {b.note && <p className="truncate text-xs text-gray-500">{b.note}</p>}
                </div>
                <StatusBadge status={b.status} />
                <button onClick={() => remove(b._id)} className="btn-ghost text-red-500 hover:bg-red-50" aria-label="Make available again">
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}