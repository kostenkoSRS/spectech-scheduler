import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  Area,
  ColumnScope,
  Equipment,
  EquipmentStatus,
  PLAN_SUMMARY_ID,
  PlanColumn,
  Section,
  TransferEntry,
  WorkEntry,
} from "./types";

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

interface StoreState {
  activeSection: Section;
  setActiveSection: (section: Section) => void;

  // Вкладки (районы) общие для обоих разделов: одна и та же вкладка несёт
  // и технику (equipment), и строки плана (planRows).
  areas: Area[];
  activeAreaId: string | null;
  activePlanViewId: string | null;

  addArea: (name: string, sections: Section[]) => void;
  renameArea: (areaId: string, name: string) => void;
  removeArea: (areaId: string) => void;
  setActiveArea: (areaId: string) => void;
  setActivePlanView: (viewId: string) => void;

  addEquipment: (areaId: string, name: string) => void;
  renameEquipment: (areaId: string, equipmentId: string, name: string) => void;
  removeEquipment: (areaId: string, equipmentId: string) => void;

  addJob: (areaId: string, equipmentId: string, job: Omit<WorkEntry, "id">) => void;
  updateJob: (areaId: string, equipmentId: string, job: WorkEntry) => void;
  removeJob: (areaId: string, equipmentId: string, jobId: string) => void;

  addTransfer: (
    areaId: string,
    equipmentId: string,
    transfer: Omit<TransferEntry, "id">
  ) => void;
  updateTransfer: (
    areaId: string,
    equipmentId: string,
    transfer: TransferEntry
  ) => void;
  removeTransfer: (areaId: string, equipmentId: string, transferId: string) => void;

  setStatus: (areaId: string, equipmentId: string, status: EquipmentStatus) => void;

  planColumns: PlanColumn[];

  addPlanRow: (areaId: string, date: string) => void;
  updatePlanRowValue: (
    areaId: string,
    rowId: string,
    columnId: string,
    value: string
  ) => void;
  removePlanRow: (areaId: string, rowId: string) => void;

  addPlanColumn: (title: string, scope: ColumnScope) => void;
  removePlanColumn: (columnId: string) => void;
}

