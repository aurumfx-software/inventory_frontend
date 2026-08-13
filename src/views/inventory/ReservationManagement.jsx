import React, { useState, useEffect } from 'react';
import { BookmarkCheck, Lock, RotateCcw, Search, ShieldCheck } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

export default function ReservationManagement() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchReservations();
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

  const handleReleaseReservation = async (reservationId) => {
    if (!window.confirm('Are you sure you want to release this stock reservation back to available inventory?')) return;
    try {
      const res = await fetch('/api/stock-reservations/release', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservation_id: reservationId })
      });
      const data = await res.json();
      if (data.success) fetchReservations();
    } catch (err) {
      console.error('Failed to release reservation:', err);
    }
  };

  const filteredReservations = reservations.filter(r => {
    const q = searchQuery.toLowerCase();
    return !q || r.item_code?.toLowerCase().includes(q) || r.item_name?.toLowerCase().includes(q) || r.transaction_id?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-5 border border-slate-200/80 rounded-2xl shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 font-heading flex items-center space-x-2">
            <BookmarkCheck className="w-5 h-5 text-purple-600" />
            <span>Stock Reservation Management (PDF Spec Section 27)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Prevents the same stock from being promised to multiple requests (Indent, Sales Order, Production, Project allocation).</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 border border-slate-200/80 rounded-2xl shadow-2xs flex items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search reservations by Item, Ref ID, Transaction..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-800"
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
              {filteredReservations.map(resv => (
                <tr key={resv.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-3.5 font-sans font-bold text-slate-800">{resv.transaction_type}</td>
                  <td className="p-3.5 font-bold text-purple-700">{resv.transaction_id}</td>
                  <td className="p-3.5 font-sans text-slate-800">
                    <span className="font-mono text-purple-800 font-bold mr-1">{resv.item_code}</span>
                    <span>{resv.item_name}</span>
                  </td>
                  <td className="p-3.5 font-sans text-slate-600">{resv.warehouse_name}</td>
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
                        className="text-xs text-purple-600 hover:text-purple-800 font-bold flex items-center justify-center space-x-1 hover:underline cursor-pointer mx-auto"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Release</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
