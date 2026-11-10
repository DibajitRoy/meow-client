"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { Review } from "@/lib/types";
import PageHeader from "@/components/ui/PageHeader";
import Avatar from "@/components/ui/Avatar";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import { Stars } from "@/components/ui/Stars";

type Result = { reviews: Review[]; pages: number };

export default function OwnerReviewsPage() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Result | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    api<Result>(`/api/reviews/mine?page=${page}`)
      .then((r) => {
        if (!ignore) setData(r);
      })
      .catch((e) => {
        if (!ignore) setError((e as Error).message);
      });
    return () => {
      ignore = true;
    };
  }, [page]);

  return (
    <>
      <PageHeader title="My Reviews" subtitle="Reviews you have written for sitters" />
      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      {!data && !error && <p className="text-sm text-gray-500">Loading...</p>}

      {data && data.reviews.length === 0 && (
        <EmptyState title="No reviews yet" text="After a booking is completed you can review your sitter." />
      )}

      {data && data.reviews.length > 0 && (
        <div className="space-y-3">
          {data.reviews.map((r) => (
            <div key={r._id} className="card">
              <div className="flex items-center gap-3">
                <Avatar src={r.sitter?.image} name={r.sitter?.name ?? "S"} size={44} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{r.sitter?.name}</p>
                  <p className="text-xs text-gray-400">{formatDate(r.createdAt.slice(0, 10))}</p>
                </div>
                <Stars value={r.rating} size={14} />
                {r.status !== "visible" && <StatusBadge status={r.status} />}
              </div>
              <p className="mt-3 text-sm text-gray-600">{r.comment}</p>
            </div>
          ))}
        </div>
      )}

      {data && <Pagination page={page} pages={data.pages} onChange={setPage} />}
    </>
  );
}