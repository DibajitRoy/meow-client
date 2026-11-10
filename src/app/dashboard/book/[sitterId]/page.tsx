"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api, publicApi } from "@/lib/api";
import { expandMarks, nightsBetween, todayLocal } from "@/lib/calendar";
import { money } from "@/lib/format";
import type { Cat, SitterDetail, Unavailable } from "@/lib/types";
import PageHeader from "@/components/ui/PageHeader";
import Avatar from "@/components/ui/Avatar";
import EmptyState from "@/components/ui/EmptyState";
import MonthCalendar from "@/components/ui/MonthCalendar";

// Shudhu dekhanor jonno. Asol fee server hishab kore (Meow-server/.env: SERVICE_FEE)
const SERVICE_FEE = Number(process.env.NEXT_PUBLIC_SERVICE_FEE ?? 5);

export default function BookSitterPage() {
  const { sitterId } = useParams<{ sitterId: string }>();
  const router = useRouter();

  const [sitter, setSitter] = useState<SitterDetail | null>(null);
  const [unavailable, setUnavailable] = useState<Unavailable[]>([]);
  const [cats, setCats] = useState<Cat[] | null>(null);
  const [catId, setCatId] = useState("");
  const [serviceType, setServiceType] = useState("Cat sitting");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [note, setNote] = useState("");
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      publicApi<{ sitter: SitterDetail; unavailable: Unavailable[] }>(`/api/sitters/${sitterId}`),
      api<{ cats: Cat[] }>("/api/cats"),
    ])
      .then(([s, c]) => {
        setSitter(s.sitter);
        setServiceType(s.sitter.services[0] ?? "Cat sitting");
        setUnavailable(s.unavailable);
        setCats(c.cats);
        if (c.cats[0]) setCatId(c.cats[0]._id);
      })
      .catch((e) => setLoadError((e as Error).message));
  }, [sitterId]);

  if (loadError) return <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{loadError}</p>;
  if (!sitter || !cats) return <p className="text-sm text-gray-500">Loading...</p>;

  if (cats.length === 0) {
    return (
      <EmptyState
        title="Add a cat first"
        text="You need at least one cat on your profile to send a booking request."
        action={<Link href="/dashboard/owner/cats/new" className="btn-primary">Add Your Cat</Link>}
      />
    );
  }

  const nights = from && to ? nightsBetween(from, to) : 0;
  const subtotal = sitter.pricePerDay * nights;
  const total = subtotal + SERVICE_FEE;
  const today = todayLocal();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (nights < 1) return setError("End date must be after the start date");
    setLoading(true);
    try {
      const r = await api<{ booking: { _id: string } }>("/api/bookings", {
        method: "POST",
        body: JSON.stringify({ sitterId, catId, serviceType, from, to, ...(note.trim() ? { note: note.trim() } : {}) }),
      });
      router.push(`/dashboard/owner/bookings/${r.booking._id}`);
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader title="Book a Sitter" subtitle="Send a booking request. You can cancel before it is accepted." />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <form onSubmit={submit} className="card space-y-4">
          <div className="flex items-center gap-3 rounded-xl bg-brand-50 p-3">
            <Avatar src={sitter.photo} name={sitter.name} size={52} rounded="xl" />
            <div>
              <p className="font-semibold">{sitter.name}</p>
              <p className="text-xs text-gray-500">{sitter.city} · {money(sitter.pricePerDay)} / day</p>
            </div>
          </div>

          <label className="block text-sm font-medium">
            Select your cat
            <select value={catId} onChange={(e) => setCatId(e.target.value)} className="input mt-1">
              {cats.map((c) => <option key={c._id} value={c._id}>{c.name}{c.breed ? ` (${c.breed})` : ""}</option>)}
            </select>
          </label>

          <label className="block text-sm font-medium">
            Service
            <select value={serviceType} onChange={(e) => setServiceType(e.target.value)} className="input mt-1">
              {(sitter.services.length ? sitter.services : ["Cat sitting"]).map((service) => <option key={service} value={service}>{service}</option>)}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium">
              From
              <input type="date" required min={today} value={from} onChange={(e) => setFrom(e.target.value)} className="input mt-1" />
            </label>
            <label className="block text-sm font-medium">
              To
              <input type="date" required min={from || today} value={to} onChange={(e) => setTo(e.target.value)} className="input mt-1" />
            </label>
          </div>

          <label className="block text-sm font-medium">
            Note for the sitter (optional)
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} maxLength={500} className="input mt-1" placeholder="Any special instructions about your cat..." />
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}
          <button disabled={loading} className="btn-primary w-full">{loading ? "Sending..." : "Send Booking Request"}</button>
          <p className="text-center text-xs text-gray-500">The sitter will review your request. You are not charged yet.</p>
        </form>

        <aside className="space-y-6">
          <section className="card">
            <h2 className="mb-3 font-semibold text-brand-900">Price Details</h2>
            {nights >= 1 ? (
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt>{money(sitter.pricePerDay)} × {nights} days</dt><dd>{money(subtotal)}</dd></div>
                <div className="flex justify-between"><dt>Service fee</dt><dd>{money(SERVICE_FEE)}</dd></div>
                <div className="flex justify-between border-t border-brand-100 pt-2 text-base font-bold text-brand-800"><dt>Total</dt><dd>{money(total)}</dd></div>
              </dl>
            ) : (
              <p className="text-sm text-gray-500">Select your dates to see the price.</p>
            )}
          </section>

          <section className="card">
            <h2 className="mb-3 font-semibold text-brand-900">Sitter availability</h2>
            <MonthCalendar marks={expandMarks(unavailable)} />
          </section>
        </aside>
      </div>
    </>
  );
}
