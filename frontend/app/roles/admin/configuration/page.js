"use client";

import { useEffect, useMemo, useState } from "react";
import {
	Bell,
	Check,
	ChevronDown,
	CircleAlert,
	Clock3,
	Layers3,
	LoaderCircle,
	LockKeyhole,
	MapPinned,
	RotateCcw,
	Save,
	Settings2,
	ShieldCheck,
	Sparkles,
} from "lucide-react";
import { Header } from "../../../component/layout/index";

const STORAGE_KEY = "BhuSetuAdminConfiguration";

const DEFAULT_CONFIG = {
	general: {
		applicationName: "BhuSetu",
		departmentName: "Land Acquisition & Planning Division",
		language: "English",
		dateFormat: "DD MMM YYYY",
		timeFormat: "12-hour",
		compactTables: false,
		showBreadcrumbs: true,
	},
	project: {
		projectTypes: "Highway, Irrigation, Rail, Urban Development",
		projectStatuses: "Draft, Active, On Hold, Completed, Archived",
		acquisitionStages: "Planning, Notification, Survey, Award, Possession",
		caseStatuses: "Open, Under Review, Approved, Disputed, Closed",
		documentTypes: "Notification, Survey Report, Award, Possession Memo",
		approvalStages: "Project Officer, Nodal Officer, Administrator",
	},
	notifications: {
		assignmentAlerts: true,
		gisAlerts: true,
		systemAlerts: true,
		securityAlerts: true,
		inAppEnabled: true,
		emailEnabled: true,
	},
	gis: {
		defaultMapView: "State",
		mapLayers: "Projects, Boundaries, Districts, Tehsils",
		gisAvailability: "Available, Partial, Not Available",
		mapProvider: "OpenStreetMap",
		showScale: true,
		rememberLastView: true,
	},
	security: {
		sessionTimeout: "30",
		passwordMinLength: "10",
		passwordExpiry: "90",
		maxLoginAttempts: "5",
		lockoutDuration: "15",
		requireMfa: false,
		notifyFailedLogins: true,
	},
	ai: {
		riskLabels: "Low, Moderate, High, Critical",
		displayMode: "Category and confidence",
		modelName: "BhuSetu Risk Intelligence",
		modelVersion: "v1.0",
		showConfidence: true,
		showModelVersion: true,
	},
};

const cloneConfig = (value) => JSON.parse(JSON.stringify(value));

const mergeConfig = (saved) => {
	const current = cloneConfig(DEFAULT_CONFIG);
	Object.keys(current).forEach((section) => {
		if (saved?.[section] && typeof saved[section] === "object") {
			current[section] = { ...current[section], ...saved[section] };
		}
	});
	return current;
};

function Field({ label, value, onChange, error, hint, type = "text" }) {
	return (
		<label className="block">
			<span className="mb-1.5 block text-xs font-semibold text-slate-700">{label}</span>
			<input
				type={type}
				value={value}
				onChange={(event) => onChange(event.target.value)}
				className={`w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-4 focus:ring-slate-900/5 ${
					error ? "border-rose-300" : "border-slate-200"
				}`}
			/>
			{error ? <span className="mt-1 block text-[11px] text-rose-600">{error}</span> : hint ? <span className="mt-1 block text-[11px] text-slate-500">{hint}</span> : null}
		</label>
	);
}

function SelectField({ label, value, options, onChange, hint }) {
	return (
		<label className="block">
			<span className="mb-1.5 block text-xs font-semibold text-slate-700">{label}</span>
			<span className="relative block">
				<select
					value={value}
					onChange={(event) => onChange(event.target.value)}
					className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-9 text-sm text-slate-800 outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-900/5"
				>
					{options.map((option) => <option key={option} value={option}>{option}</option>)}
				</select>
				<ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
			</span>
			{hint ? <span className="mt-1 block text-[11px] text-slate-500">{hint}</span> : null}
		</label>
	);
}

