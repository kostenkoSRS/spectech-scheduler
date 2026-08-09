"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";

export default function TabsBar() {
  const areas = useStore((s) => s.areas);
  const activeAreaId = useStore((s) => s.activeAreaId);
  const setActiveArea = useStore((s) => s.setActiveArea);
  const addArea = useStore((s) => s.addArea);
  const renameArea = useStore((s) => s.renameArea);
  const removeArea = useStore((s) => s.removeArea);

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
      renameArea(editingId, draftName.trim());
    }
    setEditingId(null);
  }

  function commitAdd() {
    if (newName.trim()) {
      addArea(newName.trim());
    }
    setNewName("");
    setAdding(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-sky-100 bg-white/70 px-4 py-3">
      {areas.map((area) => {
        const isActive = area.id === activeAreaId;
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
                onClick={() => setActiveArea(area.id)}
                onDoubleClick={() => startEdit(area.id, area.name)}
                className="rounded-full px-3 py-1 text-sm font-medium"
                title="Клик — выбрать, двойной клик — переименовать"
              >
                {area.name}
              </button>
            )}
            <button
              onClick={() => {
                if (
                  confirm(
                    `Удалить вкладку "${area.name}" и всю технику в ней?`
                  )
                ) {
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
          placeholder="Название района"
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
