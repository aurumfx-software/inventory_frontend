import React, { useState, useEffect } from 'react';
import { ClipboardCheck, Plus, CheckCircle2, X } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

export default function GRNInspection() {
  const [grns, setGrns] = useState([]);
  const [pos, setPos] = useState([]);
  const [showGrnModal, setShowGrnModal] = useState(false);
  const [showInspectionModal, setShowInspectionModal] = useState(null);

  const [inspectForm, setInspectForm] = useState({
    pass_fail_result: 'PASSED',
    actual_results: 'All dimensions, material specs and packaging criteria verified successfully.',
    remarks: 'Quality check completed.'
  });

  const [grnForm, setGrnForm] = useState({
    po_id: '',
    supplier_invoice_number: 'INV-9901',
    delivery_challan_number: 'DC-8810',
    vehicle_number: 'KA-01-EA-5566',
    warehouse_id: 'wh-01',
    received_qty: 10,
    accepted_qty: 10,
    rejected_qty: 0,
    batch_number: 'BAT-2026-CBL99',
    serial_numbers: ['DELL-LAT-9005', 'DELL-LAT-9006']
  });

  useEffect(() => {
    fetchGrns();
    fetch('/api/purchase-orders').then(r => r.json()).then(d => d.success && setPos(d.data));
  }, []);

  const fetchGrns = async () => {
    try {
      const res = await fetch('/api/goods-receipts');
      const data = await res.json();
      if (data.success) setGrns(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateGrn = async (e) => {
    e.preventDefault();
    try {
      const po = pos.find(p => p.id === grnForm.po_id) || pos[0];
      const poItem = po?.items[0] || {};

      const res = await fetch('/api/goods-receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          po_id: po?.id,
          supplier_invoice_number: grnForm.supplier_invoice_number,
          delivery_challan_number: grnForm.delivery_challan_number,
          vehicle_number: grnForm.vehicle_number,
          warehouse_id: grnForm.warehouse_id,
          items: [
            {
              po_item_id: poItem.id,
              item_id: poItem.item_id || 'itm-01',
              ordered_qty: poItem.ordered_quantity || 10,
              received_qty: Number(grnForm.received_qty),
              accepted_qty: Number(grnForm.accepted_qty),
              rejected_qty: Number(grnForm.rejected_qty),
              batch_number: grnForm.batch_number,
              serial_numbers: grnForm.serial_numbers
            }
          ]
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowGrnModal(false);
        fetchGrns();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRecordInspection = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/quality-inspections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grn_id: showInspectionModal.id,
          ...inspectForm
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowInspectionModal(null);
        fetchGrns();
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
            <ClipboardCheck className="w-5 h-5 text-purple-600" />
            <span>Goods Receipt Note (GRN) & Quality Inspection</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Physical goods receipt, quality parameter verification & atomic stock posting.</p>
        </div>
        <button 
          onClick={() => setShowGrnModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center space-x-2 shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Goods Receipt (GRN)</span>
        </button>
      </div>

      {/* GRN List */}
      <div className="space-y-4">
        {grns.map(grn => (
          <div key={grn.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4 hover:border-purple-200 transition">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-3">
                <span className="font-mono text-sm font-bold text-purple-700">{grn.grn_number}</span>
                <StatusBadge status={grn.status} />
                <span className="text-xs text-slate-500">Date: {grn.receipt_date}</span>
                <span className="text-xs text-slate-800 font-bold">&bull; Vendor: {grn.supplier_name}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                  grn.inspection_status === 'Inspected & Passed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {grn.inspection_status || 'Pending Inspection'}
                </span>
                {grn.inspection_status === 'Pending Inspection' && (
                  <button 
                    onClick={() => setShowInspectionModal(grn)}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center space-x-1 shadow-xs transition"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Quality Check</span>
                  </button>
                )}
              </div>
            </div>

            {/* Document Info */}
            <div className="grid grid-cols-4 gap-4 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100 font-mono">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold font-sans">Invoice No</span>
                <span className="text-slate-800 font-semibold">{grn.supplier_invoice_number}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold font-sans">Challan No</span>
                <span className="text-slate-800 font-semibold">{grn.delivery_challan_number}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold font-sans">Vehicle No</span>
                <span className="text-slate-800 font-semibold">{grn.vehicle_number}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold font-sans">PO Reference</span>
                <span className="text-purple-700 font-bold">{grn.po_number || 'Direct PO'}</span>
              </div>
            </div>

            {/* Received Items */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-100 font-bold">
                    <th className="pb-2 font-sans">Item Code & Name</th>
                    <th className="pb-2 font-sans">Ordered</th>
                    <th className="pb-2 font-sans">Received</th>
                    <th className="pb-2 font-sans">Accepted</th>
                    <th className="pb-2 font-sans">Rejected</th>
                    <th className="pb-2 font-sans">Batch / Serial Numbers</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {(grn.items || []).map((line, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 font-sans">
                        <span className="text-purple-700 font-mono font-bold block">{line.item_code}</span>
                        <span className="text-slate-800 font-semibold">{line.item_name}</span>
                      </td>
                      <td className="py-2.5 text-slate-500">{line.ordered_qty}</td>
                      <td className="py-2.5 font-bold text-slate-900">{line.received_qty}</td>
                      <td className="py-2.5 text-emerald-700 font-bold">{line.accepted_qty}</td>
                      <td className="py-2.5 text-rose-600 font-bold">{line.rejected_qty || 0}</td>
                      <td className="py-2.5 text-slate-700 text-[11px] font-sans">
                        {line.batch_number && <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md font-mono mr-2 text-purple-700 font-bold">Batch: {line.batch_number}</span>}
                        {line.serial_numbers && line.serial_numbers.length > 0 && (
                          <span className="text-purple-700 font-mono font-semibold">Serials: {line.serial_numbers.join(', ')}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Create GRN Modal */}
      {showGrnModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider font-heading">Record Goods Receipt Note (GRN)</h3>
              <button onClick={() => setShowGrnModal(false)} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleCreateGrn} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Select Purchase Order (PO)</label>
                <select value={grnForm.po_id} onChange={e => setGrnForm({ ...grnForm, po_id: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono">
                  {pos.map(p => <option key={p.id} value={p.id}>{p.po_number} - {p.supplier_name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Invoice Number</label>
                  <input type="text" value={grnForm.supplier_invoice_number} onChange={e => setGrnForm({ ...grnForm, supplier_invoice_number: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800" />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Challan Number</label>
                  <input type="text" value={grnForm.delivery_challan_number} onChange={e => setGrnForm({ ...grnForm, delivery_challan_number: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Received Qty</label>
                  <input type="number" value={grnForm.received_qty} onChange={e => setGrnForm({ ...grnForm, received_qty: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold" />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Accepted Qty</label>
                  <input type="number" value={grnForm.accepted_qty} onChange={e => setGrnForm({ ...grnForm, accepted_qty: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-emerald-700 font-bold" />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Batch Number</label>
                  <input type="text" value={grnForm.batch_number} onChange={e => setGrnForm({ ...grnForm, batch_number: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono" />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowGrnModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-purple-600 text-white font-bold rounded-xl shadow-xs">Post GRN & Update Stock</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quality Inspection Modal */}
      {showInspectionModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider font-heading">Quality Inspection Checklist</h3>
              <button onClick={() => setShowInspectionModal(null)} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleRecordInspection} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Inspection Outcome</label>
                <select value={inspectForm.pass_fail_result} onChange={e => setInspectForm({ ...inspectForm, pass_fail_result: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold">
                  <option value="PASSED">PASSED (Accept Full Lot)</option>
                  <option value="ACCEPTED_WITH_DEVIATION">ACCEPTED WITH DEVIATION</option>
                  <option value="REJECTED">REJECTED (Quality Spec Failure)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-bold mb-1">Actual Inspection Findings</label>
                <textarea rows="3" value={inspectForm.actual_results} onChange={e => setInspectForm({ ...inspectForm, actual_results: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800" />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowInspectionModal(null)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-purple-600 text-white font-bold rounded-xl shadow-xs">Submit Inspection</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
