"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Area, IMPORTANCE_LABELS } from "@/lib/types";
import { exportSheetsToExcel } from "@/lib/excel";
import { equipmentStatusOnDate } from "@/lib/equipment";
import { toDateKey } from "@/lib/date";
import EquipmentRow from "./EquipmentRow";
import ExportButton from "./ExportButton";

export default function AreaPanel({ area }: { area: Area }) {
  const addEquipment = useStore((s) => s.addEquipment);
  const areas = useStore((s) => s.areas);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");

  function commitAdd() {
    if (name.trim()) addEquipment(area.id, name.trim());
    setName("");
    setAdding(false);
  }

  function handleExport(range: { start: string; end: string }) {
    exportSheetsToExcel(`Техника — ${area.name} — ${range.start}_${range.end}`, [
      {
        name: "Техника",
        rows: area.equipment.map((eq) => {
          const status = equipmentStatusOnDate(eq, range.end);
          return {
            Техника: eq.name,
            Статус: status.broken ? `Неисправна: ${status.issue ?? ""}` : "Исправна",
            "Начало ремонта": eq.status.repairStart ?? "",
            "Окончание ремонта": eq.status.repairEnd ?? "",
          };
        }),
      },
      {
        name: "Работы",
        rows: area.equipment.flatMap((eq) =>
          eq.jobs
            .filter((j) => j.date >= range.start && j.date <= range.end)
            .map((j) => ({
              Техника: eq.name,
              Дата: j.date,
              Начало: j.startTime,
              Конец: j.endTime,
              Название: j.title,
              Адрес: j.address,
              Важность: IMPORTANCE_LABELS[j.importance],
            }))
        ),
      },
      {
        name: "Переброски",
        rows: area.equipment.flatMap((eq) =>
          eq.transfers
            .filter((t) => t.date >= range.start && t.date <= range.end)
            .map((t) => ({
              Техника: eq.name,
              Дата: t.date,
              Начало: t.startTime,
              Конец: t.endTime,
              Название: t.title,
              Адрес: t.address,
              Важность: IMPORTANCE_LABELS[t.importance],
              "Куда": areas.find((a) => a.id === t.targetAreaId)?.name ?? "",
            }))
        ),
      },
    ]);
  }

  return (
    <div className="flex flex-col gap-3">
      {area.equipment.length > 0 && (
        <div className="self-end">
          <ExportButton referenceDate={toDateKey(new Date())} onExport={handleExport} />
        </div>
      )}

      {area.equipment.length === 0 && !adding && (
        <div className="rounded-xl border border-dashed border-sky-200 bg-white/60 p-6 text-center text-sm text-sky-500">
          В этом районе пока нет техники. Добавьте первую единицу.
        </div>
      )}

      {area.equipment.map((equipment) => (
        <EquipmentRow key={equipment.id} areaId={area.id} equipment={equipment} />
      ))}

      {adding ? (
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={commitAdd}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitAdd();
            if (e.key === "Escape") setAdding(false);
          }}
          placeholder="Название спецтехники"
          className="rounded-xl border border-sky-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-sky-500"
        />
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="rounded-xl border border-dashed border-sky-300 px-4 py-2.5 text-sm font-medium text-sky-600 hover:border-sky-500 hover:bg-sky-50"
        >
          + Добавить спецтехнику
        </button>
      )}
    </div>
  );
}
