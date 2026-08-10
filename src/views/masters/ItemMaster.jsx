import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, QrCode, X } from 'lucide-react';

export default function ItemMaster() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [uoms, setUoms] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBarcodeModal, setShowBarcodeModal] = useState(null);

  const [formData, setFormData] = useState({
    item_code: '',
    item_name: '',
    description: '',
    category_id: 'cat-01',
    brand_id: 'brd-01',
    uom_id: 'uom-01',
    purchase_uom_id: 'uom-01',
    tax_rate_id: 'tax-18',
    hsn_sac_code: '84713010',
    min_stock_level: 5,
    max_stock_level: 50,
    reorder_level: 10,
    reorder_qty: 15,
    valuation_rate: 72000,
    is_batch_tracked: false,
    is_serial_tracked: false,
    is_expiry_tracked: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resItems, resCats, resBrands, resUoms, resTaxes] = await Promise.all([
        fetch('/api/items').then(r => r.json()),
        fetch('/api/categories').then(r => r.json()),
        fetch('/api/brands').then(r => r.json()),
        fetch('/api/uoms').then(r => r.json()),
        fetch('/api/taxes').then(r => r.json())
      ]);

      if (resItems.success) setItems(resItems.data);
      if (resCats.success) setCategories(resCats.data);
      if (resBrands.success) setBrands(resBrands.data);
      if (resUoms.success) setUoms(resUoms.data);
      if (resTaxes.success) setTaxes(resTaxes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setShowCreateModal(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredItems = items.filter(i => 
    i.item_code.toLowerCase().includes(search.toLowerCase()) ||
    i.item_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-5 border border-slate-200/80 rounded-2xl shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 font-heading flex items-center space-x-2">
            <Package className="w-5 h-5 text-purple-600" />
            <span>Item Master Directory</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Permanent catalog of inventory items, specs, UOM conversions & barcode tracking.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center space-x-2 shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Item</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 border border-slate-200/80 rounded-2xl flex items-center justify-between shadow-xs">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by code or name..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500 focus:bg-white"
          />
        </div>
        <div className="text-xs text-slate-500 font-mono">
          Total Items: <span className="font-bold text-slate-900">{filteredItems.length}</span>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200 font-bold">
              <th className="p-3.5">Item Code</th>
              <th className="p-3.5">Item Name & Specs</th>
              <th className="p-3.5">Category</th>
              <th className="p-3.5">Stock & UOM</th>
              <th className="p-3.5">Reorder Level</th>
              <th className="p-3.5">Valuation Rate</th>
              <th className="p-3.5">Tracking Features</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredItems.map(item => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition">
                <td className="p-3.5 font-mono font-bold text-purple-700">{item.item_code}</td>
                <td className="p-3.5">
                  <p className="font-bold text-slate-800">{item.item_name}</p>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{item.description}</p>
                </td>
                <td className="p-3.5 text-slate-700 font-medium">{item.category_name}</td>
                <td className="p-3.5 font-mono">
                  <span className="font-bold text-emerald-600">{item.on_hand_qty}</span> {item.uom_symbol}
                  <span className="text-[10px] text-slate-400 block font-sans">(Avail: {item.available_qty})</span>
                </td>
                <td className="p-3.5 font-mono text-slate-700">
                  {item.reorder_level} {item.uom_symbol}
                  {item.available_qty <= item.reorder_level && (
                    <span className="ml-2 text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.2 rounded-full font-bold">Reorder</span>
                  )}
                </td>
                <td className="p-3.5 font-mono font-bold text-slate-800">₹{(item.valuation_rate || 0).toLocaleString()}</td>
                <td className="p-3.5">
                  <div className="flex space-x-1">
                    {item.is_serial_tracked && <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[9px] px-1.5 py-0.2 rounded-full font-bold">SERIAL</span>}
                    {item.is_batch_tracked && <span className="bg-cyan-50 text-cyan-700 border border-cyan-200 text-[9px] px-1.5 py-0.2 rounded-full font-bold">BATCH</span>}
                    {item.is_expiry_tracked && <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[9px] px-1.5 py-0.2 rounded-full font-bold">EXPIRY</span>}
                  </div>
                </td>
                <td className="p-3.5 text-right">
                  <button 
                    onClick={() => setShowBarcodeModal(item)}
                    className="p-1.5 bg-slate-50 border border-slate-200 hover:border-purple-400 rounded-lg text-slate-600 hover:text-purple-700 transition"
                    title="View Barcode / QR Code"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Barcode Modal */}
      {showBarcodeModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-sm text-center shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="font-bold text-sm text-slate-800">Barcode & QR Identifier</h3>
              <button onClick={() => setShowBarcodeModal(null)} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
            </div>
            <p className="font-bold text-slate-900 text-sm">{showBarcodeModal.item_name}</p>
            <p className="text-xs font-mono text-purple-700 font-bold">{showBarcodeModal.item_code}</p>

            <div className="p-4 bg-slate-50 rounded-xl inline-block border border-slate-200">
              <div className="font-mono text-xs text-slate-900 font-bold tracking-widest text-center">
                ||| | |||| | ||| |||| | |||
              </div>
              <p className="font-mono text-[10px] text-slate-800 mt-1 font-bold">{showBarcodeModal.barcode}</p>
            </div>

            <button onClick={() => setShowBarcodeModal(null)} className="w-full bg-slate-100 text-slate-800 font-bold text-xs py-2 rounded-xl border border-slate-200">Close</button>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider font-heading">Create New Inventory Item</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Item Code (Leave blank for auto-gen)</label>
                  <input type="text" value={formData.item_code} onChange={e => setFormData({ ...formData, item_code: e.target.value })} placeholder="IT-LAP-0005" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800" />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Item Name *</label>
                  <input type="text" required value={formData.item_name} onChange={e => setFormData({ ...formData, item_name: e.target.value })} placeholder="Dell XPS 15 Laptop" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800" />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Description & Specifications</label>
                <textarea rows="2" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Enter detailed specs..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Category</label>
                  <select value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800">
                    {categories.map(c => <option key={c.id} value={c.id}>{c.category_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Brand</label>
                  <select value={formData.brand_id} onChange={e => setFormData({ ...formData, brand_id: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800">
                    {brands.map(b => <option key={b.id} value={b.id}>{b.brand_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Stock Unit (UOM)</label>
                  <select value={formData.uom_id} onChange={e => setFormData({ ...formData, uom_id: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800">
                    {uoms.map(u => <option key={u.id} value={u.id}>{u.unit_name} ({u.unit_symbol})</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Min Level</label>
                  <input type="number" value={formData.min_stock_level} onChange={e => setFormData({ ...formData, min_stock_level: Number(e.target.value) })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800" />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Reorder Level</label>
                  <input type="number" value={formData.reorder_level} onChange={e => setFormData({ ...formData, reorder_level: Number(e.target.value) })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800" />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Reorder Qty</label>
                  <input type="number" value={formData.reorder_qty} onChange={e => setFormData({ ...formData, reorder_qty: Number(e.target.value) })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800" />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Valuation Rate (₹)</label>
                  <input type="number" value={formData.valuation_rate} onChange={e => setFormData({ ...formData, valuation_rate: Number(e.target.value) })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800" />
                </div>
              </div>

              <div className="flex justify-end space-x-3 border-t border-slate-100 pt-4">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-purple-600 text-white font-bold rounded-xl shadow-xs">Save Item Master</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
