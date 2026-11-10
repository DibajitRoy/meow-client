import { formatRange, money } from "@/lib/format";
import type { Booking } from "@/lib/types";
import Avatar from "@/components/ui/Avatar";

function Row({ label, value }: { label: string; value?: string | number | null }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className="text-sm text-gray-700">{value}</dd>
    </div>
  );
}

export default function BookingInfo({ b }: { b: Booking }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="card">
        <h2 className="mb-4 font-semibold text-brand-900">Cat & Dates</h2>
        <div className="mb-4 flex items-center gap-3">
          <Avatar src={b.cat.photo} name={b.cat.name} size={56} rounded="xl" />
          <div>
            <p className="font-semibold">{b.cat.name}</p>
            <p className="text-sm text-gray-500">{[b.cat.breed, b.cat.age != null ? `${b.cat.age} yrs` : null].filter(Boolean).join(" · ") || "—"}</p>
          </div>
        </div>
        <dl className="space-y-3">
          <Row label="Service" value={b.serviceType ?? "Cat sitting"} />
          <Row label="Dates" value={`${formatRange(b.from, b.to)} (${b.nights} ${b.nights === 1 ? "day" : "days"})`} />
          <Row label="Feeding schedule" value={b.cat.feedingSchedule} />
          <Row label="Care instructions" value={b.cat.careInstructions} />
          <Row label="Medical notes" value={b.cat.medicalNotes} />
          <Row label="Emergency contact" value={b.cat.emergencyContact} />
          <Row label="Note to sitter" value={b.note} />
        </dl>
      </section>

      <section className="card h-fit">
        <h2 className="mb-4 font-semibold text-brand-900">Price Details</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between"><dt>{money(b.pricePerDay)} × {b.nights} days</dt><dd>{money(b.subtotal)}</dd></div>
          <div className="flex justify-between"><dt>Service fee</dt><dd>{money(b.serviceFee)}</dd></div>
          <div className="flex justify-between border-t border-brand-100 pt-2 text-base font-bold text-brand-800">
            <dt>Total</dt><dd>{money(b.total)}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
