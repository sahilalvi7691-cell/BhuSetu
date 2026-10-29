"use client";

import React from "react";
import { Header } from "@/app/component/layout";
import { KPI,Projects} from './index';
import { BellDot, FolderKanban, Plus, ShieldCheck, MapPinned } from 'lucide-react';
import Link from "next/link";


export default function Dashboard() {
  return (
    <>
    <Header title="Dashboard"/>
    <div className="min-h-screen bg-[#f6f8fb] p-6">

      {/* Dashboard Title */}
      <div className="mb-7">
        <h1 className="text-3xl font-bold text-[#101a30]">
          Land Acquisition Officer Dashboard
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage land acquisition, parcel verification and project progress.
        </p>
      </div>


     <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KPI title="Total Assigned Projects" value="13" delta={4.2} icon={FolderKanban} />
            <KPI title="Parcels To Be verified" value="21" delta={-1.3} icon={MapPinned} />
            <KPI title="Acquisition Data Pending" value="29" delta={2.1} icon={ShieldCheck} />
            <KPI title="High Risk Projects" value="9" delta={-0.8} icon={BellDot} />
          </div>

      {/* Projects + Risk */}
      <div className="grid grid-cols-1 gap-7 xl:grid-cols-[1.7fr_1fr]">

        
          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.7fr_1fr]">
            <div className="space-y-6">
              
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-base font-semibold text-slate-800">Project Portfolio</h2>
                  <Link
                    href="/roles/project-officer/my-project"
                    className="text-sm font-medium text-sky-700 hover:text-sky-800"
                  >
                    View all
                  </Link>
                </div>
                <Projects />
                </div>
                </div>
                


        {/* Risk Composition */}
        <div>

          <div className="mb-4 flex items-center justify-between">

            <h2 className="text-xl font-bold text-[#102a56]">
              Risk Composition
            </h2>

            <span className="text-sm text-slate-500">
              This quarter
            </span>

          </div>


          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex justify-center py-4">

              <div
                className="relative flex h-52 w-52 items-center justify-center rounded-full"
                style={{
                  background:
                    "conic-gradient(#10b981 0% 48%, #f59e0b 48% 79%, #f43f5e 79% 100%)",
                }}
              >

                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-white">

                  <span className="text-xs font-semibold tracking-[0.25em] text-slate-400">
                    RISK
                  </span>

                </div>

              </div>

            </div>


            <div className="mt-5 space-y-3">

              <RiskRow
                color="bg-emerald-500"
                name="Low Risk"
                value="48%"
              />

              <RiskRow
                color="bg-amber-500"
                name="Medium Risk"
                value="31%"
              />

              <RiskRow
                color="bg-rose-500"
                name="High Risk"
                value="21%"
              />

            </div>

          </div>

        </div>

      </div>


      {/* Recent Activity */}
      <div className="mt-8">

        <div className="mb-4 flex items-center justify-between">

          <h2 className="text-xl font-bold text-[#102a56]">
            Recent Activity
          </h2>

          <button className="text-sm text-blue-600">
            Open feed →
          </button>

        </div>


        <div className="rounded-2xl border border-slate-200 bg-white px-5 shadow-sm">

          {[
            "Parcel P-1023 marked as verified",
            "Acquisition data updated for Project #003",
            "Documents missing for Project #005",
            "Risk level changed to High",
            "New landowner query received",
          ].map((activity, index) => (

            <div
              key={index}
              className="flex items-center gap-3 border-b border-slate-100 py-4 last:border-0"
            >

              <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />

              <span className="text-sm text-slate-700">
                {activity}
              </span>

              <span className="ml-auto text-xs text-slate-400">
                {index + 2} hours ago
              </span>

            </div>

          ))}

        </div>

      </div>

    </div>
    </>
  );
}


function RiskRow({ color, name, value }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">

      <div className="flex items-center gap-3">

        <span className={`h-3 w-3 rounded-full ${color}`} />

        <span className="text-sm text-slate-700">
          {name}
        </span>

      </div>

      <span className="font-semibold text-[#102a56]">
        {value}
      </span>

    </div>
    
  );
  
}