
export function formatDate(d: string) {
  return new Date(`${d}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatRange(from: string, to: string) {
  return `${formatDate(from)} - ${formatDate(to)}`;
}

// Currency change korte chaile (jemon ৳) shudhu ei ek jaygay change korun
export function money(n: number) {
  const amount = new Intl.NumberFormat("en-BD", { maximumFractionDigits: 2 }).format(n);
  return `৳${amount}`;
}

export function catMeta(c: { breed?: string | null; age?: number | null; gender?: string }) {
  const parts = [
    c.breed || null,
    c.age != null ? `${c.age} ${c.age === 1 ? "Year" : "Years"}` : null,
    c.gender && c.gender !== "unknown" ? c.gender[0].toUpperCase() + c.gender.slice(1) : null,
  ];
  return parts.filter(Boolean).join(" | ") || "No details yet";
}
