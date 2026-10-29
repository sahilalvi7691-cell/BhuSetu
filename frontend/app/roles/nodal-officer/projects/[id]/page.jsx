"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Bot,
  BriefcaseBusiness,
  Building2,
  CalendarRange,
  CheckCircle2,
  ChevronRight,
  Download,
  Eye,
  FileText,
  FolderKanban,
  Landmark,
  MapPinned,
  MessageSquareText,
  OctagonAlert,
  Paperclip,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  UserCog,
  Users,
} from "lucide-react";

import { Header } from "@/app/component/layout/index";
import { api } from "@/lib/api";
import { PROJECTS, projectTypeMeta } from "../../../project-officer/my-project/projects-data";
import { getWorkflowState, subscribeToWorkflow, updateWorkflowProject } from "../../../../../components/workflowStore";
import { addAuditLog, updateSuperAdminState } from "../../../super-admin/superAdminStore";
import NodalGISPanel from "./NodalGISPanel";

const formatDate = (value) => {
  // 1. Check for null, undefined, or empty strings
  if (!value) return "N/A"; 

  const date = new Date(value);

  // 2. Check if the parsed date is valid
  if (isNaN(date.getTime())) return "Invalid Date"; 

  // 3. Return the formatted date safely
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatDateTime = (value) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

const riskTone = {
  Low: "border-emerald-200 bg-emerald-50 text-emerald-700",
  LOW: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Medium: "border-amber-200 bg-amber-50 text-amber-700",
  MEDIUM: "border-amber-200 bg-amber-50 text-amber-700",
  High: "border-orange-200 bg-orange-50 text-orange-700",
  HIGH: "border-orange-200 bg-orange-50 text-orange-700",
  Critical: "border-red-200 bg-red-50 text-red-700",
  CRITICAL: "border-red-200 bg-red-50 text-red-700",
  "N/A": "border-slate-200 bg-slate-100 text-slate-600",
};

const workflowTone = {
  Completed: "border-sky-200 bg-sky-50 text-sky-700",
  Verified: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

const officerOptions = [
  "Amit Sharma",
  "Priya Nair",
  "Rohit Meena",
  "Ananya Verma",
  "Sanjay Singh",
];

const decisionOptions = [
  "Continue Monitoring",
  "Intervention Required",
  "Escalate",
  "Put Project on Hold",
  "Resume Project",
  "Review Required",
  "Other",
];

const priorityOptions = ["Critical", "High", "Medium", "Low"];

const getRiskTrend = (project) => {
  if (project.riskProbability >= 75) return "Increasing";
  if (project.riskProbability <= 35) return "Decreasing";
  return "Stable";
};

const getRiskFactors = (project) => {
  const factors = [
    { factor: "Legal disputes are pending in multiple parcels.", impact: "Very High", action: "Escalate to the competent authority and request a resolution plan." },
    { factor: "Compensation cases remain unresolved for affected families.", impact: "High", action: "Prioritize pending compensation disbursement and verify beneficiary records." },
    { factor: "Ownership verification is incomplete for a portion of the alignment.", impact: "High", action: "Request a focused parcel verification review from the LAO and district team." },
    { factor: "R&R actions are still pending for affected households.", impact: "Medium", action: "Coordinate resettlement follow-up and issue a detailed action checklist." },
    { factor: "Approvals and agency coordination are delayed.", impact: "Medium", action: "Escalate pending approvals and fix the compliance review timeline." },
  ];

  return factors.slice(0, project.riskCategory === "Critical" ? 5 : project.riskCategory === "High" ? 4 : 3);
};

const defaultDecisionHistory = [
  {
    date: "2026-09-03",
    decision: "Intervention Required",
    remarks: "Project risk remains elevated due to unresolved compensation and legal barriers in critical parcels.",
    officer: "Amit Sharma",
    targetDate: "2026-09-10",
    status: "Active",
  },
  {
    date: "2026-09-01",
    decision: "Continue Monitoring",
    remarks: "LAO reported partial verification progress, but ownership records are still under review.",
    officer: "Priya Nair",
    targetDate: "2026-09-08",
    status: "Closed",
  },
];

export default function ProjectDetailPage() {
  const params = useParams();
  const [workflow, setWorkflow] = useState({ projects: PROJECTS });
  const [apiProject, setApiProject] = useState(null);
  const [apiAssessment, setApiAssessment] = useState(null);
  const [apiRiskHistory, setApiRiskHistory] = useState([]);
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState({
    decision: "Intervention Required",
    priority: "High",
    officer: "Amit Sharma",
    targetDate: "2026-09-18",
    remarks: "Project requires coordinated intervention due to unresolved compensation and legal disputes affecting multiple parcels.",
    followUpDate: "2026-09-25",
    status: "Open",
  });
  const [history, setHistory] = useState(defaultDecisionHistory);
  const submissionInProgress = useRef(false);

  const projectId = params?.id ?? "";
  const localProject = workflow.projects.find((item) => String(item.id) === String(projectId) || String(item.projectId) === String(projectId)) || PROJECTS.find((item) => String(item.id) === String(projectId) || String(item.projectId) === String(projectId));
  const project = apiProject ? {
    ...localProject,
    ...apiProject,
    riskProbability: apiProject.riskProbability ?? apiAssessment?.delay_probability ?? localProject?.riskProbability,
    riskCategory: apiProject.riskCategory ?? apiAssessment?.risk_category ?? localProject?.riskCategory,
  } : localProject;

  useEffect(() => {
    setWorkflow(getWorkflowState());
    return subscribeToWorkflow(setWorkflow);
  }, []);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    const loadProject = /^\d+$/.test(String(projectId)) ? api.getProject(projectId) : api.getProjectByCode(localProject?.projectId || projectId);
    loadProject.then((nextProject) => Promise.all([Promise.resolve(nextProject), api.getAssessment(nextProject.id).catch(() => api.predict(nextProject.id)), api.getHistory(nextProject.id).catch(() => []), api.getInterventions(nextProject.id).catch(() => [])]))
      .then(([nextProject, nextAssessment, nextRiskHistory, nextInterventions]) => {
        if (!active) return;
        const embeddedAssessment = nextProject.assessment || {};
        const resolvedAssessment = nextAssessment || embeddedAssessment;
        setApiProject({ ...nextProject, riskProbability: nextProject.riskProbability ?? resolvedAssessment?.delay_probability, riskCategory: nextProject.riskCategory ?? resolvedAssessment?.risk_category });
        setApiAssessment(resolvedAssessment);
        setApiRiskHistory(nextRiskHistory || []);
        setApiError("");
        setIsLoading(false);
      })
      .catch((error) => { if (active) { setApiError(error.message || "Project API unavailable"); setIsLoading(false); } });
    return () => { active = false; };
  }, [localProject?.projectId, projectId]);

  const riskFactors = useMemo(() => apiAssessment?.top_risk_factors?.length ? apiAssessment.top_risk_factors.map((factor) => ({ factor: factor.factor || factor, impact: "High", action: factor.recommendation || "Review and resolve this risk factor." })) : (project ? getRiskFactors(project) : []), [apiAssessment, project]);
  const recommendations = useMemo(() => {
    if (apiAssessment?.recommendations?.length) return apiAssessment.recommendations;
    return riskFactors.map((item) => item.action);
  }, [apiAssessment, riskFactors]);

  const acquisitionSummary = useMemo(() => {
    if (!project) return null;

    const base = {
      totalParcels: 48,
      verifiedParcels: project.riskProbability > 75 ? 29 : project.riskProbability > 45 ? 34 : 40,
      pendingVerification: 19,
      ownershipIssues: project.riskCategory === "Critical" ? 8 : project.riskCategory === "High" ? 5 : 3,
      compensationProgress: project.riskCategory === "Critical" ? 42 : project.riskCategory === "High" ? 58 : 72,
      legalCases: project.riskCategory === "Critical" ? 7 : project.riskCategory === "High" ? 4 : 2,
      rrStatus: project.riskCategory === "Critical" ? "Pending" : project.riskCategory === "High" ? "In progress" : "On track",
      approvals: project.riskCategory === "Critical" ? "Awaiting district clearances" : "In review",
      possessionStatus: project.riskCategory === "Critical" ? "Delayed" : project.riskCategory === "High" ? "Partial" : "Not started",
      pendingCases: ["Compensation verification", "Ownership dispute review", "R&R household survey"],
    };

    return base;
  }, [project]);

  const riskHistory = useMemo(() => {
    if (!project) return [];

    if (apiRiskHistory.length) {
      return apiRiskHistory.map((item) => ({ date: item.timestamp, value: `${item.new_probability}% ${item.new_risk}`, note: item.changed_fields?.length ? `Updated fields: ${item.changed_fields.join(", ")}` : "AI assessment update." }));
    }

    const baseline = project.riskProbability >= 80 ? 82 : project.riskProbability >= 60 ? 64 : 38;

    return [
      { date: "2026-08-22", value: "82% High", note: "Initial AI assessment based on compensation and legal alerts." },
      { date: "2026-09-02", value: `${baseline}% ${project.riskCategory || "High"}`, note: "Updated after LAO parcel verification was completed." },
      { date: "2026-09-05", value: `${project.riskProbability}% ${project.riskCategory}`, note: "Risk recalculated after new ownership and compensation data were received." },
      { date: "2026-09-08", value: `${Math.max(18, project.riskProbability - 25)}% ${project.riskProbability > 50 ? "High" : "Medium"}`, note: "Proactive intervention and settlement updates reduced predicted delay likelihood." },
    ];
  }, [apiRiskHistory, project]);

  const fallbackDocuments = [
    {
      name: "Land Survey Map.pdf",
      type: "Survey Report",
      size: "2.4 MB",
      uploadedAt: "2026-09-02",
      uploadedBy: "Project Officer",
      status: "Verified",
    },
    {
      name: "Ownership Records.pdf",
      type: "Legal Document",
      size: "1.8 MB",
      uploadedAt: "2026-09-04",
      uploadedBy: "LAO Office",
      status: "In Review",
    },
    {
      name: "Compensation Schedule.xlsx",
      type: "Compensation Data",
      size: "860 KB",
      uploadedAt: "2026-09-06",
      uploadedBy: "Finance Team",
      status: "Verified",
    },
    {
      name: "Project Site Photos.zip",
      type: "Field Evidence",
      size: "6.1 MB",
      uploadedAt: "2026-09-07",
      uploadedBy: "Field Team",
      status: "Pending",
    },
  ];
  if (isLoading && !project) {
    return <div className="min-h-screen bg-slate-50 text-slate-800"><Header title="Projects" /><main className="mx-auto max-w-3xl px-4 pb-12 pt-24 sm:px-6 lg:px-8"><div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"><p className="text-sm text-slate-500">Loading project and ML assessment...</p></div></main></div>;
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800">
        <Header title="Projects" />
        <main className="mx-auto max-w-3xl px-4 pb-12 pt-24 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-semibold text-slate-900">Project not found</h1>
            <p className="mt-2 text-sm text-slate-500">The requested project could not be located.</p>
            <Link
              href="/roles/nodal-officer/projects"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Projects
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const uploadedDocuments = project.documents?.length ? project.documents : fallbackDocuments;
  const ProjectIcon = projectTypeMeta[project.type]?.icon || Building2;

  const handleFormChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (/^\d+$/.test(String(project.id))) {
      try {
        const result = await api.createDecision(project.id, form);
        setApiProject(result.project);
        setHistory(result.project.decisionHistory || []);
        setApiError("");
      } catch (error) {
        setApiError(error.message || "Unable to save the decision");
        return;
      }
    }

    const timestamp = new Date().toISOString();

    setHistory((current) => [
      {
        date: new Date().toISOString().slice(0, 10),
        decision: form.decision,
        remarks: form.remarks,
        officer: form.officer,
        targetDate: form.targetDate,
        status: form.status,
      },
      ...current,
    ]);

    updateWorkflowProject(project.id, (current) => ({
      ...current,
      status: form.decision === "Intervention Required" ? "Intervention Required" : "Under Monitoring",
      workflowStatus: form.decision === "Intervention Required" ? "Intervention Required" : "Under Monitoring",
      interventions: [{ id: `intervention-${Date.now()}`, type: form.decision, action: form.remarks, assignedOfficer: form.officer, priority: form.priority, dueDate: form.targetDate, remarks: form.remarks, timestamp }, ...(current.interventions || [])],
      notifications: [{ id: `notification-${Date.now()}`, title: "Nodal intervention recorded", detail: `${form.decision} for ${current.name}`, targetRole: "LAO", timestamp, read: false }, ...(current.notifications || [])],
    }), "Nodal intervention recorded");
  };

  const submitToSuperAdmin = async () => {
    if (project.nodalReviewCompleted || submissionInProgress.current) return;
    submissionInProgress.current = true;

    const submittedAt = new Date().toISOString();
    const workflowActivity = { id: `workflow-${Date.now()}`, action: "Submitted to Super Admin", actor: "Sahil Alvi", role: "Nodal Officer", timestamp: submittedAt, status: "Completed" };
    const submittedProject = (item) => ({
      ...item,
      status: "Closure Recommended / Pending Final Verification",
      workflowStatus: "Closure Recommended / Pending Final Verification",
      nodalReviewCompleted: true,
      submittedAt,
      submittedBy: "Sahil Alvi",
      workflowActivity: [workflowActivity, ...(item.workflowActivity || []).filter((activity) => activity.action !== "Submitted to Super Admin")],
    });

    if (/^\d+$/.test(String(project.id))) {
      try {
        const saved = await api.updateProjectWorkflow(project.id, { status: "Closure Recommended / Pending Final Verification", workflowStatus: "Closure Recommended / Pending Final Verification", nodalReviewCompleted: true, submittedAt, submittedBy: "Sahil Alvi", workflowActivity: [workflowActivity, ...(project.workflowActivity || [])] });
        setApiProject((current) => ({ ...current, ...saved }));
        setApiError("");
      } catch (error) {
        setApiError(error.message || "Unable to submit the project");
        submissionInProgress.current = false;
        return;
      }
    }

    updateWorkflowProject(project.id, submittedProject, "Project submitted to Super Admin");
    updateSuperAdminState((current) => addAuditLog(current, "Project submitted to Super Admin", project.name, "Workflow", (next) => {
      const exists = next.projects.some((item) => String(item.id) === String(project.id));
      return {
        ...next,
        projects: exists
          ? next.projects.map((item) => String(item.id) === String(project.id) ? submittedProject(item) : item)
          : [...next.projects, submittedProject(project)],
      };
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Header title="Projects" />

      <main className="mx-auto max-w-7xl px-4 pb-12 pt-4 sm:px-6 lg:px-8">
        {apiError ? <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{apiError}</div> : null}
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            href="/roles/nodal-officer/projects"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to projects
          </Link>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            {project.projectId}
          </span>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 border-b border-slate-200 pb-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-slate-700">
                <ProjectIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{project.type}</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{project.name}</h1>
                <p className="mt-2 text-sm text-slate-600">Project Officer → LAO → AI Analysis → Nodal Officer decision support</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
                {project.status}
              </span>
              <span className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] ${riskTone[project.riskCategory] || riskTone["N/A"]}`}>
                {project.riskProbability}% {project.riskCategory} RISK
              </span>
              {project.nodalReviewCompleted ? (
                <span className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold ${workflowTone[project.workflowStatus] || "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>Nodal review completed</span>
              ) : null}
            </div>
          </div>

          {project.nodalReviewCompleted ? (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              Completed and submitted to Super Admin on {formatDateTime(project.submittedAt)} by {project.submittedBy}. Nodal review is locked.
            </div>
          ) : null}

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                <FolderKanban className="h-4 w-4" />
                Project overview
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-600">{project.description}</p>
              <dl className="mt-4 grid gap-3 border-t border-slate-200 pt-4 text-sm sm:grid-cols-2">
                {[
                  ["Department / Agency", project.department],
                  ["Required land", project.requiredLandArea != null ? `${project.requiredLandArea} ${project.landUnit || "hectares"}` : ""],
                  ["Acquisition requirement", project.acquisitionRequirement],
                  ["Purpose", project.purpose],
                  ["Planned start", project.plannedStartDate],
                  ["Target completion", project.targetCompletionDate],
                  ["Estimated project cost", project.estimatedProjectCost != null ? `INR ${Number(project.estimatedProjectCost).toLocaleString("en-IN")}` : ""],
                  ["Funding source", project.fundingSource],
                ].filter(([, value]) => value).map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs font-medium text-slate-500">{label}</dt>
                    <dd className="mt-1 text-slate-800">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                <MapPinned className="h-4 w-4" />
                Location
              </p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li><span className="font-medium text-slate-800">District:</span> {project.district}</li>
                <li><span className="font-medium text-slate-800">Village:</span> {project.village}</li>
                <li><span className="font-medium text-slate-800">State:</span> {project.state}</li>
                <li><span className="font-medium text-slate-800">Boundary:</span> Alignment corridor mapped and available for review</li>
              </ul>
            </div>

            <div id="risk-assessment" className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                <ShieldAlert className="h-4 w-4" />
                AI risk assessment
              </p>
              <div className="mt-3">
                <p className="text-3xl font-semibold text-slate-900">{project.riskProbability}%</p>
                <p className="mt-1 text-sm font-semibold uppercase tracking-[0.12em] text-red-700">{project.riskCategory} Risk</p>
                <p className="mt-2 text-sm text-slate-600">Risk trend: <span className="font-semibold text-slate-800">{getRiskTrend(project)}</span></p>
                <p className="mt-1 text-xs text-slate-500">Model version: {apiAssessment?.model_version || "xgb-existing-model"} • Last updated: {formatDate(apiAssessment?.last_updated || project.updatedAt)}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 xl:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              <BriefcaseBusiness className="h-4 w-4" />
              Project officer input
            </p>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li><span className="font-medium text-slate-800">Project type:</span> {project.type}</li>
              <li><span className="font-medium text-slate-800">Land required:</span> {project.requiredLandArea} {project.landUnit}</li>
              <li><span className="font-medium text-slate-800">Status:</span> {project.status}</li>
              <li><span className="font-medium text-slate-800">Acquisition progress:</span> {project.riskProbability}%</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              <Landmark className="h-4 w-4" />
              Acquisition summary
            </p>
            {acquisitionSummary && (
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li><span className="font-medium text-slate-800">Total parcels:</span> {acquisitionSummary.totalParcels}</li>
                <li><span className="font-medium text-slate-800">Verified parcels:</span> {acquisitionSummary.verifiedParcels}</li>
                <li><span className="font-medium text-slate-800">Pending verification:</span> {acquisitionSummary.pendingVerification}</li>
                <li><span className="font-medium text-slate-800">Ownership issues:</span> {acquisitionSummary.ownershipIssues}</li>
                <li><span className="font-medium text-slate-800">Compensation progress:</span> {acquisitionSummary.compensationProgress}%</li>
                <li><span className="font-medium text-slate-800">Legal/dispute cases:</span> {acquisitionSummary.legalCases}</li>
                <li><span className="font-medium text-slate-800">R&R status:</span> {acquisitionSummary.rrStatus}</li>
                <li><span className="font-medium text-slate-800">Approvals:</span> {acquisitionSummary.approvals}</li>
                <li><span className="font-medium text-slate-800">Possession:</span> {acquisitionSummary.possessionStatus}</li>
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              <Bot className="h-4 w-4" />
              AI risk indicators
            </p>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li><span className="font-medium text-slate-800">Delay probability:</span> {project.riskProbability}%</li>
              <li><span className="font-medium text-slate-800">Category:</span> {project.riskCategory}</li>
              <li><span className="font-medium text-slate-800">Trend:</span> {getRiskTrend(project)}</li>
              <li><span className="font-medium text-slate-800">Model version:</span> {apiAssessment?.model_version || "xgb-existing-model"}</li>
              <li><span className="font-medium text-slate-800">Confidence:</span> {apiAssessment?.confidence ?? "Model output"}</li>
              <li><span className="font-medium text-slate-800">Last updated:</span> {formatDate(project.updatedAt)}</li>
            </ul>
          </div>
        </section>

        <section className="mt-6 grid gap-4 xl:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              <OctagonAlert className="h-4 w-4" />
              Why is this project at risk?
            </p>

            <ul className="mt-4 space-y-3">
              {riskFactors.map((item, index) => (
                <li key={item.factor} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">{index + 1}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800">{item.factor}</p>
                      <p className="mt-1 text-xs text-slate-500">Impact: <span className="font-semibold text-slate-700">{item.impact}</span></p>
                      <p className="mt-2 text-xs leading-5 text-slate-600">Recommended action: <span className="font-semibold text-slate-700">{item.action}</span></p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              <MessageSquareText className="h-4 w-4" />
              Recommended actions
            </p>
            <div className="mt-4 space-y-3">
              {recommendations.map((recommendation, index) => (
                <div key={`${recommendation}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                  <div className="font-medium text-slate-800">Recommendation {index + 1}</div>
                  <div className="mt-1 text-xs leading-5 text-slate-600">{recommendation}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                <UserCog className="h-4 w-4" />
                Decision / intervention
              </p>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                AI score locked
              </span>
            </div>

            <form onSubmit={handleSubmit} className={`mt-4 space-y-4 ${project.nodalReviewCompleted ? "pointer-events-none opacity-60" : ""}`}>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  <span className="mb-1 block text-[11px] uppercase tracking-[0.12em] text-slate-500">Decision / action</span>
                  <select
                    value={form.decision}
                    onChange={(event) => handleFormChange("decision", event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-200"
                  >
                    {decisionOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  <span className="mb-1 block text-[11px] uppercase tracking-[0.12em] text-slate-500">Priority</span>
                  <select
                    value={form.priority}
                    onChange={(event) => handleFormChange("priority", event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-200"
                  >
                    {priorityOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  <span className="mb-1 block text-[11px] uppercase tracking-[0.12em] text-slate-500">Responsible officer</span>
                  <select
                    value={form.officer}
                    onChange={(event) => handleFormChange("officer", event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-200"
                  >
                    {officerOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  <span className="mb-1 block text-[11px] uppercase tracking-[0.12em] text-slate-500">Target date</span>
                  <input
                    type="date"
                    value={form.targetDate}
                    onChange={(event) => handleFormChange("targetDate", event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-200"
                  />
                </label>
              </div>

              <label className="block text-sm font-medium text-slate-700">
                <span className="mb-1 block text-[11px] uppercase tracking-[0.12em] text-slate-500">Remarks / reason</span>
                <textarea
                  rows={4}
                  value={form.remarks}
                  onChange={(event) => handleFormChange("remarks", event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-200"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  <span className="mb-1 block text-[11px] uppercase tracking-[0.12em] text-slate-500">Follow-up date</span>
                  <input
                    type="date"
                    value={form.followUpDate}
                    onChange={(event) => handleFormChange("followUpDate", event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-200"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  <span className="mb-1 block text-[11px] uppercase tracking-[0.12em] text-slate-500">Status</span>
                  <select
                    value={form.status}
                    onChange={(event) => handleFormChange("status", event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-200"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Closed">Closed</option>
                  </select>
                </label>
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Record decision
                <ChevronRight className="h-4 w-4" />
              </button>
            </form>

            <button
              type="button"
              onClick={submitToSuperAdmin}
              disabled={project.nodalReviewCompleted || submissionInProgress.current}
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-sky-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {project.nodalReviewCompleted ? "Closure Recommended" : "Recommend Closure"}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              <CalendarRange className="h-4 w-4" />
              Decision history
            </p>

            <div className="mt-4 space-y-3">
              {(project.decisionHistory || history || []).map((item, index) => (
                <div key={`${item.date}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-slate-800">{item.decision}</span>
                    <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600">{item.status}</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">{formatDate(item.date)} • {item.officer}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-600">{item.remarks}</p>
                  <p className="mt-2 text-xs text-slate-500">Target date: {formatDate(item.targetDate)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              <TrendingUp className="h-4 w-4" />
              Risk history
            </p>

            <div className="mt-4 space-y-3">
              {riskHistory.map((item) => (
                <div key={item.date} className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white">
                    {item.value.includes("Low") ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-slate-800">{item.value}</span>
                      <span className="text-[11px] uppercase tracking-[0.12em] text-slate-500">{item.date}</span>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-slate-600">{item.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              <MapPinned className="h-4 w-4" />
              GIS view
            </p>

            <div className="mt-4">
              <NodalGISPanel project={project} />
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              <Paperclip className="h-4 w-4" />
              Uploaded documents
            </p>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600">
              {uploadedDocuments.length} files
            </span>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {uploadedDocuments.map((doc) => (
              <div key={doc.name} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm ring-1 ring-slate-200">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">{doc.name}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-500">{doc.type}</p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                      doc.status === "Verified"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : doc.status === "In Review"
                          ? "border-amber-200 bg-amber-50 text-amber-700"
                          : "border-slate-200 bg-slate-100 text-slate-600"
                    }`}
                  >
                    {doc.status}
                  </span>
                </div>

                <div className="mt-4 grid gap-2 text-xs text-slate-600 sm:grid-cols-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Size</p>
                    <p className="mt-1 font-medium text-slate-700">{doc.size}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Uploaded</p>
                    <p className="mt-1 font-medium text-slate-700">{formatDate(doc.uploadedAt)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">By</p>
                    <p className="mt-1 font-medium text-slate-700">{doc.uploadedBy}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            <FileText className="h-4 w-4" />
            Information flow
          </p>

          <div className="mt-4 grid gap-3 md:grid-cols-4">
            {[
              "Project Officer: baseline project and location data",
              "LAO: parcel, ownership, compensation and verification status",
              "AI Analysis: delay risk, trend and factor ranking",
              "Nodal Officer: decision, intervention and monitoring plan",
            ].map((item, index) => (
              <div key={item} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-800">Step {index + 1}</span>
                  {index < 3 ? <ChevronRight className="h-4 w-4 text-slate-400" /> : null}
                </div>
                <p>{item}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
