"use client";

import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import PageHeader from "@/components/ui/PageHeader";
import CatForm from "@/components/owner/CatForm";

export default function NewCatPage() {
  const router = useRouter();

  async function create(payload: Record<string, unknown>) {
    await api("/api/cats", { method: "POST", body: JSON.stringify(payload) });
    router.push("/dashboard/owner/cats");
  }

  return (
    <>
      <PageHeader title="Add New Cat" subtitle="Tell sitters about your cat" />
      <CatForm submitLabel="Add Cat" onSubmit={create} />
    </>
  );
}