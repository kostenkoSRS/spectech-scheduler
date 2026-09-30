"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { EquipmentRequest, IMPORTANCE_LABELS } from "@/lib/types";

export default function RequestCellBadge({ request }: { request: EquipmentRequest }) {
  const [open, setOpen] = useState(false);
  const areas = useStore((s) => s.areas);
  const approveEquipmentRequest = useStore((s) => s.approveEquipmentRequest);
  const declineEquipmentRequest = useStore((s) => s.declineEquipmentRequest);

  const requester = areas.find((a) => a.id === request.targetAreaId);

  return (
    <div className="relative mt-0.5">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="w-full rounded border border-violet-300 bg-violet-100 px-1 py-0.5 text-left text-[10px] font-medium text-violet-800 hover:bg-violet-200"
      >
        ❓ Запрос: {requester?.name ?? "?"}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-30 mt-1 w-56 rounded-lg border border-sky-200 bg-white p-3 text-left text-xs normal-case leading-normal shadow-2xl">
            <div className="font-semibold text-sky-900">{request.title}</div>
            <div className="mt-0.5 text-sky-600">
              {request.startTime}–{request.endTime} · {request.address}
            </div>
            <div className="mt-0.5 text-sky-500">Запрашивает: {requester?.name ?? "?"}</div>
            <div className="mt-0.5 text-sky-500">Важность: {IMPORTANCE_LABELS[request.importance]}</div>
            <div className="mt-2 flex gap-1.5">
              <button
                onClick={() => {
                  approveEquipmentRequest(request.id);
                  setOpen(false);
                }}
                className="flex-1 rounded bg-emerald-600 px-2 py-1 font-medium text-white hover:bg-emerald-700"
              >
                Одобрить
              </button>
              <button
                onClick={() => {
                  declineEquipmentRequest(request.id);
                  setOpen(false);
                }}
                className="flex-1 rounded bg-rose-600 px-2 py-1 font-medium text-white hover:bg-rose-700"
              >
                Отказать
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
