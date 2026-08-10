import React from 'react';

export default function StatusBadge({ status }) {
  const map = {
    'Draft': 'bg-slate-100 text-slate-700 border-slate-200',
    'Submitted': 'bg-blue-50 text-blue-700 border-blue-200',
    'Under Review': 'bg-amber-50 text-amber-700 border-amber-200',
    'Pending': 'bg-amber-50 text-amber-700 border-amber-200',
    'Approved': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Rejected': 'bg-rose-50 text-rose-700 border-rose-200',
    'Returned for Correction': 'bg-purple-50 text-purple-700 border-purple-200',
    'Converted to RFQ': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'Sent': 'bg-cyan-50 text-cyan-700 border-cyan-200',
    'Recorded': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'Posted': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'In Transit': 'bg-amber-50 text-amber-700 border-amber-200',
    'Completed': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Inspected & Passed': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Failed Inspection': 'bg-rose-50 text-rose-700 border-rose-200'
  };

  const cls = map[status] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${cls} inline-flex items-center space-x-1 shadow-2xs`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      <span>{status}</span>
    </span>
  );
}
