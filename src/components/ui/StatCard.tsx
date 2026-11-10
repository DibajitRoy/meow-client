import type { LucideIcon } from "lucide-react";

type Props = { icon: LucideIcon; label: string; value: string | number };

export default function StatCard({ icon: Icon, label, value }: Props) {
  return (
    <div className="card flex items-center gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
        <Icon size={22} />
      </div>
      <div>
        <p className="text-2xl font-bold text-brand-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}