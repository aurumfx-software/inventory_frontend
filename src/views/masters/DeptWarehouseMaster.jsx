import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Warehouse, 
  MapPin, 
  Layers, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Filter, 
  ShieldCheck, 
  Ban,
  Activity
} from 'lucide-react';

export default function DeptWarehouseMaster({ initialSubTab = 'dept' }) {
  const [activeSubTab, setActiveSubTab] = useState(initialSubTab);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Toast Notification state
  const [toast, setToast] = useState(null);

  const showToastNotification = (type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // ==================== 1. DEPARTMENT MASTER STATE ====================
  const [departments, setDepartments] = useState([]);
  const [searchDept, setSearchDept] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [ruleFilter, setRuleFilter] = useState('All');

  const [showCreateDeptModal, setShowCreateDeptModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [showViewDeptModal, setShowViewDeptModal] = useState(null);
  const [deleteConfirmDept, setDeleteConfirmDept] = useState(null);

  const [touchedDept, setTouchedDept] = useState({});

  const initialDeptFormState = {
    code: '',
    name: '',
    head_name: 'Dr. Ananya Roy',
    cost_centre: '',
    default_approver: 'Sarah Jenkins',
    branch: 'Main Campus - Bangalore',
    budget_monthly: 200000,
    budget_quarterly: 600000,
    budget_annual: 2400000,
    category_budget_it: 1200000,
    category_budget_ele: 500000,
    category_budget_off: 400000,
    category_budget_raw: 300000,
    budget_control_rule: 'Warn',
    active_status: true
  };

  const [deptForm, setDeptForm] = useState(initialDeptFormState);

  const sampleDepartmentsFallback = [
    {
      id: 'dept-01',
      code: 'DEPT-IT-001',
      name: 'Information Technology',
      head_name: 'Dr. Ananya Roy',
      cost_centre: 'IT-001',
      default_approver: 'Sarah Jenkins',
      branch: 'Main Campus - Bangalore',
      budget_monthly: 250000,
      budget_quarterly: 750000,
      budget_annual: 3000000,
      category_budgets: { 'cat-01': 1800000, 'cat-02': 600000, 'cat-03': 400000, 'cat-04': 200000 },
      budget_control_rule: 'Warn',
      active_status: true,
      ytd_consumption: 1850000,
      recent_issues_count: 32
    },
    {
      id: 'dept-02',
      code: 'DEPT-MNT-002',
      name: 'Plant Maintenance & Engineering',
      head_name: 'Vikram Malhotra',
      cost_centre: 'MAINT-002',
      default_approver: 'David Miller',
      branch: 'Peenya Industrial Facility',
      budget_monthly: 180000,
      budget_quarterly: 540000,
      budget_annual: 2200000,
      category_budgets: { 'cat-01': 200000, 'cat-02': 1200000, 'cat-03': 200000, 'cat-04': 600000 },
      budget_control_rule: 'Block',
      active_status: true,
      ytd_consumption: 1680000,
      recent_issues_count: 28
    },
    {
      id: 'dept-03',
      code: 'DEPT-PROD-003',
      name: 'Production & Manufacturing',
      head_name: 'Suresh Menon',
      cost_centre: 'PROD-003',
      default_approver: 'Alex Rivera',
      branch: 'Peenya Industrial Facility',
      budget_monthly: 400000,
      budget_quarterly: 1200000,
      budget_annual: 5000000,
      category_budgets: { 'cat-01': 500000, 'cat-02': 1000000, 'cat-03': 300000, 'cat-04': 3200000 },
      budget_control_rule: 'Override Approval',
      active_status: true,
      ytd_consumption: 4100000,
      recent_issues_count: 45
    }
  ];

  // ==================== 2. WAREHOUSE MASTER STATE ====================
  const [warehouses, setWarehouses] = useState([]);
  const [searchWh, setSearchWh] = useState('');
  const [showCreateWhModal, setShowCreateWhModal] = useState(false);
  const [editingWh, setEditingWh] = useState(null);
  const [deleteConfirmWh, setDeleteConfirmWh] = useState(null);

  const initialWhFormState = {
    code: '',
    name: '',
    address: '',
    manager_name: 'Michael Chang',
    capacity_sqft: 5000,
    active_status: true
  };
  const [whForm, setWhForm] = useState(initialWhFormState);

  const sampleWarehousesFallback = [
    {
      id: 'wh-01',
      code: 'WH-MAIN',
      name: 'Central Goods Warehouse',
      address: 'Plot 12, Industrial Hub, Peenya Phase 1, Bangalore',
      manager_name: 'Michael Chang',
      capacity_sqft: 12000,
      active_status: true,
      total_bins: 48,
      occupied_bins: 36
    },
    {
      id: 'wh-02',
      code: 'WH-SUB1',
      name: 'IT Assets & Electronics Store',
      address: 'Building B, Floor 2, Main Campus',
      manager_name: 'Sarah Jenkins',
      capacity_sqft: 3500,
      active_status: true,
      total_bins: 24,
      occupied_bins: 18
    },
    {
      id: 'wh-03',
      code: 'WH-TRANS',
      name: 'Transit & Quarantine Store',
      address: 'Gate 3 Receiving Bay, Industrial Plant',
      manager_name: 'Michael Chang',
      capacity_sqft: 1500,
      active_status: true,
      total_bins: 12,
      occupied_bins: 5
    }
  ];

  // ==================== 3. WAREHOUSE LOCATIONS STATE ====================
  const [locations, setLocations] = useState([]);
  const [searchLoc, setSearchLoc] = useState('');
  const [selectedWhFilter, setSelectedWhFilter] = useState('All');

  const [showCreateLocModal, setShowCreateLocModal] = useState(false);
  const [editingLoc, setEditingLoc] = useState(null);
  const [deleteConfirmLoc, setDeleteConfirmLoc] = useState(null);

  const initialLocFormState = {
    warehouse_id: 'wh-01',
    zone: 'Zone A',
    rack: 'Rack 01',
    shelf: 'Shelf 1',
    bin: 'Bin 01',
    code: ''
  };
  const [locForm, setLocForm] = useState(initialLocFormState);

  const sampleLocationsFallback = [
    {
      id: 'loc-01',
      warehouse_id: 'wh-01',
      warehouse_name: 'Central Goods Warehouse',
      zone: 'Zone A',
      rack: 'Rack 01',
      shelf: 'Shelf 2',
      bin: 'Bin 05',
      code: 'A-R01-S2-B05',
      active_status: true,
      item_count: 14
    },
    {
      id: 'loc-02',
      warehouse_id: 'wh-01',
      warehouse_name: 'Central Goods Warehouse',
      zone: 'Zone A',
      rack: 'Rack 02',
      shelf: 'Shelf 1',
      bin: 'Bin 12',
      code: 'A-R02-S1-B12',
      active_status: true,
      item_count: 8
    },
    {
      id: 'loc-03',
      warehouse_id: 'wh-02',
      warehouse_name: 'IT Assets & Electronics Store',
      zone: 'Zone IT',
      rack: 'Rack IT-1',
      shelf: 'Shelf Top',
      bin: 'Bin SEC-1',
      code: 'IT-R1-ST-B1',
      active_status: true,
      item_count: 22
    },
    {
      id: 'loc-04',
      warehouse_id: 'wh-03',
      warehouse_name: 'Transit & Quarantine Store',
      zone: 'Quarantine',
      rack: 'Bay 1',
      shelf: 'Floor',
      bin: 'Bin Q-1',
      code: 'TR-BAY1-S1',
      active_status: true,
      item_count: 3
    }
  ];

  // ==================== FETCH DATA ON MOUNT ====================
  useEffect(() => {
    fetchDepartments();
    fetchWarehouses();
    fetchLocations();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await fetch('/api/departments');
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        setDepartments(data.data);
      } else {
        setDepartments(sampleDepartmentsFallback);
      }
    } catch {
      setDepartments(sampleDepartmentsFallback);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const res = await fetch('/api/warehouses');
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        setWarehouses(data.data);
      } else {
        setWarehouses(sampleWarehousesFallback);
      }
    } catch {
      setWarehouses(sampleWarehousesFallback);
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await fetch('/api/warehouse-locations');
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        setLocations(data.data);
      } else {
        setLocations(sampleLocationsFallback);
      }
    } catch {
      setLocations(sampleLocationsFallback);
    }
  };

  // ==================== DEPARTMENT HANDLERS ====================
  const openCreateDeptModal = () => {
    setEditingDept(null);
    setDeptForm(initialDeptFormState);
    setTouchedDept({});
    setShowCreateDeptModal(true);
  };

  const openEditDeptModal = (dept) => {
    setEditingDept(dept);
    setDeptForm({
      code: dept.code || '',
      name: dept.name || '',
      head_name: dept.head_name || 'Dr. Ananya Roy',
      cost_centre: dept.cost_centre || '',
      default_approver: dept.default_approver || 'Sarah Jenkins',
      branch: dept.branch || 'Main Campus - Bangalore',
      budget_monthly: dept.budget_monthly || 200000,
      budget_quarterly: dept.budget_quarterly || 600000,
      budget_annual: dept.budget_annual || 2400000,
      category_budget_it: dept.category_budgets?.['cat-01'] || 1200000,
      category_budget_ele: dept.category_budgets?.['cat-02'] || 500000,
      category_budget_off: dept.category_budgets?.['cat-03'] || 400000,
      category_budget_raw: dept.category_budgets?.['cat-04'] || 300000,
      budget_control_rule: dept.budget_control_rule || 'Warn',
      active_status: dept.active_status !== false
    });
    setTouchedDept({});
    setShowCreateDeptModal(true);
  };

  const handleSaveDept = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!deptForm.name.trim()) return;

    const payload = {
      code: deptForm.code || `DEPT-${Math.floor(100 + Math.random() * 900)}`,
      name: deptForm.name.trim(),
      head_name: deptForm.head_name,
      cost_centre: deptForm.cost_centre || `CC-${Math.floor(100 + Math.random() * 900)}`,
      default_approver: deptForm.default_approver,
      branch: deptForm.branch,
      budget_monthly: Number(deptForm.budget_monthly),
      budget_quarterly: Number(deptForm.budget_quarterly),
      budget_annual: Number(deptForm.budget_annual),
      category_budgets: {
        'cat-01': Number(deptForm.category_budget_it),
        'cat-02': Number(deptForm.category_budget_ele),
        'cat-03': Number(deptForm.category_budget_off),
        'cat-04': Number(deptForm.category_budget_raw)
      },
      budget_control_rule: deptForm.budget_control_rule,
      active_status: deptForm.active_status
    };

    if (editingDept) {
      setDepartments(prev => prev.map(d => (d.id === editingDept.id ? { ...d, ...payload } : d)));
      showToastNotification('info', 'Department Updated', `Department "${payload.name}" updated.`);
    } else {
      const newDept = { id: `dept-${Date.now()}`, ...payload, ytd_consumption: 0, recent_issues_count: 0 };
      setDepartments(prev => [newDept, ...prev]);
      showToastNotification('success', 'Department Registered', `Department "${payload.name}" registered.`);
    }
    setShowCreateDeptModal(false);
  };

  const handleDeleteDeptConfirm = () => {
    if (!deleteConfirmDept) return;
    setDepartments(prev => prev.filter(d => d.id !== deleteConfirmDept.id));
    showToastNotification('danger', 'Department Deleted', `Department "${deleteConfirmDept.name}" deleted.`);
    setDeleteConfirmDept(null);
  };

  // ==================== WAREHOUSE HANDLERS ====================
  const openCreateWhModal = () => {
    setEditingWh(null);
    setWhForm(initialWhFormState);
    setShowCreateWhModal(true);
  };

  const openEditWhModal = (wh) => {
    setEditingWh(wh);
    setWhForm({
      code: wh.code || '',
      name: wh.name || '',
      address: wh.address || '',
      manager_name: wh.manager_name || 'Michael Chang',
      capacity_sqft: wh.capacity_sqft || 5000,
      active_status: wh.active_status !== false
    });
    setShowCreateWhModal(true);
  };

  const handleSaveWh = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!whForm.name.trim()) return;

    const payload = {
      code: whForm.code || `WH-${Math.floor(100 + Math.random() * 900)}`,
      name: whForm.name.trim(),
      address: whForm.address,
      manager_name: whForm.manager_name,
      capacity_sqft: Number(whForm.capacity_sqft),
      active_status: whForm.active_status
    };

    if (editingWh) {
      setWarehouses(prev => prev.map(w => (w.id === editingWh.id ? { ...w, ...payload } : w)));
      showToastNotification('info', 'Warehouse Updated', `Warehouse "${payload.name}" updated.`);
    } else {
      const newWh = { id: `wh-${Date.now()}`, ...payload, total_bins: 10, occupied_bins: 2 };
      setWarehouses(prev => [newWh, ...prev]);
      showToastNotification('success', 'Warehouse Created', `Warehouse "${payload.name}" created successfully.`);
    }
    setShowCreateWhModal(false);
  };

  const handleDeleteWhConfirm = () => {
    if (!deleteConfirmWh) return;
    setWarehouses(prev => prev.filter(w => w.id !== deleteConfirmWh.id));
    showToastNotification('danger', 'Warehouse Deleted', `Warehouse "${deleteConfirmWh.name}" deleted.`);
    setDeleteConfirmWh(null);
  };

  // ==================== LOCATION HANDLERS ====================
  const openCreateLocModal = () => {
    setEditingLoc(null);
    setLocForm(initialLocFormState);
    setShowCreateLocModal(true);
  };

  const openEditLocModal = (loc) => {
    setEditingLoc(loc);
    setLocForm({
      warehouse_id: loc.warehouse_id || 'wh-01',
      zone: loc.zone || 'Zone A',
      rack: loc.rack || 'Rack 01',
      shelf: loc.shelf || 'Shelf 1',
      bin: loc.bin || 'Bin 01',
      code: loc.code || ''
    });
    setShowCreateLocModal(true);
  };

  const handleSaveLoc = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const targetWh = warehouses.find(w => w.id === locForm.warehouse_id) || warehouses[0];
    const generatedCode = locForm.code || `${locForm.zone.replace(/\s+/g, '')}-${locForm.rack.replace(/\s+/g, '')}-${locForm.shelf.replace(/\s+/g, '')}-${locForm.bin.replace(/\s+/g, '')}`;

    const payload = {
      warehouse_id: locForm.warehouse_id,
      warehouse_name: targetWh?.name || 'Central Warehouse',
      zone: locForm.zone,
      rack: locForm.rack,
      shelf: locForm.shelf,
      bin: locForm.bin,
      code: generatedCode,
      active_status: true
    };

    if (editingLoc) {
      setLocations(prev => prev.map(l => (l.id === editingLoc.id ? { ...l, ...payload } : l)));
      showToastNotification('info', 'Location Updated', `Location "${payload.code}" updated.`);
    } else {
      const newLoc = { id: `loc-${Date.now()}`, ...payload, item_count: 0 };
      setLocations(prev => [newLoc, ...prev]);
      showToastNotification('success', 'Location Created', `Location "${payload.code}" registered.`);
    }
    setShowCreateLocModal(false);
  };

  const handleDeleteLocConfirm = () => {
    if (!deleteConfirmLoc) return;
    setLocations(prev => prev.filter(l => l.id !== deleteConfirmLoc.id));
    showToastNotification('danger', 'Location Deleted', `Location "${deleteConfirmLoc.code}" removed.`);
    setDeleteConfirmLoc(null);
  };

  // ==================== FILTERED DATA ====================
  const filteredDepartments = departments.filter(d => {
    const matchesSearch = (d.name || '').toLowerCase().includes(searchDept.toLowerCase()) ||
                          (d.code || '').toLowerCase().includes(searchDept.toLowerCase()) ||
                          (d.cost_centre || '').toLowerCase().includes(searchDept.toLowerCase());
    const matchesStatus = statusFilter === 'All' || (statusFilter === 'Active' ? d.active_status !== false : d.active_status === false);
    const matchesRule = ruleFilter === 'All' || (d.budget_control_rule || 'Warn') === ruleFilter;
    return matchesSearch && matchesStatus && matchesRule;
  });

  const filteredWarehouses = warehouses.filter(w => {
    return (w.name || '').toLowerCase().includes(searchWh.toLowerCase()) ||
           (w.code || '').toLowerCase().includes(searchWh.toLowerCase()) ||
           (w.address || '').toLowerCase().includes(searchWh.toLowerCase());
  });

  const filteredLocations = locations.filter(l => {
    const matchesWh = selectedWhFilter === 'All' || l.warehouse_id === selectedWhFilter;
    const matchesSearch = (l.code || '').toLowerCase().includes(searchLoc.toLowerCase()) ||
                          (l.zone || '').toLowerCase().includes(searchLoc.toLowerCase()) ||
                          (l.rack || '').toLowerCase().includes(searchLoc.toLowerCase()) ||
                          (l.bin || '').toLowerCase().includes(searchLoc.toLowerCase());
    return matchesWh && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 p-4 rounded-2xl border shadow-xl flex items-center space-x-3 text-xs font-bold ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
          toast.type === 'danger' ? 'bg-rose-50 border-rose-200 text-rose-800' :
          'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-bold">{toast.title}</p>
            <p className="font-normal text-[11px] opacity-90">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Main Module Header & Sub-Tab Navigation Bar */}
      <div className="bg-white p-5 border border-slate-200/80 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-heading flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-purple-600" />
              <span>Department, Warehouse & Location Directory</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage organization departments, cost centres, central warehouses & storage bins.
            </p>
          </div>

          {activeSubTab === 'dept' && (
            <button 
              type="button" 
              onClick={openCreateDeptModal}
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Register Department</span>
            </button>
          )}

          {(activeSubTab === 'wh' || activeSubTab === 'wh-locations' || activeSubTab === 'loc') && (
            <div className="flex items-center space-x-2">
              <button 
                type="button" 
                onClick={openCreateWhModal}
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Warehouse</span>
              </button>
              <button 
                type="button" 
                onClick={openCreateLocModal}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Storage Bin</span>
              </button>
            </div>
          )}
        </div>

        {/* SubTab Navigation */}
        <div className="flex border-b border-slate-200 space-x-6 text-xs font-bold pt-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('dept')}
            className={`pb-3 flex items-center space-x-2 border-b-2 transition cursor-pointer ${
              activeSubTab === 'dept'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Departments & Cost Centres ({departments.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('wh')}
            className={`pb-3 flex items-center space-x-2 border-b-2 transition cursor-pointer ${
              activeSubTab === 'wh'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Warehouse className="w-4 h-4" />
            <span>Warehouses ({warehouses.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('loc')}
            className={`pb-3 flex items-center space-x-2 border-b-2 transition cursor-pointer ${
              activeSubTab === 'loc' || activeSubTab === 'wh-locations'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Warehouse Locations & Bins ({locations.length})</span>
          </button>
        </div>
      </div>

      {/* ==================== TAB 1: DEPARTMENT MASTER ==================== */}
      {activeSubTab === 'dept' && (
        <div className="space-y-5">
          {/* Search Bar */}
          <div className="bg-white p-3.5 border border-slate-200/80 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto flex-1">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  value={searchDept}
                  onChange={(e) => setSearchDept(e.target.value)}
                  placeholder="Search dept name, code, cost centre..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500 focus:bg-white"
                />
              </div>

              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-800"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active Only</option>
                <option value="Inactive">Inactive Only</option>
              </select>
            </div>
          </div>

          {/* Department Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDepartments.map(dept => (
              <div key={dept.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4 hover:border-purple-300 transition flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono text-[10px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                        {dept.code}
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 leading-snug pt-1">{dept.name}</h3>
                    </div>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      CC: {dept.cost_centre}
                    </span>
                  </div>

                  <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <p className="flex justify-between"><span className="text-slate-400">Head:</span><strong>{dept.head_name || 'Dr. Ananya Roy'}</strong></p>
                    <p className="flex justify-between"><span className="text-slate-400">Approver:</span><strong>{dept.default_approver || 'Sarah Jenkins'}</strong></p>
                    <p className="flex justify-between"><span className="text-slate-400">Annual Budget:</span><strong className="text-purple-700 font-mono">₹{(dept.budget_annual || 2400000).toLocaleString()}</strong></p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-1">
                  <button type="button" onClick={() => openEditDeptModal(dept)} className="p-1.5 bg-slate-50 hover:bg-blue-50 text-slate-600 rounded-lg cursor-pointer"><Edit className="w-3.5 h-3.5" /></button>
                  <button type="button" onClick={() => setDeleteConfirmDept(dept)} className="p-1.5 bg-slate-50 hover:bg-rose-50 text-slate-600 rounded-lg cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== TAB 2: WAREHOUSES MASTER ==================== */}
      {activeSubTab === 'wh' && (
        <div className="space-y-5">
          {/* Search Bar */}
          <div className="bg-white p-3.5 border border-slate-200/80 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                value={searchWh}
                onChange={(e) => setSearchWh(e.target.value)}
                placeholder="Search warehouse name, code, address..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500 focus:bg-white"
              />
            </div>

            <div className="text-xs text-slate-500 font-mono">
              Total Warehouses: <strong className="text-purple-700">{filteredWarehouses.length}</strong>
            </div>
          </div>

          {/* Warehouses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredWarehouses.map(wh => (
              <div key={wh.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4 hover:border-purple-300 transition flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-xs text-purple-700 font-bold bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                      {wh.code}
                    </span>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      ● Active Store
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 leading-snug mt-2">{wh.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{wh.address}</p>

                  <div className="mt-4 bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                    <p className="flex justify-between"><span className="text-slate-400">Store Manager:</span><strong className="text-slate-800">{wh.manager_name}</strong></p>
                    <p className="flex justify-between"><span className="text-slate-400">Total Storage Bins:</span><strong className="text-purple-700 font-mono">{wh.total_bins || 24} Bins</strong></p>
                    <p className="flex justify-between"><span className="text-slate-400">Capacity:</span><strong className="text-slate-800 font-mono">{(wh.capacity_sqft || 5000).toLocaleString()} sq ft</strong></p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                  <button type="button" onClick={() => openEditWhModal(wh)} className="p-1.5 bg-slate-50 hover:bg-blue-50 text-slate-600 rounded-lg cursor-pointer"><Edit className="w-3.5 h-3.5" /></button>
                  <button type="button" onClick={() => setDeleteConfirmWh(wh)} className="p-1.5 bg-slate-50 hover:bg-rose-50 text-slate-600 rounded-lg cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== TAB 3: WAREHOUSE LOCATIONS & BINS ==================== */}
      {(activeSubTab === 'loc' || activeSubTab === 'wh-locations') && (
        <div className="space-y-5">
          {/* Search & Warehouse Filter */}
          <div className="bg-white p-3.5 border border-slate-200/80 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto flex-1">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  value={searchLoc}
                  onChange={(e) => setSearchLoc(e.target.value)}
                  placeholder="Search code, zone, rack, bin..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <Filter className="w-4 h-4 text-slate-400" />
                <select 
                  value={selectedWhFilter} 
                  onChange={(e) => setSelectedWhFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-medium text-slate-800"
                >
                  <option value="All">All Warehouses</option>
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-xs text-slate-500 font-mono">
              Bins Found: <strong className="text-emerald-700">{filteredLocations.length}</strong>
            </div>
          </div>

          {/* Locations Table */}
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="p-3.5 pl-5">Location Code</th>
                  <th className="p-3.5">Warehouse</th>
                  <th className="p-3.5">Zone</th>
                  <th className="p-3.5">Rack</th>
                  <th className="p-3.5">Shelf</th>
                  <th className="p-3.5">Bin</th>
                  <th className="p-3.5 text-right pr-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredLocations.map(loc => (
                  <tr key={loc.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3.5 pl-5 font-mono font-bold text-purple-700">
                      <span className="bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-lg">
                        {loc.code}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-900 font-bold">{loc.warehouse_name || 'Central Goods Warehouse'}</td>
                    <td className="p-3.5">{loc.zone}</td>
                    <td className="p-3.5">{loc.rack}</td>
                    <td className="p-3.5">{loc.shelf}</td>
                    <td className="p-3.5 font-bold text-slate-800">{loc.bin}</td>
                    <td className="p-3.5 pr-5 text-right space-x-1">
                      <button type="button" onClick={() => openEditLocModal(loc)} className="p-1 bg-slate-100 hover:bg-blue-50 text-slate-600 rounded-lg cursor-pointer"><Edit className="w-3.5 h-3.5" /></button>
                      <button type="button" onClick={() => setDeleteConfirmLoc(loc)} className="p-1 bg-slate-100 hover:bg-rose-50 text-slate-600 rounded-lg cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== CREATE / EDIT DEPARTMENT MODAL ==================== */}
      {showCreateDeptModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 sm:p-6 overflow-y-auto">
          <form 
            onSubmit={handleSaveDept} 
            className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl my-auto shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-base text-slate-900 font-heading">
                {editingDept ? 'Edit Department Specifications' : 'Register New Department'}
              </h3>
              <button 
                type="button"
                onClick={() => { setShowCreateDeptModal(false); setEditingDept(null); }}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-200/50 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Department Code</label>
                  <input type="text" value={deptForm.code} onChange={e => setDeptForm({ ...deptForm, code: e.target.value })} placeholder="DEPT-IT-001" className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-slate-800 font-mono" />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Department Name *</label>
                  <input type="text" required value={deptForm.name} onChange={e => setDeptForm({ ...deptForm, name: e.target.value })} placeholder="Information Technology" className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-slate-800 font-medium" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Cost Centre Code</label>
                  <input type="text" value={deptForm.cost_centre} onChange={e => setDeptForm({ ...deptForm, cost_centre: e.target.value })} placeholder="IT-001" className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-mono font-bold text-emerald-700" />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Department Head</label>
                  <input type="text" value={deptForm.head_name} onChange={e => setDeptForm({ ...deptForm, head_name: e.target.value })} placeholder="Dr. Ananya Roy" className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-slate-800" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono">
                <div>
                  <label className="block text-slate-700 font-bold mb-1 font-sans">Monthly Budget (₹)</label>
                  <input type="number" min="0" value={deptForm.budget_monthly} onChange={e => setDeptForm({ ...deptForm, budget_monthly: Number(e.target.value) })} className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-slate-800" />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1 font-sans">Annual Budget (₹)</label>
                  <input type="number" min="0" value={deptForm.budget_annual} onChange={e => setDeptForm({ ...deptForm, budget_annual: Number(e.target.value) })} className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-purple-700 font-bold" />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end space-x-3 shrink-0">
              <button type="button" onClick={() => setShowCreateDeptModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-purple-600 text-white font-bold rounded-xl shadow-xs cursor-pointer">Save Department</button>
            </div>
          </form>
        </div>
      )}

      {/* ==================== CREATE / EDIT WAREHOUSE MODAL ==================== */}
      {showCreateWhModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSaveWh} className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base text-slate-900 font-heading">
                {editingWh ? 'Edit Warehouse Specifications' : 'Register New Warehouse'}
              </h3>
              <button type="button" onClick={() => setShowCreateWhModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Warehouse Name *</label>
                <input type="text" required value={whForm.name} onChange={e => setWhForm({ ...whForm, name: e.target.value })} placeholder="Central Goods Warehouse" className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-slate-800" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Warehouse Code</label>
                  <input type="text" value={whForm.code} onChange={e => setWhForm({ ...whForm, code: e.target.value })} placeholder="WH-MAIN" className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-mono text-purple-700 font-bold" />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Store Manager</label>
                  <input type="text" value={whForm.manager_name} onChange={e => setWhForm({ ...whForm, manager_name: e.target.value })} placeholder="Michael Chang" className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-slate-800" />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Facility Address</label>
                <textarea rows="2" value={whForm.address} onChange={e => setWhForm({ ...whForm, address: e.target.value })} placeholder="Plot 12, Industrial Hub..." className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-slate-800" />
              </div>
            </div>

            <div className="flex justify-end space-x-2 border-t pt-3">
              <button type="button" onClick={() => setShowCreateWhModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl cursor-pointer">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer">Save Warehouse</button>
            </div>
          </form>
        </div>
      )}

      {/* ==================== CREATE / EDIT STORAGE LOCATION MODAL ==================== */}
      {showCreateLocModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSaveLoc} className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base text-slate-900 font-heading">
                {editingLoc ? 'Edit Storage Location Bin' : 'Register New Storage Location / Bin'}
              </h3>
              <button type="button" onClick={() => setShowCreateLocModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Target Warehouse *</label>
                <select value={locForm.warehouse_id} onChange={e => setLocForm({ ...locForm, warehouse_id: e.target.value })} className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-slate-800 font-bold">
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Zone</label>
                  <input type="text" value={locForm.zone} onChange={e => setLocForm({ ...locForm, zone: e.target.value })} placeholder="Zone A" className="w-full bg-slate-50 border rounded-xl px-3 py-2" />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Rack</label>
                  <input type="text" value={locForm.rack} onChange={e => setLocForm({ ...locForm, rack: e.target.value })} placeholder="Rack 01" className="w-full bg-slate-50 border rounded-xl px-3 py-2" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Shelf</label>
                  <input type="text" value={locForm.shelf} onChange={e => setLocForm({ ...locForm, shelf: e.target.value })} placeholder="Shelf 2" className="w-full bg-slate-50 border rounded-xl px-3 py-2" />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Bin Identifier</label>
                  <input type="text" value={locForm.bin} onChange={e => setLocForm({ ...locForm, bin: e.target.value })} placeholder="Bin 05" className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-bold" />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Location Code (Auto-Generated if empty)</label>
                <input type="text" value={locForm.code} onChange={e => setLocForm({ ...locForm, code: e.target.value })} placeholder="A-R01-S2-B05" className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-mono text-purple-700 font-bold" />
              </div>
            </div>

            <div className="flex justify-end space-x-2 border-t pt-3">
              <button type="button" onClick={() => setShowCreateLocModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl cursor-pointer">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer">Save Storage Bin</button>
            </div>
          </form>
        </div>
      )}

      {/* DELETE CONFIRM MODALS */}
      {deleteConfirmDept && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-slate-900">Delete Department?</h3>
            <p className="text-xs text-slate-500">Are you sure you want to delete department "{deleteConfirmDept.name}"?</p>
            <div className="flex justify-end space-x-2 pt-2">
              <button onClick={() => setDeleteConfirmDept(null)} className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl cursor-pointer">Cancel</button>
              <button onClick={handleDeleteDeptConfirm} className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl cursor-pointer">Delete</button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmWh && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-slate-900">Delete Warehouse?</h3>
            <p className="text-xs text-slate-500">Are you sure you want to delete warehouse "{deleteConfirmWh.name}"?</p>
            <div className="flex justify-end space-x-2 pt-2">
              <button onClick={() => setDeleteConfirmWh(null)} className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl cursor-pointer">Cancel</button>
              <button onClick={handleDeleteWhConfirm} className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl cursor-pointer">Delete</button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmLoc && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-slate-900">Delete Storage Location?</h3>
            <p className="text-xs text-slate-500">Are you sure you want to delete location bin "{deleteConfirmLoc.code}"?</p>
            <div className="flex justify-end space-x-2 pt-2">
              <button onClick={() => setDeleteConfirmLoc(null)} className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl cursor-pointer">Cancel</button>
              <button onClick={handleDeleteLocConfirm} className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl cursor-pointer">Delete</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
