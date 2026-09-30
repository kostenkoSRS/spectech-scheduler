export function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

export function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function durationHours(startTime: string, endTime: string): number {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  let minutes = eh * 60 + em - (sh * 60 + sm);
  if (minutes < 0) minutes += 24 * 60; // overnight work
  return minutes / 60;
}

export const MONTH_NAMES = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

export const WEEKDAY_NAMES = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export function buildMonthGrid(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// Понедельник = 0 ... Воскресенье = 6, соответствует порядку WEEKDAY_NAMES
export function weekdayOfDateKey(key: string): number {
  return (parseDateKey(key).getDay() + 6) % 7;
}

export function formatDateKeyLong(key: string): string {
  return parseDateKey(key).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function shiftDateKey(key: string, days: number): string {
  const d = parseDateKey(key);
  d.setDate(d.getDate() + days);
  return toDateKey(d);
}

export type ExportPeriod = "day" | "week" | "month" | "year";

export const EXPORT_PERIOD_LABELS: Record<ExportPeriod, string> = {
  day: "Текущий день",
  week: "Текущая неделя",
  month: "Текущий месяц",
  year: "Текущий год",
};

export function periodRange(key: string, period: ExportPeriod): { start: string; end: string } {
  const d = parseDateKey(key);
  switch (period) {
    case "day":
      return { start: key, end: key };
    case "week": {
      const offset = weekdayOfDateKey(key); // 0 = Пн
      const start = shiftDateKey(key, -offset);
      const end = shiftDateKey(start, 6);
      return { start, end };
    }
    case "month": {
      const start = toDateKey(new Date(d.getFullYear(), d.getMonth(), 1));
      const end = toDateKey(new Date(d.getFullYear(), d.getMonth() + 1, 0));
      return { start, end };
    }
    case "year": {
      const start = toDateKey(new Date(d.getFullYear(), 0, 1));
      const end = toDateKey(new Date(d.getFullYear(), 11, 31));
      return { start, end };
    }
  }
}

export function datesInMonth(year: number, month: number): string[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const out: string[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    out.push(toDateKey(new Date(year, month, d)));
  }
  return out;
}

export function eachDateKeyInRange(start: string, end: string): string[] {
  const out: string[] = [];
  let cur = start;
  let guard = 0;
  while (cur <= end && guard < 400) {
    out.push(cur);
    cur = shiftDateKey(cur, 1);
    guard += 1;
  }
  return out;
}
