"use client";

import { useState } from "react";
import { Area } from "@/lib/types";
import { datesInMonth, toDateKey } from "@/lib/date";
import { dayCellInfo, pendingRequestFor, WORKLOAD_LEVEL_BG, WORKLOAD_LEVEL_HEX } from "@/lib/equipment";
import { exportGridToExcel, GridCell, GridMerge } from "@/lib/excel";
import { useStore } from "@/lib/store";
import MonthNav from "./MonthNav";
import RequestCellBadge from "./RequestCellBadge";

export default function EquipmentSummaryTable({ areas }: { areas: Area[] }) {
  const equipmentRequests = useStore((s) => s.equipmentRequests);
  const sortedAreas = [...areas].sort((a, b) => a.name.localeCompare(b.name, "ru"));
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const days = datesInMonth(year, month);
  const todayKey = toDateKey(now);

  const totalEquipment = areas.reduce((sum, a) => sum + a.equipment.length, 0);

  function handleExport() {
    const header: GridCell[] = [
      { value: "РЭС", header: true },
      { value: "Техника", header: true },
      ...days.map((d) => ({ value: String(Number(d.slice(-2))), header: true })),
    ];
    const rows: GridCell[][] = [header];
    const merges: GridMerge[] = [];

    for (const area of sortedAreas) {
      const eqList = area.equipment.length > 0 ? area.equipment : [null];
      const startRow = rows.length;
      for (const eq of eqList) {
        const row: GridCell[] = [
          { value: "" },
          { value: eq ? eq.name : "— нет техники —" },
          ...days.map((d): GridCell => {
            if (!eq) return { value: "" };
            const info = dayCellInfo(area, eq, d, areas);
            const text = info.broken
              ? `Неисправна: ${info.issue ?? ""}`
              : info.entries.map((e) => `${e.startTime}-${e.endTime} ${e.title} (${e.resName})`).join("\n");
            return { value: text, bgHex: WORKLOAD_LEVEL_HEX[info.level] };
          }),
        ];
        rows.push(row);
      }
      rows[startRow][0] = { value: area.name, bold: true };
      if (eqList.length > 1) {
        merges.push({ s: { r: startRow, c: 0 }, e: { r: startRow + eqList.length - 1, c: 0 } });
      }
    }

    exportGridToExcel(
      `Свод техники — ${year}-${String(month + 1).padStart(2, "0")}`,
      "Свод",
      rows,
      merges,
      [14, 22, ...days.map(() => 16)]
    );
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
        <button
          onClick={handleExport}
          className="rounded-lg border border-sky-200 bg-white px-3 py-1.5 text-sm font-medium text-sky-700 hover:bg-sky-50"
        >
          ⬇ Выгрузить в Excel
        </button>
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-sky-700">
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-amber-200" /> занято ≤4ч
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-orange-300" /> занято 4–6ч
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-rose-300" /> занято 6ч+ или неисправна
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded border border-violet-300 bg-violet-100" /> есть запрос на одобрение
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
                  equipmentRequests={equipmentRequests}
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
  equipmentRequests,
}: {
  area: Area;
  areas: Area[];
  days: string[];
  rowSpan: number;
  todayKey: string;
  equipmentRequests: ReturnType<typeof useStore.getState>["equipmentRequests"];
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
            const pending = pendingRequestFor(equipmentRequests, eq.id, d);
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
                {pending && <RequestCellBadge request={pending} />}
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
}
