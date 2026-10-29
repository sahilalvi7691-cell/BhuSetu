import React from 'react';
import { AlertTriangle, BellRing, FileText, RefreshCcw } from 'lucide-react';
import Card from '../../../component/common/Card';

const sample = [
  { id: 1, type: 'Update', text: 'Boundary verification completed for Project A', time: '2h ago' },
  { id: 2, type: 'Alert', text: 'High risk flagged for Canal Upgrade', time: '6h ago' },
  { id: 3, type: 'Note', text: 'New documents uploaded for Road Link Project', time: '1d ago' },
];

const iconFor = (t) => {
  switch (t) {
    case 'Alert':
      return AlertTriangle;
    case 'Update':
      return RefreshCcw;
    case 'Note':
      return FileText;
    default:
      return BellRing;
  }
};

const toneFor = (t) => {
  switch (t) {
    case 'Alert':
      return 'bg-rose-50 text-rose-700 border-rose-100';
    case 'Update':
      return 'bg-sky-50 text-sky-700 border-sky-100';
    case 'Note':
      return 'bg-violet-50 text-violet-700 border-violet-100';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

const RecentActivity = ({ items = null, loading = false }) => {
  const rows = items ?? sample;

  if (loading) return <div className="card h-56 animate-pulse" />;

  if (!rows || rows.length === 0) {
    return <Card className="p-6 text-center text-slate-600">No recent activity</Card>;
  }

  return (
    <Card className="divide-y divide-slate-100 overflow-hidden">
      {rows.map((r) => {
        const Icon = iconFor(r.type);

        return (
          <div key={r.id} className="flex items-start gap-3 p-3.5 transition hover:bg-slate-50">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${toneFor(r.type)}`}>
              <Icon className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-slate-800">{r.text}</div>
              <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
                  {r.type}
                </span>
                <span>{r.time}</span>
              </div>
            </div>
          </div>
        );
      })}
    </Card>
  );
};

export default RecentActivity;