"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { PlanTab } from "@/lib/types";
import { toDateKey } from "@/lib/date";
import { isColumnVisibleOnDate } from "@/lib/plan";
import DateNav from "./DateNav";

export default function PlanTabPanel({ tab }: { tab: PlanTab }) {
  const planColumns = useStore((s) => s.planColumns);
  const addPlanRow = useStore((s) => s.addPlanRow);
  const updatePlanRowLabel = useStore((s) => s.updatePlanRowLabel);
  const updatePlanRowValue = useStore((s) => s.updatePlanRowValue);
  const removePlanRow = useStore((s) => s.removePlanRow);

  const [selectedDate, setSelectedDate] = useState(toDateKey(new Date()));

  const visibleColumns = planColumns.filter((c) => isColumnVisibleOnDate(c, selectedDate));
  const rows = tab.rows.filter((r) => r.date === selectedDate);

  return (
    <div className="flex flex-col gap-4">
      <DateNav date={selectedDate} onChange={setSelectedDate} />

      <div className="overflow-x-auto rounded-xl border border-sky-100 bg-white shadow-card">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead>
            <tr className="border-b border-sky-100 text-xs uppercase text-sky-400">
              <th className="px-4 py-2 font-medium">Наименование</th>
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
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-sky-50 last:border-0">
                <td className="px-2 py-1.5">
                  <input
                    value={row.label}
                    onChange={(e) => updatePlanRowLabel(tab.id, row.id, e.target.value)}
                    placeholder="Название"
                    className="w-full rounded-lg border border-transparent px-2 py-1.5 outline-none hover:border-sky-200 focus:border-sky-500"
                  />
                </td>
                {visibleColumns.map((col) => (
                  <td key={col.id} className="px-2 py-1.5">
                    <input
                      value={row.values[col.id] ?? ""}
                      onChange={(e) =>
                        updatePlanRowValue(tab.id, row.id, col.id, e.target.value)
                      }
                      className="w-full rounded-lg border border-transparent px-2 py-1.5 outline-none hover:border-sky-200 focus:border-sky-500"
                    />
                  </td>
                ))}
                <td className="px-2 py-1.5 text-right">
                  <button
                    onClick={() => removePlanRow(tab.id, row.id)}
                    className="rounded-full px-2 text-sky-400 hover:bg-rose-50 hover:text-rose-500"
                    aria-label="Удалить строку"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={() => addPlanRow(tab.id, selectedDate)}
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
