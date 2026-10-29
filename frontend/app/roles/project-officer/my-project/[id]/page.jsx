"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowLeft,
  BadgeCheck,
  Bot,
  BrainCircuit,
  CalendarRange,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  Construction,
  FileText,
  FolderKanban,
  Map,
  MapPinned,
  MessageSquare,
  PauseCircle,
  PlayCircle,
  PlusCircle,
  Send,
  ShieldAlert,
  ShieldCheck,
  TriangleAlert,
  TrendingDown,
  TrendingUp,
  UserCheck,
} from "lucide-react";

import { Header } from "@/app/component/layout/index";
import { getWorkflowState, subscribeToWorkflow } from "@/components/workflowStore";
import { api } from "@/lib/api";
import { PROJECTS, projectTypeMeta } from "../projects-data";

const ACTIVITY_FILTERS = [
  { key: "all", label: "All Activity" },
  { key: "risk", label: "Risk Changes" },
  { key: "officer", label: "Officer Actions" },
  { key: "update", label: "Project Updates" },
  { key: "system", label: "System Events" },
];

const formatDate = (value) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

const formatDateTime = (value) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

const formatTime = (value) =>
  new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

const activityIcons = {
  project_created: PlusCircle,
  project_submitted: Send,
  lao_assigned: UserCheck,
  lao_verified: BadgeCheck,
  gis_processed: Map,
  parcels_identified: MapPinned,
  parcels_verified: ClipboardCheck,
  acquisition_data_submitted: FileText,
  risk_generated: BrainCircuit,
  risk_recalculated: TrendingUp,
  officer_intervention: ShieldCheck,
  data_updated: MessageSquare,
  risk_reduced: TrendingDown,
  risk_increased: TrendingUp,
  project_on_hold: PauseCircle,
  project_resumed: PlayCircle,
  project_completed: CheckCircle2,
  system_update: Bot,
};

const statusClasses = {
  completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  active: "border-sky-200 bg-sky-50 text-sky-700",
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  warning: "border-orange-200 bg-orange-50 text-orange-700",
  critical: "border-red-200 bg-red-50 text-red-700",
  informational: "border-slate-200 bg-slate-100 text-slate-600",
};

const riskBadgeClasses = {
  LOW: "border-emerald-200 bg-emerald-50 text-emerald-700",
  MEDIUM: "border-amber-200 bg-amber-50 text-amber-700",
  HIGH: "border-orange-200 bg-orange-50 text-orange-700",
  CRITICAL: "border-red-200 bg-red-50 text-red-700",
  NA: "border-slate-200 bg-slate-100 text-slate-600",
};

