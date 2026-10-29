"use client";

import dynamic from 'next/dynamic';
import Link from 'next/link';
import React from 'react';
import { BellDot, FolderKanban, Plus, ShieldCheck, MapPinned } from 'lucide-react';
import { Header } from '../../../component/layout/index';
import { KPI, Gis, MyProjects, RecentActivity } from './index';

const DoughnutChart = dynamic(() => import('./risk-composition'), { ssr: false });

const quickActions = [
  { label: 'New Project', href: '/roles/project-officer/create-project', icon: Plus },
  { label: 'Notifications', href: '/roles/project-officer/notification', icon: BellDot },
];

const Page = () => {
  return (
    <>
      <Header title="Dashboard" />

      <div className="page-shell">
        <div className="page-container">
          <header className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/80 px-5 py-4 shadow-sm backdrop-blur-sm md:flex-row md:items-center md:justify-between ">
            <div>
              <p className="mb-[0.2rem] text-[0.72rem] tracking-[0.12em] uppercase text-slate-500 font-bold">State Overview</p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl ">
                Project Officer Dashboard
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {quickActions.map(({ label, href, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </div>
          </header>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KPI title="Total Projects" value="134" delta={4.2} icon={FolderKanban} />
            <KPI title="Under Acquisition" value="21" delta={-1.3} icon={MapPinned} />
            <KPI title="Completed" value="89" delta={2.1} icon={ShieldCheck} />
            <KPI title="High Risk" value="9" delta={-0.8} icon={BellDot} />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,0.9fr)] xl:items-start">
            <div className="space-y-5">
              <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-base font-semibold tracking-tight text-slate-800">Project Portfolio</h2>
                  <Link
                    href="/roles/project-officer/my-project"
                    className="inline-flex items-center text-sm font-medium text-sky-700 transition hover:text-sky-800"
                  >
                    View all
                  </Link>
                </div>
                <MyProjects />
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-base font-semibold tracking-tight text-slate-800">Recent Activity</h2>
                  <Link
                    href="/roles/project-officer/notification"
                    className="inline-flex items-center text-sm font-medium text-sky-700 transition hover:text-sky-800"
                  >
                    Open feed
                  </Link>
                </div>
                <RecentActivity />
              </section>
            </div>

            <div className="space-y-5">
              <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-base font-semibold tracking-tight text-slate-800">GIS Overview</h2>
                  <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-700 ring-1 ring-emerald-100">
                    Live
                  </span>
                </div>
                <Gis />
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-base font-semibold tracking-tight text-slate-800">Risk Composition</h2>
                  <span className="text-sm text-slate-500">This quarter</span>
                </div>
                <DoughnutChart />
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;