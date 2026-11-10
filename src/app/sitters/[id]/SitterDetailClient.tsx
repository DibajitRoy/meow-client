"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, BadgeCheck, Briefcase, MapPin } from "lucide-react";
import { publicApi } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { expandMarks } from "@/lib/calendar";
import { formatDate, money } from "@/lib/format";
import type { PublicReview, SitterDetail, Unavailable } from "@/lib/types";
import Avatar from "@/components/ui/Avatar";
import { Stars } from "@/components/ui/Stars";
import MonthCalendar from "@/components/ui/MonthCalendar";
import EmptyState from "@/components/ui/EmptyState";

type Data = { sitter: SitterDetail; reviews: PublicReview[]; unavailable: Unavailable[] };
const TABS = ["About", "Services", "Availability", "Reviews"] as const;

export default function SitterDetailClient() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = authClient.useSession();
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<(typeof TABS)[number]>("About");

  useEffect(() => {
    publicApi<Data>(`/api/sitters/${id}`)
      .then(setData)
      .catch((e) => setError((e as Error).message));
  }, [id]);

  if (error) {
    return (
      <EmptyState
        title="Sitter not found"
        text={error}
        action={<Link href="/sitters" className="btn-primary">Back to sitters</Link>}
      />
    );
  }
  if (!data) return <p className="text-sm text-gray-500">Loading...</p>;

  const { sitter, reviews, unavailable } = data;
  const role = session?.user.role;

  let bookButton: React.ReactNode;
  if (!session) {
    bookButton = <Link href="/login" className="btn-primary w-full">Login to Book</Link>;
  } else if (role === "owner") {
    bookButton = <Link href={`/dashboard/book/${sitter.id}`} className="btn-primary w-full">Book Now</Link>;
  } else {
    bookButton = <p className="text-xs text-gray-500">Only cat owners can book a sitter.</p>;
  }

  return (
    <>
      <Link href="/sitters" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600">
        <ArrowLeft size={14} /> Back
      </Link>

      <div className="card flex flex-col gap-5 sm:flex-row sm:items-center">
        <Avatar src={sitter.photo} name={sitter.name} size={112} rounded="xl" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-brand-900">{sitter.name}</h1>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600">
              <BadgeCheck size={16} /> Verified Sitter
            </span>
          </div>
          <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
            <span className="inline-flex items-center gap-1"><MapPin size={14} /> {sitter.city}</span>
            <span className="inline-flex items-center gap-1"><Briefcase size={14} /> {sitter.experienceYears} years experience</span>
          </p>
          <div className="mt-2 flex items-center gap-2 text-sm">
            <Stars value={sitter.ratingAvg} />
            <b>{sitter.ratingAvg ? sitter.ratingAvg.toFixed(1) : "New"}</b>
            <span className="text-gray-400">({sitter.ratingCount} reviews)</span>
          </div>
        </div>
        <div className="w-full rounded-2xl bg-brand-50 p-4 text-center sm:w-48">
          <p className="text-3xl font-bold text-brand-700">{money(sitter.pricePerDay)}</p>
          <p className="mb-3 text-xs text-gray-500">per day</p>
          {bookButton}
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 overflow-x-auto border-b border-brand-100">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium transition ${
              tab === t ? "border-brand-500 text-brand-700" : "border-transparent text-gray-500 hover:text-brand-600"
            }`}
          >
            {t}{t === "Reviews" ? ` (${sitter.ratingCount})` : ""}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "About" && (
          <div className="space-y-5">
            <section className="card">
              <h2 className="mb-2 font-semibold text-brand-900">About {sitter.name}</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-gray-600">{sitter.bio}</p>
              {sitter.address && <p className="mt-3 text-sm text-gray-500">📍 {sitter.address}</p>}
            </section>
            {sitter.gallery.length > 0 && (
              <section className="card">
                <h2 className="mb-3 font-semibold text-brand-900">Gallery</h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {sitter.gallery.map((src) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={src} src={src} alt="" className="aspect-square rounded-xl object-cover" />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {tab === "Services" && (
          <section className="card">
            <h2 className="mb-3 font-semibold text-brand-900">Services</h2>
            {sitter.services.length === 0 ? (
              <p className="text-sm text-gray-500">No services listed.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {sitter.services.map((s) => <span key={s} className="badge text-sm">{s}</span>)}
              </div>
            )}
          </section>
        )}

        {tab === "Availability" && (
          <section className="card">
            <h2 className="mb-3 font-semibold text-brand-900">Availability</h2>
            <MonthCalendar marks={expandMarks(unavailable)} />
          </section>
        )}

        {tab === "Reviews" && (
          <section className="space-y-4">
            {reviews.length === 0 ? (
              <EmptyState title="No reviews yet" text="Reviews appear here after completed bookings." />
            ) : (
              reviews.map((r) => (
                <div key={r._id} className="card">
                  <div className="flex items-center gap-3">
                    <Avatar src={r.owner?.image} name={r.owner?.name ?? "O"} size={40} />
                    <div>
                      <p className="text-sm font-semibold">{r.owner?.name}</p>
                      <p className="text-xs text-gray-400">{formatDate(r.createdAt.slice(0, 10))}</p>
                    </div>
                    <div className="ml-auto"><Stars value={r.rating} size={14} /></div>
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
                </div>
              ))
            )}
          </section>
        )}
      </div>
    </>
  );
}
