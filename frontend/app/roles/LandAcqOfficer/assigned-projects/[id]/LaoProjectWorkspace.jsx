"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Header } from "../../../../component/layout/index";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  FileText,
  LandPlot,
  Landmark,
  MapPin,
  Plus,
  Save,
  ShieldAlert,
  UserCheck,
  X,
} from "lucide-react";
import { PROJECTS, projectTypeMeta } from "../projects-data";
import { api, normalizeProject } from "@/lib/api";
import { getLaoWorkspaces, subscribeToLaoWorkspaces, updateLaoWorkspace } from "../laoWorkspaceStore";
import { getWorkflowState, subscribeToWorkflow, updateWorkflowProject } from "../../../../../components/workflowStore";
import LaoGISPanel from "./LaoGISPanel";

const tabs = ["Overview", "Parcels", "Acquisition", "Final Overview"];
const statusTone = {
  Pending: "border-amber-200 bg-amber-50 text-amber-700",
  Verified: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Active: "border-sky-200 bg-sky-50 text-sky-700",
  Completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

function Badge({ children }) {
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusTone[children] || "border-slate-200 bg-slate-100 text-slate-600"}`}>{children}</span>;
}

function Panel({ title, icon: Icon, children, action }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:border-slate-300"><div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3"><h2 className="flex items-center gap-2 text-sm font-semibold text-slate-800"><Icon className="h-4 w-4 text-slate-500" />{title}</h2>{action}</div><div className="pt-4">{children}</div></section>;
}

function InfoList({ items }) {
  return <dl className="grid gap-3 text-sm sm:grid-cols-2">{items.map(([label, value]) => <div key={label}><dt className="text-xs uppercase tracking-[0.12em] text-slate-500">{label}</dt><dd className="mt-1 font-medium text-slate-800">{value || "Not available"}</dd></div>)}</dl>;
}

function Field({ label, value, onChange, type = "text", placeholder }) {
  return <label className="block text-sm font-medium text-slate-700"><span className="mb-1 block text-xs">{label}</span><input type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200" /></label>;
}

function Timeline({ activity }) {
  return <div className="space-y-3">{activity.map((item) => <div key={item.id} className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3"><span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${item.status === "Completed" ? "bg-emerald-500" : "bg-sky-500"}`} /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-semibold text-slate-800">{item.action}</p><span className="text-xs text-slate-500">{new Date(item.timestamp).toLocaleString("en-IN")}</span></div><p className="mt-1 text-xs text-slate-500">{item.actor} · <Badge>{item.status}</Badge></p></div></div>)}</div>;
}

