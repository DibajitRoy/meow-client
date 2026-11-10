export function addDays(d: string, n: number) {
  const t = new Date(`${d}T00:00:00Z`);
  t.setUTCDate(t.getUTCDate() + n);
  return t.toISOString().slice(0, 10);
}

// from=May 20, to=May 25 => 5
export function nightsBetween(from: string, to: string) {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000);
}

export function todayLocal() {
  return new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
}

// Range gulo ke din-protidin map e vangi: { "2026-05-20": "booked", ... }
export function expandMarks(list: { from: string; to: string; type: string }[]) {
  const out: Record<string, string> = {};
  for (const r of list) {
    // Booking er checkout din free, tai booked hole shesh din bad
    const end = r.type === "booked" ? addDays(r.to, -1) : r.to;
    let d = r.from;
    for (let i = 0; i < 400 && d <= end; i++) {
      out[d] = r.type;
      d = addDays(d, 1);
    }
  }
  return out;
}