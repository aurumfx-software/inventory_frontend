import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Filter, 
  Lock, 
  Building2, 
  Warehouse, 
  Mail, 
  Phone, 
  DollarSign, 
  Briefcase, 
  Check,
  Shield,
  Layers,
  Award
} from 'lucide-react';

export default function UserManagement() {
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'roles' | 'scope'
  
  // Users state
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Roles state
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);

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

  const initialFormState = {
    emp_code: '',
    name: '',
    email: '',
    phone: '+91 98765 43210',
    role_id: 'role-requester',
    role_name: 'Employee or Requester',
    department_name: 'Information Technology',
    branch: 'Main Campus - Bangalore',
    reporting_manager: 'Dr. Ananya Roy',
    approval_limit: 100000,
    is_active: true,
    warehouse_access: ['wh-01', 'wh-02'],
    department_access: ['dept-01']
  };

  const [formData, setFormData] = useState(initialFormState);

  // Fallback seed roles per PDF Section 10.1 - 10.7
  const sampleRolesFallback = [
    {
      id: 'role-admin',
      name: 'Super Administrator',
      code: 'SUPER_ADMIN',
      description: 'Access every module, create users/roles, change settings, view all reports & configure workflows.',
      permissions: ['item.view', 'item.create', 'item.edit', 'item.delete', 'supplier.view', 'supplier.create', 'supplier.edit', 'indent.create', 'indent.view', 'indent.approve', 'indent.cancel', 'rfq.create', 'rfq.view', 'rfq.send', 'quote.create', 'quote.compare', 'quote.select', 'po.create', 'po.approve', 'po.print', 'grn.create', 'grn.inspect', 'grn.post', 'stock.view', 'stock.issue', 'stock.return', 'stock.transfer', 'stock.adjust', 'stock.verify', 'asset.view', 'asset.assign', 'report.view', 'report.export', 'audit.view', 'settings.edit']
    },
    {
      id: 'role-purchase',
      name: 'Purchase Manager',
      code: 'PURCHASE_MGR',
      description: 'View approved indents, create RFQs, record quotations, create POs & view supplier performance.',
      permissions: ['item.view', 'supplier.view', 'supplier.create', 'supplier.edit', 'indent.view', 'rfq.create', 'rfq.view', 'rfq.send', 'quote.create', 'quote.compare', 'quote.select', 'po.create', 'po.approve', 'po.print', 'report.view']
    },
    {
      id: 'role-store',
      name: 'Store Manager',
      code: 'STORE_MGR',
      description: 'Receive goods, issue stock, accept returns, transfer stock & perform stock adjustments.',
      permissions: ['item.view', 'grn.create', 'grn.inspect', 'grn.post', 'stock.view', 'stock.issue', 'stock.return', 'stock.transfer', 'stock.adjust', 'stock.verify', 'asset.view', 'asset.assign']
    },
    {
      id: 'role-dept-mgr',
      name: 'Department Manager',
      code: 'DEPT_MGR',
      description: 'Approve department indents, view department consumption & review budgets.',
      permissions: ['indent.view', 'indent.approve', 'indent.cancel', 'report.view']
    },
    {
      id: 'role-requester',
      name: 'Employee or Requester',
      code: 'REQUESTER',
      description: 'Create indents, view own indents, respond to returned requests & confirm receipt.',
      permissions: ['indent.create', 'indent.view', 'stock.view']
    },
    {
      id: 'role-finance',
      name: 'Finance User',
      code: 'FINANCE_USER',
      description: 'Review purchase values, verify taxes, approve purchases & view payment invoices.',
      permissions: ['po.approve', 'po.print', 'report.view', 'report.export']
    },
    {
      id: 'role-auditor',
      name: 'Auditor',
      code: 'AUDITOR',
      description: 'Read-only access to transactions, approvals, audit logs, reports & stock reconciliation.',
      permissions: ['item.view', 'supplier.view', 'indent.view', 'rfq.view', 'po.print', 'stock.view', 'report.view', 'audit.view']
    }
  ];

  // Fallback seed users
  const sampleUsersFallback = [
    {
      id: 'usr-01',
      emp_code: 'EMP-001',
      name: 'Sarah Jenkins',
      email: 'admin@company.com',
      phone: '+91 98765 43210',
      role_id: 'role-admin',
      role_name: 'Super Administrator',
      department_name: 'Information Technology',
      branch: 'Main Campus - Bangalore',
      reporting_manager: 'Board of Directors',
      approval_limit: 5000000,
      is_active: true
    },
    {
      id: 'usr-02',
      emp_code: 'EMP-002',
      name: 'Rajesh Kumar',
      email: 'purchase@company.com',
      phone: '+91 98765 43211',
      role_id: 'role-purchase',
      role_name: 'Purchase Manager',
      department_name: 'Procurement & Purchasing',
      branch: 'Main Campus - Bangalore',
      reporting_manager: 'Sarah Jenkins',
      approval_limit: 1500000,
      is_active: true
    },
    {
      id: 'usr-03',
      emp_code: 'EMP-003',
      name: 'Michael Chang',
      email: 'store@company.com',
      phone: '+91 98765 43212',
      role_id: 'role-store',
      role_name: 'Store Manager',
      department_name: 'Warehouse Operations',
      branch: 'Main Campus - Bangalore',
      reporting_manager: 'Rajesh Kumar',
      approval_limit: 500000,
      is_active: true
    },
    {
      id: 'usr-04',
      emp_code: 'EMP-004',
      name: 'Dr. Ananya Roy',
      email: 'deptmgr@company.com',
      phone: '+91 98765 43213',
      role_id: 'role-dept-mgr',
      role_name: 'Department Manager',
      department_name: 'Information Technology',
      branch: 'Main Campus - Bangalore',
      reporting_manager: 'Sarah Jenkins',
      approval_limit: 1000000,
      is_active: true
    },
    {
      id: 'usr-05',
      emp_code: 'EMP-005',
      name: 'David Miller',
      email: 'requester@company.com',
      phone: '+91 98765 43214',
      role_id: 'role-requester',
      role_name: 'Employee or Requester',
      department_name: 'Information Technology',
      branch: 'Main Campus - Bangalore',
      reporting_manager: 'Dr. Ananya Roy',
      approval_limit: 50000,
      is_active: true
    },
    {
      id: 'usr-06',
      emp_code: 'EMP-006',
      name: 'Priya Sharma',
      email: 'finance@company.com',
      phone: '+91 98765 43215',
      role_id: 'role-finance',
      role_name: 'Finance User',
      department_name: 'Finance & Accounts',
      branch: 'Main Campus - Bangalore',
      reporting_manager: 'Sarah Jenkins',
      approval_limit: 2500000,
      is_active: true
    },
    {
      id: 'usr-07',
      emp_code: 'EMP-007',
      name: 'Robert Wilson',
      email: 'auditor@company.com',
      phone: '+91 98765 43216',
      role_id: 'role-auditor',
      role_name: 'Auditor',
      department_name: 'Finance & Accounts',
      branch: 'Main Campus - Bangalore',
      reporting_manager: 'Sarah Jenkins',
      approval_limit: 0,
      is_active: true
    }
  ];

  useEffect(() => {
    fetchUsers();
    setRoles(sampleRolesFallback);
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const savedLocal = localStorage.getItem('app_users_master');
        if (data.data.length > 0) {
          setUsers(data.data);
          localStorage.setItem('app_users_master', JSON.stringify(data.data));
        } else if (savedLocal !== null) {
          try { setUsers(JSON.parse(savedLocal)); } catch(e) { setUsers([]); }
        } else {
          setUsers(sampleUsersFallback);
          localStorage.setItem('app_users_master', JSON.stringify(sampleUsersFallback));
        }
      } else {
        const saved = localStorage.getItem('app_users_master');
        if (saved !== null) {
          try { setUsers(JSON.parse(saved)); } catch(e) { setUsers(sampleUsersFallback); }
        } else {
          setUsers(sampleUsersFallback);
          localStorage.setItem('app_users_master', JSON.stringify(sampleUsersFallback));
        }
      }
    } catch (err) {
      console.error(err);
      const saved = localStorage.getItem('app_users_master');
      if (saved !== null) {
        try { setUsers(JSON.parse(saved)); } catch(e) { setUsers(sampleUsersFallback); }
      } else {
        setUsers(sampleUsersFallback);
      }
    }
  };

  // Validation Rules
  const getValidationErrors = () => {
    const errors = {};
    if (!formData.name || !formData.name.trim()) {
      errors.name = 'Full Name is mandatory.';
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address.';
    }
    if (formData.emp_code && users.some(u => u.emp_code && u.emp_code.toLowerCase() === formData.emp_code.toLowerCase() && u.id !== editingUser?.id)) {
      errors.emp_code = `Employee Code "${formData.emp_code}" already exists.`;
    }
    return errors;
  };

  const errors = getValidationErrors();

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData(initialFormState);
    setTouched({});
    setShowCreateModal(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      emp_code: user.emp_code || '',
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '+91 98765 43210',
      role_id: user.role_id || 'role-requester',
      role_name: user.role_name || 'Employee or Requester',
      department_name: user.department_name || 'Information Technology',
      branch: user.branch || 'Main Campus - Bangalore',
      reporting_manager: user.reporting_manager || 'Dr. Ananya Roy',
      approval_limit: user.approval_limit || 100000,
      is_active: user.is_active !== false,
      warehouse_access: user.warehouse_access || ['wh-01', 'wh-02'],
      department_access: user.department_access || ['dept-01']
    });
    setTouched({});
    setShowCreateModal(true);
  };

  const handleDeleteUserConfirm = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!deleteConfirmUser) return;
    const target = deleteConfirmUser;

    const filtered = users.filter(u => u.id !== target.id && u.emp_code !== target.emp_code);
    setUsers(filtered);
    localStorage.setItem('app_users_master', JSON.stringify(filtered));
    setDeleteConfirmUser(null);

    showToastNotification(
      'danger',
      'User Account Deleted',
      `User "${target.name}" (${target.emp_code}) has been deleted.`
    );

    const targetId = target.id || target.emp_code;
    fetch(`/api/users/${encodeURIComponent(targetId)}`, {
      method: 'DELETE'
    }).catch(err => console.error(err));
  };

  const handleSaveUser = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    setTouched({
      name: true,
      email: true,
      emp_code: true
    });

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      const selectedRoleObj = roles.find(r => r.id === formData.role_id) || {};
      const payload = {
        emp_code: formData.emp_code || `EMP-${Math.floor(100 + Math.random() * 900)}`,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone,
        role_id: formData.role_id,
        role_name: selectedRoleObj.name || formData.role_name,
        department_name: formData.department_name,
        branch: formData.branch,
        reporting_manager: formData.reporting_manager,
        approval_limit: Number(formData.approval_limit),
        is_active: formData.is_active
      };

      if (editingUser) {
        const updated = users.map(u => (u.id === editingUser.id || u.emp_code === editingUser.emp_code) ? { ...u, ...payload } : u);
        setUsers(updated);
        localStorage.setItem('app_users_master', JSON.stringify(updated));
        setShowCreateModal(false);
        setEditingUser(null);

        showToastNotification(
          'info',
          'User Updated',
          `User "${payload.name}" (${payload.emp_code}) account details updated.`
        );

        const targetId = editingUser.id || editingUser.emp_code;
        fetch(`/api/users/${encodeURIComponent(targetId)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(() => null);
      } else {
        const tempId = `usr-${Date.now()}`;
        const newUser = {
          id: tempId,
          ...payload
        };

        const updatedList = [newUser, ...users];
        setUsers(updatedList);
        localStorage.setItem('app_users_master', JSON.stringify(updatedList));
        setShowCreateModal(false);

        showToastNotification(
          'success',
          'User Account Registered',
          `User "${newUser.name}" (${newUser.emp_code}) registered successfully.`
        );

        fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
          .then(r => r.json())
          .then(resData => {
            if (resData.success && resData.data) {
              const realId = resData.data.id || tempId;
              const realCode = resData.data.emp_code || newUser.emp_code;
              setUsers(prev => {
                const synced = prev.map(u => u.id === tempId ? { ...u, id: realId, emp_code: realCode } : u);
                localStorage.setItem('app_users_master', JSON.stringify(synced));
                return synced;
              });
            }
          })
          .catch(() => null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.emp_code || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.department_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.branch || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.role_name || '').toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === 'All' || u.role_id === roleFilter || u.role_name === roleFilter;
    const matchesStatus = statusFilter === 'All' || (statusFilter === 'Active' ? u.is_active !== false : u.is_active === false);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadgeColor = (roleId) => {
    switch (roleId) {
      case 'role-admin':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'role-purchase':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'role-store':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'role-dept-mgr':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'role-finance':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'role-auditor':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 border border-slate-200/80 rounded-2xl shadow-xs gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 font-heading flex items-center space-x-2">
            <UserCheck className="w-5 h-5 text-purple-600" />
            <span>User Management & Access Controls</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Controls system access, role definitions, approval limits & multi-scope access.
          </p>
        </div>
        <button 
          type="button"
          onClick={openCreateModal}
          className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Register New User</span>
        </button>
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2 text-xs">
        <button 
          type="button" 
          onClick={() => setActiveTab('users')} 
          className={`px-4 py-2 rounded-xl font-bold transition flex items-center space-x-2 ${activeTab === 'users' ? 'bg-purple-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
        >
          <UserCheck className="w-4 h-4" />
          <span>User Directory ({users.length})</span>
        </button>

        <button 
          type="button" 
          onClick={() => setActiveTab('roles')} 
          className={`px-4 py-2 rounded-xl font-bold transition flex items-center space-x-2 ${activeTab === 'roles' ? 'bg-purple-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>7 Core System Roles & Permissions</span>
        </button>
      </div>

      {/* TAB 1: USER DIRECTORY */}
      {activeTab === 'users' && (
        <div className="space-y-5">
          
          {/* Search & Filter Bar */}
          <div className="bg-white p-3.5 border border-slate-200/80 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto flex-1">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search user name, emp code, email, department, branch..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500 focus:bg-white"
                />
              </div>

              {/* Role Filter */}
              <div className="flex items-center space-x-1.5 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select 
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-medium text-slate-800"
                >
                  <option value="All">All System Roles</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center space-x-1.5 text-xs">
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
            </div>

            <div className="text-xs text-slate-500 font-mono">
              Filtered Users: <strong className="text-slate-900">{filteredUsers.length}</strong>
            </div>
          </div>

          {/* User Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredUsers.map(u => {
              const isActive = u.is_active !== false;

              return (
                <div key={u.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4 hover:border-purple-300 transition flex flex-col justify-between">
                  
                  <div>
                    {/* Header: Code & Role */}
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono text-[10px] text-purple-700 font-bold bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                          {u.emp_code}
                        </span>
                        <h3 className="font-bold text-sm text-slate-900 leading-snug pt-1.5">{u.name}</h3>
                        <p className="text-xs text-slate-500 font-mono">{u.email}</p>
                      </div>

                      <div className="flex flex-col items-end space-y-1">
                        {isActive ? (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">● Active</span>
                        ) : (
                          <span className="bg-slate-100 text-slate-600 border border-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full">● Inactive</span>
                        )}
                      </div>
                    </div>

                    {/* Role Badge */}
                    <div className="mt-2.5">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getRoleBadgeColor(u.role_id)}`}>
                        {u.role_name}
                      </span>
                    </div>

                    {/* Department, Manager & Approval Limit */}
                    <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                      <p className="flex justify-between">
                        <span className="text-slate-400 font-semibold">Department:</span>
                        <strong className="text-slate-800">{u.department_name || 'Information Technology'}</strong>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-slate-400 font-semibold">Reporting Manager:</span>
                        <strong className="text-slate-800">{u.reporting_manager || 'Dr. Ananya Roy'}</strong>
                      </p>
                      <p className="flex justify-between text-[11px]">
                        <span className="text-slate-400 font-semibold">Operating Branch:</span>
                        <span className="text-slate-700 truncate max-w-[160px]">{u.branch || 'Main Campus'}</span>
                      </p>
                      <p className="flex justify-between font-mono pt-1 border-t border-slate-100">
                        <span className="text-slate-500 font-sans font-bold">Financial Approval Limit:</span>
                        <strong className="text-emerald-700 font-bold">₹{(u.approval_limit || 0).toLocaleString()}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button 
                      type="button" 
                      onClick={() => setShowPermissionsModal(u)}
                      className="text-[11px] text-purple-700 hover:text-purple-900 font-bold flex items-center space-x-1"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                      <span>View Permissions</span>
                    </button>

                    <div className="flex items-center space-x-1">
                      <button 
                        type="button" 
                        onClick={() => openEditModal(u)}
                        className="p-1.5 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 rounded-lg text-slate-600 transition"
                        title="Edit User Details"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setDeleteConfirmUser(u)}
                        className="p-1.5 bg-slate-50 hover:bg-rose-50 hover:text-rose-700 border border-slate-200 rounded-lg text-slate-600 transition"
                        title="Delete User"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* TAB 2: ROLES & ACTION PERMISSIONS MATRIX */}
      {activeTab === 'roles' && (
        <div className="space-y-4">
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl text-xs text-purple-950 space-y-1">
            <strong className="font-bold flex items-center text-purple-900"><ShieldCheck className="w-4 h-4 mr-1 text-purple-600" /> Action-Based Permission Matrix:</strong>
            <p>Protected backend APIs enforce permission middleware checking (e.g. <code>if (!user.hasPermission("indent.approve")) throw new ForbiddenError(...)</code>).</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {roles.map(role => (
              <div key={role.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex justify-between items-start border-b border-slate-100 pb-2.5">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getRoleBadgeColor(role.id)}`}>{role.name}</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">{role.description}</p>
                  </div>
                  <span className="text-[11px] font-mono text-purple-700 font-bold bg-purple-50 px-2.5 py-1 rounded-xl border border-purple-200">
                    {role.permissions?.length || 0} Action Permissions
                  </span>
                </div>

                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Granted Action Permissions:</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(role.permissions || []).map(perm => (
                      <span key={perm} className="bg-slate-50 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold flex items-center space-x-1">
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>{perm}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REGISTER / EDIT USER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 sm:p-6 overflow-y-auto">
          <form 
            onSubmit={handleSaveUser} 
            className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl my-auto shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 font-heading">
                    {editingUser ? 'Edit User Specifications' : 'Register New User Account'}
                  </h3>
                  <p className="text-xs text-slate-500">Configure employee codes, corporate roles, reporting managers & approval limits</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => { setShowCreateModal(false); setEditingUser(null); }}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-200/50 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Employee Code <span className="text-slate-400 font-normal">(Leave blank for auto-gen)</span></label>
                  <input 
                    type="text" 
                    value={formData.emp_code} 
                    onBlur={() => setTouched({ ...touched, emp_code: true })}
                    onChange={e => setFormData({ ...formData, emp_code: e.target.value })} 
                    placeholder="EMP-008" 
                    className={`w-full bg-slate-50 border ${touched.emp_code && errors.emp_code ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'} rounded-xl px-3 py-2 text-slate-800 font-mono focus:bg-white focus:outline-none focus:border-purple-500`} 
                  />
                  {touched.emp_code && errors.emp_code && (
                    <p className="text-[10px] text-rose-600 mt-1 font-semibold">{errors.emp_code}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">Full Name <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    value={formData.name} 
                    onBlur={() => setTouched({ ...touched, name: true })}
                    onChange={e => setFormData({ ...formData, name: e.target.value })} 
                    placeholder="Dr. Ananya Roy" 
                    className={`w-full bg-slate-50 border ${touched.name && errors.name ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'} rounded-xl px-3 py-2 text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-purple-500`} 
                  />
                  {touched.name && errors.name && (
                    <p className="text-[11px] text-rose-600 mt-1 font-semibold flex items-center"><AlertTriangle className="w-3 h-3 mr-1" />{errors.name}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Email Address <span className="text-rose-500">*</span></label>
                  <input 
                    type="email" 
                    value={formData.email} 
                    onBlur={() => setTouched({ ...touched, email: true })}
                    onChange={e => setFormData({ ...formData, email: e.target.value })} 
                    placeholder="deptmgr@company.com" 
                    className={`w-full bg-slate-50 border ${touched.email && errors.email ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'} rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-purple-500`} 
                  />
                  {touched.email && errors.email && (
                    <p className="text-[10px] text-rose-600 mt-1 font-semibold">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Mobile Number</label>
                  <input 
                    type="text" 
                    value={formData.phone} 
                    onChange={e => setFormData({ ...formData, phone: e.target.value })} 
                    placeholder="+91 98765 43210" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono focus:bg-white focus:outline-none focus:border-purple-500" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">System Role</label>
                  <select 
                    value={formData.role_id} 
                    onChange={e => {
                      const r = roles.find(role => role.id === e.target.value);
                      setFormData({ ...formData, role_id: e.target.value, role_name: r?.name || 'Employee or Requester' });
                    }} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-purple-500"
                  >
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Assigned Department</label>
                  <select 
                    value={formData.department_name} 
                    onChange={e => setFormData({ ...formData, department_name: e.target.value })} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Information Technology">Information Technology</option>
                    <option value="Procurement & Purchasing">Procurement & Purchasing</option>
                    <option value="Warehouse Operations">Warehouse Operations</option>
                    <option value="Finance & Accounts">Finance & Accounts</option>
                    <option value="Plant Maintenance & Engineering">Plant Maintenance & Engineering</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Reporting Manager</label>
                  <input 
                    type="text" 
                    value={formData.reporting_manager} 
                    onChange={e => setFormData({ ...formData, reporting_manager: e.target.value })} 
                    placeholder="Sarah Jenkins" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-purple-500" 
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Financial Approval Limit (₹)</label>
                  <input 
                    type="number" 
                    min="0"
                    value={formData.approval_limit} 
                    onChange={e => setFormData({ ...formData, approval_limit: Number(e.target.value) })} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-emerald-700 font-mono font-bold focus:bg-white focus:outline-none focus:border-purple-500" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Active Account Status</label>
                <select 
                  value={formData.is_active ? 'Active' : 'Inactive'} 
                  onChange={e => setFormData({ ...formData, is_active: e.target.value === 'Active' })} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-purple-500"
                >
                  <option value="Active">Active Account</option>
                  <option value="Inactive">Inactive / Suspended</option>
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
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> User details configured cleanly.
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <button 
                  type="button" 
                  onClick={() => { setShowCreateModal(false); setEditingUser(null); }} 
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  {editingUser ? 'Update User Account' : 'Save User Account'}
                </button>
              </div>
            </div>

          </form>
        </div>
      )}

      {/* VIEW EFFECTIVE PERMISSIONS MODAL */}
      {showPermissionsModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">{showPermissionsModal.name}</h3>
                  <p className="text-xs text-slate-500">Role: <span className="font-bold text-purple-700">{showPermissionsModal.role_name}</span> | Emp Code: <span className="font-mono font-bold text-slate-800">{showPermissionsModal.emp_code}</span></p>
                </div>
              </div>
              <button type="button" onClick={() => setShowPermissionsModal(null)} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 grid grid-cols-2 gap-2 font-mono">
                <div><span className="text-slate-400 text-[10px] font-sans font-bold block">Department</span><strong className="text-slate-900">{showPermissionsModal.department_name}</strong></div>
                <div><span className="text-slate-400 text-[10px] font-sans font-bold block">Approval Limit</span><strong className="text-emerald-700 font-bold">₹{(showPermissionsModal.approval_limit || 0).toLocaleString()}</strong></div>
              </div>

              <div>
                <h4 className="font-bold text-xs text-slate-800 mb-2 uppercase tracking-wider">Granted Action-Based Permissions:</h4>
                <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                  {((roles.find(r => r.id === showPermissionsModal.role_id) || {}).permissions || ['item.view', 'indent.create', 'indent.view']).map(p => (
                    <span key={p} className="bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-xs font-mono text-purple-700 font-bold flex items-center space-x-1 shadow-2xs">
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>{p}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button type="button" onClick={() => setShowPermissionsModal(null)} className="px-4 py-2 bg-slate-100 text-slate-800 font-bold text-xs rounded-xl">Close Drawer</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center font-bold shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Confirm Delete User Account</h3>
                <p className="text-xs font-mono text-purple-700 font-bold">{deleteConfirmUser.emp_code}</p>
              </div>
            </div>

            <div className="p-3.5 bg-rose-50/80 border border-rose-200 rounded-xl text-xs text-rose-900 space-y-1">
              <p className="font-bold">Permanent Account Removal Notice:</p>
              <p>Are you sure you want to delete user account <strong>{deleteConfirmUser.name}</strong> ({deleteConfirmUser.email})?</p>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button type="button" onClick={() => setDeleteConfirmUser(null)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">Cancel</button>
              <button type="button" onClick={handleDeleteUserConfirm} className="px-5 py-2 bg-rose-600 text-white font-bold text-xs rounded-xl">Delete User</button>
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
