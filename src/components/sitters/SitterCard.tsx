import Link from "next/link";
import { BadgeCheck, Briefcase, MapPin } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { Stars } from "@/components/ui/Stars";
import { money } from "@/lib/format";
import type { SitterListItem } from "@/lib/types";

export default function SitterCard({ s }: { s: SitterListItem }) {
  return (
    <div className="card flex flex-col gap-4 sm:flex-row sm:items-center">
      <Avatar src={s.photo} name={s.name} size={88} rounded="xl" />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-semibold text-brand-900">{s.name}</h3>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
            <BadgeCheck size={14} /> Verified
          </span>
        </div>
        <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
          <span className="inline-flex items-center gap-1"><MapPin size={14} /> {s.city}</span>
          <span className="inline-flex items-center gap-1"><Briefcase size={14} /> {s.experienceYears} yrs experience</span>
        </p>
        <div className="mt-1 flex items-center gap-2 text-sm">
          <Stars value={s.ratingAvg} size={14} />
          <span className="font-medium">{s.ratingAvg ? s.ratingAvg.toFixed(1) : "New"}</span>
          {s.ratingCount > 0 && <span className="text-gray-400">({s.ratingCount})</span>}
        </div>
        {s.services.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {s.services.slice(0, 3).map((x) => <span key={x} className="badge">{x}</span>)}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-4 sm:block sm:text-right">
        <div>
          <p className="text-2xl font-bold text-brand-700">{money(s.pricePerDay)}</p>
          <p className="text-xs text-gray-500">per day</p>
        </div>
        <Link href={`/sitters/${s.id}`} className="btn-primary sm:mt-3">View Profile</Link>
      </div>
    </div>
  );
}