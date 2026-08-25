"use client";

import { useState } from "react";
import { EXPORT_PERIOD_LABELS, ExportPeriod, periodRange } from "@/lib/date";

export default function ExportButton({
  referenceDate,
  onExport,
}: {
  referenceDate: string;
  onExport: (range: { start: string; end: string }) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg border border-sky-200 bg-white px-3 py-1.5 text-sm font-medium text-sky-700 hover:bg-sky-50"
      >
        ⬇ Выгрузить в Excel
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-52 rounded-xl border border-sky-100 bg-white p-1.5 shadow-2xl">
            {(Object.keys(EXPORT_PERIOD_LABELS) as ExportPeriod[]).map((period) => (
              <button
                key={period}
                onClick={() => {
                  onExport(periodRange(referenceDate, period));
                  setOpen(false);
                }}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-sky-700 hover:bg-sky-50"
              >
                {EXPORT_PERIOD_LABELS[period]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
