import React, { useState, useEffect } from 'react';
import { 
  Building2, 
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

export default function DeptWarehouseMaster() {
  // Department State
  const [departments, setDepartments] = useState([]);
  const [searchDept, setSearchDept] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [ruleFilter, setRuleFilter] = useState('All');

  // Modals state
  const [showCreateDeptModal, setShowCreateDeptModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [showViewDeptModal, setShowViewDeptModal] = useState(null);
  const [deleteConfirmDept, setDeleteConfirmDept] = useState(null);

  // Toast Notification state
  const [toast, setToast] = useState(null);

  const showToastNotification = (type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Form Validation & State
  const [touched, setTouched] = useState({});

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
    budget_control_rule: 'Warn', // 'Warn' | 'Block' | 'Override Approval'
    active_status: true
  };

  const [deptForm, setDeptForm] = useState(initialDeptFormState);

  // Fallback initial sample departments for instant demonstration
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
      category_budgets: {
        'cat-01': 1800000, // IT Equipment
        'cat-02': 600000,  // Electrical & Hardware
        'cat-03': 400000,  // Office Supplies
        'cat-04': 200000   // Raw Materials
      },
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
      category_budgets: {
        'cat-01': 200000,
        'cat-02': 1200000,
        'cat-03': 200000,
        'cat-04': 600000
      },
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
      category_budgets: {
        'cat-01': 500000,
        'cat-02': 1000000,
        'cat-03': 300000,
        'cat-04': 3200000
      },
      budget_control_rule: 'Override Approval',
      active_status: true,
      ytd_consumption: 4100000,
      recent_issues_count: 45
    },
    {
      id: 'dept-04',
      code: 'DEPT-FIN-004',
      name: 'Finance & Accounting',
      head_name: 'Priya Sharma',
      cost_centre: 'FIN-004',
      default_approver: 'Robert Wilson',
      branch: 'Main Campus - Bangalore',
      budget_monthly: 80000,
      budget_quarterly: 240000,
      budget_annual: 1000000,
      category_budgets: {
        'cat-01': 400000,
        'cat-02': 100000,
        'cat-03': 400000,
        'cat-04': 100000
      },
      budget_control_rule: 'Warn',
      active_status: true,
      ytd_consumption: 620000,
      recent_issues_count: 14
    },
    {
      id: 'dept-05',
      code: 'DEPT-HR-005',
      name: 'Human Resources & Admin',
      head_name: 'Meera Nair',
      cost_centre: 'HR-005',
      default_approver: 'Sarah Jenkins',
      branch: 'Mumbai Hub Office',
      budget_monthly: 100000,
      budget_quarterly: 300000,
      budget_annual: 1200000,
      category_budgets: {
        'cat-01': 500000,
        'cat-02': 100000,
        'cat-03': 500000,
        'cat-04': 100000
      },
      budget_control_rule: 'Block',
      active_status: false,
      ytd_consumption: 450000,
      recent_issues_count: 8
    }
  ];

  useEffect(() => {
    fetchDepartments();
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
    } catch (err) {
      console.error(err);
      setDepartments(sampleDepartmentsFallback);
    }
  };

  // Validation Rules
  const getValidationErrors = () => {
    const errors = {};
    if (!deptForm.name || !deptForm.name.trim()) {
      errors.name = 'Department Name is mandatory.';
    }
    if (deptForm.code && departments.some(d => d.code && d.code.toLowerCase() === deptForm.code.toLowerCase() && d.id !== editingDept?.id)) {
      errors.code = `Department Code "${deptForm.code}" already exists.`;
    }
    if (Number(deptForm.budget_annual) < Number(deptForm.budget_monthly)) {
      errors.budget_annual = 'Annual budget cannot be less than monthly budget.';
    }
    return errors;
  };

  const errors = getValidationErrors();

  const openCreateDeptModal = () => {
    setEditingDept(null);
    setDeptForm(initialDeptFormState);
    setTouched({});
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
    setTouched({});
    setShowCreateDeptModal(true);
  };

  const handleDeleteDeptConfirm = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!deleteConfirmDept) return;
    const target = deleteConfirmDept;

    setDepartments(prev => prev.filter(d => d.id !== target.id && d.code !== target.code));
    setDeleteConfirmDept(null);

    showToastNotification(
      'danger',
      'Department Deleted',
      `Department "${target.name}" (${target.code}) has been deleted.`
    );

    fetch(`/api/departments/${target.id}`, {
      method: 'DELETE'
    }).catch(err => console.error(err));
  };

  const handleSaveDept = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    setTouched({
      name: true,
      code: true,
      budget_annual: true
    });

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
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
        const updated = departments.map(d => (d.id === editingDept.id || d.code === editingDept.code) ? { ...d, ...payload } : d);
        setDepartments(updated);
        setShowCreateDeptModal(false);
        setEditingDept(null);

        showToastNotification(
          'info',
          'Department Updated',
          `Department "${payload.name}" (${payload.code}) specifications updated.`
        );

        fetch(`/api/departments/${editingDept.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(() => null);
      } else {
        const newDept = {
          id: `dept-${Date.now()}`,
          ...payload,
          ytd_consumption: 0,
          recent_issues_count: 0
        };

        setDepartments([newDept, ...departments]);
        setShowCreateDeptModal(false);

        showToastNotification(
          'success',
          'Department Registered',
          `Department "${newDept.name}" (${newDept.code}) registered successfully.`
        );

        fetch('/api/departments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(() => null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredDepartments = departments.filter(d => {
    const matchesSearch = 
      (d.name || '').toLowerCase().includes(searchDept.toLowerCase()) ||
      (d.code || '').toLowerCase().includes(searchDept.toLowerCase()) ||
      (d.cost_centre || '').toLowerCase().includes(searchDept.toLowerCase()) ||
      (d.head_name || '').toLowerCase().includes(searchDept.toLowerCase()) ||
      (d.branch || '').toLowerCase().includes(searchDept.toLowerCase());

    const matchesStatus = statusFilter === 'All' || (statusFilter === 'Active' ? d.active_status !== false : d.active_status === false);
    const matchesRule = ruleFilter === 'All' || (d.budget_control_rule || 'Warn') === ruleFilter;

    return matchesSearch && matchesStatus && matchesRule;
  });

  const totalAllocatedBudget = departments.reduce((sum, d) => sum + (d.budget_annual || 0), 0);
  const totalYtdConsumption = departments.reduce((sum, d) => sum + (d.ytd_consumption || 0), 0);

  const getRuleBadge = (rule) => {
    switch (rule) {
      case 'Warn':
        return <span className="bg-amber-50 text-amber-800 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center space-x-1"><AlertTriangle className="w-3 h-3 text-amber-600" /><span>Rule: Warn</span></span>;
      case 'Block':
        return <span className="bg-rose-50 text-rose-800 border border-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center space-x-1"><Ban className="w-3 h-3 text-rose-600" /><span>Rule: Hard Block</span></span>;
      case 'Override Approval':
        return <span className="bg-purple-50 text-purple-800 border border-purple-300 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center space-x-1"><ShieldCheck className="w-3 h-3 text-purple-600" /><span>Rule: Override Approval</span></span>;
      default:
        return <span className="bg-amber-50 text-amber-800 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center space-x-1"><span>Rule: Warn</span></span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 border border-slate-200/80 rounded-2xl shadow-xs gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 font-heading flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-purple-600" />
            <span>Department Master & Cost Centres</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Defines departments requesting or consuming inventory, cost centres & budget controls.
          </p>
        </div>
        <button 
          type="button"
          onClick={openCreateDeptModal}
          className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Register Department</span>
        </button>
      </div>

      {/* DEPARTMENT MASTER CONTENT */}
      <div className="space-y-5">
        
        {/* Search, Filter & Summary Bar */}
        <div className="bg-white p-3.5 border border-slate-200/80 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto flex-1">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                value={searchDept}
                onChange={(e) => setSearchDept(e.target.value)}
                placeholder="Search dept name, code, cost centre, head, branch..."
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

            {/* Budget Rule Filter */}
            <div className="flex items-center space-x-1.5 text-xs">
              <select 
                value={ruleFilter}
                onChange={(e) => setRuleFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-medium text-slate-800"
              >
                <option value="All">All Budget Rules</option>
                <option value="Warn">Warn Rule</option>
                <option value="Block">Hard Block Rule</option>
                <option value="Override Approval">Override Approval Rule</option>
              </select>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="text-xs text-slate-500 font-mono space-x-4">
            <span>Total Budget: <strong className="text-slate-900">₹{(totalAllocatedBudget / 100000).toFixed(1)}L</strong></span>
            <span>YTD Expense: <strong className="text-purple-700">₹{(totalYtdConsumption / 100000).toFixed(1)}L</strong></span>
          </div>
        </div>

        {/* Department Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDepartments.map(dept => {
            const annual = dept.budget_annual || 2400000;
            const ytd = dept.ytd_consumption || 0;
            const pct = Math.min(100, Math.round((ytd / annual) * 100));
            const remaining = Math.max(0, annual - ytd);
            const isActive = dept.active_status !== false;

            return (
              <div key={dept.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4 hover:border-purple-300 transition flex flex-col justify-between">
                
                <div>
                  {/* Top Bar: Code, Cost Centre & Status */}
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-[10px] text-purple-700 font-bold bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                          {dept.code}
                        </span>
                        <span className="font-mono text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          CC: {dept.cost_centre}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 leading-snug pt-1">{dept.name}</h3>
                    </div>

                    <div className="flex flex-col items-end space-y-1">
                      {isActive ? (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">● Active</span>
                      ) : (
                        <span className="bg-slate-100 text-slate-600 border border-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full">● Inactive</span>
                      )}
                      {getRuleBadge(dept.budget_control_rule)}
                    </div>
                  </div>

                  {/* Department Head, Approver & Branch */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <p className="flex justify-between">
                      <span className="text-slate-400 font-semibold">Department Head:</span>
                      <strong className="text-slate-800">{dept.head_name || 'Dr. Ananya Roy'}</strong>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-400 font-semibold">Default Approver:</span>
                      <strong className="text-slate-800">{dept.default_approver || 'Sarah Jenkins'}</strong>
                    </p>
                    <p className="flex justify-between text-[11px]">
                      <span className="text-slate-400 font-semibold">Operating Branch:</span>
                      <span className="text-slate-700 truncate max-w-[160px]">{dept.branch || 'Main Campus'}</span>
                    </p>
                  </div>

                  {/* Financial Budget Allocations */}
                  <div className="mt-3 bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2 text-[11px]">
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-500 font-sans">Monthly Budget:</span>
                      <strong className="text-slate-800">₹{(dept.budget_monthly || 200000).toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-500 font-sans">Quarterly Budget:</span>
                      <strong className="text-slate-800">₹{(dept.budget_quarterly || 600000).toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between font-mono border-t border-slate-200 pt-1">
                      <span className="text-slate-700 font-sans font-bold">Annual Budget:</span>
                      <strong className="text-purple-700 font-bold">₹{annual.toLocaleString()}</strong>
                    </div>
                  </div>

                  {/* Budget Utilization Progress Bar */}
                  <div className="mt-3 space-y-1 text-xs">
                    <div className="flex justify-between text-[11px] font-medium">
                      <span className="text-slate-500 font-semibold">YTD Consumption:</span>
                      <span className={`font-mono font-bold ${pct > 90 ? 'text-rose-600' : pct > 75 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {pct}% (₹{(ytd / 100000).toFixed(1)}L used)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${pct > 90 ? 'bg-rose-500' : pct > 75 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 text-right">
                      Remaining Budget: <span className="font-mono text-slate-700 font-bold">₹{remaining.toLocaleString()}</span>
                    </p>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-end space-x-1">
                  <button 
                    type="button" 
                    onClick={() => setShowViewDeptModal(dept)}
                    className="p-1.5 bg-slate-50 hover:bg-purple-50 hover:text-purple-700 border border-slate-200 rounded-lg text-slate-600 transition"
                    title="View Full Profile & Category Budgets"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    type="button" 
                    onClick={() => openEditDeptModal(dept)}
                    className="p-1.5 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 rounded-lg text-slate-600 transition"
                    title="Edit Department Specifications"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setDeleteConfirmDept(dept)}
                    className="p-1.5 bg-slate-50 hover:bg-rose-50 hover:text-rose-700 border border-slate-200 rounded-lg text-slate-600 transition"
                    title="Delete Department"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* REGISTER / EDIT DEPARTMENT MODAL */}
      {showCreateDeptModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 sm:p-6 overflow-y-auto">
          <form 
            onSubmit={handleSaveDept} 
            className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl my-auto shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 font-heading">
                    {editingDept ? 'Edit Department Specifications' : 'Register New Department'}
                  </h3>
                  <p className="text-xs text-slate-500">Configure cost centres, approvers, branch locations & budget limits</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => { setShowCreateDeptModal(false); setEditingDept(null); }}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-200/50 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              
              {/* SECTION 1 — Department Identification */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-purple-700 border-b pb-2">SECTION 1 — Department Identification & Cost Centre</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Department Code</label>
                    <input 
                      type="text" 
                      value={deptForm.code} 
                      onBlur={() => setTouched({ ...touched, code: true })}
                      onChange={e => setDeptForm({ ...deptForm, code: e.target.value })} 
                      placeholder="DEPT-IT-001" 
                      className={`w-full bg-slate-50 border ${touched.code && errors.code ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'} rounded-xl px-3 py-2 text-slate-800 font-mono focus:bg-white focus:outline-none focus:border-purple-500`} 
                    />
                    {touched.code && errors.code && (
                      <p className="text-[10px] text-rose-600 mt-1 font-semibold">{errors.code}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-slate-700 font-bold mb-1">Department Name <span className="text-rose-500">*</span></label>
                    <input 
                      type="text" 
                      value={deptForm.name} 
                      onBlur={() => setTouched({ ...touched, name: true })}
                      onChange={e => setDeptForm({ ...deptForm, name: e.target.value })} 
                      placeholder="Information Technology" 
                      className={`w-full bg-slate-50 border ${touched.name && errors.name ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'} rounded-xl px-3 py-2 text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-purple-500`} 
                    />
                    {touched.name && errors.name && (
                      <p className="text-[11px] text-rose-600 mt-1 font-semibold flex items-center"><AlertTriangle className="w-3 h-3 mr-1" />{errors.name}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Cost Centre Code</label>
                    <input 
                      type="text" 
                      value={deptForm.cost_centre} 
                      onChange={e => setDeptForm({ ...deptForm, cost_centre: e.target.value })} 
                      placeholder="IT-001" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono font-bold text-emerald-700 focus:bg-white focus:outline-none focus:border-purple-500" 
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Department Head</label>
                    <input 
                      type="text" 
                      value={deptForm.head_name} 
                      onChange={e => setDeptForm({ ...deptForm, head_name: e.target.value })} 
                      placeholder="Dr. Ananya Roy" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-purple-500" 
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Default Approver</label>
                    <input 
                      type="text" 
                      value={deptForm.default_approver} 
                      onChange={e => setDeptForm({ ...deptForm, default_approver: e.target.value })} 
                      placeholder="Sarah Jenkins" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-purple-500" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Branch / Facility Location</label>
                  <input 
                    type="text" 
                    value={deptForm.branch} 
                    onChange={e => setDeptForm({ ...deptForm, branch: e.target.value })} 
                    placeholder="Main Campus - Bangalore" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-purple-500" 
                  />
                </div>
              </div>

              {/* SECTION 2 — Budget Allocations & Control Rules */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-700 border-b pb-2">SECTION 2 — Department Budget Allocations & Control Rules</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1 font-sans">Monthly Budget (₹)</label>
                    <input 
                      type="number" 
                      min="0"
                      value={deptForm.budget_monthly} 
                      onChange={e => setDeptForm({ ...deptForm, budget_monthly: Number(e.target.value) })} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-purple-500" 
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1 font-sans">Quarterly Budget (₹)</label>
                    <input 
                      type="number" 
                      min="0"
                      value={deptForm.budget_quarterly} 
                      onChange={e => setDeptForm({ ...deptForm, budget_quarterly: Number(e.target.value) })} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-purple-500" 
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1 font-sans">Annual Budget (₹)</label>
                    <input 
                      type="number" 
                      min="0"
                      value={deptForm.budget_annual} 
                      onBlur={() => setTouched({ ...touched, budget_annual: true })}
                      onChange={e => setDeptForm({ ...deptForm, budget_annual: Number(e.target.value) })} 
                      className={`w-full bg-slate-50 border ${touched.budget_annual && errors.budget_annual ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'} rounded-xl px-3 py-2 text-purple-700 font-bold focus:bg-white focus:outline-none focus:border-purple-500`} 
                    />
                    {touched.budget_annual && errors.budget_annual && (
                      <p className="text-[10px] text-rose-600 mt-1 font-semibold">{errors.budget_annual}</p>
                    )}
                  </div>
                </div>

                {/* Category-Wise Budget Allocations */}
                <div className="pt-2">
                  <label className="block text-slate-700 font-bold mb-1.5">Category-Wise Budget Allocations (₹)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono">
                    <div>
                      <span className="text-[10px] text-slate-400 font-sans block font-bold">IT Equipment</span>
                      <input type="number" min="0" value={deptForm.category_budget_it} onChange={e => setDeptForm({ ...deptForm, category_budget_it: Number(e.target.value) })} className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-800 text-xs" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-sans block font-bold">Electrical & Hw</span>
                      <input type="number" min="0" value={deptForm.category_budget_ele} onChange={e => setDeptForm({ ...deptForm, category_budget_ele: Number(e.target.value) })} className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-800 text-xs" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-sans block font-bold">Office Supplies</span>
                      <input type="number" min="0" value={deptForm.category_budget_off} onChange={e => setDeptForm({ ...deptForm, category_budget_off: Number(e.target.value) })} className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-800 text-xs" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-sans block font-bold">Raw Materials</span>
                      <input type="number" min="0" value={deptForm.category_budget_raw} onChange={e => setDeptForm({ ...deptForm, category_budget_raw: Number(e.target.value) })} className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-800 text-xs" />
                    </div>
                  </div>
                </div>

                {/* Budget Enforcement Rule Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Budget Control Enforcement Rule</label>
                    <select 
                      value={deptForm.budget_control_rule} 
                      onChange={e => setDeptForm({ ...deptForm, budget_control_rule: e.target.value })} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="Warn">Warn (Notify manager when budget is exceeded)</option>
                      <option value="Block">Block (Hard block requests exceeding budget)</option>
                      <option value="Override Approval">Override Approval (Allow senior authority override)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Active Status</label>
                    <select 
                      value={deptForm.active_status ? 'Active' : 'Inactive'} 
                      onChange={e => setDeptForm({ ...deptForm, active_status: e.target.value === 'Active' })} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <div className="text-[11px] text-slate-500 font-medium">
                {Object.keys(errors).length > 0 && Object.keys(touched).length > 0 ? (
                  <span className="text-rose-600 font-bold flex items-center">
                    <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Please fix validation errors before saving.
                  </span>
                ) : (
                  <span className="text-emerald-700 font-semibold flex items-center">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Department specifications configured cleanly.
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <button 
                  type="button" 
                  onClick={() => { setShowCreateDeptModal(false); setEditingDept(null); }} 
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  {editingDept ? 'Update Department Specs' : 'Save Department'}
                </button>
              </div>
            </div>

          </form>
        </div>
      )}

      {/* READ-ONLY VIEW MODAL */}
      {showViewDeptModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">{showViewDeptModal.name}</h3>
                  <p className="text-xs font-mono text-purple-700 font-bold">Code: {showViewDeptModal.code} | Cost Centre: {showViewDeptModal.cost_centre}</p>
                </div>
              </div>
              <button type="button" onClick={() => setShowViewDeptModal(null)} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono">
                <div><span className="text-slate-400 text-[10px] font-sans font-bold block">Monthly Budget</span><strong className="text-slate-900">₹{(showViewDeptModal.budget_monthly || 200000).toLocaleString()}</strong></div>
                <div><span className="text-slate-400 text-[10px] font-sans font-bold block">Quarterly Budget</span><strong className="text-slate-900">₹{(showViewDeptModal.budget_quarterly || 600000).toLocaleString()}</strong></div>
                <div><span className="text-slate-400 text-[10px] font-sans font-bold block">Annual Budget</span><strong className="text-purple-700 font-bold">₹{(showViewDeptModal.budget_annual || 2400000).toLocaleString()}</strong></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
                  <h4 className="font-bold text-xs uppercase text-purple-700 border-b pb-1">Management & Approvals</h4>
                  <p><strong className="text-slate-800">Dept Head:</strong> {showViewDeptModal.head_name || 'Dr. Ananya Roy'}</p>
                  <p><strong className="text-slate-800">Default Approver:</strong> {showViewDeptModal.default_approver || 'Sarah Jenkins'}</p>
                  <p><strong className="text-slate-800">Branch:</strong> {showViewDeptModal.branch || 'Main Campus'}</p>
                  <p><strong className="text-slate-800">Control Rule:</strong> {showViewDeptModal.budget_control_rule || 'Warn'}</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
                  <h4 className="font-bold text-xs uppercase text-purple-700 border-b pb-1">Category Budget Breakdown</h4>
                  <p><strong className="text-slate-800">IT Equipment:</strong> <span className="font-mono">₹{(showViewDeptModal.category_budgets?.['cat-01'] || 1200000).toLocaleString()}</span></p>
                  <p><strong className="text-slate-800">Electrical & Hw:</strong> <span className="font-mono">₹{(showViewDeptModal.category_budgets?.['cat-02'] || 500000).toLocaleString()}</span></p>
                  <p><strong className="text-slate-800">Office Supplies:</strong> <span className="font-mono">₹{(showViewDeptModal.category_budgets?.['cat-03'] || 400000).toLocaleString()}</span></p>
                  <p><strong className="text-slate-800">Raw Materials:</strong> <span className="font-mono">₹{(showViewDeptModal.category_budgets?.['cat-04'] || 300000).toLocaleString()}</span></p>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button type="button" onClick={() => setShowViewDeptModal(null)} className="px-4 py-2 bg-slate-200 text-slate-800 font-bold text-xs rounded-xl">Close Profile</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deleteConfirmDept && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center font-bold shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Confirm Delete Department</h3>
                <p className="text-xs font-mono text-purple-700 font-bold">{deleteConfirmDept.code}</p>
              </div>
            </div>

            <div className="p-3.5 bg-rose-50/80 border border-rose-200 rounded-xl text-xs text-rose-900 space-y-1">
              <p className="font-bold">Permanent Deletion Notice:</p>
              <p>Are you sure you want to delete <strong>{deleteConfirmDept.name}</strong>?</p>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button type="button" onClick={() => setDeleteConfirmDept(null)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">Cancel</button>
              <button type="button" onClick={handleDeleteDeptConfirm} className="px-5 py-2 bg-rose-600 text-white font-bold text-xs rounded-xl">Delete Department</button>
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
