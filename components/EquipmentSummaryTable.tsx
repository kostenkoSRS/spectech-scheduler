"use client";

import { useState } from "react";
import { Area } from "@/lib/types";
import { datesInMonth, eachDateKeyInRange, toDateKey } from "@/lib/date";
import { dayCellInfo, WORKLOAD_LEVEL_BG } from "@/lib/equipment";
import { exportSheetsToExcel } from "@/lib/excel";
import MonthNav from "./MonthNav";
import ExportButton from "./ExportButton";

export default function EquipmentSummaryTable({ areas }: { areas: Area[] }) {
  const sortedAreas = [...areas].sort((a, b) => a.name.localeCompare(b.name, "ru"));
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const days = datesInMonth(year, month);
  const todayKey = toDateKey(now);

  const totalEquipment = areas.reduce((sum, a) => sum + a.equipment.length, 0);

  function handleExport(range: { start: string; end: string }) {
    const exportRows: Record<string, string>[] = [];
    for (const area of sortedAreas) {
      const eqList = area.equipment.length > 0 ? area.equipment : [null];
      for (const eq of eqList) {
        for (const dateKey of eachDateKeyInRange(range.start, range.end)) {
          if (!eq) {
            exportRows.push({ Район: area.name, Техника: "", Дата: dateKey, Статус: "", Работы: "" });
            continue;
          }
          const info = dayCellInfo(area, eq, dateKey, areas);
          exportRows.push({
            Район: area.name,
            Техника: eq.name,
            Дата: dateKey,
            Статус: info.broken ? `Неисправна: ${info.issue ?? ""}` : "Исправна",
            Работы: info.entries
              .map((e) => `${e.startTime}-${e.endTime} ${e.title} (${e.resName})`)
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
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <MonthNav year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m); }} />
        </div>
        <div className="rounded-xl border border-dashed border-sky-200 bg-white/60 p-8 text-center text-sky-500">
          Пока нет ни одной единицы техники ни в одном РЭС.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <MonthNav year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m); }} />
        <ExportButton referenceDate={toDateKey(new Date(year, month, 1))} onExport={handleExport} />
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-sky-700">
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-amber-200" /> занято ≤4ч
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-orange-300" /> занято 4–8ч
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-rose-300" /> занято ≥8ч или неисправна
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-sky-100 bg-white shadow-card">
        <table className="border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-sky-100 text-xs uppercase text-sky-400">
              <th className="w-28 border-r border-sky-100 bg-white px-3 py-2 font-medium">
                РЭС
              </th>
              <th className="w-40 border-r border-sky-100 bg-white px-3 py-2 font-medium">
                Техника
              </th>
              {days.map((d) => (
                <th
                  key={d}
                  className={`w-[92px] border-r border-sky-50 px-1.5 py-2 text-center font-medium ${
                    d === todayKey ? "bg-sky-100 text-sky-700" : ""
                  }`}
                >
                  {Number(d.slice(-2))}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedAreas.map((area) => {
              const eqList = area.equipment;
              const rowSpan = Math.max(eqList.length, 1);
              return (
                <RenderAreaRows
                  key={area.id}
                  area={area}
                  areas={areas}
                  days={days}
                  rowSpan={rowSpan}
                  todayKey={todayKey}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RenderAreaRows({
  area,
  areas,
  days,
  rowSpan,
  todayKey,
}: {
  area: Area;
  areas: Area[];
  days: string[];
  rowSpan: number;
  todayKey: string;
}) {
  if (area.equipment.length === 0) {
    return (
      <tr className="border-b border-sky-50">
        <td
          rowSpan={rowSpan}
          className="border-r border-sky-100 bg-white px-3 py-2 align-top font-semibold text-sky-900"
        >
          {area.name}
        </td>
        <td className="border-r border-sky-100 bg-white px-3 py-2 align-top text-sky-300">
          — нет техники —
        </td>
        {days.map((d) => (
          <td key={d} className={`border-r border-sky-50 ${d === todayKey ? "bg-sky-50/50" : ""}`} />
        ))}
      </tr>
    );
  }

  return (
    <>
      {area.equipment.map((eq, i) => (
        <tr key={eq.id} className="border-b border-sky-50">
          {i === 0 && (
            <td
              rowSpan={rowSpan}
              className="border-r border-sky-100 bg-white px-3 py-2 align-top font-semibold text-sky-900"
            >
              {area.name}
            </td>
          )}
          <td className="border-r border-sky-100 bg-white px-3 py-2 align-top font-medium text-sky-900">
            {eq.name}
          </td>
          {days.map((d) => {
            const info = dayCellInfo(area, eq, d, areas);
            const bg = WORKLOAD_LEVEL_BG[info.level];
            const tooltip = info.broken
              ? `Неисправна: ${info.issue ?? ""}`
              : info.entries.map((e) => `${e.startTime}-${e.endTime} ${e.title} (${e.resName})`).join("\n");
            return (
              <td
                key={d}
                title={tooltip || undefined}
                className={`border-r border-sky-50 px-1 py-1.5 align-top text-[10px] leading-tight ${bg} ${
                  d === todayKey && !bg ? "bg-sky-50/50" : ""
                }`}
              >
                {info.broken ? (
                  <span className="font-medium text-rose-900">🔧 неиспр.</span>
                ) : info.entries.length > 0 ? (
                  <div className="text-sky-900">
                    <div className="truncate font-medium">{info.entries[0].title}</div>
                    <div className="truncate text-sky-700">{info.entries[0].resName}</div>
                    {info.entries.length > 1 && <div className="text-sky-600">+{info.entries.length - 1}</div>}
                  </div>
                ) : null}
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
}
