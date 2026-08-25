"use client";

import { useState } from "react";
import { Area, IMPORTANCE_COLORS, IMPORTANCE_LABELS, TransferEntry, WorkEntry } from "@/lib/types";
import { eachDateKeyInRange, toDateKey } from "@/lib/date";
import { equipmentStatusOnDate } from "@/lib/equipment";
import { exportSheetsToExcel } from "@/lib/excel";
import DateNav from "./DateNav";
import ExportButton from "./ExportButton";

function entriesOnDate<T extends WorkEntry>(entries: T[], dateKey: string): T[] {
  return entries
    .filter((e) => e.date === dateKey)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
}

export default function EquipmentSummaryTable({ areas }: { areas: Area[] }) {
  const [selectedDate, setSelectedDate] = useState(toDateKey(new Date()));

  const totalEquipment = areas.reduce((sum, a) => sum + a.equipment.length, 0);

  function handleExport(range: { start: string; end: string }) {
    const exportRows: Record<string, string>[] = [];
    // группируем по району (не по дате), чтобы строки одного района шли подряд
    // и корректно объединялись в одну ячейку при экспорте
    for (const area of areas) {
      for (const dateKey of eachDateKeyInRange(range.start, range.end)) {
        for (const eq of area.equipment) {
          const status = equipmentStatusOnDate(eq, dateKey);
          const jobs = entriesOnDate(eq.jobs, dateKey);
          const transfers = entriesOnDate<TransferEntry>(eq.transfers, dateKey);
          if (jobs.length === 0 && transfers.length === 0 && range.start !== range.end) {
            continue; // на многодневной выгрузке не засоряем пустыми днями
          }
          exportRows.push({
            Район: area.name,
            Дата: dateKey,
            Техника: eq.name,
            Статус: status.broken ? `Неисправна: ${status.issue ?? ""}` : "Исправна",
            "Работы на дату": jobs
              .map((j) => `${j.startTime}-${j.endTime} ${j.title} (${j.address})`)
              .join("; "),
            "Переброски на дату": transfers
              .map((t) => `${t.startTime}-${t.endTime} ${t.title} (${t.address})`)
              .join("; "),
          });
        }
      }
    }
    exportSheetsToExcel(`Свод техники — ${range.start}_${range.end}`, [
      { name: "Свод", rows: exportRows, mergeColumn: "Район" },
    ]);
  }

  if (totalEquipment === 0) {
    return (
      <div className="rounded-xl border border-dashed border-sky-200 bg-white/60 p-8 text-center text-sky-500">
        Пока нет ни одной единицы техники ни в одной вкладке.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <DateNav date={selectedDate} onChange={setSelectedDate} />
        <ExportButton referenceDate={selectedDate} onExport={handleExport} />
      </div>

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
                      <th className="w-56 px-4 py-2 font-medium">Техника</th>
                      <th className="w-48 px-4 py-2 font-medium">Статус</th>
                      <th className="px-4 py-2 font-medium">Работы на дату</th>
                      <th className="px-4 py-2 font-medium">Переброски на дату</th>
                    </tr>
                  </thead>
                  <tbody>
                    {area.equipment.map((eq) => {
                      const status = equipmentStatusOnDate(eq, selectedDate);
                      const jobs = entriesOnDate(eq.jobs, selectedDate);
                      const transfers = entriesOnDate<TransferEntry>(eq.transfers, selectedDate);
                      return (
                        <tr key={eq.id} className="border-b border-sky-50 last:border-0">
                          <td className="w-56 px-4 py-2 font-medium text-sky-900">{eq.name}</td>
                          <td className="w-48 px-4 py-2">
                            <span
                              className={`inline-block rounded-full border px-2 py-0.5 text-xs ${
                                status.broken
                                  ? "border-rose-300 bg-rose-100 text-rose-700"
                                  : "border-emerald-300 bg-emerald-100 text-emerald-700"
                              }`}
                            >
                              {status.broken ? `🔧 ${status.issue ?? "Неисправность"}` : "✅ Исправна"}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-sky-700">
                            {jobs.length > 0 ? (
                              <div className="flex flex-col gap-1.5">
                                {jobs.map((job) => (
                                  <div key={job.id}>
                                    <div className="font-medium text-sky-900">{job.title}</div>
                                    <div className="text-xs text-sky-500">
                                      {job.startTime}–{job.endTime} · {job.address}
                                    </div>
                                    <span
                                      className={`mt-0.5 inline-block rounded-full border px-1.5 py-0 text-[11px] ${IMPORTANCE_COLORS[job.importance]}`}
                                    >
                                      {IMPORTANCE_LABELS[job.importance]}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-sky-300">—</span>
                            )}
                          </td>
                          <td className="px-4 py-2 text-sky-700">
                            {transfers.length > 0 ? (
                              <div className="flex flex-col gap-1.5">
                                {transfers.map((t) => (
                                  <div key={t.id}>
                                    <div className="font-medium text-sky-900">{t.title}</div>
                                    <div className="text-xs text-sky-500">
                                      {t.startTime}–{t.endTime} · {t.address}
                                    </div>
                                  </div>
                                ))}
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
    </div>
  );
}
