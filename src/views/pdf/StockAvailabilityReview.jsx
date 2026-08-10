import React, { useState, useEffect } from 'react';
import { ClipboardCheck, CheckCircle2, ShoppingCart, Send, AlertTriangle, X } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

export default function StockAvailabilityReview() {
  const [reviews, setReviews] = useState([
    {
      id: 'rev-01',
      indent_number: 'IND-2026-001001',
      request_date: '2026-08-08',
      department: 'Information Technology',
      requested_by: 'David Miller',
      item_code: 'IT-LAP-0001',
      item_name: 'Dell Latitude 5440 Laptop',
      requested_qty: 20,
      on_hand_qty: 8,
      reserved_qty: 0,
      available_qty: 8,
      issue_from_stock_qty: 8,
      purchase_required_qty: 12,
      status: 'Under Review'
    }
  ]);

  const [selectedReview, setSelectedReview] = useState(null);
  const [actionChoice, setActionChoice] = useState('partial'); // issue-full, purchase-full, partial, substitute, reject

  const handleApplyReview = (e) => {
    e.preventDefault();
    if (!selectedReview) return;

    let issueQty = 0;
    let purchaseQty = 0;

    if (actionChoice === 'issue-full') {
      issueQty = selectedReview.requested_qty;
      purchaseQty = 0;
    } else if (actionChoice === 'purchase-full') {
      issueQty = 0;
      purchaseQty = selectedReview.requested_qty;
    } else if (actionChoice === 'partial') {
      issueQty = Math.min(selectedReview.available_qty, selectedReview.requested_qty);
      purchaseQty = selectedReview.requested_qty - issueQty;
    }

    const updated = reviews.map(r => r.id === selectedReview.id ? {
      ...r,
      issue_from_stock_qty: issueQty,
      purchase_required_qty: purchaseQty,
      status: 'Stock Reviewed'
    } : r);

    setReviews(updated);
    setSelectedReview(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 border border-slate-200/80 rounded-2xl shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 font-heading flex items-center space-x-2">
          <ClipboardCheck className="w-5 h-5 text-purple-600" />
          <span>13. Stock Availability Review Page</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">Allows the store team to check stock availability per indent line & split between Issue & Procurement (PDF Page 17).</p>
      </div>

      {/* Review Cards */}
      <div className="space-y-4">
        {reviews.map(rev => (
          <div key={rev.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4 hover:border-purple-200 transition">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-3">
                <span className="font-mono text-sm font-bold text-purple-700">{rev.indent_number}</span>
                <StatusBadge status={rev.status} />
                <span className="text-xs text-slate-500 font-medium">Req Date: {rev.request_date}</span>
                <span className="text-xs text-slate-800 font-bold">&bull; Dept: {rev.department}</span>
              </div>
              <button 
                onClick={() => { setSelectedReview(rev); setActionChoice('partial'); }}
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center space-x-1 shadow-xs transition"
              >
                <ClipboardCheck className="w-3.5 h-3.5" />
                <span>Review Stock Availability</span>
              </button>
            </div>

            {/* Item Details */}
            <div className="grid grid-cols-4 gap-4 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100 font-sans">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Requested Item</span>
                <span className="text-slate-800 font-bold">{rev.item_code} - {rev.item_name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Requested Qty</span>
                <span className="text-purple-700 font-mono font-bold">{rev.requested_qty} Units</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Available in Store</span>
                <span className="text-emerald-700 font-mono font-bold">{rev.available_qty} Units</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Procurement Required</span>
                <span className="text-amber-700 font-mono font-bold">{rev.purchase_required_qty} Units</span>
              </div>
            </div>

            {/* Split Outcome Preview */}
            <div className="flex items-center justify-between text-xs p-3 bg-purple-50/60 border border-purple-200/80 rounded-xl">
              <div className="flex items-center space-x-2 text-purple-800 font-bold">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                <span>Store Action Outcome:</span>
              </div>
              <div className="flex space-x-4 font-mono text-[11px]">
                <span className="text-emerald-700 font-bold">&bull; Issue from Stock: {rev.issue_from_stock_qty} Units</span>
                <span className="text-amber-700 font-bold">&bull; Create RFQ / Purchase: {rev.purchase_required_qty} Units</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Review Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider font-heading">Stock Availability Decision</h3>
              <button onClick={() => setSelectedReview(null)} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleApplyReview} className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 font-mono">
                <p className="text-slate-800 font-bold">{selectedReview.item_name}</p>
                <p className="text-slate-500">Requested: {selectedReview.requested_qty} | Available: {selectedReview.available_qty}</p>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Store Manager Action Choice (PDF Section 13)</label>
                <select value={actionChoice} onChange={e => setActionChoice(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold">
                  <option value="partial">1. Partial Issue ({selectedReview.available_qty}) + Purchase Balance ({selectedReview.requested_qty - selectedReview.available_qty})</option>
                  <option value="issue-full">2. Issue Full Quantity from Stock ({selectedReview.requested_qty})</option>
                  <option value="purchase-full">3. Purchase Full Quantity ({selectedReview.requested_qty})</option>
                  <option value="substitute">4. Use Substitute Item</option>
                  <option value="reject">5. Reject Due to Invalid Request</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setSelectedReview(null)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-purple-600 text-white font-bold rounded-xl shadow-xs">Apply Stock Action</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
