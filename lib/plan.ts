import { weekdayOfDateKey } from "./date";
import { PlanColumn, PlanRow } from "./types";

export function isColumnVisibleOnDate(column: PlanColumn, dateKey: string): boolean {
  switch (column.scope.type) {
    case "all":
      return true;
    case "date":
      return column.scope.date === dateKey;
    case "weekday":
      return weekdayOfDateKey(dateKey) === column.scope.weekday;
  }
}

// Строка видна на дату создания и на все последующие даты, но не влияет на
// более ранние даты (которые уже прошли на момент её создания).
export function visiblePlanRows(rows: PlanRow[], dateKey: string): PlanRow[] {
  return rows.filter((r) => r.date <= dateKey);
}

export function columnScopeLabel(column: PlanColumn): string {
  switch (column.scope.type) {
    case "all":
      return "Все даты";
    case "date":
      return column.scope.date;
    case "weekday":
      return "по " + ["пн", "вт", "ср", "чт", "пт", "сб", "вс"][column.scope.weekday];
  }
}