function Toggle({ label, checked, onChange, description }) {
	return (
		<div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5">
			<div>
				<p className="text-sm font-medium text-slate-800">{label}</p>
				{description ? <p className="mt-0.5 text-[11px] text-slate-500">{description}</p> : null}
			</div>
			<button
				type="button"
				role="switch"
				aria-checked={checked}
				aria-label={label}
				onClick={() => onChange(!checked)}
				className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-slate-900" : "bg-slate-300"}`}
			>
				<span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${checked ? "left-6" : "left-1"}`} />
			</button>
		</div>
	);
}

function SectionCard({ icon: Icon, eyebrow, title, description, children }) {
	return (
		<section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
			<div className="flex items-start gap-3 border-b border-slate-100 pb-4">
				<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700"><Icon className="h-5 w-5" /></div>
				<div>
					<p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">{eyebrow}</p>
					<h2 className="mt-1 text-base font-semibold text-slate-950">{title}</h2>
					<p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
				</div>
			</div>
			<div className="mt-5">{children}</div>
		</section>
	);
}

export default function ConfigurationPage() {
	const [config, setConfig] = useState(() => cloneConfig(DEFAULT_CONFIG));
	const [savedConfig, setSavedConfig] = useState(() => cloneConfig(DEFAULT_CONFIG));
	const [profile, setProfile] = useState(null);
	const [loadState, setLoadState] = useState("loading");
	const [loadError, setLoadError] = useState("");
	const [errors, setErrors] = useState({});
	const [notice, setNotice] = useState("");
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		let cancelled = false;

		async function loadConfiguration() {
			try {
				const profileResponse = await fetch("/data/profiles.json");
				const storedConfigText = window.localStorage.getItem(STORAGE_KEY);
				if (!profileResponse.ok) throw new Error("Profile data could not be loaded.");
				const profiles = await profileResponse.json();
				const storedProfileText = window.localStorage.getItem("adminProfile") || window.localStorage.getItem("currentProfile") || window.localStorage.getItem("selectedProfile");
				let activeProfile = null;
				if (storedProfileText) {
					try { activeProfile = JSON.parse(storedProfileText); } catch { activeProfile = null; }
				}
				const storedConfig = storedConfigText ? JSON.parse(storedConfigText) : null;
				if (!cancelled) {
					setProfile(activeProfile || profiles.system_admin);
					setConfig(mergeConfig(storedConfig));
					setSavedConfig(mergeConfig(storedConfig));
					setLoadState("ready");
				}
			} catch (error) {
				if (!cancelled) {
					setLoadError(error.message || "Configuration could not be loaded.");
					setLoadState("error");
				}
			}
		}

		loadConfiguration();
		return () => { cancelled = true; };
	}, []);

	const isAdmin = useMemo(() => {
		const role = String(profile?.role || "").toLowerCase();
		return role.includes("admin") || role.includes("administrator");
	}, [profile]);

	const update = (section, key, value) => {
		setConfig((current) => ({ ...current, [section]: { ...current[section], [key]: value } }));
		setErrors((current) => ({ ...current, [`${section}.${key}`]: "" }));
		setNotice("");
	};

	const validate = () => {
		const nextErrors = {};
		if (!config.general.applicationName.trim()) nextErrors["general.applicationName"] = "Application name is required.";
		if (!config.general.departmentName.trim()) nextErrors["general.departmentName"] = "Department name is required.";
		["sessionTimeout", "passwordMinLength", "passwordExpiry", "maxLoginAttempts", "lockoutDuration"].forEach((key) => {
			if (!/^\d+$/.test(String(config.security[key])) || Number(config.security[key]) < 1) nextErrors[`security.${key}`] = "Enter a positive whole number.";
		});
		if (Number(config.security.passwordMinLength) < 8) nextErrors["security.passwordMinLength"] = "Use at least 8 characters.";
		setErrors(nextErrors);
		return Object.keys(nextErrors).length === 0;
	};

	const save = async () => {
		if (!validate()) {
			setNotice("Fix the highlighted settings before saving.");
			return;
		}
		setIsSaving(true);
		try {
			window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
			await new Promise((resolve) => window.setTimeout(resolve, 250));
			setSavedConfig(cloneConfig(config));
			setNotice("Configuration saved successfully.");
		} catch {
			setNotice("Configuration could not be saved. Check browser storage and try again.");
		} finally {
			setIsSaving(false);
		}
	};

	const reset = () => {
		if (!window.confirm("Reset unsaved changes to the last saved configuration?")) return;
		setConfig(cloneConfig(savedConfig));
		setErrors({});
		setNotice("Unsaved changes were reset.");
	};

	if (loadState === "loading") return <><Header title="Configuration" /><div className="flex min-h-[70vh] items-center justify-center bg-slate-50"><LoaderCircle className="h-7 w-7 animate-spin text-slate-500" /></div></>;
	if (loadState === "error") return <><Header title="Configuration" /><div className="min-h-[70vh] bg-slate-50 p-6"><div className="mx-auto max-w-xl rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-sm"><CircleAlert className="mx-auto h-10 w-10 text-rose-500" /><h1 className="mt-3 text-lg font-semibold text-slate-900">Configuration unavailable</h1><p className="mt-2 text-sm text-slate-600">{loadError}</p></div></div></>;
	if (!isAdmin) return <><Header title="Configuration" /><div className="min-h-[70vh] bg-slate-50 p-6"><div className="mx-auto max-w-xl rounded-2xl border border-amber-200 bg-white p-8 text-center shadow-sm"><ShieldCheck className="mx-auto h-10 w-10 text-amber-500" /><h1 className="mt-3 text-lg font-semibold text-slate-900">Administrator access required</h1><p className="mt-2 text-sm text-slate-600">This workspace is limited to System Administrators.</p></div></div></>;

	return (
		<>
			<Header title="Configuration" />
			<main className="min-h-screen bg-slate-50 px-4 pb-28 pt-5 sm:px-6 lg:px-8">
				<div className="mx-auto max-w-7xl">
					<div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-end lg:justify-between">
						<div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">System administration</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">Configuration</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Manage platform preferences and operational reference lists. Changes apply to the admin workspace after saving.</p></div>
						<div className="flex items-center gap-2 text-xs text-slate-500"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Signed in as {profile?.name || "Administrator"}</div>
					</div>
					{notice ? <div className={`mb-5 flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm ${notice.includes("success") || notice.includes("reset") ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-800"}`} role="status"><Check className="h-4 w-4" />{notice}</div> : null}
					<div className="grid gap-5 xl:grid-cols-2">
						<SectionCard icon={Settings2} eyebrow="Workspace" title="General settings" description="Define the identity and everyday display preferences for BhuSetu."><div className="grid gap-4 sm:grid-cols-2"><Field label="Application name" value={config.general.applicationName} onChange={(value) => update("general", "applicationName", value)} error={errors["general.applicationName"]} /><Field label="Department name" value={config.general.departmentName} onChange={(value) => update("general", "departmentName", value)} error={errors["general.departmentName"]} /><SelectField label="Language" value={config.general.language} options={["English", "Hindi"]} onChange={(value) => update("general", "language", value)} /><SelectField label="Date format" value={config.general.dateFormat} options={["DD MMM YYYY", "DD/MM/YYYY", "MM/DD/YYYY"]} onChange={(value) => update("general", "dateFormat", value)} /><SelectField label="Time format" value={config.general.timeFormat} options={["12-hour", "24-hour"]} onChange={(value) => update("general", "timeFormat", value)} /><div className="space-y-2 sm:col-span-2"><Toggle label="Compact tables" description="Use denser rows in administrative tables." checked={config.general.compactTables} onChange={(value) => update("general", "compactTables", value)} /><Toggle label="Show breadcrumbs" description="Keep route context visible in page headers." checked={config.general.showBreadcrumbs} onChange={(value) => update("general", "showBreadcrumbs", value)} /></div></div></SectionCard>
						<SectionCard icon={Layers3} eyebrow="Reference data" title="Project & acquisition settings" description="Maintain controlled values used across project and acquisition workflows."><div className="grid gap-4 sm:grid-cols-2">{[["projectTypes", "Project types"], ["projectStatuses", "Project statuses"], ["acquisitionStages", "Acquisition stages"], ["caseStatuses", "Case statuses"], ["documentTypes", "Document types"], ["approvalStages", "Approval stages"]].map(([key, label]) => <Field key={key} label={label} value={config.project[key]} onChange={(value) => update("project", key, value)} hint="Separate values with commas." />)}</div></SectionCard>
						<SectionCard icon={Bell} eyebrow="Alerts" title="Notification settings" description="Choose which operational and security notifications are enabled."><div className="grid gap-2 sm:grid-cols-2"><Toggle label="Assignment alerts" checked={config.notifications.assignmentAlerts} onChange={(value) => update("notifications", "assignmentAlerts", value)} /><Toggle label="GIS alerts" checked={config.notifications.gisAlerts} onChange={(value) => update("notifications", "gisAlerts", value)} /><Toggle label="System alerts" checked={config.notifications.systemAlerts} onChange={(value) => update("notifications", "systemAlerts", value)} /><Toggle label="Security alerts" checked={config.notifications.securityAlerts} onChange={(value) => update("notifications", "securityAlerts", value)} /><Toggle label="In-app notifications" checked={config.notifications.inAppEnabled} onChange={(value) => update("notifications", "inAppEnabled", value)} /><Toggle label="Email notifications" checked={config.notifications.emailEnabled} onChange={(value) => update("notifications", "emailEnabled", value)} /></div></SectionCard>
						<SectionCard icon={MapPinned} eyebrow="Maps" title="GIS settings" description="Control default map presentation without changing project or risk data."><div className="grid gap-4 sm:grid-cols-2"><SelectField label="Default map view" value={config.gis.defaultMapView} options={["State", "District", "Tehsil"]} onChange={(value) => update("gis", "defaultMapView", value)} /><SelectField label="Map provider" value={config.gis.mapProvider} options={["OpenStreetMap", "Government tiles"]} onChange={(value) => update("gis", "mapProvider", value)} /><Field label="Map layers" value={config.gis.mapLayers} onChange={(value) => update("gis", "mapLayers", value)} hint="Separate layers with commas." /><Field label="GIS availability options" value={config.gis.gisAvailability} onChange={(value) => update("gis", "gisAvailability", value)} hint="Separate values with commas." /><div className="space-y-2 sm:col-span-2"><Toggle label="Show map scale" checked={config.gis.showScale} onChange={(value) => update("gis", "showScale", value)} /><Toggle label="Remember last map view" checked={config.gis.rememberLastView} onChange={(value) => update("gis", "rememberLastView", value)} /></div></div></SectionCard>
						<SectionCard icon={LockKeyhole} eyebrow="Access control" title="Security settings" description="Set session and sign-in guardrails for the administrative application."><div className="grid gap-4 sm:grid-cols-2"><Field label="Session timeout (minutes)" type="number" value={config.security.sessionTimeout} onChange={(value) => update("security", "sessionTimeout", value)} error={errors["security.sessionTimeout"]} /><Field label="Minimum password length" type="number" value={config.security.passwordMinLength} onChange={(value) => update("security", "passwordMinLength", value)} error={errors["security.passwordMinLength"]} /><Field label="Password expiry (days)" type="number" value={config.security.passwordExpiry} onChange={(value) => update("security", "passwordExpiry", value)} error={errors["security.passwordExpiry"]} /><Field label="Maximum login attempts" type="number" value={config.security.maxLoginAttempts} onChange={(value) => update("security", "maxLoginAttempts", value)} error={errors["security.maxLoginAttempts"]} /><Field label="Lockout duration (minutes)" type="number" value={config.security.lockoutDuration} onChange={(value) => update("security", "lockoutDuration", value)} error={errors["security.lockoutDuration"]} /><div className="space-y-2"><Toggle label="Require MFA" checked={config.security.requireMfa} onChange={(value) => update("security", "requireMfa", value)} /><Toggle label="Notify failed logins" checked={config.security.notifyFailedLogins} onChange={(value) => update("security", "notifyFailedLogins", value)} /></div></div></SectionCard>
						<SectionCard icon={Sparkles} eyebrow="Read-only model display" title="AI display settings" description="Present risk labels and model identity. Prediction logic, scores, and model parameters remain unchanged."><div className="grid gap-4 sm:grid-cols-2"><Field label="Risk category labels" value={config.ai.riskLabels} onChange={(value) => update("ai", "riskLabels", value)} hint="Separate labels with commas." /><SelectField label="Risk display preference" value={config.ai.displayMode} options={["Category only", "Category and confidence", "Category, confidence and trend"]} onChange={(value) => update("ai", "displayMode", value)} /><Field label="Model name" value={config.ai.modelName} onChange={(value) => update("ai", "modelName", value)} /><Field label="Model version" value={config.ai.modelVersion} onChange={(value) => update("ai", "modelVersion", value)} /><div className="space-y-2 sm:col-span-2"><Toggle label="Show confidence" checked={config.ai.showConfidence} onChange={(value) => update("ai", "showConfidence", value)} /><Toggle label="Show model version" checked={config.ai.showModelVersion} onChange={(value) => update("ai", "showModelVersion", value)} /></div></div></SectionCard>
					</div>
				</div>
			</main>
			<div className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6 lg:left-64 lg:px-8"><div className="mx-auto flex max-w-7xl flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center"><p className="flex items-center gap-2 text-xs text-slate-500"><Clock3 className="h-4 w-4" /> Changes are local to this browser until connected to the platform settings service.</p><div className="flex gap-2"><button type="button" onClick={reset} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"><RotateCcw className="h-4 w-4" />Reset</button><button type="button" onClick={save} disabled={isSaving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-70">{isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{isSaving ? "Saving..." : "Save changes"}</button></div></div></div>
		</>
	);
}
