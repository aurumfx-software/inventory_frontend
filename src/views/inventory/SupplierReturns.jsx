import React, { useState, useEffect } from 'react';
import { 
  Truck, Plus, Search, X, CheckCircle2, AlertTriangle, ShieldAlert, 
  Tag, Layers, RefreshCw, Eye, Printer, Filter, DollarSign, Package
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

export default function SupplierReturns() {
  const [returns, setReturns] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [reasonFilter, setReasonFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [showModal, setShowModal] = useState(false);
  const [viewingReturn, setViewingReturn] = useState(null);

  // Form State according to PDF Specification Section 23
  const initialFormState = {
    return_number: '',
    return_date: new Date().toISOString().split('T')[0],
    supplier_id: '',
    supplier_name: '',
    grn_reference: 'GRN-2026-004001',
    item_id: '',
    item_code: '',
    item_name: '',
    quantity: 1,
    uom: 'Pcs',
    batch_or_serial: 'BAT-2026-0801 / SN-DELL-99201',
    reason: 'Quality rejection',
    replacement_expected: true,
    credit_note_expected: false,
    dispatch_details: 'Dispatched via Blue Dart Courier Waybill #BD-9901823. Tracking Active.',
    status: 'Posted'
  };

  const [form, setForm] = useState(initialFormState);

  // Fallback initial sample data
  const sampleSupplierReturnsFallback = [
    {
      id: 'sup-ret-01',
      return_number: 'SRN-2026-000101',
      return_date: '2026-08-10',
      grn_reference: 'GRN-2026-004001',
      supplier_name: 'Dell India Pvt Ltd',
      item_name: 'Dell Latitude 5440 Laptop',
      item_code: 'IT-LAP-0001',
      quantity: 2,
      uom: 'Pcs',
      batch_or_serial: 'SN-DELL-99201, SN-DELL-99202',
      reason: 'Quality rejection',
      replacement_expected: true,
      credit_note_expected: false,
      dispatch_details: 'Dispatched via Blue Dart Courier Ref #BD-9901',
      status: 'Posted',
      created_at: '2026-08-10T10:00:00Z'
    },
    {
      id: 'sup-ret-02',
      return_number: 'SRN-2026-000102',
      return_date: '2026-08-14',
      grn_reference: 'GRN-2026-004018',
      supplier_name: 'Cisco Systems India',
      item_name: 'Cat6 Ethernet Cable (305m Drum)',
      item_code: 'ELE-CBL-0002',
      quantity: 5,
      uom: 'Drum',
      batch_or_serial: 'BAT-CBL-99',
      reason: 'Damaged in transit',
      replacement_expected: false,
      credit_note_expected: true,
      dispatch_details: 'Returned to Supplier Logistics Hub via Safexpress Air #SX-40192',
      status: 'Posted',
      created_at: '2026-08-14T11:30:00Z'
    },
    {
      id: 'sup-ret-03',
      return_number: 'SRN-2026-000103',
      return_date: '2026-08-16',
      grn_reference: 'GRN-2026-004025',
      supplier_name: '3M Industrial Supplies',
      item_name: 'Industrial Cleaning Solvent C-40',
      item_code: 'RAW-CHM-0004',
      quantity: 10,
      uom: 'Can',
      batch_or_serial: 'BAT-3M-2026',
      reason: 'Specification mismatch',
      replacement_expected: true,
      credit_note_expected: false,
      dispatch_details: 'Awaiting Transporter pickup',
      status: 'Pending Dispatch',
      created_at: '2026-08-16T14:15:00Z'
    }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [supRetRes, supRes, itemRes] = await Promise.all([
        fetch('/api/supplier-returns').then(r => r.json()).catch(() => ({})),
        fetch('/api/suppliers').then(r => r.json()).catch(() => ({})),
        fetch('/api/items').then(r => r.json()).catch(() => ({}))
      ]);

      if (supRetRes.success && Array.isArray(supRetRes.data)) {
        setReturns(supRetRes.data);
      } else {
        setReturns([]);
      }

      if (supRes.success && Array.isArray(supRes.data)) setSuppliers(supRes.data);
      if (itemRes.success && Array.isArray(itemRes.data)) setItems(itemRes.data);
    } catch (err) {
      console.error(err);
      setReturns(sampleSupplierReturnsFallback);
    } finally {
      setLoading(false);
    }
  };

  // Supplier Selection Handler
  const handleSupplierSelect = (supId) => {
    const s = suppliers.find(sup => sup.id === supId);
    setForm(prev => ({
      ...prev,
      supplier_id: supId,
      supplier_name: s?.supplier_name || 'Supplier Vendor'
    }));
  };

  // Item Selection Handler
  const handleItemSelect = (itemId) => {
    const itm = items.find(i => i.id === itemId);
    if (itm) {
      setForm(prev => ({
        ...prev,
        item_id: itm.id,
        item_code: itm.item_code,
        item_name: itm.item_name,
        uom: itm.uom_symbol || 'Pcs'
      }));
    }
  };

  // Create Supplier Return
  const handleCreateSupplierReturn = async (e) => {
    e.preventDefault();

    const selectedSup = suppliers.find(s => s.id === form.supplier_id) || suppliers[0];
    const selectedItem = items.find(i => i.id === form.item_id) || items[0];

    const newReturn = {
      ...form,
      id: `sup-ret-${Date.now()}`,
      return_number: form.return_number || `SRN-2026-00${returns.length + 101}`,
      supplier_id: selectedSup?.id || form.supplier_id || 'sup-01',
      supplier_name: selectedSup?.supplier_name || form.supplier_name || 'Dell India Pvt Ltd',
      item_id: selectedItem?.id || form.item_id || 'itm-01',
      item_code: selectedItem?.item_code || form.item_code || 'IT-LAP-0001',
      item_name: selectedItem?.item_name || form.item_name || 'Dell Latitude 5440 Laptop',
      uom: selectedItem?.uom_symbol || form.uom || 'Pcs',
      created_at: new Date().toISOString()
    };

    const updated = [newReturn, ...returns];
    setReturns(updated);
    localStorage.setItem('app_supplier_returns', JSON.stringify(updated));

    try {
      await fetch('/api/supplier-returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReturn)
      });
    } catch (err) {
      console.error(err);
    }

    setShowModal(false);
    setForm(initialFormState);
  };

  // KPI Computations
  const totalCount = returns.length;
  const postedCount = returns.filter(r => r.status === 'Posted').length;
  const replacementCount = returns.filter(r => r.replacement_expected).length;
  const creditNoteCount = returns.filter(r => r.credit_note_expected).length;

  // Filtered List
  const filteredReturns = returns.filter(r => {
    const matchesSearch = 
      (r.return_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.grn_reference || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.supplier_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.item_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.item_code || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesReason = reasonFilter === 'All' || r.reason === reasonFilter;
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;

    return matchesSearch && matchesReason && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 border border-slate-200/80 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 font-heading flex items-center space-x-2.5">
            <Truck className="w-6 h-6 text-purple-600" />
            <span>Supplier Return Page (Vendor Returns & Rejections)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Records materials returned to vendors due to quality rejection, transit damage or mismatch per <strong>PDF Specification Section 23</strong>.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={fetchData} 
            className="p-2.5 text-slate-500 hover:text-purple-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            title="Refresh Supplier Returns"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Supplier Return</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Supplier Returns</span>
          <p className="text-2xl font-black text-slate-900 font-mono mt-1">{totalCount}</p>
        </div>
        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
          <span className="text-[10px] uppercase font-bold text-purple-600">Dispatched / Posted</span>
          <p className="text-2xl font-black text-purple-700 font-mono mt-1">{postedCount}</p>
        </div>
        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
          <span className="text-[10px] uppercase font-bold text-emerald-600">Replacements Pending</span>
          <p className="text-2xl font-black text-emerald-700 font-mono mt-1">{replacementCount}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-900 to-indigo-900 text-white p-4 rounded-2xl shadow-xs">
          <span className="text-[10px] uppercase font-bold text-purple-200">Stock Decrements</span>
          <p className="text-xs font-bold text-white mt-1">Posting a supplier return automatically decreases on-hand inventory balances.</p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Reasons Filter Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto scrollbar-none pb-2 md:pb-0">
          {['All', 'Quality rejection', 'Wrong item', 'Excess supply', 'Damaged in transit', 'Expired material', 'Specification mismatch'].map(rs => (
            <button
              key={rs}
              onClick={() => setReasonFilter(rs)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                reasonFilter === rs
                  ? 'bg-purple-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {rs}
            </button>
          ))}
        </div>

        {/* Status Filter & Search */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="All">All Statuses</option>
            <option value="Posted">Posted / Dispatched</option>
            <option value="Pending Dispatch">Pending Dispatch</option>
            <option value="Settlement Received">Settlement Received</option>
          </select>

          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search SRN #, GRN, Vendor..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 pl-9 pr-3 py-2 text-xs rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Supplier Returns Cards List */}
      <div className="space-y-4">
        {filteredReturns.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
            <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-slate-800 font-bold text-sm">No Supplier Returns Found</h3>
            <p className="text-slate-500 text-xs mt-1">Try adjusting search query or filters.</p>
          </div>
        ) : (
          filteredReturns.map(ret => (
            <div key={ret.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:border-purple-300 transition space-y-4">
              {/* Header Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-sm font-bold text-purple-900">{ret.return_number}</span>
                  <StatusBadge status={ret.status} />
                  <span className="text-xs text-slate-500 font-mono">Date: {ret.return_date}</span>
                  <span className="text-xs font-bold text-slate-800">&bull; Supplier: {ret.supplier_name}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{ret.reason}</span>
                  </span>

                  <button
                    onClick={() => setViewingReturn(ret)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center space-x-1 transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Details</span>
                  </button>
                </div>
              </div>

              {/* Attributes Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">GRN Reference</span>
                  <span className="text-purple-700 font-mono font-bold">{ret.grn_reference}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Returned Item</span>
                  <span className="text-slate-900 font-bold">{ret.item_code} - {ret.item_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Returned Quantity</span>
                  <span className="text-rose-600 font-mono font-bold">-{ret.quantity} {ret.uom || 'Units'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Settlement Option</span>
                  <span className="text-emerald-700 font-bold">
                    {ret.replacement_expected ? 'Replacement Expected' : ret.credit_note_expected ? 'Credit Note Expected' : 'Refund'}
                  </span>
                </div>
              </div>

              {/* Batch/Serial & Dispatch Details */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-50/70 p-3 rounded-xl border border-slate-100 text-xs gap-2">
                <div>
                  <span className="text-slate-500 font-bold">Batch / Serial Tag:</span>
                  <span className="font-mono text-slate-800 font-semibold ml-2">{ret.batch_or_serial || 'N/A'}</span>
                </div>
                <div className="text-slate-600 font-sans">
                  <strong>Dispatch Info:</strong> {ret.dispatch_details || 'Awaiting logistics tracking'}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE SUPPLIER RETURN MODAL (PDF SECTION 23) */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center space-x-2">
                <Truck className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-sm uppercase tracking-wider font-heading">
                  Record Supplier Vendor Return (PDF Spec Section 23)
                </h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateSupplierReturn} className="p-6 overflow-y-auto space-y-4 text-xs text-slate-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Select Supplier Vendor</label>
                  <select 
                    value={form.supplier_id} 
                    onChange={e => handleSupplierSelect(e.target.value)} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold"
                    required
                  >
                    <option value="">-- Select Vendor --</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.supplier_name} ({s.supplier_code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Return Reason (PDF Section 23)</label>
                  <select 
                    value={form.reason} 
                    onChange={e => setForm({ ...form, reason: e.target.value })} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold text-rose-700"
                  >
                    <option value="Quality rejection">Quality rejection</option>
                    <option value="Wrong item">Wrong item</option>
                    <option value="Excess supply">Excess supply</option>
                    <option value="Damaged in transit">Damaged in transit</option>
                    <option value="Expired material">Expired material</option>
                    <option value="Specification mismatch">Specification mismatch</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">GRN Reference Number</label>
                  <input 
                    type="text" 
                    value={form.grn_reference} 
                    onChange={e => setForm({ ...form, grn_reference: e.target.value })} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono font-bold"
                    placeholder="GRN-2026-004001"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Batch or Serial Number Tag</label>
                  <input 
                    type="text" 
                    value={form.batch_or_serial} 
                    onChange={e => setForm({ ...form, batch_or_serial: e.target.value })} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono"
                    placeholder="BAT-2026-001 / SN-DELL-991"
                  />
                </div>
              </div>

              {/* Item Selection */}
              <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-200/80 space-y-3">
                <div>
                  <label className="block text-purple-900 font-bold mb-1">Select Item to Return</label>
                  <select 
                    value={form.item_id} 
                    onChange={e => handleItemSelect(e.target.value)} 
                    className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-slate-800 font-semibold"
                    required
                  >
                    <option value="">-- Select Item --</option>
                    {items.map(i => (
                      <option key={i.id} value={i.id}>{i.item_code} - {i.item_name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Returned Quantity</label>
                    <input 
                      type="number" 
                      min="1" 
                      value={form.quantity} 
                      onChange={e => setForm({ ...form, quantity: e.target.value })} 
                      className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-rose-700 font-mono font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Stock Unit (UOM)</label>
                    <input 
                      type="text" 
                      value={form.uom} 
                      onChange={e => setForm({ ...form, uom: e.target.value })} 
                      className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-slate-800 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Settlement Options */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="block text-slate-700 font-bold text-[11px] uppercase tracking-wider">Settlement Expectations</span>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-slate-800">
                    <input 
                      type="checkbox" 
                      checked={form.replacement_expected} 
                      onChange={e => setForm({ ...form, replacement_expected: e.target.checked })} 
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span>Replacement Expected</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-slate-800">
                    <input 
                      type="checkbox" 
                      checked={form.credit_note_expected} 
                      onChange={e => setForm({ ...form, credit_note_expected: e.target.checked })} 
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span>Credit Note Expected</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Dispatch & Transport Details</label>
                <textarea 
                  rows="2" 
                  value={form.dispatch_details} 
                  onChange={e => setForm({ ...form, dispatch_details: e.target.value })} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800" 
                  placeholder="Enter courier, waybill, vehicle, or pickup details..."
                />
              </div>

              {/* Stock Rule Banner */}
              <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-[11px] text-rose-900 flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Stock Decrement Rule:</strong> Posting this supplier return will automatically deduct <strong>{form.quantity || 0} {form.uom}</strong> from warehouse stock ledger.
                </span>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Post Supplier Return
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {viewingReturn && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 text-xs text-slate-800">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 uppercase font-heading flex items-center space-x-2">
                <Truck className="w-4 h-4 text-purple-600" />
                <span>Supplier Return #{viewingReturn.return_number}</span>
              </h3>
              <button onClick={() => setViewingReturn(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Return Date:</span>
                <span className="font-mono text-slate-800">{viewingReturn.return_date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Supplier Vendor:</span>
                <span className="font-bold text-slate-900">{viewingReturn.supplier_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">GRN Ref Number:</span>
                <span className="font-mono text-purple-700 font-bold">{viewingReturn.grn_reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Returned Item:</span>
                <span className="font-bold text-purple-900">{viewingReturn.item_code} - {viewingReturn.item_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Returned Quantity:</span>
                <span className="font-mono font-bold text-rose-600">-{viewingReturn.quantity} {viewingReturn.uom || 'Units'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Batch / Serial Tag:</span>
                <span className="font-mono text-slate-800">{viewingReturn.batch_or_serial || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Return Reason:</span>
                <span className="font-bold text-rose-700">{viewingReturn.reason}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Settlement Action:</span>
                <span className="font-bold text-emerald-700">
                  {viewingReturn.replacement_expected ? 'Replacement Expected' : viewingReturn.credit_note_expected ? 'Credit Note Expected' : 'Refund'}
                </span>
              </div>
            </div>

            <div className="bg-purple-50/50 p-3 rounded-xl border border-purple-100 text-slate-700">
              <strong>Dispatch Details:</strong> {viewingReturn.dispatch_details || 'N/A'}
            </div>

            <div className="flex justify-end pt-2">
              <button 
                onClick={() => setViewingReturn(null)} 
                className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
