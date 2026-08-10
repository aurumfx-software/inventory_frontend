import React, { useState, useEffect } from 'react';
import { FileText, Plus, Send, Copy, X, Ban } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';

export default function IndentManagement() {
  const { user } = useAuth();
  const [indents, setIndents] = useState([]);
  const [itemsMaster, setItemsMaster] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [cancelModalId, setCancelModalId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  const [form, setForm] = useState({
    purpose: 'New Hardware Equipment Setup',
    priority: 'Normal',
    required_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    cost_centre: 'IT-001',
    remarks: '',
    items: [
      { item_id: 'itm-01', requested_qty: 10, estimated_rate: 72000, technical_spec: '16GB RAM, 512GB SSD' }
    ]
  });

  useEffect(() => {
    fetchIndents();
    fetch('/api/items').then(r => r.json()).then(d => d.success && setItemsMaster(d.data));
  }, []);

  const fetchIndents = async () => {
    try {
      const res = await fetch('/api/indents');
      const data = await res.json();
      if (data.success) setIndents(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const addItemLine = () => {
    setForm({
      ...form,
      items: [
        ...form.items,
        { item_id: itemsMaster[0]?.id || 'itm-01', requested_qty: 1, estimated_rate: itemsMaster[0]?.valuation_rate || 100, technical_spec: '' }
      ]
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/indents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, requested_by: user.id })
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        fetchIndents();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyIndent = (indent) => {
    setForm({
      purpose: `Copy of ${indent.purpose}`,
      priority: indent.priority || 'Normal',
      required_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      cost_centre: indent.cost_centre || 'IT-001',
      remarks: `Copied from ${indent.indent_number}`,
      items: (indent.items || []).map(i => ({
        item_id: i.item_id,
        requested_qty: i.requested_qty,
        estimated_rate: i.estimated_rate,
        technical_spec: i.technical_spec || ''
      }))
    });
    setShowModal(true);
  };

  const handleSubmitIndent = async (indentId) => {
    try {
      const res = await fetch(`/api/indents/${indentId}/submit`, { method: 'POST' });
      const data = await res.json();
      if (data.success) fetchIndents();
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelReason) return;
    try {
      const indent = indents.find(i => i.id === cancelModalId);
      if (indent) {
        indent.status = 'Cancelled';
        indent.remarks = `Cancelled: ${cancelReason}`;
      }
      setCancelModalId(null);
      setCancelReason('');
      fetchIndents();
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
            <FileText className="w-5 h-5 text-purple-600" />
            <span>Material Indent Requisitions</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Internal material requisitions, stock reservation lookup & approval triggering.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center space-x-2 shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Material Indent</span>
        </button>
      </div>

      {/* Indents List */}
      <div className="space-y-4">
        {indents.map(indent => (
          <div key={indent.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4 hover:border-purple-200 transition">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-3">
                <span className="font-mono text-sm font-bold text-purple-700">{indent.indent_number}</span>
                <StatusBadge status={indent.status} />
                <span className="text-xs text-slate-500 font-medium">Req Date: {indent.request_date}</span>
                <span className="text-xs text-slate-600 font-semibold">&bull; Dept: {indent.department_name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-900 font-mono mr-2">Est Amount: ₹{(indent.total_estimated_amount || 0).toLocaleString()}</span>
                
                <button 
                  onClick={() => handleCopyIndent(indent)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1 transition"
                  title="Copy Indent to New Requisition"
                >
                  <Copy className="w-3.5 h-3.5 text-purple-600" />
                  <span>Copy</span>
                </button>

                {indent.status === 'Draft' && (
                  <button 
                    onClick={() => handleSubmitIndent(indent.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center space-x-1 shadow-xs transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit</span>
                  </button>
                )}

                {indent.status !== 'Cancelled' && indent.status !== 'Closed' && (
                  <button 
                    onClick={() => setCancelModalId(indent.id)}
                    className="bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold px-2.5 py-1.5 rounded-xl flex items-center space-x-1 border border-rose-200 transition"
                  >
                    <Ban className="w-3.5 h-3.5 text-rose-600" />
                    <span>Cancel</span>
                  </button>
                )}
              </div>
            </div>

            {/* Purpose & Priority */}
            <div className="grid grid-cols-3 gap-4 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Purpose</span>
                <span className="text-slate-800 font-bold">{indent.purpose}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Priority</span>
                <span className={`font-bold ${indent.priority === 'High' || indent.priority === 'Urgent' ? 'text-rose-600' : 'text-slate-700'}`}>{indent.priority}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Cost Centre</span>
                <span className="text-purple-700 font-mono font-bold">{indent.cost_centre}</span>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-100 font-bold">
                    <th className="pb-2">Item Code & Name</th>
                    <th className="pb-2">Req Qty</th>
                    <th className="pb-2">Stock Availability (Current / Reserved)</th>
                    <th className="pb-2">Est Rate</th>
                    <th className="pb-2">Est Total</th>
                    <th className="pb-2">Tech Specs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(indent.items || []).map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5">
                        <span className="font-mono text-purple-700 font-bold block">{item.item_code}</span>
                        <span className="text-slate-800 font-semibold">{item.item_name}</span>
                      </td>
                      <td className="py-2.5 font-mono font-bold text-slate-800">{item.requested_qty} {item.uom_symbol}</td>
                      <td className="py-2.5 font-mono">
                        <span className="text-slate-800 font-bold">{item.current_stock || 0}</span> / <span className="text-rose-600 font-bold">{item.reserved_stock || 0}</span>
                        <span className="text-emerald-600 font-bold block text-[10px] font-sans">(Avail: {item.available_stock || 0})</span>
                      </td>
                      <td className="py-2.5 font-mono text-slate-700">₹{(item.estimated_rate || 0).toLocaleString()}</td>
                      <td className="py-2.5 font-mono font-bold text-slate-900">₹{(item.estimated_amount || 0).toLocaleString()}</td>
                      <td className="py-2.5 text-slate-500 text-[11px] font-medium">{item.technical_spec || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Cancel Reason Modal */}
      {cancelModalId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider font-heading">Cancel Indent Requisition</h3>
            <p className="text-xs text-slate-500">Please provide a mandatory cancellation reason for audit tracking:</p>
            <textarea 
              rows="3"
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              placeholder="Enter cancellation reason..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
            />
            <div className="flex justify-end space-x-3 pt-2">
              <button onClick={() => setCancelModalId(null)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">Back</button>
              <button onClick={handleConfirmCancel} className="px-4 py-2 bg-rose-600 text-white font-bold text-xs rounded-xl shadow-xs">Confirm Cancellation</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider font-heading">Raise Material Indent Request</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Purpose *</label>
                  <input type="text" required value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800" />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Priority</label>
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800">
                    <option value="Low">Low</option>
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Required By Date</label>
                  <input type="date" value={form.required_date} onChange={e => setForm({ ...form, required_date: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800" />
                </div>
              </div>

              {/* Line Items */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider">Requested Line Items</h4>
                  <button type="button" onClick={addItemLine} className="text-purple-700 text-[11px] font-bold hover:underline">+ Add Line Item</button>
                </div>

                {form.items.map((line, idx) => (
                  <div key={idx} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                    <div className="grid grid-cols-4 gap-3">
                      <div className="col-span-2">
                        <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1">Select Item</label>
                        <select 
                          value={line.item_id} 
                          onChange={e => {
                            const selected = itemsMaster.find(i => i.id === e.target.value);
                            const updated = [...form.items];
                            updated[idx].item_id = e.target.value;
                            updated[idx].estimated_rate = selected?.valuation_rate || 0;
                            setForm({ ...form, items: updated });
                          }}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-800"
                        >
                          {itemsMaster.map(i => <option key={i.id} value={i.id}>{i.item_code} - {i.item_name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1">Req Quantity</label>
                        <input 
                          type="number" 
                          value={line.requested_qty} 
                          onChange={e => {
                            const updated = [...form.items];
                            updated[idx].requested_qty = Number(e.target.value);
                            setForm({ ...form, items: updated });
                          }}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1">Est Rate (₹)</label>
                        <input 
                          type="number" 
                          value={line.estimated_rate} 
                          onChange={e => {
                            const updated = [...form.items];
                            updated[idx].estimated_rate = Number(e.target.value);
                            setForm({ ...form, items: updated });
                          }}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-800"
                        />
                      </div>
                    </div>
                    <div>
                      <input 
                        type="text" 
                        placeholder="Technical specifications / preferred brand..." 
                        value={line.technical_spec}
                        onChange={e => {
                          const updated = [...form.items];
                          updated[idx].technical_spec = e.target.value;
                          setForm({ ...form, items: updated });
                        }}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-800 text-[11px]"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-purple-600 text-white font-bold rounded-xl shadow-xs">Save Draft Indent</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
