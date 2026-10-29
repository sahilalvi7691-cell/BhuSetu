"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Folder,
  MapPin,
  ArrowRight,
} from "lucide-react";

const PROJECTS = [
  {
    id: 1,
    projectId: "PRJ-001",
    name: "Delhi-Mumbai Expressway",
    location: "North Delhi",
    risk: "High",
    status: "In Progress",
    totalParcels: 4,
    verifiedParcels: 1,
    pendingParcels: 3,
  },
  {
    id: 2,
    projectId: "PRJ-002",
    name: "Rohini Metro Extension",
    location: "North Delhi",
    risk: "Medium",
    status: "Verification",
    totalParcels: 3,
    verifiedParcels: 1,
    pendingParcels: 2,
  },
  {
    id: 3,
    projectId: "PRJ-003",
    name: "Yamuna Flood Control",
    location: "East Delhi",
    risk: "Low",
    status: "In Progress",
    totalParcels: 5,
    verifiedParcels: 3,
    pendingParcels: 2,
  },
  {
    id: 4,
    projectId: "PRJ-004",
    name: "Industrial Corridor",
    location: "South Delhi",
    risk: "Medium",
    status: "Verification",
    totalParcels: 6,
    verifiedParcels: 2,
    pendingParcels: 4,
  },
];

export default function ParcelVerificationPage() {
  const [search, setSearch] = useState("");

  const filteredProjects = PROJECTS.filter((project) =>
    `${project.name} ${project.projectId} ${project.location}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6">

      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Parcel Verification
          </h1>

          <p className="mt-1 text-slate-500">
            Select a project to view and verify its parcels.
          </p>
        </div>

        <div className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white">
          {PROJECTS.length} Projects
        </div>

      </div>

      {/* Search */}
      <div className="mb-6 max-w-md">

        <div className="relative">

          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={20}
          />

          <input
            type="text"
            placeholder="Search project..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-4 pl-12 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

        </div>

      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        {filteredProjects.map((project) => {

          const progress =
            (project.verifiedParcels / project.totalParcels) * 100;

          return (
            <div
              key={project.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
            >

              {/* Top */}
              <div className="flex items-start justify-between">

                <div className="flex items-center gap-4">

                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-blue-50">
                    <Folder
                      size={30}
                      className="text-blue-600"
                    />
                  </div>

                  <div>

                    <p className="text-sm font-semibold text-blue-600">
                      {project.projectId}
                    </p>

                    <h2 className="mt-1 text-xl font-bold text-slate-900">
                      {project.name}
                    </h2>

                    <div className="mt-2 flex items-center gap-1 text-sm text-slate-500">
                      <MapPin size={16} />
                      {project.location}
                    </div>

                  </div>

                </div>

                {/* Risk */}
                <RiskBadge risk={project.risk} />

              </div>

              {/* Project Information */}
              <div className="mt-8 grid grid-cols-2 gap-6">

                <div>
                  <p className="text-sm text-slate-500">
                    Project Status
                  </p>

                  <span className="mt-2 inline-block rounded-full bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-600">
                    {project.status}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Total Parcels
                  </p>

                  <p className="mt-2 text-xl font-bold text-slate-900">
                    {project.totalParcels}
                  </p>
                </div>

              </div>

              {/* Progress */}
              <div className="mt-6">

                <div className="mb-2 flex items-center justify-between">

                  <span className="text-sm text-slate-500">
                    Verification Progress
                  </span>

                  <span className="text-sm font-bold text-blue-600">
                    {project.verifiedParcels}/{project.totalParcels}
                  </span>

                </div>

                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">

                  <div
                    className="h-full rounded-full bg-blue-600 transition-all"
                    style={{
                      width: `${progress}%`,
                    }}
                  />

                </div>

              </div>

              {/* Pending */}
              <p className="mt-5 text-sm text-amber-600">
                <span className="font-semibold">
                  {project.pendingParcels}
                </span>{" "}
                parcels pending verification
              </p>

              {/* Divider */}
              <div className="my-6 border-t border-slate-200" />

              {/* Open Project */}
              <Link
                href={`/roles/LandAcqOfficer/parcels/${project.id}`}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-black px-5 py-3.5 font-semibold text-white transition hover:bg-slate-800"
              >
                Verify Parcels

                <ArrowRight size={20} />

              </Link>

            </div>
          );
        })}

      </div>

      {/* No Results */}
      {filteredProjects.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">

          <Folder className="mx-auto mb-4 text-slate-400" size={40} />

          <h2 className="text-lg font-semibold text-slate-900">
            No projects found
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Try searching with a different project name or ID.
          </p>

        </div>
      )}

    </div>
  );
}


/* Risk Badge */

function RiskBadge({ risk }) {

  const styles = {
    High: "bg-red-50 text-red-600",
    Medium: "bg-yellow-50 text-yellow-700",
    Low: "bg-green-50 text-green-600",
  };

  return (
    <span
      className={`rounded-full px-4 py-2 text-sm font-semibold ${
        styles[risk] || "bg-slate-100 text-slate-600"
      }`}
    >
      {risk}
    </span>
  );
}