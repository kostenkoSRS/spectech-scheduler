export type Importance = "low" | "medium" | "high";

export interface WorkEntry {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  title: string;
  address: string;
  importance: Importance;
}

export interface TransferEntry extends WorkEntry {
  targetAreaId: string;
}

export type EquipmentStatusType = "operational" | "repair";

export interface EquipmentStatus {
  type: EquipmentStatusType;
  issue?: string; // описание неисправности
  repairStart?: string; // YYYY-MM-DD
  repairEnd?: string; // YYYY-MM-DD
}

export interface Equipment {
  id: string;
  name: string;
  jobs: WorkEntry[];
  transfers: TransferEntry[];
  status: EquipmentStatus;
}

export interface Area {
  id: string;
  name: string;
  equipment: Equipment[];
}

export const IMPORTANCE_LABELS: Record<Importance, string> = {
  low: "Низкая",
  medium: "Средняя",
  high: "Важная",
};

export const IMPORTANCE_COLORS: Record<Importance, string> = {
  low: "bg-emerald-100 text-emerald-700 border-emerald-300",
  medium: "bg-amber-100 text-amber-700 border-amber-300",
  high: "bg-rose-100 text-rose-700 border-rose-300",
};
