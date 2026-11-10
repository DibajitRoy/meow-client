"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Review } from "@/lib/types";
import PageHeader from "@/components/ui/PageHeader";
import Avatar from "@/components/ui/Avatar";
import StatusBadge from "@/components/ui/StatusBadge";
import Pagination from "@/components/ui/Pagination";
import { Stars } from "@/components/ui/Stars";
import { formatDate } from "@/lib/format";

type Item = Review & { reportReason?: string };
type Result = { reviews: Item[]; page: number; pages: number; total: number };

export default function AdminReviewsPage() {
  const [data, setData] = useState<Result | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("reported");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let ignore = false;
    api<Result>(`/api/admin/reviews?page=${page}&status=${status}`).then((r) => { if (!ignore) { setData(r); setError(""); } }).catch((e) => { if (!ignore) setError((e as Error).message); });
    return () => { ignore = true; };
  }, [page, status, reload]);

  async function moderate(review: Item, next: "visible" | "hidden") {
    setBusy(review._id); setError("");
    try {
      await api(`/api/admin/reviews/${review._id}`, { method: "PATCH", body: JSON.stringify({ status: next }) });
      setReload((n) => n + 1);
    } catch (e) { setError((e as Error).message); }
    setBusy("");
  }

  return <>
    <PageHeader title="Review Moderation" subtitle="Check reports and hide reviews that violate platform rules" />
    <div className="mb-4 flex gap-2">{[["reported", "Reported"], ["visible", "Visible"], ["hidden", "Hidden"], ["", "All"]].map(([value, label]) => <button key={value} onClick={() => { setStatus(value); setPage(1); }} className={`rounded-xl px-4 py-2 text-sm ${status === value ? "bg-brand-500 text-white" : "border border-brand-200 bg-white text-gray-600"}`}>{label}</button>)}</div>
    {error && <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}
    {!data && !error && <p className="text-sm text-gray-500">Loading reviews...</p>}
    {data && data.reviews.length === 0 && <div className="card text-sm text-gray-500">No reviews in this view.</div>}
    {data && <div className="space-y-3">{data.reviews.map((review) => <article key={review._id} className="card">
      <div className="flex flex-wrap items-center gap-3"><Avatar src={review.owner?.image} name={review.owner?.name ?? "Owner"} size={42} /><div className="min-w-0 flex-1"><p className="font-semibold">{review.owner?.name ?? "Owner"} reviewed {review.sitter?.name ?? "Sitter"}</p><p className="text-xs text-gray-400">{formatDate(review.createdAt.slice(0, 10))}</p></div><Stars value={review.rating} size={14} /><StatusBadge status={review.status} /></div>
      <p className="mt-3 whitespace-pre-wrap text-sm text-gray-700">{review.comment}</p>
      {review.reportReason && <p className="mt-3 rounded-xl bg-orange-50 p-3 text-sm text-orange-800"><b>Report reason:</b> {review.reportReason}</p>}
      <div className="mt-3 flex justify-end gap-2">{review.status !== "visible" && <button disabled={busy === review._id} onClick={() => moderate(review, "visible")} className="btn-outline">Keep visible</button>}{review.status !== "hidden" && <button disabled={busy === review._id} onClick={() => moderate(review, "hidden")} className="btn-ghost text-red-600">Hide review</button>}</div>
    </article>)}</div>}
    {data && <Pagination page={data.page} pages={data.pages} onChange={setPage} />}
  </>;
}
