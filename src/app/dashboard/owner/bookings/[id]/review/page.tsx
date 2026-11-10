"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { formatRange } from "@/lib/format";
import type { Booking } from "@/lib/types";
import PageHeader from "@/components/ui/PageHeader";
import Avatar from "@/components/ui/Avatar";
import EmptyState from "@/components/ui/EmptyState";
import { StarInput } from "@/components/ui/Stars";

export default function WriteReviewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [b, setB] = useState<Booking | null>(null);
  const [loadError, setLoadError] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api<{ booking: Booking }>(`/api/bookings/${id}`)
      .then((r) => setB(r.booking))
      .catch((e) => setLoadError((e as Error).message));
  }, [id]);

  if (loadError) return <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{loadError}</p>;
  if (!b) return <p className="text-sm text-gray-500">Loading...</p>;

  if (b.status !== "completed" || b.reviewed) {
    return (
      <EmptyState
        title={b.reviewed ? "Already reviewed" : "Booking not completed yet"}
        text={b.reviewed ? "You have already reviewed this booking." : "You can review a sitter after the booking is completed."}
        action={<Link href={`/dashboard/owner/bookings/${b._id}`} className="btn-primary">Back to booking</Link>}
      />
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (rating < 1) return setError("Please select a rating");
    if (comment.trim().length < 5) return setError("Please write at least a few words");
    setLoading(true);
    try {
      await api("/api/reviews", {
        method: "POST",
        body: JSON.stringify({
          bookingId: id,
          rating,
          comment: comment.trim(),
          photos: photos.map((p) => p.trim()).filter(Boolean),
        }),
      });
      router.push("/dashboard/owner/reviews");
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader title="Write a Review" />
      <form onSubmit={submit} className="card max-w-2xl space-y-5">
        <div className="flex items-center gap-3 rounded-xl bg-brand-50 p-3">
          <Avatar src={b.sitter?.image} name={b.sitter?.name ?? "S"} size={52} />
          <div>
            <p className="font-semibold">{b.sitter?.name}</p>
            <p className="text-xs text-gray-500">{formatRange(b.from, b.to)} · {b.cat.name}</p>
          </div>
        </div>

        <div>
          <p className="mb-1 text-sm font-medium">Your rating</p>
          <StarInput value={rating} onChange={setRating} />
        </div>

        <label className="block text-sm font-medium">
          Your review
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4} maxLength={1000} className="input mt-1" placeholder="Share your experience with the sitter..." />
        </label>

        <div>
          <p className="mb-1 text-sm font-medium">Photos (optional, image links)</p>
          <div className="space-y-2">
            {photos.map((p, i) => (
              <div key={i} className="flex gap-2">
                <input value={p} onChange={(e) => setPhotos(photos.map((x, j) => (j === i ? e.target.value : x)))} className="input" placeholder="https://..." />
                <button type="button" onClick={() => setPhotos(photos.filter((_, j) => j !== i))} className="btn-ghost text-red-500">Remove</button>
              </div>
            ))}
          </div>
          {photos.length < 4 && (
            <button type="button" onClick={() => setPhotos([...photos, ""])} className="mt-2 text-sm font-medium text-brand-600">+ Add photo link</button>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-3">
          <button disabled={loading} className="btn-primary">{loading ? "Submitting..." : "Submit Review"}</button>
          <Link href={`/dashboard/owner/bookings/${b._id}`} className="btn-outline">Cancel</Link>
        </div>
      </form>
    </>
  );
}