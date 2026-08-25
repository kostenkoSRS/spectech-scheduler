"use client";

import { useStore } from "@/lib/store";

export default function SectionSwitcher() {
  const activeSection = useStore((s) => s.activeSection);
  const setActiveSection = useStore((s) => s.setActiveSection);

  const sections = [
    { id: "distribution" as const, label: "Распределение спец техники" },
    { id: "dailyPlan" as const, label: "План работ на день" },
  ];

  return (
    <div className="flex gap-2 bg-sky-900 px-4 py-2 sm:px-8">
      {sections.map((s) => (
        <button
          key={s.id}
          onClick={() => setActiveSection(s.id)}
          className={`rounded-t-lg px-4 py-2 text-sm font-semibold transition ${
            activeSection === s.id
              ? "bg-white text-sky-900"
              : "text-sky-100 hover:bg-sky-800"
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
