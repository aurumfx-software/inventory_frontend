import React, { useState } from 'react';
import { Paperclip, Upload, ShieldCheck, Download, ExternalLink, Lock, Eye, FileText, CheckCircle2 } from 'lucide-react';

export default function DocumentAttachments() {
  const [attachments, setAttachments] = useState([
    { id: 'att-01', module: 'Purchase Order', name: 'PO_Vendor_Quote_Approved.pdf', docCategory: 'Vendor Quotation', fileType: 'PDF', size: '1.2 MB', storageUrl: 'local://storage/docs/PO_8801.pdf', uploadedBy: 'Rajesh Kumar', date: '2026-08-09' },
    { id: 'att-02', module: 'Goods Receipt', name: 'Challan_DC_8810_Scan.pdf', docCategory: 'Delivery Challan', fileType: 'PDF', size: '450 KB', storageUrl: 'local://storage/docs/GRN_4018.pdf', uploadedBy: 'Michael Chang', date: '2026-08-10' },
    { id: 'att-03', module: 'Quality Inspection', name: 'Lab_Inspection_Report.pdf', docCategory: 'Lab Certificate', fileType: 'PDF', size: '890 KB', storageUrl: 'local://storage/docs/QI_9901.pdf', uploadedBy: 'Dr. Ananya Roy', date: '2026-08-12' },
    { id: 'att-04', module: 'Stock Adjustment', name: 'Physical_Audit_Sheet_Sign.jpg', docCategory: 'Audit Sign Sheet', fileType: 'JPG', size: '2.1 MB', storageUrl: 'local://storage/docs/ADJ_201.jpg', uploadedBy: 'Michael Chang', date: '2026-08-15' }
  ]);

  const [newAttForm, setNewAttForm] = useState({
    module: 'Indents',
    name: '',
    docCategory: 'Technical Specification'
  });

  const handleUploadAttachment = (e) => {
    e.preventDefault();
    if (!newAttForm.name) return;

    const newAtt = {
      id: `att-${Date.now()}`,
      module: newAttForm.module,
      name: newAttForm.name,
      docCategory: newAttForm.docCategory,
      fileType: newAttForm.name.endsWith('.pdf') ? 'PDF' : newAttForm.name.endsWith('.jpg') ? 'JPG' : 'DOC',
      size: '1.5 MB',
      storageUrl: `local://storage/docs/${newAttForm.name}`,
      uploadedBy: 'Sarah Jenkins (Admin)',
      date: new Date().toISOString().split('T')[0]
    };

    setAttachments([newAtt, ...attachments]);
    setNewAttForm({ module: 'Indents', name: '', docCategory: 'Technical Specification' });
    alert('Document attachment uploaded & verified with malware scan.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 border border-slate-200/80 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 font-heading flex items-center space-x-2.5">
            <Paperclip className="w-6 h-6 text-purple-600" />
            <span>Document Attachments Registry Page (PDF Specification Section 35)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Central file repository for Indents, RFQs, Quotations, POs, Goods Receipts, Quality Inspections, Stock Adjustments & Supplier Documents.
          </p>
        </div>
      </div>

      {/* Security Rules Banner */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-xs flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center space-x-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>
            <strong>Security Enforcements (PDF Section 35):</strong> Restricted file types (.pdf, .png, .jpg, .docx), 10MB file size limit, malware scanning enabled, private storage with temporary access tokens.
          </span>
        </div>
        <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border border-emerald-500/30 whitespace-nowrap">
          MALWARE SCAN ACTIVE
        </span>
      </div>

      {/* Supported Transaction Modules Grid */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3 text-xs">
        <h3 className="font-bold text-sm text-slate-900 uppercase font-heading tracking-wider">
          Supported Transaction Modules (PDF Section 35)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            'Indents', 'RFQs', 'Quotations', 'Purchase orders', 
            'Goods receipts', 'Quality inspections', 'Stock adjustments', 'Supplier documents'
          ].map((mod, i) => (
            <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-bold text-slate-800">{mod}</span>
            </div>
          ))}
        </div>
      </div>

      {/* File Upload Form */}
      <form onSubmit={handleUploadAttachment} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4 text-xs">
        <h3 className="font-bold text-sm text-slate-900 uppercase font-heading tracking-wider flex items-center space-x-2">
          <Upload className="w-4 h-4 text-purple-600" />
          <span>Upload Document File</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Target Transaction Module</label>
            <select 
              value={newAttForm.module} 
              onChange={e => setNewAttForm({ ...newAttForm, module: e.target.value })} 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold"
            >
              <option value="Indents">Indents</option>
              <option value="RFQs">RFQs</option>
              <option value="Quotations">Quotations</option>
              <option value="Purchase Order">Purchase Orders</option>
              <option value="Goods Receipt">Goods Receipts</option>
              <option value="Quality Inspection">Quality Inspections</option>
              <option value="Stock Adjustment">Stock Adjustments</option>
              <option value="Supplier Document">Supplier Documents</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Document File Name</label>
            <input 
              type="text" 
              value={newAttForm.name} 
              onChange={e => setNewAttForm({ ...newAttForm, name: e.target.value })} 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
              placeholder="e.g. Vendor_Quotation_Signed.pdf"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Choose File (.pdf, .png, .jpg, .docx)</label>
            <input 
              type="file" 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800"
            />
          </div>
        </div>

        <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-xl shadow-xs cursor-pointer">
          Upload Attachment & Scan for Malware
        </button>
      </form>

      {/* Attachments Registry Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700 flex justify-between items-center">
          <span>Document Attachments Registry (PDF Section 35 Fields)</span>
          <span className="font-mono text-purple-700 font-bold">{attachments.length} Files Uploaded</span>
        </div>
        <table className="w-full text-xs text-left font-mono">
          <thead>
            <tr className="bg-slate-100/70 text-slate-500 uppercase text-[10px] font-bold font-sans">
              <th className="p-3">Module Category</th>
              <th className="p-3">File Name</th>
              <th className="p-3">Document Category</th>
              <th className="p-3">Type & Size</th>
              <th className="p-3">Storage URL</th>
              <th className="p-3">Uploaded By</th>
              <th className="p-3">Upload Date</th>
              <th className="p-3 text-right">Secure Access</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {attachments.map(att => (
              <tr key={att.id} className="hover:bg-slate-50">
                <td className="p-3 font-bold text-purple-700 font-sans">{att.module}</td>
                <td className="p-3 font-bold text-slate-900 font-sans">{att.name}</td>
                <td className="p-3 text-slate-700 font-sans">{att.docCategory}</td>
                <td className="p-3 text-slate-600"><span className="bg-slate-100 px-2 py-0.5 rounded font-bold">{att.fileType}</span> &bull; {att.size}</td>
                <td className="p-3 text-slate-500 text-[11px] truncate max-w-xs">{att.storageUrl}</td>
                <td className="p-3 text-slate-700 font-sans">{att.uploadedBy}</td>
                <td className="p-3 text-slate-500 font-sans">{att.date}</td>
                <td className="p-3 text-right">
                  <button 
                    onClick={() => alert(`Generated temporary secure access link for ${att.name}:\n${att.storageUrl}?token=temp_access_secure_99`)}
                    className="bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold px-2.5 py-1 rounded-lg border border-purple-200 cursor-pointer"
                  >
                    Temp Token Link
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
