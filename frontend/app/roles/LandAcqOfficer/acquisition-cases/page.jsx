"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  FileText,
  MapPin,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";

const acquisitionCases = [
  {
    id: "ACQ-2026-001",
    projectId: "PRJ-001",
    projectName: "Delhi-Mumbai Expressway",
    parcelId: "P-001",
    surveyNumber: "123/1",
    landOwner: "Rajesh Kumar",
    landArea: "2.45",
    location: "Modinagar, Ghaziabad",
    status: "Compensation Pending",
  },
  {
    id: "ACQ-2026-002",
    projectId: "PRJ-001",
    projectName: "Delhi-Mumbai Expressway",
    parcelId: "P-002",
    surveyNumber: "124/2",
    landOwner: "Suresh Sharma",
    landArea: "1.80",
    location: "Modinagar, Ghaziabad",
    status: "Notice Issued",
  },
  {
    id: "ACQ-2026-003",
    projectId: "PRJ-002",
    projectName: "Rohini Metro Extension",
    parcelId: "P-003",
    surveyNumber: "78/4",
    landOwner: "Amit Verma",
    landArea: "1.25",
    location: "Rohini, Delhi",
    status: "Under Verification",
  },
  {
    id: "ACQ-2026-004",
    projectId: "PRJ-002",
    projectName: "Rohini Metro Extension",
    parcelId: "P-004",
    surveyNumber: "79/1",
    landOwner: "Neha Gupta",
    landArea: "0.95",
    location: "Rohini, Delhi",
    status: "Legal Review",
  },
  {
    id: "ACQ-2026-005",
    projectId: "PRJ-003",
    projectName: "Yamuna Flood Control",
    parcelId: "P-005",
    surveyNumber: "45/7",
    landOwner: "Mohan Singh",
    landArea: "3.20",
    location: "East Delhi",
    status: "Compensation Approved",
  },
  {
    id: "ACQ-2026-006",
    projectId: "PRJ-004",
    projectName: "Industrial Corridor",
    parcelId: "P-006",
    surveyNumber: "91/3",
    landOwner: "Rakesh Yadav",
    landArea: "4.15",
    location: "Dadri, Gautam Buddh Nagar",
    status: "Possession Pending",
  },
];

function AcquisitionCasesPageContent() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Cases");
  const searchParams = useSearchParams();

  useEffect(() => {
    const parcelId = searchParams.get("parcelId");
    if (parcelId) setSearch(parcelId);
  }, [searchParams]);

  const filteredCases = acquisitionCases.filter((item) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      item.id.toLowerCase().includes(searchText) ||
      item.projectName.toLowerCase().includes(searchText) ||
      item.projectId.toLowerCase().includes(searchText) ||
      item.parcelId.toLowerCase().includes(searchText) ||
      item.landOwner.toLowerCase().includes(searchText);

    const matchesStatus =
      statusFilter === "All Cases" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">
      
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Acquisition Cases
          </h1>

          <p className="mt-2 text-base text-slate-500">
            Manage and track land acquisition cases.
          </p>
        </div>

        <div className="flex h-11 items-center justify-center rounded-2xl bg-black px-7 text-sm font-semibold text-white">
          {filteredCases.length} Cases
        </div>
      </div>

      {/* Search + Filter */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row">
        
        {/* Search */}
        <div className="relative w-full md:max-w-[560px]">
          <Search
            size={22}
            className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search case, project, owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-13 w-full rounded-2xl border border-slate-200 bg-white pl-14 pr-5 text-lg text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Filter */}
        <div className="relative w-full md:w-[300px]">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-13 w-full appearance-none rounded-2xl border border-slate-200 bg-white px-6 text-lg text-slate-800 outline-none focus:border-blue-500"
          >
            <option>All Cases</option>
            <option>Compensation Pending</option>
            <option>Notice Issued</option>
            <option>Under Verification</option>
            <option>Legal Review</option>
            <option>Compensation Approved</option>
            <option>Possession Pending</option>
          </select>

          <ChevronDown
            size={20}
            className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-slate-500"
          />
        </div>
      </div>

      {/* Cases Grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {filteredCases.map((item) => (
          <AcquisitionCaseCard
            key={item.id}
            item={item}
          />
        ))}
      </div>

      {/* No results */}
      {filteredCases.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <FileText
            size={42}
            className="mx-auto mb-4 text-slate-300"
          />

          <h2 className="text-xl font-semibold text-slate-800">
            No cases found
          </h2>

          <p className="mt-2 text-slate-500">
            Try changing your search or filter.
          </p>
        </div>
      )}
    </div>
  );
}


