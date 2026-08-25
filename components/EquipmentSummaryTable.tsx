"use client";

import { useMemo } from "react";
import { Area, IMPORTANCE_COLORS, IMPORTANCE_LABELS, WorkEntry, TransferEntry } from "@/lib/types";
import { toDateKey } from "@/lib/date";

function nearestEntry<T extends WorkEntry>(entries: T[], todayKey: string): T | null {
  const upcoming = entries
    .filter((e) => e.date >= todayKey)
    .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
  return upcoming[0] ?? null;
}

export default function EquipmentSummaryTable({ areas }: { areas: Area[] }) {
  const todayKey = useMemo(() => toDateKey(new Date()), []);

  const totalEquipment = areas.reduce((sum, a) => sum + a.equipment.length, 0);

  if (totalEquipment === 0) {
    return (
      <div className="rounded-xl border border-dashed border-sky-200 bg-white/60 p-8 text-center text-sky-500">
        Пока нет ни одной единицы техники ни в одной вкладке.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {areas
        .filter((a) => a.equipment.length > 0)
        .map((area) => (
          <div key={area.id} className="overflow-hidden rounded-xl border border-sky-100 bg-white shadow-card">
            <div className="border-b border-sky-100 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-900">
              {area.name}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-sky-100 text-xs uppercase text-sky-400">
                    <th className="px-4 py-2 font-medium">Техника</th>
                    <th className="px-4 py-2 font-medium">Статус</th>
                    <th className="px-4 py-2 font-medium">Ближайшая работа</th>
                    <th className="px-4 py-2 font-medium">Ближайшая переброска</th>
                  </tr>
                </thead>
                <tbody>
                  {area.equipment.map((eq) => {
                    const job = nearestEntry(eq.jobs, todayKey);
                    const transfer = nearestEntry<TransferEntry>(eq.transfers, todayKey);
                    const isRepair = eq.status.type === "repair";
                    return (
                      <tr key={eq.id} className="border-b border-sky-50 last:border-0">
                        <td className="px-4 py-2 font-medium text-sky-900">{eq.name}</td>
                        <td className="px-4 py-2">
                          <span
                            className={`inline-block rounded-full border px-2 py-0.5 text-xs ${
                              isRepair
                                ? "border-rose-300 bg-rose-100 text-rose-700"
                                : "border-emerald-300 bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {isRepair
                              ? `🔧 ${eq.status.issue ?? "Неисправность"} · до ${eq.status.repairEnd ?? "?"}`
                              : "✅ Исправна"}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sky-700">
                          {job ? (
                            <div>
                              <div className="font-medium text-sky-900">{job.title}</div>
                              <div className="text-xs text-sky-500">
                                {job.date} · {job.startTime}–{job.endTime} · {job.address}
                              </div>
                              <span
                                className={`mt-0.5 inline-block rounded-full border px-1.5 py-0 text-[11px] ${IMPORTANCE_COLORS[job.importance]}`}
                              >
                                {IMPORTANCE_LABELS[job.importance]}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sky-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-sky-700">
                          {transfer ? (
                            <div>
                              <div className="font-medium text-sky-900">{transfer.title}</div>
                              <div className="text-xs text-sky-500">
                                {transfer.date} · {transfer.startTime}–{transfer.endTime} · {transfer.address}
                              </div>
                            </div>
                          ) : (
                            <span className="text-sky-300">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
    </div>
  );
}
