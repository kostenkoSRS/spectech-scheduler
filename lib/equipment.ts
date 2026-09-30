import { Area, Equipment, EquipmentRequest } from "./types";
import { durationHours } from "./date";

export interface StatusOnDate {
  broken: boolean;
  issue?: string;
}

export function equipmentStatusOnDate(equipment: Equipment, dateKey: string): StatusOnDate {
  const s = equipment.status;
  if (s.type === "repair" && s.repairStart && s.repairEnd && dateKey >= s.repairStart && dateKey <= s.repairEnd) {
    return { broken: true, issue: s.issue };
  }
  return { broken: false };
}

export function statusOnDateLabel(status: StatusOnDate): string {
  return status.broken ? `Неисправна: ${status.issue ?? "не указано"}` : "Исправна";
}

export interface WorkloadEntry {
  title: string;
  address: string;
  startTime: string;
  endTime: string;
  hours: number;
  resName: string; // РЭС, в котором выполняется работа
  kind: "job" | "transfer";
}

// Все работы техники на дату (свои + переброски в другие РЭС) и суммарная занятость
export function dailyWorkload(
  area: Area,
  equipment: Equipment,
  dateKey: string,
  areas: Area[]
): { totalHours: number; entries: WorkloadEntry[] } {
  const entries: WorkloadEntry[] = [
    ...equipment.jobs
      .filter((j) => j.date === dateKey)
      .map((j) => ({
        title: j.title,
        address: j.address,
        startTime: j.startTime,
        endTime: j.endTime,
        hours: durationHours(j.startTime, j.endTime),
        resName: area.name,
        kind: "job" as const,
      })),
    ...equipment.transfers
      .filter((t) => t.date === dateKey)
      .map((t) => ({
        title: t.title,
        address: t.address,
        startTime: t.startTime,
        endTime: t.endTime,
        hours: durationHours(t.startTime, t.endTime),
        resName: areas.find((a) => a.id === t.targetAreaId)?.name ?? "?",
        kind: "transfer" as const,
      })),
  ].sort((a, b) => a.startTime.localeCompare(b.startTime));

  const totalHours = entries.reduce((sum, e) => sum + e.hours, 0);
  return { totalHours, entries };
}

export type WorkloadLevel = "none" | "yellow" | "orange" | "red";

export function workloadLevel(totalHours: number): WorkloadLevel {
  if (totalHours <= 0) return "none";
  if (totalHours <= 4) return "yellow";
  if (totalHours <= 6) return "orange";
  return "red";
}

export interface DayCellInfo {
  broken: boolean;
  issue?: string;
  totalHours: number;
  entries: WorkloadEntry[];
  level: WorkloadLevel | "broken";
}

export function dayCellInfo(
  area: Area,
  equipment: Equipment,
  dateKey: string,
  areas: Area[]
): DayCellInfo {
  const status = equipmentStatusOnDate(equipment, dateKey);
  const { totalHours, entries } = dailyWorkload(area, equipment, dateKey, areas);
  return {
    broken: status.broken,
    issue: status.issue,
    totalHours,
    entries,
    level: status.broken ? "broken" : workloadLevel(totalHours),
  };
}

export const WORKLOAD_LEVEL_BG: Record<WorkloadLevel | "broken", string> = {
  none: "",
  yellow: "bg-amber-200",
  orange: "bg-orange-300",
  red: "bg-rose-300",
  broken: "bg-rose-300",
};

// Те же уровни в HEX — для заливки ячеек при выгрузке в Excel
export const WORKLOAD_LEVEL_HEX: Record<WorkloadLevel | "broken", string | undefined> = {
  none: undefined,
  yellow: "FDE68A",
  orange: "FDBA74",
  red: "FDA4AF",
  broken: "FDA4AF",
};

export function pendingRequestFor(
  requests: EquipmentRequest[],
  equipmentId: string,
  dateKey: string
): EquipmentRequest | undefined {
  return requests.find(
    (r) => r.status === "pending" && r.sourceEquipmentId === equipmentId && r.date === dateKey
  );
}

export function pendingRequestsTargeting(
  requests: EquipmentRequest[],
  targetAreaId: string
): EquipmentRequest[] {
  return requests.filter((r) => r.status === "pending" && r.targetAreaId === targetAreaId);
}

export function declinedRequestsTargeting(
  requests: EquipmentRequest[],
  targetAreaId: string
): EquipmentRequest[] {
  return requests.filter((r) => r.status === "declined" && r.targetAreaId === targetAreaId);
}

export interface BorrowedRow {
  sourceArea: Area;
  equipment: Equipment;
}

// Строки "чужой" техники, которую этот РЭС когда-либо запрашивал (одобренные
// переброски на него + ещё не решённые запросы) — для календаря РЭС-получателя.
export function borrowedRows(thisAreaId: string, allAreas: Area[], requests: EquipmentRequest[]): BorrowedRow[] {
  const seen = new Map<string, BorrowedRow>();
  for (const area of allAreas) {
    if (area.id === thisAreaId) continue;
    for (const eq of area.equipment) {
      const hasTransfer = eq.transfers.some((t) => t.targetAreaId === thisAreaId);
      const hasPending = requests.some(
        (r) => r.status === "pending" && r.sourceEquipmentId === eq.id && r.targetAreaId === thisAreaId
      );
      if (hasTransfer || hasPending) {
        seen.set(`${area.id}:${eq.id}`, { sourceArea: area, equipment: eq });
      }
    }
  }
  return Array.from(seen.values());
}

export interface BorrowedCellInfo {
  pending?: EquipmentRequest;
  totalHours: number;
  entries: WorkloadEntry[];
}

// Ячейка строки заимствованной техники на дату: только то, что относится к
// запрашивающему РЭС (не вся занятость техники у себя дома).
export function borrowedCellInfo(
  equipment: Equipment,
  dateKey: string,
  targetAreaId: string,
  requests: EquipmentRequest[]
): BorrowedCellInfo {
  const pending = requests.find(
    (r) =>
      r.status === "pending" &&
      r.sourceEquipmentId === equipment.id &&
      r.targetAreaId === targetAreaId &&
      r.date === dateKey
  );
  const entries: WorkloadEntry[] = equipment.transfers
    .filter((t) => t.targetAreaId === targetAreaId && t.date === dateKey)
    .map((t) => ({
      title: t.title,
      address: t.address,
      startTime: t.startTime,
      endTime: t.endTime,
      hours: durationHours(t.startTime, t.endTime),
      resName: "",
      kind: "transfer" as const,
    }));
  const totalHours = entries.reduce((sum, e) => sum + e.hours, 0);
  return { pending, totalHours, entries };
}
