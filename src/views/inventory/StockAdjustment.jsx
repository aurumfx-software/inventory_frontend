import React, { useState, useEffect } from 'react';
import { Sliders, Plus, Search, X, CheckCircle2, RotateCcw, FileText, AlertCircle } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

export default function StockAdjustment() {
  const [adjustments, setAdjustments] = useState([]);
  const [items, setItems] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    warehouse_id: 'wh-01',
    item_id: 'itm-01',
    adjustment_type: 'Damage',
    system_qty: 50,
    actual_qty: 48,
    reason: 'Physical damage noticed during shelf reorganization.',
    supporting_document: 'DOC-INSP-9901.pdf',
    remarks: 'Approved by Stores Lead'
  });

  useEffect(() => {
    fetchAdjustments();
    fetch('/api/items').then(r => r.json()).then(d => d.success && setItems(d.data || []));
    fetch('/api/warehouses').then(r => r.json()).then(d => d.success && setWarehouses(d.data || []));
  }, []);

  const fetchAdjustments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stock-adjustments');
      const data = await res.json();
      if (data.success) setAdjustments(data.data || []);
    } catch (err) {
      console.error('Failed to fetch adjustments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdjustment = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/stock-adjustments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        fetchAdjustments();
      }
    } catch (err) {
      console.error('Failed to create adjustment:', err);
    }
  };

  const handleReverseAdjustment = async (adjId) => {
    if (!window.confirm('Are you sure you want to create a reversal entry for this stock adjustment?')) return;
    try {
      const res = await fetch(`/api/stock-adjustments/${adjId}/reverse`, { method: 'POST' });
      const data = await res.json();
      if (data.success) fetchAdjustments();
    } catch (err) {
      console.error('Failed to reverse adjustment:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-5 border border-slate-200/80 rounded-2xl shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 font-heading flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-purple-600" />
            <span>Stock Adjustment Page</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Corrects inventory differences caused by damage, loss, counting errors, or data migration with reversal tracking.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center space-x-2 shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Stock Adjustment</span>
        </button>
      </div>

      {/* Adjustments Directory */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200 font-bold font-sans">
                <th className="p-3.5">Adj Number</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Warehouse</th>
                <th className="p-3.5">Item Code & Name</th>
                <th className="p-3.5">Adjustment Type</th>
                <th className="p-3.5 font-mono text-right">System Qty</th>
                <th className="p-3.5 font-mono text-right">Actual Qty</th>
                <th className="p-3.5 font-mono text-right">Difference</th>
                <th className="p-3.5">Reason</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {adjustments.map(adj => (
                <tr key={adj.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-3.5 font-bold text-purple-700">{adj.adjustment_number}</td>
                  <td className="p-3.5 text-slate-500 font-sans">{adj.adjustment_date}</td>
                  <td className="p-3.5 font-sans text-slate-600">{adj.warehouse_name}</td>
                  <td className="p-3.5 font-sans text-slate-800">
                    <span className="font-mono text-purple-800 font-bold mr-1">{adj.item_code}</span>
                    <span>{adj.item_name}</span>
                  </td>
                  <td className="p-3.5 font-sans font-bold text-slate-800">{adj.adjustment_type}</td>
                  <td className="p-3.5 text-right font-bold text-slate-700">{adj.system_qty}</td>
                  <td className="p-3.5 text-right font-bold text-slate-900">{adj.actual_qty}</td>
                  <td className={`p-3.5 text-right font-bold ${adj.difference >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {adj.difference > 0 ? `+${adj.difference}` : adj.difference}
                  </td>
                  <td className="p-3.5 font-sans text-slate-600 truncate max-w-[200px]">{adj.reason}</td>
                  <td className="p-3.5 text-center font-sans">
                    {adj.is_reversed ? (
                      <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[10px] font-bold">Reversed ({adj.reversal_ref})</span>
                    ) : (
                      <StatusBadge status={adj.approval_status || 'Approved'} />
                    )}
                  </td>
                  <td className="p-3.5 text-center font-sans">
                    {!adj.is_reversed && (
                      <button
                        onClick={() => handleReverseAdjustment(adj.id)}
                        className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center justify-center space-x-1 hover:underline cursor-pointer mx-auto"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reverse</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Adjustment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider font-heading">Post Stock Adjustment Voucher</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleCreateAdjustment} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Adjustment Type *</label>
                  <select
                    value={form.adjustment_type}
                    onChange={e => setForm({ ...form, adjustment_type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold"
                  >
                    <option value="Positive adjustment">Positive adjustment (+ Stock)</option>
                    <option value="Negative adjustment">Negative adjustment (- Stock)</option>
                    <option value="Damage">Damage</option>
                    <option value="Expiry">Expiry</option>
                    <option value="Theft or loss">Theft or loss</option>
                    <option value="Data correction">Data correction</option>
                    <option value="Opening balance">Opening balance</option>
                    <option value="Scrap">Scrap</option>
                    <option value="Found stock">Found stock</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Warehouse *</label>
                  <select
                    value={form.warehouse_id}
                    onChange={e => setForm({ ...form, warehouse_id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold"
                  >
                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.wh_name || w.name}</option>)}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">Select Item *</label>
                  <select
                    value={form.item_id}
                    onChange={e => {
                      const selItem = items.find(i => i.id === e.target.value);
                      setForm({
                        ...form,
                        item_id: e.target.value,
                        system_qty: Number(selItem?.on_hand_qty || 50)
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold"
                  >
                    {items.map(i => <option key={i.id} value={i.id}>{i.item_code} - {i.item_name} (System: {i.on_hand_qty || 50})</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">System Quantity</label>
                  <input
                    type="number"
                    value={form.system_qty}
                    onChange={e => setForm({ ...form, system_qty: Number(e.target.value) })}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-mono font-bold cursor-not-allowed"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Actual Physical Quantity *</label>
                  <input
                    type="number"
                    value={form.actual_qty}
                    onChange={e => setForm({ ...form, actual_qty: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-purple-900 font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Reason for Difference *</label>
                <textarea
                  rows="2"
                  value={form.reason}
                  onChange={e => setForm({ ...form, reason: e.target.value })}
                  placeholder="State exact cause for variance..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-sans"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Supporting Document Reference</label>
                <input
                  type="text"
                  value={form.supporting_document}
                  onChange={e => setForm({ ...form, supporting_document: e.target.value })}
                  placeholder="Survey report / approval file name..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-purple-600 text-white font-bold rounded-xl shadow-xs cursor-pointer">Post Stock Adjustment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
