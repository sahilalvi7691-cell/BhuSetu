"use client";

import React from "react";
import "./page.css"
import {
  ArrowDownRight,
  ArrowUpRight,
} from "lucide-react";

const Kpi = ({
  title,
  value,
  delta,
  loading = false,
  icon: Icon,
}) => {
  if (loading) {
    return (
      <div className="card h-40 animate-pulse" />
    );
  }

  const isPositive = delta == null ? true : delta >= 0;

  const trendText =
    delta == null
      ? "—"
      : `${isPositive ? "+" : ""}${delta}%`;

  return (
    <div className="card flex min-h-40 flex-col justify-between gap-4 p-5">

      {/* TOP SECTION */}
      <div className="flex items-start justify-between gap-3">

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            {title}
          </p>

          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>

        {/* ICON */}
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700">
          {Icon && (
            <Icon className="h-5 w-5" />
          )}
        </div>

      </div>

      {/* BOTTOM SECTION */}
      <div className="flex items-center justify-between gap-2">

        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
            isPositive
              ? "bg-emerald-50 text-emerald-700"
              : "bg-rose-50 text-rose-700"
          }`}
        >
          {isPositive ? (
            <ArrowUpRight className="h-3.5 w-3.5" />
          ) : (
            <ArrowDownRight className="h-3.5 w-3.5" />
          )}

          {trendText}
        </span>

        <span className="text-xs text-slate-500">
          vs last month
        </span>

      </div>

    </div>
  );
};

export default Kpi;