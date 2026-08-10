import React from 'react';
import { X, Printer, Download, CheckCircle2 } from 'lucide-react';

export default function PrintModal({ isOpen, onClose, docType, docData }) {
  if (!isOpen || !docData) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Bar */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between no-print">
          <div className="flex items-center space-x-2">
            <Printer className="w-5 h-5 text-indigo-400" />
            <h2 className="font-bold text-sm text-slate-100 uppercase tracking-wider">
              Document Preview - {docType} ({docData.po_number || docData.indent_number || docData.rfq_number || docData.grn_number})
            </h2>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={handlePrint}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center space-x-2 shadow-lg transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="p-8 overflow-y-auto printable-area bg-white text-slate-900">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-6">
            <div>
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Apex Enterprises Pvt Ltd</h1>
              <p className="text-xs text-slate-600 mt-1">100 Industrial Park, Zone 4, Bangalore, India</p>
              <p className="text-xs text-slate-600">GSTIN: 29AAAAA0000A1Z5 | PAN: AAAAA0000A</p>
              <p className="text-xs text-slate-600">Email: procurement@apexenterprises.com</p>
            </div>
            <div className="text-right">
              <div className="inline-block bg-slate-900 text-white text-xs font-bold px-3 py-1 uppercase rounded tracking-wider mb-2">
                {docType}
              </div>
              <p className="text-sm font-mono font-bold text-slate-900">#{docData.po_number || docData.indent_number || docData.rfq_number || docData.grn_number}</p>
              <p className="text-xs text-slate-600 mt-1">Date: {docData.po_date || docData.request_date || docData.rfq_date || docData.receipt_date}</p>
            </div>
          </div>

          {/* Parties */}
          <div className="grid grid-cols-2 gap-8 text-xs mb-6 bg-slate-50 p-4 rounded border border-slate-200">
            <div>
              <p className="font-bold text-slate-900 uppercase tracking-wider mb-1">Supplier / Vendor Details:</p>
              <p className="font-bold text-slate-800">{docData.supplier_name || 'Infotech Systems Ltd'}</p>
              <p className="text-slate-600">{docData.supplier_address || '45 Technology Park, Whitefield, Bangalore'}</p>
              <p className="text-slate-600">GSTIN: {docData.supplier_gst || '29AAACI1234F1Z9'}</p>
            </div>
            <div>
              <p className="font-bold text-slate-900 uppercase tracking-wider mb-1">Delivery & Billing Location:</p>
              <p className="font-bold text-slate-800">Central Goods Warehouse (WH-MAIN)</p>
              <p className="text-slate-600">Plot 12 Industrial Hub, Gate 2</p>
              <p className="text-slate-600">Payment Terms: {docData.payment_terms || 'Net 30 Days'}</p>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full text-xs text-left border-collapse mb-6">
            <thead>
              <tr className="bg-slate-900 text-white uppercase text-[10px]">
                <th className="p-2 border border-slate-900">#</th>
                <th className="p-2 border border-slate-900">Item Code</th>
                <th className="p-2 border border-slate-900">Description</th>
                <th className="p-2 border border-slate-900 text-right">Qty</th>
                <th className="p-2 border border-slate-900 text-right">Unit Rate (₹)</th>
                <th className="p-2 border border-slate-900 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 border border-slate-300">
              {(docData.items || []).map((item, idx) => (
                <tr key={idx}>
                  <td className="p-2 border border-slate-300">{idx + 1}</td>
                  <td className="p-2 border border-slate-300 font-mono font-semibold">{item.item_code}</td>
                  <td className="p-2 border border-slate-300">{item.item_name || item.description_snapshot}</td>
                  <td className="p-2 border border-slate-300 text-right font-bold">{item.ordered_quantity || item.requested_qty || item.received_qty}</td>
                  <td className="p-2 border border-slate-300 text-right font-mono">₹{(item.unit_rate || item.estimated_rate || 0).toLocaleString()}</td>
                  <td className="p-2 border border-slate-300 text-right font-mono font-bold">₹{(item.line_total || item.estimated_amount || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals & Signatures */}
          <div className="flex justify-between items-end pt-4 border-t border-slate-300">
            <div className="text-[11px] text-slate-600 max-w-sm space-y-1">
              <p className="font-bold text-slate-800">Terms & Conditions:</p>
              <ol className="list-decimal list-inside space-y-0.5 text-[10px]">
                <li>Goods subject to inspection upon delivery.</li>
                <li>Invoice must quote PO number and GSTIN.</li>
                <li>Returns accepted for damaged/defective items.</li>
              </ol>
            </div>
            <div className="text-right text-xs">
              <p className="text-slate-600">Total Amount Excl Tax: ₹{((docData.total_amount || docData.total_estimated_amount || 0) * 0.82).toFixed(2)}</p>
              <p className="text-slate-600">Estimated Tax (GST 18%): ₹{((docData.total_amount || docData.total_estimated_amount || 0) * 0.18).toFixed(2)}</p>
              <p className="text-base font-bold text-slate-900 mt-1">Grand Total: ₹{(docData.total_amount || docData.total_estimated_amount || 0).toLocaleString()}</p>
              <div className="mt-8 pt-4 border-t border-slate-400 inline-block w-48 text-center">
                <p className="font-bold text-slate-800">Authorized Signatory</p>
                <p className="text-[10px] text-slate-500">(Digitally Verified)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
