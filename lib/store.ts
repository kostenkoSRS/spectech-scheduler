import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  Area,
  Equipment,
  EquipmentStatus,
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
  areas: Area[];
  activeAreaId: string | null;

  addArea: (name: string) => void;
  renameArea: (areaId: string, name: string) => void;
  removeArea: (areaId: string) => void;
  setActiveArea: (areaId: string) => void;

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
      equipment: [equipment],
    },
  ];
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      areas: [],
      activeAreaId: null,

      addArea: (name) =>
        set((state) => {
          const area: Area = { id: makeId(), name, equipment: [] };
          return {
            areas: [...state.areas, area],
            activeAreaId: state.activeAreaId ?? area.id,
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
          return { areas, activeAreaId };
        }),

      setActiveArea: (areaId) => set({ activeAreaId: areaId }),

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
    }),
    {
      name: "spectech-scheduler-storage",
      onRehydrateStorage: () => (state) => {
        if (state && state.areas.length === 0) {
          const seeded = seedAreas();
          state.areas = seeded;
          state.activeAreaId = seeded[0].id;
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
