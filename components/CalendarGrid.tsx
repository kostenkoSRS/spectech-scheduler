"use client";

import { buildMonthGrid, isSameDay, MONTH_NAMES, WEEKDAY_NAMES } from "@/lib/date";

export interface DayCellStyle {
  bgClass: string;
  ring?: boolean;
  dotClass?: string;
}

export default function CalendarGrid({
  year,
  month,
  onPrevMonth,
  onNextMonth,
  selectedDate,
  onSelectDate,
  getCellStyle,
}: {
  year: number;
  month: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  selectedDate: Date | null;
  onSelectDate: (d: Date) => void;
  getCellStyle: (d: Date) => DayCellStyle;
}) {
  const cells = buildMonthGrid(year, month);
  const today = new Date();

  return (
    <div className="rounded-xl border border-sky-100 bg-sky-25 p-3">
      <div className="mb-2 flex items-center justify-between">
        <button
          onClick={onPrevMonth}
          className="rounded-lg px-2 py-1 text-sky-500 hover:bg-sky-100"
          aria-label="Предыдущий месяц"
        >
          ‹
        </button>
        <div className="text-sm font-semibold text-sky-900">
          {MONTH_NAMES[month]} {year}
        </div>
        <button
          onClick={onNextMonth}
          className="rounded-lg px-2 py-1 text-sky-500 hover:bg-sky-100"
          aria-label="Следующий месяц"
        >
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-sky-400">
        {WEEKDAY_NAMES.map((w) => (
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, idx) => {
          if (!date) return <div key={idx} />;
          const style = getCellStyle(date);
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const isToday = isSameDay(date, today);
          return (
            <button
              key={idx}
              onClick={() => onSelectDate(date)}
              className={`relative aspect-square rounded-lg text-sm transition ${style.bgClass} ${
                isSelected
                  ? "ring-2 ring-sky-600"
                  : isToday
                  ? "ring-1 ring-sky-400"
                  : ""
              } hover:brightness-95`}
            >
              {date.getDate()}
              {style.dotClass && (
                <span
                  className={`absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full ${style.dotClass}`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
