"use client";

import { useEffect, useMemo, useState } from "react";
import {
    Activity, AlertCircle, BadgeCheck, BriefcaseBusiness, Building2, CheckCircle2,
    Eye, KeyRound, Mail, MapPin, MapPinned, MoreVertical, Phone, Plus, Search,
    ShieldCheck, UserRound, Users, X,
} from "lucide-react";
import { Header } from "../../../component/layout/index";
import { PROJECTS } from "../../project-officer/my-project/projects-data";
import {
    ROLE_OPTIONS, STATUS_OPTIONS, canManageUser, getAdminProfile, normalizeUser,
    readOrSeedUsers, recordAdminActivity, saveUsers,
} from "../../../lib/adminManagementStore";

const emptyUser = { id: "", name: "", employeeId: "", email: "", phone: "", role: "Project Officer", status: "Active", department: "", state: "Delhi", district: "", jurisdiction: "District Level", assignedProjects: [], permissions: [] };
const roleTone = { "Project Officer": "bg-sky-50 text-sky-700", "Land Acquisition Officer": "bg-emerald-50 text-emerald-700", "Nodal Officer": "bg-violet-50 text-violet-700", "System Admin": "bg-amber-50 text-amber-700" };
const statusTone = { Active: "bg-emerald-50 text-emerald-700", Inactive: "bg-slate-100 text-slate-600", Pending: "bg-amber-50 text-amber-700", Suspended: "bg-rose-50 text-rose-700" };

function Modal({ title, onClose, children, wide = false }) {
    return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4"><div className={`max-h-[92vh] w-full overflow-y-auto rounded-3xl bg-white shadow-2xl ${wide ? "max-w-3xl" : "max-w-lg"}`}><div className="flex items-center justify-between border-b border-slate-100 p-5"><h2 className="text-lg font-bold text-slate-900">{title}</h2><button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button></div>{children}</div></div>;
}

function UserDetailCard({ icon: Icon, label, children, className = "" }) {
    return <div className={`min-w-0 rounded-xl border border-slate-100 bg-slate-50/70 p-3 ${className}`}><div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500"><Icon className="h-3.5 w-3.5 text-sky-600" />{label}</div><div className="mt-1.5 min-w-0 text-xs font-semibold text-slate-800">{children}</div></div>;
}