export default function LaoProjectWorkspace() {
  const params = useParams();
  const projectId = params?.id ?? "";
  const [workflow, setWorkflow] = useState(() => getWorkflowState());
  const [apiProject, setApiProject] = useState(null);
  const [apiAssessment, setApiAssessment] = useState(null);
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitNotice, setSubmitNotice] = useState("");
  const localProject = workflow.projects.find((item) => String(item.id) === String(projectId) || String(item.projectId) === String(projectId)) || PROJECTS.find((item) => String(item.id) === String(projectId) || String(item.projectId) === String(projectId));
  const project = apiProject ? { ...localProject, ...apiProject } : localProject;
  const [activeTab, setActiveTab] = useState("Overview");
  const [workspaces, setWorkspaces] = useState(() => getLaoWorkspaces());
  const [showParcelForm, setShowParcelForm] = useState(false);
  const [parcelForm, setParcelForm] = useState({ khasra: "", area: "", location: project?.village || "", landUse: "Agricultural", owner: "" });

  useEffect(() => subscribeToLaoWorkspaces(setWorkspaces), []);
  useEffect(() => subscribeToWorkflow(setWorkflow), []);
  useEffect(() => {
    let active = true;
    setIsLoading(true);
    const loadProject = /^\d+$/.test(String(projectId)) ? api.getProject(projectId) : api.getProjectByCode(localProject?.projectId || projectId);
    loadProject.then((nextProject) => Promise.all([Promise.resolve(nextProject), api.getAssessment(nextProject.id).catch(() => api.predict(nextProject.id))]))
      .then(([nextProject, nextAssessment]) => {
        if (!active) return;
        setApiProject(normalizeProject({ ...nextProject, riskProbability: nextProject.riskProbability ?? nextAssessment?.delay_probability, riskCategory: nextProject.riskCategory ?? nextAssessment?.risk_category }));
        setApiAssessment(nextAssessment);
        setApiError("");
        setIsLoading(false);
      })
      .catch((error) => { if (active) { setApiError(error.message || "Project API unavailable"); setIsLoading(false); } });
    return () => { active = false; };
  }, [localProject?.projectId, projectId]);

  if (isLoading && !project) {
    return <div className="min-h-screen bg-slate-50 p-6"><div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm"><p className="text-sm text-slate-500">Loading project and ML assessment...</p></div></div>;
  }

  if (!project) {
    return <div className="min-h-screen bg-slate-50 p-6"><div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm"><h1 className="text-2xl font-semibold text-slate-900">Project not found</h1><Link href="/roles/LandAcqOfficer/assigned-projects" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white"><ArrowLeft className="h-4 w-4" />Back to assigned projects</Link></div></div>;
  }

  const workspaceProjectId = localProject?.id || project.id;
  const backendWorkspace = apiProject?.analysisInputs || {};
  const workspace = workspaces[workspaceProjectId] || {
    projectId: workspaceProjectId,
    parcels: backendWorkspace.parcels || [],
    acquisition: backendWorkspace.acquisition || { ownership: "Pending verification", compensation: "Not started", legal: "No dispute recorded", rr: "Not started", approvals: "In review", documents: "Available", possession: "Not started" },
    activity: [],
    submittedAt: null,
  };
  const ProjectIcon = projectTypeMeta[project.type]?.icon || LandPlot;
  const verifiedParcels = workspace.parcels.filter((parcel) => parcel.status === "Verified").length;
  const acquisitionProgress = Math.min(100, Math.round((verifiedParcels / Math.max(workspace.parcels.length, 1)) * 60 + (workspace.submittedAt ? 40 : 0)));
  const aiAssessment = apiAssessment ? { probability: apiAssessment.delay_probability, category: apiAssessment.risk_category, factors: apiAssessment.top_risk_factors || [], recommendations: apiAssessment.recommendations || [] } : project.aiAssessment || { probability: project.riskProbability, category: project.riskCategory, factors: [], recommendations: [] };

  const updateWorkspace = (updater) => updateLaoWorkspace(workspaceProjectId, updater);
  const verifyParcel = (parcelId) => updateWorkspace((current) => ({ ...current, parcels: current.parcels.map((parcel) => parcel.id === parcelId ? { ...parcel, status: "Verified" } : parcel), activity: [{ id: `activity-${Date.now()}`, action: "Parcels Verified", actor: "Ali Arzan Zaidi", timestamp: new Date().toISOString(), status: "Completed" }, ...current.activity] }));
  const addParcel = () => { if (!parcelForm.khasra || !parcelForm.area) return; updateWorkspace((current) => ({ ...current, parcels: [...current.parcels, { ...parcelForm, id: `parcel-${Date.now()}`, area: Number(parcelForm.area), status: "Pending" }], activity: [{ id: `activity-${Date.now()}`, action: "Parcel Added", actor: "Ali Arzan Zaidi", timestamp: new Date().toISOString(), status: "Active" }, ...current.activity] })); setParcelForm({ khasra: "", area: "", location: project.village, landUse: "Agricultural", owner: "" }); setShowParcelForm(false); };
  const updateAcquisition = async (key, value) => {
    let nextWorkspace;
    updateWorkspace((current) => {
      nextWorkspace = { ...current, acquisition: { ...current.acquisition, [key]: value }, activity: [{ id: `activity-${Date.now()}`, action: "Acquisition Data Updated", actor: "Ali Arzan Zaidi", timestamp: new Date().toISOString(), status: "Active" }, ...current.activity] };
      return nextWorkspace;
    });
    if (/^\d+$/.test(String(project.id))) {
      try {
        await api.updateAcquisition(project.id, { acquisition: nextWorkspace.acquisition, parcels: nextWorkspace.parcels });
      } catch {
        // Local workspace remains available when the backend is offline.
      }
    }
  };
  const submitData = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitNotice("");
    const submittedAt = new Date().toISOString();
    let syncError = "";

    if (/^\d+$/.test(String(project.id))) {
      try {
        await api.updateAcquisition(project.id, {
          acquisition: workspace.acquisition,
          parcels: workspace.parcels,
          submittedAt,
          submittedBy: "Ali Arzan Zaidi",
        });
      } catch (error) {
        syncError = error.message || "Backend sync failed";
      }
    }

    const activity = { id: `activity-${Date.now()}`, action: "Data Submitted to Nodal Officer", actor: "Ali Arzan Zaidi", timestamp: submittedAt, status: "Completed" };
    updateWorkspace((current) => ({ ...current, submittedAt, submittedBy: "Ali Arzan Zaidi", activity: [activity, ...current.activity] }));
    updateWorkflowProject(workspaceProjectId, (current) => ({
      ...current,
      status: "Pending Nodal Review",
      workflowStatus: "Pending Nodal Review",
      submittedAt,
      submittedBy: "Ali Arzan Zaidi",
      notifications: [{ id: `notification-${Date.now()}`, title: "LAO acquisition data submitted", detail: `${project.name} is ready for Nodal Officer review.`, targetRole: "Nodal Officer", timestamp: submittedAt, read: false }, ...(current.notifications || [])],
    }), "LAO data submitted to Nodal Officer");
    setSubmitNotice(syncError
      ? `Submitted in this browser, but backend sync failed: ${syncError}`
      : `Submitted to the Nodal Officer on ${new Date(submittedAt).toLocaleString("en-IN")}.`);
    setIsSubmitting(false);
  };

  return <><Header title="Assigned Pojects"/><div className="min-h-screen bg-slate-50 text-slate-800"><main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8"><div className="mb-5 flex flex-wrap items-center gap-2 text-sm text-slate-500"><Link href="/roles/LandAcqOfficer/assigned-projects" className="inline-flex items-center gap-2 hover:text-slate-900"><ArrowLeft className="h-4 w-4" />My Assigned Projects</Link><span>/</span><span className="font-medium text-slate-700">{project.name}</span><span>/</span><span>{activeTab}</span></div><header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div className="flex items-start gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><ProjectIcon className="h-6 w-6" /></div><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{project.projectId} · {project.type}</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{project.name}</h1><p className="mt-1 text-sm text-slate-600">{project.district}, {project.state} · Assigned to Ali Arzan Zaidi</p></div></div><div className="flex flex-wrap items-center gap-2"><Badge>{project.status}</Badge><span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">{acquisitionProgress}% acquisition progress</span></div></div><nav className="mt-5 flex gap-2 overflow-x-auto border-t border-slate-200 pt-4">{tabs.map((tab) => <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${activeTab === tab ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>{tab}</button>)}</nav></header>

