import React from 'react';
import { X, Printer, QrCode, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function PrintModal({ isOpen, onClose, docType, docData }) {
  if (!isOpen || !docData) return null;

  const handlePrint = () => {
    window.print();
  };

  const isPO = docType?.toUpperCase().includes('PURCHASE ORDER') || docType?.toUpperCase().includes('PO');

  const totalExclTax = docData.total_amount || (docData.grand_total ? docData.grand_total - (docData.tax_amount || 0) : 0);
  const taxAmount = docData.tax_amount || (docData.grand_total ? docData.grand_total * 0.18 : 0);
  const cgst = taxAmount / 2;
  const sgst = taxAmount / 2;
  const grandTotal = docData.grand_total || (totalExclTax + taxAmount);

  const qrPayload = `PO:${docData.po_number || docData.indent_number || 'DOC'}|DATE:${docData.po_date || docData.request_date || ''}|VAL:${grandTotal}|STATUS:${docData.status || 'APPROVED'}`;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between no-print bg-slate-900">
          <div className="flex items-center space-x-2">
            <Printer className="w-5 h-5 text-purple-400" />
            <h2 className="font-bold text-sm text-slate-100 uppercase tracking-wider">
              Formal Document Preview - {docType} ({docData.po_number || docData.indent_number || docData.rfq_number || docData.grn_number})
            </h2>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={handlePrint}
              className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center space-x-2 shadow-lg transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Download PDF</span>
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 overflow-y-auto printable-area bg-white text-slate-900 font-sans">
          {/* Top Banner & Header */}
          <div className="flex justify-between items-start border-b-2 border-purple-900 pb-6 mb-6">
            <div>
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight font-heading">Apex Enterprises Pvt Ltd</h1>
              <p className="text-xs text-slate-600 mt-1">100 Industrial Park, Zone 4, Bangalore, KA 560001, India</p>
              <p className="text-xs text-slate-600">GSTIN: <span className="font-mono font-bold text-slate-800">29AAAAA0000A1Z5</span> | PAN: <span className="font-mono font-bold text-slate-800">AAAAA0000A</span></p>
              <p className="text-xs text-slate-600">Email: <span className="font-semibold text-purple-700">procurement@apexenterprises.com</span> | Web: www.apexenterprises.com</p>
            </div>
            <div className="text-right">
              <div className="inline-block bg-purple-900 text-white text-xs font-bold px-3 py-1.5 uppercase rounded-lg tracking-wider mb-2 font-mono">
                {docType} {docData.version_number ? `(Rev #${docData.version_number})` : ''}
              </div>
              <p className="text-sm font-mono font-bold text-slate-900 block">#{docData.po_number || docData.indent_number || docData.rfq_number || docData.grn_number}</p>
              <p className="text-xs text-slate-600 mt-0.5">PO Date: <span className="font-bold">{docData.po_date || docData.request_date || docData.rfq_date || docData.receipt_date}</span></p>
              <p className="text-[11px] text-emerald-700 font-bold uppercase mt-0.5">Status: {docData.status || 'Approved'}</p>
            </div>
          </div>

          {/* References Bar if present */}
          {(docData.quotation_number || docData.rfq_number || docData.indent_number || docData.buyer) && (
            <div className="grid grid-cols-4 gap-2 text-[11px] bg-purple-50/60 p-3 rounded-xl border border-purple-100 mb-6 font-mono">
              <div>
                <span className="text-purple-900 block text-[9px] uppercase font-bold font-sans">Buyer:</span>
                <span className="font-semibold text-slate-800">{docData.buyer || 'Purchase Officer'}</span>
              </div>
              <div>
                <span className="text-purple-900 block text-[9px] uppercase font-bold font-sans">Quotation Ref:</span>
                <span className="font-semibold text-purple-800">{docData.quotation_number || docData.quotation_reference || 'N/A'}</span>
              </div>
              <div>
                <span className="text-purple-900 block text-[9px] uppercase font-bold font-sans">RFQ Ref:</span>
                <span className="font-semibold text-purple-800">{docData.rfq_number || docData.rfq_reference || 'N/A'}</span>
              </div>
              <div>
                <span className="text-purple-900 block text-[9px] uppercase font-bold font-sans">Indent Ref:</span>
                <span className="font-semibold text-purple-800">{docData.indent_number || docData.indent_reference || 'N/A'}</span>
              </div>
            </div>
          )}

          {/* Supplier & Delivery Details */}
          <div className="grid grid-cols-2 gap-6 text-xs mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <p className="font-bold text-slate-900 uppercase tracking-wider text-[10px] text-purple-900 mb-1 font-sans">Supplier / Vendor Details:</p>
              <p className="font-bold text-sm text-slate-900">{docData.supplier_name || 'Infotech Systems Ltd'}</p>
              <p className="text-slate-600 mt-1 whitespace-pre-line">{docData.supplier_address || '45 Technology Park, Whitefield, Bangalore'}</p>
              <p className="text-slate-700 mt-1"><span className="font-semibold">GSTIN:</span> {docData.supplier_gst || '29AAACI1234F1Z9'}</p>
              <p className="text-slate-700"><span className="font-semibold">Contact:</span> {docData.supplier_contact || docData.supplier_email || 'sales@supplier.com'}</p>
            </div>
            <div>
              <p className="font-bold text-slate-900 uppercase tracking-wider text-[10px] text-purple-900 mb-1 font-sans">Delivery & Billing Addresses:</p>
              <p className="font-bold text-slate-800">Billing Address:</p>
              <p className="text-slate-600 mb-2">{docData.billing_address || 'Apex HQ, 100 Industrial Park, Bangalore'}</p>
              <p className="font-bold text-slate-800">Delivery Address:</p>
              <p className="text-slate-600">{docData.delivery_address || 'Central Goods Warehouse (WH-MAIN), Gate 2, Bangalore'}</p>
            </div>
          </div>

          {/* Terms Bar */}
          <div className="grid grid-cols-3 gap-4 text-xs mb-6 bg-slate-100/70 p-3 rounded-xl border border-slate-200 font-sans">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Payment Terms:</span>
              <span className="font-bold text-slate-800">{docData.payment_terms || 'Net 30 Days'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Delivery Terms:</span>
              <span className="font-bold text-slate-800">{docData.delivery_terms || 'FOB Destination'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Freight Terms & Currency:</span>
              <span className="font-bold text-slate-800">{docData.freight_terms || 'Freight Prepaid'} ({docData.currency || 'INR'})</span>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto mb-6 border border-slate-300 rounded-xl">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white uppercase text-[10px]">
                  <th className="p-2.5 border-b border-slate-900">#</th>
                  <th className="p-2.5 border-b border-slate-900 font-mono">Item Code</th>
                  <th className="p-2.5 border-b border-slate-900">Item Description</th>
                  <th className="p-2.5 border-b border-slate-900 text-right">Qty</th>
                  <th className="p-2.5 border-b border-slate-900 text-center">Unit</th>
                  <th className="p-2.5 border-b border-slate-900 text-right">Unit Rate (₹)</th>
                  <th className="p-2.5 border-b border-slate-900 text-right">Disc (%)</th>
                  <th className="p-2.5 border-b border-slate-900 text-right">Tax (%)</th>
                  <th className="p-2.5 border-b border-slate-900 text-right">Line Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-sans">
                {(docData.items || []).map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-2.5 text-slate-500 font-mono text-center">{idx + 1}</td>
                    <td className="p-2.5 font-mono font-bold text-purple-900">{item.item_code}</td>
                    <td className="p-2.5">
                      <span className="font-semibold text-slate-900 block">{item.item_name || item.description_snapshot}</span>
                      {item.delivery_date && <span className="text-[10px] text-slate-500">Deliv: {item.delivery_date}</span>}
                    </td>
                    <td className="p-2.5 text-right font-bold text-slate-900 font-mono">{item.ordered_quantity || item.requested_qty || item.received_qty || 1}</td>
                    <td className="p-2.5 text-center text-slate-600">{item.unit || 'Pcs'}</td>
                    <td className="p-2.5 text-right font-mono">₹{Number(item.unit_rate || item.estimated_rate || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="p-2.5 text-right font-mono text-slate-600">{item.discount || 0}%</td>
                    <td className="p-2.5 text-right font-mono text-slate-600">{item.tax || 18}%</td>
                    <td className="p-2.5 text-right font-mono font-bold text-slate-900">₹{Number(item.line_total || item.estimated_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tax Summary Breakdown & Totals */}
          <div className="grid grid-cols-2 gap-6 items-start pt-2 mb-6">
            {/* Terms and Conditions */}
            <div className="text-[11px] text-slate-600 space-y-1 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p className="font-bold text-slate-900 uppercase text-[10px] tracking-wider mb-1">Terms & Conditions:</p>
              <p className="text-slate-700 text-[10px] leading-relaxed whitespace-pre-line">
                {docData.terms_conditions || "1. Goods are subject to physical inspection and quality approval upon receipt at destination warehouse.\n2. Invoices must reference this PO Number, HSN/SAC code, and company GSTIN.\n3. Defective or non-compliant materials will be returned at vendor's cost."}
              </p>
            </div>

            {/* Financial Tax Summary Box */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal (Excl. Tax):</span>
                <span>₹{Number(totalExclTax).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              {docData.discount_amount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Total Discount:</span>
                  <span>-₹{Number(docData.discount_amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>CGST (9%):</span>
                <span>₹{Number(cgst).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>SGST (9%):</span>
                <span>₹{Number(sgst).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-slate-700 font-bold border-t border-slate-300 pt-1.5">
                <span>Total Tax (GST 18%):</span>
                <span>₹{Number(taxAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-slate-900 border-t-2 border-slate-900 pt-2 font-sans">
                <span>Grand Total:</span>
                <span className="text-purple-900 font-mono">₹{Number(grandTotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Footer: QR Code & Authorized Signatures */}
          <div className="flex justify-between items-end border-t border-slate-300 pt-6 mt-4">
            {/* Verification QR Code Display */}
            <div className="flex items-center space-x-3 bg-purple-50/80 p-3 rounded-2xl border border-purple-200">
              <div className="bg-white p-2 border border-purple-300 rounded-xl shadow-xs flex items-center justify-center">
                <QrCode className="w-12 h-12 text-purple-950" />
              </div>
              <div className="text-[10px]">
                <p className="font-bold text-purple-950 flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline" />
                  <span>Digital Verification QR</span>
                </p>
                <p className="text-slate-500 font-mono text-[9px] mt-0.5 max-w-[200px] truncate">{qrPayload}</p>
                <p className="text-slate-400 text-[8px] mt-0.5">Scan to verify document authenticity.</p>
              </div>
            </div>

            {/* Signature Block */}
            <div className="text-right">
              <div className="border border-dashed border-slate-400 bg-slate-50 rounded-xl p-3 w-56 text-center inline-block">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                <p className="font-bold text-xs text-slate-900">{docData.buyer || 'Authorized Signatory'}</p>
                <p className="text-[10px] text-slate-500">Authorized Purchasing Officer</p>
                <p className="text-[9px] font-mono text-purple-800 font-semibold mt-1">[ Digitally Approved ]</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

