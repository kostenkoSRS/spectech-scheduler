"use client";

import { Equipment } from "@/lib/types";
import { equipmentStatusOnDate } from "@/lib/equipment";

export default function EquipmentStatusList({
  equipment,
  date,
}: {
  equipment: Equipment[];
  date: string;
}) {
  if (equipment.length === 0) {
    return <span className="text-sky-300">— нет техники в районе —</span>;
  }

  return (
    <div className="flex flex-col gap-1.5">
      {equipment.map((eq) => {
        const status = equipmentStatusOnDate(eq, date);
        return (
          <div key={eq.id}>
            <div className="font-medium text-sky-900">{eq.name}</div>
            <span
              className={`mt-0.5 inline-block rounded-full border px-2 py-0.5 text-[11px] ${
                status.broken
                  ? "border-rose-300 bg-rose-100 text-rose-700"
                  : "border-emerald-300 bg-emerald-100 text-emerald-700"
              }`}
            >
              {status.broken ? `🔧 ${status.issue ?? "Неисправность"}` : "✅ Исправна"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
