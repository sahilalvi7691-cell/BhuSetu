"use client";

import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import Card from '../../../component/common/Card';

ChartJS.register(ArcElement, Tooltip);

const data = {
  labels: ['Low Risk', 'Medium Risk', 'High Risk'],
  datasets: [
    {
      data: [48, 31, 21],
      backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
      borderWidth: 0,
      hoverOffset: 8,
    },
  ],
};

const options = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '62%',
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: (context) => `${context.label}: ${context.parsed}%`,
      },
    },
  },
};

export default function DoughnutChart() {
  return (
    <Card className="p-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[180px_1fr] md:items-center">
        <div className="relative mx-auto h-44 w-44">
          <Doughnut data={data} options={options} />
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Risk</span>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { label: 'Low Risk', value: '48%', color: 'bg-emerald-500' },
            { label: 'Medium Risk', value: '31%', color: 'bg-amber-500' },
            { label: 'High Risk', value: '21%', color: 'bg-rose-500' },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
              <div className="flex items-center gap-2.5">
                <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                <span className="text-sm font-medium text-slate-700">{item.label}</span>
              </div>
              <span className="text-sm font-semibold text-slate-900">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}