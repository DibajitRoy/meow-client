export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-brand-100" />
      <div className="h-32 animate-pulse rounded-2xl bg-brand-100/70" />
      <div className="h-32 animate-pulse rounded-2xl bg-brand-100/70" />
    </div>
  );
}