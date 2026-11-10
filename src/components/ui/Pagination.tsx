"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = { page: number; pages: number; onChange: (page: number) => void };

export default function Pagination({ page, pages, onChange }: Props) {
  if (pages <= 1) return null;
  return (
    <div className="mt-6 flex items-center justify-center gap-2">
      <button className="btn-outline px-3" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page">
        <ChevronLeft size={16} />
      </button>
      <span className="text-sm text-gray-600">
        Page {page} of {pages}
      </span>
      <button className="btn-outline px-3" disabled={page >= pages} onClick={() => onChange(page + 1)} aria-label="Next page">
        <ChevronRight size={16} />
      </button>
    </div>
  );
}