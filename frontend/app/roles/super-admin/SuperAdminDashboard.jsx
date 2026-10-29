"use client";

import Link from "next/link";
import { Activity, AlertTriangle, ArrowRight, CheckCircle2, FolderKanban, Globe2, MapPinned, ShieldAlert, ShieldCheck, Users } from "lucide-react";
import { getSuperAdminState, subscribeToSuperAdminState } from "./superAdminStore";
import { useEffect, useMemo, useState } from "react";
import "../nodal-officer/dashboard/page.css";
import styles from "./superAdmin.module.css";
import { Header } from "@/app/component/layout/index";
const getCategory = (project) => {
    const status = project.workflowStatus || project.status;
    if (status === "Verified") return "Verified";
    if (status === "Completed" || status === "Submitted to Super Admin") return "Completed";
    return "Ongoing";
};

const riskColors = { Low: "#22c55e", Medium: "#fbbf24", High: "#f97316", Critical: "#ef4444" };

function KpiCard({ label, value, icon: Icon, tone, note }) {
    return <article className="kpi-card"><div className="kpi-header"><span className="kpi-label">{label}</span><div className="kpi-icon" style={{ background: tone.background, color: tone.color }}><Icon /></div></div><div className="kpi-value-row"><span className="kpi-value">{value}</span><span className="kpi-trend low">{note}</span></div></article>;
}

function Distribution({ projects }) {
    const rows = ["Ongoing", "Completed", "Verified"].map((label) => [label, projects.filter((project) => getCategory(project) === label).length]);
    const total = projects.length || 1;
    const ongoing = (rows[0][1] / total) * 100;
    const completed = ongoing + (rows[1][1] / total) * 100;
    return <section className="dashboard-card"><div className="panel-header"><div><p className="section-kicker">System portfolio</p><h2>Project Status Distribution</h2></div><span className="section-badge">Live</span></div><div className="risk-distribution-wrap"><div className="donut-chart" style={{ background: `conic-gradient(#94a3b8 0 ${ongoing}%, #0ea5e9 ${ongoing}% ${completed}%, #22c55e ${completed}% 100%)` }}><div className="donut-value">{projects.length}</div></div><div className="legend-list">{rows.map(([label, value]) => <div key={label} className="legend-item"><div className="legend-meta"><span className="legend-swatch" style={{ background: label === "Ongoing" ? "#94a3b8" : label === "Completed" ? "#0ea5e9" : "#22c55e" }} />{label}</div><span className="legend-value">{value}</span></div>)}</div></div></section>;
}

function RiskDistribution({ projects }) {
    const rows = ["Low", "Medium", "High", "Critical"].map((label) => [label, projects.filter((project) => project.riskCategory === label).length]);
    const total = projects.length || 1;
    let start = 0;
    const stops = rows.map(([label, value]) => { const end = start + (value / total) * 100; const stop = `${riskColors[label]} ${start}% ${end}%`; start = end; return stop; });
    return <section className="dashboard-card"><div className="panel-header"><div><p className="section-kicker">Portfolio mix</p><h2>Risk Distribution</h2></div><span className="section-badge">All projects</span></div><div className="risk-distribution-wrap"><div className="donut-chart" style={{ background: `conic-gradient(${stops.join(", ")})` }}><div className="donut-value">{projects.filter((project) => ["High", "Critical"].includes(project.riskCategory)).length}</div></div><div className="legend-list">{rows.map(([label, value]) => <div key={label} className="legend-item"><div className="legend-meta"><span className="legend-swatch" style={{ background: riskColors[label] }} />{label}</div><span className="legend-value">{value}</span></div>)}</div></div></section>;
}

function Trend({ projects }) {
    const total = projects.length || 1;
    const values = [projects.filter((project) => getCategory(project) === "Ongoing").length, projects.filter((project) => ["Completed", "Verified"].includes(getCategory(project))).length, projects.filter((project) => getCategory(project) === "Verified").length, projects.filter((project) => getCategory(project) === "Verified").length];
    const points = values.map((value, index) => `${index * 90 + 10},${120 - (value / total) * 90}`).join(" ");
    return <section className="dashboard-card risk-trend-card"><div className="panel-header"><div><p className="section-kicker">Workflow trajectory</p><h2>Project Progress / Verification Trend</h2></div><span className="status-pill trend-up">System-wide</span></div><div className="sparkline-card"><svg className="sparkline" viewBox="0 0 300 140" preserveAspectRatio="none" aria-label="Project verification trend"><line className="sparkline-grid" x1="0" y1="20" x2="300" y2="20" /><line className="sparkline-grid" x1="0" y1="60" x2="300" y2="60" /><line className="sparkline-grid" x1="0" y1="100" x2="300" y2="100" /><polyline className="sparkline-area" points={`10,120 ${points} 280,120`} /><polyline className="sparkline-line" points={points} /></svg></div><div className="trend-summary"><div><div className="alert-meta">Verified projects</div><strong>{values[2]} / {total}</strong></div><span className="status-pill trend-up">{Math.round((values[2] / total) * 100)}% complete</span></div></section>;
}

function Gauge({ label, value, color }) {
    return <div className={styles.gaugeCard}><div className={styles.gauge} style={{ "--gauge-value": `${value * 3.6}deg`, "--gauge-color": color }}><div><strong>{value}%</strong><span>{label}</span></div></div></div>;
}

