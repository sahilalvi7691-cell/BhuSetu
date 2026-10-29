"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Download,
  FileText,
  LandPlot,
  MapPin,
  Send,
  ShieldCheck,
  Users,
} from "lucide-react";

import { Header } from "@/app/component/layout/index";
import { PROJECTS } from "../../assigned-projects/projects-data";

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

const getReportData = (project) => {
  const parcelCount =
    project.parcelCount || Math.max(12, Math.round(project.requiredLandArea / 4));
  const affectedFamilies =
    project.affectedFamilies || Math.max(18, Math.round(project.requiredLandArea * 1.4));
  const compensation =
    project.compensation ||
    `INR ${(project.requiredLandArea * 2.4).toFixed(1)} crore`;

  return {
    ...project,
    projectId:
      project.projectId || `BH-2026-${String(project.id).padStart(3, "0")}`,
    department: project.department || "NHAI",
    tehsil: project.tehsil || `${project.district} Tehsil`,
    latitude: project.coordinates?.latitude ?? project.latitude,
    longitude: project.coordinates?.longitude ?? project.longitude,
    routeLength:
      project.routeLength ||
      `${Math.max(8, Math.round(project.requiredLandArea / 8))} km`,
    parcelCount,
    affectedFamilies,
    compensation,
    landPurpose:
      project.landPurpose ||
      `Land required for ${project.type.toLowerCase()} infrastructure and associated facilities.`,
    documents: project.documents || [
      "Project proposal",
      "Land requirement statement",
      "GIS alignment map",
    ],
    officerSubmission: {
      submittedBy: "Project Officer",
      submittedOn: project.createdAt,
      proposedArea: `${project.requiredLandArea} ${project.landUnit}`,
      proposedVillages: project.village,
      proposalStatus: project.status,
    },
    laoCollection: {
      surveyDate: project.updatedAt,
      verifiedArea: `${Math.max(
        1,
        project.requiredLandArea - Math.round(project.requiredLandArea * 0.03)
      )} ${project.landUnit}`,
      parcelCount,
      privatelyOwned: Math.round(parcelCount * 0.76),
      governmentOwned: Math.round(parcelCount * 0.16),
      disputedParcels: Math.max(1, Math.round(parcelCount * 0.08)),
      affectedFamilies,
      consentReceived: Math.round(affectedFamilies * 0.72),
      objectionsReceived: Math.max(1, Math.round(affectedFamilies * 0.12)),
      noticeStatus: "Preliminary notice issued",
      titleStatus: "Ownership records under review",
      valuationDate: project.updatedAt,
      valuationBasis: "Circle rate + applicable statutory solatium and benefits",
      compensation,
      verification: "LAO field data collected; nodal review required",
    },
  };
};

