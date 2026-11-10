"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { publicApi } from "@/lib/api";
import { todayLocal } from "@/lib/calendar";
import type { SitterListItem } from "@/lib/types";
import SitterCard from "@/components/sitters/SitterCard";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";

type Result = { sitters: SitterListItem[]; total: number; page: number; pages: number };

const SORTS = [
  ["rating", "Highest Rated"],
  ["priceLow", "Price: Low to High"],
  ["priceHigh", "Price: High to Low"],
  ["experience", "Most Experienced"],
];

export default function SittersClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const query = sp.toString();
  const page = Number(sp.get("page") ?? 1) || 1;

  const [f, setF] = useState({
    city: sp.get("city") ?? "",
    from: sp.get("from") ?? "",
    to: sp.get("to") ?? "",
    minPrice: sp.get("minPrice") ?? "",
    maxPrice: sp.get("maxPrice") ?? "",
    rating: sp.get("rating") ?? "",
    experience: sp.get("experience") ?? "",
    service: sp.get("service") ?? "",
    sort: sp.get("sort") ?? "rating",
  });
  const [data, setData] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    let ignore = false;
    publicApi<Result>(`/api/sitters?${query}`)
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
  }, [query]);

  function set(key: keyof typeof f, value: string) {
    setF((prev) => ({ ...prev, [key]: value }));
  }

  function apply(nextPage = 1) {
    setFormError("");
    if (f.from && f.to && f.to <= f.from) return setFormError("End date must be after start date");
    const params = new URLSearchParams();
    Object.entries(f).forEach(([k, v]) => {
      if (v !== "") params.set(k, v);
    });
    // Duita date na dile date filter kaj kore na
    if (!(f.from && f.to)) {
      params.delete("from");
      params.delete("to");
    }
    if (nextPage > 1) params.set("page", String(nextPage));
    router.push(`/sitters?${params.toString()}`);
  }

  function clearAll() {
    setF({ city: "", from: "", to: "", minPrice: "", maxPrice: "", rating: "", experience: "", service: "", sort: "rating" });
    setFormError("");
    router.push("/sitters");
  }

  const today = todayLocal();

  return (
    <>
      <h1 className="text-3xl font-bold text-brand-900">Find a Cat Sitter</h1>
      <p className="mt-1 text-gray-500">Verified sitters near you</p>

      {/* Top search */}
      <div className="card mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_auto]">
        <input value={f.city} onChange={(e) => set("city", e.target.value)} placeholder="City (e.g. Dhaka)" className="input" />
        <input type="date" min={today} value={f.from} onChange={(e) => set("from", e.target.value)} className="input" aria-label="From date" />
        <input type="date" min={f.from || today} value={f.to} onChange={(e) => set("to", e.target.value)} className="input" aria-label="To date" />
        <button onClick={() => apply()} className="btn-primary">Search</button>
      </div>
      {formError && <p className="mt-2 text-sm text-red-600">{formError}</p>}

      <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* Filters */}
        <aside className="card h-fit space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-brand-900">Filters</h2>
            <button onClick={clearAll} className="text-xs font-medium text-brand-600">Clear all</button>
          </div>

          <div>
            <p className="mb-1 text-sm font-medium">Price per day</p>
            <div className="flex items-center gap-2">
              <input type="number" min="0" placeholder="Min" value={f.minPrice} onChange={(e) => set("minPrice", e.target.value)} className="input" />
              <span className="text-gray-400">–</span>
              <input type="number" min="0" placeholder="Max" value={f.maxPrice} onChange={(e) => set("maxPrice", e.target.value)} className="input" />
            </div>
          </div>

          <label className="block text-sm font-medium">
            Rating
            <select value={f.rating} onChange={(e) => set("rating", e.target.value)} className="input mt-1">
              <option value="">Any</option>
              <option value="4.5">4.5 & above</option>
              <option value="4">4.0 & above</option>
              <option value="3.5">3.5 & above</option>
            </select>
          </label>

          <label className="block text-sm font-medium">
            Experience
            <select value={f.experience} onChange={(e) => set("experience", e.target.value)} className="input mt-1">
              <option value="">Any</option>
              <option value="1">1+ years</option>
              <option value="3">3+ years</option>
              <option value="5">5+ years</option>
            </select>
          </label>

          <label className="block text-sm font-medium">
            Service
            <select value={f.service} onChange={(e) => set("service", e.target.value)} className="input mt-1">
              <option value="">Any service</option>
              <option value="Boarding">Boarding</option>
              <option value="Drop-in Visits">Drop-in visits</option>
              <option value="Feeding">Feeding</option>
              <option value="Playtime">Playtime</option>
              <option value="Medication">Medication</option>
              <option value="Overnight Stay">Overnight stay</option>
              <option value="Grooming">Grooming</option>
            </select>
          </label>

          <label className="block text-sm font-medium">
            Sort by
            <select value={f.sort} onChange={(e) => set("sort", e.target.value)} className="input mt-1">
              {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>

          <button onClick={() => apply()} className="btn-primary w-full">Apply Filters</button>
        </aside>

        {/* Results */}
        <section>
          {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}
          {!data && !error && <p className="text-sm text-gray-500">Loading...</p>}

          {data && (
            <>
              <p className="mb-3 text-sm text-gray-500">{data.total} sitter{data.total === 1 ? "" : "s"} found</p>
              {data.sitters.length === 0 ? (
                <EmptyState title="No sitters found" text="Try a different city, dates or fewer filters." />
              ) : (
                <div className="space-y-4">
                  {data.sitters.map((s) => <SitterCard key={s.id} s={s} />)}
                </div>
              )}
              <Pagination page={page} pages={data.pages} onChange={(p) => apply(p)} />
            </>
          )}
        </section>
      </div>
    </>
  );
}
