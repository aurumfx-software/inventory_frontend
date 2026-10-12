import React, { useState, useEffect } from 'react';
import { X, User, Search, Plus, Loader2, UserPlus, AlertCircle, Check } from 'lucide-react';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Puducherry', 'Jammu & Kashmir', 'Ladakh', 'Chandigarh',
  'Andaman & Nicobar Islands', 'Dadra & Nagar Haveli', 'Daman & Diu', 'Lakshadweep'
];

export default function CustomerModal({ customer, onSave, onClose }) {
  const [mode, setMode] = useState('search'); // search | form | walkin
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '', email: '', address: '', state: 'Kerala', gstin: '', is_walk_in: false
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) { setCustomers([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/billing/customers/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setCustomers(data.success ? data.data : []);
      } catch { setCustomers([]); }
      finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const handleSaveNew = async () => {
    if (!form.name.trim()) { setError('Customer name is required.'); return; }
    setSaving(true); setError('');
    try {
      const res = await fetch('/api/billing/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        onSave({ ...data.data, is_walk_in: false });
      } else {
        setError(data.detail || data.message || 'Failed to save customer.');
      }
    } catch { setError('Network error.'); } finally { setSaving(false); }
  };

  const handleWalkIn = () => {
    onSave({ name: 'Walk-in Customer', phone: '', email: '', address: '', state: '', gstin: '', is_walk_in: true });
  };

  const field = (label, key, type = 'text', required = false) => (
    <div>
      <label className="text-[10px] font-bold text-slate-500 block mb-1">{label}{required && <span className="text-rose-500 ml-0.5">*</span>}</label>
      <input
        type={type}
        value={form[key]}
        onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 outline-none focus:border-slate-900 transition"
        placeholder={label}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 no-print">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h2 className="text-sm font-bold text-slate-900 font-heading flex items-center space-x-2">
            <User className="w-4 h-4 text-slate-900" />
            <span>Select Customer</span>
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          {[
            ['search', 'Search Existing'],
            ['form', 'Add New Details'],
            ['walkin', 'Walk-in Customer']
          ].map(([m, label]) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2.5 text-xs font-bold transition cursor-pointer border-b-2 ${
                mode === m
                  ? 'text-slate-950 border-slate-900 bg-white'
                  : 'text-slate-500 border-transparent hover:text-slate-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {/* Search Mode */}
          {mode === 'search' && (
            <div className="space-y-3">
              <div className="flex items-center bg-slate-50 border border-slate-300 rounded-xl overflow-hidden focus-within:border-slate-900 transition">
                <Search className="w-4 h-4 text-slate-400 ml-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search by name, phone or email..."
                  className="flex-1 px-3 py-2.5 text-xs bg-transparent text-slate-900 outline-none"
                  autoFocus
                />
                {loading && <Loader2 className="w-4 h-4 animate-spin text-slate-500 mr-3" />}
              </div>

              {customers.length === 0 && searchQuery && !loading && (
                <div className="text-center py-6 text-slate-400">
                  <User className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-xs">
                    No customers found.{' '}
                    <button onClick={() => setMode('form')} className="text-slate-900 font-bold underline cursor-pointer">
                      Add new?
                    </button>
                  </p>
                </div>
              )}

              <div className="space-y-1.5">
                {customers.map(c => (
                  <button
                    key={c.id}
                    onClick={() => onSave({ ...c, is_walk_in: false })}
                    className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition cursor-pointer text-left"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-slate-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900">{c.name}</p>
                        <div className="flex items-center space-x-2 text-[10px] text-slate-500 mt-0.5">
                          {c.phone && <span>{c.phone}</span>}
                          {c.gstin && <span className="font-mono">GSTIN: {c.gstin}</span>}
                        </div>
                      </div>
                    </div>
                    <Check className="w-4 h-4 text-slate-600 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add New Customer Form */}
          {mode === 'form' && (
            <div className="space-y-3">
              {error && (
                <div className="flex items-center space-x-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl px-3 py-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                {field('Customer Name', 'name', 'text', true)}
                {field('Phone Number', 'phone', 'tel')}
                {field('Email Address', 'email', 'email')}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">State</label>
                  <select
                    value={form.state}
                    onChange={e => setForm(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 outline-none focus:border-slate-900 cursor-pointer"
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Billing Address</label>
                <textarea
                  value={form.address}
                  onChange={e => setForm(prev => ({ ...prev, address: e.target.value }))}
                  rows={2}
                  placeholder="Full billing address..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 outline-none focus:border-slate-900 resize-none"
                />
              </div>
              {field('GSTIN (Optional)', 'gstin')}
            </div>
          )}

          {/* Walk-in */}
          {mode === 'walkin' && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                <User className="w-7 h-7 text-slate-700" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Default Walk-in Customer</h3>
              <p className="text-xs text-slate-500 mb-5 max-w-xs">
                No customer registration required. Suitable for normal walk-in supermarket retail customers.
              </p>
              <button
                onClick={handleWalkIn}
                className="px-6 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-black transition cursor-pointer shadow-sm"
              >
                Continue as Walk-in
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {mode === 'form' && (
          <div className="flex items-center justify-end space-x-3 px-5 py-3 border-t border-slate-200 bg-slate-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs border border-slate-300 rounded-xl text-slate-700 hover:bg-white cursor-pointer font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveNew}
              disabled={saving}
              className="px-5 py-2 text-xs bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition cursor-pointer disabled:opacity-50 flex items-center space-x-2"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
              <span>Save & Use</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
