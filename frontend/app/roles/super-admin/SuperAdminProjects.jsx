"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, CircleDashed, Construction, FolderKanban, Search, ShieldAlert, SlidersHorizontal, Sparkles, XCircle } from "lucide-react";
import { Header } from "../../component/layout/index";
import { getSuperAdminState, subscribeToSuperAdminState, updateSuperAdminState } from "./superAdminStore";
import { projectTypeMeta } from "../project-officer/my-project/projects-data";
import styles from "./superAdmin.module.css";
import { api, mergeProjectCollections } from "@/lib/api";
import { getWorkflowState, subscribeToWorkflow } from "@/components/workflowStore";

const PAGE_SIZE = 6;
const CLOSURE_STATUS = "Closure Recommended / Pending Final Verification";
const statusTone = { Ongoing: "border-slate-200 bg-slate-100 text-slate-700", [CLOSURE_STATUS]: "border-indigo-200 bg-indigo-50 text-indigo-700", Verified: "border-emerald-200 bg-emerald-50 text-emerald-700" };
const riskTone = { Critical: "border-red-200 bg-red-50 text-red-700", High: "border-orange-200 bg-orange-50 text-orange-700", Medium: "border-amber-200 bg-amber-50 text-amber-700", Low: "border-emerald-200 bg-emerald-50 text-emerald-700" };
const getStatus = (project) => project.workflowStatus || project.status;
const isClosureReady = (project) => project.nodalReviewCompleted === true && [CLOSURE_STATUS, "Completed"].includes(getStatus(project));

function SummaryCard({ label, value, icon: Icon, accent, onClick }) {
  return <button type="button" onClick={onClick} className="group w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"><div className="flex items-start justify-between gap-3"><div><p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">{label}</p><p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{value}</p></div><span className={`flex h-11 w-11 items-center justify-center rounded-xl border ${accent}`}><Icon className="h-5 w-5" /></span></div></button>;
}

function FilterSelect({ label, value, onChange, options }) {
  return <label className="block text-sm font-medium text-slate-700"><span className="mb-1 block text-[11px] uppercase tracking-[0.12em] text-slate-500">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm text-slate-700 shadow-sm outline-none focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-200">{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
}

function StatusBadge({ status }) {
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide ${statusTone[status] || "border-slate-200 bg-slate-100 text-slate-600"}`}>{status}</span>;
}

function ProjectCard({ project }) {
  const ProjectIcon = projectTypeMeta[project.type]?.icon || Construction;
  const risk = project.aiAssessment?.category || project.riskCategory || "N/A";
  const status = isClosureReady(project) ? CLOSURE_STATUS : getStatus(project);
  const progress = Math.min(100, Math.max(18, project.riskProbability || 0));
  return <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md"><div className="flex items-start justify-between gap-4"><div className="flex min-w-0 items-start gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700"><ProjectIcon className="h-5 w-5" /></div><div className="min-w-0"><h2 className="truncate text-lg font-semibold text-slate-900">{project.name}</h2><p className="mt-1 text-sm font-medium text-slate-500">{project.projectId}</p></div></div><span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${riskTone[risk] || "border-slate-200 bg-slate-100 text-slate-600"}`}>{project.riskProbability}% {risk}</span></div><div className="mt-4 grid gap-2.5 sm:grid-cols-2"><div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Project type</p><p className="mt-2 text-sm font-semibold text-slate-800">{project.type}</p></div><div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Land area</p><p className="mt-2 text-sm font-semibold text-slate-800">{project.requiredLandArea} {project.landUnit}</p></div></div><div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">{project.district}, {project.state} · {project.village}</div><div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Acquisition progress</p><div className="mt-2 flex items-center justify-between text-xs"><span>Review progress</span><span className="font-semibold">{progress}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200"><div className={`h-full rounded-full ${risk === "Critical" ? "bg-red-500" : risk === "High" ? "bg-orange-500" : risk === "Medium" ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${progress}%` }} /></div></div><div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Process status</p><div className="mt-2"><StatusBadge status={status} /></div></div></div><div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600"><div className="flex justify-between gap-3"><span>Administrative review</span><span className="font-semibold text-slate-800">{isClosureReady(project) ? "Ready for final verification" : "Monitoring"}</span></div><div className="mt-2">Last updated <span className="font-semibold text-slate-800">{project.updatedAt || "Not recorded"}</span></div></div><div className="mt-5 flex items-center justify-between gap-3 pt-2"><span className="text-xs text-slate-500">AI score is read-only</span><Link href={`/roles/super-admin/projects/${project.id}`} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-slate-800">View Details <ArrowRight className="h-4 w-4" /></Link></div></article>;
}

