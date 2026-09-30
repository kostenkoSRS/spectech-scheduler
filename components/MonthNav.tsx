"use client";

import { MONTH_NAMES } from "@/lib/date";

export default function MonthNav({
  year,
  month,
  onChange,
}: {
  year: number;
  month: number;
  onChange: (year: number, month: number) => void;
}) {
  function shift(delta: number) {
    const d = new Date(year, month + delta, 1);
    onChange(d.getFullYear(), d.getMonth());
  }

  const now = new Date();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => shift(-1)}
        className="rounded-lg border border-sky-200 bg-white px-2 py-1.5 text-sky-500 hover:bg-sky-50"
        aria-label="Предыдущий месяц"
      >
        ‹
      </button>
      <span className="min-w-[140px] text-center text-sm font-medium text-sky-900">
        {MONTH_NAMES[month]} {year}
      </span>
      <button
        onClick={() => shift(1)}
        className="rounded-lg border border-sky-200 bg-white px-2 py-1.5 text-sky-500 hover:bg-sky-50"
        aria-label="Следующий месяц"
      >
        ›
      </button>
      <button
        onClick={() => onChange(now.getFullYear(), now.getMonth())}
        className="rounded-lg border border-sky-100 bg-sky-50 px-2 py-1.5 text-xs text-sky-600 hover:bg-sky-100"
      >
        Текущий месяц
      </button>
    </div>
  );
}
