"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { Review, SitterProfile } from "@/lib/types";
import PageHeader from "@/components/ui/PageHeader";
import Avatar from "@/components/ui/Avatar";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import { Stars } from "@/components/ui/Stars";

type Result = { reviews: Review[]; pages: number };

export default function SitterReviewsPage() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Result | null>(null);
  const [profile, setProfile] = useState<SitterProfile | null>(null);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [target, setTarget] = useState<Review | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let ignore = false;
    Promise.all([
      api<Result>(`/api/reviews/mine?page=${page}`),
      api<{ profile: SitterProfile | null }>("/api/sitters/me/profile"),
    ])
      .then(([r, p]) => {
        if (!ignore) {
          setData(r);
          setProfile(p.profile);
        }
      })
      .catch((e) => {
        if (!ignore) setError((e as Error).message);
      });
    return () => {
      ignore = true;
    };
  }, [page, reload]);

  async function report() {
    if (!target) return;
    if (reason.trim().length < 3) return setError("Please write a short reason");
    setBusy(true);
    setError("");
    try {
      await api(`/api/reviews/${target._id}/report`, { method: "POST", body: JSON.stringify({ reason: reason.trim() }) });
      setTarget(null);
      setReason("");
      setReload((n) => n + 1);
    } catch (e) {
      setError((e as Error).message);
    }
    setBusy(false);
  }

  return (
    <>
      <PageHeader title="Reviews" subtitle="What owners say about you" />

      {profile && (
        <div className="card mb-6 flex items-center gap-4">
          <p className="text-4xl font-bold text-brand-700">{profile.ratingAvg ? profile.ratingAvg.toFixed(1) : "—"}</p>
          <div>
            <Stars value={profile.ratingAvg} />
            <p className="text-xs text-gray-500">{profile.ratingCount} review{profile.ratingCount === 1 ? "" : "s"}</p>
          </div>
        </div>
      )}

      {error && <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      {!data && !error && <p className="text-sm text-gray-500">Loading...</p>}
      {data && data.reviews.length === 0 && <EmptyState title="No reviews yet" text="Reviews appear after owners complete a booking with you." />}

      {data && data.reviews.length > 0 && (
        <div className="space-y-3">
          {data.reviews.map((r) => (
            <div key={r._id} className="card">
              <div className="flex items-center gap-3">
                <Avatar src={r.owner?.image} name={r.owner?.name ?? "O"} size={44} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{r.owner?.name}</p>
                  <p className="text-xs text-gray-400">{formatDate(r.createdAt.slice(0, 10))}</p>
                </div>
                <Stars value={r.rating} size={14} />
              </div>
              <p className="mt-3 text-sm text-gray-600">{r.comment}</p>
              {r.photos.length > 0 && (
                <div className="mt-3 flex gap-2">
                  {r.photos.map((p) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={p} src={p} alt="" className="h-16 w-16 rounded-lg object-cover" />
                  ))}
                </div>
              )}
              <div className="mt-3 flex items-center gap-3">
                {r.status === "visible" ? (
                  <button onClick={() => { setTarget(r); setReason(""); setError(""); }} className="text-xs font-medium text-red-500 hover:underline">
                    Report this review
                  </button>
                ) : (
                  <StatusBadge status={r.status} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {data && <Pagination page={page} pages={data.pages} onChange={setPage} />}

      {target && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-brand-900">Report this review</h3>
            <p className="mt-1 text-sm text-gray-600">Tell the admin team why this review should be checked.</p>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} maxLength={300} className="input mt-3" placeholder="Reason..." />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <button className="btn-outline" onClick={() => setTarget(null)} disabled={busy}>Cancel</button>
              <button className="btn-primary" onClick={report} disabled={busy}>{busy ? "Sending..." : "Report"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}