import React, { useState, useEffect } from 'react';
import { ClipboardList, EyeOff, Plus, X, CheckCircle2, RotateCcw, Building2, User, AlertCircle, RefreshCw } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

export default function StockVerification() {
  const [sessions, setSessions] = useState([]);
  const [items, setItems] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [reconcilingId, setReconcilingId] = useState(null);

  const [form, setForm] = useState({
    warehouse_id: 'wh-01',
    counter_name: 'Michael Chang (Store Manager)',
    is_blind_count: true,
    item_id: 'itm-01',
    physical_quantity: 8,
    reason: 'Annual Physical Inventory Audit'
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [sessRes, itemRes, whRes, usrRes] = await Promise.all([
        fetch('/api/stock-counts'),
        fetch('/api/items'),
        fetch('/api/warehouses'),
        fetch('/api/users')
      ]);

      const sessData = await sessRes.json();
      const itemData = await itemRes.json();
      const whData = await whRes.json();
      const usrData = await usrRes.json();

      if (sessData.success) setSessions(sessData.data);
      if (itemData.success) setItems(itemData.data);
      if (whData.success) setWarehouses(whData.data);
      if (usrData.success) setUsers(usrData.data);
    } catch (err) {
      console.error('Failed to load stock verification data:', err);
    }
  };

  const handleCreateCount = async (e) => {
    e.preventDefault();
    const selectedItem = items.find(i => i.id === form.item_id) || items[0];
    const wh = warehouses.find(w => w.id === form.warehouse_id);

    try {
      const res = await fetch('/api/stock-counts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          warehouse_id: form.warehouse_id,
          warehouse_name: wh ? wh.name : 'Central Goods Warehouse',
          counter_name: form.counter_name,
          is_blind_count: form.is_blind_count,
          count_entries: [
            {
              item_id: selectedItem ? selectedItem.id : 'itm-01',
              item_code: selectedItem ? selectedItem.item_code : 'IT-LAP-0001',
              item_name: selectedItem ? selectedItem.item_name : 'Dell Latitude 5440 Laptop',
              system_quantity: selectedItem ? (selectedItem.on_hand_qty || 10) : 10,
              physical_quantity: Number(form.physical_quantity),
              reason: form.reason
            }
          ]
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || 'Physical stock count session created successfully.');
        setShowModal(false);
        fetchAll();
      } else {
        alert(data.message || 'Failed to create count session.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error creating stock count session.');
    }
  };

  const handleReconcile = async (cntId) => {
    if (!window.confirm('Are you sure you want to reconcile this physical count? System stock balances will be adjusted to match physical counts.')) return;
    
    setReconcilingId(cntId);
    try {
      const res = await fetch(`/api/stock-counts/${cntId}/reconcile`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert(data.message || 'Stock count session reconciled successfully.');
        fetchAll();
      } else {
        alert(data.message || 'Reconciliation failed.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error during reconciliation.');
    } finally {
      setReconcilingId(null);
    }
  };

  const totalSessions = sessions.length;
  const inProgressCount = sessions.filter(s => s.status === 'In Progress').length;
  const reconciledCount = sessions.filter(s => s.status === 'Reconciled').length;
  const blindCountSessions = sessions.filter(s => s.is_blind_count).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 border border-slate-200/80 rounded-2xl shadow-xs gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <ClipboardList className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-slate-900 font-heading">Physical Stock Verification Page (PDF Spec Section 26)</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">Compares physical stock with system stock, supports blind count mode to prevent bias, and generates reconciliation adjustments.</p>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={fetchAll}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl flex items-center space-x-1.5 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center space-x-2 shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Stock-Count Session</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Count Sessions</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalSessions}</p>
        </div>
        <div className="bg-white border border-amber-200 p-4 rounded-2xl shadow-xs bg-amber-50/30">
          <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">In Progress Audit</p>
          <p className="text-2xl font-black text-amber-900 mt-1">{inProgressCount}</p>
        </div>
        <div className="bg-white border border-emerald-200 p-4 rounded-2xl shadow-xs bg-emerald-50/30">
          <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Reconciled Sessions</p>
          <p className="text-2xl font-black text-emerald-900 mt-1">{reconciledCount}</p>
        </div>
        <div className="bg-white border border-purple-200 p-4 rounded-2xl shadow-xs bg-purple-50/30">
          <p className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">Blind Count Active</p>
          <p className="text-2xl font-black text-purple-900 mt-1">{blindCountSessions}</p>
        </div>
      </div>

      {/* Count Sessions List */}
      <div className="space-y-4">
        {sessions.map(sess => (
          <div key={sess.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4 hover:border-purple-200 transition">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-3 gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm font-bold text-purple-900 bg-purple-50 border border-purple-200 px-3 py-1 rounded-xl">
                  {sess.count_session_number || sess.session_number}
                </span>
                <StatusBadge status={sess.status} />
                {sess.is_blind_count && (
                  <span className="bg-purple-100 text-purple-800 border border-purple-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                    <EyeOff className="w-3 h-3 text-purple-700" />
                    <span>BLIND COUNT MODE (System Qty Hidden)</span>
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-3 text-xs text-slate-500 font-mono">
                <span>Warehouse: <strong>{sess.warehouse_name || 'Central Warehouse'}</strong></span>
                <span>Date: <strong>{sess.count_date}</strong></span>
                {sess.status === 'In Progress' && (
                  <button
                    onClick={() => handleReconcile(sess.id)}
                    disabled={reconcilingId === sess.id}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl flex items-center space-x-1 transition shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{reconcilingId === sess.id ? 'Reconciling...' : 'Approve & Post Reconciliation'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Entries Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left font-mono">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200 font-bold font-sans">
                    <th className="py-2.5 px-3">Item Code & Name</th>
                    <th className="py-2.5 px-3 text-right">System Frozen Qty</th>
                    <th className="py-2.5 px-3 text-right">Physical Count Qty</th>
                    <th className="py-2.5 px-3 text-right">Variance Qty</th>
                    <th className="py-2.5 px-3 text-right">Variance Value (₹)</th>
                    <th className="py-2.5 px-3 font-sans">Reason / Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(sess.entries || []).map((e, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 font-sans font-bold text-slate-900">
                        <span className="text-purple-700 font-mono text-[11px] block">{e.item_code}</span>
                        <span>{e.item_name}</span>
                      </td>
                      <td className="py-3 px-3 text-right text-slate-500 font-bold">
                        {sess.is_blind_count && sess.status === 'In Progress' ? (
                          <span className="text-slate-400 bg-slate-100 px-2 py-0.5 rounded text-[10px]">*** (Hidden in Blind Count)</span>
                        ) : (
                          e.system_quantity
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-purple-900">{e.physical_quantity}</td>
                      <td className={`py-3 px-3 text-right font-bold ${e.variance_quantity < 0 ? 'text-rose-600' : e.variance_quantity > 0 ? 'text-emerald-600' : 'text-slate-500'}`}>
                        {e.variance_quantity > 0 ? `+${e.variance_quantity}` : e.variance_quantity}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900">₹{(e.variance_value || 0).toLocaleString()}</td>
                      <td className="py-3 px-3 text-slate-500 font-sans text-[11px]">{e.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Start Count Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 uppercase tracking-wider font-heading flex items-center space-x-2">
                <ClipboardList className="w-5 h-5 text-purple-600" />
                <span>Start Stock Verification Session</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleCreateCount} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Target Warehouse *</label>
                  <select 
                    value={form.warehouse_id} 
                    onChange={e => setForm({ ...form, warehouse_id: e.target.value })} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold"
                  >
                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Assigned Counter *</label>
                  <input 
                    type="text" 
                    value={form.counter_name} 
                    onChange={e => setForm({ ...form, counter_name: e.target.value })} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Select Item to Verify *</label>
                <select 
                  value={form.item_id} 
                  onChange={e => setForm({ ...form, item_id: e.target.value })} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold"
                >
                  {items.map(i => <option key={i.id} value={i.id}>{i.item_code} - {i.item_name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Physical Counted Quantity *</label>
                <input 
                  type="number" 
                  value={form.physical_quantity} 
                  onChange={e => setForm({ ...form, physical_quantity: e.target.value })} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold text-sm" 
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Audit Reason / Purpose</label>
                <input 
                  type="text" 
                  value={form.reason} 
                  onChange={e => setForm({ ...form, reason: e.target.value })} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold" 
                />
              </div>

              {/* Blind Count Option Box */}
              <div className="p-3 bg-purple-50/80 border border-purple-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center space-x-2 text-purple-900">
                  <EyeOff className="w-4 h-4 text-purple-700" />
                  <div>
                    <span className="font-bold block">Blind Count Option (PDF Spec Section 26)</span>
                    <span className="text-[10px] text-purple-700">Hides system quantity during counting to prevent biased reporting.</span>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={form.is_blind_count} 
                  onChange={e => setForm({ ...form, is_blind_count: e.target.checked })} 
                  className="w-4 h-4 accent-purple-600 cursor-pointer"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs cursor-pointer">Post Count & Reconcile</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