function UserDetailsModal({ user, onClose }) {
    const [showAllActivity, setShowAllActivity] = useState(false);
    const activity = user.recentActivity || [];
    const visibleActivity = showAllActivity ? activity : activity.slice(0, 3);

    return <div role="dialog" aria-modal="true" aria-labelledby="user-details-title" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-[2px] sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
        <div className="flex max-h-[calc(100dvh-2rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/70 bg-white shadow-[0_24px_80px_-24px_rgba(15,23,42,0.45)] animate-[admin-modal-in_220ms_cubic-bezier(0.16,1,0.3,1)] motion-reduce:animate-none sm:max-h-[calc(100dvh-15rem)]">
            <header className="admin-modal-header flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 bg-linear-to-r from-sky-50 via-white to-white px-4 py-3 sm:px-5">
                <div className="flex min-w-0 items-center gap-2.5"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-600 text-white shadow-md shadow-sky-200"><UserRound className="h-4 w-4" /></div><div className="min-w-0"><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-sky-700">Account profile</p><h2 id="user-details-title" className="truncate text-lg font-bold tracking-tight text-slate-950">{user.name}</h2><p className="truncate text-[11px] text-slate-500">Identity, access, and assignment overview</p></div></div>
                <button type="button" onClick={onClose} aria-label="Close user details" className="rounded-xl p-2 text-slate-400 transition duration-200 hover:scale-105 hover:bg-white hover:text-slate-700 hover:shadow-sm focus:outline-none focus:ring-4 focus:ring-sky-100 active:scale-95"><X className="h-5 w-5" /></button>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3 sm:px-5 sm:py-4">
                <div className="space-y-3">
                    <section className="admin-modal-section flex flex-col gap-2 rounded-xl border border-sky-100 bg-sky-50/50 p-3 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="text-xs font-bold text-slate-900">{user.employeeId || "Employee ID unavailable"}</p><p className="mt-0.5 truncate text-[11px] text-slate-600">{user.email || "Email unavailable"}</p></div><div className="flex flex-wrap gap-1.5"><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${roleTone[user.role] || "bg-slate-100 text-slate-600"}`}>{user.role || "Unassigned role"}</span><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${statusTone[user.status] || "bg-slate-100 text-slate-600"}`}>{user.status || "Unknown status"}</span></div></section>
                    <div className="grid gap-3 lg:grid-cols-2">
                        <section className="admin-modal-section"><div className="mb-1.5 flex items-center gap-1.5"><BadgeCheck className="h-3.5 w-3.5 text-sky-600" /><h3 className="text-xs font-bold text-slate-900">Profile & access</h3></div><div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2"><UserDetailCard icon={Mail} label="Email"><span className="block truncate" title={user.email}>{user.email || "Not recorded"}</span></UserDetailCard><UserDetailCard icon={Phone} label="Phone"><span className="block truncate">{user.phone || "Not recorded"}</span></UserDetailCard><UserDetailCard icon={Building2} label="Department"><span className="block truncate">{user.department || "Not assigned"}</span></UserDetailCard><UserDetailCard icon={Activity} label="Last login">{user.lastLogin || "Not recorded"}</UserDetailCard></div></section>
                        <section className="admin-modal-section"><div className="mb-1.5 flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-sky-600" /><h3 className="text-xs font-bold text-slate-900">Account security</h3></div><div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2"><UserDetailCard icon={UserRound} label="Username"><span className="block truncate" title={user.username}>{user.username || user.email || "Not recorded"}</span></UserDetailCard><UserDetailCard icon={KeyRound} label="Password"><span className="font-mono tracking-widest">••••••••</span><span className="ml-2 text-[10px] font-normal text-slate-500">{user.passwordResetAt ? "Reset requested" : "Protected"}</span></UserDetailCard></div></section>
                        <section className="admin-modal-section lg:col-span-2"><div className="mb-1.5 flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-sky-600" /><h3 className="text-xs font-bold text-slate-900">Jurisdiction</h3></div><div className="grid gap-1.5 sm:grid-cols-2"><UserDetailCard icon={MapPin} label="Coverage area"><span className="block truncate">{[user.state, user.district || "Unassigned"].filter(Boolean).join(" · ") || "Not assigned"}</span></UserDetailCard><UserDetailCard icon={ShieldCheck} label="Jurisdiction level"><span className="inline-flex rounded-full bg-violet-50 px-2 py-1 text-[11px] font-bold text-violet-700">{user.jurisdiction || "Not assigned"}</span></UserDetailCard></div></section>
                    </div>
                    <section className="admin-modal-section"><div className="mb-1.5 flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-sky-600" /><h3 className="text-xs font-bold text-slate-900">Permissions</h3></div><div className="rounded-xl border border-slate-100 bg-white p-2.5"><div className="flex flex-wrap gap-1.5">{(user.permissions || []).length ? user.permissions.map((permission) => <span key={permission} className="max-w-full truncate rounded-full bg-sky-50 px-2 py-1 text-[10px] font-semibold text-sky-700" title={permission}>{permission}</span>) : <p className="text-xs text-slate-500">No permissions recorded.</p>}</div></div></section>
                    <section className="admin-modal-section"><div className="mb-1.5 flex items-center gap-1.5"><BriefcaseBusiness className="h-3.5 w-3.5 text-sky-600" /><h3 className="text-xs font-bold text-slate-900">Assigned projects <span className="ml-1 text-[10px] font-medium text-slate-400">({(user.assignedProjects || []).length})</span></h3></div><div className="grid gap-1.5 sm:grid-cols-2">{(user.assignedProjects || []).length ? user.assignedProjects.map((project) => <div key={project.id} className="admin-detail-card min-w-0 rounded-xl border border-slate-200 bg-white p-2.5 transition hover:border-sky-200 hover:shadow-sm"><span className="font-mono text-[10px] font-semibold text-slate-400">{project.id}</span><p className="mt-0.5 truncate text-xs font-bold text-slate-800" title={project.title}>{project.title || project.id}</p></div>) : <div className="rounded-xl border border-dashed border-slate-200 p-2.5 text-xs text-slate-500">No projects assigned.</div>}</div></section>
                    <section className="admin-modal-section"><div className="mb-1.5 flex items-center gap-1.5"><Activity className="h-3.5 w-3.5 text-sky-600" /><h3 className="text-xs font-bold text-slate-900">Recent activity</h3></div><div className="space-y-1">{visibleActivity.length ? visibleActivity.map((item, index) => <div key={`${item.title}-${index}`} className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5"><p className="truncate text-xs font-semibold text-slate-800" title={item.title}>{item.title}</p><p className="mt-0.5 wrap-break-word text-[11px] text-slate-500">{item.detail} {item.time ? `· ${item.time}` : ""}</p></div>) : <div className="rounded-xl border border-dashed border-slate-200 p-2.5 text-xs text-slate-500">No recent activity recorded.</div>}</div>{activity.length > 3 ? <button type="button" onClick={() => setShowAllActivity(!showAllActivity)} className="mt-1.5 text-[11px] font-bold text-sky-700 transition hover:text-sky-900 focus:outline-none focus:underline">{showAllActivity ? "Show less activity" : `Show all ${activity.length} activities`}</button> : null}</section>
                </div>
            </div>
            <footer className="admin-modal-footer flex shrink-0 items-center justify-between border-t border-slate-100 bg-slate-50/80 px-4 py-2.5 sm:px-5"><p className="hidden text-[11px] text-slate-500 sm:block">Read-only account overview</p><button type="button" onClick={onClose} className="ml-auto rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-200">Close details</button></footer>
        </div>
    </div>;
}

function Field({ label, value, onChange, required = false, type = "text" }) {
    return <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-700">{label}{required ? " *" : ""}</span><input required={required} type={type} value={value || ""} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100" /></label>;
}

function Select({ label, value, options, onChange }) {
    return <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-700">{label}</span><select value={value || options[0]} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100">{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
}

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [projects] = useState(PROJECTS);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [query, setQuery] = useState("");
    const [filters, setFilters] = useState({ role: "All", status: "All", district: "All" });
    const [menuId, setMenuId] = useState(null);
    const [detailUser, setDetailUser] = useState(null);
    const [editor, setEditor] = useState(null);
    const [confirm, setConfirm] = useState(null);
    const [notice, setNotice] = useState("");

    useEffect(() => {
        readOrSeedUsers().then((next) => { setUsers(next); setProfile(getAdminProfile()); }).catch((loadError) => setError(loadError.message)).finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!detailUser) return undefined;
        const previousOverflow = document.body.style.overflow;
        const onKeyDown = (event) => { if (event.key === "Escape") setDetailUser(null); };
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", onKeyDown);
        return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", onKeyDown); };
    }, [detailUser]);

    const districts = useMemo(() => ["All", ...new Set(users.map((user) => user.district).filter(Boolean))], [users]);
    const visibleUsers = useMemo(() => users.filter((user) => {
        const haystack = [user.name, user.employeeId, user.email, user.role, user.district, user.department].join(" ").toLowerCase();
        return haystack.includes(query.toLowerCase()) && (filters.role === "All" || user.role === filters.role) && (filters.status === "All" || user.status === filters.status) && (filters.district === "All" || user.district === filters.district);
    }), [users, query, filters]);
    const manageable = (user) => canManageUser(profile, user);

    const persist = (next, action, target) => {
        const normalized = next.map(normalizeUser);
        setUsers(normalized); saveUsers(normalized); recordAdminActivity({ action, module: "Users", target }); setNotice(`${action} completed.`); setMenuId(null);
    };

    const saveEditor = (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const data = Object.fromEntries(form.entries());
        if (!data.name.trim() || !data.email.trim() || !data.employeeId.trim()) { setError("Name, employee ID, and email are required."); return; }
        if (editor.mode === "edit" && !manageable(editor.user)) { setError("You cannot modify a user outside your authorized jurisdiction."); return; }
        const assignedProjects = String(data.assignedProjectIds || "").split(",").map((id) => id.trim()).filter(Boolean).map((id) => { const project = projects.find((entry) => project.projectId === id || String(entry.id) === id); return { id, title: project?.name || id }; });
        const nextUser = normalizeUser({ ...editor.user, ...data, assignedProjects, permissions: data.permissions.split(",").map((item) => item.trim()).filter(Boolean), account: editor.user?.account });
        const next = editor.mode === "edit" ? users.map((user) => user.id === editor.user.id ? nextUser : user) : [...users, { ...nextUser, id: nextUser.id || `USR-${Date.now()}`, account: { createdAt: new Date().toISOString().slice(0, 10), securityLevel: "Standard" } }];
        persist(next, editor.mode === "edit" ? "User updated" : "User created", nextUser.name); setEditor(null); setError("");
    };

    const toggleStatus = (user) => { if (!manageable(user)) { setError("You cannot modify a user outside your authorized jurisdiction."); return; } const nextStatus = user.status === "Active" ? "Inactive" : "Active"; setConfirm({ title: `${nextStatus} user?`, message: `Change ${user.name} to ${nextStatus}?`, onConfirm: () => { persist(users.map((entry) => entry.id === user.id ? { ...entry, status: nextStatus } : entry), `User ${nextStatus.toLowerCase()}`, user.name); setConfirm(null); } }); };
    const resetPassword = (user) => { if (!manageable(user)) { setError("You cannot modify a user outside your authorized jurisdiction."); return; } setConfirm({ title: "Reset password?", message: `Reset the password for ${user.name}?`, onConfirm: () => { persist(users.map((entry) => entry.id === user.id ? { ...entry, passwordResetAt: new Date().toISOString(), securityNote: "Password reset requested by administrator." } : entry), "Password reset", user.name); setConfirm(null); } }); };

    if (loading) return <><Header title="Users" /><main className="min-h-screen bg-slate-50 p-12 text-center text-sm text-slate-500">Loading user records...</main></>;
    if (error && !users.length) return <><Header title="Users" /><main className="min-h-screen bg-slate-50 p-8"><div className="mx-auto max-w-lg rounded-3xl border border-rose-200 bg-white p-8 text-center"><AlertCircle className="mx-auto h-9 w-9 text-rose-500" /><h1 className="mt-3 text-lg font-bold">Unable to load users</h1><p className="mt-2 text-sm text-slate-600">{error}</p></div></main></>;

    return <>
        <Header title="Users" />
        <main className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#eef4fb_100%)] px-4 py-6 text-slate-800 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl space-y-5">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-600">Administration</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">User directory</h1><p className="mt-2 text-sm text-slate-500">Manage identities, roles, access scope, and project ownership from one controlled register.</p></div><button type="button" onClick={() => setEditor({ mode: "create", user: emptyUser })} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"><Plus className="h-4 w-4" />Add user</button></div></section>
            {error ? <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{error}</div> : null}{notice ? <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"><CheckCircle2 className="h-4 w-4" />{notice}</div> : null}
            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[["Total users", users.length, Users], ["Active", users.filter((user) => user.status === "Active").length, CheckCircle2], ["Pending", users.filter((user) => user.status === "Pending").length, ShieldCheck], ["Visible scope", visibleUsers.length, MapPinned]].map(([label, value, Icon]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold text-slate-950">{value}</p></div><Icon className="h-5 w-5 text-sky-600" /></div></div>)}</section>
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex flex-col gap-3 lg:flex-row"><label className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, employee ID, role, department..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-sky-400" /></label>{[["role", "Role", ROLE_OPTIONS], ["status", "Status", STATUS_OPTIONS], ["district", "District", districts]].map(([key, label, options]) => <select key={key} aria-label={label} value={filters[key]} onChange={(event) => setFilters({ ...filters, [key]: event.target.value })} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"><option value="All">All {label}s</option>{options.filter((option) => option !== "All").map((option) => <option key={option}>{option}</option>)}</select>)}</div></section>
            <section className="overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-5 py-4"><h2 className="font-bold text-slate-900">Managed accounts</h2><p className="mt-1 text-xs text-slate-500">Only accounts within your authorized jurisdiction can be changed.</p></div>{visibleUsers.length === 0 ? <div className="p-16 text-center text-sm text-slate-500"><UserRound className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-3">No users match these filters.</p></div> : <div className="overflow-x-auto"><table className="min-w-275 w-full text-left text-sm"><thead className="bg-slate-50 text-[10px] uppercase tracking-[0.14em] text-slate-500"><tr>{["User", "Role", "Jurisdiction", "Projects", "Status", "Last login", "Actions"].map((heading) => <th key={heading} className="px-5 py-3 font-bold">{heading}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{visibleUsers.map((user) => <tr key={user.id} className="hover:bg-sky-50/30"><td className="px-5 py-4"><p className="font-semibold text-slate-900">{user.name}</p><p className="mt-1 text-xs text-slate-500">{user.employeeId} · {user.email}</p></td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${roleTone[user.role] || "bg-slate-100 text-slate-600"}`}>{user.role}</span></td><td className="px-5 py-4 text-slate-600">{user.district || "Unassigned"}<span className="block text-xs text-slate-400">{user.jurisdiction}</span></td><td className="px-5 py-4 font-semibold text-slate-700">{Array.isArray(user.assignedProjects) ? user.assignedProjects.length : 0}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusTone[user.status] || "bg-slate-100 text-slate-600"}`}>{user.status}</span></td><td className="px-5 py-4 text-xs text-slate-500">{user.lastLogin || "Not recorded"}</td><td className="relative px-5 py-4"><div className="flex items-center gap-1"><button type="button" onClick={() => setDetailUser(user)} className="rounded-lg p-2 text-slate-500 hover:bg-sky-50 hover:text-sky-700" title="View user"><Eye className="h-4 w-4" /></button><button type="button" onClick={() => setMenuId(menuId === user.id ? null : user.id)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" title="User actions"><MoreVertical className="h-4 w-4" /></button></div>{menuId === user.id ? <div className="absolute right-5 top-12 z-20 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"><button type="button" onClick={() => { setEditor({ mode: "edit", user }); setMenuId(null); }} className="block w-full rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-slate-50">Edit profile & access</button><button type="button" onClick={() => toggleStatus(user)} className="block w-full rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-slate-50">{user.status === "Active" ? "Deactivate" : "Activate"}</button><button type="button" onClick={() => resetPassword(user)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-slate-50"><KeyRound className="h-3.5 w-3.5" />Reset password</button></div> : null}</td></tr>)}</tbody></table></div>}</section>
        </div></main>
        {editor ? <Modal title={editor.mode === "edit" ? "Edit user access" : "Add user"} onClose={() => setEditor(null)} wide><form onSubmit={saveEditor} className="space-y-5 p-5"><div className="grid gap-4 sm:grid-cols-2"><Field label="Full name" required value={editor.user.name} onChange={(value) => setEditor({ ...editor, user: { ...editor.user, name: value } })} /><Field label="Employee ID" required value={editor.user.employeeId} onChange={(value) => setEditor({ ...editor, user: { ...editor.user, employeeId: value } })} /><Field label="Email" required type="email" value={editor.user.email} onChange={(value) => setEditor({ ...editor, user: { ...editor.user, email: value } })} /><Field label="Phone" value={editor.user.phone} onChange={(value) => setEditor({ ...editor, user: { ...editor.user, phone: value } })} /><Field label="Department" required value={editor.user.department} onChange={(value) => setEditor({ ...editor, user: { ...editor.user, department: value } })} /><Select label="Role" value={editor.user.role} options={ROLE_OPTIONS} onChange={(value) => setEditor({ ...editor, user: { ...editor.user, role: value } })} /><Select label="Account status" value={editor.user.status} options={STATUS_OPTIONS} onChange={(value) => setEditor({ ...editor, user: { ...editor.user, status: value } })} /><Field label="State" value={editor.user.state} onChange={(value) => setEditor({ ...editor, user: { ...editor.user, state: value } })} /><Field label="District" value={editor.user.district} onChange={(value) => setEditor({ ...editor, user: { ...editor.user, district: value } })} /><Select label="Jurisdiction level" value={editor.user.jurisdiction} options={["District Level", "Tehsil Level", "State Level", "All States"]} onChange={(value) => setEditor({ ...editor, user: { ...editor.user, jurisdiction: value } })} /><Field label="Assigned project IDs" value={(editor.user.assignedProjects || []).map((project) => project.id || project).join(", ")} onChange={(value) => setEditor({ ...editor, user: { ...editor.user, assignedProjectIds: value } })} /><Field label="Permissions" value={(editor.user.permissions || []).join(", ")} onChange={(value) => setEditor({ ...editor, user: { ...editor.user, permissions: value } })} /></div><div className="flex justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" onClick={() => setEditor(null)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancel</button><button type="submit" className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white">Save user</button></div></form></Modal> : null}
        {detailUser ? <UserDetailsModal user={detailUser} onClose={() => setDetailUser(null)} /> : null}
        {confirm ? <Modal title={confirm.title} onClose={() => setConfirm(null)}><div className="p-5"><p className="text-sm text-slate-600">{confirm.message}</p><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setConfirm(null)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancel</button><button type="button" onClick={confirm.onConfirm} className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white">Confirm</button></div></div></Modal> : null}
    </>;
}
