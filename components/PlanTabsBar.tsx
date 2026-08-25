"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { PLAN_SUMMARY_ID } from "@/lib/types";

export default function PlanTabsBar() {
  const planTabs = useStore((s) => s.planTabs);
  const activePlanViewId = useStore((s) => s.activePlanViewId);
  const setActivePlanView = useStore((s) => s.setActivePlanView);
  const addPlanTab = useStore((s) => s.addPlanTab);
  const renamePlanTab = useStore((s) => s.renamePlanTab);
  const removePlanTab = useStore((s) => s.removePlanTab);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");

  function startEdit(id: string, currentName: string) {
    setEditingId(id);
    setDraftName(currentName);
  }

  function commitEdit() {
    if (editingId && draftName.trim()) {
      renamePlanTab(editingId, draftName.trim());
    }
    setEditingId(null);
  }

  function commitAdd() {
    if (newName.trim()) {
      addPlanTab(newName.trim());
    }
    setNewName("");
    setAdding(false);
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

      {planTabs.map((tab) => {
        const isActive = tab.id === activePlanViewId;
        return (
          <div
            key={tab.id}
            className={`group flex items-center gap-1 rounded-full border px-1 py-1 transition ${
              isActive
                ? "border-sky-500 bg-sky-500 text-white shadow-soft"
                : "border-sky-200 bg-white text-sky-700 hover:bg-sky-50"
            }`}
          >
            {editingId === tab.id ? (
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
                onClick={() => setActivePlanView(tab.id)}
                onDoubleClick={() => startEdit(tab.id, tab.name)}
                className="rounded-full px-3 py-1 text-sm font-medium"
                title="Клик — выбрать, двойной клик — переименовать"
              >
                {tab.name}
              </button>
            )}
            <button
              onClick={() => {
                if (confirm(`Удалить вкладку "${tab.name}" и все строки в ней?`)) {
                  removePlanTab(tab.id);
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

      {adding ? (
        <input
          autoFocus
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onBlur={commitAdd}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitAdd();
            if (e.key === "Escape") setAdding(false);
          }}
          placeholder="Название вкладки"
          className="w-40 rounded-full border border-sky-300 bg-white px-3 py-1.5 text-sm text-sky-900 outline-none focus:border-sky-500"
        />
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="rounded-full border border-dashed border-sky-300 px-3 py-1.5 text-sm font-medium text-sky-600 hover:border-sky-500 hover:bg-sky-50"
        >
          + Добавить вкладку
        </button>
      )}
    </div>
  );
}
