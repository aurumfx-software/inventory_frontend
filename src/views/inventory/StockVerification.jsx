import React, { useState, useEffect } from 'react';
import { ClipboardList, EyeOff, Plus, X } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

export default function StockVerification() {
  const [sessions, setSessions] = useState([]);
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    is_blind_count: true,
    item_id: 'itm-01',
    physical_quantity: 8,
    reason: 'Annual Physical Inventory Audit'
  });

  useEffect(() => {
    fetchSessions();
    fetch('/api/items').then(r => r.json()).then(d => d.success && setItems(d.data));
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/stock-counts');
      const data = await res.json();
      if (data.success) setSessions(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCount = async (e) => {
    e.preventDefault();
    const item = items.find(i => i.id === form.item_id) || items[0];

    try {
      const res = await fetch('/api/stock-counts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          warehouse_id: 'wh-01',
          is_blind_count: form.is_blind_count,
          count_entries: [
            {
              item_id: item.id,
              system_quantity: item.on_hand_qty,
              physical_quantity: Number(form.physical_quantity),
              reason: form.reason
            }
          ]
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        fetchSessions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-5 border border-slate-200/80 rounded-2xl shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 font-heading flex items-center space-x-2">
            <ClipboardList className="w-5 h-5 text-purple-600" />
            <span>Physical Stock Verification & Blind Count Audit</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Physical count sessions, blind count option to prevent bias & variance reconciliation.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center space-x-2 shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>+ Start Stock Count Session</span>
        </button>
      </div>

      {/* Verification Sessions */}
      <div className="space-y-4">
        {sessions.map(sess => (
          <div key={sess.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-3">
                <span className="font-mono text-sm font-bold text-purple-700">{sess.count_session_number}</span>
                <StatusBadge status={sess.status} />
                {sess.is_blind_count && (
                  <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                    <EyeOff className="w-3 h-3" />
                    <span>BLIND COUNT MODE ACTIVE</span>
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-500 font-mono">Date: {sess.count_date}</span>
            </div>

            {/* Entries Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left font-mono">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200 font-bold font-sans">
                    <th className="pb-2">Item Name</th>
                    <th className="pb-2 text-right">System Frozen Qty</th>
                    <th className="pb-2 text-right">Physical Counted Qty</th>
                    <th className="pb-2 text-right">Variance Qty</th>
                    <th className="pb-2 text-right">Variance Value (₹)</th>
                    <th className="pb-2 font-sans">Audit Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(sess.entries || []).map((e, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 text-slate-800 font-sans font-bold">{e.item_name}</td>
                      <td className="py-2.5 text-right text-slate-500">{sess.is_blind_count ? '*** (Hidden)' : e.system_quantity}</td>
                      <td className="py-2.5 text-right font-bold text-purple-700">{e.physical_quantity}</td>
                      <td className={`py-2.5 text-right font-bold ${e.variance_quantity < 0 ? 'text-rose-600' : e.variance_quantity > 0 ? 'text-emerald-700' : 'text-slate-500'}`}>
                        {e.variance_quantity > 0 ? `+${e.variance_quantity}` : e.variance_quantity}
                      </td>
                      <td className="py-2.5 text-right text-slate-800">₹{(e.variance_value || 0).toLocaleString()}</td>
                      <td className="py-2.5 text-slate-500 font-sans text-[11px]">{e.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Start Count Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider font-heading">Start Physical Stock Verification</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleCreateCount} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Select Item to Count</label>
                <select value={form.item_id} onChange={e => setForm({ ...form, item_id: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800">
                  {items.map(i => <option key={i.id} value={i.id}>{i.item_code} - {i.item_name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Physical Counted Quantity</label>
                <input type="number" value={form.physical_quantity} onChange={e => setForm({ ...form, physical_quantity: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold" />
              </div>

              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center space-x-2 text-purple-700">
                  <EyeOff className="w-4 h-4" />
                  <span className="font-bold">Blind Count Option</span>
                </div>
                <input type="checkbox" checked={form.is_blind_count} onChange={e => setForm({ ...form, is_blind_count: e.target.checked })} />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-purple-600 text-white font-bold rounded-xl shadow-xs">Post Count & Reconcile</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
