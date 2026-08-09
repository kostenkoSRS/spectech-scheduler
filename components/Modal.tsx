"use client";

import { ReactNode, useEffect } from "react";

export default function Modal({
  title,
  onClose,
  children,
  width = "max-w-lg",
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  width?: string;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-sky-950/40 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`w-full ${width} max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl ring-1 ring-sky-100`}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-sky-100 bg-white/95 px-5 py-4 backdrop-blur">
          <h2 className="text-lg font-semibold text-sky-900">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-sky-500 hover:bg-sky-50 hover:text-sky-700"
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