{activeTab === "Overview" && <div className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]"><div className="space-y-5"><Panel title="Project information" icon={FileText}><InfoList items={[["Project ID", project.projectId], ["Project type", project.type], ["Department / Agency", project.department], ["State", project.state], ["District", project.district], ["Tehsil / Taluk", project.tehsil], ["Village(s)", project.villages || project.village], ["Required land", `${project.requiredLandArea} ${project.landUnit}`], ["Acquisition requirement", project.acquisitionRequirement], ["Purpose", project.purpose], ["Planned start", project.plannedStartDate], ["Target completion", project.targetCompletionDate], ["Estimated project cost", project.estimatedProjectCost != null ? `INR ${Number(project.estimatedProjectCost).toLocaleString("en-IN")}` : ""], ["Funding source", project.fundingSource], ["Project status", project.status]]} /><p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-600">{project.description}</p></Panel><Panel title="Project activity timeline" icon={UserCheck}><Timeline activity={workspace.activity} /></Panel></div><div className="space-y-5"><Panel title="GIS availability" icon={MapPin}><LaoGISPanel project={project} parcels={workspace.parcels} /></Panel><Panel title="Acquisition progress" icon={LandPlot}><div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-sky-500 transition-all duration-200" style={{ width: `${acquisitionProgress}%` }} /></div><div className="mt-3 flex justify-between text-xs text-slate-500"><span>{verifiedParcels} of {workspace.parcels.length} parcels verified</span><span>{acquisitionProgress}%</span></div></Panel></div></div>}

