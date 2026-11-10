"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { SitterProfile } from "@/lib/types";
import PageHeader from "@/components/ui/PageHeader";
import Avatar from "@/components/ui/Avatar";
import StatusBadge from "@/components/ui/StatusBadge";
import Pagination from "@/components/ui/Pagination";
import { money } from "@/lib/format";

type Sitter = SitterProfile & { userId: string; name: string; email: string | null; photo: string | null; createdAt: string };
type Result = { sitters: Sitter[]; page: number; pages: number; total: number };

export default function AdminSittersPage() {
  const [data, setData] = useState<Result | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("pending");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [reason, setReason] = useState<Record<string, string>>({});
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let ignore = false;
    api<Result>(`/api/admin/sitters?page=${page}&status=${status}`).then((r) => { if (!ignore) { setData(r); setError(""); } }).catch((e) => { if (!ignore) setError((e as Error).message); });
    return () => { ignore = true; };
  }, [page, status, reload]);

  async function review(userId: string, next: "verified" | "rejected") {
    setBusy(userId); setError("");
    try {
      await api(`/api/admin/sitters/${userId}/verification`, { method: "PATCH", body: JSON.stringify({ status: next, ...(next === "rejected" ? { reason: reason[userId]?.trim() || "Please update your profile and resubmit." } : {}) }) });
      setReload((n) => n + 1);
    } catch (e) { setError((e as Error).message); }
    setBusy("");
  }

  return <>
    <PageHeader title="Sitter Verification" subtitle="Review sitter profiles before they appear in search" />
    <div className="mb-4 flex gap-2">
      {[["pending", "Pending"], ["verified", "Verified"], ["rejected", "Rejected"], ["", "All"]].map(([value, label]) => <button key={value} onClick={() => { setStatus(value); setPage(1); }} className={`rounded-xl px-4 py-2 text-sm ${status === value ? "bg-brand-500 text-white" : "border border-brand-200 bg-white text-gray-600"}`}>{label}</button>)}
    </div>
    {error && <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}
    {!data && !error && <p className="text-sm text-gray-500">Loading sitter profiles...</p>}
    {data && data.sitters.length === 0 && <div className="card text-sm text-gray-500">No sitter profiles in this view.</div>}
    {data && <div className="space-y-4">
      {data.sitters.map((s) => <article key={s.userId} className="card">
        <div className="flex flex-wrap items-center gap-4"><Avatar src={s.photo} name={s.name} size={56} /><div className="min-w-0 flex-1"><h2 className="font-semibold text-brand-900">{s.name}</h2><p className="text-sm text-gray-500">{s.email ?? ""} · {s.city} · {s.experienceYears} years experience</p></div><StatusBadge status={s.verificationStatus} /></div>
        <p className="mt-4 whitespace-pre-wrap text-sm text-gray-700">{s.bio}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm"><span className="font-semibold">{money(s.pricePerDay)} / day</span>{s.services.map((service) => <span key={service} className="rounded-full bg-brand-50 px-2.5 py-1 text-xs text-brand-700">{service}</span>)}</div>
        {s.verificationStatus !== "verified" && <label className="mt-4 block text-sm">Rejection note <input className="input mt-1" maxLength={300} value={reason[s.userId] ?? s.rejectionReason ?? ""} onChange={(e) => setReason((old) => ({ ...old, [s.userId]: e.target.value }))} placeholder="Reason shown to the sitter" /></label>}
        {s.verificationStatus !== "verified" && <div className="mt-3 flex justify-end gap-2"><button disabled={busy === s.userId} className="btn-ghost text-red-600" onClick={() => review(s.userId, "rejected")}>Reject</button><button disabled={busy === s.userId} className="btn-primary" onClick={() => review(s.userId, "verified")}>{busy === s.userId ? "Saving..." : "Verify sitter"}</button></div>}
        {s.verificationStatus === "verified" && <div className="mt-3 flex justify-end"><button disabled={busy === s.userId} className="btn-ghost text-red-600" onClick={() => review(s.userId, "rejected")}>{busy === s.userId ? "Saving..." : "Revoke verification"}</button></div>}
      </article>)}
    </div>}
    {data && <Pagination page={data.page} pages={data.pages} onChange={setPage} />}
  </>;
}
