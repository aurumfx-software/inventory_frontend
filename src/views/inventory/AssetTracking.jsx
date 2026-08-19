import React, { useState, useEffect } from 'react';
import { Laptop, Plus, User, MapPin, Calendar, X, Search, ShieldCheck, RefreshCw, Wrench, Edit3 } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

export default function AssetTracking() {
  const [assets, setAssets] = useState([]);
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [form, setForm] = useState({
    item_id: 'itm-01',
    serial_number: 'DELL-LAT-9099',
    purchase_date: '2026-08-01',
    purchase_value: 72000,
    warranty_expiry: '2029-08-01',
    assigned_user: 'David Miller',
    assigned_location: 'Building A, Desk 405',
    condition: 'Good',
    status: 'Assigned'
  });

  const [assignForm, setAssignForm] = useState({
    assigned_employee_name: 'David Miller',
    assigned_location: 'Building A, Desk 405',
    condition: 'Good'
  });

  useEffect(() => {
    fetchAssets();
    fetch('/api/items').then(r => r.json()).then(d => d.success && setItems(d.data));
    fetch('/api/users').then(r => r.json()).then(d => d.success && setUsers(d.data));
  }, []);

  const fetchAssets = async () => {
    try {
      const res = await fetch('/api/assets');
      const data = await res.json();
      if (data.success) setAssets(data.data || []);
    } catch (err) {
      console.error('Failed to fetch assets:', err);
    }
  };

  const handleRegisterAsset = async (e) => {
    e.preventDefault();
    const selItem = items.find(i => i.id === form.item_id) || items[0];

    try {
      const res = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          item_code: selItem ? selItem.item_code : 'IT-LAP-0001',
          item_name: selItem ? selItem.item_name : 'Dell Latitude 5440 Laptop'
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || 'Asset registered successfully.');
        setShowModal(false);
        fetchAssets();
      } else {
        alert(data.message || 'Failed to register asset.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error registering asset.');
    }
  };

  const handleReassignAsset = async (e) => {
    e.preventDefault();
    if (!showAssignModal) return;

    try {
      const res = await fetch(`/api/assets/${showAssignModal.id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignForm)
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || 'Asset assignment updated.');
        setShowAssignModal(null);
        fetchAssets();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredAssets = assets.filter(ast => {
    const q = searchQuery.toLowerCase();
    const matchesQuery = !q || ast.asset_number?.toLowerCase().includes(q) || ast.item_name?.toLowerCase().includes(q) || ast.serial_number?.toLowerCase().includes(q) || ast.assigned_employee_name?.toLowerCase().includes(q) || ast.assigned_user?.toLowerCase().includes(q);
    const matchesStatus = !statusFilter || ast.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const totalAssetsCount = assets.length;
  const totalValue = assets.reduce((sum, a) => sum + (Number(a.purchase_value) || 0), 0);
  const assignedCount = assets.filter(a => a.status === 'Assigned').length;
  const inRepairCount = assets.filter(a => a.status === 'Under repair' || a.condition === 'In Repair' || a.status === 'Damaged').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 border border-slate-200/80 rounded-2xl shadow-xs gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Laptop className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-slate-900 font-heading">Asset Tracking Page (PDF Spec Section 28)</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">Tracks long-term IT equipment, laptops, phones, tools, furniture, and machinery issued to employees with serial and warranty tracking.</p>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={fetchAssets}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl flex items-center space-x-1.5 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center space-x-2 shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Register Equipment Asset</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Equipment Assets</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalAssetsCount}</p>
        </div>
        <div className="bg-white border border-purple-200 p-4 rounded-2xl shadow-xs bg-purple-50/30">
          <p className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">Total Capital Asset Value</p>
          <p className="text-2xl font-black text-purple-900 mt-1">₹{totalValue.toLocaleString()}</p>
        </div>
        <div className="bg-white border border-emerald-200 p-4 rounded-2xl shadow-xs bg-emerald-50/30">
          <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Assigned to Employees</p>
          <p className="text-2xl font-black text-emerald-900 mt-1">{assignedCount}</p>
        </div>
        <div className="bg-white border border-amber-200 p-4 rounded-2xl shadow-xs bg-amber-50/30">
          <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Under Repair / Maintenance</p>
          <p className="text-2xl font-black text-amber-900 mt-1">{inRepairCount}</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 border border-slate-200/80 rounded-2xl shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search assets by Number, Item, Serial, Employee..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-800 font-semibold"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold w-full sm:w-auto"
        >
          <option value="">All Asset Statuses</option>
          <option value="Available">Available</option>
          <option value="Assigned">Assigned</option>
          <option value="Under repair">Under repair</option>
          <option value="Lost">Lost</option>
          <option value="Damaged">Damaged</option>
          <option value="Retired">Retired</option>
          <option value="Disposed">Disposed</option>
        </select>
      </div>

      {/* Asset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAssets.map(ast => (
          <div key={ast.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3 hover:border-purple-300 transition">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono text-[10px] text-purple-700 font-bold bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                  {ast.asset_number}
                </span>
                <h3 className="font-bold text-sm text-slate-900 mt-1.5">{ast.item_name}</h3>
                <p className="text-xs font-mono text-purple-800 mt-0.5 font-bold">SN: {ast.serial_number}</p>
              </div>
              <StatusBadge status={ast.status || 'Assigned'} />
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 border-t border-b border-slate-100 py-2.5">
              <p className="flex items-center text-slate-700">
                <User className="w-3.5 h-3.5 mr-2 text-purple-600 shrink-0" />
                <span>Assigned: <strong className="ml-1 text-slate-900">{ast.assigned_employee_name || ast.assigned_user || 'David Miller'}</strong></span>
              </p>
              <p className="flex items-center text-slate-600">
                <MapPin className="w-3.5 h-3.5 mr-2 text-purple-600 shrink-0" />
                <span>Location: <strong className="ml-1 text-slate-800">{ast.assigned_location || 'Main Office'}</strong></span>
              </p>
              <p className="flex items-center text-slate-600">
                <Calendar className="w-3.5 h-3.5 mr-2 text-purple-600 shrink-0" />
                <span>Warranty Expiry: <span className="ml-1 font-mono text-emerald-700 font-bold">{ast.warranty_expiry || '2029-08-01'}</span></span>
              </p>
            </div>

            <div className="flex justify-between items-center text-[11px] font-mono pt-1">
              <span className="text-slate-500 font-bold">Value: ₹{(ast.purchase_value || 0).toLocaleString()}</span>
              <span className="text-emerald-700 font-bold">Condition: {ast.condition || 'Good'}</span>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => {
                  setShowAssignModal(ast);
                  setAssignForm({
                    assigned_employee_name: ast.assigned_employee_name || ast.assigned_user || 'David Miller',
                    assigned_location: ast.assigned_location || 'Building A, Desk 405',
                    condition: ast.condition || 'Good'
                  });
                }}
                className="text-xs bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Reassign / Update</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Register Asset Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 uppercase tracking-wider font-heading flex items-center space-x-2">
                <Laptop className="w-5 h-5 text-purple-600" />
                <span>Register Equipment Asset (PDF Section 28)</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleRegisterAsset} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Select Inventory Item *</label>
                <select
                  value={form.item_id}
                  onChange={e => setForm({ ...form, item_id: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold"
                >
                  {items.map(i => <option key={i.id} value={i.id}>{i.item_code} - {i.item_name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Serial Number *</label>
                  <input
                    type="text"
                    required
                    value={form.serial_number}
                    onChange={e => setForm({ ...form, serial_number: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Purchase Value (₹) *</label>
                  <input
                    type="number"
                    required
                    value={form.purchase_value}
                    onChange={e => setForm({ ...form, purchase_value: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Purchase Date</label>
                  <input
                    type="date"
                    value={form.purchase_date}
                    onChange={e => setForm({ ...form, purchase_date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Warranty Expiry Date</label>
                  <input
                    type="date"
                    value={form.warranty_expiry}
                    onChange={e => setForm({ ...form, warranty_expiry: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Assigned Employee *</label>
                  <input
                    type="text"
                    required
                    value={form.assigned_user}
                    onChange={e => setForm({ ...form, assigned_user: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Assigned Location</label>
                  <input
                    type="text"
                    value={form.assigned_location}
                    onChange={e => setForm({ ...form, assigned_location: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Asset Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold"
                  >
                    <option value="Assigned">Assigned</option>
                    <option value="Available">Available</option>
                    <option value="Under repair">Under repair</option>
                    <option value="Lost">Lost</option>
                    <option value="Damaged">Damaged</option>
                    <option value="Retired">Retired</option>
                    <option value="Disposed">Disposed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Physical Condition</label>
                  <select
                    value={form.condition}
                    onChange={e => setForm({ ...form, condition: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold"
                  >
                    <option value="Good">Good</option>
                    <option value="Used but usable">Used but usable</option>
                    <option value="Damaged">Damaged</option>
                    <option value="In Repair">In Repair</option>
                    <option value="Scrap">Scrap</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs cursor-pointer">Register Asset</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reassign Asset Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 uppercase tracking-wider font-heading">Reassign Asset: {showAssignModal.asset_number}</h3>
              <button onClick={() => setShowAssignModal(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleReassignAsset} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Reassign Employee Name *</label>
                <input
                  type="text"
                  required
                  value={assignForm.assigned_employee_name}
                  onChange={e => setAssignForm({ ...assignForm, assigned_employee_name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">New Location / Desk</label>
                <input
                  type="text"
                  value={assignForm.assigned_location}
                  onChange={e => setAssignForm({ ...assignForm, assigned_location: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Asset Condition</label>
                <select
                  value={assignForm.condition}
                  onChange={e => setAssignForm({ ...assignForm, condition: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold"
                >
                  <option value="Good">Good</option>
                  <option value="Used but usable">Used but usable</option>
                  <option value="Damaged">Damaged</option>
                  <option value="In Repair">In Repair</option>
                  <option value="Scrap">Scrap</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowAssignModal(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs cursor-pointer">Update Assignment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
