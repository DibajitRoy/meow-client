"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function DashboardRedirect() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (session) router.replace(`/dashboard/${session.user.role ?? "owner"}`);
  }, [session, router]);

  return <p className="text-sm text-gray-500">Redirecting...</p>;
}