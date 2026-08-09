"use client";

import { useState } from "react";
import Modal from "./Modal";
import { useStore } from "@/lib/store";
import { Equipment, EquipmentStatusType } from "@/lib/types";

export default function StatusModal({
  areaId,
  equipment,
  onClose,
}: {
  areaId: string;
  equipment: Equipment;
  onClose: () => void;
}) {
  const setStatus = useStore((s) => s.setStatus);

  const [type, setType] = useState<EquipmentStatusType>(equipment.status.type);
  const [issue, setIssue] = useState(equipment.status.issue ?? "");
  const [repairStart, setRepairStart] = useState(
    equipment.status.repairStart ?? new Date().toISOString().slice(0, 10)
  );
  const [repairEnd, setRepairEnd] = useState(equipment.status.repairEnd ?? "");

  function handleSave() {
    if (type === "operational") {
      setStatus(areaId, equipment.id, { type: "operational" });
    } else {
      if (!issue.trim() || !repairStart || !repairEnd) return;
      setStatus(areaId, equipment.id, {
        type: "repair",
        issue: issue.trim(),
        repairStart,
        repairEnd,
      });
    }
    onClose();
  }

  return (
    <Modal title={`Статус техники — ${equipment.name}`} onClose={onClose}>
      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <button
            onClick={() => setType("operational")}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${
              type === "operational"
                ? "border-emerald-400 bg-emerald-100 text-emerald-800"
                : "border-sky-100 bg-white text-sky-500"
            }`}
          >
            Исправна
          </button>
          <button
            onClick={() => setType("repair")}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${
              type === "repair"
                ? "border-rose-400 bg-rose-100 text-rose-800"
                : "border-sky-100 bg-white text-sky-500"
            }`}
          >
            Техника на ремонте
          </button>
        </div>

        {type === "repair" && (
          <div className="flex flex-col gap-2">
            <label className="text-xs text-sky-600">
              Неисправность
              <input
                type="text"
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                placeholder="Опишите неисправность"
                className="mt-1 w-full rounded-lg border border-sky-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500"
              />
            </label>
            <div className="flex gap-2">
            <label className="flex-1 text-xs text-sky-600">
              Начало ремонта
              <input
                type="date"
                value={repairStart}
                onChange={(e) => setRepairStart(e.target.value)}
                className="mt-1 w-full rounded-lg border border-sky-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500"
              />
            </label>
            <label className="flex-1 text-xs text-sky-600">
              Планируемое окончание
              <input
                type="date"
                value={repairEnd}
                onChange={(e) => setRepairEnd(e.target.value)}
                className="mt-1 w-full rounded-lg border border-sky-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500"
              />
            </label>
            </div>
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={type === "repair" && (!issue.trim() || !repairStart || !repairEnd)}
          className="mt-1 rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-200"
        >
          Сохранить
        </button>
      </div>
    </Modal>
  );
}
