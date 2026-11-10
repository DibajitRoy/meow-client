"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BadgeCheck, MapPin } from "lucide-react";
import { publicApi } from "@/lib/api";
import type { PublicReview, SitterListItem } from "@/lib/types";
import Avatar from "@/components/ui/Avatar";
import { Stars } from "@/components/ui/Stars";
import { money } from "@/lib/format";

type Featured = { sitter: SitterListItem; review: PublicReview | null };

export default function FeaturedSitters() {
  const [items, setItems] = useState<Featured[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const result = await publicApi<{ sitters: SitterListItem[] }>("/api/sitters?page=1&sort=rating");
        const sitters = result.sitters.slice(0, 3);
        const details = await Promise.all(sitters.map((s) => publicApi<{ reviews: PublicReview[] }>(`/api/sitters/${s.id}`).catch(() => ({ reviews: [] }))));
        if (!ignore) setItems(sitters.map((s, i) => ({ sitter: s, review: details[i].reviews[0] ?? null })));
      } catch (e) {
        if (!ignore) setError((e as Error).message);
      }
    }
    void load();
    return () => { ignore = true; };
  }, []);

  return <section className="mx-auto max-w-6xl px-4 py-16">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div><h2 className="text-3xl font-bold text-brand-900">Meet verified sitters</h2><p className="mt-2 text-gray-600">Browse real profiles, services, and owner feedback.</p></div>
      <Link href="/sitters" className="text-sm font-semibold text-brand-600 hover:text-brand-700">Browse all sitters</Link>
    </div>
    {error && <p className="mt-5 rounded-xl bg-brand-50 p-4 text-sm text-gray-600">Sitter profiles will appear here when the API is available.</p>}
    {!items && !error && <p className="mt-5 text-sm text-gray-500">Loading sitter profiles...</p>}
    {items?.length === 0 && <p className="mt-5 rounded-xl bg-brand-50 p-4 text-sm text-gray-600">No verified sitter profiles are available yet.</p>}
    {items && items.length > 0 && <div className="mt-7 grid gap-5 md:grid-cols-3">
      {items.map(({ sitter, review }) => <article key={sitter.id} className="card flex flex-col">
        <div className="flex items-center gap-3"><Avatar src={sitter.photo} name={sitter.name} size={58} rounded="xl" /><div className="min-w-0"><h3 className="truncate font-semibold text-brand-900">{sitter.name}</h3><p className="flex items-center gap-1 text-sm text-gray-500"><MapPin size={14} />{sitter.city}</p></div><BadgeCheck size={18} className="ml-auto shrink-0 text-emerald-600" aria-label="Verified sitter" /></div>
        <div className="mt-3 flex items-center gap-2"><Stars value={sitter.ratingAvg} size={14} /><span className="text-sm font-medium">{sitter.ratingAvg ? sitter.ratingAvg.toFixed(1) : "New"}</span><span className="text-xs text-gray-400">({sitter.ratingCount} reviews)</span></div>
        <p className="mt-3 line-clamp-3 min-h-16 text-sm text-gray-600">{sitter.bio}</p>
        {review && <blockquote className="mt-4 rounded-xl bg-brand-50 p-3 text-sm text-gray-700"><div className="mb-1 flex items-center justify-between"><Stars value={review.rating} size={12} /><span className="text-xs text-gray-500">{review.owner?.name ?? "Owner"}</span></div><p className="line-clamp-2">“{review.comment}”</p></blockquote>}
        <div className="mt-auto flex items-end justify-between gap-3 pt-5"><div><p className="font-semibold text-brand-700">{money(sitter.pricePerDay)}</p><p className="text-xs text-gray-500">per day</p></div><Link href={`/sitters/${sitter.id}`} className="btn-outline">View profile</Link></div>
      </article>)}
    </div>}
  </section>;
}
