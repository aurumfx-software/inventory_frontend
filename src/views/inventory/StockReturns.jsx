import React, { useState, useEffect } from 'react';
import { RotateCcw, Plus, Search, X, CheckCircle2 } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

export default function StockReturns() {
  const [returns, setReturns] = useState([
    {
      id: 'ret-01',
      return_number: 'RET-2026-001',
      return_date: '2026-08-10',
      issue_reference: 'ISS-2026-005001',
      returned_by: 'David Miller',
      department: 'Information Technology',
      warehouse: 'WH-MAIN',
      item_name: 'Cat6 Ethernet Cable (305m)',
      item_code: 'IT-CBL-0002',
      quantity: 10,
      uom: 'Mtr',
      return_type: 'Unused material',
      condition: 'Good',
      reason: 'Project completed, unused excess cables returned to store.',
      status: 'Posted'
    }
  ]);

  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    issue_reference: 'ISS-2026-005001',
    return_type: 'Unused material',
    item_id: 'itm-01',
    quantity: 5,
    condition: 'Good',
    reason: 'Unused material returned after maintenance work.'
  });

  useEffect(() => {
    fetch('/api/items').then(r => r.json()).then(d => d.success && setItems(d.data));
  }, []);

  const handleCreateReturn = (e) => {
    e.preventDefault();
    const item = items.find(i => i.id === form.item_id) || items[0];

    const newReturn = {
      id: `ret-${Date.now()}`,
      return_number: `RET-2026-00${returns.length + 1}`,
      return_date: new Date().toISOString().split('T')[0],
      issue_reference: form.issue_reference,
      returned_by: 'Department Employee',
      department: 'Information Technology',
      warehouse: 'WH-MAIN',
      item_name: item?.item_name || 'Item',
      item_code: item?.item_code || 'ITM-01',
      quantity: Number(form.quantity),
      uom: item?.uom_symbol || 'Pcs',
      return_type: form.return_type,
      condition: form.condition,
      reason: form.reason,
      status: 'Posted'
    };

    setReturns([newReturn, ...returns]);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-5 border border-slate-200/80 rounded-2xl shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 font-heading flex items-center space-x-2">
            <RotateCcw className="w-5 h-5 text-purple-600" />
            <span>Stock Return Page (Department / Employee Returns)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Records unused, returnable, or damaged materials returned to stores (PDF Spec Section 22).</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center space-x-2 shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>+ Record Stock Return</span>
        </button>
      </div>

      {/* Returns List */}
      <div className="space-y-4">
        {returns.map(ret => (
          <div key={ret.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4 hover:border-purple-200 transition">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-3">
                <span className="font-mono text-sm font-bold text-purple-700">{ret.return_number}</span>
                <StatusBadge status={ret.status} />
                <span className="text-xs text-slate-500 font-mono">Date: {ret.return_date}</span>
                <span className="text-xs text-slate-800 font-bold">&bull; Ref: {ret.issue_reference}</span>
              </div>
              <span className="bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold px-2.5 py-1 rounded-full">
                Type: {ret.return_type}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-4 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100 font-sans">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Returned By</span>
                <span className="text-slate-800 font-bold">{ret.returned_by}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Department</span>
                <span className="text-slate-800 font-bold">{ret.department}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Item Condition</span>
                <span className="text-emerald-700 font-bold">{ret.condition}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Returned Qty</span>
                <span className="text-purple-700 font-mono font-bold">{ret.quantity} {ret.uom}</span>
              </div>
            </div>

            <div className="text-xs text-slate-600 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
              <strong className="text-slate-700">Return Reason & Findings:</strong> {ret.reason}
            </div>
          </div>
        ))}
      </div>

      {/* Record Return Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider font-heading">Record Material Stock Return</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleCreateReturn} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Return Type (PDF Section 22)</label>
                <select value={form.return_type} onChange={e => setForm({ ...form, return_type: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800">
                  <option value="Unused material">Unused material</option>
                  <option value="Returnable item returned">Returnable item returned</option>
                  <option value="Damaged return">Damaged return</option>
                  <option value="Wrong item return">Wrong item return</option>
                  <option value="Excess issue return">Excess issue return</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Select Returned Item</label>
                <select value={form.item_id} onChange={e => setForm({ ...form, item_id: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800">
                  {items.map(i => <option key={i.id} value={i.id}>{i.item_code} - {i.item_name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Returned Qty</label>
                  <input type="number" min="1" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold" />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Condition Value</label>
                  <select value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold text-emerald-700">
                    <option value="Good">Good (Increase Available Stock)</option>
                    <option value="Used but usable">Used but usable</option>
                    <option value="Damaged">Damaged (Quarantine Location)</option>
                    <option value="Repairable">Repairable</option>
                    <option value="Scrap">Scrap</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Return Reason</label>
                <textarea rows="2" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800" />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-purple-600 text-white font-bold rounded-xl shadow-xs">Post Stock Return</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
