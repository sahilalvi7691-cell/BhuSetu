"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Bell,
  CheckCheck,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  FolderKanban,
  MessageSquare,
  PauseCircle,
  PlayCircle,
  PlusCircle,
  Search,
  Send,
  ShieldAlert,
  Trash2,
  UserCheck,
  X,
} from "lucide-react";

import { Header } from "@/app/component/layout/index";

const initialNotifications = [
  {
    id: "nt-101",
    type: "risk_assessment_updated",
    title: "AI risk profile refreshed",
    description: "BhuSetu flagged a renewed risk spike in the project portfolio and recommended officer review.",
    projectName: "Sawai Nathu Road Widening",
    projectId: "BhuSetu-2026-041",
    actor: { name: "BhuSetu", role: "System" },
    timestamp: "2026-09-02T09:30:00",
    isRead: false,
    projectHref: "/roles/nodal-officer/projects/1",
  },
  {
    id: "nt-102",
    type: "status_changed",
    title: "Risk band escalated",
    description: "Project status moved from medium risk to high risk after a review of delay indicators and field activity gaps.",
    projectName: "Sawai Nathu Road Widening",
    projectId: "BhuSetu-2026-041",
    actor: { name: "Amit Sharma", role: "Nodal Officer" },
    timestamp: "2026-09-03T10:42:00",
    isRead: false,
    projectHref: "/roles/nodal-officer/projects/1",
  },
  {
    id: "nt-103",
    type: "officer_intervention",
    title: "Intervention logged",
    description: "A nodal intervention was recorded to unblock approval chains and improve field progress tracking.",
    projectName: "Rohini Sector 18 Drainage Expansion",
    projectId: "BhuSetu-2026-142",
    actor: { name: "Amit Sharma", role: "Nodal Officer" },
    timestamp: "2026-09-04T11:10:00",
    isRead: true,
    projectHref: "/roles/nodal-officer/projects/2",
  },
  {
    id: "nt-104",
    type: "document_rejected",
    title: "Compliance issue flagged",
    description: "One land document was rejected for missing ownership proof details, requiring immediate follow-up.",
    projectName: "Rohini Sector 18 Drainage Expansion",
    projectId: "BhuSetu-2026-142",
    actor: { name: "Rajesh Kumar", role: "Land Acquisition Officer" },
    timestamp: "2026-09-04T13:05:00",
    isRead: false,
    projectHref: "/roles/nodal-officer/projects/2",
  },
  {
    id: "nt-105",
    type: "document_approved",
    title: "Review cleared by nodal office",
    description: "Supporting land records were approved after verification and marked for acquisition continuation.",
    projectName: "Ghaziabad Industrial Access Road",
    projectId: "BhuSetu-2026-207",
    actor: { name: "Amit Sharma", role: "Nodal Officer" },
    timestamp: "2026-09-05T08:40:00",
    isRead: true,
    projectHref: "/roles/nodal-officer/projects/3",
  },
  {
    id: "nt-106",
    type: "parcel_verification_completed",
    title: "Parcel verification completed",
    description: "Candidate parcels were validated and approved for acquisition review by the monitoring unit.",
    projectName: "Ghaziabad Industrial Access Road",
    projectId: "BhuSetu-2026-207",
    actor: { name: "Rajesh Kumar", role: "Land Acquisition Officer" },
    timestamp: "2026-09-05T09:20:00",
    isRead: false,
    projectHref: "/roles/nodal-officer/projects/3",
  },
  {
    id: "nt-107",
    type: "project_on_hold",
    title: "Project paused for review",
    description: "The project was placed on hold pending statutory review and additional evidence submission.",
    projectName: "Meerut Canal Relocation",
    projectId: "BhuSetu-2026-319",
    actor: { name: "Amit Sharma", role: "Nodal Officer" },
    timestamp: "2026-09-05T10:00:00",
    isRead: false,
    projectHref: "/roles/nodal-officer/projects/4",
  },
  {
    id: "nt-108",
    type: "project_resumed",
    title: "Progress resumed after intervention",
    description: "Field work resumed after nodal review clarified pending documentation and process blockers.",
    projectName: "Meerut Canal Relocation",
    projectId: "BhuSetu-2026-319",
    actor: { name: "Mohd Saqib", role: "Project Officer" },
    timestamp: "2026-09-05T10:35:00",
    isRead: true,
    projectHref: "/roles/nodal-officer/projects/4",
  },
  {
    id: "nt-109",
    type: "remark_added",
    title: "Monitoring remark added",
    description: "A field remark was recorded for enhanced verification and coordinated escalation handling.",
    projectName: "Noida Flyover Utility Relocation",
    projectId: "BhuSetu-2026-404",
    actor: { name: "Rajesh Kumar", role: "Land Acquisition Officer" },
    timestamp: "2026-09-05T11:10:00",
    isRead: false,
    projectHref: "/roles/nodal-officer/projects/5",
  },
  {
    id: "nt-110",
    type: "status_changed",
    title: "District risk updated",
    description: "The district monitoring view shows increased acquisition risk due to delayed documentation and approvals.",
    projectName: "Noida Flyover Utility Relocation",
    projectId: "BhuSetu-2026-404",
    actor: { name: "BhuSetu", role: "System" },
    timestamp: "2026-09-05T11:40:00",
    isRead: true,
    projectHref: "/roles/nodal-officer/projects/5",
  },
  {
    id: "nt-111",
    type: "officer_intervention",
    title: "Escalation action recorded",
    description: "A cross-department intervention was logged to resolve blocked utility relocation activities.",
    projectName: "Bulandshahr Ring Road Expansion",
    projectId: "BhuSetu-2026-511",
    actor: { name: "Amit Sharma", role: "Nodal Officer" },
    timestamp: "2026-09-06T09:20:00",
    isRead: false,
    projectHref: "/roles/nodal-officer/projects/6",
  },
  {
    id: "nt-112",
    type: "project_completed",
    title: "Closure milestone completed",
    description: "The project reached closure after successful handoff and final compliance verification.",
    projectName: "Yamuna Flood Protection Works",
    projectId: "BhuSetu-2026-602",
    actor: { name: "Mohd Saqib", role: "Project Officer" },
    timestamp: "2026-09-06T16:45:00",
    isRead: true,
    projectHref: "/roles/nodal-officer/projects/7",
  },
  {
    id: "nt-113",
    type: "risk_assessment_updated",
    title: "Portfolio trend updated",
    description: "Risk analytics indicate a stable decline in several monitored projects after intervention activity.",
    projectName: "Yamuna Flood Protection Works",
    projectId: "BhuSetu-2026-602",
    actor: { name: "BhuSetu", role: "System" },
    timestamp: "2026-09-06T17:30:00",
    isRead: false,
    projectHref: "/roles/nodal-officer/projects/7",
  },
];

