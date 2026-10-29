"use client";

import React from 'react';
import Link from 'next/link';
import Card from '../../../component/common/Card';

const MyProjects = ({ projects = null, loading = false }) => {
  const sample = [
    { id: 1, name: 'Rural Housing - Phase I', district: 'Bengaluru Urban', status: 'Acquisition', risk: 'High', progress: 32 },
    { id: 2, name: 'Irrigation Channel Upgrade', district: 'Mysuru', status: 'Verification', risk: 'Medium', progress: 67 },
    { id: 3, name: 'Road Link Project', district: 'Hubli', status: 'Completed', risk: 'Low', progress: 100 },
  ];

  const rows = projects ?? sample;

  const statusClass = (s) => {
    switch (s) {
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
      case 'Acquisition':
        return 'bg-amber-50 text-amber-700 ring-amber-200';
      case 'Verification':
        return 'bg-sky-50 text-sky-700 ring-sky-200';
      default:
        return 'bg-slate-50 text-slate-600 ring-slate-200';
    }
  };

  const riskClass = (r) => {
    switch (r) {
      case 'High':
        return 'bg-rose-50 text-rose-700';
      case 'Medium':
        return 'bg-amber-50 text-amber-700';
      case 'Low':
        return 'bg-emerald-50 text-emerald-700';
      default:
        return 'bg-slate-50 text-slate-600';
    }
  };

  if (loading) {
    return <div className="card h-52 animate-pulse" />;
  }

  if (!rows || rows.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center gap-3 p-6 text-center text-slate-600">
        <p className="font-semibold text-slate-800">No projects found</p>
        <p className="text-sm text-slate-500">
          You do not have any projects assigned yet. Create or import projects to get started.
        </p>
        <Link className="text-sm font-medium text-sky-600 hover:underline" href="/roles/project-officer/create-project">
          Create Project
        </Link>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[650px] text-left">
          <thead>
            <tr className="bg-slate-50 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              <th className="px-4 py-3">Project</th>
              <th className="px-4 py-3">District</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Risk</th>
              <th className="px-4 py-3">Progress</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-sm">
            {rows.map((item) => (
              <tr key={item.id} className="transition hover:bg-slate-50/70">
                <td className="px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-800">{item.name}</p>
                      <p className="mt-1 text-xs text-slate-500">Project ID #{String(item.id).padStart(3, '0')}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">{item.district}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusClass(item.status)}`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${riskClass(item.risk)}`}>
                    {item.risk}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="mb-2 flex items-center justify-between gap-3 text-xs text-slate-600">
                    <span>{item.progress ?? 0}%</span>
                    <Link href={`/roles/project-officer/my-project/${item.id}`} className="font-medium text-sky-700 hover:text-sky-800">
                      Open
                    </Link>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-500" style={{ width: `${item.progress ?? 0}%` }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default MyProjects;