function seedAreas(): Area[] {
  const areaId = makeId();
  const equipmentId = makeId();
  const equipment: Equipment = {
    id: equipmentId,
    name: "Экскаватор №1",
    jobs: [],
    transfers: [],
    status: { type: "operational" },
  };
  return [
    {
      id: areaId,
      name: "Район 1",
      sections: ["distribution", "dailyPlan"],
      equipment: [equipment],
      planRows: [],
    },
  ];
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      activeSection: "distribution",
      setActiveSection: (section) => set({ activeSection: section }),

      areas: [],
      activeAreaId: null,
      activePlanViewId: PLAN_SUMMARY_ID,

      addArea: (name, sections) =>
        set((state) => {
          const area: Area = { id: makeId(), name, sections, equipment: [], planRows: [] };
          return {
            areas: [...state.areas, area],
            activeAreaId: sections.includes("distribution")
              ? area.id
              : state.activeAreaId,
            activePlanViewId: sections.includes("dailyPlan")
              ? area.id
              : state.activePlanViewId,
          };
        }),

      renameArea: (areaId, name) =>
        set((state) => ({
          areas: state.areas.map((a) => (a.id === areaId ? { ...a, name } : a)),
        })),

      removeArea: (areaId) =>
        set((state) => {
          const areas = state.areas.filter((a) => a.id !== areaId);
          const activeAreaId =
            state.activeAreaId === areaId
              ? areas[0]?.id ?? null
              : state.activeAreaId;
          const activePlanViewId =
            state.activePlanViewId === areaId ? PLAN_SUMMARY_ID : state.activePlanViewId;
          return { areas, activeAreaId, activePlanViewId };
        }),

      setActiveArea: (areaId) => set({ activeAreaId: areaId }),
      setActivePlanView: (viewId) => set({ activePlanViewId: viewId }),

      addEquipment: (areaId, name) =>
        set((state) => ({
          areas: state.areas.map((a) =>
            a.id === areaId
              ? {
                  ...a,
                  equipment: [
                    ...a.equipment,
                    {
                      id: makeId(),
                      name,
                      jobs: [],
                      transfers: [],
                      status: { type: "operational" } as EquipmentStatus,
                    },
                  ],
                }
              : a
          ),
        })),

      renameEquipment: (areaId, equipmentId, name) =>
        set((state) => ({
          areas: state.areas.map((a) =>
            a.id === areaId
              ? {
                  ...a,
                  equipment: a.equipment.map((e) =>
                    e.id === equipmentId ? { ...e, name } : e
                  ),
                }
              : a
          ),
        })),

      removeEquipment: (areaId, equipmentId) =>
        set((state) => ({
          areas: state.areas.map((a) =>
            a.id === areaId
              ? { ...a, equipment: a.equipment.filter((e) => e.id !== equipmentId) }
              : a
          ),
        })),

      addJob: (areaId, equipmentId, job) =>
        set((state) => ({
          areas: state.areas.map((a) =>
            a.id === areaId
              ? {
                  ...a,
                  equipment: a.equipment.map((e) =>
                    e.id === equipmentId
                      ? { ...e, jobs: [...e.jobs, { ...job, id: makeId() }] }
                      : e
                  ),
                }
              : a
          ),
        })),

      updateJob: (areaId, equipmentId, job) =>
        set((state) => ({
          areas: state.areas.map((a) =>
            a.id === areaId
              ? {
                  ...a,
                  equipment: a.equipment.map((e) =>
                    e.id === equipmentId
                      ? {
                          ...e,
                          jobs: e.jobs.map((j) => (j.id === job.id ? job : j)),
                        }
                      : e
                  ),
                }
              : a
          ),
        })),

      removeJob: (areaId, equipmentId, jobId) =>
        set((state) => ({
          areas: state.areas.map((a) =>
            a.id === areaId
              ? {
                  ...a,
                  equipment: a.equipment.map((e) =>
                    e.id === equipmentId
                      ? { ...e, jobs: e.jobs.filter((j) => j.id !== jobId) }
                      : e
                  ),
                }
              : a
          ),
        })),

      addTransfer: (areaId, equipmentId, transfer) =>
        set((state) => ({
          areas: state.areas.map((a) =>
            a.id === areaId
              ? {
                  ...a,
                  equipment: a.equipment.map((e) =>
                    e.id === equipmentId
                      ? {
                          ...e,
                          transfers: [
                            ...e.transfers,
                            { ...transfer, id: makeId() },
                          ],
                        }
                      : e
                  ),
                }
              : a
          ),
        })),

      updateTransfer: (areaId, equipmentId, transfer) =>
        set((state) => ({
          areas: state.areas.map((a) =>
            a.id === areaId
              ? {
                  ...a,
                  equipment: a.equipment.map((e) =>
                    e.id === equipmentId
                      ? {
                          ...e,
                          transfers: e.transfers.map((t) =>
                            t.id === transfer.id ? transfer : t
                          ),
                        }
                      : e
                  ),
                }
              : a
          ),
        })),

      removeTransfer: (areaId, equipmentId, transferId) =>
        set((state) => ({
          areas: state.areas.map((a) =>
            a.id === areaId
              ? {
                  ...a,
                  equipment: a.equipment.map((e) =>
                    e.id === equipmentId
                      ? {
                          ...e,
                          transfers: e.transfers.filter((t) => t.id !== transferId),
                        }
                      : e
                  ),
                }
              : a
          ),
        })),

      setStatus: (areaId, equipmentId, status) =>
        set((state) => ({
          areas: state.areas.map((a) =>
            a.id === areaId
              ? {
                  ...a,
                  equipment: a.equipment.map((e) =>
                    e.id === equipmentId ? { ...e, status } : e
                  ),
                }
              : a
          ),
        })),

      planColumns: [],

      addPlanRow: (areaId, date) =>
        set((state) => ({
          areas: state.areas.map((a) =>
            a.id === areaId
              ? {
                  ...a,
                  planRows: [
                    ...a.planRows,
                    { id: makeId(), date, values: {} },
                  ],
                }
              : a
          ),
        })),

      updatePlanRowValue: (areaId, rowId, columnId, value) =>
        set((state) => ({
          areas: state.areas.map((a) =>
            a.id === areaId
              ? {
                  ...a,
                  planRows: a.planRows.map((r) =>
                    r.id === rowId
                      ? { ...r, values: { ...r.values, [columnId]: value } }
                      : r
                  ),
                }
              : a
          ),
        })),

      removePlanRow: (areaId, rowId) =>
        set((state) => ({
          areas: state.areas.map((a) =>
            a.id === areaId
              ? { ...a, planRows: a.planRows.filter((r) => r.id !== rowId) }
              : a
          ),
        })),

      addPlanColumn: (title, scope) =>
        set((state) => ({
          planColumns: [...state.planColumns, { id: makeId(), title, scope }],
        })),

      removePlanColumn: (columnId) =>
        set((state) => ({
          planColumns: state.planColumns.filter((c) => c.id !== columnId),
        })),
    }),
    {
      name: "spectech-scheduler-storage",
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (state.areas.length === 0) {
          const seeded = seedAreas();
          state.areas = seeded;
          state.activeAreaId = seeded[0].id;
        } else {
          // миграция: у вкладок, созданных раньше, может не быть полей
          // planRows/sections — по умолчанию считаем их общими для обоих разделов
          state.areas = state.areas.map((a) => ({
            ...a,
            planRows: a.planRows ?? [],
            sections: a.sections ?? ["distribution", "dailyPlan"],
          }));
        }
      },
    }
  )
);

export function ensureSeed() {
  const state = useStore.getState();
  if (state.areas.length === 0) {
    const seeded = seedAreas();
    useStore.setState({ areas: seeded, activeAreaId: seeded[0].id });
  }
}
