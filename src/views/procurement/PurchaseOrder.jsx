import React, { useState, useEffect } from 'react';
import { ShoppingCart, Printer } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import PrintModal from '../../components/common/PrintModal';

export default function PurchaseOrder() {
  const [pos, setPos] = useState([]);
  const [printDoc, setPrintDoc] = useState(null);

  useEffect(() => {
    fetchPOs();
  }, []);

  const fetchPOs = async () => {
    try {
      const res = await fetch('/api/purchase-orders');
      const data = await res.json();
      if (data.success) setPos(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 border border-slate-200/80 rounded-2xl shadow-xs flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-900 font-heading flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5 text-purple-600" />
            <span>Formal Purchase Order Commitments</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Commercial purchase commitments, snapshot rates, terms & PDF document printing.</p>
        </div>
      </div>

      {/* PO Cards */}
      <div className="space-y-4">
        {pos.map(po => (
          <div key={po.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4 hover:border-purple-200 transition">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-3">
                <span className="font-mono text-sm font-bold text-purple-700">{po.po_number}</span>
                <StatusBadge status={po.status} />
                <span className="text-xs text-slate-500">Date: {po.po_date}</span>
                <span className="text-xs text-slate-800 font-bold">&bull; Supplier: {po.supplier_name}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm font-bold text-emerald-700 font-mono">PO Value: ₹{(po.total_amount || 0).toLocaleString()}</span>
                <button 
                  onClick={() => setPrintDoc(po)}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center space-x-1 shadow-xs transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print PO Invoice</span>
                </button>
              </div>
            </div>

            {/* Terms & Delivery */}
            <div className="grid grid-cols-3 gap-4 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100 font-sans">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Payment Terms</span>
                <span className="text-slate-800 font-bold">{po.payment_terms || 'Net 30 Days'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Delivery Terms</span>
                <span className="text-slate-800 font-bold">{po.delivery_terms || 'FOB Destination'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Delivery Location</span>
                <span className="text-slate-800 font-bold">Central Goods Warehouse (WH-MAIN)</span>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-100 font-bold">
                    <th className="pb-2 font-sans">Item Code & Name</th>
                    <th className="pb-2 font-sans">Ordered Qty</th>
                    <th className="pb-2 font-sans">Received Qty</th>
                    <th className="pb-2 font-sans">Pending Qty</th>
                    <th className="pb-2 font-sans">Unit Rate</th>
                    <th className="pb-2 font-sans">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {(po.items || []).map((line, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 font-sans">
                        <span className="text-purple-700 font-mono font-bold block">{line.item_code}</span>
                        <span className="text-slate-800 font-semibold">{line.item_name || line.description_snapshot}</span>
                      </td>
                      <td className="py-2.5 font-bold text-slate-800">{line.ordered_quantity}</td>
                      <td className="py-2.5 text-emerald-700 font-bold">{line.received_quantity || 0}</td>
                      <td className="py-2.5 text-amber-700 font-bold">{line.pending_quantity || line.ordered_quantity}</td>
                      <td className="py-2.5 text-slate-700">₹{(line.unit_rate || 0).toLocaleString()}</td>
                      <td className="py-2.5 font-bold text-slate-900">₹{(line.line_total || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Print Document Modal */}
      <PrintModal 
        isOpen={!!printDoc}
        onClose={() => setPrintDoc(null)}
        docType="PURCHASE ORDER"
        docData={printDoc}
      />
    </div>
  );
}
