"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { DISTRIBUTION_SUMMARY_ID, PLAN_SUMMARY_ID } from "@/lib/types";
import SectionSwitcher from "@/components/SectionSwitcher";
import TabsBar from "@/components/TabsBar";
import AreaPanel from "@/components/AreaPanel";
import EquipmentSummaryTable from "@/components/EquipmentSummaryTable";
import PlanTabsBar from "@/components/PlanTabsBar";
import PlanTabPanel from "@/components/PlanTabPanel";
import PlanSummaryTable from "@/components/PlanSummaryTable";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const activeSection = useStore((s) => s.activeSection);
  const areas = useStore((s) => s.areas);
  const activeAreaId = useStore((s) => s.activeAreaId);
  const activePlanViewId = useStore((s) => s.activePlanViewId);

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

  const activeArea = areas.find((a) => a.id === activeAreaId) ?? null;
  const activePlanArea = areas.find((a) => a.id === activePlanViewId) ?? null;

  return (
    <main className="min-h-screen">
      <header className="border-b border-sky-100 bg-white px-4 py-4 shadow-soft sm:px-8">
        <h1 className="text-xl font-bold text-sky-900">Распределение спецтехники</h1>
        <p className="text-sm text-sky-500">
          Учёт техники по районам и ежедневный план работ — в одном месте.
        </p>
      </header>

      <SectionSwitcher />

      {activeSection === "distribution" ? (
        <>
          <TabsBar />
          <div className="px-4 py-6 sm:px-8">
            {activeAreaId === DISTRIBUTION_SUMMARY_ID ? (
              <EquipmentSummaryTable areas={areas} />
            ) : activeArea ? (
              <AreaPanel key={activeArea.id} area={activeArea} />
            ) : (
              <div className="rounded-xl border border-dashed border-sky-200 bg-white/60 p-8 text-center text-sky-500">
                Создайте первую вкладку (район), чтобы начать работу.
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <PlanTabsBar />
          <div className="px-4 py-6 sm:px-8">
            {activePlanViewId === PLAN_SUMMARY_ID ? (
              <PlanSummaryTable />
            ) : activePlanArea ? (
              <PlanTabPanel key={activePlanArea.id} area={activePlanArea} />
            ) : (
              <div className="rounded-xl border border-dashed border-sky-200 bg-white/60 p-8 text-center text-sky-500">
                Создайте вкладку, чтобы начать заполнять план работ на день.
              </div>
            )}
          </div>
        </>
      )}
    </main>
  );
}
