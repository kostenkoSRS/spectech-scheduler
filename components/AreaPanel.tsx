"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Area } from "@/lib/types";
import EquipmentRow from "./EquipmentRow";
import RequestEquipmentModal from "./RequestEquipmentModal";
import AreaMonthCalendar from "./AreaMonthCalendar";
import DeclinedRequestsBanner from "./DeclinedRequestsBanner";

export default function AreaPanel({ area }: { area: Area }) {
  const addEquipment = useStore((s) => s.addEquipment);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [requesting, setRequesting] = useState(false);

  function commitAdd() {
    if (name.trim()) addEquipment(area.id, name.trim());
    setName("");
    setAdding(false);
  }

  return (
    <div className="flex flex-col gap-5">
      <DeclinedRequestsBanner areaId={area.id} />

      <AreaMonthCalendar area={area} />

      <div className="flex flex-col gap-3">
        {area.equipment.length === 0 && !adding && (
          <div className="rounded-xl border border-dashed border-sky-200 bg-white/60 p-6 text-center text-sm text-sky-500">
            В этом районе пока нет техники. Добавьте первую единицу.
          </div>
        )}

        {area.equipment.map((equipment) => (
          <EquipmentRow key={equipment.id} areaId={area.id} equipment={equipment} />
        ))}

        <button
          onClick={() => setRequesting(true)}
          className="self-start rounded-xl border border-sky-300 bg-sky-50 px-4 py-2.5 text-sm font-medium text-sky-700 hover:bg-sky-100"
        >
          🔄 Запросить технику в другом РЭС
        </button>

        {requesting && (
          <RequestEquipmentModal
            areaId={area.id}
            areaName={area.name}
            onClose={() => setRequesting(false)}
          />
        )}

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
    </div>
  );
}
