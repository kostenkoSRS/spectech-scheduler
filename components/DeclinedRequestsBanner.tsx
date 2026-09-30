"use client";

import { useStore } from "@/lib/store";
import { declinedRequestsTargeting } from "@/lib/equipment";

export default function DeclinedRequestsBanner({ areaId }: { areaId: string }) {
  const equipmentRequests = useStore((s) => s.equipmentRequests);
  const areas = useStore((s) => s.areas);
  const acknowledgeEquipmentRequest = useStore((s) => s.acknowledgeEquipmentRequest);

  const declined = declinedRequestsTargeting(equipmentRequests, areaId);
  if (declined.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {declined.map((req) => {
        const owner = areas.find((a) => a.id === req.sourceAreaId);
        return (
          <div
            key={req.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-rose-300 bg-rose-100 px-4 py-2.5 text-sm text-rose-800"
          >
            <span>
              ❌ Запрос техники «{owner?.equipment.find((e) => e.id === req.sourceEquipmentId)?.name ?? "?"}» у{" "}
              <b>{owner?.name ?? "?"}</b> на {req.date} отклонён.
            </span>
            <button
              onClick={() => acknowledgeEquipmentRequest(req.id)}
              className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-700"
            >
              Ознакомлен
            </button>
          </div>
        );
      })}
    </div>
  );
}
