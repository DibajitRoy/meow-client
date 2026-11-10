"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { api } from "@/lib/api";
import PageHeader from "@/components/ui/PageHeader";

type Notice = { _id: string; title: string; message: string; link: string | null; read: boolean; createdAt: string };

export default function NotificationsPage() {
  const [items, setItems] = useState<Notice[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => { api<{ notifications: Notice[] }>("/api/notifications").then((r) => setItems(r.notifications)).catch((e) => setError((e as Error).message)); }, []);

  async function markRead(id: string) {
    try {
      await api(`/api/notifications/${id}/read`, { method: "PATCH" });
      setItems((current) => current?.map((n) => n._id === id ? { ...n, read: true } : n) ?? null);
    } catch (e) { setError((e as Error).message); }
  }

  async function markAll() {
    try {
      await api("/api/notifications/read-all", { method: "PATCH" });
      setItems((current) => current?.map((n) => ({ ...n, read: true })) ?? null);
    } catch (e) { setError((e as Error).message); }
  }

  return <>
    <PageHeader title="Notifications" subtitle="Booking and account updates" action={<button className="btn-outline" onClick={markAll}><CheckCheck size={16} /> Mark all read</button>} />
    {error && <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}
    {!items && !error && <p className="text-sm text-gray-500">Loading notifications...</p>}
    {items?.length === 0 && <div className="card flex items-center gap-3 text-sm text-gray-500"><Bell size={18} /> You are all caught up.</div>}
    {items && items.length > 0 && <ul className="space-y-3">{items.map((n) => <li key={n._id} className={`card flex items-start gap-3 ${n.read ? "opacity-75" : "border-brand-300"}`}>
      <span className={`mt-1 rounded-full p-2 ${n.read ? "bg-gray-100 text-gray-500" : "bg-brand-100 text-brand-700"}`}><Bell size={16} /></span>
      <div className="min-w-0 flex-1"><p className="font-semibold text-brand-900">{n.title}</p><p className="mt-1 text-sm text-gray-600">{n.message}</p><p className="mt-2 text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</p>
        {n.link && <Link href={n.link} onClick={() => { if (!n.read) void markRead(n._id); }} className="mt-2 inline-block text-sm font-medium text-brand-600">Open details</Link>}
      </div>
      {!n.read && <button className="btn-ghost text-xs" onClick={() => markRead(n._id)}>Mark read</button>}
    </li>)}</ul>}
  </>;
}
