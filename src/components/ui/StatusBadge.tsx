const STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  accepted: "bg-emerald-100 text-emerald-700",
  verified: "bg-emerald-100 text-emerald-700",
  active: "bg-emerald-100 text-emerald-700",
  visible: "bg-emerald-100 text-emerald-700",
  completed: "bg-sky-100 text-sky-700",
  rejected: "bg-red-100 text-red-700",
  cancelled: "bg-red-100 text-red-700",
  blocked: "bg-red-100 text-red-700",
  reported: "bg-orange-100 text-orange-700",
  hidden: "bg-gray-200 text-gray-600",
  unavailable: "bg-gray-200 text-gray-600",
  holiday: "bg-rose-100 text-rose-700",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
        STYLES[status] ?? "bg-brand-100 text-brand-700"
      }`}
    >
      {status}
    </span>
  );
}