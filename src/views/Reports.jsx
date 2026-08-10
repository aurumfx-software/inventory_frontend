import React, { useState, useEffect } from 'react';
import { BarChart3, Download, Printer, RefreshCw } from 'lucide-react';

export default function Reports() {
  const [activeReport, setActiveReport] = useState('current-stock');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  const reportsList = [
    { id: 'current-stock', label: '1. Current Stock Report' },
    { id: 'stock-ledger', label: '2. Stock Ledger Report' },
    { id: 'low-stock', label: '3. Low-Stock Report' },
    { id: 'out-of-stock', label: '4. Out-of-Stock Report' },
    { id: 'stock-valuation', label: '5. Stock Valuation Report' },
    { id: 'ageing', label: '6. Ageing Report (0-180+ Days)' },
    { id: 'slow-moving', label: '7. Slow-Moving Report' },
    { id: 'dead-stock', label: '8. Non-Moving / Dead Stock' },
    { id: 'fast-moving', label: '9. Fast-Moving Report' },
    { id: 'expiry', label: '10. Expiry FEFO Report' },
    { id: 'department-consumption', label: '11. Dept Consumption Report' },
    { id: 'supplier-performance', label: '12. Supplier Performance' },
    { id: 'purchase', label: '13. Purchase Summary Report' },
    { id: 'pending-indent', label: '14. Pending Indents Report' },
    { id: 'pending-po', label: '15. Pending PO Report' },
    { id: 'stock-adjustment', label: '16. Stock Adjustment Report' }
  ];

  useEffect(() => {
    fetchReport(activeReport);
  }, [activeReport]);

  const fetchReport = async (type) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/${type}`);
      const data = await res.json();
      if (data.success) setReportData(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!reportData || reportData.length === 0) return;
    const keys = Object.keys(reportData[0]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + keys.join(",") + "\n"
      + reportData.map(row => keys.map(k => `"${row[k] !== undefined ? row[k] : ''}"`).join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Report_${activeReport}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-5 border border-slate-200/80 rounded-2xl shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 font-heading flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            <span>Operational & Financial Reports Engine</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">16 specialized operational, stock valuation, supplier performance & audit reports.</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={exportCSV}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center space-x-2 shadow-xs transition"
          >
            <Download className="w-4 h-4" />
            <span>Export Report (CSV)</span>
          </button>
          <button 
            onClick={() => window.print()}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center space-x-2 shadow-xs transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print View</span>
          </button>
        </div>
      </div>

      {/* Report Selector Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
        {reportsList.map(r => (
          <button
            key={r.id}
            onClick={() => setActiveReport(r.id)}
            className={`p-2.5 rounded-xl text-[11px] font-bold text-left border transition truncate ${
              activeReport === r.id 
                ? 'bg-purple-600 border-purple-600 text-white shadow-xs' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-purple-700'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Report Data Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs p-5 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider font-heading">
            {reportsList.find(r => r.id === activeReport)?.label} ({reportData.length} Records)
          </h3>
          <button onClick={() => fetchReport(activeReport)} className="text-xs text-purple-700 font-bold hover:underline flex items-center space-x-1">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
        </div>

        {reportData.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs font-medium">
            No data records found for this report.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200 font-bold font-mono">
                  {Object.keys(reportData[0] || {}).map((col, idx) => (
                    <th key={idx} className="p-3 uppercase">{col.replace(/_/g, ' ')}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {reportData.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50/80 transition">
                    {Object.keys(row).map((col, cIdx) => (
                      <td key={cIdx} className="p-3 text-slate-700">
                        {typeof row[col] === 'number' ? row[col].toLocaleString() : String(row[col])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
