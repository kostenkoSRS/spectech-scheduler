"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Equipment } from "@/lib/types";
import AssignWorkModal from "./AssignWorkModal";
import TransferModal from "./TransferModal";
import StatusModal from "./StatusModal";

export default function EquipmentRow({
  areaId,
  equipment,
}: {
  areaId: string;
  equipment: Equipment;
}) {
  const renameEquipment = useStore((s) => s.renameEquipment);
  const removeEquipment = useStore((s) => s.removeEquipment);

  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(equipment.name);
  const [openModal, setOpenModal] = useState<"assign" | "transfer" | "status" | null>(null);

  function commitEdit() {
    if (draftName.trim()) renameEquipment(areaId, equipment.id, draftName.trim());
    setEditing(false);
  }

  const isRepair = equipment.status.type === "repair";

  return (
    <div className="grid grid-cols-1 items-center gap-2 rounded-xl border border-sky-100 bg-white p-3 shadow-card sm:grid-cols-[1fr_auto_auto_auto_auto]">
      <div className="flex items-center gap-2">
        {editing ? (
          <input
            autoFocus
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitEdit();
              if (e.key === "Escape") setEditing(false);
            }}
            className="w-full rounded-lg border border-sky-300 px-2 py-1.5 text-sm outline-none focus:border-sky-500"
          />
        ) : (
          <button
            onDoubleClick={() => setEditing(true)}
            className="text-left text-sm font-semibold text-sky-900"
            title="Двойной клик — переименовать"
          >
            {equipment.name}
          </button>
        )}
      </div>

      <button
        onClick={() => setOpenModal("assign")}
        className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-100"
      >
        📅 Назначить работу
      </button>

      <button
        onClick={() => setOpenModal("transfer")}
        className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-100"
      >
        🚚 Отправить в другой район
      </button>

      <button
        onClick={() => setOpenModal("status")}
        className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
          isRepair
            ? "border-rose-300 bg-rose-100 text-rose-700"
            : "border-emerald-300 bg-emerald-100 text-emerald-700"
        }`}
      >
        {isRepair
          ? `🔧 На ремонте до ${equipment.status.repairEnd ?? "?"}`
          : "✅ Исправна"}
      </button>

      <button
        onClick={() => {
          if (confirm(`Удалить технику "${equipment.name}"?`)) {
            removeEquipment(areaId, equipment.id);
          }
        }}
        className="rounded-lg px-2 py-1.5 text-xs text-sky-400 hover:bg-rose-50 hover:text-rose-500"
        aria-label="Удалить технику"
      >
        Удалить
      </button>

      {openModal === "assign" && (
        <AssignWorkModal areaId={areaId} equipment={equipment} onClose={() => setOpenModal(null)} />
      )}
      {openModal === "transfer" && (
        <TransferModal areaId={areaId} equipment={equipment} onClose={() => setOpenModal(null)} />
      )}
      {openModal === "status" && (
        <StatusModal areaId={areaId} equipment={equipment} onClose={() => setOpenModal(null)} />
      )}
    </div>
  );
}
