import { Area, Equipment } from "./types";
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
  if (totalHours < 8) return "orange";
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