/* ---------------------------------
   Acquisition Case Card
---------------------------------- */

function AcquisitionCaseCard({ item }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">

      {/* Top Section */}
      <div className="flex items-start justify-between gap-5">

        <div className="flex items-start gap-5">

          {/* Icon */}
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-50">
            <FileText
              size={30}
              className="text-blue-600"
            />
          </div>

          {/* Project */}
          <div>
            <p className="text-sm font-semibold text-blue-600">
              {item.id}
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              {item.projectName}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Project ID: {item.projectId}
            </p>
          </div>

        </div>

        {/* Status */}
        <StatusBadge status={item.status} />

      </div>

      {/* Divider */}
      <div className="my-6 h-px bg-slate-100" />

      {/* Information */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-6">

        <Info
          label="Parcel ID"
          value={item.parcelId}
        />

        <Info
          label="Survey Number"
          value={item.surveyNumber}
        />

        <Info
          label="Land Owner"
          value={item.landOwner}
        />

        <Info
          label="Land Area"
          value={`${item.landArea} Hectares`}
        />

      </div>

      {/* Location */}
      <div className="mt-6 flex items-center gap-3 text-slate-500">
        <MapPin
          size={20}
          className="text-slate-500"
        />

        <span className="text-sm">
          {item.location}
        </span>
      </div>

      {/* Divider */}
      <div className="my-6 h-px bg-slate-100" />

      {/* Open Case */}
      <Link
        href={`/roles/LandAcqOfficer/acquisition-cases/${item.id}`}
        className="flex h-10 w-full items-center justify-center gap-3 rounded-xl bg-black text-base font-semibold text-white transition hover:bg-slate-800"
      >
        Open Case

        <ArrowRight size={21} />
      </Link>

      <Link
        href={`/roles/LandAcqOfficer/acquisition-cases/${item.id}/verify`}
        className="mt-3 flex h-10 w-full items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-base font-semibold text-emerald-700 transition hover:bg-emerald-100"
      >
        Verify Project
      </Link>
    </div>
  );
}


/* ---------------------------------
   Information Component
---------------------------------- */

function Info({ label, value }) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-base font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}


/* ---------------------------------
   Status Badge
---------------------------------- */

function StatusBadge({ status }) {
  let style =
    "border-slate-200 bg-slate-50 text-slate-700";

  if (status === "Compensation Pending") {
    style =
      "border-yellow-200 bg-yellow-50 text-yellow-700";
  }

  if (status === "Notice Issued") {
    style =
      "border-blue-200 bg-blue-50 text-blue-600";
  }

  if (status === "Under Verification") {
    style =
      "border-purple-200 bg-purple-50 text-purple-600";
  }

  if (status === "Legal Review") {
    style =
      "border-red-200 bg-red-50 text-red-600";
  }

  if (status === "Compensation Approved") {
    style =
      "border-green-200 bg-green-50 text-green-600";
  }

  if (status === "Possession Pending") {
    style =
      "border-orange-200 bg-orange-50 text-orange-600";
  }

  return (
    <span
      className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold ${style}`}
    >
      {status}
    </span>
  );
}

export default function AcquisitionCasesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 px-4 py-6 text-sm text-slate-500 md:px-8">Loading acquisition cases...</div>}>
      <AcquisitionCasesPageContent />
    </Suspense>
  );
}