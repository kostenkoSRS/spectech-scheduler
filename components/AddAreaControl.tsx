"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";

export default function AddAreaControl() {
  const areas = useStore((s) => s.areas);
  const addArea = useStore((s) => s.addArea);
  const duplicateArea = useStore((s) => s.duplicateArea);

  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [duplicateFrom, setDuplicateFrom] = useState("");

  function reset() {
    setName("");
    setDuplicateFrom("");
    setAdding(false);
  }

  function commitAdd() {
    if (!name.trim()) {
      reset();
      return;
    }
    if (duplicateFrom) {
      duplicateArea(duplicateFrom, name.trim());
    } else {
      addArea(name.trim());
    }
    reset();
  }

  if (!adding) {
    return (
      <button
        onClick={() => setAdding(true)}
        className="rounded-full border border-dashed border-sky-300 px-3 py-1.5 text-sm font-medium text-sky-600 hover:border-sky-500 hover:bg-sky-50"
      >
        + Добавить вкладку
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-full border border-sky-300 bg-white px-2 py-1">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") commitAdd();
          if (e.key === "Escape") reset();
        }}
        placeholder="Название вкладки"
        className="w-36 rounded-full px-2 py-1 text-sm text-sky-900 outline-none"
      />
      {areas.length > 0 && (
        <select
          value={duplicateFrom}
          onChange={(e) => setDuplicateFrom(e.target.value)}
          className="rounded-full border border-sky-100 bg-sky-25 px-1.5 py-1 text-xs text-sky-600 outline-none"
        >
          <option value="">Не дублировать</option>
          {areas.map((a) => (
            <option key={a.id} value={a.id}>
              Дублировать «{a.name}»
            </option>
          ))}
        </select>
      )}
      <button
        onClick={commitAdd}
        disabled={!name.trim()}
        className="rounded-full px-2 py-1 text-sm font-semibold text-sky-600 hover:bg-sky-50 disabled:cursor-not-allowed disabled:text-sky-300"
        aria-label="Создать вкладку"
      >
        ✓
      </button>
      <button
        onClick={reset}
        className="rounded-full px-2 py-1 text-sm text-sky-400 hover:bg-rose-50 hover:text-rose-500"
        aria-label="Отмена"
      >
        ✕
      </button>
    </div>
  );
}
