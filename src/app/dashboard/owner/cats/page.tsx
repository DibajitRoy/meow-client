"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { catMeta } from "@/lib/format";
import type { Cat } from "@/lib/types";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Avatar from "@/components/ui/Avatar";

export default function MyCatsPage() {
  const [cats, setCats] = useState<Cat[] | null>(null);
  const [error, setError] = useState("");
  const [toDelete, setToDelete] = useState<Cat | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await api<{ cats: Cat[] }>("/api/cats");
      setCats(r.cats);
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    api<{ cats: Cat[] }>("/api/cats")
      .then((r) => { if (!ignore) setCats(r.cats); })
      .catch((e) => { if (!ignore) setError((e as Error).message); });
    return () => { ignore = true; };
  }, []);

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await api(`/api/cats/${toDelete._id}`, { method: "DELETE" });
      setToDelete(null);
      await load();
    } catch (e) {
      setError((e as Error).message);
      setToDelete(null);
    }
    setDeleting(false);
  }

  const addButton = (
    <Link href="/dashboard/owner/cats/new" className="btn-primary">
      <Plus size={16} /> Add New Cat
    </Link>
  );

  return (
    <>
      <PageHeader title="My Cats" subtitle="Manage the cats you want to book care for" action={addButton} />

      {error && <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      {cats === null && !error && <p className="text-sm text-gray-500">Loading...</p>}

      {cats && cats.length === 0 && (
        <EmptyState
          title="No cats yet"
          text="Add your first cat so you can send booking requests to sitters."
          action={addButton}
        />
      )}

      {cats && cats.length > 0 && (
        <div className="space-y-3">
          {cats.map((cat) => (
            <div key={cat._id} className="card flex items-center gap-4">
              <Avatar src={cat.photo} name={cat.name} size={64} rounded="xl" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-semibold text-brand-900">{cat.name}</p>
                <p className="truncate text-sm text-gray-500">{catMeta(cat)}</p>
                {cat.vaccinated && <span className="badge mt-1">Vaccinated</span>}
              </div>
              <Link href={`/dashboard/owner/cats/${cat._id}/edit`} className="btn-ghost" aria-label={`Edit ${cat.name}`}>
                <Pencil size={18} />
              </Link>
              <button onClick={() => setToDelete(cat)} className="btn-ghost text-red-500 hover:bg-red-50" aria-label={`Delete ${cat.name}`}>
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title={`Delete ${toDelete?.name ?? "cat"}?`}
        message="This cannot be undone. Past bookings will keep their cat details."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
