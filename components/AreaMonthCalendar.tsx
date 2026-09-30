"use client";

import { useState } from "react";
import { Area } from "@/lib/types";
import { datesInMonth, toDateKey } from "@/lib/date";
import {
  borrowedCellInfo,
  borrowedRows,
  dayCellInfo,
  pendingRequestFor,
  WORKLOAD_LEVEL_BG,
  WORKLOAD_LEVEL_HEX,
} from "@/lib/equipment";
import { exportGridToExcel, GridCell } from "@/lib/excel";
import { useStore } from "@/lib/store";
import MonthNav from "./MonthNav";
import RequestCellBadge from "./RequestCellBadge";
import DayJobEditor from "./DayJobEditor";

export default function AreaMonthCalendar({ area }: { area: Area }) {
  const areas = useStore((s) => s.areas);
  const equipmentRequests = useStore((s) => s.equipmentRequests);

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [openCell, setOpenCell] = useState<string | null>(null);

  const days = datesInMonth(year, month);
  const todayKey = toDateKey(now);
  const borrowed = borrowedRows(area.id, areas, equipmentRequests);

  function handleExport() {
    const header: GridCell[] = [
      { value: "Техника", header: true },
      ...days.map((d) => ({ value: String(Number(d.slice(-2))), header: true })),
    ];
    const rows: GridCell[][] = [header];

    const eqList = area.equipment.length > 0 ? area.equipment : [null];
    for (const eq of eqList) {
      rows.push([
        { value: eq ? eq.name : "— нет техники —", bold: true },
        ...days.map((d): GridCell => {
          if (!eq) return { value: "" };
          const info = dayCellInfo(area, eq, d, areas);
          const text = info.broken
            ? `Неисправна: ${info.issue ?? ""}`
            : info.entries.map((e) => `${e.startTime}-${e.endTime} ${e.title} (${e.resName})`).join("\n");
          return { value: text, bgHex: WORKLOAD_LEVEL_HEX[info.level] };
        }),
      ]);
    }
    for (const { sourceArea, equipment } of borrowed) {
      rows.push([
        { value: `${sourceArea.name} — ${equipment.name}`, bold: true },
        ...days.map((d): GridCell => {
          const info = borrowedCellInfo(equipment, d, area.id, equipmentRequests);
          if (info.pending) return { value: "Запрос (ожидает)" };
          const text = info.entries.map((e) => `${e.startTime}-${e.endTime} ${e.title}`).join("\n");
          return { value: text, bgHex: text ? WORKLOAD_LEVEL_HEX[info.totalHours <= 4 ? "yellow" : info.totalHours <= 6 ? "orange" : "red"] : undefined };
        }),
      ]);
    }

    exportGridToExcel(
      `${area.name} — ${year}-${String(month + 1).padStart(2, "0")}`,
      area.name,
      rows,
      [],
      [22, ...days.map(() => 16)]
    );
  }

  if (area.equipment.length === 0 && borrowed.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <MonthNav year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m); }} />
        <div className="rounded-xl border border-dashed border-sky-200 bg-white/60 p-6 text-center text-sm text-sky-500">
          В этом РЭС пока нет техники.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <MonthNav year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m); }} />
        <button
          onClick={handleExport}
          className="rounded-lg border border-sky-200 bg-white px-3 py-1.5 text-sm font-medium text-sky-700 hover:bg-sky-50"
        >
          ⬇ Выгрузить в Excel
        </button>
      </div>
      <p className="text-xs text-sky-400">
        Нажмите на ячейку, чтобы добавить или удалить работу на эту дату.
      </p>

      <div className="overflow-x-auto rounded-xl border border-sky-100 bg-white shadow-card">
        <table className="border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-sky-100 text-xs uppercase text-sky-400">
              <th className="w-44 border-r border-sky-100 bg-white px-3 py-2 font-medium">Техника</th>
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
            {area.equipment.map((eq) => (
              <tr key={eq.id} className="border-b border-sky-50">
                <td className="border-r border-sky-100 bg-white px-3 py-2 align-top font-medium text-sky-900">
                  {eq.name}
                </td>
                {days.map((d) => {
                  const info = dayCellInfo(area, eq, d, areas);
                  const bg = WORKLOAD_LEVEL_BG[info.level];
                  const pending = pendingRequestFor(equipmentRequests, eq.id, d);
                  const cellKey = `${eq.id}:${d}`;
                  const dayJobs = eq.jobs.filter((j) => j.date === d);
                  const tooltip = info.broken
                    ? `Неисправна: ${info.issue ?? ""}`
                    : info.entries.map((e) => `${e.startTime}-${e.endTime} ${e.title} (${e.resName})`).join("\n");
                  return (
                    <td
                      key={d}
                      title={tooltip || undefined}
                      onClick={() => setOpenCell(openCell === cellKey ? null : cellKey)}
                      className={`relative cursor-pointer border-r border-sky-50 px-1 py-1.5 align-top text-[10px] leading-tight hover:ring-1 hover:ring-inset hover:ring-sky-300 ${bg} ${
                        d === todayKey && !bg ? "bg-sky-50/50" : ""
                      }`}
                    >
                      {info.broken ? (
                        <span className="font-medium text-rose-900">🔧 неиспр.</span>
                      ) : info.entries.length > 0 ? (
                        <div className="text-sky-900">
                          <div className="truncate font-medium">{info.entries[0].title}</div>
                          {info.entries.length > 1 && <div className="text-sky-600">+{info.entries.length - 1}</div>}
                        </div>
                      ) : null}
                      {pending && <RequestCellBadge request={pending} />}
                      {openCell === cellKey && (
                        <DayJobEditor
                          areaId={area.id}
                          equipmentId={eq.id}
                          date={d}
                          jobs={dayJobs}
                          onClose={() => setOpenCell(null)}
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
            {borrowed.map(({ sourceArea, equipment }) => (
              <tr key={equipment.id} className="border-b border-sky-50 bg-sky-25/40">
                <td className="border-r border-sky-100 bg-sky-25 px-3 py-2 align-top font-medium text-sky-700">
                  {sourceArea.name} — {equipment.name}
                </td>
                {days.map((d) => {
                  const info = borrowedCellInfo(equipment, d, area.id, equipmentRequests);
                  const level = info.totalHours <= 0 ? "none" : info.totalHours <= 4 ? "yellow" : info.totalHours <= 6 ? "orange" : "red";
                  const bg = WORKLOAD_LEVEL_BG[level as keyof typeof WORKLOAD_LEVEL_BG];
                  return (
                    <td
                      key={d}
                      className={`border-r border-sky-50 px-1 py-1.5 align-top text-[10px] leading-tight ${bg}`}
                    >
                      {info.pending ? (
                        <span className="italic text-violet-700">⏳ ожидает</span>
                      ) : info.entries.length > 0 ? (
                        <div className="truncate font-medium text-sky-900">{info.entries[0].title}</div>
                      ) : null}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
