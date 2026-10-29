"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CircleDashed,
  Construction,
  FolderKanban,
  MapPin,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  XCircle,
} from "lucide-react";

import { Header } from "@/app/component/layout/index";
import { getWorkflowState, subscribeToWorkflow } from "@/components/workflowStore";
import {
  PROJECTS,
  districtOptions,
  projectTypeMeta,
  projectTypeOptions,
  riskOptions,
  statusOptions,
} from "./projects-data";

const PAGE_SIZE = 6;

const formatDate = (value) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

const statusTone = {
  Draft: "border-slate-200 bg-slate-100 text-slate-700",
  "Pending LAO Verification": "border-amber-200 bg-amber-50 text-amber-700",
  "Under Acquisition": "border-sky-200 bg-sky-50 text-sky-700",
  "On Hold": "border-stone-200 bg-stone-100 text-stone-700",
  Completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

const riskTone = {
  Low: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Medium: "border-amber-200 bg-amber-50 text-amber-700",
  High: "border-orange-200 bg-orange-50 text-orange-700",
  Critical: "border-red-200 bg-red-50 text-red-700",
  "N/A": "border-slate-200 bg-slate-100 text-slate-600",
};

const sortOptions = [
  { value: "updated", label: "Recently Updated" },
  { value: "created", label: "Recently Created" },
  { value: "name", label: "Project Name" },
  { value: "risk-high", label: "Highest Risk" },
  { value: "risk-low", label: "Lowest Risk" },
  { value: "land", label: "Land Requirement" },
];

function SummaryCard({ label, value, icon: Icon, accent, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-300"
      aria-label={`${label}: ${value}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
        </div>
        <span className={`flex h-11 w-11 items-center justify-center rounded-xl border ${accent}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </button>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      <span className="mb-1 block text-xs">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-200"
        aria-label={label}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function StatusBadge({ status }) {
  const tone = statusTone[status] || "border-slate-200 bg-slate-100 text-slate-600";

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide ${tone}`}>
      {status}
    </span>
  );
}

function RiskBadge({ category, probability }) {
  const tone = riskTone[category] || "border-slate-200 bg-slate-100 text-slate-600";

  return (
    <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5">
      <span className="text-xs font-medium text-slate-500">Risk</span>
      <span className="text-base font-bold text-slate-900">{probability}%</span>
      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] ${tone}`}>
        {category}
      </span>
    </div>
  );
}

function ProjectCard({ project }) {
  const ProjectIcon = projectTypeMeta[project.type]?.icon || Construction;

  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700">
            <ProjectIcon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold text-slate-900">{project.name}</h3>
            <p className="mt-1 text-sm font-medium text-slate-500">{project.projectId}</p>
          </div>
        </div>
        <RiskBadge category={project.riskCategory} probability={project.riskProbability} />
      </div>

      <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">{project.description}</p>

      <div className="mt-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
        <MapPin className="h-4 w-4 text-slate-500" />
        <span>
          {project.district}, {project.state}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Status</p>
          <div className="mt-2">
            <StatusBadge status={project.status} />
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Land</p>
          <p className="mt-2 text-sm font-semibold text-slate-800">
            {project.requiredLandArea} {project.landUnit}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Updated</p>
          <p className="mt-2 text-sm font-semibold text-slate-800">{formatDate(project.updatedAt)}</p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
        Predicted likelihood of acquisition-related delay.
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 pt-2">
        <div className="text-xs text-slate-500">
          Type: <span className="font-semibold text-slate-700">{project.type}</span>
        </div>
        <Link
          href={`/roles/project-officer/my-project/${project.id}`}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
          aria-label={`View details for ${project.name}`}
        >
          View Details
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

function EmptyState({ onClear }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500">
        <Search className="h-6 w-6" />
      </div>
      <h3 className="mt-5 text-xl font-semibold text-slate-900">No projects found</h3>
      <p className="mt-2 text-sm text-slate-500">Try adjusting your search or filters.</p>
      <button
        type="button"
        onClick={onClear}
        className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
      >
        <XCircle className="h-4 w-4" />
        Clear Filters
      </button>
    </div>
  );
}

export default function Page() {
  const [projects, setProjects] = useState(PROJECTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");
  const [districtFilter, setDistrictFilter] = useState("All");
  const [sortBy, setSortBy] = useState("updated");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const syncProjects = () => setProjects(getWorkflowState().projects);
    Promise.resolve().then(syncProjects);
    return subscribeToWorkflow(syncProjects);
  }, []);

  const summaryCounts = useMemo(
    () => ({
      total: projects.length,
      active: projects.filter((project) => ["Pending LAO Verification", "Under Acquisition", "On Hold"].includes(project.status)).length,
      underAcquisition: projects.filter((project) => project.status === "Under Acquisition").length,
      highRisk: projects.filter((project) => ["High", "Critical"].includes(project.riskCategory)).length,
    }),
    [projects]
  );

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("All");
    setTypeFilter("All");
    setRiskFilter("All");
    setDistrictFilter("All");
    setSortBy("updated");
    setCurrentPage(1);
  };

  const filteredProjects = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const result = projects.filter((project) => {
      const matchesSearch =
        !normalizedQuery ||
        [
          project.name,
          project.projectId,
          project.district,
          project.village,
          project.type,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesStatus = statusFilter === "All" || project.status === statusFilter;
      const matchesType = typeFilter === "All" || project.type === typeFilter;
      const matchesRisk = riskFilter === "All" || project.riskCategory === riskFilter;
      const matchesDistrict = districtFilter === "All" || project.district === districtFilter;

      return matchesSearch && matchesStatus && matchesType && matchesRisk && matchesDistrict;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case "created":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "name":
          return a.name.localeCompare(b.name);
        case "risk-high":
          return b.riskProbability - a.riskProbability;
        case "risk-low":
          return a.riskProbability - b.riskProbability;
        case "land":
          return b.requiredLandArea - a.requiredLandArea;
        case "updated":
        default:
          return new Date(b.updatedAt) - new Date(a.updatedAt);
      }
    });

    return result;
  }, [districtFilter, projects, riskFilter, searchQuery, sortBy, statusFilter, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / PAGE_SIZE));
  const pageToRender = Math.min(currentPage, totalPages);
  const currentProjects = filteredProjects.slice((pageToRender - 1) * PAGE_SIZE, pageToRender * PAGE_SIZE);

  const summaryCards = [
    {
      label: "Total Projects",
      value: summaryCounts.total,
      icon: FolderKanban,
      accent: "border-slate-200 bg-slate-100 text-slate-700",
      action: () => clearFilters(),
    },
    {
      label: "Active Projects",
      value: summaryCounts.active,
      icon: CircleDashed,
      accent: "border-sky-200 bg-sky-50 text-sky-700",
      action: () => {
        setStatusFilter("Under Acquisition");
        setCurrentPage(1);
      },
    },
    {
      label: "Under Acquisition",
      value: summaryCounts.underAcquisition,
      icon: AlertTriangle,
      accent: "border-amber-200 bg-amber-50 text-amber-700",
      action: () => {
        setStatusFilter("Under Acquisition");
        setCurrentPage(1);
      },
    },
    {
      label: "High Risk",
      value: summaryCounts.highRisk,
      icon: ShieldAlert,
      accent: "border-red-200 bg-red-50 text-red-700",
      action: () => {
        setRiskFilter("High");
        setCurrentPage(1);
      },
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Header title="My Projects" />

      <main className="mx-auto max-w-8xl px-4 pb-12 pt-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 border-b border-slate-200 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">My Projects</h1>
            <p className="mt-2 text-sm text-slate-600">View and track projects created by you.</p>
          </div>
        </div>

        <section className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map(({ label, value, icon: Icon, accent, action }) => (
            <SummaryCard key={label} label={label} value={value} icon={Icon} accent={accent} onClick={action} />
          ))}
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
          <div className="flex flex-col gap-2 xl:flex-row xl:items-end xl:justify-between">
            <div className="flex-1">
              <label className="block text-normal font-medium text-slate-700" htmlFor="project-search">
                Search projects
              </label>
              <div className="relative mt-2">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  id="project-search"
                  type="search"
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search by name, ID, district..."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-200"
                  aria-label="Search projects by name, Project ID, district, village, or project type"
                />
              </div>
            </div>

            <div className="flex w-full max-w-xs items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm text-slate-700 xl:mt-0">
              <SlidersHorizontal className="h-4 w-4 text-slate-500" />
              <span className="font-medium text-sm">{filteredProjects.length} matching</span>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 items-end">
            <div className="w-full sm:w-1/2 md:w-1/3 xl:w-1/6">
              <FilterSelect label="Status" value={statusFilter} onChange={(value) => { setStatusFilter(value); setCurrentPage(1); }} options={statusOptions} />
            </div>
            <div className="w-full sm:w-1/2 md:w-1/3 xl:w-1/6">
              <FilterSelect label="Project Type" value={typeFilter} onChange={(value) => { setTypeFilter(value); setCurrentPage(1); }} options={projectTypeOptions} />
            </div>
            <div className="w-full sm:w-1/2 md:w-1/3 xl:w-1/6">
              <FilterSelect label="Risk" value={riskFilter} onChange={(value) => { setRiskFilter(value); setCurrentPage(1); }} options={riskOptions} />
            </div>
            <div className="w-full sm:w-1/2 md:w-1/3 xl:w-1/6">
              <FilterSelect label="District" value={districtFilter} onChange={(value) => { setDistrictFilter(value); setCurrentPage(1); }} options={["All", ...districtOptions]} />
            </div>
            <div className="w-full sm:w-1/2 md:w-1/3 xl:w-1/6">
              <label className="block w-full text-sm font-medium text-slate-700">
                <span className="mb-1 block text-xs">Sort by</span>
                <select
                  value={sortBy}
                  onChange={(event) => {
                    setSortBy(event.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-200"
                  aria-label="Sort projects"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="mt-4 flex flex-col items-start justify-between gap-2 border-t border-slate-200 pt-3 sm:flex-row sm:items-center">
            <p className="text-xs text-slate-600">
              Showing <span className="font-semibold text-slate-900">{filteredProjects.length}</span> of <span className="font-semibold text-slate-900">{projects.length}</span> projects
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
            >
              <XCircle className="h-4 w-4" />
              Clear Filters
            </button>
          </div>
        </section>

        <section className="mt-6">
          {currentProjects.length > 0 ? (
            <>
              <div className="grid gap-4 xl:grid-cols-2">
                {currentProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>

              {filteredProjects.length > PAGE_SIZE && (
                <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={pageToRender === 1}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`h-10 w-10 rounded-xl border text-sm font-medium transition ${
                        pageNumber === pageToRender
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                      }`}
                      aria-label={`Go to page ${pageNumber}`}
                    >
                      {pageNumber}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                    disabled={pageToRender === totalPages}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <EmptyState onClear={clearFilters} />
          )}
        </section>
      </main>
    </div>
  );
}
