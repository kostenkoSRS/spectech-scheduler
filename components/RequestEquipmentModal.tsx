"use client";

import { useMemo, useState } from "react";
import Modal from "./Modal";
import { useStore } from "@/lib/store";
import { Area, Equipment, IMPORTANCE_COLORS, IMPORTANCE_LABELS, Importance } from "@/lib/types";
import { toDateKey } from "@/lib/date";
import { dailyWorkload, equipmentStatusOnDate } from "@/lib/equipment";

type Availability = "free" | "partial" | "full";

const AVAILABILITY_ORDER: Record<Availability, number> = { free: 0, partial: 1, full: 2 };
const AVAILABILITY_DOT: Record<Availability, string> = {
  free: "bg-emerald-500",
  partial: "bg-amber-400",
  full: "bg-sky-600",
};
const AVAILABILITY_LABEL: Record<Availability, string> = {
  free: "свободна весь день",
  partial: "занята не весь день",
  full: "занята весь день",
};

export default function RequestEquipmentModal({
  areaId,
  areaName,
  onClose,
}: {
  areaId: string;
  areaName: string;
  onClose: () => void;
}) {
  const areas = useStore((s) => s.areas);
  const addTransfer = useStore((s) => s.addTransfer);

  const [date, setDate] = useState(toDateKey(new Date()));
  const [picked, setPicked] = useState<{ area: Area; equipment: Equipment } | null>(null);

  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [importance, setImportance] = useState<Importance>("medium");

  const candidates = useMemo(() => {
    const list: { area: Area; equipment: Equipment; availability: Availability; hours: number }[] = [];
    for (const a of areas) {
      if (a.id === areaId || !a.sections.includes("distribution")) continue;
      for (const eq of a.equipment) {
        const status = equipmentStatusOnDate(eq, date);
        if (status.broken) continue; // неисправную технику не предлагаем
        const { totalHours } = dailyWorkload(a, eq, date, areas);
        const availability: Availability = totalHours <= 0 ? "free" : totalHours >= 8 ? "full" : "partial";
        list.push({ area: a, equipment: eq, availability, hours: totalHours });
      }
    }
    return list.sort((x, y) => {
      const byAvail = AVAILABILITY_ORDER[x.availability] - AVAILABILITY_ORDER[y.availability];
      if (byAvail !== 0) return byAvail;
      return x.equipment.name.localeCompare(y.equipment.name, "ru");
    });
  }, [areas, areaId, date]);

  function handleSave() {
    if (!picked || !title.trim() || !address.trim()) return;
    addTransfer(picked.area.id, picked.equipment.id, {
      date,
      startTime,
      endTime,
      title: title.trim(),
      address: address.trim(),
      importance,
      targetAreaId: areaId,
    });
    onClose();
  }

  if (picked) {
    return (
      <Modal
        title={`Запросить «${picked.equipment.name}» (${picked.area.name}) в ${areaName}`}
        onClose={onClose}
      >
        <div className="flex flex-col gap-3">
          <div className="text-sm text-sky-600">Дата: {date}</div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Название работы"
            className="rounded-lg border border-sky-200 px-3 py-2 text-sm outline-none focus:border-sky-500"
          />
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Адрес проведения работы"
            className="rounded-lg border border-sky-200 px-3 py-2 text-sm outline-none focus:border-sky-500"
          />
          <div className="flex gap-2">
            <label className="flex-1 text-xs text-sky-600">
              Начало
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="mt-1 w-full rounded-lg border border-sky-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500"
              />
            </label>
            <label className="flex-1 text-xs text-sky-600">
              Окончание
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="mt-1 w-full rounded-lg border border-sky-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500"
              />
            </label>
          </div>
          <div className="flex gap-2">
            {(["low", "medium", "high"] as Importance[]).map((imp) => (
              <button
                key={imp}
                onClick={() => setImportance(imp)}
                className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium ${
                  importance === imp ? IMPORTANCE_COLORS[imp] : "border-sky-100 bg-white text-sky-400"
                }`}
              >
                {IMPORTANCE_LABELS[imp]}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPicked(null)}
              className="rounded-lg border border-sky-200 px-3 py-2 text-sm font-medium text-sky-600 hover:bg-sky-50"
            >
              ← Назад к списку
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim() || !address.trim()}
              className="flex-1 rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-200"
            >
              Отправить запрос
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title={`Запросить технику в другом РЭС — ${areaName}`} onClose={onClose} width="max-w-lg">
      <div className="flex flex-col gap-3">
        <label className="text-xs text-sky-600">
          Дата
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 w-full rounded-lg border border-sky-200 px-3 py-2 text-sm outline-none focus:border-sky-500"
          />
        </label>

        <div className="flex flex-wrap gap-3 text-xs text-sky-700">
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> свободна
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> занята не весь день
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-600" /> занята весь день
          </span>
        </div>

        <div className="flex max-h-80 flex-col gap-1.5 overflow-y-auto rounded-lg border border-sky-100 p-1.5">
          {candidates.length === 0 && (
            <div className="px-3 py-6 text-center text-sm text-sky-400">
              Нет доступной техники в других РЭС на эту дату.
            </div>
          )}
          {candidates.map(({ area, equipment, availability, hours }) => (
            <button
              key={equipment.id}
              onClick={() => setPicked({ area, equipment })}
              className="flex items-center justify-between gap-2 rounded-lg border border-sky-100 bg-white px-3 py-2 text-left text-sm hover:bg-sky-50"
            >
              <span className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${AVAILABILITY_DOT[availability]}`} />
                <span>
                  <span className="font-medium text-sky-900">{equipment.name}</span>
                  <span className="text-sky-500"> · {area.name}</span>
                </span>
              </span>
              <span className="whitespace-nowrap text-xs text-sky-400">
                {AVAILABILITY_LABEL[availability]}
                {hours > 0 ? ` (${hours}ч)` : ""}
              </span>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}
