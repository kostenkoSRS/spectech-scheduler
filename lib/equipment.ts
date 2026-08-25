import { Equipment } from "./types";

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
