"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { WorkEntry, IMPORTANCE_COLORS, IMPORTANCE_LABELS, Importance } from "@/lib/types";

export default function DayJobEditor({
  areaId,
  equipmentId,
  date,
  jobs,
  onClose,
}: {
  areaId: string;
  equipmentId: string;
  date: string;
  jobs: WorkEntry[];
  onClose: () => void;
}) {
  const addJob = useStore((s) => s.addJob);
  const removeJob = useStore((s) => s.removeJob);

  const [adding, setAdding] = useState(jobs.length === 0);
  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [importance, setImportance] = useState<Importance>("medium");

  function handleAdd() {
    if (!title.trim() || !address.trim()) return;
    addJob(areaId, equipmentId, {
      date,
      startTime,
      endTime,
      title: title.trim(),
      address: address.trim(),
      importance,
    });
    setTitle("");
    setAddress("");
    setAdding(false);
  }

  return (
    <>
      <div className="fixed inset-0 z-20" onClick={onClose} />
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute left-0 top-full z-30 mt-1 w-64 rounded-lg border border-sky-200 bg-white p-3 text-left text-xs normal-case leading-normal text-sky-900 shadow-2xl"
      >
        {jobs.length > 0 && (
          <div className="mb-2 flex flex-col gap-1.5">
            {jobs.map((j) => (
              <div
                key={j.id}
                className="flex items-start justify-between gap-2 rounded-md bg-sky-25 p-1.5"
              >
                <div>
                  <div className="font-medium text-sky-900">{j.title}</div>
                  <div className="text-sky-600">
                    {j.startTime}–{j.endTime} · {j.address}
                  </div>
                  <span
                    className={`mt-0.5 inline-block rounded-full border px-1.5 py-0 text-[10px] ${IMPORTANCE_COLORS[j.importance]}`}
                  >
                    {IMPORTANCE_LABELS[j.importance]}
                  </span>
                </div>
                <button
                  onClick={() => removeJob(areaId, equipmentId, j.id)}
                  className="shrink-0 rounded-full px-1.5 text-sky-400 hover:bg-rose-50 hover:text-rose-500"
                  aria-label="Удалить работу"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {adding ? (
          <div className="flex flex-col gap-1.5">
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Название работы"
              className="rounded border border-sky-200 px-2 py-1 text-xs outline-none focus:border-sky-500"
            />
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Адрес"
              className="rounded border border-sky-200 px-2 py-1 text-xs outline-none focus:border-sky-500"
            />
            <div className="flex gap-1">
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded border border-sky-200 px-1 py-1 text-xs outline-none focus:border-sky-500"
              />
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded border border-sky-200 px-1 py-1 text-xs outline-none focus:border-sky-500"
              />
            </div>
            <div className="flex gap-1">
              {(["low", "medium", "high"] as Importance[]).map((imp) => (
                <button
                  key={imp}
                  onClick={() => setImportance(imp)}
                  className={`flex-1 rounded border px-1 py-1 text-[10px] ${
                    importance === imp ? IMPORTANCE_COLORS[imp] : "border-sky-100 text-sky-400"
                  }`}
                >
                  {IMPORTANCE_LABELS[imp]}
                </button>
              ))}
            </div>
            <button
              onClick={handleAdd}
              disabled={!title.trim() || !address.trim()}
              className="rounded bg-sky-600 px-2 py-1.5 text-xs font-medium text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-200"
            >
              Добавить
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="w-full rounded border border-dashed border-sky-300 px-2 py-1.5 text-xs text-sky-600 hover:bg-sky-50"
          >
            + Добавить работу
          </button>
        )}
      </div>
    </>
  );
}
