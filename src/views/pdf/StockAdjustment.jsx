import React, { useState, useEffect } from 'react';
import { Sliders, Plus, Search, X, RotateCcw } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

export default function StockAdjustment() {
  const [adjustments, setAdjustments] = useState([
    {
      id: 'adj-01',
      adjustment_number: 'ADJ-2026-007001',
      adjustment_date: '2026-08-10',
      warehouse: 'WH-MAIN',
      item_name: 'Industrial Cleaning Solvent',
      item_code: 'IND-SLV-0004',
      adjustment_type: 'Positive adjustment',
      system_qty: 30,
      actual_qty: 32,
      difference: 2,
      reason: 'Physical count found 2 additional unrecorded cans in shelf B.',
      status: 'Approved'
    }
  ]);

  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    adjustment_type: 'Positive adjustment',
    item_id: 'itm-01',
    actual_qty: 32,
    reason: 'Annual Stock Reconciliation'
  });

  useEffect(() => {
    fetch('/api/items').then(r => r.json()).then(d => d.success && setItems(d.data));
  }, []);

  const handleCreateAdjustment = (e) => {
    e.preventDefault();
    const item = items.find(i => i.id === form.item_id) || items[0];
    const sysQty = item?.on_hand_qty || 10;
    const diff = Number(form.actual_qty) - sysQty;

    const newAdj = {
      id: `adj-${Date.now()}`,
      adjustment_number: `ADJ-2026-00${adjustments.length + 1}`,
      adjustment_date: new Date().toISOString().split('T')[0],
      warehouse: 'WH-MAIN',
      item_name: item?.item_name || 'Item',
      item_code: item?.item_code || 'ITM-01',
      adjustment_type: form.adjustment_type,
      system_qty: sysQty,
      actual_qty: Number(form.actual_qty),
      difference: diff,
      reason: form.reason,
      status: 'Approved'
    };

    setAdjustments([newAdj, ...adjustments]);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-5 border border-slate-200/80 rounded-2xl shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 font-heading flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-purple-600" />
            <span>25. Stock Adjustment Page</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Corrects inventory differences caused by damage, loss, counting errors or system migration (PDF Page 27-28).</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center space-x-2 shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Stock Adjustment</span>
        </button>
      </div>

      {/* Adjustments Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200 font-bold font-sans">
              <th className="p-3.5">Adj Number</th>
              <th className="p-3.5">Date</th>
              <th className="p-3.5">Adjustment Type</th>
              <th className="p-3.5">Item Name</th>
              <th className="p-3.5 font-mono text-right">System Qty</th>
              <th className="p-3.5 font-mono text-right">Actual Qty</th>
              <th className="p-3.5 font-mono text-right">Difference</th>
              <th className="p-3.5">Audit Reason</th>
              <th className="p-3.5 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {adjustments.map(adj => (
              <tr key={adj.id} className="hover:bg-slate-50/80 transition">
                <td className="p-3.5 font-bold text-purple-700">{adj.adjustment_number}</td>
                <td className="p-3.5 text-slate-500 font-sans">{adj.adjustment_date}</td>
                <td className="p-3.5 font-bold text-slate-800 font-sans">{adj.adjustment_type}</td>
                <td className="p-3.5 text-slate-800 font-sans font-semibold">{adj.item_code} - {adj.item_name}</td>
                <td className="p-3.5 text-right text-slate-500">{adj.system_qty}</td>
                <td className="p-3.5 text-right font-bold text-purple-700">{adj.actual_qty}</td>
                <td className={`p-3.5 text-right font-bold ${adj.difference > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {adj.difference > 0 ? `+${adj.difference}` : adj.difference}
                </td>
                <td className="p-3.5 text-slate-600 font-sans text-[11px]">{adj.reason}</td>
                <td className="p-3.5 text-right font-sans"><StatusBadge status={adj.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider font-heading">Post Stock Adjustment Entry</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleCreateAdjustment} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Adjustment Type (PDF Section 25)</label>
                <select value={form.adjustment_type} onChange={e => setForm({ ...form, adjustment_type: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold">
                  <option value="Positive adjustment">Positive adjustment (+ Found Stock)</option>
                  <option value="Negative adjustment">Negative adjustment (- Shortage)</option>
                  <option value="Damage">Damage</option>
                  <option value="Expiry">Expiry</option>
                  <option value="Theft or loss">Theft or loss</option>
                  <option value="Data correction">Data correction</option>
                  <option value="Scrap">Scrap</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Select Item</label>
                <select value={form.item_id} onChange={e => setForm({ ...form, item_id: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800">
                  {items.map(i => <option key={i.id} value={i.id}>{i.item_code} - {i.item_name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Actual Physical Count Qty</label>
                <input type="number" value={form.actual_qty} onChange={e => setForm({ ...form, actual_qty: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold" />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Audit Reason</label>
                <textarea rows="2" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800" />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-purple-600 text-white font-bold rounded-xl shadow-xs">Post Adjustment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
