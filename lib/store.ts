import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  Area,
  ColumnScope,
  Equipment,
  EquipmentRequest,
  EquipmentStatus,
  PLAN_SUMMARY_ID,
  DISTRIBUTION_SUMMARY_ID,
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

// Фиксированный список РЭС — вкладки не создаются/переименовываются/удаляются
// вручную. В "Распределении спец техники" — 10 РЭС (включая СМИА), в "Плане
// работ на день" — те же, кроме СМИА.
const DISTRIBUTION_RES_NAMES = [
  "АРЭС",
  "АпРЭС",
  "БРЭС",
  "ВРЭС",
  "ВУРЭС",
  "ЗРЭС",
  "ЛРЭС",
  "ПРЭС",
  "ПрРЭС",
  "СМИА",
];
const PLAN_RES_NAMES = DISTRIBUTION_RES_NAMES.filter((n) => n !== "СМИА");

function sectionsForResName(name: string): Section[] {
  const sections: Section[] = [];
  if (DISTRIBUTION_RES_NAMES.includes(name)) sections.push("distribution");
  if (PLAN_RES_NAMES.includes(name)) sections.push("dailyPlan");
  return sections;
}

// Приводит список вкладок к фиксированному набору РЭС: сохраняет данные уже
// существующих (по названию) вкладок РЭС, создаёт недостающие пустыми и
// убирает всё, что в список РЭС не входит (вкладки, добавленные вручную).
function reconcileFixedAreas(areas: Area[]): Area[] {
  const allNames = Array.from(new Set([...DISTRIBUTION_RES_NAMES, ...PLAN_RES_NAMES]));
  return allNames.map((name) => {
    const existing = areas.find((a) => a.name === name);
    if (existing) {
      return { ...existing, sections: sectionsForResName(name) };
    }
    return {
      id: makeId(),
      name,
      sections: sectionsForResName(name),
      equipment: [],
      planRows: [],
    };
  });
}

interface StoreState {
  activeSection: Section;
  setActiveSection: (section: Section) => void;

  // Вкладки — фиксированный список РЭС, общий для обоих разделов: одна и та
  // же вкладка несёт и технику (equipment), и строки плана (planRows).
  areas: Area[];
  activeAreaId: string | null;
  activePlanViewId: string | null;

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

  equipmentRequests: EquipmentRequest[];
  addEquipmentRequest: (request: Omit<EquipmentRequest, "id" | "status">) => void;
  approveEquipmentRequest: (requestId: string) => void;
  declineEquipmentRequest: (requestId: string) => void;
  acknowledgeEquipmentRequest: (requestId: string) => void;
}

function seedAreas(): Area[] {
  const equipment: Equipment = {
    id: makeId(),
    name: "Экскаватор №1",
    jobs: [],
    transfers: [],
    status: { type: "operational" },
  };
  return reconcileFixedAreas([]).map((a, i) =>
    i === 0 ? { ...a, equipment: [equipment] } : a
  );
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      activeSection: "distribution",
      setActiveSection: (section) => set({ activeSection: section }),

      areas: [],
      activeAreaId: DISTRIBUTION_SUMMARY_ID,
      activePlanViewId: PLAN_SUMMARY_ID,

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

      equipmentRequests: [],

      addEquipmentRequest: (request) =>
        set((state) => ({
          equipmentRequests: [
            ...state.equipmentRequests,
            { ...request, id: makeId(), status: "pending" },
          ],
        })),

      approveEquipmentRequest: (requestId) =>
        set((state) => {
          const req = state.equipmentRequests.find((r) => r.id === requestId);
          if (!req) return state;
          return {
            equipmentRequests: state.equipmentRequests.filter((r) => r.id !== requestId),
            areas: state.areas.map((a) =>
              a.id === req.sourceAreaId
                ? {
                    ...a,
                    equipment: a.equipment.map((e) =>
                      e.id === req.sourceEquipmentId
                        ? {
                            ...e,
                            transfers: [
                              ...e.transfers,
                              {
                                id: makeId(),
                                date: req.date,
                                startTime: req.startTime,
                                endTime: req.endTime,
                                title: req.title,
                                address: req.address,
                                importance: req.importance,
                                targetAreaId: req.targetAreaId,
                              },
                            ],
                          }
                        : e
                    ),
                  }
                : a
            ),
          };
        }),

      declineEquipmentRequest: (requestId) =>
        set((state) => ({
          equipmentRequests: state.equipmentRequests.map((r) =>
            r.id === requestId ? { ...r, status: "declined" } : r
          ),
        })),

      acknowledgeEquipmentRequest: (requestId) =>
        set((state) => ({
          equipmentRequests: state.equipmentRequests.filter((r) => r.id !== requestId),
        })),
    }),
    {
      name: "spectech-scheduler-storage",
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (state.areas.length === 0) {
          state.areas = seedAreas();
        } else {
          // миграция: старым вкладкам может не хватать planRows; а сам набор
          // вкладок приводим к фиксированному списку РЭС (лишние — убираем,
          // недостающие — создаём пустыми, существующие данные сохраняем)
          state.areas = reconcileFixedAreas(
            state.areas.map((a) => ({ ...a, planRows: a.planRows ?? [] }))
          );
        }
        if (!state.areas.some((a) => a.id === state.activeAreaId)) {
          state.activeAreaId = DISTRIBUTION_SUMMARY_ID;
        }
        if (!state.areas.some((a) => a.id === state.activePlanViewId)) {
          state.activePlanViewId = PLAN_SUMMARY_ID;
        }
        state.equipmentRequests = state.equipmentRequests ?? [];
      },
    }
  )
);

export function ensureSeed() {
  const state = useStore.getState();
  if (state.areas.length === 0) {
    useStore.setState({ areas: seedAreas() });
  }
}