const projectActivities = [
  {
    id: 1,
    type: "project_created",
    group: "update",
    title: "Project Created",
    description: "Baseline project record created with project details and village information.",
    timestamp: "2026-09-02T09:30:00",
    actor: { name: "Ali Arzan Zaidi", role: "Project Officer", phone: null },
    status: "completed",
    remark: "Initial project intake completed and assigned to the field team.",
  },
  {
    id: 2,
    type: "project_submitted",
    group: "update",
    title: "Project Submitted",
    description: "Project was submitted for LAO verification and processing.",
    timestamp: "2026-09-05T10:42:00",
    actor: { name: "Ali Arzan Zaidi", role: "Project Officer", phone: null },
    status: "completed",
    remark: "Project details and initial GIS boundary submitted for review.",
  },
  {
    id: 3,
    type: "lao_assigned",
    group: "officer",
    title: "LAO Assigned",
    description: "Land Acquisition Officer assigned to the project for verification and workflow processing.",
    timestamp: "2026-09-05T11:15:00",
    actor: { name: "Rajesh Kumar", role: "Land Acquisition Officer", phone: "+91 98765 43210", office: "Ghaziabad" },
    status: "completed",
    remark: "Assigned for verification and acquisition case processing.",
    actionLabel: "View Officer",
  },
  {
    id: 4,
    type: "lao_verified",
    group: "officer",
    title: "LAO Accepted / Verified",
    description: "Verification completed and acquisition process accepted for continuation.",
    timestamp: "2026-09-05T11:40:00",
    actor: { name: "Rajesh Kumar", role: "Land Acquisition Officer", phone: "+91 98765 43210", office: "Ghaziabad" },
    status: "completed",
    remark: "Preliminary verification completed against the submitted project record.",
  },
  {
    id: 5,
    type: "gis_processed",
    group: "system",
    title: "GIS Data Processed",
    description: "Project boundary and location data were processed for geospatial review.",
    timestamp: "2026-09-05T11:58:00",
    actor: { name: "BhuSetu", role: "Automated System" },
    status: "completed",
  },
  {
    id: 6,
    type: "parcels_identified",
    group: "update",
    title: "Candidate Parcels Identified",
    description: "Candidate parcels were identified for acquisition planning and review.",
    timestamp: "2026-09-05T12:00:00",
    actor: { name: "Rajesh Kumar", role: "Land Acquisition Officer", phone: "+91 98765 43210", office: "Ghaziabad" },
    status: "active",
    remark: "47 candidate parcels flagged for cadastral verification and legal review.",
  },
  {
    id: 7,
    type: "parcels_verified",
    group: "officer",
    title: "Parcels Verified",
    description: "Candidate parcels were cross-checked against cadastral and ownership records.",
    timestamp: "2026-09-05T12:30:00",
    actor: { name: "Rajesh Kumar", role: "Land Acquisition Officer", phone: "+91 98765 43210", office: "Ghaziabad" },
    status: "completed",
    remark: "Verified 47 candidate parcels against the available cadastral data.",
  },
  {
    id: 8,
    type: "acquisition_data_submitted",
    group: "update",
    title: "Acquisition Data Submitted",
    description: "Acquisition data and parcel details were submitted for review and AI processing.",
    timestamp: "2026-09-05T13:10:00",
    actor: { name: "Ali Arzan Zaidi", role: "Project Officer", phone: null },
    status: "completed",
    remark: "Updated parcel and compensation-related uploads attached to the project record.",
  },
  {
    id: 9,
    type: "risk_generated",
    group: "risk",
    title: "AI Risk Assessment Generated",
    description: "BhuSetu generated the project delay-risk assessment for the active acquisition workflow.",
    timestamp: "2026-09-05T12:05:00",
    actor: { name: "BhuSetu", role: "Automated System" },
    status: "completed",
    risk: { probability: 82, category: "HIGH" },
    factors: [
      "Pending compensation cases",
      "Active legal disputes",
      "Multiple ownership issues",
    ],
    modelVersion: "v1.2",
    actionLabel: "View Risk Assessment",
    actionHref: "#risk-assessment",
  },
  {
    id: 10,
    type: "risk_recalculated",
    group: "risk",
    title: "Risk Recalculated",
    description: "Risk was recalculated after compensation-related issues were resolved for several parcels.",
    timestamp: "2026-09-05T15:20:00",
    actor: { name: "Rajesh Kumar", role: "Land Acquisition Officer", phone: "+91 98765 43210", office: "Ghaziabad" },
    status: "completed",
    risk: {
      previousProbability: 82,
      previousCategory: "HIGH",
      probability: 61,
      category: "HIGH",
    },
    remark: "Compensation documentation verified and updated for affected parcels.",
  },
  {
    id: 11,
    type: "officer_intervention",
    group: "officer",
    title: "Officer Intervention",
    description: "Nodal officer intervened to resolve process delays and coordinate land acquisition follow-up.",
    timestamp: "2026-09-06T09:10:00",
    actor: { name: "Amit Sharma", role: "Nodal Officer", phone: "+91 98100 11223", office: "Meerut" },
    status: "warning",
    remark: "Additional field verification requested for a blocked parcel cluster.",
  },
  {
    id: 12,
    type: "data_updated",
    group: "update",
    title: "Data Updated",
    description: "Project data was refreshed after additional field verification and ownership updates.",
    timestamp: "2026-09-06T10:40:00",
    actor: { name: "Ali Arzan Zaidi", role: "Project Officer", phone: null },
    status: "completed",
    remark: "Ownership records updated and supporting documentation attached.",
  },
  {
    id: 13,
    type: "risk_reduced",
    group: "risk",
    title: "Risk Reduced",
    description: "AI risk profile improved after legal dispute status updated to resolved.",
    timestamp: "2026-09-06T11:10:00",
    actor: { name: "BhuSetu", role: "Automated System" },
    status: "completed",
    risk: {
      previousProbability: 61,
      previousCategory: "HIGH",
      probability: 29,
      category: "LOW",
    },
    remark: "Legal dispute status updated to resolved and field verification completed.",
  },
  {
    id: 14,
    type: "project_on_hold",
    group: "update",
    title: "Project Put On Hold",
    description: "Project activity was temporarily paused pending statutory review and additional evidence.",
    timestamp: "2026-09-07T14:45:00",
    actor: { name: "Amit Sharma", role: "Nodal Officer", phone: "+91 98100 11223", office: "Meerut" },
    status: "pending",
    remark: "Hold imposed pending final legal review of disputed parcels.",
  },
  {
    id: 15,
    type: "project_resumed",
    group: "update",
    title: "Project Resumed",
    description: "Project work resumed after regulatory review and data reconciliation.",
    timestamp: "2026-09-08T09:00:00",
    actor: { name: "Amit Sharma", role: "Nodal Officer", phone: "+91 98100 11223", office: "Meerut" },
    status: "active",
    remark: "Additional clarifications received and acquisition activities resumed.",
  },
  {
    id: 16,
    type: "project_completed",
    group: "update",
    title: "Project Completed",
    description: "Project reached completion after acquisition and verification milestones were closed.",
    timestamp: "2026-09-10T17:45:00",
    actor: { name: "Ali Arzan Zaidi", role: "Project Officer", phone: null },
    status: "completed",
    remark: "Closure documentation prepared and final acceptance recorded.",
  },
];
const assignedOfficer = [
  {
    id: 1,
    name: "Ali Arzan Zaidi",
    role: "Project Officer",
    date: "2026-09-10T17:45:00",
    status: "assigned",
    remark: "Created project and initiated intake",
  },
  {
    id: 2,
    name: "Rajesh Kumar",
    role: "Land Acquisition Officer",
    date: "2026-09-12T19:45:00",
    status: "assigned",
    remark: "Assigned for field verification",
  },
  {
    id: 3,
    name: "Mr. Ashish",
    role: "Nodal Officer",
    date: "2026-09-16T12:45:00",
    status: "pending",
    remark: "Pending acceptance",
  },
];

