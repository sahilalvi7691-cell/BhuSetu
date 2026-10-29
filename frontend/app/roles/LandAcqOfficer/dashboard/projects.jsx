"use client";

import React from "react";
import Link from "next/link";
import Card from "../../../component/common/Card";
import "./page.css"

const ProjectPortfolio = ({
  projects = null,
  loading = false,
}) => {
  const sample = [
    {
      id: 1,
      name: "Delhi-Mumbai Expressway",
      district: "North Delhi",
      status: "Acquisition",
      risk: "High",
      progress: 32,
    },
    {
      id: 2,
      name: "Rohini Metro Extension",
      district: "North Delhi",
      status: "Verification",
      risk: "Medium",
      progress: 67,
    },
    {
      id: 3,
      name: "Yamuna Flood Control",
      district: "East Delhi",
      status: "Data Collection",
      risk: "Low",
      progress: 74,
    },
    {
      id: 4,
      name: "Industrial Corridor",
      district: "West Delhi",
      status: "Acquisition",
      risk: "Medium",
      progress: 41,
    },
    {
      id: 5,
      name: "Outer Ring Road",
      district: "South Delhi",
      status: "Completed",
      risk: "Low",
      progress: 100,
    },
  ];

  const rows = projects ?? sample;

  // -----------------------------
  // STATUS COLORS
  // -----------------------------
  const statusClass = (status) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-50 text-emerald-700 ring-emerald-200";

      case "Acquisition":
        return "bg-amber-50 text-amber-700 ring-amber-200";

      case "Verification":
        return "bg-sky-50 text-sky-700 ring-sky-200";

      case "Data Collection":
        return "bg-indigo-50 text-indigo-700 ring-indigo-200 text-center w-28";

      default:
        return "bg-slate-50 text-slate-600 ring-slate-200";
    }
  };

  // -----------------------------
  // RISK COLORS
  // -----------------------------
  const riskClass = (risk) => {
    switch (risk) {
      case "High":
        return "bg-rose-50 text-rose-600";

      case "Medium":
        return "bg-amber-50 text-amber-700";

      case "Low":
        return "bg-emerald-50 text-emerald-700";

      default:
        return "bg-slate-50 text-slate-600";
    }
  };

  // -----------------------------
  // LOADING
  // -----------------------------
  if (loading) {
    return (
      <Card className="h-[350px] animate-pulse bg-slate-100" />
    );
  }

  // -----------------------------
  // EMPTY STATE
  // -----------------------------
  if (!rows || rows.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center gap-3 p-8 text-center">

        <div className="text-4xl">
          📁
        </div>

        <p className="font-semibold text-slate-800">
          No projects found
        </p>

        <p className="max-w-md text-sm text-slate-500">
          There are currently no land acquisition projects
          assigned to you.
        </p>

      </Card>
    );
  }

  return (
    <Card className="card overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      {/* TABLE */}
      <div className="card overflow-x-auto">

        <table className="w-full min-w-[760px] text-left">

          {/* HEADER */}
          <thead>

            <tr className="bg-slate-50 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">

              <th className="px-5 py-4">
                Project
              </th>

              <th className="px-5 py-4">
                District
              </th>

              <th className="px-5 py-4">
                Status
              </th>

              <th className="px-5 py-4">
                Risk
              </th>

              <th className="px-5 py-4">
                Progress
              </th>

            </tr>

          </thead>


          {/* BODY */}
          <tbody className="divide-y divide-slate-100">

            {rows.map((project) => (

              <tr
                key={project.id}
                className="
                  group
                  transition
                  duration-150
                  hover:bg-slate-50/70
                "
              >

                {/* PROJECT */}
                <td className="px-5 py-5">

                  <div>

                    <p className="font-semibold text-[#102a56]">
                      {project.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Project ID #
                      {String(project.id).padStart(3, "0")}
                    </p>

                  </div>

                </td>


                {/* DISTRICT */}
                <td className="px-5 py-5">

                  <span className="text-sm text-slate-600">
                    {project.district}
                  </span>

                </td>


                {/* STATUS */}
                <td className="px-5 py-5">

                  <span
                    className={`
                      inline-flex
                      items-center
                      rounded-full
                      px-3
                      py-1.5
                      text-xs
                      font-semibold
                      ring-1
                      ring-inset
                      ${statusClass(project.status)}
                    `}
                  >
                    {project.status}
                  </span>

                </td>


                {/* RISK */}
                <td className="px-5 py-5">

                  <span
                    className={`
                      inline-flex
                      items-center
                      rounded-md
                      px-2.5
                      py-1.5
                      text-xs
                      font-semibold
                      ${riskClass(project.risk)}
                    `}
                  >
                    {project.risk}
                  </span>

                </td>


                {/* PROGRESS */}
                <td className="px-5 py-5">

                  <div className="min-w-[130px]">

                    <div className="mb-2 flex items-center justify-between gap-3">

                      <span className="text-xs font-medium text-slate-600">
                        {project.progress ?? 0}%
                      </span>

                      <Link
                        href={`/roles/LandAcqOfficer/my-project/${project.id}`}
                        className="
                          text-xs
                          font-medium
                          text-sky-700
                          transition
                          hover:text-sky-900
                        "
                      >
                        Open
                      </Link>

                    </div>


                    {/* PROGRESS BAR */}
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">

                      <div
                        className="
                          h-full
                          rounded-full
                          bg-gradient-to-r
                          from-sky-500
                          to-cyan-500
                          transition-all
                          duration-500
                        "
                        style={{
                          width: `${project.progress ?? 0}%`,
                        }}
                      />

                    </div>

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>


      {/* FOOTER */}
      <div className="border-t border-slate-200 px-5 py-4">

        <span className="text-xs text-slate-500">
          Showing {rows.length} of {rows.length} projects
        </span>

      </div>

    </Card>
  );
};

export default ProjectPortfolio;