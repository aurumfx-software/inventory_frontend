import React, { useState, useEffect } from 'react';
import { History } from 'lucide-react';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/audit-logs').then(r => r.json()).then(d => d.success && setLogs(d.data));
  }, []);

  const filtered = logs.filter(l => 
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.details.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 border border-slate-200/80 rounded-2xl shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 font-heading flex items-center space-x-2">
          <History className="w-5 h-5 text-purple-600" />
          <span>Tamper-Resistant Audit Activity Trail</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">Immutable record of logins, CRUD operations, approvals, stock postings & permissions.</p>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <input 
            type="text" 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            placeholder="Filter audit activity logs..." 
            className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 w-72"
          />
          <span className="text-xs text-slate-500 font-mono">Total Log Entries: {filtered.length}</span>
        </div>

        <table className="w-full text-xs text-left font-mono">
          <thead>
            <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200 font-sans font-bold">
              <th className="p-3.5">Timestamp (UTC)</th>
              <th className="p-3.5">Action</th>
              <th className="p-3.5">Module</th>
              <th className="p-3.5">User ID</th>
              <th className="p-3.5">Activity Details</th>
              <th className="p-3.5 text-right">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(l => (
              <tr key={l.id} className="hover:bg-slate-50/80 transition">
                <td className="p-3.5 text-slate-500 font-sans">{new Date(l.timestamp).toLocaleString()}</td>
                <td className="p-3.5 font-bold text-purple-700">{l.action}</td>
                <td className="p-3.5 text-slate-700 font-sans">{l.module}</td>
                <td className="p-3.5 text-slate-900 font-bold">{l.user_name || l.user_id}</td>
                <td className="p-3.5 text-slate-800 font-sans text-[11px] font-medium">{l.details}</td>
                <td className="p-3.5 text-right text-slate-500">{l.ip_address || '127.0.0.1'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
