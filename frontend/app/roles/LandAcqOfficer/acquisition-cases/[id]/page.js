"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  MapPin,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Upload,
} from "lucide-react";

export default function AcquisitionCasePage({ params }) {
  const { id } = React.use(params);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setVerificationComplete(
      window.localStorage.getItem(`BhuSetu-case-verified:${id}`) === "true"
    );
  }, [id]);

  const submitVerification = () => {
    window.localStorage.setItem(`BhuSetu-case-verified:${id}`, "true");
    setVerificationComplete(true);
    setNotice("Verification completed and submitted successfully.");
    window.setTimeout(() => setNotice(""), 3500);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">

      <div className="mx-auto max-w-7xl">

        {/* Back */}
        <Link
          href="/roles/LandAcqOfficer/acquisition-cases"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600"
        >
          <ArrowLeft size={18} />
          Back to Acquisition Cases
        </Link>

        {/* Header */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex items-center gap-4">

              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-blue-50">
                <FileText
                  size={32}
                  className="text-blue-600"
                />
              </div>

              <div>

                <p className="text-sm font-semibold text-blue-600">
                  ACQUISITION CASE
                </p>

                <h1 className="mt-1 text-2xl font-bold text-slate-900">
                  {id}
                </h1>

                <p className="mt-1 text-slate-500">
                  Delhi-Mumbai Expressway
                </p>

              </div>

            </div>

            <span
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                verificationComplete
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-yellow-50 text-yellow-700"
              }`}
            >
              {verificationComplete
                ? "Verification Completed"
                : "Compensation Pending"}
            </span>

          </div>

        </div>


        {/* Main Grid */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Left */}
          <div className="space-y-6 lg:col-span-2">

            {/* Parcel Details */}
            <Section title="Parcel & Land Details">

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                <Info label="Project ID" value="PRJ-001" />
                <Info label="Parcel ID" value="P-001" />

                <Info label="Survey Number" value="123/1" />
                <Info label="Land Area" value="2.45 Hectares" />

                <Info label="Village" value="Modinagar" />
                <Info label="District" value="Ghaziabad" />

                <Info label="Land Type" value="Agricultural" />
                <Info label="Ownership Status" value="Verified" />

              </div>

            </Section>


            {/* Owner */}
            <Section title="Land Owner Information">

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                <Info
                  label="Owner Name"
                  value="Rajesh Kumar"
                />

                <Info
                  label="Ownership Type"
                  value="Individual"
                />

                <Info
                  label="Ownership Status"
                  value="Verified"
                />

                <Info
                  label="Verification Date"
                  value="15 Aug 2026"
                />

              </div>

            </Section>


            {/* Timeline */}
            <Section title="Acquisition Timeline">

              <Timeline
                done
                title="Parcel Identified"
                date="12 Aug 2026"
              />

              <Timeline
                done
                title="Parcel Verified"
                date="15 Aug 2026"
              />

              <Timeline
                done
                title="Notice Issued"
                date="18 Aug 2026"
              />

              <Timeline
                done
                title="Objection Period Completed"
                date="02 Sep 2026"
              />

              <Timeline
                active
                title="Compensation Assessment"
                date="In Progress"
              />

              <Timeline
                title="Award Passed"
                date="Pending"
              />

              <Timeline
                title="Compensation Paid"
                date="Pending"
              />

              <Timeline
                title="Possession Taken"
                date="Pending"
              />

            </Section>


            {/* Documents */}
            <Section title="Case Documents">

              <Document
                name="Land Record"
                status="Verified"
              />

              <Document
                name="Ownership Certificate"
                status="Verified"
              />

              <Document
                name="Acquisition Notice"
                status="Uploaded"
              />

              <Document
                name="Valuation Report"
                status="Uploaded"
              />

              <Document
                name="Compensation Calculation"
                status="Pending"
              />

              <button className="mt-4 flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">
                <Upload size={18} />
                Upload Document
              </button>

            </Section>

          </div>


          {/* Right */}
          <div className="space-y-6">

            {/* Actions */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <h2 className="text-lg font-bold text-slate-900">
                LAO Actions
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Actions available for this case
              </p>

              {notice && (
                <div
                  role="status"
                  className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800"
                >
                  {notice}
                </div>
              )}

              <div className="mt-5 space-y-3">

                <button
                  type="button"
                  onClick={submitVerification}
                  disabled={verificationComplete}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-700"
                >
                  <CheckCircle2 size={18} />
                  {verificationComplete
                    ? "Verification Completed"
                    : "Submit Verification"}
                </button>

                <button className="w-full rounded-xl bg-black px-4 py-3 font-semibold text-white hover:bg-slate-800">
                  Review Case
                </button>

                <button className="w-full rounded-xl bg-blue-50 px-4 py-3 font-semibold text-blue-600 hover:bg-blue-100">
                  Verify Documents
                </button>

                <button className="w-full rounded-xl bg-blue-50 px-4 py-3 font-semibold text-blue-600 hover:bg-blue-100">
                  Update Compensation
                </button>

                <button className="w-full rounded-xl bg-yellow-50 px-4 py-3 font-semibold text-yellow-700 hover:bg-yellow-100">
                  Record Objection
                </button>

                <button className="w-full rounded-xl bg-red-50 px-4 py-3 font-semibold text-red-600 hover:bg-red-100">
                  Raise Issue
                </button>

              </div>

            </div>


            {/* Compensation */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <h2 className="text-lg font-bold text-slate-900">
                Compensation
              </h2>

              <div className="mt-5 space-y-4">

                <Money
                  label="Land Value"
                  value="₹24,50,000"
                />

                <Money
                  label="Additional Compensation"
                  value="₹4,90,000"
                />

                <Money
                  label="Other Benefits"
                  value="₹2,00,000"
                />

                <div className="border-t border-slate-200 pt-4">

                  <div className="flex justify-between">

                    <span className="font-semibold">
                      Total
                    </span>

                    <span className="text-lg font-bold text-blue-600">
                      ₹31,40,000
                    </span>

                  </div>

                </div>

                <span className="inline-block rounded-full bg-yellow-50 px-3 py-1 text-sm font-semibold text-yellow-700">
                  Payment Pending
                </span>

              </div>

            </div>


            {/* Legal */}
            <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-6">

              <div className="flex items-center gap-2">

                <AlertTriangle
                  size={20}
                  className="text-yellow-700"
                />

                <h2 className="font-bold text-yellow-800">
                  Legal & Objection
                </h2>

              </div>

              <div className="mt-4 space-y-3 text-sm">

                <p>
                  <span className="text-yellow-700">
                    Objection Filed:
                  </span>{" "}
                  No
                </p>

                <p>
                  <span className="text-yellow-700">
                    Legal Dispute:
                  </span>{" "}
                  No
                </p>

                <p className="text-yellow-800">
                  No active legal issues reported for this case.
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}


/* Section */

function Section({ title, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      <h2 className="mb-6 text-xl font-bold text-slate-900">
        {title}
      </h2>

      {children}

    </div>
  );
}


/* Info */

function Info({ label, value }) {
  return (
    <div>
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}


/* Timeline */

function Timeline({ done, active, title, date }) {

  return (
    <div className="flex gap-4">

      <div className="flex flex-col items-center">

        {done ? (
          <CheckCircle2
            size={22}
            className="text-green-600"
          />
        ) : active ? (
          <Clock
            size={22}
            className="text-blue-600"
          />
        ) : (
          <div className="h-5 w-5 rounded-full border-2 border-slate-300" />
        )}

        <div className="h-10 w-px bg-slate-200" />

      </div>

      <div className="pb-5">

        <p className="font-semibold text-slate-900">
          {title}
        </p>

        <p className="mt-1 text-sm text-slate-500">
          {date}
        </p>

      </div>

    </div>
  );
}


/* Document */

function Document({ name, status }) {

  return (
    <div className="mb-3 flex items-center justify-between rounded-xl border border-slate-200 p-4">

      <div className="flex items-center gap-3">

        <FileText
          size={20}
          className="text-blue-600"
        />

        <span className="font-medium text-slate-800">
          {name}
        </span>

      </div>

      <span className="text-sm font-semibold text-green-600">
        {status}
      </span>

    </div>
  );
}


/* Money */

function Money({ label, value }) {

  return (
    <div className="flex items-center justify-between">

      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span className="font-semibold text-slate-900">
        {value}
      </span>

    </div>
  );
}