"use client";

import { useMemo, useState } from "react";
import Modal from "./Modal";
import CalendarGrid, { DayCellStyle } from "./CalendarGrid";
import { useStore } from "@/lib/store";
import { Equipment, IMPORTANCE_COLORS, IMPORTANCE_LABELS, Importance } from "@/lib/types";
import { durationHours, toDateKey } from "@/lib/date";

export default function AssignWorkModal({
  areaId,
  equipment,
  onClose,
}: {
  areaId: string;
  equipment: Equipment;
  onClose: () => void;
}) {
  const addJob = useStore((s) => s.addJob);
  const removeJob = useStore((s) => s.removeJob);

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(now);

  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [importance, setImportance] = useState<Importance>("medium");

  const jobsByDate = useMemo(() => {
    const map = new Map<string, typeof equipment.jobs>();
    for (const job of equipment.jobs) {
      const list = map.get(job.date) ?? [];
      list.push(job);
      map.set(job.date, list);
    }
    return map;
  }, [equipment.jobs]);

  function getCellStyle(date: Date): DayCellStyle {
    const jobs = jobsByDate.get(toDateKey(date)) ?? [];
    if (jobs.length === 0) return { bgClass: "bg-white" };
    const maxDuration = Math.max(...jobs.map((j) => durationHours(j.startTime, j.endTime)));
    return maxDuration >= 8
      ? { bgClass: "bg-rose-300 text-rose-900 font-semibold" }
      : { bgClass: "bg-amber-200 text-amber-900 font-semibold" };
  }

  const selectedKey = selectedDate ? toDateKey(selectedDate) : null;
  const dayJobs = selectedKey ? jobsByDate.get(selectedKey) ?? [] : [];

  function handleSave() {
    if (!selectedDate || !title.trim() || !address.trim()) return;
    addJob(areaId, equipment.id, {
      date: toDateKey(selectedDate),
      startTime,
      endTime,
      title: title.trim(),
      address: address.trim(),
      importance,
    });
    setTitle("");
    setAddress("");
  }

  return (
    <Modal title={`Назначить работу — ${equipment.name}`} onClose={onClose} width="max-w-3xl">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <CalendarGrid
            year={year}
            month={month}
            onPrevMonth={() => {
              const d = new Date(year, month - 1, 1);
              setYear(d.getFullYear());
              setMonth(d.getMonth());
            }}
            onNextMonth={() => {
              const d = new Date(year, month + 1, 1);
              setYear(d.getFullYear());
              setMonth(d.getMonth());
            }}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            getCellStyle={getCellStyle}
          />
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-sky-700">
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded bg-amber-200" /> занято, менее 8 ч
            </span>
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded bg-rose-300" /> занято, 8 ч и более
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="text-sm font-medium text-sky-900">
            {selectedDate
              ? selectedDate.toLocaleDateString("ru-RU", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })
              : "Выберите дату"}
          </div>

          {dayJobs.length > 0 && (
            <div className="flex flex-col gap-2 rounded-lg border border-sky-100 bg-sky-25 p-2">
              {dayJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-start justify-between gap-2 rounded-md bg-white p-2 text-sm shadow-card"
                >
                  <div>
                    <div className="font-medium text-sky-900">{job.title}</div>
                    <div className="text-xs text-sky-600">
                      {job.startTime}–{job.endTime} · {job.address}
                    </div>
                    <span
                      className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-[11px] ${IMPORTANCE_COLORS[job.importance]}`}
                    >
                      {IMPORTANCE_LABELS[job.importance]}
                    </span>
                  </div>
                  <button
                    onClick={() => removeJob(areaId, equipment.id, job.id)}
                    className="rounded-full px-2 text-sky-400 hover:bg-rose-50 hover:text-rose-500"
                    aria-label="Удалить"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-2 rounded-lg border border-sky-200 bg-white p-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Название работы"
              className="rounded-lg border border-sky-200 px-3 py-2 text-sm outline-none focus:border-sky-500"
            />
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Адрес проведения работы"
              className="rounded-lg border border-sky-200 px-3 py-2 text-sm outline-none focus:border-sky-500"
            />
            <div className="flex gap-2">
              <label className="flex-1 text-xs text-sky-600">
                Начало
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-sky-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500"
                />
              </label>
              <label className="flex-1 text-xs text-sky-600">
                Окончание
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-sky-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500"
                />
              </label>
            </div>
            <div className="flex gap-2">
              {(["low", "medium", "high"] as Importance[]).map((imp) => (
                <button
                  key={imp}
                  onClick={() => setImportance(imp)}
                  className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium ${
                    importance === imp
                      ? IMPORTANCE_COLORS[imp]
                      : "border-sky-100 bg-white text-sky-400"
                  }`}
                >
                  {IMPORTANCE_LABELS[imp]}
                </button>
              ))}
            </div>
            <button
              onClick={handleSave}
              disabled={!selectedDate || !title.trim() || !address.trim()}
              className="mt-1 rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-200"
            >
              Добавить работу
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
