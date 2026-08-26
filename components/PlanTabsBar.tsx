"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { PLAN_SUMMARY_ID } from "@/lib/types";
import AddAreaControl from "./AddAreaControl";

export default function PlanTabsBar() {
  const areas = useStore((s) => s.areas).filter((a) => a.sections.includes("dailyPlan"));
  const activePlanViewId = useStore((s) => s.activePlanViewId);
  const setActivePlanView = useStore((s) => s.setActivePlanView);
  const renameArea = useStore((s) => s.renameArea);
  const removeArea = useStore((s) => s.removeArea);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");

  function startEdit(id: string, currentName: string) {
    setEditingId(id);
    setDraftName(currentName);
  }

  function commitEdit() {
    if (editingId && draftName.trim()) {
      renameArea(editingId, draftName.trim());
    }
    setEditingId(null);
  }

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-sky-100 bg-white/70 px-4 py-3">
      <button
        onClick={() => setActivePlanView(PLAN_SUMMARY_ID)}
        className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
          activePlanViewId === PLAN_SUMMARY_ID
            ? "border-sky-700 bg-sky-700 text-white shadow-soft"
            : "border-sky-300 bg-sky-50 text-sky-700 hover:bg-sky-100"
        }`}
        title="Свод по всем вкладкам плана (нельзя удалить)"
      >
        📊 Свод
      </button>

      {areas.map((area) => {
        const isActive = area.id === activePlanViewId;
        return (
          <div
            key={area.id}
            className={`group flex items-center gap-1 rounded-full border px-1 py-1 transition ${
              isActive
                ? "border-sky-500 bg-sky-500 text-white shadow-soft"
                : "border-sky-200 bg-white text-sky-700 hover:bg-sky-50"
            }`}
          >
            {editingId === area.id ? (
              <input
                autoFocus
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitEdit();
                  if (e.key === "Escape") setEditingId(null);
                }}
                className="w-32 rounded-full bg-white px-3 py-1 text-sm text-sky-900 outline-none"
              />
            ) : (
              <button
                onClick={() => setActivePlanView(area.id)}
                onDoubleClick={() => startEdit(area.id, area.name)}
                className="rounded-full px-3 py-1 text-sm font-medium"
                title="Клик — выбрать, двойной клик — переименовать"
              >
                {area.name}
              </button>
            )}
            <button
              onClick={() => {
                const alsoInDistribution = area.sections.includes("distribution");
                const message = alsoInDistribution
                  ? `Удалить вкладку "${area.name}"? Она также исчезнет из "Распределения спец техники" вместе со всей техникой.`
                  : `Удалить вкладку "${area.name}" и все строки плана в ней?`;
                if (confirm(message)) {
                  removeArea(area.id);
                }
              }}
              className={`hidden rounded-full px-2 py-0.5 text-xs group-hover:inline ${
                isActive ? "text-white/80 hover:text-white" : "text-sky-400 hover:text-rose-500"
              }`}
              aria-label="Удалить вкладку"
            >
              ✕
            </button>
          </div>
        );
      })}

      <AddAreaControl currentSection="dailyPlan" />
    </div>
  );
}
