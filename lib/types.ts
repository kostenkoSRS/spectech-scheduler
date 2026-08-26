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

export const DISTRIBUTION_SUMMARY_ID = "__equipment_summary__";
export const PLAN_SUMMARY_ID = "__plan_summary__";

export type ColumnScope =
  | { type: "all" }
  | { type: "date"; date: string } // YYYY-MM-DD
  | { type: "weekday"; weekday: number }; // 0 = Пн ... 6 = Вс

export interface PlanColumn {
  id: string;
  title: string;
  scope: ColumnScope;
}

export interface PlanRow {
  id: string;
  date: string; // YYYY-MM-DD, дата создания строки — строка видна на эту и все последующие даты
  values: Record<string, string>; // columnId -> значение
}

export type Section = "distribution" | "dailyPlan";

// Вкладка (район) может относиться к одному разделу или к обоим сразу —
// это решается при создании вкладки. Если вкладка есть в обоих разделах,
// это один и тот же объект: техника (equipment) и строки плана (planRows)
// живут в одном месте, название и переименование синхронны сами по себе.
export interface Area {
  id: string;
  name: string;
  sections: Section[];
  equipment: Equipment[];
  planRows: PlanRow[];
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
