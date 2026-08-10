import React, { useState, useEffect } from 'react';
import { Laptop, Plus, User, MapPin, Calendar, X } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

export default function AssetTracking() {
  const [assets, setAssets] = useState([]);
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    item_id: 'itm-01',
    serial_number: 'DELL-LAT-9099',
    purchase_value: 72000,
    assigned_location: 'Building A, Desk 405'
  });

  useEffect(() => {
    fetchAssets();
    fetch('/api/items').then(r => r.json()).then(d => d.success && setItems(d.data));
  }, []);

  const fetchAssets = async () => {
    try {
      const res = await fetch('/api/assets');
      const data = await res.json();
      if (data.success) setAssets(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegisterAsset = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        fetchAssets();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-5 border border-slate-200/80 rounded-2xl shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 font-heading flex items-center space-x-2">
            <Laptop className="w-5 h-5 text-purple-600" />
            <span>IT & Equipment Asset Tracking Registry</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Individual asset tracking, serial mapping, assigned employees & warranty tracking.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center space-x-2 shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>+ Register Asset</span>
        </button>
      </div>

      {/* Asset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assets.map(ast => (
          <div key={ast.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3 hover:border-purple-200 transition">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono text-[10px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                  {ast.asset_number}
                </span>
                <h3 className="font-bold text-sm text-slate-900 mt-1.5">{ast.item_name}</h3>
                <p className="text-xs font-mono text-purple-700 mt-0.5 font-semibold">SN: {ast.serial_number}</p>
              </div>
              <StatusBadge status={ast.status} />
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 border-t border-b border-slate-100 py-2">
              <p className="flex items-center text-slate-700"><User className="w-3.5 h-3.5 mr-2 text-purple-600" /> Assigned: <strong className="ml-1 text-slate-900">{ast.assigned_employee_name || 'David Miller'}</strong></p>
              <p className="flex items-center text-slate-500"><MapPin className="w-3.5 h-3.5 mr-2 text-purple-600" /> {ast.assigned_location}</p>
              <p className="flex items-center text-slate-500"><Calendar className="w-3.5 h-3.5 mr-2 text-purple-600" /> Warranty: <span className="ml-1 font-mono text-emerald-700 font-bold">{ast.warranty_expiry}</span></p>
            </div>

            <div className="flex justify-between items-center text-[11px] font-mono">
              <span className="text-slate-500">Value: ₹{(ast.purchase_value || 0).toLocaleString()}</span>
              <span className="text-emerald-700 font-bold">Condition: {ast.condition}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Register Asset Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider font-heading">Register Equipment Asset</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleRegisterAsset} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Select Item</label>
                <select value={form.item_id} onChange={e => setForm({ ...form, item_id: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800">
                  {items.map(i => <option key={i.id} value={i.id}>{i.item_code} - {i.item_name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Serial Number *</label>
                <input type="text" required value={form.serial_number} onChange={e => setForm({ ...form, serial_number: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Purchase Value (₹)</label>
                  <input type="number" value={form.purchase_value} onChange={e => setForm({ ...form, purchase_value: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800" />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Location</label>
                  <input type="text" value={form.assigned_location} onChange={e => setForm({ ...form, assigned_location: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800" />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-purple-600 text-white font-bold rounded-xl shadow-xs">Register Asset</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
