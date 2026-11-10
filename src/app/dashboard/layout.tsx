import { Suspense } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="flex min-h-screen flex-1 items-center justify-center bg-brand-50/50 text-sm text-gray-500">Loading dashboard...</div>}>
      <DashboardShell>{children}</DashboardShell>
    </Suspense>
  );
}