function RiskOverview({ projects }) {
    const districts = [...new Set(projects.map((project) => project.district))].map((district) => [district, projects.filter((project) => project.district === district && ["High", "Critical"].includes(project.riskCategory)).length]).sort((a, b) => b[1] - a[1]).slice(0, 5);
    return <section className="dashboard-card"><div className="panel-header"><div><p className="section-kicker">Geographic risk</p><h2>District-wise Risk Overview</h2></div><span className="section-badge">Top 5</span></div><div className="delay-list">{districts.map(([district, value]) => <div key={district} className="delay-item"><div className="delay-top"><span>{district}</span><span>{value} high-risk</span></div><div className="delay-bar"><span style={{ width: `${Math.max(5, (value / Math.max(projects.length, 1)) * 100)}%`, background: value > 0 ? "#f97316" : "#22c55e" }} /></div></div>)}</div></section>;
}

function GovernanceKpis({ projects }) {
    return <section className="kpi-grid" aria-label="Governance KPI cards"></section>;
}

export default function SuperAdminDashboard() {
    const [state, setState] = useState(() => getSuperAdminState());
    useEffect(() => subscribeToSuperAdminState(setState), []);
    const rawProjects = state.projects;
    const projectCounts = useMemo(() => ({ ongoing: rawProjects.filter((project) => getCategory(project) === "Ongoing").length, completed: rawProjects.filter((project) => getCategory(project) === "Completed").length, verified: rawProjects.filter((project) => getCategory(project) === "Verified").length, highRisk: rawProjects.filter((project) => ["High", "Critical"].includes(project.riskCategory)).length }), [rawProjects]);
    const projects = Object.assign(rawProjects.slice(), projectCounts);
    const verificationProgress = projects.length ? Math.round(((projectCounts.completed + projectCounts.verified) / projects.length) * 100) : 0;
    const overallRisk = projects.length ? Math.round(projects.reduce((total, project) => total + (project.riskProbability || 0), 0) / projects.length) : 0;
    const highRiskPercentage = projects.length ? Math.round((projectCounts.highRisk / projects.length) * 100) : 0;
    const governanceCounts = {
        admins: state.admins.length,
        users: state.users.length,
        jurisdictions: state.jurisdictions.length,
        activeAssignments: state.assignments.filter((assignment) => assignment.status === "Active").length,
        unassignedProjects: Math.max(0, projects.length - state.assignments.length),
        unreadAlerts: state.notifications.filter((notification) => !notification.read).length,
    };
    Object.assign(projects, governanceCounts);
    return <><Header title="Dashboard"/><div className={`${styles.shell} nodal-dashboard min-h-screen`}>
        <div className="dashboard-shell">
            <header className="dashboard-header"><div><p className="eyebrow">Global Overview</p><h1>Super Admin Dashboard</h1></div><div className="header-meta"><span>Updated just now</span><Link href="/roles/super-admin/projects" className="header-action">Review projects <ArrowRight className="inline h-3.5 w-3.5" /></Link></div></header><section className="kpi-grid" aria-label="System overview KPI cards"><KpiCard label="Total Projects" value={projects.length} icon={FolderKanban} tone={{ background: "linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)", color: "#1d4ed8" }} note="All jurisdictions" /><KpiCard label="Ongoing Projects" value={projects.ongoing} icon={Activity} tone={{ background: "linear-gradient(135deg, #e2e8f0 0%, #f8fafc 100%)", color: "#475569" }} note="In workflow" /><KpiCard label="Completed Projects" value={projects.completed} icon={CheckCircle2} tone={{ background: "linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)", color: "#0284c7" }} note="Awaiting review" /><KpiCard label="Verified Projects" value={projects.verified} icon={ShieldAlert} tone={{ background: "linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%)", color: "#16a34a" }} note="Super Admin" /><KpiCard label="High / Critical Risk" value={projects.highRisk} icon={AlertTriangle} tone={{ background: "linear-gradient(135deg, #fee2e2 0%, #fff1f2 100%)", color: "#dc2626" }} note="Read-only AI" /><KpiCard label="Awaiting Verification" value={projects.completed} icon={Users} tone={{ background: "linear-gradient(135deg, #fef3c7 0%, #fff7ed 100%)", color: "#d97706" }} note="Completed stage" /><KpiCard label="Total Users" value={projects.users} icon={Users} tone={{ background: "linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)", color: "#0369a1" }} note="All roles" /><KpiCard label="Jurisdictions" value={projects.jurisdictions} icon={MapPinned} tone={{ background: "linear-gradient(135deg, #f1f5f9 0%, #ffffff 100%)", color: "#475569" }} note="Managed areas" /><KpiCard label="Active Assignments" value={projects.activeAssignments} icon={Globe2} tone={{ background: "linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%)", color: "#15803d" }} note="Current allocation" /><KpiCard label="Unassigned Projects" value={projects.unassignedProjects} icon={FolderKanban} tone={{ background: "linear-gradient(135deg, #ffedd5 0%, #fff7ed 100%)", color: "#c2410c" }} note="Needs assignment" /></section><GovernanceKpis projects={governanceCounts} /><div className="dashboard-grid"><Distribution projects={projects} /><RiskDistribution projects={projects} /><Trend projects={projects} /><RiskOverview projects={projects} /><section className="dashboard-card dashboard-card--wide"><div className="panel-header"><div><p className="section-kicker">System gauges</p><h2>Governance Health</h2></div><span className="section-badge">Read-only AI</span></div><div className={styles.gaugeGrid}><Gauge label="Overall project risk" value={overallRisk} color="#f97316" /><Gauge label="Completion progress" value={verificationProgress} color="#0ea5e9" /><Gauge label="High-risk percentage" value={highRiskPercentage} color="#ef4444" /></div></section></div></div></div></>;
}
