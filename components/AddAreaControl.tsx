"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Section } from "@/lib/types";

const OTHER_SECTION_LABEL: Record<Section, string> = {
  distribution: "«Распределение спец техники»",
  dailyPlan: "«План работ на день»",
};

export default function AddAreaControl({ currentSection }: { currentSection: Section }) {
  const addArea = useStore((s) => s.addArea);
  const otherSection: Section = currentSection === "distribution" ? "dailyPlan" : "distribution";

  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [alsoOther, setAlsoOther] = useState(true);

  function reset() {
    setName("");
    setAlsoOther(true);
    setAdding(false);
  }

  function commitAdd() {
    if (!name.trim()) {
      reset();
      return;
    }
    const sections: Section[] = alsoOther ? [currentSection, otherSection] : [currentSection];
    addArea(name.trim(), sections);
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
      <label className="flex items-center gap-1.5 whitespace-nowrap px-1 text-xs text-sky-600">
        <input
          type="checkbox"
          checked={alsoOther}
          onChange={(e) => setAlsoOther(e.target.checked)}
          className="accent-sky-600"
        />
        также показать в {OTHER_SECTION_LABEL[otherSection]}
      </label>
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
