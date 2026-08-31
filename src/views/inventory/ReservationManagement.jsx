import React, { useState, useEffect } from 'react';
import { BookmarkCheck, Lock, RotateCcw, Search, Plus, X, ShieldCheck, RefreshCw, Layers } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

export default function ReservationManagement() {
  const [reservations, setReservations] = useState([]);
  const [items, setItems] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    transaction_type: 'Indent Request',
    transaction_id: 'IND-2026-000125',
    item_id: 'itm-01',
    warehouse_id: 'wh-01',
    reserved_qty: 5,
    expiry_date: '2026-10-30'
  });

  useEffect(() => {
    fetchReservations();
    fetch('/api/items').then(r => r.json()).then(d => d.success && setItems(d.data));
    fetch('/api/warehouses').then(r => r.json()).then(d => d.success && setWarehouses(d.data));
  }, []);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stock-reservations');
      const data = await res.json();
      if (data.success) setReservations(data.data || []);
    } catch (err) {
      console.error('Failed to fetch reservations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReservation = async (e) => {
    e.preventDefault();
    const selItem = items.find(i => i.id === form.item_id) || items[0];
    const selWh = warehouses.find(w => w.id === form.warehouse_id);

    try {
      const res = await fetch('/api/stock-reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          item_code: selItem ? selItem.item_code : 'IT-LAP-0001',
          item_name: selItem ? selItem.item_name : 'Dell Latitude 5440 Laptop',
          warehouse_name: selWh ? selWh.name : 'Central Goods Warehouse'
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || 'Stock reservation created successfully.');
        setShowModal(false);
        fetchReservations();
      } else {
        alert(data.message || 'Failed to create reservation.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error creating stock reservation.');
    }
  };

  const handleReleaseReservation = async (reservationId) => {
    if (!window.confirm('Are you sure you want to release this stock reservation back to available inventory?')) return;
    try {
      const res = await fetch('/api/stock-reservations/release', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservation_id: reservationId })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || 'Stock reservation released.');
        fetchReservations();
      }
    } catch (err) {
      console.error('Failed to release reservation:', err);
    }
  };

  const filteredReservations = reservations.filter(r => {
    const q = searchQuery.toLowerCase();
    return !q || r.item_code?.toLowerCase().includes(q) || r.item_name?.toLowerCase().includes(q) || r.transaction_id?.toLowerCase().includes(q) || r.transaction_type?.toLowerCase().includes(q);
  });

  const totalReservedQty = reservations.filter(r => r.status === 'Active').reduce((acc, r) => acc + (Number(r.reserved_qty) || 0), 0);
  const activeCount = reservations.filter(r => r.status === 'Active').length;
  const releasedCount = reservations.filter(r => r.status === 'Released').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 border border-slate-200/80 rounded-2xl shadow-xs gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <BookmarkCheck className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-slate-900 font-heading">Reservation Management Page (PDF Spec Section 27)</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">Prevents double-promising stock for approved indents, sales orders, production jobs, and project allocations.</p>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={fetchReservations}
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
            <span>+ Create Stock Reservation</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Reservations</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{reservations.length}</p>
        </div>
        <div className="bg-white border border-amber-200 p-4 rounded-2xl shadow-xs bg-amber-50/30">
          <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Active Reserved Qty</p>
          <p className="text-2xl font-black text-amber-900 mt-1">{totalReservedQty} Units</p>
        </div>
        <div className="bg-white border border-purple-200 p-4 rounded-2xl shadow-xs bg-purple-50/30">
          <p className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">Active Transactions</p>
          <p className="text-2xl font-black text-purple-900 mt-1">{activeCount}</p>
        </div>
        <div className="bg-white border border-emerald-200 p-4 rounded-2xl shadow-xs bg-emerald-50/30">
          <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Released Back to Stock</p>
          <p className="text-2xl font-black text-emerald-900 mt-1">{releasedCount}</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 border border-slate-200/80 rounded-2xl shadow-2xs flex items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search reservations by Item, Ref ID, Transaction..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-800 font-semibold"
          />
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200 font-bold font-sans">
                <th className="p-3.5">Txn Type</th>
                <th className="p-3.5">Txn Ref ID</th>
                <th className="p-3.5">Item Code & Name</th>
                <th className="p-3.5">Warehouse</th>
                <th className="p-3.5 font-mono text-right">Reserved Qty</th>
                <th className="p-3.5 font-mono text-right">Consumed Qty</th>
                <th className="p-3.5 font-mono text-right">Released Qty</th>
                <th className="p-3.5 font-mono">Expiry Date</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400 font-sans italic">
                    No active stock reservations recorded yet. Click "+ Create Stock Reservation" above to allocate stock for indents.
                  </td>
                </tr>
              ) : (
                filteredReservations.map(resv => (
                  <tr key={resv.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5 font-sans font-bold text-slate-800">{resv.transaction_type}</td>
                    <td className="p-3.5 font-bold text-purple-700">{resv.transaction_id}</td>
                    <td className="p-3.5 font-sans text-slate-800">
                      <span className="font-mono text-purple-800 font-bold mr-1 block text-[11px]">{resv.item_code}</span>
                      <span>{resv.item_name}</span>
                    </td>
                    <td className="p-3.5 font-sans text-slate-600">{resv.warehouse_name || 'Central Warehouse'}</td>
                    <td className="p-3.5 text-right font-bold text-amber-600">{resv.reserved_qty}</td>
                    <td className="p-3.5 text-right font-bold text-slate-700">{resv.consumed_qty || 0}</td>
                    <td className="p-3.5 text-right font-bold text-emerald-700">{resv.released_qty || 0}</td>
                    <td className="p-3.5 text-slate-500">{resv.expiry_date || 'No Expiry'}</td>
                    <td className="p-3.5 text-center font-sans">
                      <StatusBadge status={resv.status || 'Active'} />
                    </td>
                    <td className="p-3.5 text-center font-sans">
                      {resv.status === 'Active' && (
                        <button
                          onClick={() => handleReleaseReservation(resv.id)}
                          className="text-xs text-purple-600 hover:text-purple-800 font-bold flex items-center justify-center space-x-1 hover:underline cursor-pointer mx-auto bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2.5 py-1 rounded-xl transition"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Release</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Reservation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 uppercase tracking-wider font-heading flex items-center space-x-2">
                <BookmarkCheck className="w-5 h-5 text-purple-600" />
                <span>Create Stock Reservation</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleCreateReservation} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Transaction Type *</label>
                  <select
                    value={form.transaction_type}
                    onChange={e => setForm({ ...form, transaction_type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold"
                  >
                    <option value="Indent Request">Indent Request</option>
                    <option value="Sales Order">Sales Order</option>
                    <option value="Production Job">Production Job</option>
                    <option value="Project Allocation">Project Allocation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Transaction Ref ID *</label>
                  <input
                    type="text"
                    required
                    value={form.transaction_id}
                    onChange={e => setForm({ ...form, transaction_id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Item to Reserve *</label>
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
                  <label className="block text-slate-700 font-bold mb-1">Warehouse *</label>
                  <select
                    value={form.warehouse_id}
                    onChange={e => setForm({ ...form, warehouse_id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold"
                  >
                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Reserved Quantity *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={form.reserved_qty}
                    onChange={e => setForm({ ...form, reserved_qty: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Reservation Expiry Date</label>
                <input
                  type="date"
                  value={form.expiry_date}
                  onChange={e => setForm({ ...form, expiry_date: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs cursor-pointer">Reserve Stock</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
