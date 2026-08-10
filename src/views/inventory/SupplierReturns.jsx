import React, { useState, useEffect } from 'react';
import { Truck, Plus, Search, X, CheckCircle2, AlertTriangle } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

export default function SupplierReturns() {
  const [returns, setReturns] = useState([
    {
      id: 'sup-ret-01',
      return_number: 'SUP-RET-2026-001',
      return_date: '2026-08-10',
      grn_reference: 'GRN-2026-004001',
      supplier_name: 'Global Tech Supplies Ltd',
      item_name: 'Dell Latitude 5440 Laptop',
      item_code: 'IT-LAP-0001',
      quantity: 2,
      reason: 'Quality rejection (Screen pixel defect on inspection)',
      replacement_expected: true,
      credit_note_expected: false,
      status: 'Posted'
    }
  ]);

  const [suppliers, setSuppliers] = useState([]);
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    supplier_id: 'sup-01',
    grn_reference: 'GRN-2026-004001',
    item_id: 'itm-01',
    quantity: 1,
    reason: 'Quality rejection',
    replacement_expected: true,
    credit_note_expected: false,
    dispatch_details: 'Dispatched via Blue Dart Courier Ref #BD-9901'
  });

  useEffect(() => {
    fetch('/api/suppliers').then(r => r.json()).then(d => d.success && setSuppliers(d.data));
    fetch('/api/items').then(r => r.json()).then(d => d.success && setItems(d.data));
  }, []);

  const handleCreateSupplierReturn = (e) => {
    e.preventDefault();
    const sup = suppliers.find(s => s.id === form.supplier_id) || suppliers[0];
    const item = items.find(i => i.id === form.item_id) || items[0];

    const newReturn = {
      id: `sup-ret-${Date.now()}`,
      return_number: `SUP-RET-2026-00${returns.length + 1}`,
      return_date: new Date().toISOString().split('T')[0],
      grn_reference: form.grn_reference,
      supplier_name: sup?.supplier_name || 'Supplier Vendor',
      item_name: item?.item_name || 'Item',
      item_code: item?.item_code || 'ITM-01',
      quantity: Number(form.quantity),
      reason: form.reason,
      replacement_expected: form.replacement_expected,
      credit_note_expected: form.credit_note_expected,
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
            <Truck className="w-5 h-5 text-purple-600" />
            <span>Supplier Return Page (Vendor Returns & Rejections)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Records materials returned to supplier due to quality rejection, transit damage or mismatch (PDF Spec Section 23).</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center space-x-2 shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Supplier Return</span>
        </button>
      </div>

      {/* Supplier Returns List */}
      <div className="space-y-4">
        {returns.map(ret => (
          <div key={ret.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4 hover:border-purple-200 transition">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-3">
                <span className="font-mono text-sm font-bold text-purple-700">{ret.return_number}</span>
                <StatusBadge status={ret.status} />
                <span className="text-xs text-slate-500 font-mono">Date: {ret.return_date}</span>
                <span className="text-xs text-slate-800 font-bold">&bull; Supplier: {ret.supplier_name}</span>
              </div>
              <span className="bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold px-2.5 py-1 rounded-full flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{ret.reason}</span>
              </span>
            </div>

            <div className="grid grid-cols-4 gap-4 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100 font-sans">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">GRN Reference</span>
                <span className="text-purple-700 font-mono font-bold">{ret.grn_reference}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Returned Item</span>
                <span className="text-slate-800 font-bold">{ret.item_code} - {ret.item_name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Returned Quantity</span>
                <span className="text-rose-600 font-mono font-bold">-{ret.quantity} Units</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Settlement Action</span>
                <span className="text-emerald-700 font-bold">
                  {ret.replacement_expected ? 'Replacement Expected' : ret.credit_note_expected ? 'Credit Note Expected' : 'Refund'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Supplier Return Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider font-heading">Record Supplier Vendor Return</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleCreateSupplierReturn} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Select Supplier Vendor</label>
                <select value={form.supplier_id} onChange={e => setForm({ ...form, supplier_id: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800">
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.supplier_name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Return Reason (PDF Section 23)</label>
                <select value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold text-rose-700">
                  <option value="Quality rejection">Quality rejection</option>
                  <option value="Wrong item">Wrong item</option>
                  <option value="Excess supply">Excess supply</option>
                  <option value="Damaged in transit">Damaged in transit</option>
                  <option value="Expired material">Expired material</option>
                  <option value="Specification mismatch">Specification mismatch</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">GRN Ref No</label>
                  <input type="text" value={form.grn_reference} onChange={e => setForm({ ...form, grn_reference: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono" />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Returned Qty</label>
                  <input type="number" min="1" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold text-rose-600" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <label className="flex items-center space-x-2 cursor-pointer text-[11px] font-bold text-slate-700">
                  <input type="checkbox" checked={form.replacement_expected} onChange={e => setForm({ ...form, replacement_expected: e.target.checked, credit_note_expected: !e.target.checked })} />
                  <span>Replacement Expected</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer text-[11px] font-bold text-slate-700">
                  <input type="checkbox" checked={form.credit_note_expected} onChange={e => setForm({ ...form, credit_note_expected: e.target.checked, replacement_expected: !e.target.checked })} />
                  <span>Credit Note Expected</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-rose-600 text-white font-bold rounded-xl shadow-xs">Post Supplier Return</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
