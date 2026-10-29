"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, FolderKanban, MapPin, Search, ShieldAlert, X } from "lucide-react";
import { Header } from "../frontend/app/component/layout";
import { PROJECTS } from "../frontend/app/roles/LandAcqOfficer/assigned-projects/projects-data";
import { getWorkflowState, subscribeToWorkflow } from "../frontend/components/workflowStore";

const statusStyles = {
  "Under Acquisition": "bg-sky-50 text-sky-700",
  "Pending LAO Verification": "bg-amber-50 text-amber-700",
  "On Hold": "bg-rose-50 text-rose-700",
  Completed: "bg-emerald-50 text-emerald-700",
  Draft: "bg-slate-100 text-slate-700",
};

const riskStyles = {
  Critical: "text-rose-700",
  High: "text-orange-600",
  Medium: "text-amber-600",
  Low: "text-emerald-600",
  "N/A": "text-slate-500",
};

export default function ProjectsPage() {
  const [projectList, setProjectList] = useState(() => getWorkflowState().projects);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [type, setType] = useState("All types");
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => subscribeToWorkflow((state) => setProjectList(state.projects)), []);

  const filteredProjects = useMemo(() => projectList.filter((project) => {
    const matchesQuery = `${project.name} ${project.projectId} ${project.district} ${project.village}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (status === "All statuses" || project.status === status) && (type === "All types" || project.type === type);
  }), [projectList, query, status, type]);

  const totalLand = projectList.reduce((sum, project) => sum + project.requiredLandArea, 0);

  return (
    <>
      <Header title="Project Oversight" />
      <main className="page-shell">
        <div className="page-container">
          <div className="mb-6"><p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Portfolio control</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Project oversight</h1><p className="mt-2 text-sm text-slate-500">Monitor land acquisition progress and risk across every district.</p></div>

          <section className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[{ label: "Total projects", value: projectList.length, icon: FolderKanban, tone: "text-sky-600" }, { label: "Active acquisition", value: projectList.filter((project) => project.status === "Under Acquisition").length, icon: MapPin, tone: "text-emerald-600" }, { label: "High or critical risk", value: projectList.filter((project) => ["High", "Critical"].includes(project.aiAssessment?.category || project.riskCategory)).length, icon: ShieldAlert, tone: "text-rose-600" }, { label: "Land in portfolio", value: `${totalLand} ha`, icon: FolderKanban, tone: "text-amber-600" }].map(({ label, value, icon: Icon, tone }) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><Icon className={`h-5 w-5 ${tone}`} /><p className="mt-3 text-sm text-slate-500">{label}</p><p className="mt-1 text-2xl font-bold text-slate-900">{value}</p></div>)}
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row"><label className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search project, ID, district, or village" className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100" /></label><select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none"><option>All statuses</option>{[...new Set(PROJECTS.map((project) => project.status))].map((value) => <option key={value}>{value}</option>)}</select><select value={type} onChange={(event) => setType(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none"><option>All types</option>{[...new Set(PROJECTS.map((project) => project.type))].map((value) => <option key={value}>{value}</option>)}</select></div>
            <div className="overflow-x-auto"><table className="w-full min-w-212.5 text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3 font-semibold">Project</th><th className="px-5 py-3 font-semibold">Location</th><th className="px-5 py-3 font-semibold">Land requirement</th><th className="px-5 py-3 font-semibold">Status</th><th className="px-5 py-3 font-semibold">Risk</th><th className="px-5 py-3" /></tr></thead><tbody className="divide-y divide-slate-100">{filteredProjects.map((project) => <tr key={project.id} className="hover:bg-slate-50"><td className="px-5 py-4"><p className="font-semibold text-slate-800">{project.name}</p><p className="mt-1 text-xs text-slate-500">{project.projectId} · {project.type}</p></td><td className="px-5 py-4"><p className="text-slate-700">{project.district}</p><p className="mt-1 text-xs text-slate-500">{project.village}, {project.state}</p></td><td className="px-5 py-4 font-semibold text-slate-700">{project.requiredLandArea} {project.landUnit}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[project.status] || "bg-slate-100 text-slate-700"}`}>{project.status}</span></td><td className={`px-5 py-4 font-semibold ${riskStyles[project.riskCategory] || "text-slate-500"}`}>{project.riskCategory}<span className="ml-1 text-xs font-normal">({project.riskProbability}%)</span></td><td className="px-5 py-4 text-right"><button onClick={() => setSelectedProject(project)} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"><Eye className="h-4 w-4" /> View</button></td></tr>)}</tbody></table></div>
            {!filteredProjects.length && <div className="p-10 text-center text-sm text-slate-500">No projects match the selected filters.</div>}
          </section>

          {selectedProject && <div className="fixed inset-0 z-1100 flex justify-end bg-slate-950/40"><aside className="h-full w-full max-w-lg overflow-y-auto bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Project profile</p><h2 className="mt-1 text-xl font-bold text-slate-900">{selectedProject.name}</h2><p className="mt-1 text-sm text-slate-500">{selectedProject.projectId}</p></div><button aria-label="Close project details" onClick={() => setSelectedProject(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button></div><div className="mt-6 grid grid-cols-2 gap-3"><div className="rounded-xl bg-sky-50 p-3"><p className="text-xs text-sky-700">Status</p><p className="mt-1 text-sm font-bold text-sky-950">{selectedProject.status}</p></div><div className="rounded-xl bg-amber-50 p-3"><p className="text-xs text-amber-700">Risk</p><p className="mt-1 text-sm font-bold text-amber-950">{selectedProject.riskCategory} · {selectedProject.riskProbability}%</p></div></div><dl className="mt-6 divide-y divide-slate-100">{[["Project type", selectedProject.type], ["Location", `${selectedProject.village}, ${selectedProject.district}, ${selectedProject.state}`], ["Land requirement", `${selectedProject.requiredLandArea} ${selectedProject.landUnit}`], ["Created", selectedProject.createdAt], ["Last updated", selectedProject.updatedAt]].map(([label, value]) => <div key={label} className="flex justify-between gap-4 py-3 text-sm"><dt className="text-slate-500">{label}</dt><dd className="text-right font-semibold text-slate-800">{value}</dd></div>)}</dl><p className="mt-6 text-sm leading-6 text-slate-600">{selectedProject.description}</p><button onClick={() => setSelectedProject(null)} className="mt-6 w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800">Close details</button></aside></div>}
        </div>
      </main>
    </>
  );
}