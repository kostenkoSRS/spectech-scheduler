"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { ColumnScope } from "@/lib/types";
import { eachDateKeyInRange, toDateKey, WEEKDAY_NAMES } from "@/lib/date";
import {
  assignEquipmentToRows,
  columnScopeLabel,
  isColumnVisibleOnDate,
  visiblePlanRows,
} from "@/lib/plan";
import { equipmentStatusOnDate } from "@/lib/equipment";
import { exportRowsToExcel } from "@/lib/excel";
import DateNav from "./DateNav";
import ExportButton from "./ExportButton";

type ScopeKind = "all" | "date" | "weekday";

export default function PlanSummaryTable() {
  const areas = useStore((s) => s.areas);
  const planColumns = useStore((s) => s.planColumns);
  const addPlanColumn = useStore((s) => s.addPlanColumn);
  const removePlanColumn = useStore((s) => s.removePlanColumn);

  const [selectedDate, setSelectedDate] = useState(toDateKey(new Date()));

  const [newTitle, setNewTitle] = useState("");
  const [scopeKind, setScopeKind] = useState<ScopeKind>("all");
  const [scopeDate, setScopeDate] = useState(toDateKey(new Date()));
  const [scopeWeekday, setScopeWeekday] = useState(0);

  const visibleColumns = planColumns.filter((c) => isColumnVisibleOnDate(c, selectedDate));

  function handleAddColumn() {
    if (!newTitle.trim()) return;
    const scope: ColumnScope =
      scopeKind === "all"
        ? { type: "all" }
        : scopeKind === "date"
        ? { type: "date", date: scopeDate }
        : { type: "weekday", weekday: scopeWeekday };
    addPlanColumn(newTitle.trim(), scope);
    setNewTitle("");
  }

  function handleExport(range: { start: string; end: string }) {
    const exportRows: Record<string, string>[] = [];
    for (const dateKey of eachDateKeyInRange(range.start, range.end)) {
      const dayColumns = planColumns.filter((c) => isColumnVisibleOnDate(c, dateKey));
      for (const area of areas) {
        const dayRows = visiblePlanRows(area.planRows, dateKey);
        const dayEquipment = assignEquipmentToRows(dayRows, area.equipment);
        dayRows.forEach((row, i) => {
          const eq = dayEquipment[i];
          const status = eq ? equipmentStatusOnDate(eq, dateKey) : null;
          const base: Record<string, string> = {
            Район: area.name,
            Дата: dateKey,
            Техника: eq?.name ?? "",
            Статус: status ? (status.broken ? `Неисправна: ${status.issue ?? ""}` : "Исправна") : "",
          };
          for (const col of dayColumns) {
            base[col.title] = row.values[col.id] ?? "";
          }
          exportRows.push(base);
        });
      }
    }
    exportRowsToExcel(`Свод плана работ — ${range.start}_${range.end}`, "Свод", exportRows);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-xl border border-sky-200 bg-white p-4 shadow-card">
        <div className="mb-2 text-sm font-semibold text-sky-900">Столбцы плана</div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-xs text-sky-600">
            Название столбца
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Например: Обед"
              className="mt-1 block w-48 rounded-lg border border-sky-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500"
            />
          </label>

          <label className="text-xs text-sky-600">
            Когда показывать
            <select
              value={scopeKind}
              onChange={(e) => setScopeKind(e.target.value as ScopeKind)}
              className="mt-1 block rounded-lg border border-sky-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500"
            >
              <option value="all">На все даты</option>
              <option value="date">На определённую дату</option>
              <option value="weekday">По дню недели</option>
            </select>
          </label>

          {scopeKind === "date" && (
            <label className="text-xs text-sky-600">
              Дата
              <input
                type="date"
                value={scopeDate}
                onChange={(e) => setScopeDate(e.target.value)}
                className="mt-1 block rounded-lg border border-sky-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500"
              />
            </label>
          )}

          {scopeKind === "weekday" && (
            <label className="text-xs text-sky-600">
              День недели
              <select
                value={scopeWeekday}
                onChange={(e) => setScopeWeekday(Number(e.target.value))}
                className="mt-1 block rounded-lg border border-sky-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500"
              >
                {WEEKDAY_NAMES.map((w, i) => (
                  <option key={w} value={i}>
                    {w}
                  </option>
                ))}
              </select>
            </label>
          )}

          <button
            onClick={handleAddColumn}
            disabled={!newTitle.trim()}
            className="rounded-lg bg-sky-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-200"
          >
            + Добавить столбец
          </button>
        </div>

        {planColumns.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {planColumns.map((col) => (
              <span
                key={col.id}
                className="flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs text-sky-700"
              >
                {col.title}
                <span className="text-sky-400">· {columnScopeLabel(col)}</span>
                <button
                  onClick={() => removePlanColumn(col.id)}
                  className="ml-1 text-sky-400 hover:text-rose-500"
                  aria-label={`Удалить столбец ${col.title}`}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <DateNav date={selectedDate} onChange={setSelectedDate} />
        <ExportButton referenceDate={selectedDate} onExport={handleExport} />
      </div>

      {areas.length === 0 ? (
        <div className="rounded-xl border border-dashed border-sky-200 bg-white/60 p-8 text-center text-sky-500">
          Пока нет вкладок в «Плане работ на день».
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {areas.map((area) => {
            const rows = visiblePlanRows(area.planRows, selectedDate);
            const assignedEquipment = assignEquipmentToRows(rows, area.equipment);
            return (
              <div
                key={area.id}
                className="overflow-hidden rounded-xl border border-sky-100 bg-white shadow-card"
              >
                <div className="border-b border-sky-100 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-900">
                  {area.name}
                </div>
                {rows.length === 0 ? (
                  <div className="px-4 py-4 text-sm text-sky-400">Нет строк на эту дату.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[520px] text-left text-sm">
                      <thead>
                        <tr className="border-b border-sky-100 text-xs uppercase text-sky-400">
                          <th className="w-56 px-4 py-2 font-medium">Техника</th>
                          <th className="w-48 px-4 py-2 font-medium">Статус</th>
                          {visibleColumns.map((col) => (
                            <th key={col.id} className="px-4 py-2 font-medium">
                              {col.title}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row, i) => {
                          const eq = assignedEquipment[i];
                          const status = eq ? equipmentStatusOnDate(eq, selectedDate) : null;
                          return (
                            <tr key={row.id} className="border-b border-sky-50 last:border-0">
                              <td className="w-56 px-4 py-2 font-medium text-sky-900">
                                {eq ? eq.name : <span className="text-sky-300">— нет техники —</span>}
                              </td>
                              <td className="w-48 px-4 py-2">
                                {status && (
                                  <span
                                    className={`inline-block rounded-full border px-2 py-0.5 text-xs ${
                                      status.broken
                                        ? "border-rose-300 bg-rose-100 text-rose-700"
                                        : "border-emerald-300 bg-emerald-100 text-emerald-700"
                                    }`}
                                  >
                                    {status.broken
                                      ? `🔧 ${status.issue ?? "Неисправность"}`
                                      : "✅ Исправна"}
                                  </span>
                                )}
                              </td>
                              {visibleColumns.map((col) => (
                                <td key={col.id} className="px-4 py-2 text-sky-700">
                                  {row.values[col.id] || <span className="text-sky-300">—</span>}
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
