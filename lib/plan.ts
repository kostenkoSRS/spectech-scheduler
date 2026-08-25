import { weekdayOfDateKey } from "./date";
import { PlanColumn } from "./types";

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
