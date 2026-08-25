"use client";

import { formatDateKeyLong, shiftDateKey, toDateKey } from "@/lib/date";

export default function DateNav({
  date,
  onChange,
}: {
  date: string;
  onChange: (date: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => onChange(shiftDateKey(date, -1))}
        className="rounded-lg border border-sky-200 bg-white px-2 py-1.5 text-sky-500 hover:bg-sky-50"
        aria-label="Предыдущий день"
      >
        ‹
      </button>
      <input
        type="date"
        value={date}
        onChange={(e) => e.target.value && onChange(e.target.value)}
        className="rounded-lg border border-sky-200 bg-white px-3 py-1.5 text-sm text-sky-900 outline-none focus:border-sky-500"
      />
      <button
        onClick={() => onChange(shiftDateKey(date, 1))}
        className="rounded-lg border border-sky-200 bg-white px-2 py-1.5 text-sky-500 hover:bg-sky-50"
        aria-label="Следующий день"
      >
        ›
      </button>
      <button
        onClick={() => onChange(toDateKey(new Date()))}
        className="rounded-lg border border-sky-100 bg-sky-50 px-2 py-1.5 text-xs text-sky-600 hover:bg-sky-100"
      >
        Сегодня
      </button>
      <span className="text-sm text-sky-500">{formatDateKeyLong(date)}</span>
    </div>
  );
}
