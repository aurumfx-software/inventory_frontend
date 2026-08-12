import React, { useState, useEffect } from 'react';
import { 
  Warehouse, 
  Layers, 
  MapPin, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Filter, 
  Boxes, 
  Package, 
  UserCheck, 
  Building2, 
  FileText,
  Tag
} from 'lucide-react';

export default function WarehouseMaster() {
  const [warehouses, setWarehouses] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [showLocationsModal, setShowLocationsModal] = useState(null);
  const [deleteConfirmWarehouse, setDeleteConfirmWarehouse] = useState(null);

  // New Bin Location form state inside hierarchy modal
  const [newBinForm, setNewBinForm] = useState({
    zone: 'Zone A',
    rack: 'Rack 01',
    shelf: 'Shelf 1',
    bin: 'Bin 01'
  });

  // Toast Notification state
  const [toast, setToast] = useState(null);

  const showToastNotification = (type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Validation Rules
  const [touched, setTouched] = useState({});

  const initialFormState = {
    code: '',
    name: '',
    warehouse_type: 'Central Warehouse',
    address: '',
    manager_name: 'Michael Chang',
    branch: 'Main Campus - Bangalore',
    active_status: true
  };

  const [formData, setFormData] = useState(initialFormState);

  // Fallback initial sample warehouses
  const sampleWarehousesFallback = [
    {
      id: 'wh-01',
      code: 'WH-MAIN-001',
      name: 'Central Goods Warehouse',
      warehouse_type: 'Central Warehouse',
      address: 'Plot 12, Industrial Hub, Zone 4, Bangalore',
      manager_name: 'Michael Chang',
      branch: 'Main Campus - Bangalore',
      active_status: true,
      locations: [
        { id: 'loc-01', warehouse_id: 'wh-01', zone: 'Zone A', rack: 'Rack 01', shelf: 'Shelf 2', bin: 'Bin 05', code: 'A-R01-S2-B05' },
        { id: 'loc-02', warehouse_id: 'wh-01', zone: 'Zone A', rack: 'Rack 02', shelf: 'Shelf 1', bin: 'Bin 12', code: 'A-R02-S1-B12' },
        { id: 'loc-03', warehouse_id: 'wh-01', zone: 'Zone B', rack: 'Rack 05', shelf: 'Shelf 4', bin: 'Bin 08', code: 'B-R05-S4-B08' }
      ]
    },
    {
      id: 'wh-02',
      code: 'WH-SUB-002',
      name: 'IT Assets & Electronics Store',
      warehouse_type: 'Electronics & IT Store',
      address: 'Building B, Floor 2, Main Campus',
      manager_name: 'Sarah Jenkins',
      branch: 'Main Campus - Bangalore',
      active_status: true,
      locations: [
        { id: 'loc-04', warehouse_id: 'wh-02', zone: 'Zone IT', rack: 'Rack IT-1', shelf: 'Shelf Top', bin: 'Bin SEC-1', code: 'IT-R1-ST-B1' },
        { id: 'loc-05', warehouse_id: 'wh-02', zone: 'Zone IT', rack: 'Rack IT-2', shelf: 'Shelf Mid', bin: 'Bin SEC-4', code: 'IT-R2-SM-B4' }
      ]
    },
    {
      id: 'wh-03',
      code: 'WH-TRN-003',
      name: 'Transit & Quarantine Store',
      warehouse_type: 'Transit & Quarantine',
      address: 'Receiving Bay 1, Logistics Dock',
      manager_name: 'Rajesh Kumar',
      branch: 'Peenya Industrial Facility',
      active_status: true,
      locations: [
        { id: 'loc-06', warehouse_id: 'wh-03', zone: 'Zone Q', rack: 'Rack Q-01', shelf: 'Shelf 1', bin: 'Bin HOLD-1', code: 'Q-R01-S1-H1' }
      ]
    },
    {
      id: 'wh-04',
      code: 'WH-RAW-004',
      name: 'Raw Materials & Metals Yard',
      warehouse_type: 'Raw Material Store',
      address: 'Yard 4, Heavy Metal Complex, Peenya',
      manager_name: 'Suresh Menon',
      branch: 'Peenya Industrial Facility',
      active_status: true,
      locations: [
        { id: 'loc-07', warehouse_id: 'wh-04', zone: 'Zone Steel', rack: 'Yard R-10', shelf: 'Row 1', bin: 'Slot 04', code: 'STL-R10-S1-04' }
      ]
    }
  ];

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      const res = await fetch('/api/warehouses');
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        setWarehouses(data.data);
      } else {
        setWarehouses(sampleWarehousesFallback);
      }
    } catch (err) {
      console.error(err);
      setWarehouses(sampleWarehousesFallback);
    }
  };

  // Validation Rules
  const getValidationErrors = () => {
    const errors = {};
    if (!formData.name || !formData.name.trim()) {
      errors.name = 'Warehouse Name is mandatory.';
    }
    if (formData.code && warehouses.some(w => w.code && w.code.toLowerCase() === formData.code.toLowerCase() && w.id !== editingWarehouse?.id)) {
      errors.code = `Warehouse Code "${formData.code}" already exists.`;
    }
    return errors;
  };

  const errors = getValidationErrors();

  const openCreateModal = () => {
    setEditingWarehouse(null);
    setFormData(initialFormState);
    setTouched({});
    setShowCreateModal(true);
  };

  const openEditModal = (wh) => {
    setEditingWarehouse(wh);
    setFormData({
      code: wh.code || '',
      name: wh.name || '',
      warehouse_type: wh.warehouse_type || 'Central Warehouse',
      address: wh.address || '',
      manager_name: wh.manager_name || 'Michael Chang',
      branch: wh.branch || 'Main Campus - Bangalore',
      active_status: wh.active_status !== false
    });
    setTouched({});
    setShowCreateModal(true);
  };

  const handleDeleteWarehouseConfirm = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!deleteConfirmWarehouse) return;
    const target = deleteConfirmWarehouse;

    setWarehouses(prev => prev.filter(w => w.id !== target.id && w.code !== target.code));
    setDeleteConfirmWarehouse(null);

    showToastNotification(
      'danger',
      'Warehouse Deleted',
      `Warehouse "${target.name}" (${target.code}) has been deleted.`
    );

    fetch(`/api/warehouses/${target.id}`, {
      method: 'DELETE'
    }).catch(err => console.error(err));
  };

  const handleSaveWarehouse = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    setTouched({
      name: true,
      code: true
    });

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      const payload = {
        code: formData.code || `WH-${Math.floor(100 + Math.random() * 900)}`,
        name: formData.name.trim(),
        warehouse_type: formData.warehouse_type,
        address: formData.address || 'Plot 12, Industrial Hub, Zone 4',
        manager_name: formData.manager_name,
        branch: formData.branch,
        active_status: formData.active_status
      };

      if (editingWarehouse) {
        const updated = warehouses.map(w => (w.id === editingWarehouse.id || w.code === editingWarehouse.code) ? { ...w, ...payload } : w);
        setWarehouses(updated);
        setShowCreateModal(false);
        setEditingWarehouse(null);

        showToastNotification(
          'info',
          'Warehouse Updated',
          `Warehouse "${payload.name}" (${payload.code}) specifications updated.`
        );

        fetch(`/api/warehouses/${editingWarehouse.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(() => null);
      } else {
        const newWh = {
          id: `wh-${Date.now()}`,
          ...payload,
          locations: [
            { id: `loc-${Date.now()}-1`, warehouse_id: `wh-${Date.now()}`, zone: 'Zone A', rack: 'Rack 01', shelf: 'Shelf 1', bin: 'Bin 01', code: 'A-R01-S1-B01' }
          ]
        };

        setWarehouses([newWh, ...warehouses]);
        setShowCreateModal(false);

        showToastNotification(
          'success',
          'Warehouse Registered',
          `Warehouse "${newWh.name}" (${newWh.code}) registered successfully.`
        );

        fetch('/api/warehouses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(() => null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add Bin Location inside Location Hierarchy Modal
  const handleAddBinLocation = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!showLocationsModal) return;

    const locCode = `${(newBinForm.zone || 'A').charAt(0).toUpperCase()}-${newBinForm.rack.replace(/\s+/g, '')}-${newBinForm.shelf.replace(/\s+/g, '')}-${newBinForm.bin.replace(/\s+/g, '')}`;

    const newLoc = {
      id: `loc-${Date.now()}`,
      warehouse_id: showLocationsModal.id,
      zone: newBinForm.zone,
      rack: newBinForm.rack,
      shelf: newBinForm.shelf,
      bin: newBinForm.bin,
      code: locCode
    };

    const updatedLocations = [...(showLocationsModal.locations || []), newLoc];
    const updatedWhList = warehouses.map(w => w.id === showLocationsModal.id ? { ...w, locations: updatedLocations } : w);

    setWarehouses(updatedWhList);
    setShowLocationsModal({ ...showLocationsModal, locations: updatedLocations });

    showToastNotification(
      'success',
      'Bin Location Added',
      `Configured Storage Bin "${locCode}" under ${showLocationsModal.name}.`
    );

    fetch(`/api/warehouses/${showLocationsModal.id}/locations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLoc)
    }).catch(() => null);
  };

  // Remove Bin Location
  const handleRemoveBinLocation = (locId) => {
    if (!showLocationsModal) return;
    const updatedLocations = (showLocationsModal.locations || []).filter(l => l.id !== locId);
    const updatedWhList = warehouses.map(w => w.id === showLocationsModal.id ? { ...w, locations: updatedLocations } : w);

    setWarehouses(updatedWhList);
    setShowLocationsModal({ ...showLocationsModal, locations: updatedLocations });

    showToastNotification(
      'warning',
      'Bin Location Removed',
      `Storage Bin removed from ${showLocationsModal.name}.`
    );

    fetch(`/api/warehouses/${showLocationsModal.id}/locations/${locId}`, {
      method: 'DELETE'
    }).catch(() => null);
  };

  const filteredWarehouses = warehouses.filter(w => {
    const matchesSearch = 
      (w.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (w.code || '').toLowerCase().includes(search.toLowerCase()) ||
      (w.address || '').toLowerCase().includes(search.toLowerCase()) ||
      (w.manager_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (w.branch || '').toLowerCase().includes(search.toLowerCase()) ||
      (w.warehouse_type || '').toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'All' || (statusFilter === 'Active' ? w.active_status !== false : w.active_status === false);
    const matchesType = typeFilter === 'All' || w.warehouse_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const totalBinsCount = warehouses.reduce((sum, w) => sum + (w.locations?.length || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 border border-slate-200/80 rounded-2xl shadow-xs gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 font-heading flex items-center space-x-2">
            <Layers className="w-5 h-5 text-purple-600" />
            <span>Warehouse & Location Master</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Defines where inventory is physically stored: Warehouse &rarr; Zone &rarr; Rack &rarr; Shelf &rarr; Bin location hierarchy & inventory balances.
          </p>
        </div>
        <button 
          type="button"
          onClick={openCreateModal}
          className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Warehouse</span>
        </button>
      </div>

      {/* Search, Filter & Summary Bar */}
      <div className="bg-white p-3.5 border border-slate-200/80 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto flex-1">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search warehouse code, name, address, manager, type..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500 focus:bg-white"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-medium text-slate-800"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive Only</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center space-x-1.5 text-xs">
            <select 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-medium text-slate-800"
            >
              <option value="All">All Warehouse Types</option>
              <option value="Central Warehouse">Central Warehouse</option>
              <option value="Electronics & IT Store">Electronics & IT Store</option>
              <option value="Transit & Quarantine">Transit & Quarantine</option>
              <option value="Raw Material Store">Raw Material Store</option>
            </select>
          </div>
        </div>

        {/* Counter */}
        <div className="text-xs text-slate-500 font-mono space-x-4">
          <span>Warehouses: <strong className="text-slate-900">{filteredWarehouses.length}</strong></span>
          <span>Storage Bins Configured: <strong className="text-purple-700">{totalBinsCount}</strong></span>
        </div>
      </div>

      {/* Warehouse Cards Grid */}
      <div className="space-y-4">
        {filteredWarehouses.map(wh => {
          const isActive = wh.active_status !== false;

          return (
            <div key={wh.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4 hover:border-purple-300 transition">
              
              {/* Header Info */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {wh.code}
                    </span>
                    <span className="font-mono text-[10px] text-purple-700 font-bold bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                      {wh.warehouse_type}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900 pt-0.5">{wh.name}</h3>
                  <p className="text-xs text-slate-500 flex items-center">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 mr-1 shrink-0" />
                    <span>{wh.address}</span>
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  {isActive ? (
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full">Operational</span>
                  ) : (
                    <span className="bg-slate-100 text-slate-600 border border-slate-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full">Inactive</span>
                  )}
                </div>
              </div>

              {/* Details & Storage Hierarchy Level */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Manager & Facility Branch</span>
                  <p className="font-bold text-slate-800">{wh.manager_name || 'Michael Chang'}</p>
                  <p className="text-slate-600 text-[11px]">{wh.branch || 'Main Campus'}</p>
                </div>

                <div className="md:col-span-2 bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center">
                      <Layers className="w-3 h-3 mr-1 text-purple-600" /> Location Storage Hierarchy (Warehouse &rarr; Zone &rarr; Rack &rarr; Shelf &rarr; Bin)
                    </span>
                    <span className="text-[10px] font-mono text-purple-700 font-bold">{(wh.locations || []).length} Bins Configured</span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-0.5">
                    {(wh.locations || []).map(loc => (
                      <div key={loc.id} className="bg-white border border-slate-200 px-3 py-1 rounded-xl text-xs font-mono text-purple-700 font-bold flex items-center space-x-2 shadow-2xs">
                        <span className="text-[10px] text-slate-400 uppercase font-sans font-bold">{loc.zone} &bull;</span>
                        <span>{loc.code}</span>
                      </div>
                    ))}
                    {(wh.locations || []).length === 0 && (
                      <span className="text-slate-400 italic text-[11px]">No storage bins configured yet.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button 
                    type="button" 
                    onClick={() => setShowLocationsModal(wh)}
                    className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition"
                  >
                    <Layers className="w-3.5 h-3.5 text-purple-600" />
                    <span>Manage Storage Hierarchy & Bins</span>
                  </button>
                </div>

                <div className="flex items-center space-x-1">
                  <button 
                    type="button" 
                    onClick={() => openEditModal(wh)}
                    className="p-1.5 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 rounded-lg text-slate-600 transition"
                    title="Edit Warehouse Specs"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setDeleteConfirmWarehouse(wh)}
                    className="p-1.5 bg-slate-50 hover:bg-rose-50 hover:text-rose-700 border border-slate-200 rounded-lg text-slate-600 transition"
                    title="Delete Warehouse"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* REGISTER / EDIT WAREHOUSE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 sm:p-6 overflow-y-auto">
          <form 
            onSubmit={handleSaveWarehouse} 
            className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl my-auto shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md">
                  <Warehouse className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 font-heading">
                    {editingWarehouse ? 'Edit Warehouse Specifications' : 'Register New Storage Warehouse'}
                  </h3>
                  <p className="text-xs text-slate-500">Configure warehouse codes, physical addresses, managers & operational status</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => { setShowCreateModal(false); setEditingWarehouse(null); }}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-200/50 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Warehouse Code <span className="text-slate-400 font-normal">(Leave blank for auto-gen)</span></label>
                  <input 
                    type="text" 
                    value={formData.code} 
                    onBlur={() => setTouched({ ...touched, code: true })}
                    onChange={e => setFormData({ ...formData, code: e.target.value })} 
                    placeholder="WH-MAIN-001" 
                    className={`w-full bg-slate-50 border ${touched.code && errors.code ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'} rounded-xl px-3 py-2 text-slate-800 font-mono focus:bg-white focus:outline-none focus:border-purple-500`} 
                  />
                  {touched.code && errors.code && (
                    <p className="text-[10px] text-rose-600 mt-1 font-semibold">{errors.code}</p>
                  )}
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Warehouse Type</label>
                  <select 
                    value={formData.warehouse_type} 
                    onChange={e => setFormData({ ...formData, warehouse_type: e.target.value })} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Central Warehouse">Central Warehouse</option>
                    <option value="Electronics & IT Store">Electronics & IT Store</option>
                    <option value="Transit & Quarantine">Transit & Quarantine</option>
                    <option value="Raw Material Store">Raw Material Store</option>
                    <option value="Finished Goods Store">Finished Goods Store</option>
                    <option value="Cold Storage Facility">Cold Storage Facility</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Warehouse Name <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onBlur={() => setTouched({ ...touched, name: true })}
                  onChange={e => setFormData({ ...formData, name: e.target.value })} 
                  placeholder="Central Goods Warehouse" 
                  className={`w-full bg-slate-50 border ${touched.name && errors.name ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'} rounded-xl px-3 py-2 text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-purple-500`} 
                />
                {touched.name && errors.name && (
                  <p className="text-[11px] text-rose-600 mt-1 font-semibold flex items-center"><AlertTriangle className="w-3 h-3 mr-1" />{errors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Warehouse Manager</label>
                  <input 
                    type="text" 
                    value={formData.manager_name} 
                    onChange={e => setFormData({ ...formData, manager_name: e.target.value })} 
                    placeholder="Michael Chang" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-purple-500" 
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Operating Branch Location</label>
                  <input 
                    type="text" 
                    value={formData.branch} 
                    onChange={e => setFormData({ ...formData, branch: e.target.value })} 
                    placeholder="Main Campus - Bangalore" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-purple-500" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Physical Address</label>
                <textarea 
                  rows="2" 
                  value={formData.address} 
                  onChange={e => setFormData({ ...formData, address: e.target.value })} 
                  placeholder="Plot 12, Industrial Hub, Zone 4, Bangalore" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-purple-500" 
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Operational Status</label>
                <select 
                  value={formData.active_status ? 'Active' : 'Inactive'} 
                  onChange={e => setFormData({ ...formData, active_status: e.target.value === 'Active' })} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-purple-500"
                >
                  <option value="Active">Operational (Active)</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <div className="text-[11px] text-slate-500 font-medium">
                {Object.keys(errors).length > 0 && Object.keys(touched).length > 0 ? (
                  <span className="text-rose-600 font-bold flex items-center">
                    <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Fix validation errors before saving.
                  </span>
                ) : (
                  <span className="text-emerald-700 font-semibold flex items-center">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Warehouse specifications configured.
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <button 
                  type="button" 
                  onClick={() => { setShowCreateModal(false); setEditingWarehouse(null); }} 
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  {editingWarehouse ? 'Update Warehouse' : 'Save Warehouse'}
                </button>
              </div>
            </div>

          </form>
        </div>
      )}

      {/* LOCATION STORAGE HIERARCHY MODAL (Warehouse -> Zone -> Rack -> Shelf -> Bin) */}
      {showLocationsModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl my-auto shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Storage Location Hierarchy</h3>
                  <p className="text-xs font-mono text-purple-700 font-bold">{showLocationsModal.name} ({showLocationsModal.code})</p>
                </div>
              </div>
              <button type="button" onClick={() => setShowLocationsModal(null)} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              
              {/* Hierarchy Tree Explanation */}
              <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-xl text-purple-900 text-[11px] font-mono">
                <strong className="font-bold block font-sans">Storage Level Mapping:</strong>
                <p>Warehouse ({showLocationsModal.code}) &rarr; Zone &rarr; Rack &rarr; Shelf &rarr; Bin Location Code</p>
              </div>

              {/* Add New Bin Location Form */}
              <form onSubmit={handleAddBinLocation} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                <h4 className="font-bold text-xs uppercase text-slate-800 flex items-center">
                  <Plus className="w-3.5 h-3.5 mr-1 text-purple-600" /> Add New Storage Bin Location:
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-600 text-[10px] font-bold mb-1">Zone</label>
                    <input type="text" value={newBinForm.zone} onChange={e => setNewBinForm({ ...newBinForm, zone: e.target.value })} placeholder="Zone A" className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800" />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-[10px] font-bold mb-1">Rack</label>
                    <input type="text" value={newBinForm.rack} onChange={e => setNewBinForm({ ...newBinForm, rack: e.target.value })} placeholder="Rack 01" className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800" />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-[10px] font-bold mb-1">Shelf</label>
                    <input type="text" value={newBinForm.shelf} onChange={e => setNewBinForm({ ...newBinForm, shelf: e.target.value })} placeholder="Shelf 1" className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800" />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-[10px] font-bold mb-1">Bin Code</label>
                    <input type="text" value={newBinForm.bin} onChange={e => setNewBinForm({ ...newBinForm, bin: e.target.value })} placeholder="Bin 01" className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800" />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button type="submit" className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg shadow-xs">
                    + Add Storage Bin
                  </button>
                </div>
              </form>

              {/* Current Configured Bins Table */}
              <div>
                <h4 className="font-bold text-xs text-slate-800 mb-2">Configured Bin Locations ({showLocationsModal.locations?.length || 0}):</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 font-bold uppercase text-[10px] text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Bin Code</th>
                        <th className="p-2.5">Zone</th>
                        <th className="p-2.5">Rack</th>
                        <th className="p-2.5">Shelf</th>
                        <th className="p-2.5">Bin</th>
                        <th className="p-2.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(showLocationsModal.locations || []).map(loc => (
                        <tr key={loc.id} className="hover:bg-slate-50 font-mono text-xs">
                          <td className="p-2.5 font-bold text-purple-700">{loc.code}</td>
                          <td className="p-2.5 font-sans font-medium">{loc.zone}</td>
                          <td className="p-2.5">{loc.rack}</td>
                          <td className="p-2.5">{loc.shelf}</td>
                          <td className="p-2.5">{loc.bin}</td>
                          <td className="p-2.5 text-right">
                            <button type="button" onClick={() => handleRemoveBinLocation(loc.id)} className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button type="button" onClick={() => setShowLocationsModal(null)} className="px-4 py-2 bg-slate-200 text-slate-800 font-bold text-xs rounded-xl">Close Locations</button>
            </div>
          </div>
        </div>
      )}



      {/* DELETE CONFIRMATION DIALOG */}
      {deleteConfirmWarehouse && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center font-bold shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Confirm Delete Warehouse</h3>
                <p className="text-xs font-mono text-purple-700 font-bold">{deleteConfirmWarehouse.code}</p>
              </div>
            </div>

            <div className="p-3.5 bg-rose-50/80 border border-rose-200 rounded-xl text-xs text-rose-900 space-y-1">
              <p className="font-bold">Permanent Deletion Notice:</p>
              <p>Are you sure you want to delete <strong>{deleteConfirmWarehouse.name}</strong>?</p>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button type="button" onClick={() => setDeleteConfirmWarehouse(null)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">Cancel</button>
              <button type="button" onClick={handleDeleteWarehouseConfirm} className="px-5 py-2 bg-rose-600 text-white font-bold text-xs rounded-xl">Delete Warehouse</button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className={`flex items-start space-x-3 p-4 rounded-2xl border shadow-2xl max-w-md w-full backdrop-blur-md transition ${
            toast.type === 'success' 
              ? 'bg-slate-900 text-emerald-300 border-emerald-500/60 shadow-emerald-950/40' 
              : toast.type === 'info'
              ? 'bg-slate-900 text-purple-300 border-purple-500/60 shadow-purple-950/40'
              : toast.type === 'warning'
              ? 'bg-slate-900 text-amber-300 border-amber-500/60 shadow-amber-950/40'
              : 'bg-slate-900 text-rose-300 border-rose-500/60 shadow-rose-950/40'
          }`}>
            <div className={`p-2 rounded-xl shrink-0 ${
              toast.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
              toast.type === 'info' ? 'bg-purple-500/20 text-purple-400' :
              toast.type === 'warning' ? 'bg-amber-500/20 text-amber-400' :
              'bg-rose-500/20 text-rose-400'
            }`}>
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
              {toast.type === 'info' && <CheckCircle2 className="w-5 h-5" />}
              {toast.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
              {toast.type === 'danger' && <Trash2 className="w-5 h-5" />}
            </div>

            <div className="flex-1 min-w-0 pr-2">
              <h4 className="font-bold text-xs uppercase tracking-wider font-heading">{toast.title}</h4>
              <p className="text-xs mt-0.5 opacity-90 leading-snug font-medium text-slate-200">{toast.message}</p>
            </div>

            <button type="button" onClick={() => setToast(null)} className="text-slate-400 hover:text-white transition p-1"><X className="w-4 h-4" /></button>
          </div>
        </div>
      )}

    </div>
  );
}