export default function SuperAdminProjects() {
  const [state, setState] = useState(() => getSuperAdminState());
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [type, setType] = useState("All types");
  const [risk, setRisk] = useState("All risks");
  const [page, setPage] = useState(1);
  useEffect(() => {
    const unsubscribe = subscribeToSuperAdminState(setState);
    const syncNewWorkflowProjects = ({ projects = [] }) => {
      updateSuperAdminState((current) => {
        const workflowProjects = new Map(projects.map((project) => [String(project.projectId || project.id), project]));
        const syncedProjects = current.projects.map((project) => {
          const workflowProject = workflowProjects.get(String(project.projectId || project.id));
          if (!workflowProject) return project;
          workflowProjects.delete(String(project.projectId || project.id));
          return { ...project, ...workflowProject };
        });
        return workflowProjects.size
          ? { ...current, projects: [...workflowProjects.values(), ...syncedProjects] }
          : { ...current, projects: syncedProjects };
      });
    };
    const unsubscribeWorkflow = subscribeToWorkflow(syncNewWorkflowProjects);
    syncNewWorkflowProjects(getWorkflowState());
    api.listProjects().then((projects) => setState((current) => ({ ...current, projects: mergeProjectCollections(current.projects, projects) }))).catch(() => {});
    return () => {
      unsubscribe();
      unsubscribeWorkflow();
    };
  }, []);
  const projects = state.projects;
  const types = ["All types", ...new Set(projects.map((project) => project.type))];
  const statuses = ["All statuses", "Ongoing", CLOSURE_STATUS, "Verified"];
  const risks = ["All risks", "Critical", "High", "Medium", "Low"];
  const filtered = useMemo(() => projects.filter((project) => { const currentStatus = getStatus(project); const category = project.aiAssessment?.category || project.riskCategory; const matchesQuery = `${project.name} ${project.projectId} ${project.district} ${project.village} ${project.type}`.toLowerCase().includes(query.toLowerCase()); const matchesStatus = status === "All statuses" || (status === "Ongoing" ? !isClosureReady(project) && currentStatus !== "Verified" : status === CLOSURE_STATUS ? isClosureReady(project) : currentStatus === "Verified"); return matchesQuery && matchesStatus && (type === "All types" || project.type === type) && (risk === "All risks" || category === risk); }), [projects, query, risk, status, type]);
  const counts = { total: projects.length, pending: projects.filter(isClosureReady).length, verified: projects.filter((project) => getStatus(project) === "Verified").length, high: projects.filter((project) => ["High", "Critical"].includes(project.aiAssessment?.category || project.riskCategory)).length };
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const clear = () => { setQuery(""); setStatus("All statuses"); setType("All types"); setRisk("All risks"); setPage(1); };
  return <div className={`${styles.shell} min-h-screen bg-slate-50 text-slate-800`}><Header title="Super Admin · Projects" /><main className="mx-auto max-w-8xl px-4 pb-12 pt-4 sm:px-6 lg:px-8"><div className="flex flex-col gap-3 border-b border-slate-200 pb-6 md:flex-row md:items-end md:justify-between"><div><p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">Final administrative review</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Super Admin Projects</h1><p className="mt-2 text-sm text-slate-600">Review Nodal closure recommendations and approve completed projects without changing operational data.</p></div></div><section className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-4"><SummaryCard label="Total Projects" value={counts.total} icon={FolderKanban} accent="border-slate-200 bg-slate-100 text-slate-700" onClick={clear} /><SummaryCard label="Closure Recommended" value={counts.pending} icon={ShieldAlert} accent="border-indigo-200 bg-indigo-50 text-indigo-700" onClick={() => { setStatus(CLOSURE_STATUS); setPage(1); }} /><SummaryCard label="Verified / Closed" value={counts.verified} icon={CircleDashed} accent="border-emerald-200 bg-emerald-50 text-emerald-700" onClick={() => { setStatus("Verified"); setPage(1); }} /><SummaryCard label="High / Critical Risk" value={counts.high} icon={AlertTriangle} accent="border-red-200 bg-red-50 text-red-700" onClick={() => { setRisk("High"); setPage(1); }} /></section><section className="mt-6 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4"><div className="flex flex-col gap-2 xl:flex-row xl:items-end"><div className="flex-1"><label className="block text-sm font-medium text-slate-700">Search projects</label><div className="relative mt-2"><Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search by name, ID, district, village..." className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-200" /></div></div><div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm text-slate-700"><SlidersHorizontal className="h-4 w-4 text-slate-500" />{filtered.length} matching</div></div><div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4"><FilterSelect label="Status" value={status} onChange={(value) => { setStatus(value); setPage(1); }} options={statuses} /><FilterSelect label="Project type" value={type} onChange={(value) => { setType(value); setPage(1); }} options={types} /><FilterSelect label="Risk" value={risk} onChange={(value) => { setRisk(value); setPage(1); }} options={risks} /><button type="button" onClick={clear} className="self-end inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-100"><XCircle className="h-4 w-4" />Clear Filters</button></div></section><section className="mt-6">{visible.length ? <><div className="grid gap-4 xl:grid-cols-2">{visible.map((project) => <ProjectCard key={project.projectId || `project-${project.id}`} project={project} />)}</div>{filtered.length > PAGE_SIZE ? <div className="mt-8 flex items-center justify-center gap-3"><button type="button" disabled={currentPage === 1} onClick={() => setPage((value) => value - 1)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm disabled:opacity-40">Previous</button><span className="text-sm text-slate-500">Page {currentPage} of {totalPages}</span><button type="button" disabled={currentPage === totalPages} onClick={() => setPage((value) => value + 1)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm disabled:opacity-40">Next</button></div> : null}</> : <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center"><Sparkles className="mx-auto h-8 w-8 text-slate-400" /><p className="mt-3 text-sm text-slate-600">No projects match the current filters.</p></div>}</section></main></div>;
}