function ActivityFilters({ activeFilter, onChange, counts }) {
  return (
    <div className="flex flex-wrap gap-2">
      {ACTIVITY_FILTERS.map((filter) => {
        const isActive = filter.key === activeFilter;

        return (
          <button
            key={filter.key}
            type="button"
            onClick={() => onChange(filter.key)}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition ${isActive
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            aria-pressed={isActive}
          >
            <span>{filter.label}</span>
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${isActive ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500"}`}>
              {counts[filter.key] ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function ActorInfo({ actor }) {
  if (!actor) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Generated by</p>
      <div className="mt-2 space-y-1 text-sm text-slate-700">
        <p className="font-semibold text-slate-900">{actor.name}</p>
        <p>{actor.role}</p>
        {actor.phone ? <p>{actor.phone}</p> : null}
        {actor.office ? <p>{actor.office}</p> : null}
      </div>
    </div>
  );
}

function RiskChange({ risk }) {
  if (!risk) return null;

  const hasPrevious = typeof risk.previousProbability !== "undefined";

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Risk Update</p>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
        {hasPrevious ? (
          <>
            <span className="font-semibold text-slate-700">{risk.previousProbability}% {risk.previousCategory}</span>
            <span className="text-slate-400">→</span>
          </>
        ) : null}
        <span className="font-semibold text-slate-900">{risk.probability}% {risk.category}</span>
      </div>
    </div>
  );
}

function RemarkBlock({ remark }) {
  if (!remark) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Remark</p>
      <p className="mt-2 text-sm leading-6 text-slate-700">“{remark}”</p>
    </div>
  );
}

function ActivityIcon({ type }) {
  const Icon = activityIcons[type] || Activity;

  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm">
      <Icon className="h-4 w-4" />
    </span>
  );
}

function ActivityItem({ item, isExpanded, onToggle, isLast }) {
  const safeStatus = statusClasses[item.status] || statusClasses.completed;

  return (
    <div className="relative flex gap-4">
      <div className="relative flex w-11 flex-col items-center">
        <ActivityIcon type={item.type} />
        {!isLast ? <span className="mt-2 h-full w-px bg-slate-200" /> : null}
      </div>

      <div className="flex-1 pb-6">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isExpanded}
          className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${safeStatus}`}>
                  {item.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{item.description}</p>
              <p className="mt-2 text-xs text-slate-500">{formatDateTime(item.timestamp)}</p>
            </div>

            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-medium text-slate-600">
              {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              {isExpanded ? "Hide details" : "View details"}
            </span>
          </div>
        </button>

        {isExpanded && (
          <div className="mt-4 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap gap-2 text-xs text-slate-600">
              <span className="rounded-full border border-slate-200 bg-white px-2 py-1">{formatDateTime(item.timestamp)}</span>
              {item.status ? <span className="rounded-full border border-slate-200 bg-white px-2 py-1">Status: {item.status}</span> : null}
              {item.risk ? (
                <span className={`rounded-full border px-2 py-1 ${riskBadgeClasses[item.risk.category] || "border-slate-200 bg-white text-slate-700"}`}>
                  {item.risk.category}
                </span>
              ) : null}
            </div>

            {item.risk ? <RiskChange risk={item.risk} /> : null}

            {item.factors && item.factors.length > 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Top Factors</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                  {item.factors.map((factor) => (
                    <li key={factor}>{factor}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {item.modelVersion ? (
              <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Model Version</span>
                <p className="mt-2 font-medium">{item.modelVersion}</p>
              </div>
            ) : null}

            <ActorInfo actor={item.actor} />
            <RemarkBlock remark={item.remark} />

            {item.actionLabel ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {item.actionHref ? (
                  <Link
                    href={item.actionHref}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    {item.actionLabel}
                  </Link>
                ) : (
                  <button type="button" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100">
                    {item.actionLabel}
                  </button>
                )}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyActivityState() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500">
        <Activity className="h-6 w-6" />
      </div>
      <h3 className="mt-5 text-xl font-semibold text-slate-900">No activity yet</h3>
      <p className="mt-2 text-sm text-slate-500">Project activity will appear here as the project moves through the acquisition workflow.</p>
    </div>
  );
}

export default function ProjectDetailsPage() {
  const params = useParams();
  const [activeFilter, setActiveFilter] = useState("all");
  const [expandedIds, setExpandedIds] = useState(new Set([9, 10, 13]));

  const filteredActivities = useMemo(() => {
    if (activeFilter === "all") return projectActivities;

    return projectActivities.filter((activity) => {
      if (activeFilter === "risk") return activity.group === "risk";
      if (activeFilter === "officer") return activity.group === "officer";
      if (activeFilter === "update") return activity.group === "update";
      if (activeFilter === "system") return activity.group === "system";
      return true;
    });
  }, [activeFilter]);

  const summary = useMemo(() => {
    const officerActions = projectActivities.filter((activity) => activity.group === "officer").length;
    const riskUpdates = projectActivities.filter((activity) => activity.group === "risk").length;
    const systemEvents = projectActivities.filter((activity) => activity.group === "system").length;
    const lastUpdated = projectActivities.reduce((latest, activity) => {
      return new Date(activity.timestamp) > new Date(latest) ? activity.timestamp : latest;
    }, projectActivities[0]?.timestamp || new Date().toISOString());

    return { total: projectActivities.length, officerActions, riskUpdates, systemEvents, lastUpdated };
  }, []);

  const projectId = String(params?.id ?? "");
  const [createdProject, setCreatedProject] = useState(null);

  useEffect(() => {
    let active = true;
    const syncProject = () => {
      const storedProject = getWorkflowState().projects.find(
        (item) => String(item.id) === projectId || String(item.projectId) === projectId
      );
      if (storedProject) {
        setCreatedProject(storedProject);
        return;
      }

      const loadProject = /^\d+$/.test(projectId)
        ? api.getProject(projectId)
        : api.getProjectByCode(projectId);
      loadProject.then((backendProject) => {
        if (active) {
          setCreatedProject({
            ...backendProject,
            riskProbability: backendProject.riskProbability ?? backendProject.assessment?.delay_probability,
            riskCategory: backendProject.riskCategory ?? backendProject.assessment?.risk_category,
          });
        }
      }).catch(() => {});
    };

    Promise.resolve().then(syncProject);
    const unsubscribe = subscribeToWorkflow(syncProject);
    return () => {
      active = false;
      unsubscribe();
    };
  }, [projectId]);

  const project =
    PROJECTS.find((item) => String(item.id) === projectId || item.projectId === projectId) ||
    createdProject;

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800">
        <Header title="My Projects" />
        <main className="mx-auto max-w-3xl px-4 pb-12 pt-24 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-semibold text-slate-900">Project not found</h1>
            <p className="mt-2 text-sm text-slate-500">The requested project could not be located.</p>
            <Link
              href="/roles/project-officer/my-project"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to My Projects
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const ProjectIcon = projectTypeMeta[project.type]?.icon || Construction;

  const toggleExpanded = (id) => {
    setExpandedIds((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Header title="My Projects" />

      <main className="mx-auto max-w-7xl px-4 pb-12 pt-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            href="/roles/project-officer/my-project"
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
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
                {project.status}
              </span>
              <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-red-700">
                {project.riskProbability}% {project.riskCategory} RISK
              </span>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                <FolderKanban className="h-4 w-4" />
                Overview
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-600">{project.description}</p>
              <dl className="mt-4 grid gap-3 border-t border-slate-200 pt-4 text-sm sm:grid-cols-2">
                {[
                  ["Department / Agency", project.department],
                  ["Required land", project.requiredLandArea != null ? `${project.requiredLandArea} ${project.landUnit || "hectares"}` : ""],
                  ["Acquisition requirement", project.acquisitionRequirement],
                  ["Purpose", project.purpose],
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
                <li>
                  <span className="font-medium text-slate-800">District:</span> {project.district}
                </li>
                <li>
                  <span className="font-medium text-slate-800">Village:</span> {project.village}
                </li>
                <li>
                  <span className="font-medium text-slate-800">State:</span> {project.state}
                </li>
              </ul>
            </div>

            <div id="risk-assessment" className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                <ShieldAlert className="h-4 w-4" />
                AI Risk Assessment
              </p>
              <div className="mt-3">
                <p className="text-3xl font-semibold text-slate-900">{project.riskProbability}%</p>
                <p className="mt-1 text-sm font-semibold uppercase tracking-[0.12em] text-red-700">
                  {project.riskCategory} Risk
                </p>
                <p className="mt-2 text-xs text-slate-500">Predicted likelihood of acquisition-related delay.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4  lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              <CalendarRange className="h-4 w-4" />
              Timeline
            </p>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li>
                <span className="font-medium text-slate-800">Created:</span> {formatDate(project.createdAt)}
              </li>
              <li>
                <span className="font-medium text-slate-800">Updated:</span> {formatDate(project.updatedAt)}
              </li>
              <li>
                <span className="font-medium text-slate-800">Land required:</span> {project.requiredLandArea} {project.landUnit}
              </li>
              {project.plannedStartDate ? (
                <li>
                  <span className="font-medium text-slate-800">Planned start:</span> {formatDate(project.plannedStartDate)}
                </li>
              ) : null}
              {project.targetCompletionDate ? (
                <li>
                  <span className="font-medium text-slate-800">Target completion:</span> {formatDate(project.targetCompletionDate)}
                </li>
              ) : null}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              <FileText className="h-4 w-4" />
              Documents
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-600  ">
              <li className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 cursor-pointer hover:text-slate-900">Project brief.pdf</li>
              <li className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 cursor-pointer hover:text-slate-900">Land schedule.xlsx</li>
              <li className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 cursor-pointer hover:text-slate-900">LAO verification note.pdf</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              <Activity className="h-4 w-4" />
              Assigned officers
            </p>

            {/* Officer timeline with vertical progress (derived from `assingedOfficer`) */}
            {(() => {
              const officerActivities = (typeof assignedOfficer !== "undefined" ? assignedOfficer : []).map((a) => ({
                id: a.id,
                actor: { name: a.name, role: a.role },
                timestamp: a.date,
                status: a.status,
                remark: a.remark || "",
              }));

              return (
                <div className="mt-3">
                  {officerActivities.length === 0 ? (
                    <p className="text-sm text-slate-600">No officer assigned yet.</p>
                  ) : (
                    <ul className="divide-y divide-slate-100">
                      {officerActivities.map((act, idx) => {
                        const isDone = ["assigned", "completed", "active"].includes(act.status);
                        const isLast = idx === officerActivities.length - 1;

                        return (
                          <li key={act.id} className="flex items-start gap-3 py-2">
                            <div className="flex flex-col items-center pt-1">
                              <div className={`h-2.5 w-2.5 rounded-full ${isDone ? "bg-emerald-600" : "bg-slate-300"}`} />
                              {!isLast && <div className="h-6 w-px bg-slate-100 mt-1" />}
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="text-sm text-slate-800 font-bold truncate">{act.actor?.name || "Officer"} <span className="text-xs text-slate-700">• {act.actor?.role}</span></p>
                                  <p className="text-xs text-slate-500">{formatDateTime(act.timestamp)}</p>
                                  {/* {act.remark ? <p className="mt-1 text-xs text-slate-600">{act.remark}</p> : null} */}
                                </div>

                                <div className="shrink-0 text-xs">
                                  {act.status === "completed" && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700 text-[11px]">Done</span>
                                  )}
                                  {act.status === "pending" && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-amber-700 text-[11px]">Pending</span>
                                  )}
                                  {act.status === "assigned" && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-sky-700 text-[11px]">Assigned</span>
                                  )}
                                  {act.status === "warning" && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-amber-700 text-[11px]">Attention</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })()}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Project Activity</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Activity Timeline</h2>
            </div>

            <div className="flex flex-col gap-2 text-sm text-slate-600 sm:flex-row sm:items-center sm:gap-5">
              <span>
                <span className="font-semibold text-slate-900">{summary.total}</span> Activities
              </span>
              <span>
                Last updated: <span className="font-semibold text-slate-900">{formatDateTime(summary.lastUpdated)}</span>
              </span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5">{summary.officerActions} Officer Actions</span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5">{summary.riskUpdates} Risk Updates</span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5">{summary.systemEvents} System Events</span>
          </div>

          <div className="mt-5">
            <ActivityFilters activeFilter={activeFilter} counts={{ all: projectActivities.length, risk: summary.riskUpdates, officer: summary.officerActions, update: projectActivities.filter((activity) => activity.group === "update").length, system: summary.systemEvents }} onChange={setActiveFilter} />
          </div>

          {filteredActivities.length > 0 ? (
            <div className="mt-6 space-y-2">
              {filteredActivities.map((activity, index) => (
                <ActivityItem
                  key={activity.id}
                  item={activity}
                  isExpanded={expandedIds.has(activity.id)}
                  onToggle={() => toggleExpanded(activity.id)}
                  isLast={index === filteredActivities.length - 1}
                />
              ))}
            </div>
          ) : (
            <div className="mt-6">
              <EmptyActivityState />
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
