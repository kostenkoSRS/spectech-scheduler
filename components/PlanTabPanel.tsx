"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Area } from "@/lib/types";
import { toDateKey } from "@/lib/date";
import { isColumnVisibleOnDate } from "@/lib/plan";
import { equipmentStatusOnDate } from "@/lib/equipment";
import { exportSheetsToExcel } from "@/lib/excel";
import DateNav from "./DateNav";

export default function PlanTabPanel({ area }: { area: Area }) {
  const planColumns = useStore((s) => s.planColumns);
  const addPlanRow = useStore((s) => s.addPlanRow);
  const updatePlanRowEquipment = useStore((s) => s.updatePlanRowEquipment);
  const updatePlanRowValue = useStore((s) => s.updatePlanRowValue);
  const removePlanRow = useStore((s) => s.removePlanRow);

  const [selectedDate, setSelectedDate] = useState(toDateKey(new Date()));

  const visibleColumns = planColumns.filter((c) => isColumnVisibleOnDate(c, selectedDate));
  const rows = area.planRows.filter((r) => r.date === selectedDate);

  function handleExport() {
    exportSheetsToExcel(`План работ — ${area.name} — ${selectedDate}`, [
      {
        name: area.name,
        rows: rows.map((row) => {
          const eq = area.equipment.find((e) => e.id === row.equipmentId);
          const status = eq ? equipmentStatusOnDate(eq, selectedDate) : null;
          const base: Record<string, string> = {
            Дата: row.date,
            "Спец техника": eq?.name ?? "",
            Статус: status ? (status.broken ? `Неисправна: ${status.issue ?? ""}` : "Исправна") : "",
          };
          for (const col of visibleColumns) {
            base[col.title] = row.values[col.id] ?? "";
          }
          return base;
        }),
      },
    ]);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <DateNav date={selectedDate} onChange={setSelectedDate} />
        <button
          onClick={handleExport}
          className="rounded-lg border border-sky-200 bg-white px-3 py-1.5 text-sm font-medium text-sky-700 hover:bg-sky-50"
        >
          ⬇ Выгрузить в Excel
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-sky-100 bg-white shadow-card">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead>
            <tr className="border-b border-sky-100 text-xs uppercase text-sky-400">
              <th className="px-4 py-2 font-medium">Спец техника</th>
              {visibleColumns.map((col) => (
                <th key={col.id} className="px-4 py-2 font-medium">
                  {col.title}
                </th>
              ))}
              <th className="w-10 px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={visibleColumns.length + 2}
                  className="px-4 py-6 text-center text-sky-400"
                >
                  На эту дату строк пока нет.
                </td>
              </tr>
            )}
            {rows.map((row) => {
              const eq = area.equipment.find((e) => e.id === row.equipmentId);
              const status = eq ? equipmentStatusOnDate(eq, selectedDate) : null;
              return (
                <tr key={row.id} className="border-b border-sky-50 last:border-0">
                  <td className="px-2 py-1.5">
                    <select
                      value={row.equipmentId ?? ""}
                      onChange={(e) =>
                        updatePlanRowEquipment(area.id, row.id, e.target.value || null)
                      }
                      className="w-full rounded-lg border border-sky-200 bg-white px-2 py-1.5 outline-none focus:border-sky-500"
                    >
                      <option value="">— выберите технику —</option>
                      {area.equipment.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.name}
                        </option>
                      ))}
                    </select>
                    {status && (
                      <span
                        className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-[11px] ${
                          status.broken
                            ? "border-rose-300 bg-rose-100 text-rose-700"
                            : "border-emerald-300 bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {status.broken ? `🔧 ${status.issue ?? "Неисправность"}` : "✅ Исправна"}
                      </span>
                    )}
                  </td>
                  {visibleColumns.map((col) => (
                    <td key={col.id} className="px-2 py-1.5">
                      <input
                        value={row.values[col.id] ?? ""}
                        onChange={(e) =>
                          updatePlanRowValue(area.id, row.id, col.id, e.target.value)
                        }
                        className="w-full rounded-lg border border-transparent px-2 py-1.5 outline-none hover:border-sky-200 focus:border-sky-500"
                      />
                    </td>
                  ))}
                  <td className="px-2 py-1.5 text-right">
                    <button
                      onClick={() => removePlanRow(area.id, row.id)}
                      className="rounded-full px-2 text-sky-400 hover:bg-rose-50 hover:text-rose-500"
                      aria-label="Удалить строку"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <button
        onClick={() => addPlanRow(area.id, selectedDate)}
        className="self-start rounded-xl border border-dashed border-sky-300 px-4 py-2.5 text-sm font-medium text-sky-600 hover:border-sky-500 hover:bg-sky-50"
      >
        + Добавить строку
      </button>

      {planColumns.length > visibleColumns.length && (
        <p className="text-xs text-sky-400">
          Есть столбцы, которые на эту дату не отображаются (ограничены датой/днём недели в
          «Своде»).
        </p>
      )}
    </div>
  );
}
