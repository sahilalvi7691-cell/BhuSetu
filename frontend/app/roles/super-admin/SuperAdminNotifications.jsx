"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Bell, CheckCheck, CheckCircle2, ShieldAlert, Trash2, UserCheck, X, Settings2, MapPinned } from "lucide-react";
import { Header } from "../../component/layout/index";
import { getSuperAdminState } from "./superAdminStore";

const icons = {
  Assignment: UserCheck,
  GIS: MapPinned,
  Security: ShieldAlert,
  Administration: Settings2,
};

const colors = {
  Assignment: "border-amber-200 bg-amber-50 text-amber-700",
  GIS: "border-cyan-200 bg-cyan-50 text-cyan-700",
  Security: "border-red-200 bg-red-50 text-red-700",
  Administration: "border-sky-200 bg-sky-50 text-sky-700",
};

const formatDateTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  }).format(date);
};

function EmptyState({ onClear }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500"><Bell className="h-6 w-6" /></div><h3 className="mt-5 text-xl font-semibold text-slate-900">No notifications found</h3><p className="mt-2 text-sm text-slate-500">There are no notifications matching the current filters.</p><button type="button" onClick={onClear} className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"><X className="h-4 w-4" />Clear Filters</button></div>;
}

export default function SuperAdminNotifications() {
  const [notifications, setNotifications] = useState(() => getSuperAdminState().notifications.map((item) => ({ ...item, isRead: item.read, description: item.detail, actor: { name: "BhuSetu", role: "System" }, timestamp: item.time, projectHref: item.projectId ? `/roles/super-admin/projects/${item.projectId}` : null })));
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const unreadCount = useMemo(() => notifications.filter((item) => !item.isRead).length, [notifications]);
  const filteredNotifications = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return notifications.filter((item) => {
      const matchesFilter = filter === "all" || !item.isRead;
      const matchesSearch = !query || [item.title, item.description, item.type, item.actor.name, item.actor.role].join(" ").toLowerCase().includes(query);
      return matchesFilter && matchesSearch;
    });
  }, [filter, notifications, searchQuery]);
  const markAsRead = (id) => setNotifications((current) => current.map((item) => item.id === id ? { ...item, isRead: true } : item));
  const markAllAsRead = () => setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
  const clearFilters = () => { setSearchQuery(""); setFilter("all"); };

  return <div className="min-h-screen bg-slate-50 text-slate-800"><Header title="Notifications" /><main className="mx-auto max-w-7xl px-4 pb-12 pt-4 sm:px-6 lg:px-8"><section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><div className="flex flex-col gap-3 border-b border-slate-200 pb-4 xl:flex-row xl:items-center xl:justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Activity center</p><h1 className="mt-1.5 text-xl font-semibold tracking-tight text-slate-900">Administrative notifications</h1></div><div className="flex flex-wrap items-center gap-2"><div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"><Bell className="h-3.5 w-3.5 text-slate-600" />{unreadCount} unread</div><button type="button" onClick={markAllAsRead} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100"><CheckCheck className="h-3.5 w-3.5" />Mark All as Read</button></div></div><div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div className="relative w-full max-w-md"><SearchIcon /><input type="text" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search notifications" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-200" aria-label="Search notifications" /></div><div className="flex flex-wrap items-center gap-2">{[{ value: "all", label: "All" }, { value: "unread", label: "Unread" }].map((item) => <button key={item.value} type="button" onClick={() => setFilter(item.value)} className={`inline-flex items-center rounded-full border px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] transition ${filter === item.value ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"}`}>{item.label}</button>)}<button type="button" onClick={clearFilters} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100"><X className="h-3.5 w-3.5" />Clear</button></div></div></section><section className="mt-4 space-y-3">{filteredNotifications.length === 0 ? <EmptyState onClear={clearFilters} /> : filteredNotifications.map((notification) => { const Icon = icons[notification.type] || Bell; const accent = colors[notification.type] || "border-slate-200 bg-slate-100 text-slate-700"; return <article key={notification.id} className={`rounded-xl border p-2.5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg sm:p-3 ${notification.isRead ? "border-slate-200 bg-white" : "border-slate-300 bg-slate-50"} ${accent}`}><div className="flex flex-col gap-2.5 lg:grid lg:grid-cols-[minmax(0,1fr)_220px] lg:items-start"><div className="flex min-w-0 items-start gap-2.5"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm"><Icon className="h-3.5 w-3.5" /></span><div className="min-w-0"><div className="flex flex-wrap items-center gap-1.5"><h2 className="text-sm font-semibold text-slate-900">{notification.title}</h2>{!notification.isRead ? <span className="rounded-full border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-blue-700">New</span> : null}</div><p className="mt-1 text-xs leading-5 text-slate-600">{notification.description}</p><p className="mt-2 text-[11px] text-slate-500">Administrative activity · {notification.type}</p></div></div><div className="flex w-full shrink-0 flex-col items-start gap-1.5 lg:w-56 lg:items-end"><div className="w-full text-[10px] text-slate-500 lg:text-right"><span className="font-medium text-slate-700">{notification.actor.name}</span> · {notification.actor.role}</div><div className="w-full text-[10px] font-medium text-slate-500 lg:text-right">{formatDateTime(notification.timestamp)}</div><div className="mt-1 flex w-full items-center justify-start gap-1.5 lg:justify-end">{notification.projectHref ? <Link href={notification.projectHref} className="inline-flex items-center justify-center gap-1 rounded-md bg-slate-900 px-2 py-1.5 text-[10px] font-medium text-white transition hover:bg-slate-800">View<ArrowRight className="h-3 w-3" /></Link> : null}<button type="button" onClick={() => markAsRead(notification.id)} disabled={notification.isRead} className={`inline-flex items-center gap-1 rounded-md border px-2 py-1.5 text-[10px] font-medium transition ${notification.isRead ? "cursor-default border-slate-200 bg-slate-100 text-slate-500" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"}`}>{notification.isRead ? <CheckCircle2 className="h-3 w-3" /> : <CheckCheck className="h-3 w-3" />}{notification.isRead ? "Read" : "Mark"}</button><button type="button" onClick={() => setNotifications((current) => current.filter((item) => item.id !== notification.id))} className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2 py-1.5 text-[10px] font-medium text-red-700 transition hover:bg-red-100"><Trash2 className="h-3 w-3" />Delete</button></div></div></div></article>; })}</section></main></div>;
}

function SearchIcon() {
  return <svg className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35m1.35-5.4a6.75 6.75 0 1 1-13.5 0 6.75 6.75 0 0 1 13.5 0Z" /></svg>;
}
