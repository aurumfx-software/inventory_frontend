import React, { useState } from 'react';
import { Upload, Search, Paperclip, FileText, Download, CheckCircle2 } from 'lucide-react';

export default function ImportAttachments() {
  const [activeTab, setActiveTab] = useState('import');

  const [attachments] = useState([
    { id: 'att-01', docCategory: 'Purchase Order', name: 'PO_Vendor_Quote_Approved.pdf', size: '1.2 MB', uploadedBy: 'Rajesh Kumar', date: '2026-08-09' },
    { id: 'att-02', docCategory: 'Goods Receipt', name: 'Challan_DC_8810_Scan.pdf', size: '450 KB', uploadedBy: 'Michael Chang', date: '2026-08-10' }
  ]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 border border-slate-200/80 rounded-2xl shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 font-heading flex items-center space-x-2">
          <Upload className="w-5 h-5 text-purple-600" />
          <span>33. Import & Export, 34. Search & Filters & 35. Document Attachments</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">Bulk CSV migration, universal search filters, and document file attachments (PDF Page 33-34).</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        <button onClick={() => setActiveTab('import')} className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeTab === 'import' ? 'bg-purple-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
          33. Import & Export Wizard
        </button>
        <button onClick={() => setActiveTab('search')} className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeTab === 'search' ? 'bg-purple-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
          34. Search & Filter Engine
        </button>
        <button onClick={() => setActiveTab('attachments')} className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeTab === 'attachments' ? 'bg-purple-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
          35. Document Attachments
        </button>
      </div>

      {activeTab === 'import' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4 text-xs">
          <h3 className="font-bold text-sm text-slate-900 font-heading uppercase tracking-wider">33. Importable Data Categories</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['Items Master', 'Suppliers Directory', 'Opening Stock Balances', 'Warehouses & Locations', 'Users & Roles', 'Item Categories', 'Tax Rates'].map((cat, i) => (
              <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold text-slate-800">{cat}</span>
              </div>
            ))}
          </div>

          <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl text-purple-800 space-y-2">
            <strong className="block font-bold">Import Process Steps:</strong>
            <p className="text-[11px] font-mono">1. Download Template &rarr; 2. Enter Data &rarr; 3. Upload File &rarr; 4. Validate Records &rarr; 5. Show Errors &rarr; 6. Confirm Import &rarr; 7. Save Valid Records &rarr; 8. Generate Summary</p>
          </div>
        </div>
      )}

      {activeTab === 'search' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4 text-xs">
          <h3 className="font-bold text-sm text-slate-900 font-heading uppercase tracking-wider flex items-center space-x-2">
            <Search className="w-4 h-4 text-purple-600" />
            <span>34. Search & Filter Parameters</span>
          </h3>
          <p className="text-slate-600">Every listing page supports multi-column backend search & filtering:</p>
          <div className="grid grid-cols-3 gap-3">
            {['Keyword Search', 'Status Filter', 'Date Range', 'Department Filter', 'Warehouse Filter', 'Created By', 'Sorting', 'Pagination', 'Saved Filters'].map((f, i) => (
              <div key={i} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold">
                &bull; {f}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'attachments' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4 text-xs">
          <h3 className="font-bold text-sm text-slate-900 font-heading uppercase tracking-wider flex items-center space-x-2">
            <Paperclip className="w-4 h-4 text-purple-600" />
            <span>35. Document Attachments Registry</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left font-mono">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200 font-bold font-sans">
                  <th className="p-3">Doc Category</th>
                  <th className="p-3">File Name</th>
                  <th className="p-3">Size</th>
                  <th className="p-3">Uploaded By</th>
                  <th className="p-3">Upload Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attachments.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50/80">
                    <td className="p-3 text-purple-700 font-bold font-sans">{a.docCategory}</td>
                    <td className="p-3 font-bold text-slate-900">{a.name}</td>
                    <td className="p-3 text-slate-500">{a.size}</td>
                    <td className="p-3 text-slate-700 font-sans">{a.uploadedBy}</td>
                    <td className="p-3 text-slate-500 font-sans">{a.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
