import React, { useState, useEffect } from 'react';
import { 
  RotateCcw, Plus, Search, X, CheckCircle2, AlertTriangle, ShieldCheck, 
  Warehouse, Tag, Layers, RefreshCw, Eye, Printer, Filter, Box
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

export default function StockReturns() {
  const [returns, setReturns] = useState([]);
  const [items, setItems] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [conditionFilter, setConditionFilter] = useState('All');
  
  const [showModal, setShowModal] = useState(false);
  const [viewingReturn, setViewingReturn] = useState(null);

  // Form State according to PDF Specification Section 22
  const initialFormState = {
    return_number: '',
    return_date: new Date().toISOString().split('T')[0],
    original_issue_ref: 'ISS-2026-000101',
    returned_by: 'David Miller',
    department_id: 'dept-01',
    department_name: 'Information Technology',
    warehouse_id: 'wh-01',
    warehouse_name: 'Central Goods Warehouse (WH-MAIN)',
    item_id: '',
    item_code: '',
    item_name: '',
    quantity: 1,
    uom: 'Pcs',
    batch_number: 'BAT-2026-0801',
    serial_number: 'SN-DELL-99201',
    return_type: 'Unused material',
    condition: 'Good',
    return_reason: 'Project completed ahead of schedule, unused surplus materials returned to store.',
    inspection_result: 'Passed - Accepted into Main Stock',
    remarks: 'Verified complete package, no physical defects observed.'
  };

  const [form, setForm] = useState(initialFormState);

  // Fallback initial sample data
  const sampleReturnsFallback = [
    {
      id: 'ret-01',
      return_number: 'RET-2026-000101',
      return_date: '2026-08-12',
      original_issue_ref: 'ISS-2026-005001',
      returned_by: 'David Miller',
      department_name: 'Information Technology',
      warehouse_name: 'Central Goods Warehouse (WH-MAIN)',
      item_name: 'Cat6 Ethernet Cable (305m)',
      item_code: 'ELE-CBL-0002',
      quantity: 10,
      uom: 'Mtr',
      batch_number: 'BAT-CBL-99',
      serial_number: 'N/A',
      return_type: 'Unused material',
      condition: 'Good',
      return_reason: 'Project completed, unused excess cables returned to store.',
      inspection_result: 'Passed - Restocked to WH-MAIN',
      remarks: 'Restocked into available balance.',
      status: 'Posted'
    },
    {
      id: 'ret-02',
      return_number: 'RET-2026-000102',
      return_date: '2026-08-14',
      original_issue_ref: 'ISS-2026-004882',
      returned_by: 'Michael Chang',
      department_name: 'Electrical & Hardware',
      warehouse_name: 'IT Assets & Electronics Store (WH-SUB1)',
      item_name: 'Dell Latitude 5440 Laptop',
      item_code: 'IT-LAP-0001',
      quantity: 1,
      uom: 'Pcs',
      batch_number: 'BAT-2026-0801',
      serial_number: 'SN-DELL-88301',
      return_type: 'Damaged return',
      condition: 'Damaged',
      return_reason: 'Keyboard liquid spill damage during field operations.',
      inspection_result: 'Failed - Transferred to Quarantine / Repair Bay',
      remarks: 'Moved to Quarantine location. Does NOT increase available stock.',
      status: 'Quarantined'
    },
    {
      id: 'ret-03',
      return_number: 'RET-2026-000103',
      return_date: '2026-08-15',
      original_issue_ref: 'ISS-2026-003920',
      returned_by: 'Rajesh Kumar',
      department_name: 'Consumables & Office',
      warehouse_name: 'Central Goods Warehouse (WH-MAIN)',
      item_name: 'A4 Copy Paper 80GSM (Rim)',
      item_code: 'OFF-PPR-0003',
      quantity: 5,
      uom: 'Rim',
      batch_number: 'BAT-PAP-001',
      serial_number: 'N/A',
      return_type: 'Excess issue return',
      condition: 'Used but usable',
      return_reason: 'Excess paper boxes requested for quarterly audit.',
      inspection_result: 'Passed - Accepted into Reusable Stock',
      remarks: 'Outer box opened, rims intact. Restocked to WH-MAIN.',
      status: 'Posted'
    }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [retRes, itemRes, deptRes, whRes] = await Promise.all([
        fetch('/api/stock-returns').then(r => r.json()).catch(() => ({})),
        fetch('/api/items').then(r => r.json()).catch(() => ({})),
        fetch('/api/departments').then(r => r.json()).catch(() => ({})),
        fetch('/api/warehouses').then(r => r.json()).catch(() => ({}))
      ]);

      if (retRes.success && Array.isArray(retRes.data)) {
        setReturns(retRes.data);
      } else {
        setReturns([]);
      }

      if (itemRes.success && Array.isArray(itemRes.data)) setItems(itemRes.data);
      if (deptRes.success && Array.isArray(deptRes.data)) setDepartments(deptRes.data);
      if (whRes.success && Array.isArray(whRes.data)) setWarehouses(whRes.data);
    } catch (err) {
      console.error(err);
      setReturns(sampleReturnsFallback);
    } finally {
      setLoading(false);
    }
  };

  // Item Selection Handler in Form
  const handleItemSelect = (itemId) => {
    const selected = items.find(i => i.id === itemId);
    if (selected) {
      setForm(prev => ({
        ...prev,
        item_id: selected.id,
        item_code: selected.item_code,
        item_name: selected.item_name,
        uom: selected.uom_symbol || 'Pcs'
      }));
    }
  };

  // Department Selection Handler
  const handleDeptSelect = (deptId) => {
    const d = departments.find(dep => dep.id === deptId);
    setForm(prev => ({
      ...prev,
      department_id: deptId,
      department_name: d?.name || 'Department'
    }));
  };

  // Warehouse Selection Handler
  const handleWhSelect = (whId) => {
    const w = warehouses.find(wh => wh.id === whId);
    setForm(prev => ({
      ...prev,
      warehouse_id: whId,
      warehouse_name: w?.name || 'Warehouse'
    }));
  };

  // Create Stock Return
  const handleCreateReturn = async (e) => {
    e.preventDefault();

    const selectedItem = items.find(i => i.id === form.item_id) || items[0];
    const isReusable = ['Good', 'Used but usable'].includes(form.condition);
    const finalStatus = isReusable ? 'Posted' : 'Quarantined';

    const newReturn = {
      ...form,
      id: `ret-${Date.now()}`,
      return_number: form.return_number || `RET-2026-00${returns.length + 101}`,
      item_id: selectedItem?.id || form.item_id || 'itm-01',
      item_code: selectedItem?.item_code || form.item_code || 'IT-LAP-0001',
      item_name: selectedItem?.item_name || form.item_name || 'Dell Latitude 5440 Laptop',
      uom: selectedItem?.uom_symbol || form.uom || 'Pcs',
      status: finalStatus,
      created_at: new Date().toISOString()
    };

    const updated = [newReturn, ...returns];
    setReturns(updated);
    localStorage.setItem('app_stock_returns', JSON.stringify(updated));

    try {
      await fetch('/api/stock-returns', {
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
  const reusableCount = returns.filter(r => ['Good', 'Used but usable'].includes(r.condition)).length;
  const damagedCount = returns.filter(r => ['Damaged', 'Repairable', 'Scrap', 'Expired'].includes(r.condition)).length;

  // Filtered Returns List
  const filteredReturns = returns.filter(r => {
    const matchesSearch = 
      (r.return_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.original_issue_ref || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.item_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.item_code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.returned_by || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.department_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'All' || r.return_type === typeFilter;
    const matchesCondition = conditionFilter === 'All' || r.condition === conditionFilter;

    return matchesSearch && matchesType && matchesCondition;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 border border-slate-200/80 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 font-heading flex items-center space-x-2.5">
            <RotateCcw className="w-6 h-6 text-purple-600" />
            <span>Stock Return Management Page (Department & Employee Returns)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Records materials returned to stores by departments or employees per <strong>PDF Specification Section 22</strong>.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={fetchData} 
            className="p-2.5 text-slate-500 hover:text-purple-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            title="Refresh Stock Returns"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Material Stock Return</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Stock Returns</span>
          <p className="text-2xl font-black text-slate-900 font-mono mt-1">{totalCount}</p>
        </div>
        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
          <span className="text-[10px] uppercase font-bold text-emerald-600">Restocked / Good Returns</span>
          <p className="text-2xl font-black text-emerald-700 font-mono mt-1">{reusableCount}</p>
        </div>
        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
          <span className="text-[10px] uppercase font-bold text-rose-500">Damaged / Quarantined</span>
          <p className="text-2xl font-black text-rose-600 font-mono mt-1">{damagedCount}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-900 to-indigo-900 text-white p-4 rounded-2xl shadow-xs">
          <span className="text-[10px] uppercase font-bold text-purple-200">Stock Rule Enforcement</span>
          <p className="text-xs font-bold text-white mt-1">Reusable items increase available stock; Damaged route to Quarantine.</p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Return Types Filter Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto scrollbar-none pb-2 md:pb-0">
          {['All', 'Unused material', 'Returnable item returned', 'Damaged return', 'Wrong item return', 'Excess issue return'].map(rt => (
            <button
              key={rt}
              onClick={() => setTypeFilter(rt)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                typeFilter === rt
                  ? 'bg-purple-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {rt}
            </button>
          ))}
        </div>

        {/* Condition Filter & Search */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <select
            value={conditionFilter}
            onChange={e => setConditionFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="All">All Conditions</option>
            <option value="Good">Good</option>
            <option value="Used but usable">Used but usable</option>
            <option value="Damaged">Damaged</option>
            <option value="Repairable">Repairable</option>
            <option value="Scrap">Scrap</option>
            <option value="Expired">Expired</option>
          </select>

          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search Return #, Item, Ref..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 pl-9 pr-3 py-2 text-xs rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Stock Returns Cards List */}
      <div className="space-y-4">
        {filteredReturns.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
            <RotateCcw className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-slate-800 font-bold text-sm">No Stock Returns Found</h3>
            <p className="text-slate-500 text-xs mt-1">Try adjusting search filters or record a new return.</p>
          </div>
        ) : (
          filteredReturns.map(ret => {
            const isGood = ['Good', 'Used but usable'].includes(ret.condition);
            return (
              <div key={ret.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:border-purple-300 transition space-y-4">
                {/* Header Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-sm font-bold text-purple-900">{ret.return_number}</span>
                    <StatusBadge status={ret.status} />
                    <span className="text-xs text-slate-500 font-mono">Date: {ret.return_date}</span>
                    <span className="text-xs font-bold text-slate-800">&bull; Issue Ref: {ret.original_issue_ref}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                      isGood ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}>
                      {ret.return_type} ({ret.condition})
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

                {/* Return Attributes Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Returned By</span>
                    <span className="text-slate-900 font-bold">{ret.returned_by}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Department</span>
                    <span className="text-slate-800 font-semibold">{ret.department_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Receiving Warehouse</span>
                    <span className="text-slate-800 font-semibold">{ret.warehouse_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Item & Quantity</span>
                    <span className="text-purple-700 font-mono font-bold">{ret.quantity} {ret.uom}</span>
                  </div>
                </div>

                {/* Line Item Snapshot & Tracking */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-purple-50/40 p-3 rounded-xl border border-purple-100 text-xs gap-2">
                  <div>
                    <span className="text-purple-900 font-mono font-bold">{ret.item_code}</span>
                    <span className="text-slate-700 font-medium ml-2">&bull; {ret.item_name}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-[11px] font-mono text-slate-600">
                    {ret.batch_number && <span>Batch: <strong className="text-slate-900">{ret.batch_number}</strong></span>}
                    {ret.serial_number && <span>Serial: <strong className="text-slate-900">{ret.serial_number}</strong></span>}
                  </div>
                </div>

                {/* Reason & Rule Note */}
                <div className="text-xs text-slate-600 bg-slate-50/70 p-3 rounded-xl border border-slate-100 flex items-start space-x-2">
                  <Tag className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800">Return Reason:</span> {ret.return_reason || ret.reason}
                    <div className="mt-1 text-[11px] text-slate-500 font-mono">
                      <strong>Inspection Result:</strong> {ret.inspection_result || 'Passed - Restocked'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* RECORD MATERIAL STOCK RETURN MODAL (PDF SECTION 22) */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center space-x-2">
                <RotateCcw className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-sm uppercase tracking-wider font-heading">
                  Record Material Stock Return (PDF Spec Section 22)
                </h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateReturn} className="p-6 overflow-y-auto space-y-4 text-xs text-slate-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Return Type (PDF Section 22)</label>
                  <select 
                    value={form.return_type} 
                    onChange={e => setForm({ ...form, return_type: e.target.value })} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold"
                  >
                    <option value="Unused material">Unused material</option>
                    <option value="Returnable item returned">Returnable item returned</option>
                    <option value="Damaged return">Damaged return</option>
                    <option value="Wrong item return">Wrong item return</option>
                    <option value="Excess issue return">Excess issue return</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Condition Value (PDF Spec)</label>
                  <select 
                    value={form.condition} 
                    onChange={e => setForm({ ...form, condition: e.target.value })} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold"
                  >
                    <option value="Good">Good (Increase Available Stock)</option>
                    <option value="Used but usable">Used but usable (Increase Available Stock)</option>
                    <option value="Damaged">Damaged (Quarantine Location)</option>
                    <option value="Repairable">Repairable (Quarantine Location)</option>
                    <option value="Scrap">Scrap (Scrap Location)</option>
                    <option value="Expired">Expired (Quarantine Location)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Original Issue Reference #</label>
                  <input 
                    type="text" 
                    value={form.original_issue_ref} 
                    onChange={e => setForm({ ...form, original_issue_ref: e.target.value })} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono font-bold"
                    placeholder="ISS-2026-000101"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Returned By (Employee / User)</label>
                  <input 
                    type="text" 
                    value={form.returned_by} 
                    onChange={e => setForm({ ...form, returned_by: e.target.value })} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Department</label>
                  <select 
                    value={form.department_id} 
                    onChange={e => handleDeptSelect(e.target.value)} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  >
                    <option value="dept-01">Information Technology</option>
                    <option value="dept-02">Electrical & Hardware</option>
                    <option value="dept-03">Maintenance & Repairs</option>
                    <option value="dept-04">Administration & Office</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Receiving Store Warehouse</label>
                  <select 
                    value={form.warehouse_id} 
                    onChange={e => handleWhSelect(e.target.value)} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  >
                    <option value="wh-01">Central Goods Warehouse (WH-MAIN)</option>
                    <option value="wh-02">IT Assets & Electronics Store (WH-SUB1)</option>
                    <option value="wh-03">Quarantine & Transit Store (WH-TRANS)</option>
                  </select>
                </div>
              </div>

              {/* Item Details */}
              <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-200/80 space-y-3">
                <div>
                  <label className="block text-purple-900 font-bold mb-1">Select Item to Return</label>
                  <select 
                    value={form.item_id} 
                    onChange={e => handleItemSelect(e.target.value)} 
                    className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-slate-800 font-semibold"
                    required
                  >
                    <option value="">-- Select Inventory Item --</option>
                    {items.map(i => (
                      <option key={i.id} value={i.id}>{i.item_code} - {i.item_name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Returned Qty</label>
                    <input 
                      type="number" 
                      min="1" 
                      value={form.quantity} 
                      onChange={e => setForm({ ...form, quantity: e.target.value })} 
                      className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-purple-900 font-mono font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Batch Number</label>
                    <input 
                      type="text" 
                      value={form.batch_number} 
                      onChange={e => setForm({ ...form, batch_number: e.target.value })} 
                      className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-slate-800 font-mono"
                      placeholder="BAT-2026-001"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Serial Number</label>
                    <input 
                      type="text" 
                      value={form.serial_number} 
                      onChange={e => setForm({ ...form, serial_number: e.target.value })} 
                      className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-slate-800 font-mono"
                      placeholder="SN-DELL-1001"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Return Reason (Required)</label>
                <textarea 
                  rows="2" 
                  value={form.return_reason} 
                  onChange={e => setForm({ ...form, return_reason: e.target.value })} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800" 
                  placeholder="Explain why materials are being returned to store..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Inspection Result</label>
                  <input 
                    type="text" 
                    value={form.inspection_result} 
                    onChange={e => setForm({ ...form, inspection_result: e.target.value })} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800" 
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Remarks</label>
                  <input 
                    type="text" 
                    value={form.remarks} 
                    onChange={e => setForm({ ...form, remarks: e.target.value })} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800" 
                  />
                </div>
              </div>

              {/* Stock Rule Banner */}
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-[11px] text-amber-900 flex items-start space-x-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Stock Rule Enforcement:</strong> Only returns marked <em>Good</em> or <em>Used but usable</em> will increase usable stock. Damaged or scrap returns are automatically routed to quarantine/scrap.
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
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Post Stock Return
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
                <RotateCcw className="w-4 h-4 text-purple-600" />
                <span>Stock Return #{viewingReturn.return_number}</span>
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
                <span className="text-slate-500 font-bold">Original Issue Ref:</span>
                <span className="font-mono text-purple-700 font-bold">{viewingReturn.original_issue_ref}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Returned By:</span>
                <span>{viewingReturn.returned_by} ({viewingReturn.department_name})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Receiving Warehouse:</span>
                <span>{viewingReturn.warehouse_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Item:</span>
                <span className="font-bold text-purple-900">{viewingReturn.item_code} - {viewingReturn.item_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Quantity:</span>
                <span className="font-mono font-bold text-purple-700">{viewingReturn.quantity} {viewingReturn.uom}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Condition:</span>
                <span className="font-bold text-emerald-700">{viewingReturn.condition}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Inspection Result:</span>
                <span className="font-semibold text-slate-800">{viewingReturn.inspection_result}</span>
              </div>
            </div>

            <div className="bg-purple-50/50 p-3 rounded-xl border border-purple-100 text-slate-700">
              <strong>Return Reason:</strong> {viewingReturn.return_reason || viewingReturn.reason}
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
