import React, { useState } from 'react';
import { Lock, CheckCircle2, XCircle } from 'lucide-react';

export default function ReservationManagement() {
  const [reservations] = useState([
    {
      id: 'res-01',
      item_code: 'IT-LAP-0001',
      item_name: 'Dell Latitude 5440 Laptop',
      warehouse: 'WH-MAIN',
      transaction_type: 'INDENT_APPROVAL',
      transaction_id: 'IND-2026-001001',
      reserved_qty: 5,
      consumed_qty: 0,
      released_qty: 0,
      expiry_date: '2026-08-25',
      status: 'Active Reserved'
    }
  ]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 border border-slate-200/80 rounded-2xl shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 font-heading flex items-center space-x-2">
          <Lock className="w-5 h-5 text-purple-600" />
          <span>27. Reservation Management Page</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">Prevents the same stock from being promised to multiple requests (`Available = On-Hand - Reserved`) (PDF Page 28-29).</p>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-xs text-left font-mono">
          <thead>
            <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200 font-bold font-sans">
              <th className="p-3.5">Txn Type</th>
              <th className="p-3.5">Txn Reference ID</th>
              <th className="p-3.5">Item Name</th>
              <th className="p-3.5">Warehouse</th>
              <th className="p-3.5 text-right">Reserved Qty</th>
              <th className="p-3.5 text-right">Consumed Qty</th>
              <th className="p-3.5">Reservation Expiry</th>
              <th className="p-3.5 text-right font-sans">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reservations.map(res => (
              <tr key={res.id} className="hover:bg-slate-50/80 transition">
                <td className="p-3.5 font-bold text-purple-700 font-sans">{res.transaction_type}</td>
                <td className="p-3.5 font-bold text-slate-900">{res.transaction_id}</td>
                <td className="p-3.5 text-slate-800 font-sans font-semibold">{res.item_code} - {res.item_name}</td>
                <td className="p-3.5 text-slate-600 font-sans">{res.warehouse}</td>
                <td className="p-3.5 text-right font-bold text-rose-600">{res.reserved_qty}</td>
                <td className="p-3.5 text-right text-slate-500">{res.consumed_qty}</td>
                <td className="p-3.5 text-slate-500 font-sans">{res.expiry_date}</td>
                <td className="p-3.5 text-right font-sans">
                  <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {res.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