{activeTab === "Parcels" && <div className="mt-5 space-y-5"><Panel title="Project parcels" icon={LandPlot} action={<button type="button" onClick={() => setShowParcelForm(true)} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"><Plus className="h-4 w-4" />Add Parcel</button>}><div className="mb-4 rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800">Candidate parcels shown here belong only to <strong>{project.name}</strong>. Verify required parcels without changing official cadastral boundaries.</div><div className="overflow-x-auto"><table className="w-full min-w-190 text-left text-sm"><thead><tr className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500"><th className="px-3 py-3">Khasra / Survey No.</th><th className="px-3 py-3">Area</th><th className="px-3 py-3">Location</th><th className="px-3 py-3">Land use</th><th className="px-3 py-3">Owner reference</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{workspace.parcels.map((parcel) => <tr key={parcel.id} className="transition hover:bg-slate-50"><td className="px-3 py-3 font-medium text-slate-800">{parcel.khasra}</td><td className="px-3 py-3 text-slate-600">{parcel.area} ha</td><td className="px-3 py-3 text-slate-600">{parcel.location}</td><td className="px-3 py-3 text-slate-600">{parcel.landUse}</td><td className="px-3 py-3 text-slate-600">{parcel.owner || "Not provided"}</td><td className="px-3 py-3"><Badge>{parcel.status}</Badge></td><td className="px-3 py-3">{parcel.status !== "Verified" ? <button type="button" onClick={() => verifyParcel(parcel.id)} className="text-xs font-semibold text-emerald-700 hover:text-emerald-900">Verify</button> : <CheckCircle2 className="h-4 w-4 text-emerald-600" />}</td></tr>)}</tbody></table></div></Panel>{showParcelForm && <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><h2 className="font-semibold text-slate-900">Add parcel to this project</h2><button type="button" onClick={() => setShowParcelForm(false)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="h-4 w-4" /></button></div><div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><Field label="Khasra / Survey No." value={parcelForm.khasra} onChange={(value) => setParcelForm((current) => ({ ...current, khasra: value }))} /><Field label="Area (hectares)" type="number" value={parcelForm.area} onChange={(value) => setParcelForm((current) => ({ ...current, area: value }))} /><Field label="Location" value={parcelForm.location} onChange={(value) => setParcelForm((current) => ({ ...current, location: value }))} /><Field label="Land use" value={parcelForm.landUse} onChange={(value) => setParcelForm((current) => ({ ...current, landUse: value }))} /><Field label="Owner reference" value={parcelForm.owner} onChange={(value) => setParcelForm((current) => ({ ...current, owner: value }))} /></div><button type="button" onClick={addParcel} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white"><Save className="h-4 w-4" />Save Parcel</button></div>}</div>}

{activeTab === "Acquisition" && <div className="mt-5 space-y-5"><Panel title="Acquisition data for this project" icon={Landmark}><p className="mb-4 text-sm text-slate-600">Maintain actual acquisition information linked to the verified parcels. Legal disputes are recorded as status information and do not replace competent authorities.</p><div className="grid gap-4 md:grid-cols-2">{[["ownership", "Ownership"], ["compensation", "Compensation"], ["legal", "Legal / Disputes"], ["rr", "R&R"], ["approvals", "Approvals"], ["documents", "Documents"], ["possession", "Possession"]].map(([key, label]) => <label key={key} className="block text-sm font-medium text-slate-700"><span className="mb-1 block text-xs uppercase tracking-[0.12em] text-slate-500">{label}</span><textarea rows={3} value={workspace.acquisition[key]} onChange={(event) => updateAcquisition(key, event.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:bg-white" /></label>)}</div><button type="button" onClick={submitData} disabled={isSubmitting} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60"><Save className="h-4 w-4" />{isSubmitting ? "Submitting..." : workspace.submittedAt ? "Resubmit Data" : "Submit to Nodal Officer"}</button>{submitNotice ? <p role="status" className={`mt-3 text-sm ${submitNotice.startsWith("Submitted in this browser") ? "text-amber-700" : "text-emerald-700"}`}>{submitNotice}</p> : workspace.submittedAt ? <p className="mt-3 text-xs text-emerald-700">Submitted on {new Date(workspace.submittedAt).toLocaleString("en-IN")}. You can continue updating acquisition data later.</p> : null}</Panel></div>}

{activeTab === "Final Overview" && <div className="mt-5 grid gap-5 xl:grid-cols-2"><Panel title="Acquisition completion" icon={CheckCircle2}><InfoList items={[["Verified parcels", `${verifiedParcels} / ${workspace.parcels.length}`], ["Acquisition cases", `${verifiedParcels} linked cases`], ["Ownership", workspace.acquisition.ownership], ["Compensation", workspace.acquisition.compensation], ["Legal / Disputes", workspace.acquisition.legal], ["R&R", workspace.acquisition.rr], ["Approvals", workspace.acquisition.approvals], ["Possession", workspace.acquisition.possession], ["Documents", workspace.acquisition.documents]]} /><div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500 transition-all duration-200" style={{ width: `${acquisitionProgress}%` }} /></div><p className="mt-2 text-xs text-slate-500">{acquisitionProgress}% acquisition progress</p></Panel><Panel title="AI delay-risk assessment" icon={ShieldAlert}><div className="flex items-start justify-between"><div><p className="text-4xl font-semibold text-slate-900">{aiAssessment.probability}%</p><p className="mt-1 text-sm font-semibold uppercase tracking-[0.12em] text-red-700">{aiAssessment.category} risk</p></div><Badge>Read-only AI</Badge></div><p className="mt-3 text-sm text-slate-600">The AI risk score is generated from acquisition data and cannot be manually edited by the LAO.</p><div className="mt-4 space-y-2">{aiAssessment.factors.map((item) => <div key={item.factor} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700"><p className="font-semibold">{item.factor}</p><p className="mt-1 text-xs text-slate-500">{item.explanation}</p><p className="mt-1 text-xs text-sky-700">Next action: {item.recommendation}</p></div>)}</div><div className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">Risk trend: {aiAssessment.probability >= 75 ? "Increasing" : aiAssessment.probability <= 35 ? "Decreasing" : "Stable"} · Last updated: {aiAssessment.updatedAt || project.updatedAt} · Model {aiAssessment.modelVersion} · Confidence: {aiAssessment.confidence}</div></Panel></div>}
</main></div>
  </>;
}
