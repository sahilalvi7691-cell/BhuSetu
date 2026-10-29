"use client";

import { useEffect, useRef } from "react";
import SettingsPanel from "@/components/SettingsPanel";

export default function SettingsPopup({ role = "project-officer", isOpen = false, onClose }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    const handleClickOutside = (event) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target)) {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-2000 flex items-start justify-center overflow-y-auto bg-slate-900/35 px-3 py-6 backdrop-blur-[2px]">
      <div ref={dialogRef} className="relative w-full max-w-6xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Quick access</p>
            <h3 className="text-lg font-semibold text-slate-900">Settings</h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            Close
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto">
          <SettingsPanel role={role} title="Settings" />
        </div>
      </div>
    </div>
  );
}
