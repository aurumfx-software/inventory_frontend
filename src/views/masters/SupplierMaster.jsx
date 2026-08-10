import React, { useState, useEffect } from 'react';
import { Users, Plus, Star, Phone, Mail, Building, ShieldCheck, Search, X } from 'lucide-react';

export default function SupplierMaster() {
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    supplier_name: '',
    contact_person: '',
    phone: '',
    email: '',
    address_billing: '',
    gst_number: '',
    pan_number: '',
    payment_terms: 'Net 30 days',
    delivery_lead_time_days: 5
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await fetch('/api/suppliers');
      const data = await res.json();
      if (data.success) setSuppliers(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        fetchSuppliers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = suppliers.filter(s => 
    s.supplier_name.toLowerCase().includes(search.toLowerCase()) ||
    s.supplier_code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-5 border border-slate-200/80 rounded-2xl shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 font-heading flex items-center space-x-2">
            <Users className="w-5 h-5 text-purple-600" />
            <span>Supplier Directory & Rating Master</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Approved vendor database, performance ratings, lead times & bank details.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center space-x-2 shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>+ Register Supplier</span>
        </button>
      </div>

      <div className="bg-white p-3 border border-slate-200/80 rounded-2xl flex items-center justify-between shadow-xs">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search supplier name or code..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
          />
        </div>
        <div className="text-xs text-slate-500 font-mono">
          Approved Vendors: <span className="font-bold text-slate-900">{filtered.length}</span>
        </div>
      </div>

      {/* Supplier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(sup => (
          <div key={sup.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3 relative hover:border-purple-200 transition">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono text-[10px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                  {sup.supplier_code}
                </span>
                <h3 className="font-bold text-sm text-slate-900 mt-1.5">{sup.supplier_name}</h3>
                <p className="text-xs text-slate-500 flex items-center mt-0.5">
                  <Building className="w-3 h-3 mr-1 text-slate-400" /> {sup.contact_person}
                </p>
              </div>
              <div className="flex items-center space-x-1 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full text-amber-700 font-mono text-xs font-bold shadow-2xs">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{sup.rating || '5.0'}</span>
              </div>
            </div>

            <div className="space-y-1 text-xs text-slate-600 border-t border-b border-slate-100 py-2">
              <p className="flex items-center text-slate-600"><Phone className="w-3 h-3 mr-2 text-purple-600" /> {sup.phone}</p>
              <p className="flex items-center text-slate-600"><Mail className="w-3 h-3 mr-2 text-purple-600" /> {sup.email}</p>
              <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">{sup.address_billing}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">GSTIN</span>
                <span className="font-mono font-semibold text-slate-800">{sup.gst_number || 'N/A'}</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Lead Time</span>
                <span className="font-mono font-bold text-emerald-600">{sup.delivery_lead_time_days || 5} Days</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-1">
              <span className="text-[10px] text-slate-500 font-medium">Terms: {sup.payment_terms}</span>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3" />
                <span>{sup.approval_status}</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Registration Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider font-heading">Register Supplier / Vendor</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Legal Supplier Name *</label>
                <input type="text" required value={form.supplier_name} onChange={e => setForm({ ...form, supplier_name: e.target.value })} placeholder="Global Supplies Corp" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Contact Person</label>
                  <input type="text" value={form.contact_person} onChange={e => setForm({ ...form, contact_person: e.target.value })} placeholder="John Doe" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800" />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Phone Number</label>
                  <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 98000 00000" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Email Address</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="vendor@supplies.com" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800" />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">GSTIN Number</label>
                  <input type="text" value={form.gst_number} onChange={e => setForm({ ...form, gst_number: e.target.value })} placeholder="29AAACG1234F1Z1" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800" />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-purple-600 text-white font-bold rounded-xl shadow-xs">Save Vendor</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
