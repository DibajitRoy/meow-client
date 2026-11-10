"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { todayLocal } from "@/lib/calendar";

type Props = {
  marks?: Record<string, string>;
  onDayClick?: (date: string) => void;
};

const COLORS: Record<string, string> = {
  booked: "bg-brand-200 text-brand-800",
  unavailable: "bg-gray-200 text-gray-500 line-through",
  holiday: "bg-rose-100 text-rose-600",
};

const pad = (n: number) => String(n).padStart(2, "0");

export default function MonthCalendar({ marks = {}, onDayClick }: Props) {
  const today = todayLocal();
  const [cursor, setCursor] = useState({ y: Number(today.slice(0, 4)), m: Number(today.slice(5, 7)) - 1 });

  const first = new Date(Date.UTC(cursor.y, cursor.m, 1));
  const daysInMonth = new Date(Date.UTC(cursor.y, cursor.m + 1, 0)).getUTCDate();
  const cells: (number | null)[] = [
    ...Array(first.getUTCDay()).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const label = first.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });

  function shift(n: number) {
    const d = new Date(Date.UTC(cursor.y, cursor.m + n, 1));
    setCursor({ y: d.getUTCFullYear(), m: d.getUTCMonth() });
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-3 flex items-center justify-between">
        <button type="button" onClick={() => shift(-1)} className="btn-ghost px-2" aria-label="Previous month"><ChevronLeft size={18} /></button>
        <p className="text-sm font-semibold text-brand-900">{label}</p>
        <button type="button" onClick={() => shift(1)} className="btn-ghost px-2" aria-label="Next month"><ChevronRight size={18} /></button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => <span key={d}>{d}</span>)}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <span key={`e${i}`} />;
          const date = `${cursor.y}-${pad(cursor.m + 1)}-${pad(day)}`;
          const mark = marks[date];
          const isPast = date < today;
          return (
            <button
              type="button"
              key={date}
              aria-label={date}
              disabled={!onDayClick}
              onClick={() => onDayClick?.(date)}
              className={`aspect-square rounded-lg text-sm transition ${
                mark ? COLORS[mark] : isPast ? "text-gray-300" : "text-gray-700 hover:bg-brand-50"
              } ${date === today ? "ring-2 ring-brand-400" : ""} ${onDayClick ? "cursor-pointer" : "cursor-default"}`}
            >
              {day}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1"><i className="h-3 w-3 rounded bg-brand-200" /> Booked</span>
        <span className="flex items-center gap-1"><i className="h-3 w-3 rounded bg-gray-200" /> Unavailable</span>
        <span className="flex items-center gap-1"><i className="h-3 w-3 rounded bg-rose-100" /> Holiday</span>
      </div>
    </div>
  );
}