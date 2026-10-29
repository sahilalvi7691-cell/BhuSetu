"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Download,
  FileBarChart,
  MapPin,
  Printer,
} from "lucide-react";

import { Header } from "@/app/component/layout/index";
import { PROJECTS } from "../assigned-projects/projects-data";

const statusTone = {
  Draft: "border-slate-200 bg-slate-100 text-slate-700",
  "Pending LAO Verification": "border-amber-200 bg-amber-50 text-amber-700",
  "Under Acquisition": "border-sky-200 bg-sky-50 text-sky-700",
  "On Hold": "border-stone-200 bg-stone-100 text-stone-700",
  Completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

const getProjectId = (project) =>
  project.projectId || `BH-2026-${String(project.id).padStart(3, "0")}`;

const getParcelCount = (project) =>
  project.parcelCount || Math.max(12, Math.round(project.requiredLandArea / 4));

function SummaryCard({ label, value, detail, icon: Icon, accent }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
            {value}
          </p>
          <p className="mt-1 text-xs text-slate-500">{detail}</p>
        </div>

        <span
          className={`flex h-11 w-11 items-center justify-center rounded-xl border ${accent}`}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const [notice, setNotice] = useState("");

  const totalLand = useMemo(
    () =>
      PROJECTS.reduce(
        (sum, project) => sum + Number(project.requiredLandArea || 0),
        0
      ),
    []
  );

  const exportReport = () => {
    const headings = [
      "Project ID",
      "Project Name",
      "Type",
      "State",
      "District",
      "Village",
      "Land Area",
      "Status",
      "Parcels",
      "Updated",
    ];

    const rows = PROJECTS.map((project) => [
      getProjectId(project),
      project.name,
      project.type,
      project.state,
      project.district,
      project.village,
      `${project.requiredLandArea} ${project.landUnit}`,
      project.status,
      getParcelCount(project),
      project.updatedAt,
    ]);

    const csv = [headings, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
          .join(",")
      )
      .join("\n");

    const link = document.createElement("a");
    link.href = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" })
    );
    link.download = "bhusetu-lao-report.csv";
    link.click();
    URL.revokeObjectURL(link.href);

    setNotice("Report exported as CSV.");
    window.setTimeout(() => setNotice(""), 3500);
  };

  return (
    <>
      <Header title="LAO Reports" />

      <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-375">
          <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Land acquisition officer
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                Acquisition reports
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Open a project to review all collected acquisition data and submit
                its report to the Nodal Officer.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={exportReport}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                <Download className="h-4 w-4" />
                Export register
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                <Printer className="h-4 w-4" />
                Print register
              </button>
            </div>
          </div>

          {notice && (
            <div
              role="status"
              className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
            >
              {notice}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <SummaryCard
              label="Projects covered"
              value={PROJECTS.length}
              detail="All assigned LAO projects"
              icon={FileBarChart}
              accent="border-sky-200 bg-sky-50 text-sky-700"
            />
            <SummaryCard
              label="Land reported"
              value={`${totalLand} ha`}
              detail="Combined requirement"
              icon={MapPin}
              accent="border-emerald-200 bg-emerald-50 text-emerald-700"
            />
          </div>

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h2 className="text-lg font-semibold text-slate-900">
                Project register
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Select a project to view its full LAO report.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-212.5 text-left text-sm">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-[0.12em] text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Project</th>
                    <th className="px-3 py-3 font-semibold">Location</th>
                    <th className="px-3 py-3 font-semibold">Land area</th>
                    <th className="px-3 py-3 font-semibold">Parcels</th>
                    <th className="px-5 py-3 font-semibold">Report</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {PROJECTS.map((project) => (
                    <tr
                      key={project.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">
                          {project.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {getProjectId(project)} · {project.type}
                        </p>
                      </td>

                      <td className="px-3 py-4 text-slate-600">
                        {project.district}
                        <span className="block text-xs text-slate-400">
                          {project.village}
                        </span>
                      </td>

                      <td className="px-3 py-4 font-semibold text-slate-700">
                        {project.requiredLandArea} {project.landUnit}
                      </td>

                      <td className="px-3 py-4 text-slate-700">
                        {getParcelCount(project)}
                      </td>

                      <td className="px-5 py-4">
                        <Link
                          href={`/roles/LandAcqOfficer/reports/${project.id}`}
                          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                        >
                          Open report
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                        <span
                          className={`mt-2 block w-fit rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusTone[project.status] || statusTone.Draft}`}
                        >
                          {project.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
