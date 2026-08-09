"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import TabsBar from "@/components/TabsBar";
import AreaPanel from "@/components/AreaPanel";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const areas = useStore((s) => s.areas);
  const activeAreaId = useStore((s) => s.activeAreaId);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <main className="flex min-h-screen items-center justify-center text-sky-400">
        Загрузка…
      </main>
    );
  }

  const activeArea = areas.find((a) => a.id === activeAreaId) ?? areas[0] ?? null;

  return (
    <main className="min-h-screen">
      <header className="border-b border-sky-100 bg-white px-4 py-4 shadow-soft sm:px-8">
        <h1 className="text-xl font-bold text-sky-900">
          Распределение спецтехники
        </h1>
        <p className="text-sm text-sky-500">
          Вкладки — районы. В каждой — техника с назначением работ, переброской и статусом ремонта.
        </p>
      </header>

      <TabsBar />

      <div className="px-4 py-6 sm:px-8">
        {activeArea ? (
          <AreaPanel key={activeArea.id} area={activeArea} />
        ) : (
          <div className="rounded-xl border border-dashed border-sky-200 bg-white/60 p-8 text-center text-sky-500">
            Создайте первую вкладку (район), чтобы начать работу.
          </div>
        )}
      </div>
    </main>
  );
}
