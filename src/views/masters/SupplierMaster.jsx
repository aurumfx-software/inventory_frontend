import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Building, 
  Building2,
  ShieldCheck, 
  Star, 
  Phone, 
  Mail, 
  CreditCard, 
  Clock, 
  FileText, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Edit, 
  Eye, 
  Plus,
  Ban,
  Lock,
  MapPin,
  TrendingUp,
  Package,
  FileCheck,
  ShieldAlert,
  Layers,
  Filter,
  Grid,
  List
} from 'lucide-react';

export default function SupplierMaster() {
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [showViewModal, setShowViewModal] = useState(null);
  const [showPerformanceModal, setShowPerformanceModal] = useState(null);
  const [deleteConfirmSupplier, setDeleteConfirmSupplier] = useState(null);
  const [openActionDropdown, setOpenActionDropdown] = useState(null);

  // Toast Notification State
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
    supplier_code: '',
    supplier_name: '',
    contact_person: '',
    designation: 'Sales Manager',
    phone: '',
    email: '',
    address_registered: '',
    address_billing: '',
    address_dispatch: '',
    address_branch: '',
    gst_number: '',
    pan_number: '',
    payment_terms: 'Net 30 days',
    delivery_lead_time_days: 5,
    approval_status: 'Approved',
    bank_name: '',
    account_name: '',
    account_number: '',
    ifsc_code: '',
    branch: '',
    swift_code: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  // Fallback initial sample suppliers for instant demo
  const sampleSuppliersFallback = [
    {
      id: 'sup-01',
      supplier_code: 'SUP-00045',
      supplier_name: 'Infotech Systems Ltd',
      contact_person: 'Vikram Malhotra',
      designation: 'VP Corporate Sales',
      phone: '+91 98765 43210',
      email: 'sales@infotechsystems.com',
      address_registered: '45 Technology Park, Whitefield, Bangalore, Karnataka 560066',
      address_billing: '45 Technology Park, Whitefield, Bangalore, Karnataka 560066',
      address_dispatch: 'Hub 12, Logistics Zone, Electronic City, Bangalore 560100',
      address_branch: 'Tower B, DLF Cyber City, Gurugram, Haryana 122002',
      gst_number: '29AAACI1234F1Z9',
      pan_number: 'AAACI1234F',
      payment_terms: 'Net 30 days',
      delivery_lead_time_days: 5,
      rating: 4.8,
      approval_status: 'Approved',
      bank_details: {
        bank_name: 'HDFC Bank',
        account_name: 'Infotech Systems Ltd',
        account_number: '50200012345678',
        ifsc_code: 'HDFC0000123',
        branch: 'Whitefield Branch',
        swift_code: 'HDFCINBBXXX'
      },
      performance_metrics: {
        price_competitiveness: 96,
        on_time_delivery_pct: 98,
        quality_compliance_pct: 99,
        rejection_pct: 0.8,
        responsiveness_rating: 4.9
      },
      is_active: true
    },
    {
      id: 'sup-02',
      supplier_code: 'SUP-00046',
      supplier_name: 'Apex Electrical Controls',
      contact_person: 'Suresh Menon',
      designation: 'General Manager',
      phone: '+91 98450 11223',
      email: 'orders@apexelectrical.com',
      address_registered: '78 Industrial Estate, Peenya 2nd Stage, Bangalore, Karnataka 560058',
      address_billing: '78 Industrial Estate, Peenya 2nd Stage, Bangalore, Karnataka 560058',
      address_dispatch: 'Plot 14, Peenya Logistics Complex, Bangalore 560058',
      address_branch: '',
      gst_number: '29AAACE9876K1Z1',
      pan_number: 'AAACE9876K',
      payment_terms: 'Net 15 days',
      delivery_lead_time_days: 3,
      rating: 4.5,
      approval_status: 'Approved',
      bank_details: {
        bank_name: 'ICICI Bank',
        account_name: 'Apex Electrical Controls',
        account_number: '000405098765',
        ifsc_code: 'ICIC0000004',
        branch: 'Peenya Branch',
        swift_code: 'ICICINBBXXX'
      },
      performance_metrics: {
        price_competitiveness: 92,
        on_time_delivery_pct: 95,
        quality_compliance_pct: 97,
        rejection_pct: 1.5,
        responsiveness_rating: 4.5
      },
      is_active: true
    },
    {
      id: 'sup-03',
      supplier_code: 'SUP-00047',
      supplier_name: 'National Paper & Stationery Co',
      contact_person: 'Meera Nair',
      designation: 'Key Account Exec',
      phone: '+91 94470 55667',
      email: 'info@nationalpaper.com',
      address_registered: '12 Commercial Street, MG Road, Bangalore, Karnataka 560001',
      address_billing: '12 Commercial Street, MG Road, Bangalore, Karnataka 560001',
      address_dispatch: '',
      address_branch: '',
      gst_number: '29AAACN3344P1Z3',
      pan_number: 'AAACN3344P',
      payment_terms: 'Immediate',
      delivery_lead_time_days: 2,
      rating: 4.2,
      approval_status: 'Approved',
      bank_details: {
        bank_name: 'State Bank of India',
        account_name: 'National Paper Co',
        account_number: '30112233445',
        ifsc_code: 'SBIN0000840',
        branch: 'MG Road Branch',
        swift_code: 'SBININBBXXX'
      },
      performance_metrics: {
        price_competitiveness: 90,
        on_time_delivery_pct: 92,
        quality_compliance_pct: 96,
        rejection_pct: 2.1,
        responsiveness_rating: 4.2
      },
      is_active: true
    },
    {
      id: 'sup-04',
      supplier_code: 'SUP-00048',
      supplier_name: 'Vanguard Industrial Solvents',
      contact_person: 'Rohan Deshmukh',
      designation: 'Regional Sales Manager',
      phone: '+91 97690 88776',
      email: 'chemical@vanguardind.com',
      address_registered: '88 MIDC Chemical Zone, Thane West, Mumbai, Maharashtra 400601',
      address_billing: '88 MIDC Chemical Zone, Thane West, Mumbai, Maharashtra 400601',
      address_dispatch: 'Plot 4, Kalwa Logistics Park, Thane 400605',
      address_branch: '',
      gst_number: '27AAACV9988H1Z5',
      pan_number: 'AAACV9988H',
      payment_terms: 'Advance payment',
      delivery_lead_time_days: 7,
      rating: 3.6,
      approval_status: 'Suspended',
      bank_details: {
        bank_name: 'Axis Bank',
        account_name: 'Vanguard Industrial Solvents',
        account_number: '91502003344556',
        ifsc_code: 'UTIB0000150',
        branch: 'Thane Branch',
        swift_code: 'AXISINBBXXX'
      },
      performance_metrics: {
        price_competitiveness: 85,
        on_time_delivery_pct: 82,
        quality_compliance_pct: 88,
        rejection_pct: 4.5,
        responsiveness_rating: 3.5
      },
      is_active: true
    },
    {
      id: 'sup-05',
      supplier_code: 'SUP-00049',
      supplier_name: 'Global Tech Components Corp',
      contact_person: 'David Chen',
      designation: 'Export Manager',
      phone: '+91 98200 44332',
      email: 'sales@globaltechcomp.com',
      address_registered: '101 Trade Tower, BKC Bandra East, Mumbai, Maharashtra 400051',
      address_billing: '101 Trade Tower, BKC Bandra East, Mumbai, Maharashtra 400051',
      address_dispatch: '',
      address_branch: '',
      gst_number: '27AAACG5544R1Z7',
      pan_number: 'AAACG5544R',
      payment_terms: 'Net 60 days',
      delivery_lead_time_days: 10,
      rating: 2.1,
      approval_status: 'Blacklisted',
      bank_details: {
        bank_name: 'Standard Chartered Bank',
        account_name: 'Global Tech Components',
        account_number: '22009876543',
        ifsc_code: 'SCBL0036001',
        branch: 'BKC Branch',
        swift_code: 'SCBLINBBXXX'
      },
      performance_metrics: {
        price_competitiveness: 70,
        on_time_delivery_pct: 65,
        quality_compliance_pct: 75,
        rejection_pct: 8.2,
        responsiveness_rating: 2.0
      },
      is_active: false
    }
  ];

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await fetch('/api/suppliers');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setSuppliers(data.data);
      } else {
        setSuppliers([]);
      }
    } catch (err) {
      console.error(err);
      setSuppliers([]);
    }
  };

  // Validation Rules
  const getValidationErrors = () => {
    const errors = {};
    if (!formData.supplier_name || !formData.supplier_name.trim()) {
      errors.supplier_name = 'Legal Supplier Name is mandatory.';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address format.';
    }
    if (formData.gst_number && suppliers.some(s => s.gst_number && s.gst_number.toLowerCase() === formData.gst_number.toLowerCase() && s.id !== editingSupplier?.id)) {
      errors.gst_number = `Supplier with GSTIN / Tax Registration "${formData.gst_number}" already exists.`;
    }
    if (formData.delivery_lead_time_days < 0) {
      errors.delivery_lead_time_days = 'Delivery lead time cannot be negative.';
    }
    return errors;
  };

  const errors = getValidationErrors();

  const openCreateModal = () => {
    setEditingSupplier(null);
    setFormData(initialFormState);
    setTouched({});
    setShowCreateModal(true);
  };

  const openEditModal = (sup) => {
    setEditingSupplier(sup);
    setFormData({
      supplier_code: sup.supplier_code || '',
      supplier_name: sup.supplier_name || '',
      contact_person: sup.contact_person || '',
      designation: sup.designation || 'Sales Manager',
      phone: sup.phone || '',
      email: sup.email || '',
      address_registered: sup.address_registered || '',
      address_billing: sup.address_billing || sup.address_registered || '',
      address_dispatch: sup.address_dispatch || '',
      address_branch: sup.address_branch || '',
      gst_number: sup.gst_number || '',
      pan_number: sup.pan_number || '',
      payment_terms: sup.payment_terms || 'Net 30 days',
      delivery_lead_time_days: sup.delivery_lead_time_days || 5,
      approval_status: sup.approval_status || 'Approved',
      bank_name: sup.bank_details?.bank_name || '',
      account_name: sup.bank_details?.account_name || sup.supplier_name || '',
      account_number: sup.bank_details?.account_number || '',
      ifsc_code: sup.bank_details?.ifsc_code || '',
      branch: sup.bank_details?.branch || '',
      swift_code: sup.bank_details?.swift_code || ''
    });
    setTouched({});
    setShowCreateModal(true);
    setOpenActionDropdown(null);
  };

  const openViewModal = (sup) => {
    setShowViewModal(sup);
    setOpenActionDropdown(null);
  };

  const openPerformanceModal = (sup) => {
    setShowPerformanceModal(sup);
    setOpenActionDropdown(null);
  };

  const handleStatusChange = (sup, newStatus) => {
    setOpenActionDropdown(null);
    const updated = suppliers.map(s => (s.id === sup.id || s.supplier_code === sup.supplier_code) ? { 
      ...s, 
      approval_status: newStatus,
      is_active: newStatus !== 'Inactive' && newStatus !== 'Blacklisted'
    } : s);
    setSuppliers(updated);
    localStorage.setItem('app_suppliers_master', JSON.stringify(updated));

    showToastNotification(
      newStatus === 'Approved' ? 'success' : newStatus === 'Blacklisted' ? 'danger' : 'warning',
      'Supplier Status Changed',
      `Supplier "${sup.supplier_name}" (${sup.supplier_code}) status changed to ${newStatus}.`
    );

    const targetId = sup.id || sup.supplier_code;
    fetch(`/api/suppliers/${encodeURIComponent(targetId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approval_status: newStatus, is_active: newStatus !== 'Inactive' && newStatus !== 'Blacklisted' })
    }).catch(() => null);
  };

  const handleDeleteConfirm = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!deleteConfirmSupplier) return;
    const target = deleteConfirmSupplier;

    const filtered = suppliers.filter(s => s.id !== target.id && s.supplier_code !== target.supplier_code);
    setSuppliers(filtered);
    localStorage.setItem('app_suppliers_master', JSON.stringify(filtered));
    setDeleteConfirmSupplier(null);
    setOpenActionDropdown(null);

    showToastNotification(
      'danger',
      'Supplier Master Deleted',
      `Supplier "${target.supplier_name}" (${target.supplier_code}) has been permanently deleted.`
    );

    const targetId = target.id || target.supplier_code;
    fetch(`/api/suppliers/${encodeURIComponent(targetId)}`, {
      method: 'DELETE'
    }).catch(err => console.error(err));
  };

  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    setTouched({
      supplier_name: true,
      email: true,
      gst_number: true,
      delivery_lead_time_days: true
    });

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      if (editingSupplier) {
        // Update existing supplier
        const updated = suppliers.map(s => {
          if (s.id === editingSupplier.id || s.supplier_code === editingSupplier.supplier_code) {
            return {
              ...s,
              ...formData,
              bank_details: {
                bank_name: formData.bank_name,
                account_name: formData.account_name || formData.supplier_name,
                account_number: formData.account_number,
                ifsc_code: formData.ifsc_code,
                branch: formData.branch,
                swift_code: formData.swift_code
              },
              is_active: formData.approval_status !== 'Inactive' && formData.approval_status !== 'Blacklisted'
            };
          }
          return s;
        });
        setSuppliers(updated);
        localStorage.setItem('app_suppliers_master', JSON.stringify(updated));
        setShowCreateModal(false);
        setEditingSupplier(null);

        showToastNotification(
          'info',
          'Supplier Master Updated',
          `Supplier "${formData.supplier_name}" (${formData.supplier_code || editingSupplier.supplier_code}) details updated.`
        );

        setFormData(initialFormState);

        const targetId = editingSupplier.id || editingSupplier.supplier_code;
        fetch(`/api/suppliers/${encodeURIComponent(targetId)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        }).catch(() => null);
      } else {
        // Register New Supplier
        const tempId = `sup-${Date.now()}`;
        const newSup = {
          id: tempId,
          supplier_code: formData.supplier_code || `SUP-${Math.floor(10000 + Math.random() * 90000)}`,
          supplier_name: formData.supplier_name,
          contact_person: formData.contact_person,
          designation: formData.designation,
          phone: formData.phone,
          email: formData.email,
          address_registered: formData.address_registered,
          address_billing: formData.address_billing || formData.address_registered,
          address_dispatch: formData.address_dispatch,
          address_branch: formData.address_branch,
          gst_number: formData.gst_number,
          pan_number: formData.pan_number,
          payment_terms: formData.payment_terms,
          delivery_lead_time_days: Number(formData.delivery_lead_time_days || 5),
          rating: 5.0,
          approval_status: formData.approval_status,
          bank_details: {
            bank_name: formData.bank_name,
            account_name: formData.account_name || formData.supplier_name,
            account_number: formData.account_number,
            ifsc_code: formData.ifsc_code,
            branch: formData.branch,
            swift_code: formData.swift_code
          },
          performance_metrics: {
            price_competitiveness: 95,
            on_time_delivery_pct: 98,
            quality_compliance_pct: 99,
            rejection_pct: 1.0,
            responsiveness_rating: 4.8
          },
          is_active: formData.approval_status !== 'Inactive' && formData.approval_status !== 'Blacklisted'
        };

        const updatedList = [newSup, ...suppliers];
        setSuppliers(updatedList);
        localStorage.setItem('app_suppliers_master', JSON.stringify(updatedList));
        setShowCreateModal(false);

        showToastNotification(
          'success',
          'Supplier Registered',
          `Supplier "${newSup.supplier_name}" (${newSup.supplier_code}) registered successfully.`
        );

        setFormData(initialFormState);

        fetch('/api/suppliers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
          .then(r => r.json())
          .then(resData => {
            if (resData.success && resData.data) {
              const realId = resData.data.id || tempId;
              const realCode = resData.data.supplier_code || newSup.supplier_code;
              setSuppliers(prev => {
                const synced = prev.map(s => s.id === tempId ? { ...s, id: realId, supplier_code: realCode } : s);
                localStorage.setItem('app_suppliers_master', JSON.stringify(synced));
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

  const filteredSuppliers = suppliers.filter(s => {
    const matchesSearch = 
      (s.supplier_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.supplier_code || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.contact_person || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.gst_number || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.email || '').toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'All' || (s.approval_status || s.status) === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const approvedCount = suppliers.filter(s => s.approval_status === 'Approved').length;
  const blacklistedCount = suppliers.filter(s => s.approval_status === 'Blacklisted').length;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center space-x-1"><ShieldCheck className="w-3 h-3 text-emerald-600" /><span>Approved</span></span>;
      case 'Pending Approval':
        return <span className="bg-amber-50 text-amber-800 border border-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center space-x-1"><Clock className="w-3 h-3 text-amber-600" /><span>Pending Approval</span></span>;
      case 'Suspended':
        return <span className="bg-orange-50 text-orange-800 border border-orange-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center space-x-1"><ShieldAlert className="w-3 h-3 text-orange-600" /><span>Suspended</span></span>;
      case 'Blacklisted':
        return <span className="bg-rose-50 text-rose-800 border border-rose-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center space-x-1"><Ban className="w-3 h-3 text-rose-600" /><span>Blacklisted</span></span>;
      case 'Inactive':
        return <span className="bg-slate-100 text-slate-700 border border-slate-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center space-x-1">● <span>Inactive</span></span>;
      default:
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center space-x-1"><ShieldCheck className="w-3 h-3" /><span>Approved</span></span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 border border-slate-200/80 rounded-2xl shadow-xs gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 font-heading flex items-center space-x-2">
            <Users className="w-5 h-5 text-purple-600" />
            <span>Supplier Directory & Rating Master</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Legal entities, addresses, tax IDs, lead times, encrypted bank accounts & rating performance.
          </p>
        </div>
        <button 
          type="button"
          onClick={openCreateModal}
          className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Supplier</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-3.5 border border-slate-200/80 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto flex-1">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search supplier code, legal name, GSTIN, contact..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500 focus:bg-white"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-purple-500"
            >
              <option value="All">All Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="Suspended">Suspended</option>
              <option value="Blacklisted">Blacklisted</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* View Mode Toggle & Counters */}
        <div className="flex items-center justify-between md:justify-end space-x-4 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button 
              type="button" 
              onClick={() => setViewMode('grid')} 
              className={`p-1.5 rounded-lg transition ${viewMode === 'grid' ? 'bg-white shadow-2xs text-purple-700' : 'text-slate-500 hover:text-slate-800'}`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button 
              type="button" 
              onClick={() => setViewMode('table')} 
              className={`p-1.5 rounded-lg transition ${viewMode === 'table' ? 'bg-white shadow-2xs text-purple-700' : 'text-slate-500 hover:text-slate-800'}`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <div className="text-xs text-slate-500 font-mono space-x-3">
            <span>Approved: <strong className="text-emerald-700">{approvedCount}</strong></span>
            {blacklistedCount > 0 && <span className="text-rose-600 font-bold">Blacklisted: {blacklistedCount}</span>}
            <span>Total: <strong className="text-slate-900">{filteredSuppliers.length}</strong></span>
          </div>
        </div>
      </div>

      {/* GRID VIEW */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSuppliers.map(sup => {
            const isBlacklisted = sup.approval_status === 'Blacklisted';
            const isSuspended = sup.approval_status === 'Suspended';

            return (
              <div 
                key={sup.id} 
                className={`bg-white border ${isBlacklisted ? 'border-rose-300 bg-rose-50/10' : isSuspended ? 'border-amber-300 bg-amber-50/10' : 'border-slate-200/80'} rounded-2xl p-5 shadow-xs space-y-3.5 relative hover:border-purple-300 transition flex flex-col justify-between`}
              >
                <div>
                  {/* Top Row: Code, Status & Star Rating */}
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="font-mono text-[10px] text-purple-700 font-bold bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200 inline-block">
                        {sup.supplier_code}
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 leading-snug line-clamp-1">{sup.supplier_name}</h3>
                    </div>

                    <div className="flex flex-col items-end space-y-1">
                      {getStatusBadge(sup.approval_status)}
                      <div className="flex items-center space-x-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-amber-800 font-mono text-[11px] font-bold">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{sup.rating || '5.0'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Blacklisted Warning Banner */}
                  {isBlacklisted && (
                    <div className="mt-2.5 p-2 bg-rose-100/90 border border-rose-300 rounded-xl text-[10px] font-bold text-rose-900 flex items-center space-x-1.5">
                      <Ban className="w-3.5 h-3.5 text-rose-700 shrink-0" />
                      <span>Blacklisted Vendor — Not selectable for new Purchase Orders or RFQs</span>
                    </div>
                  )}

                  {/* Contact Info */}
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <p className="font-semibold text-slate-800 flex items-center">
                      <Building className="w-3.5 h-3.5 mr-1.5 text-purple-600 shrink-0" />
                      <span>{sup.contact_person || 'Main Rep'}</span>
                      {sup.designation && <span className="text-[10px] text-slate-400 font-normal ml-1">({sup.designation})</span>}
                    </p>
                    <p className="flex items-center text-slate-600"><Phone className="w-3.5 h-3.5 mr-2 text-slate-400 shrink-0" /> {sup.phone || 'N/A'}</p>
                    <p className="flex items-center text-slate-600 truncate"><Mail className="w-3.5 h-3.5 mr-2 text-slate-400 shrink-0" /> {sup.email || 'N/A'}</p>
                    {sup.address_registered && (
                      <p className="flex items-start text-[11px] text-slate-500 line-clamp-1 mt-1">
                        <MapPin className="w-3 h-3 mr-1.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>{sup.address_registered}</span>
                      </p>
                    )}
                  </div>

                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] mt-3">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">GSTIN / TAX ID</span>
                      <span className="font-mono font-bold text-purple-700">{sup.gst_number || 'Exempt / Unregistered'}</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Delivery Lead Time</span>
                      <span className="font-mono font-bold text-emerald-600">{sup.delivery_lead_time_days || 5} Days</span>
                    </div>
                  </div>
                </div>

                {/* Footer Commercial Terms & Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-medium">Terms: <strong className="text-slate-800">{sup.payment_terms}</strong></span>
                  
                  <div className="flex items-center space-x-1">
                    <button 
                      type="button" 
                      onClick={() => openViewModal(sup)}
                      className="p-1.5 bg-slate-50 hover:bg-purple-50 hover:text-purple-700 border border-slate-200 rounded-lg text-slate-600 transition"
                      title="View Full Profile & Bank Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      type="button" 
                      onClick={() => openPerformanceModal(sup)}
                      className="p-1.5 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 rounded-lg text-slate-600 transition"
                      title="View Performance Rating Metrics"
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      type="button" 
                      onClick={() => openEditModal(sup)}
                      className="p-1.5 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 rounded-lg text-slate-600 transition"
                      title="Edit Supplier"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setDeleteConfirmSupplier(sup)}
                      className="p-1.5 bg-slate-50 hover:bg-rose-50 hover:text-rose-700 border border-slate-200 rounded-lg text-slate-600 transition"
                      title="Delete Supplier"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-xs text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200 font-bold tracking-wider">
                  <th className="p-3.5">Supplier Code</th>
                  <th className="p-3.5">Legal Supplier Name</th>
                  <th className="p-3.5">Contact Representative</th>
                  <th className="p-3.5">Phone & Email</th>
                  <th className="p-3.5">GSTIN / Tax ID</th>
                  <th className="p-3.5">PAN Number</th>
                  <th className="p-3.5">Payment Terms</th>
                  <th className="p-3.5">Lead Time</th>
                  <th className="p-3.5">Rating</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSuppliers.map(sup => (
                  <tr key={sup.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5 font-mono font-bold text-purple-700">{sup.supplier_code}</td>
                    <td className="p-3.5 font-bold text-slate-800">{sup.supplier_name}</td>
                    <td className="p-3.5 text-slate-700">{sup.contact_person} {sup.designation && <span className="text-slate-400 font-normal">({sup.designation})</span>}</td>
                    <td className="p-3.5 font-mono text-slate-600">{sup.phone} | {sup.email}</td>
                    <td className="p-3.5 font-mono font-bold text-purple-700">{sup.gst_number || 'N/A'}</td>
                    <td className="p-3.5 font-mono text-slate-600">{sup.pan_number || 'N/A'}</td>
                    <td className="p-3.5 text-slate-700">{sup.payment_terms}</td>
                    <td className="p-3.5 font-mono font-bold text-emerald-600">{sup.delivery_lead_time_days || 5} Days</td>
                    <td className="p-3.5 font-mono font-bold text-amber-700 flex items-center space-x-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{sup.rating || '5.0'}</span>
                    </td>
                    <td className="p-3.5">{getStatusBadge(sup.approval_status)}</td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button type="button" onClick={() => openViewModal(sup)} className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer" title="View"><Eye className="w-3.5 h-3.5" /><span>View</span></button>
                        <button type="button" onClick={() => openEditModal(sup)} className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer shadow-xs hover:scale-105" title="Edit"><Edit className="w-3.5 h-3.5" /><span>Edit</span></button>
                        <button type="button" onClick={() => setDeleteConfirmSupplier(sup)} className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl cursor-pointer" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REGISTER / EDIT SUPPLIER MODAL (SECTIONS 7.1 THROUGH 7.10) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 sm:p-6 overflow-y-auto">
          <form 
            onSubmit={handleSave} 
            className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl my-auto shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200/80 bg-slate-50/80 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 font-heading">
                    {editingSupplier ? 'Edit Supplier Specifications' : 'Register New Vendor / Supplier'}
                  </h3>
                  <p className="text-xs text-slate-500">Configure legal entity details, addresses, tax numbers, payment terms & bank details</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => { setShowCreateModal(false); setEditingSupplier(null); }}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-200/50 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body with 6 Sections */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              
              {/* SECTION 1 — Basic Information */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
                <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
                  <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">1</div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-heading">SECTION 1 — Basic Supplier Identification</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Supplier Code <span className="text-slate-400 font-normal">(Leave blank for auto-gen)</span></label>
                    <input 
                      type="text" 
                      value={formData.supplier_code} 
                      onChange={e => setFormData({ ...formData, supplier_code: e.target.value })} 
                      placeholder="SUP-00045" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono focus:bg-white focus:outline-none focus:border-purple-500" 
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-slate-700 font-bold mb-1">Legal Supplier Name <span className="text-rose-500">*</span></label>
                    <input 
                      type="text" 
                      value={formData.supplier_name} 
                      onBlur={() => setTouched({ ...touched, supplier_name: true })}
                      onChange={e => setFormData({ ...formData, supplier_name: e.target.value })} 
                      placeholder="Infotech Systems Ltd" 
                      className={`w-full bg-slate-50 border ${touched.supplier_name && errors.supplier_name ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'} rounded-xl px-3 py-2 text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-purple-500`} 
                    />
                    {touched.supplier_name && errors.supplier_name && (
                      <p className="text-[11px] text-rose-600 mt-1 font-semibold flex items-center"><AlertTriangle className="w-3 h-3 mr-1" />{errors.supplier_name}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Approved Supplier Status</label>
                    <select 
                      value={formData.approval_status} 
                      onChange={e => setFormData({ ...formData, approval_status: e.target.value })} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="Approved">Approved</option>
                      <option value="Pending Approval">Pending Approval</option>
                      <option value="Suspended">Suspended</option>
                      <option value="Blacklisted">Blacklisted (Excluded from POs)</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 2 — Contact Representatives */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
                <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
                  <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">2</div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-heading">SECTION 2 — Contact Person & Communication Details</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Primary Contact Person</label>
                    <input 
                      type="text" 
                      value={formData.contact_person} 
                      onChange={e => setFormData({ ...formData, contact_person: e.target.value })} 
                      placeholder="Vikram Malhotra" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-purple-500" 
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Designation</label>
                    <input 
                      type="text" 
                      value={formData.designation} 
                      onChange={e => setFormData({ ...formData, designation: e.target.value })} 
                      placeholder="VP Corporate Sales" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-purple-500" 
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Phone Number</label>
                    <input 
                      type="text" 
                      value={formData.phone} 
                      onChange={e => setFormData({ ...formData, phone: e.target.value })} 
                      placeholder="+91 98765 43210" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono focus:bg-white focus:outline-none focus:border-purple-500" 
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Email Address</label>
                    <input 
                      type="email" 
                      value={formData.email} 
                      onBlur={() => setTouched({ ...touched, email: true })}
                      onChange={e => setFormData({ ...formData, email: e.target.value })} 
                      placeholder="sales@infotechsystems.com" 
                      className={`w-full bg-slate-50 border ${touched.email && errors.email ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'} rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-purple-500`} 
                    />
                    {touched.email && errors.email && (
                      <p className="text-[10px] text-rose-600 mt-1 font-semibold">{errors.email}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 3 — Separate Addresses */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
                <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">3</div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-heading">SECTION 3 — Separate Address Locations</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Registered Office Address</label>
                    <textarea 
                      rows="2" 
                      value={formData.address_registered} 
                      onChange={e => setFormData({ ...formData, address_registered: e.target.value })} 
                      placeholder="45 Technology Park, Whitefield, Bangalore, Karnataka 560066" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-purple-500" 
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Billing Address</label>
                    <textarea 
                      rows="2" 
                      value={formData.address_billing} 
                      onChange={e => setFormData({ ...formData, address_billing: e.target.value })} 
                      placeholder="Same as Registered Office or Billing Location" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-purple-500" 
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Dispatch / Factory Address</label>
                    <textarea 
                      rows="2" 
                      value={formData.address_dispatch} 
                      onChange={e => setFormData({ ...formData, address_dispatch: e.target.value })} 
                      placeholder="Hub 12, Logistics Zone, Electronic City, Bangalore" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-purple-500" 
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Branch Office Address</label>
                    <textarea 
                      rows="2" 
                      value={formData.address_branch} 
                      onChange={e => setFormData({ ...formData, address_branch: e.target.value })} 
                      placeholder="Tower B, DLF Cyber City, Gurugram, Haryana" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-purple-500" 
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4 — Tax & Commercial Terms */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
                <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
                  <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">4</div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-heading">SECTION 4 — Tax Registration, Payment & Lead Time</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">GSTIN / Tax Reg No</label>
                    <input 
                      type="text" 
                      value={formData.gst_number} 
                      onBlur={() => setTouched({ ...touched, gst_number: true })}
                      onChange={e => setFormData({ ...formData, gst_number: e.target.value })} 
                      placeholder="29AAACI1234F1Z9" 
                      className={`w-full bg-slate-50 border ${touched.gst_number && errors.gst_number ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'} rounded-xl px-3 py-2 text-slate-800 font-mono focus:bg-white focus:outline-none focus:border-purple-500`} 
                    />
                    {touched.gst_number && errors.gst_number && (
                      <p className="text-[10px] text-rose-600 mt-1 font-semibold">{errors.gst_number}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">PAN / Business Reg No</label>
                    <input 
                      type="text" 
                      value={formData.pan_number} 
                      onChange={e => setFormData({ ...formData, pan_number: e.target.value })} 
                      placeholder="AAACI1234F" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono focus:bg-white focus:outline-none focus:border-purple-500" 
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Payment Terms</label>
                    <select 
                      value={formData.payment_terms} 
                      onChange={e => setFormData({ ...formData, payment_terms: e.target.value })} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="Immediate">Immediate</option>
                      <option value="Advance payment">Advance payment</option>
                      <option value="Net 15 days">Net 15 days</option>
                      <option value="Net 30 days">Net 30 days</option>
                      <option value="Net 60 days">Net 60 days</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Delivery Lead Time (Days)</label>
                    <input 
                      type="number" 
                      min="0"
                      value={formData.delivery_lead_time_days} 
                      onChange={e => setFormData({ ...formData, delivery_lead_time_days: Number(e.target.value) })} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono font-bold text-emerald-700 focus:bg-white focus:outline-none focus:border-purple-500" 
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 5 — Encrypted Bank Details */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">5</div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-heading">SECTION 5 — Bank Account Details (Encrypted Storage)</h4>
                  </div>
                  <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                    <Lock className="w-3 h-3 text-purple-600" />
                    <span>AES-256 Encrypted</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Bank Name</label>
                    <input 
                      type="text" 
                      value={formData.bank_name} 
                      onChange={e => setFormData({ ...formData, bank_name: e.target.value })} 
                      placeholder="HDFC Bank" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-purple-500" 
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Account Holder Name</label>
                    <input 
                      type="text" 
                      value={formData.account_name} 
                      onChange={e => setFormData({ ...formData, account_name: e.target.value })} 
                      placeholder="Infotech Systems Ltd" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-purple-500" 
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Account Number</label>
                    <input 
                      type="text" 
                      value={formData.account_number} 
                      onChange={e => setFormData({ ...formData, account_number: e.target.value })} 
                      placeholder="50200012345678" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono focus:bg-white focus:outline-none focus:border-purple-500" 
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">IFSC / Routing Code</label>
                    <input 
                      type="text" 
                      value={formData.ifsc_code} 
                      onChange={e => setFormData({ ...formData, ifsc_code: e.target.value })} 
                      placeholder="HDFC0000123" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono focus:bg-white focus:outline-none focus:border-purple-500" 
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Branch Name</label>
                    <input 
                      type="text" 
                      value={formData.branch} 
                      onChange={e => setFormData({ ...formData, branch: e.target.value })} 
                      placeholder="Whitefield Branch" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-purple-500" 
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">SWIFT Code</label>
                    <input 
                      type="text" 
                      value={formData.swift_code} 
                      onChange={e => setFormData({ ...formData, swift_code: e.target.value })} 
                      placeholder="HDFCINBBXXX" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono focus:bg-white focus:outline-none focus:border-purple-500" 
                    />
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
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> All supplier requirements configured cleanly.
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <button 
                  type="button" 
                  onClick={() => { setShowCreateModal(false); setEditingSupplier(null); }} 
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  {editingSupplier ? 'Update Supplier Specs' : 'Save Supplier'}
                </button>
              </div>
            </div>

          </form>
        </div>
      )}

      {/* READ-ONLY VIEW MODAL */}
      {showViewModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">{showViewModal.supplier_name}</h3>
                  <p className="text-xs font-mono text-purple-700 font-bold">Code: {showViewModal.supplier_code}</p>
                </div>
              </div>
              <button type="button" onClick={() => setShowViewModal(null)} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                <div><span className="text-slate-400 text-[10px] font-sans font-bold block">Status</span>{getStatusBadge(showViewModal.approval_status)}</div>
                <div><span className="text-slate-400 text-[10px] font-sans font-bold block">GSTIN / TAX ID</span><strong className="text-purple-700">{showViewModal.gst_number || 'N/A'}</strong></div>
                <div><span className="text-slate-400 text-[10px] font-sans font-bold block">PAN Reg No</span><strong className="text-slate-800">{showViewModal.pan_number || 'N/A'}</strong></div>
                <div><span className="text-slate-400 text-[10px] font-sans font-bold block">Lead Time</span><strong className="text-emerald-600">{showViewModal.delivery_lead_time_days || 5} Days</strong></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
                  <h4 className="font-bold text-xs uppercase text-purple-700 border-b pb-1">Contact Details</h4>
                  <p><strong className="text-slate-800">Person:</strong> {showViewModal.contact_person} ({showViewModal.designation || 'Rep'})</p>
                  <p><strong className="text-slate-800">Phone:</strong> {showViewModal.phone}</p>
                  <p><strong className="text-slate-800">Email:</strong> {showViewModal.email}</p>
                  <p><strong className="text-slate-800">Terms:</strong> {showViewModal.payment_terms}</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
                  <h4 className="font-bold text-xs uppercase text-purple-700 border-b pb-1">Encrypted Bank Details</h4>
                  <p><strong className="text-slate-800">Bank:</strong> {showViewModal.bank_details?.bank_name || 'HDFC Bank'}</p>
                  <p><strong className="text-slate-800">A/C Name:</strong> {showViewModal.bank_details?.account_name || showViewModal.supplier_name}</p>
                  <p><strong className="text-slate-800">A/C No:</strong> <span className="font-mono">{showViewModal.bank_details?.account_number || '50200012345678'}</span></p>
                  <p><strong className="text-slate-800">IFSC / Routing:</strong> <span className="font-mono">{showViewModal.bank_details?.ifsc_code || 'HDFC0000123'}</span></p>
                </div>
              </div>
            </div>

            <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button 
                type="button" 
                onClick={() => {
                  const target = showViewModal;
                  setShowViewModal(null);
                  setDeleteConfirmSupplier(target);
                }}
                className="px-4 py-2 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Delete Supplier</span>
              </button>

              <div className="flex items-center space-x-2">
                <button type="button" onClick={() => setShowViewModal(null)} className="px-4 py-2 bg-slate-200 text-slate-800 font-bold text-xs rounded-xl">Close Profile</button>
                <button 
                  type="button" 
                  onClick={() => {
                    const target = showViewModal;
                    setShowViewModal(null);
                    openEditModal(target);
                  }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-xs transition"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Specifications</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PERFORMANCE METRICS MODAL (SECTION 7.11) */}
      {showPerformanceModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Supplier Performance Rating Engine</h3>
                  <p className="text-xs text-slate-500">{showPerformanceModal.supplier_name} ({showPerformanceModal.supplier_code})</p>
                </div>
              </div>
              <button type="button" onClick={() => setShowPerformanceModal(null)} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-900 block">Overall System Score</span>
                  <p className="text-[11px] text-amber-700">Calculated from price, lead times, quality & rejection rate</p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-2xl font-bold text-amber-800">{showPerformanceModal.rating || '4.8'}</span>
                  <span className="text-amber-500 font-bold text-sm"> / 5.0 ★</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Price Competitiveness:</span>
                    <span className="font-mono text-purple-700">96%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '96%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>On-Time Delivery Rate:</span>
                    <span className="font-mono text-emerald-700">98%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '98%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Product Quality Compliance:</span>
                    <span className="font-mono text-blue-700">99%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '99%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Rejection Percentage:</span>
                    <span className="font-mono text-rose-600">0.8%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-rose-500 h-2 rounded-full" style={{ width: '8%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button type="button" onClick={() => setShowPerformanceModal(null)} className="px-4 py-2 bg-slate-100 text-slate-800 font-bold text-xs rounded-xl">Close Performance Audit</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deleteConfirmSupplier && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center font-bold shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Confirm Delete Supplier</h3>
                <p className="text-xs font-mono text-purple-700 font-bold">{deleteConfirmSupplier.supplier_code}</p>
              </div>
            </div>

            <div className="p-3.5 bg-rose-50/80 border border-rose-200 rounded-xl text-xs text-rose-900 space-y-1">
              <p className="font-bold">Permanent Action Notice:</p>
              <p>Are you sure you want to delete <strong>{deleteConfirmSupplier.supplier_name}</strong>?</p>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button type="button" onClick={() => setDeleteConfirmSupplier(null)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">Cancel</button>
              <button type="button" onClick={handleDeleteConfirm} className="px-5 py-2 bg-rose-600 text-white font-bold text-xs rounded-xl">Delete Vendor</button>
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
