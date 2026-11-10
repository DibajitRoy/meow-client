"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { api } from "@/lib/api";
import type { PublicUser } from "@/lib/types";
import PageHeader from "@/components/ui/PageHeader";
import Pagination from "@/components/ui/Pagination";
import StatusBadge from "@/components/ui/StatusBadge";

type AdminUser = PublicUser & { email: string; phone: string | null; role: string; status: string; createdAt: string };
type Result = { users: AdminUser[]; page: number; pages: number; total: number };

export default function AdminUsersPage() {
  const [data, setData] = useState<Result | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [role, setRole] = useState("");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page) });
    if (status) params.set("status", status);
    if (role) params.set("role", role);
    if (query) params.set("q", query);
    let ignore = false;
    api<Result>(`/api/admin/users?${params}`).then((r) => { if (!ignore) { setData(r); setError(""); } }).catch((e) => { if (!ignore) setError((e as Error).message); });
    return () => { ignore = true; };
  }, [page, status, role, query, reload]);

  async function toggle(user: AdminUser) {
    setBusy(user.id); setError("");
    try {
      await api(`/api/admin/users/${user.id}/status`, { method: "PATCH", body: JSON.stringify({ status: user.status === "blocked" ? "active" : "blocked" }) });
      setReload((n) => n + 1);
    } catch (e) { setError((e as Error).message); }
    setBusy("");
  }

  return <>
    <PageHeader title="User Management" subtitle="Search accounts and manage access" />
    <div className="card mb-4 grid gap-3 sm:grid-cols-[1fr_180px_180px_auto]">
      <label className="sr-only" htmlFor="user-search">Search users</label><input id="user-search" className="input" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { setPage(1); setQuery(search.trim()); } }} placeholder="Search name or email" />
      <select aria-label="Role" className="input" value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}><option value="">All roles</option><option value="owner">Owners</option><option value="sitter">Sitters</option><option value="admin">Admins</option></select>
      <select aria-label="Account status" className="input" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}><option value="">All statuses</option><option value="active">Active</option><option value="blocked">Blocked</option></select>
      <button className="btn-primary" onClick={() => { setPage(1); setQuery(search.trim()); }}><Search size={16} /> Search</button>
    </div>
    {error && <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}
    {!data && !error && <p className="text-sm text-gray-500">Loading users...</p>}
    {data && <>
      <p className="mb-3 text-sm text-gray-500">{data.total} account{data.total === 1 ? "" : "s"}</p>
      {data.users.length === 0 ? <div className="card text-sm text-gray-500">No users match those filters.</div> : <div className="space-y-3">
        {data.users.map((user) => <article key={user.id} className="card flex flex-wrap items-center gap-3">
          <div className="min-w-0 flex-1"><p className="font-semibold text-brand-900">{user.name}</p><p className="break-all text-sm text-gray-500">{user.email}{user.phone ? ` · ${user.phone}` : ""}</p></div>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs capitalize text-brand-700">{user.role}</span><StatusBadge status={user.status} />
          {user.role !== "admin" && <button disabled={busy === user.id} onClick={() => toggle(user)} className={user.status === "blocked" ? "btn-outline" : "btn-ghost text-red-600"}>{busy === user.id ? "Saving..." : user.status === "blocked" ? "Reactivate" : "Block account"}</button>}
        </article>)}
      </div>}
      <Pagination page={data.page} pages={data.pages} onChange={setPage} />
    </>}
  </>;
}
