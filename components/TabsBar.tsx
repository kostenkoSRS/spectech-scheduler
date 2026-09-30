"use client";

import { useStore } from "@/lib/store";
import { DISTRIBUTION_SUMMARY_ID } from "@/lib/types";

export default function TabsBar() {
  const areas = useStore((s) => s.areas)
    .filter((a) => a.sections.includes("distribution"))
    .sort((a, b) => a.name.localeCompare(b.name, "ru"));
  const activeAreaId = useStore((s) => s.activeAreaId);
  const setActiveArea = useStore((s) => s.setActiveArea);

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-sky-100 bg-white/70 px-4 py-3">
      <button
        onClick={() => setActiveArea(DISTRIBUTION_SUMMARY_ID)}
        className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
          activeAreaId === DISTRIBUTION_SUMMARY_ID
            ? "border-sky-700 bg-sky-700 text-white shadow-soft"
            : "border-sky-300 bg-sky-50 text-sky-700 hover:bg-sky-100"
        }`}
        title="Свод по всей технике (нельзя удалить)"
      >
        📊 Свод
      </button>

      {areas.map((area) => {
        const isActive = area.id === activeAreaId;
        return (
          <button
            key={area.id}
            onClick={() => setActiveArea(area.id)}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
              isActive
                ? "border-sky-500 bg-sky-500 text-white shadow-soft"
                : "border-sky-200 bg-white text-sky-700 hover:bg-sky-50"
            }`}
          >
            {area.name}
          </button>
        );
      })}
    </div>
  );
}
