"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, MapPinned, ShieldAlert, TrendingUp } from "lucide-react";

import { Header } from "@/app/component/layout/index";
import { PROJECTS } from "@/app/roles/project-officer/my-project/projects-data";

const riskColor = (risk) => {
  switch (risk) {
    case "Critical":
      return "#dc2626";
    case "High":
      return "#ef4444";
    case "Medium":
      return "#f59e0b";
    case "Low":
      return "#10b981";
    default:
      return "#64748b";
  }
};

export default function ProjectDetailsPage() {
  const params = useParams();
  const project = PROJECTS.find((item) => item.id === Number(params.id));

  if (!project) {
    return (
      <>
        <Header title="Project Details" />
        <div className="page-shell">
          <div className="page-container py-10">
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
              Project not found.
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Project Details" />

      <div className="page-shell">
        <div className="page-container py-6">
          <div className="mb-6 flex items-center justify-between gap-3">
            <Link
              href="/roles/project-officer/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-sky-300 hover:text-sky-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to dashboard
            </Link>

            <span
              className="rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em]"
              style={{
                color: riskColor(project.riskCategory),
                borderColor: `${riskColor(project.riskCategory)}30`,
                backgroundColor: `${riskColor(project.riskCategory)}10`,
              }}
            >
              {project.riskCategory} risk
            </span>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {project.projectId}
                </p>
                <h1 className="mt-2 text-2xl font-bold text-slate-900">{project.name}</h1>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                {project.status}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">Project type</p>
                <p className="mt-2 text-lg font-semibold text-slate-800">{project.type}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">Location</p>
                <p className="mt-2 text-lg font-semibold text-slate-800">{project.village}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">District</p>
                <p className="mt-2 text-lg font-semibold text-slate-800">{project.district}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">AI risk</p>
                <p className="mt-2 text-lg font-semibold text-slate-800">{project.riskProbability}%</p>
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="mb-4 flex items-center gap-2 text-slate-800">
                  <MapPinned className="h-4 w-4 text-sky-600" />
                  <h2 className="text-base font-semibold">Project summary</h2>
                </div>
                <p className="text-sm leading-6 text-slate-600">{project.description}</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-white p-3">
                    <div className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Land required</div>
                    <div className="mt-1 font-semibold text-slate-800">{project.requiredLandArea} {project.landUnit}</div>
                  </div>
                  <div className="rounded-xl bg-white p-3">
                    <div className="text-[10px] uppercase tracking-[0.12em] text-slate-500">State</div>
                    <div className="mt-1 font-semibold text-slate-800">{project.state}</div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="mb-4 flex items-center gap-2 text-slate-800">
                  <ShieldAlert className="h-4 w-4 text-amber-600" />
                  <h2 className="text-base font-semibold">Risk rationale</h2>
                </div>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>• Land ownership clarity is still partially pending.</li>
                  <li>• Acquisition timeline is sensitive to local objections and verification.</li>
                  <li>• The project remains within an active monitoring window for nodal review.</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-sky-50 p-5">
              <div className="mb-3 flex items-center gap-2 text-slate-800">
                <TrendingUp className="h-4 w-4 text-sky-600" />
                <h2 className="text-base font-semibold">Monitoring recommendation</h2>
              </div>
              <p className="text-sm leading-6 text-slate-600">
                Continue focused monitoring for this project and escalate to the district nodal officer if the acquisition timeline slips beyond the current approval window.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