function DetailItem({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function Section({ title, subtitle, icon: Icon, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-start gap-3">
        <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export default function ReportDetailsPage({ params }) {
  const { id } = use(params);
  const project = PROJECTS.find((item) => String(item.id) === String(id));
  const report = project ? getReportData(project) : null;
  const [submitted, setSubmitted] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (report) {
      setSubmitted(
        window.localStorage.getItem(
          `BhuSetu-report-submitted:${report.projectId}`
        ) === "true"
      );
    }
  }, [report]);

  const submitReport = () => {
    window.localStorage.setItem(
      `BhuSetu-report-submitted:${report.projectId}`,
      "true"
    );
    setSubmitted(true);
    setNotice("Report submitted to the Nodal Officer.");
    window.setTimeout(() => setNotice(""), 3500);
  };

  if (!report) {
    return (
      <>
        <Header title="LAO Report" />
        <div className="min-h-screen bg-slate-50 p-6">
          <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <AlertTriangle className="mx-auto h-10 w-10 text-red-500" />
            <h1 className="mt-4 text-2xl font-semibold text-slate-900">
              Report not found
            </h1>
            <Link
              href="/roles/LandAcqOfficer/reports"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to reports
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="LAO Project Report" />

      <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-337.5">
          <Link
            href="/roles/LandAcqOfficer/reports"
            className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to all reports
          </Link>

          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  LAO acquisition report · demo record
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                  {report.name}
                </h1>
                <p className="mt-2 text-sm font-medium text-slate-500">
                  {report.projectId} · {report.type} · Last updated {formatDate(report.updatedAt)}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${statusTone[report.status] || statusTone.Draft}`}
                >
                  {report.status}
                </span>
                <button
                  type="button"
                  onClick={submitReport}
                  disabled={submitted}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-emerald-700"
                >
                  {submitted ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {submitted ? "Submitted to Nodal Officer" : "Submit to Nodal Officer"}
                </button>
              </div>
            </div>

            {notice && (
              <div
                role="status"
                className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
              >
                {notice}
              </div>
            )}

            <p className="mt-5 max-w-4xl text-sm leading-6 text-slate-600">
              {report.description}
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Section
              title="Project Officer submission"
              subtitle="All project details received from the Project Officer."
              icon={FileText}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <DetailItem label="Project ID" value={report.projectId} />
                <DetailItem label="Project name" value={report.name} />
                <DetailItem label="Department / agency" value={report.department} />
                <DetailItem label="Project type" value={report.type} />
                <DetailItem
                  label="State / district"
                  value={`${report.state} / ${report.district}`}
                />
                <DetailItem
                  label="Tehsil / village"
                  value={`${report.tehsil} / ${report.village}`}
                />
                <DetailItem
                  label="Proposed land area"
                  value={report.officerSubmission.proposedArea}
                />
                <DetailItem
                  label="Proposal submitted"
                  value={formatDate(report.officerSubmission.submittedOn)}
                />
                <DetailItem
                  label="Proposal status"
                  value={report.officerSubmission.proposalStatus}
                />
                <DetailItem label="Land purpose" value={report.landPurpose} />
              </div>
            </Section>

            <Section
              title="LAO collection summary"
              subtitle="Field and record data collected for nodal review."
              icon={ShieldCheck}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <DetailItem
                  label="Survey / collection date"
                  value={formatDate(report.laoCollection.surveyDate)}
                />
                <DetailItem
                  label="Verified land area"
                  value={report.laoCollection.verifiedArea}
                />
                <DetailItem
                  label="Number of parcels"
                  value={report.laoCollection.parcelCount}
                />
                <DetailItem
                  label="Affected families"
                  value={report.laoCollection.affectedFamilies}
                />
                <DetailItem
                  label="Consent received"
                  value={report.laoCollection.consentReceived}
                />
                <DetailItem
                  label="Objections received"
                  value={report.laoCollection.objectionsReceived}
                />
                <DetailItem
                  label="Notice status"
                  value={report.laoCollection.noticeStatus}
                />
                <DetailItem
                  label="Title status"
                  value={report.laoCollection.titleStatus}
                />
                <DetailItem
                  label="LAO verification"
                  value={report.laoCollection.verification}
                />
              </div>
            </Section>

            <Section
              title="Parcel ownership and compensation"
              subtitle="Demo parcel classification and compensation assessment."
              icon={LandPlot}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <DetailItem label="Total parcels" value={report.laoCollection.parcelCount} />
                <DetailItem label="Privately owned" value={report.laoCollection.privatelyOwned} />
                <DetailItem label="Government owned" value={report.laoCollection.governmentOwned} />
                <DetailItem label="Disputed parcels" value={report.laoCollection.disputedParcels} />
                <DetailItem label="Estimated compensation" value={report.laoCollection.compensation} />
                <DetailItem label="Valuation date" value={formatDate(report.laoCollection.valuationDate)} />
                <DetailItem label="Valuation basis" value={report.laoCollection.valuationBasis} />
              </div>
            </Section>

            <Section
              title="GIS and affected area"
              subtitle="Location references supplied and checked by the LAO."
              icon={MapPin}
            >
              <div className="grid gap-3 sm:grid-cols-3">
                <DetailItem label="Latitude" value={report.latitude} />
                <DetailItem label="Longitude" value={report.longitude} />
                <DetailItem label="Route length" value={report.routeLength} />
              </div>
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                Acquisition area: {report.village}, {report.district}, {report.state}.
                The corridor covers {report.laoCollection.verifiedArea} and requires follow-up on {report.laoCollection.disputedParcels} disputed parcel(s).
              </div>
            </Section>

            <Section
              title="Supporting documents"
              subtitle="Documents included in this demo report."
              icon={FileText}
            >
              <div className="space-y-2">
                {report.documents.map((document) => (
                  <div
                    key={document}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-3 text-sm text-slate-700"
                  >
                    <FileText className="h-4 w-4 text-slate-500" />
                    {document}
                  </div>
                ))}
              </div>
            </Section>

            <Section
              title="People and risk observations"
              subtitle="Impact and issues to carry into nodal review."
              icon={Users}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <DetailItem label="Affected families" value={report.affectedFamilies} />
                <DetailItem
                  label="Risk category"
                  value={`${report.riskCategory} (${report.riskProbability}%)`}
                />
              </div>
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900">
                      Nodal review observation
                    </p>
                    <p className="mt-1 text-sm leading-5 text-amber-800">
                      Prioritize the {report.laoCollection.objectionsReceived} recorded objection(s), {report.laoCollection.disputedParcels} disputed parcel(s), ownership verification, and compensation confirmation before final approval.
                    </p>
                  </div>
                </div>
              </div>
            </Section>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <Download className="h-4 w-4" />
              Print / save report
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