const notificationIcons = {
  project_created: PlusCircle,
  project_submitted: Send,
  lao_assigned: UserCheck,
  lao_changed: UserCheck,
  status_changed: FolderKanban,
  parcel_verification_completed: ClipboardCheck,
  acquisition_data_updated: FileText,
  document_uploaded: FileText,
  document_approved: BadgeCheck,
  document_rejected: ShieldAlert,
  remark_added: MessageSquare,
  officer_intervention: Activity,
  project_on_hold: PauseCircle,
  project_resumed: PlayCircle,
  project_completed: CheckCircle2,
  project_information_updated: FolderKanban,
  risk_assessment_updated: Bell,
};

const notificationColors = {
  project_created: "border-sky-200 bg-sky-50 text-sky-700",
  project_submitted: "border-indigo-200 bg-indigo-50 text-indigo-700",
  lao_assigned: "border-amber-200 bg-amber-50 text-amber-700",
  lao_changed: "border-amber-200 bg-amber-50 text-amber-700",
  status_changed: "border-violet-200 bg-violet-50 text-violet-700",
  parcel_verification_completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  acquisition_data_updated: "border-cyan-200 bg-cyan-50 text-cyan-700",
  document_uploaded: "border-slate-200 bg-slate-100 text-slate-700",
  document_approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  document_rejected: "border-red-200 bg-red-50 text-red-700",
  remark_added: "border-orange-200 bg-orange-50 text-orange-700",
  officer_intervention: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700",
  project_on_hold: "border-stone-200 bg-stone-100 text-stone-700",
  project_resumed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  project_completed: "border-green-200 bg-green-50 text-green-700",
  project_information_updated: "border-slate-200 bg-slate-100 text-slate-700",
  risk_assessment_updated: "border-blue-200 bg-blue-50 text-blue-700",
};

const formatDateTime = (value) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

function EmptyState({ onClear }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500">
        <Bell className="h-6 w-6" />
      </div>
      <h3 className="mt-5 text-xl font-semibold text-slate-900">No notifications found</h3>
      <p className="mt-2 text-sm text-slate-500">There are no notifications matching the current filters.</p>
      <button
        type="button"
        onClick={onClear}
        className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
      >
        <X className="h-4 w-4" />
        Clear Filters
      </button>
    </div>
  );
}

