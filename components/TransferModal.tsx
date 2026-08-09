"use client";

import { useMemo, useState } from "react";
import Modal from "./Modal";
import CalendarGrid, { DayCellStyle } from "./CalendarGrid";
import { useStore } from "@/lib/store";
import { Equipment, IMPORTANCE_COLORS, IMPORTANCE_LABELS, Importance } from "@/lib/types";
import { durationHours, toDateKey } from "@/lib/date";

export default function TransferModal({
  areaId,
  equipment,
  onClose,
}: {
  areaId: string;
  equipment: Equipment;
  onClose: () => void;
}) {
  const areas = useStore((s) => s.areas);
  const addTransfer = useStore((s) => s.addTransfer);
  const removeTransfer = useStore((s) => s.removeTransfer);

  const otherAreas = areas.filter((a) => a.id !== areaId);

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(now);

  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [importance, setImportance] = useState<Importance>("medium");
  const [targetAreaId, setTargetAreaId] = useState(otherAreas[0]?.id ?? "");

  const jobsByDate = useMemo(() => {
    const map = new Map<string, typeof equipment.jobs>();
    for (const job of equipment.jobs) {
      const list = map.get(job.date) ?? [];
      list.push(job);
      map.set(job.date, list);
    }
    return map;
  }, [equipment.jobs]);

  const transfersByDate = useMemo(() => {
    const map = new Map<string, typeof equipment.transfers>();
    for (const t of equipment.transfers) {
      const list = map.get(t.date) ?? [];
      list.push(t);
      map.set(t.date, list);
    }
    return map;
  }, [equipment.transfers]);

  function getCellStyle(date: Date): DayCellStyle {
    const key = toDateKey(date);
    const jobs = jobsByDate.get(key) ?? [];
    const transfers = transfersByDate.get(key) ?? [];
    let bgClass = "bg-white";
    if (jobs.length > 0) {
      const maxDuration = Math.max(...jobs.map((j) => durationHours(j.startTime, j.endTime)));
      bgClass = maxDuration >= 8 ? "bg-rose-300 text-rose-900 font-semibold" : "bg-amber-200 text-amber-900 font-semibold";
    }
    return {
      bgClass,
      dotClass: transfers.length > 0 ? "bg-sky-600" : undefined,
    };
  }

  const selectedKey = selectedDate ? toDateKey(selectedDate) : null;
  const dayBusyJobs = selectedKey ? jobsByDate.get(selectedKey) ?? [] : [];
  const dayTransfers = selectedKey ? transfersByDate.get(selectedKey) ?? [] : [];

  function handleSave() {
    if (!selectedDate || !title.trim() || !address.trim() || !targetAreaId) return;
    addTransfer(areaId, equipment.id, {
      date: toDateKey(selectedDate),
      startTime,
      endTime,
      title: title.trim(),
      address: address.trim(),
      importance,
      targetAreaId,
    });
    setTitle("");
    setAddress("");
  }

  if (otherAreas.length === 0) {
    return (
      <Modal title={`Отправить в другой район — ${equipment.name}`} onClose={onClose}>
        <p className="text-sm text-sky-700">
          Сначала создайте ещё одну вкладку (район), чтобы можно было запросить переброску техники.
        </p>
      </Modal>
    );
  }

  return (
    <Modal title={`Отправить в другой район — ${equipment.name}`} onClose={onClose} width="max-w-3xl">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-sm font-medium text-sky-800">Куда:</span>
        <select
          value={targetAreaId}
          onChange={(e) => setTargetAreaId(e.target.value)}
          className="rounded-lg border border-sky-200 px-3 py-1.5 text-sm outline-none focus:border-sky-500"
        >
          {otherAreas.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

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
              <span className="h-3 w-3 rounded bg-amber-200" /> занята (местные работы), &lt;8 ч
            </span>
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded bg-rose-300" /> занята (местные работы), ≥8 ч
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-sky-600" /> есть запрос переброски
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

          {dayBusyJobs.length > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900">
              <div className="mb-1 font-semibold">Занято по местному графику:</div>
              {dayBusyJobs.map((job) => (
                <div key={job.id}>
                  {job.startTime}–{job.endTime} · {job.title}
                </div>
              ))}
            </div>
          )}

          {dayTransfers.length > 0 && (
            <div className="flex flex-col gap-2 rounded-lg border border-sky-100 bg-sky-25 p-2">
              {dayTransfers.map((t) => {
                const target = areas.find((a) => a.id === t.targetAreaId);
                return (
                  <div
                    key={t.id}
                    className="flex items-start justify-between gap-2 rounded-md bg-white p-2 text-sm shadow-card"
                  >
                    <div>
                      <div className="font-medium text-sky-900">{t.title}</div>
                      <div className="text-xs text-sky-600">
                        {t.startTime}–{t.endTime} · {t.address}
                      </div>
                      <div className="text-xs text-sky-500">
                        Район назначения: {target?.name ?? "—"}
                      </div>
                      <span
                        className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-[11px] ${IMPORTANCE_COLORS[t.importance]}`}
                      >
                        {IMPORTANCE_LABELS[t.importance]}
                      </span>
                    </div>
                    <button
                      onClick={() => removeTransfer(areaId, equipment.id, t.id)}
                      className="rounded-full px-2 text-sky-400 hover:bg-rose-50 hover:text-rose-500"
                      aria-label="Удалить"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
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
              disabled={!selectedDate || !title.trim() || !address.trim() || !targetAreaId}
              className="mt-1 rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-200"
            >
              Отправить запрос
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
