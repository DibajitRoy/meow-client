"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Cat } from "@/lib/types";
import PageHeader from "@/components/ui/PageHeader";
import CatForm from "@/components/owner/CatForm";

export default function EditCatPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [cat, setCat] = useState<Cat | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<{ cat: Cat }>(`/api/cats/${id}`)
      .then((r) => setCat(r.cat))
      .catch((e) => setError((e as Error).message));
  }, [id]);

  async function update(payload: Record<string, unknown>) {
    await api(`/api/cats/${id}`, { method: "PUT", body: JSON.stringify(payload) });
    router.push("/dashboard/owner/cats");
  }

  return (
    <>
      <PageHeader title="Edit Cat" />
      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      {!cat && !error && <p className="text-sm text-gray-500">Loading...</p>}
      {cat && <CatForm initial={cat} submitLabel="Save Changes" onSubmit={update} />}
    </>
  );
}