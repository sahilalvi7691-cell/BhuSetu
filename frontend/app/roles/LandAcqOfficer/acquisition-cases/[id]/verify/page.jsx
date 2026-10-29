"use client";

import React from "react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  FileText,
  LandPlot,
  Map,
  MessageSquareWarning,
  Send,
} from "lucide-react";
import { Header } from "../../../../../component/layout";
import { PROJECTS } from "../../../assigned-projects/projects-data";

const checks = [
  { id: "project", label: "Verify Project Information", description: "Confirm project identity, agency, location, and scope.", icon: FileText },
  { id: "parcels", label: "Verify Parcels", description: "Review candidate parcels, ownership, and land area.", icon: LandPlot },
  { id: "map", label: "Review Land Map", description: "Inspect the required area and acquisition overlays.", icon: Map },
  { id: "documents", label: "Review Documents", description: "Check the submitted proposal and land requirement records.", icon: FileText },
];

export default function VerificationPage({ params }) {
  const { id } = React.use(params);
  const router = useRouter();
  const project = PROJECTS.find((item) => String(item.projectId) === String(id) || String(item.id) === String(id)) || PROJECTS[0];
  const [completed, setCompleted] = useState([]);
  const [issue, setIssue] = useState("");
  const [issueRaised, setIssueRaised] = useState(false);
  const [outcome, setOutcome] = useState(null);

  const allChecksCompleted = completed.length === checks.length;
  const workflowStatus = outcome || (allChecksCompleted ? "All Checks Completed" : completed.length ? "Verification In Progress" : "Pending Verification");
  const progress = useMemo(() => Math.round((completed.length / checks.length) * 100), [completed.length]);

  const toggleCheck = (checkId) => {
    setCompleted((current) => current.includes(checkId) ? current.filter((idValue) => idValue !== checkId) : [...current, checkId]);
    setOutcome(null);
  };

  const submitOutcome = (value) => {
    if (value === "Verified" && !allChecksCompleted) return;
    if (value === "Verified") {
      window.localStorage.setItem(`BhuSetu-verification:${project.projectId}`, value);
      router.push(`/roles/LandAcqOfficer/my-project/${project.id}`);
      return;
    }
    setOutcome(value);
  };

  return (
    <>
      <Header title="Verification Workflow" />
      <main className="page-shell">
        <div className="page-container">
          <Link href={`/roles/LandAcqOfficer/my-project/${project.id}`} className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"><ArrowLeft className="h-4 w-4" /> Back to project</Link>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Assigned project</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{project.name}</h1><p className="mt-1 text-sm text-slate-500">{project.projectId} · {project.village}, {project.district}</p></div><span className={`inline-flex w-fit rounded-full px-3 py-1.5 text-sm font-semibold ${outcome ? "bg-emerald-50 text-emerald-700" : allChecksCompleted ? "bg-sky-50 text-sky-700" : completed.length ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-700"}`}>{workflowStatus}</span></div>
            <div className="mt-6"><div className="mb-2 flex justify-between text-xs font-semibold text-slate-500"><span>Verification progress</span><span>{progress}%</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-sky-600 transition-all" style={{ width: `${progress}%` }} /></div></div>
          </section>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="mb-5"><h2 className="text-lg font-bold text-slate-900">Verification checklist</h2><p className="mt-1 text-sm text-slate-500">Complete every check before submitting a verified report.</p></div><div className="space-y-3">{checks.map(({ id: checkId, label, description, icon: Icon }) => { const isComplete = completed.includes(checkId); return <div key={checkId} className={`flex items-start gap-3 rounded-xl border p-4 transition ${isComplete ? "border-emerald-200 bg-emerald-50/60" : "border-slate-200 bg-white"}`}><button type="button" onClick={() => toggleCheck(checkId)} aria-label={`${isComplete ? "Undo" : "Complete"} ${label}`} className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${isComplete ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300 text-transparent hover:border-sky-500"}`}><Check className="h-4 w-4" /></button><Icon className={`mt-0.5 h-5 w-5 shrink-0 ${isComplete ? "text-emerald-600" : "text-slate-500"}`} /><div className="min-w-0"><p className="font-semibold text-slate-800">{label}</p><p className="mt-1 text-sm leading-5 text-slate-500">{description}</p></div>{isComplete && <CheckCircle2 className="ml-auto h-5 w-5 shrink-0 text-emerald-600" />}</div>; })}</div><div className="mt-5 grid gap-3 sm:grid-cols-2"><Link href={`/roles/LandAcqOfficer/gis?project=${project.id}`} className="inline-flex items-center justify-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700 hover:bg-sky-100"><Map className="h-4 w-4" /> Open land map</Link><Link href={`/roles/LandAcqOfficer/parcels/${project.projectId}`} className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"><LandPlot className="h-4 w-4" /> Verify parcels</Link></div></section>

            <aside className="space-y-6"><section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm"><div className="flex items-center gap-2"><MessageSquareWarning className="h-5 w-5 text-amber-700" /><h2 className="font-bold text-amber-900">Raise an issue</h2></div><p className="mt-2 text-sm leading-6 text-amber-800">Record a discrepancy if project information, parcels, maps, or documents need correction.</p><textarea value={issue} onChange={(event) => setIssue(event.target.value)} placeholder="Describe the issue..." rows={4} className="mt-4 w-full rounded-xl border border-amber-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-amber-200" /><button type="button" disabled={!issue.trim()} onClick={() => setIssueRaised(true)} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-3 text-sm font-semibold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"><AlertTriangle className="h-4 w-4" /> {issueRaised ? "Issue recorded" : "Raise issue"}</button></section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-bold text-slate-900">Submit verification report</h2><p className="mt-1 text-sm leading-6 text-slate-500">Choose the final result after reviewing all submitted information.</p><div className="mt-4 space-y-2"><button type="button" disabled={!allChecksCompleted} onClick={() => submitOutcome("Verified")} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"><Send className="h-4 w-4" /> Verified</button><button type="button" onClick={() => submitOutcome("Sent Back")} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Sent Back</button><button type="button" onClick={() => submitOutcome("Requires Correction")} className="w-full rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 hover:bg-rose-100">Requires Correction</button></div>{!allChecksCompleted && <p className="mt-3 text-xs text-slate-500">Complete all checklist items to enable Verified.</p>}{outcome && <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">Report status: {outcome}</p>}</section></aside>
          </div>
        </div>
      </main>
    </>
  );
}