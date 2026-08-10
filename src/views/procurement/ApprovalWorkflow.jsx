import React, { useState, useEffect } from 'react';
import { CheckSquare, Check, X, RotateCcw } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

export default function ApprovalWorkflow() {
  const [approvals, setApprovals] = useState([]);
  const [comments, setComments] = useState('');

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    try {
      const res = await fetch('/api/approvals');
      const data = await res.json();
      if (data.success) setApprovals(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAction = async (appId, act) => {
    try {
      const res = await fetch(`/api/approvals/${appId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: act, comments })
      });
      const data = await res.json();
      if (data.success) {
        setComments('');
        fetchApprovals();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 border border-slate-200/80 rounded-2xl shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 font-heading flex items-center space-x-2">
          <CheckSquare className="w-5 h-5 text-purple-600" />
          <span>Multi-Level Approval Workflows Inbox</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">Approve, reject, return for correction or delegate pending transaction requests.</p>
      </div>

      {/* Approvals Inbox List */}
      <div className="space-y-4">
        {approvals.map(app => (
          <div key={app.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4 hover:border-purple-200 transition">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-3">
                <span className="bg-purple-50 text-purple-700 border border-purple-200 font-mono text-xs font-bold px-2.5 py-1 rounded-full">
                  {app.transaction_type}
                </span>
                <span className="font-mono text-sm font-bold text-slate-900">{app.txnDetails?.doc_number || app.transaction_id}</span>
                <StatusBadge status={app.status} />
              </div>
              <div className="text-xs text-slate-500 font-mono">
                Assigned: {app.assigned_date ? new Date(app.assigned_date).toLocaleDateString() : 'Today'}
              </div>
            </div>

            {app.txnDetails && (
              <div className="grid grid-cols-4 gap-4 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100 font-sans">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Department</span>
                  <span className="text-slate-800 font-bold">{app.txnDetails.department}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Requested By</span>
                  <span className="text-slate-800 font-bold">{app.txnDetails.requested_by}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Priority</span>
                  <span className="text-amber-600 font-bold">{app.txnDetails.priority}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Est Amount</span>
                  <span className="text-emerald-700 font-mono font-bold">₹{(app.txnDetails.amount || 0).toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* Requested Items Preview */}
            {app.txnDetails?.items && (
              <div className="text-xs space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Line Items Pending Review:</p>
                <div className="flex flex-wrap gap-2">
                  {app.txnDetails.items.map((line, idx) => (
                    <span key={idx} className="bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg text-[11px] text-slate-700 font-mono font-semibold">
                      {line.item_code} - {line.item_name} (Qty: <strong className="text-purple-700">{line.requested_qty}</strong>)
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions Bar */}
            {app.status === 'Pending' && (
              <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                <div className="w-1/2">
                  <input 
                    type="text"
                    value={comments}
                    onChange={e => setComments(e.target.value)}
                    placeholder="Enter approval / rejection remarks..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                  />
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleAction(app.id, 'Approve')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center space-x-1 shadow-xs transition"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                  <button 
                    onClick={() => handleAction(app.id, 'Return')}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center space-x-1 shadow-xs transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Return</span>
                  </button>
                  <button 
                    onClick={() => handleAction(app.id, 'Reject')}
                    className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center space-x-1 shadow-xs transition"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