export default function Page() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return notifications.filter((notification) => {
      const matchesFilter = filter === "all" || !notification.isRead;
      const matchesSearch =
        !normalizedQuery ||
        [
          notification.title,
          notification.description,
          notification.projectName,
          notification.projectId,
          notification.actor.name,
          notification.actor.role,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesFilter && matchesSearch;
    });
  }, [filter, notifications, searchQuery]);

  const markAsRead = (id) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, isRead: true }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications((current) => current.filter((notification) => notification.id !== id));
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFilter("all");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Header title="Notifications" />

      <main className="mx-auto max-w-7xl px-4 pb-12 pt-4 sm:px-6 lg:px-8">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Activity center</p>
              <h1 className="mt-1.5 text-xl font-semibold tracking-tight text-slate-900">Project notifications</h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                <Bell className="h-3.5 w-3.5 text-slate-600" />
                {unreadCount} unread
              </div>
              <button
                type="button"
                onClick={markAllAsRead}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark All as Read
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search notifications"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-200"
                aria-label="Search notifications"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {[
                { value: "all", label: "All" },
                { value: "unread", label: "Unread" },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFilter(item.value)}
                  className={`inline-flex items-center rounded-full border px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] transition ${
                    filter === item.value
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                  aria-pressed={filter === item.value}
                >
                  {item.label}
                </button>
              ))}

              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
              >
                <X className="h-3.5 w-3.5" />
                Clear
              </button>
            </div>
          </div>
        </section>

        <section className="mt-4 space-y-3">
          {filteredNotifications.length === 0 ? (
            <EmptyState onClear={clearFilters} />
          ) : (
            filteredNotifications.map((notification) => {
              const Icon = notificationIcons[notification.type] || Bell;
              const accentClass = notificationColors[notification.type] || "border-slate-200 bg-slate-100 text-slate-700";

              return (
                <article
                  key={notification.id}
                  className={`rounded-xl  p-2.5 shadow-sm hover:shadow-lg hover:-translate-y-1 cursor-pointer transition sm:p-3 ${
                    notification.isRead ? "border-slate-200 bg-white" : "border-slate-300 bg-slate-50"
                  } ${accentClass}`}
                >
                  <div className="flex flex-col gap-2.5 lg:grid lg:grid-cols-[minmax(0,1fr)_220px] lg:items-start">
                    <div className="flex min-w-0 items-start gap-2.5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm">
                        <Icon className="h-3.5 w-3.5" />
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h2 className="text-sm font-semibold text-slate-900">{notification.title}</h2>
                          {!notification.isRead ? (
                            <span className="rounded-full border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-blue-700">
                              New
                            </span>
                          ) : null}
                        </div>

                        <p className="mt-1 text-xs leading-5 text-slate-600">{notification.description}</p>

                        <div className="mt-2 text-[11px] text-slate-600">
                          <div className="min-w-0">
                            <span className="block truncate font-medium text-slate-800">{notification.projectName}</span>
                            <span className="block text-slate-500">{notification.projectId}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex w-full shrink-0 flex-col items-start gap-1.5 lg:w-56 lg:items-end">
                      <div className="w-full text-[10px] text-slate-500 lg:text-right">
                        <span className="font-medium text-slate-700">{notification.actor.name}</span> · {notification.actor.role}
                      </div>

                      <div className="w-full text-[10px] font-medium text-slate-500 lg:text-right">
                        {formatDateTime(notification.timestamp)}
                      </div>

                      <div className="mt-1 flex w-full items-center justify-start gap-1.5 lg:justify-end">
                        {notification.projectHref ? (
                          <Link
                            href={notification.projectHref}
                            className="inline-flex items-center justify-center gap-1 rounded-md bg-slate-900 px-2 py-1.5 text-[10px] font-medium text-white transition hover:bg-slate-800"
                          >
                            View
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        ) : null}

                        <button
                          type="button"
                          onClick={() => markAsRead(notification.id)}
                          disabled={notification.isRead}
                          className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-medium transition ${
                            notification.isRead
                              ? "cursor-default border-slate-200 bg-slate-100 text-slate-500"
                              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          {notification.isRead ? <CheckCircle2 className="h-3 w-3" /> : <CheckCheck className="h-3 w-3" />}
                          {notification.isRead ? "Read" : "Mark"}
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteNotification(notification.id)}
                          className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-medium text-red-700 transition hover:bg-red-100"
                          aria-label={`Delete notification: ${notification.title}`}
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </section>
      </main>
    </div>
  );
}