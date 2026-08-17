import React, { useState } from 'react';
import { Search, Filter, SlidersHorizontal, CheckSquare, Eye, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

export default function SearchFiltersEngine() {
  const [searchParams, setSearchParams] = useState({
    keyword: 'laptop',
    status: 'Active',
    dateFrom: '2026-08-01',
    dateTo: '2026-08-17',
    department: 'dept-01',
    warehouse: 'wh-01',
    createdBy: 'Sarah Jenkins',
    sortBy: 'created_at_desc',
    page: 1,
    pageSize: 25
  });

  // Dynamic Column Selection State (PDF Section 34 Requirement)
  const [visibleColumns, setVisibleColumns] = useState({
    code: true,
    name: true,
    category: true,
    department: true,
    warehouse: true,
    stock: true,
    status: true,
    createdBy: true
  });

  // Saved Filters Presets
  const [savedFilterPresets] = useState([
    { id: 'flt-01', name: 'High Value Active IT Items', params: { keyword: 'laptop', status: 'Active', department: 'dept-01' } },
    { id: 'flt-02', name: 'Pending Department Indents', params: { keyword: '', status: 'Submitted', department: 'dept-01' } },
    { id: 'flt-03', name: 'Central Warehouse Stock', params: { warehouse: 'wh-01', status: 'Active' } }
  ]);

  // Demo Record Dataset
  const sampleRecords = [
    { id: 'rec-01', code: 'IT-LAP-0001', name: 'Dell Latitude 5440 Laptop', category: 'IT Equipment', department: 'Information Technology', warehouse: 'Central Goods Warehouse (WH-MAIN)', stock: '0 Pcs', status: 'Active', createdBy: 'Sarah Jenkins' },
    { id: 'rec-02', code: 'ELE-CBL-0002', name: 'Cat6 Ethernet Cable (305m Drum)', category: 'Stationeries', department: 'Electrical & Hardware', warehouse: 'Central Goods Warehouse (WH-MAIN)', stock: '10 Drums', status: 'Active', createdBy: 'Rajesh Kumar' },
    { id: 'rec-03', code: 'OFF-PPR-0003', name: 'A4 Copy Paper 80GSM (Rim)', category: 'Metals', department: 'Consumables & Office', warehouse: 'Central Goods Warehouse (WH-MAIN)', stock: '50 Rims', status: 'Active', createdBy: 'Michael Chang' },
    { id: 'rec-04', code: 'RAW-CHM-0004', name: 'Industrial Cleaning Solvent C-40', category: 'Electrical', department: 'Maintenance & Repairs', warehouse: 'Quarantine & Transit Store (WH-TRANS)', stock: '15 Cans', status: 'Active', createdBy: 'Dr. Ananya Roy' }
  ];

  const toggleColumn = (colKey) => {
    setVisibleColumns(prev => ({ ...prev, [colKey]: !prev[colKey] }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 border border-slate-200/80 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 font-heading flex items-center space-x-2.5">
            <Search className="w-6 h-6 text-purple-600" />
            <span>Search & Filter Parameters Engine (PDF Specification Section 34)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Universal listing search engine supporting 10 mandatory PDF filter features: Keyword Search, Status, Date Range, Department, Warehouse, Created By, Sorting, Pagination, Saved Filters, and Column Selection.
          </p>
        </div>
      </div>

      {/* Main Filter Parameters Box */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6 text-xs text-slate-800">
        <h3 className="font-bold text-sm text-slate-900 uppercase font-heading flex items-center space-x-2 border-b border-slate-100 pb-2">
          <Filter className="w-4 h-4 text-purple-600" />
          <span>Multi-Criteria Search Controls</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Keyword Search</label>
            <input 
              type="text" 
              value={searchParams.keyword} 
              onChange={e => setSearchParams({ ...searchParams, keyword: e.target.value })} 
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
              placeholder="e.g. laptop, Dell, cable..."
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Status Filter</label>
            <select 
              value={searchParams.status} 
              onChange={e => setSearchParams({ ...searchParams, status: e.target.value })} 
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Submitted">Submitted</option>
              <option value="Approved">Approved</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Department Filter</label>
            <select 
              value={searchParams.department} 
              onChange={e => setSearchParams({ ...searchParams, department: e.target.value })} 
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
            >
              <option value="All">All Departments</option>
              <option value="dept-01">Information Technology</option>
              <option value="dept-02">Electrical & Hardware</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Warehouse Filter</label>
            <select 
              value={searchParams.warehouse} 
              onChange={e => setSearchParams({ ...searchParams, warehouse: e.target.value })} 
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
            >
              <option value="All">All Warehouses</option>
              <option value="wh-01">Central Goods Warehouse (WH-MAIN)</option>
              <option value="wh-02">IT Assets Store (WH-SUB1)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Date Range (From - To)</label>
            <div className="grid grid-cols-2 gap-1.5">
              <input type="date" value={searchParams.dateFrom} onChange={e => setSearchParams({ ...searchParams, dateFrom: e.target.value })} className="bg-white border border-slate-200 rounded-xl px-2 py-1.5 font-mono text-[11px]" />
              <input type="date" value={searchParams.dateTo} onChange={e => setSearchParams({ ...searchParams, dateTo: e.target.value })} className="bg-white border border-slate-200 rounded-xl px-2 py-1.5 font-mono text-[11px]" />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Created By</label>
            <input 
              type="text" 
              value={searchParams.createdBy} 
              onChange={e => setSearchParams({ ...searchParams, createdBy: e.target.value })} 
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Sorting Parameter</label>
            <select 
              value={searchParams.sortBy} 
              onChange={e => setSearchParams({ ...searchParams, sortBy: e.target.value })} 
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold"
            >
              <option value="created_at_desc">Date Created (Newest First)</option>
              <option value="created_at_asc">Date Created (Oldest First)</option>
              <option value="name_asc">Name (A - Z)</option>
              <option value="valuation_desc">Valuation Rate (High to Low)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Pagination Page Size</label>
            <select 
              value={searchParams.pageSize} 
              onChange={e => setSearchParams({ ...searchParams, pageSize: Number(e.target.value) })} 
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono font-bold"
            >
              <option value={10}>10 Items / Page</option>
              <option value={25}>25 Items / Page</option>
              <option value={50}>50 Items / Page</option>
              <option value={100}>100 Items / Page</option>
            </select>
          </div>
        </div>

        {/* Backend API Query Request (PDF Specification Rule) */}
        <div className="p-4 bg-purple-900 text-white rounded-2xl font-mono text-xs space-y-1 shadow-xs">
          <span className="text-purple-300 font-bold block text-[10px] uppercase">
            Generated Backend API Query Endpoint (PDF Spec Requirement - Backend Execution)
          </span>
          <p className="text-emerald-300 text-[11px] overflow-x-auto">
            GET /api/items?search={searchParams.keyword}&status={searchParams.status}&department={searchParams.department}&warehouse={searchParams.warehouse}&page={searchParams.page}&pageSize={searchParams.pageSize}&sortBy={searchParams.sortBy}
          </p>
        </div>

        {/* Saved Filters Presets & Column Selection Toggles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
          <div>
            <span className="font-bold text-slate-800 block mb-2">Saved Filter Presets</span>
            <div className="flex flex-wrap gap-2">
              {savedFilterPresets.map(p => (
                <button 
                  key={p.id}
                  onClick={() => setSearchParams({ ...searchParams, ...p.params })}
                  className="bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1.5 cursor-pointer"
                >
                  <Filter className="w-3.5 h-3.5 text-purple-600" />
                  <span>{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="font-bold text-slate-800 block mb-2">Dynamic Column Selection Toggles</span>
            <div className="flex flex-wrap gap-2">
              {Object.keys(visibleColumns).map(colKey => (
                <label key={colKey} className="flex items-center space-x-1.5 bg-slate-100 px-3 py-1 rounded-xl text-xs font-bold text-slate-700 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={visibleColumns[colKey]} 
                    onChange={() => toggleColumn(colKey)}
                    className="rounded text-purple-600" 
                  />
                  <span className="capitalize">{colKey}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Listing Data Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700 flex justify-between items-center">
          <span>Filtered Results Preview</span>
          <span className="font-mono text-purple-700">Page {searchParams.page} of 1 ({sampleRecords.length} Items)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-100/70 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                {visibleColumns.code && <th className="p-3">Item Code</th>}
                {visibleColumns.name && <th className="p-3">Item Name</th>}
                {visibleColumns.category && <th className="p-3">Category</th>}
                {visibleColumns.department && <th className="p-3">Department</th>}
                {visibleColumns.warehouse && <th className="p-3">Warehouse</th>}
                {visibleColumns.stock && <th className="p-3">Stock Qty</th>}
                {visibleColumns.status && <th className="p-3">Status</th>}
                {visibleColumns.createdBy && <th className="p-3">Created By</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {sampleRecords.map(r => (
                <tr key={r.id} className="hover:bg-slate-50">
                  {visibleColumns.code && <td className="p-3 font-mono font-bold text-purple-700">{r.code}</td>}
                  {visibleColumns.name && <td className="p-3 font-bold text-slate-900">{r.name}</td>}
                  {visibleColumns.category && <td className="p-3 text-slate-600">{r.category}</td>}
                  {visibleColumns.department && <td className="p-3 text-slate-700">{r.department}</td>}
                  {visibleColumns.warehouse && <td className="p-3 text-slate-700">{r.warehouse}</td>}
                  {visibleColumns.stock && <td className="p-3 font-mono font-bold text-slate-900">{r.stock}</td>}
                  {visibleColumns.status && <td className="p-3 font-bold text-emerald-700">{r.status}</td>}
                  {visibleColumns.createdBy && <td className="p-3 text-slate-500">{r.createdBy}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
