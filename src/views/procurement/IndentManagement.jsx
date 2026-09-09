import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, Plus, Send, Copy, X, Ban, Edit3, Eye, Printer, Clock, 
  AlertTriangle, CheckCircle2, MessageSquare, Paperclip, Search, Filter, 
  ArrowRight, Trash2, Layers, Building2, AlertCircle, Calendar, DollarSign, User,
  Check, RefreshCw, ChevronDown, PackageCheck, AlertOctagon, ShieldAlert, Upload, Sliders, Loader2
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import PrintModal from '../../components/common/PrintModal';
import { useAuth } from '../../context/AuthContext';

export default function IndentManagement() {
  const { user } = useAuth();

  // Primary Data States
  const [indents, setIndents] = useState([]);
  const [itemsMaster, setItemsMaster] = useState([]);
  const [suppliersMaster, setSuppliersMaster] = useState([]);
  const [departmentsMaster, setDepartmentsMaster] = useState([]);
  const [brandsMaster, setBrandsMaster] = useState([]);
  const [uomsMaster, setUomsMaster] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  // Search & Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');

  // Modals & Active Selections
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingIndentId, setEditingIndentId] = useState(null);
  const [cancelModalId, setCancelModalId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [deleteModalIndent, setDeleteModalIndent] = useState(null);
  const [statusUpdateModalIndent, setStatusUpdateModalIndent] = useState(null);
  const [targetNewStatus, setTargetNewStatus] = useState('Approved');
  const [statusReason, setStatusReason] = useState('');
  const [detailModalIndent, setDetailModalIndent] = useState(null);
  const [activeDetailTab, setActiveDetailTab] = useState('overview'); // 'overview' | 'history' | 'comments' | 'attachments'
  const [newCommentText, setNewCommentText] = useState('');
  const [printDoc, setPrintDoc] = useState(null);

  // Toast Notification State
  const [toast, setToast] = useState(null);

  const showToast = (type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Default initial line item with all 14 Indent Line Fields
  const createEmptyLineItem = (firstItem = null, headerReqDate = null) => {
    const item = firstItem || itemsMaster[0] || {};
    const reqDate = headerReqDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
    const qty = 5;
    const rate = item.valuation_rate || 100;

    return {
      item_id: item.id || '',
      description: item.description || item.item_name || '',
      requested_qty: qty,
      uom_id: item.uom_id || 'uom-01',
      approved_qty: qty,
      estimated_rate: rate,
      estimated_amount: qty * rate,
      required_date: reqDate,
      preferred_brand_id: item.brand_id || '',
      suggested_supplier_id: '',
      technical_spec: '',
      attachment_name: '',
      line_remarks: ''
    };
  };

  // Form State
  const initialFormState = {
    purpose: 'New Department Equipment & Consumables Requisition',
    priority: 'Normal',
    priority_justification: '',
    required_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    department_id: user?.department_id || 'dept-01',
    cost_centre: 'IT-001',
    remarks: '',
    items: []
  };

  const [form, setForm] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState([]);
  const [formWarnings, setFormWarnings] = useState([]);

  // Fetch initial data
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [indentsRes, itemsRes, suppliersRes, deptsRes, brandsRes, uomsRes] = await Promise.all([
        fetch('/api/indents').then(r => r.json()),
        fetch('/api/items').then(r => r.json()),
        fetch('/api/suppliers').then(r => r.json()).catch(() => ({ success: true, data: [] })),
        fetch('/api/departments').then(r => r.json()).catch(() => ({ success: true, data: [] })),
        fetch('/api/brands').then(r => r.json()).catch(() => ({ success: true, data: [] })),
        fetch('/api/units-of-measure').then(r => r.json()).catch(() => ({ success: true, data: [] }))
      ]);

      if (indentsRes.success) setIndents(indentsRes.data || []);
      if (itemsRes.success) {
        const activeItems = (itemsRes.data || []).filter(i => i.is_active !== false);
        setItemsMaster(activeItems);

        if (activeItems.length > 0 && form.items.length === 0) {
          setForm(prev => ({
            ...prev,
            items: [createEmptyLineItem(activeItems[0], prev.required_date)]
          }));
        }
      }

      if (suppliersRes.success) setSuppliersMaster(suppliersRes.data || []);
      if (deptsRes.success) setDepartmentsMaster(deptsRes.data || []);
      if (brandsRes.success) setBrandsMaster(brandsRes.data || []);
      if (uomsRes.success) setUomsMaster(uomsRes.data || []);

    } catch (err) {
      console.error('Failed to load indent management data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchIndents = async () => {
    try {
      const res = await fetch('/api/indents');
      const data = await res.json();
      if (data.success) {
        const sorted = (data.data || []).sort((a, b) => {
          const dateA = new Date(a.created_at || a.request_date || 0).getTime();
          const dateB = new Date(b.created_at || b.request_date || 0).getTime();
          if (dateA !== dateB) return dateB - dateA;
          return String(b.indent_number || b.id).localeCompare(String(a.indent_number || a.id));
        });
        setIndents(sorted);
      }
    } catch (err) {
      console.error('Error refreshing indents:', err);
    }
  };

  // Live stock lookup helper for item selection inside form
  const getSelectedStockInfo = (itemId) => {
    const itemMaster = itemsMaster.find(i => i.id === itemId);
    if (!itemMaster) {
      return { current_stock: 0, reserved_stock: 0, available_stock: 0, reorder_level: 0, open_po_qty: 0 };
    }
    return {
      current_stock: itemMaster.on_hand_qty || 0,
      reserved_stock: itemMaster.reserved_qty || 0,
      available_stock: (itemMaster.on_hand_qty || 0) - (itemMaster.reserved_qty || 0),
      reorder_level: itemMaster.reorder_level || 0,
      open_po_qty: itemMaster.open_po_qty || 0
    };
  };

  // Filtered Indents List
  const filteredIndents = useMemo(() => {
    return indents.filter(indent => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        indent.indent_number?.toLowerCase().includes(q) ||
        indent.purpose?.toLowerCase().includes(q) ||
        indent.department_name?.toLowerCase().includes(q) ||
        indent.requested_by_name?.toLowerCase().includes(q) ||
        indent.cost_centre?.toLowerCase().includes(q) ||
        (indent.items || []).some(i => i.item_name?.toLowerCase().includes(q) || i.item_code?.toLowerCase().includes(q))
      );

      const matchesStatus = statusFilter === 'ALL' || indent.status?.toLowerCase() === statusFilter.toLowerCase();
      const matchesPriority = priorityFilter === 'ALL' || indent.priority?.toLowerCase() === priorityFilter.toLowerCase();
      const matchesDept = departmentFilter === 'ALL' || indent.department_id === departmentFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesDept;
    });
  }, [indents, searchQuery, statusFilter, priorityFilter, departmentFilter]);

  // KPI Calculations
  const stats = useMemo(() => {
    const total = indents.length;
    const drafts = indents.filter(i => i.status === 'Draft').length;
    const underReview = indents.filter(i => i.status === 'Under review' || i.status === 'Submitted').length;
    const approved = indents.filter(i => i.status === 'Approved' || i.status === 'Converted to RFQ' || i.status === 'Fulfilled').length;
    const cancelled = indents.filter(i => i.status === 'Cancelled' || i.status === 'Rejected').length;
    const totalVal = indents.reduce((sum, i) => sum + (i.total_estimated_amount || 0), 0);
    return { total, drafts, underReview, approved, cancelled, totalVal };
  }, [indents]);

  // Form Management Handlers
  const handleOpenCreateModal = () => {
    setEditingIndentId(null);
    const reqDate = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
    const initialLine = createEmptyLineItem(itemsMaster[0], reqDate);
    setForm({
      ...initialFormState,
      required_date: reqDate,
      department_id: user?.department_id || departmentsMaster[0]?.id || 'dept-01',
      items: [initialLine]
    });
    setFormErrors([]);
    setFormWarnings([]);
    setShowFormModal(true);
  };

  const handleOpenEditModal = (indent) => {
    setEditingIndentId(indent.id);
    setForm({
      purpose: indent.purpose || '',
      priority: indent.priority || 'Normal',
      priority_justification: indent.priority_justification || '',
      required_date: indent.required_date || new Date().toISOString().split('T')[0],
      department_id: indent.department_id || 'dept-01',
      cost_centre: indent.cost_centre || 'IT-001',
      remarks: indent.remarks || '',
      items: (indent.items || []).map(i => ({
        item_id: i.item_id,
        description: i.description || i.item_name || '',
        requested_qty: i.requested_qty || 1,
        uom_id: i.uom_id || 'uom-01',
        approved_qty: i.approved_qty || i.requested_qty || 1,
        estimated_rate: i.estimated_rate || 0,
        estimated_amount: i.estimated_amount || ((i.requested_qty || 1) * (i.estimated_rate || 0)),
        required_date: i.required_date || indent.required_date,
        preferred_brand_id: i.preferred_brand_id || '',
        suggested_supplier_id: i.suggested_supplier_id || '',
        technical_spec: i.technical_spec || '',
        attachment_name: i.attachment_name || '',
        line_remarks: i.line_remarks || ''
      }))
    });
    setFormErrors([]);
    setFormWarnings([]);
    setShowFormModal(true);
  };

  const handleLineItemChange = (index, field, value) => {
    const updatedItems = [...form.items];
    const currentLine = { ...updatedItems[index], [field]: value };

    if (field === 'item_id') {
      const selectedItem = itemsMaster.find(i => i.id === value);
      if (selectedItem) {
        currentLine.description = selectedItem.description || selectedItem.item_name;
        currentLine.estimated_rate = selectedItem.valuation_rate || 0;
        currentLine.uom_id = selectedItem.uom_id || 'uom-01';
        currentLine.preferred_brand_id = selectedItem.brand_id || '';
      }
    }

    if (field === 'requested_qty' || field === 'estimated_rate' || field === 'item_id') {
      const qty = Number(currentLine.requested_qty || 0);
      const rate = Number(currentLine.estimated_rate || 0);
      currentLine.estimated_amount = qty * rate;
      if (field === 'requested_qty' && !currentLine.approved_qty) {
        currentLine.approved_qty = qty;
      }
    }

    updatedItems[index] = currentLine;

    const warnings = [];
    const seen = new Set();
    updatedItems.forEach((l, idx) => {
      if (l.item_id) {
        if (seen.has(l.item_id)) {
          const itemObj = itemsMaster.find(im => im.id === l.item_id);
          warnings.push(`Line ${idx + 1}: Duplicate item "${itemObj?.item_name || l.item_id}" selected. Duplicate items should be combined.`);
        } else {
          seen.add(l.item_id);
        }
      }
    });

    setFormWarnings(warnings);
    setForm({ ...form, items: updatedItems });
  };

  const handleAddLineItem = () => {
    const newLine = createEmptyLineItem(itemsMaster[0], form.required_date);
    setForm({
      ...form,
      items: [...form.items, newLine]
    });
  };

  const handleRemoveLineItem = (index) => {
    if (form.items.length === 1) {
      setFormErrors(['At least one line item is required in the indent.']);
      return;
    }
    const updated = form.items.filter((_, idx) => idx !== index);
    setForm({ ...form, items: updated });
  };

  const validateFormClient = () => {
    const errors = [];

    if (!form.purpose || !form.purpose.trim()) {
      errors.push('Purpose is mandatory.');
    }

    if ((form.priority === 'Urgent' || form.priority === 'Emergency') && (!form.priority_justification || !form.priority_justification.trim())) {
      errors.push(`${form.priority} priority requests require an additional explanation/justification.`);
    }

    if (!form.items || form.items.length === 0) {
      errors.push('At least one item line is required.');
    } else {
      form.items.forEach((line, idx) => {
        if (!line.item_id) {
          errors.push(`Line ${idx + 1}: Select an item.`);
        }
        if (Number(line.requested_qty || 0) <= 0) {
          errors.push(`Line ${idx + 1}: Requested quantity must be greater than zero.`);
        }
      });
    }

    setFormErrors(errors);
    return errors.length === 0;
  };

  // Submit / Save / Delete / Status Transition Handlers
  const handleSaveForm = async (targetStatus = 'Draft') => {
    if (isSubmittingForm) return;
    if (!validateFormClient()) return;

    setIsSubmittingForm(true);
    try {
      const payload = {
        ...form,
        status: targetStatus,
        requested_by: user?.id || 'usr-05'
      };

      const url = editingIndentId ? `/api/indents/${editingIndentId}` : '/api/indents';
      const method = editingIndentId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setShowFormModal(false);
        fetchIndents();
        if (targetStatus === 'Draft') {
          showToast('success', editingIndentId ? 'Indent Updated' : 'Draft Saved', data.message || 'Indent saved successfully as draft.');
        } else {
          showToast('info', 'Requisition Submitted', data.message || 'Indent submitted for manager approval.');
        }
      } else {
        setFormErrors(data.errors || [data.message]);
        showToast('danger', 'Validation Error', data.message || 'Please fix form errors.');
      }
    } catch (err) {
      console.error('Error saving indent:', err);
      setFormErrors(['Network error occurred while saving indent.']);
      showToast('danger', 'Network Error', 'Failed to communicate with server.');
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleSubmitIndent = async (indentId) => {
    if (isSubmittingForm) return;
    setIsSubmittingForm(true);
    try {
      const res = await fetch(`/api/indents/${indentId}/submit`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user?.id })
      });
      const data = await res.json();
      if (data.success) {
        fetchIndents();
        if (detailModalIndent && detailModalIndent.id === indentId) {
          setDetailModalIndent(data.data);
        }
        showToast('info', 'Requisition Submitted', data.message || 'Indent submitted for approval workflow.');
      } else {
        showToast('danger', 'Submission Failed', data.message || 'Failed to submit indent.');
      }
    } catch (err) {
      console.error('Submit indent error:', err);
      showToast('danger', 'Server Error', 'Failed to submit indent.');
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleCopyIndent = (indent) => {
    setEditingIndentId(null);
    const reqDate = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];

    const copiedItems = (indent.items || []).map(i => ({
      item_id: i.item_id,
      description: i.description || i.item_name || '',
      requested_qty: i.requested_qty || 1,
      uom_id: i.uom_id || 'uom-01',
      approved_qty: i.requested_qty || 1,
      estimated_rate: i.estimated_rate || 0,
      estimated_amount: (i.requested_qty || 1) * (i.estimated_rate || 0),
      required_date: reqDate,
      preferred_brand_id: i.preferred_brand_id || '',
      suggested_supplier_id: i.suggested_supplier_id || '',
      technical_spec: i.technical_spec || '',
      attachment_name: i.attachment_name || '',
      line_remarks: i.line_remarks || ''
    }));

    setForm({
      purpose: `Copy of ${indent.indent_number}: ${indent.purpose || ''}`,
      priority: indent.priority || 'Normal',
      priority_justification: indent.priority_justification || '',
      required_date: reqDate,
      department_id: indent.department_id || user?.department_id || 'dept-01',
      cost_centre: indent.cost_centre || 'IT-001',
      remarks: indent.remarks ? `Copied from ${indent.indent_number}. ${indent.remarks}` : `Copied from ${indent.indent_number}`,
      items: copiedItems.length > 0 ? copiedItems : [createEmptyLineItem(itemsMaster[0], reqDate)]
    });

    setFormErrors([]);
    setFormWarnings([]);
    setShowFormModal(true);
    showToast('info', 'Indent Pre-filled', `Form pre-filled from ${indent.indent_number}. Click "Save Draft" or "Submit for Review" to save.`);
  };

  const handleConfirmCancel = async () => {
    if (!cancelReason || !cancelReason.trim()) return;
    try {
      const res = await fetch(`/api/indents/${cancelModalId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason, user_id: user?.id, user_name: user?.name })
      });
      const data = await res.json();
      if (data.success) {
        const indentNum = indents.find(i => i.id === cancelModalId)?.indent_number || '';
        setCancelModalId(null);
        setCancelReason('');
        fetchIndents();
        showToast('warning', 'Indent Cancelled', data.message || `Indent ${indentNum} has been cancelled.`);
      } else {
        showToast('danger', 'Cancellation Error', data.message || 'Failed to cancel indent.');
      }
    } catch (err) {
      console.error('Cancel indent error:', err);
      showToast('danger', 'Server Error', 'Failed to cancel indent.');
    }
  };

  const handleConfirmStatusUpdate = async () => {
    if (!statusUpdateModalIndent) return;
    try {
      const res = await fetch(`/api/indents/${statusUpdateModalIndent.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: targetNewStatus,
          reason: statusReason,
          user_id: user?.id,
          user_name: user?.name
        })
      });
      const data = await res.json();
      if (data.success) {
        const indentNum = statusUpdateModalIndent.indent_number;
        setStatusUpdateModalIndent(null);
        setStatusReason('');
        fetchIndents();
        if (detailModalIndent && detailModalIndent.id === statusUpdateModalIndent.id) {
          setDetailModalIndent(data.data);
        }
        showToast('info', 'Status Transitioned', data.message || `Indent ${indentNum} status changed to "${targetNewStatus}".`);
      } else {
        showToast('danger', 'Status Transition Failed', data.message || 'Failed to update status.');
      }
    } catch (err) {
      console.error('Status update error:', err);
      showToast('danger', 'Server Error', 'Failed to update indent status.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalIndent) return;
    try {
      const indentNum = deleteModalIndent.indent_number;
      const res = await fetch(`/api/indents/${deleteModalIndent.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user?.id })
      });
      const data = await res.json();
      if (data.success) {
        setDeleteModalIndent(null);
        if (detailModalIndent?.id === deleteModalIndent.id) {
          setDetailModalIndent(null);
        }
        fetchIndents();
        showToast('danger', 'Indent Deleted', data.message || `Indent ${indentNum} deleted permanently.`);
      } else {
        showToast('danger', 'Deletion Failed', data.message || 'Failed to delete indent.');
      }
    } catch (err) {
      console.error('Delete indent error:', err);
      showToast('danger', 'Server Error', 'Failed to delete indent.');
    }
  };

  const handleAddComment = async () => {
    if (!newCommentText || !newCommentText.trim() || !detailModalIndent) return;
    try {
      const res = await fetch(`/api/indents/${detailModalIndent.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comment: newCommentText,
          user_id: user?.id || 'usr-05',
          user_name: user?.name || 'Current User'
        })
      });
      const data = await res.json();
      if (data.success) {
        setNewCommentText('');
        const refRes = await fetch(`/api/indents/${detailModalIndent.id}`);
        const refData = await refRes.json();
        if (refData.success) setDetailModalIndent(refData.data);
        showToast('success', 'Comment Posted', 'Your comment was posted to the discussion.');
      } else {
        showToast('danger', 'Comment Failed', data.message || 'Failed to post comment.');
      }
    } catch (err) {
      console.error('Add comment error:', err);
      showToast('danger', 'Server Error', 'Failed to post comment.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* KPI Stats Header Bar */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Indents</p>
            <h3 className="text-xl font-bold text-slate-900 font-heading">{stats.total}</h3>
            <span className="text-[10px] text-purple-600 font-bold font-mono">₹{stats.totalVal.toLocaleString()} Total</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Draft Requisitions</p>
            <h3 className="text-xl font-bold text-slate-900 font-heading">{stats.drafts}</h3>
            <span className="text-[10px] text-slate-500 font-medium">Editable drafts</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <RefreshCw className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Under Review</p>
            <h3 className="text-xl font-bold text-amber-700 font-heading">{stats.underReview}</h3>
            <span className="text-[10px] text-amber-600 font-medium">Awaiting Manager Approval</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <PackageCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Approved / RFQ</p>
            <h3 className="text-xl font-bold text-emerald-700 font-heading">{stats.approved}</h3>
            <span className="text-[10px] text-emerald-600 font-medium">Ready for PO / RFQ</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <Ban className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cancelled / Rejected</p>
            <h3 className="text-xl font-bold text-rose-700 font-heading">{stats.cancelled}</h3>
            <span className="text-[10px] text-rose-600 font-medium">Deletable cancelled indents</span>
          </div>
        </div>
      </div>

      {/* Top Header & Actions Bar */}
      <div className="bg-white p-4 sm:p-5 border border-slate-200/80 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-heading flex items-center space-x-2">
              <FileText className="w-5 h-5 text-purple-600" />
              <span>Material Indent Requisitions</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Internal material request management, stock availability breakdown & approval workflow initiation.
            </p>
          </div>
          <button 
            onClick={handleOpenCreateModal}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center space-x-2 shadow-xs transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span> Create Material Indent</span>
          </button>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input 
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search Indent #, purpose, item..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-800 focus:outline-hidden focus:border-purple-500"
            />
          </div>

          <div>
            <select 
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden focus:border-purple-500 font-medium"
            >
              <option value="ALL">All Statuses (12)</option>
              <option value="Draft">Draft</option>
              <option value="Submitted">Submitted</option>
              <option value="Under review">Under review</option>
              <option value="Returned for correction">Returned for correction</option>
              <option value="Partially approved">Partially approved</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Converted to RFQ">Converted to RFQ</option>
              <option value="Partially fulfilled">Partially fulfilled</option>
              <option value="Fulfilled">Fulfilled</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div>
            <select 
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden focus:border-purple-500 font-medium"
            >
              <option value="ALL">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Normal">Normal</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
              <option value="Emergency">Emergency</option>
            </select>
          </div>

          <div>
            <select 
              value={departmentFilter}
              onChange={e => setDepartmentFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden focus:border-purple-500 font-medium"
            >
              <option value="ALL">All Departments</option>
              {departmentsMaster.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Indents List Cards */}
      {isLoading ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-slate-400 space-y-2">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-purple-600" />
          <p className="text-xs font-semibold">Loading material indents & stock breakdown...</p>
        </div>
      ) : filteredIndents.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-slate-500 space-y-3">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-sm text-slate-800">No material indents found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No indents match your search filters. Click "+ Create Material Indent" to submit a new request.
          </p>
          <button 
            onClick={handleOpenCreateModal}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-xl inline-flex items-center space-x-2 shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Material Indent</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredIndents.map(indent => {
            const isUrgentOrEmergency = indent.priority === 'Urgent' || indent.priority === 'Emergency';
            const canEdit = indent.status === 'Draft' || indent.status === 'Returned for correction';
            const canSubmit = indent.status === 'Under review' || indent.status === 'Draft' || indent.status === 'Returned for correction';
            const canCancel = indent.status !== 'Cancelled' && indent.status !== 'Closed';
            const canDelete = indent.status === 'Cancelled' || indent.status === 'Draft' || indent.status === 'Rejected';

            return (
              <div 
                key={indent.id} 
                className={`bg-white border rounded-2xl p-5 shadow-2xs space-y-4 transition ${
                  isUrgentOrEmergency ? 'border-rose-300 hover:border-rose-400 bg-rose-50/10' : 'border-slate-200/80 hover:border-purple-300'
                }`}
              >
                {/* Indent Header Line */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-100 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                      {indent.indent_number}
                    </span>

                    {/* Interactive Status Badge Trigger */}
                    <button 
                      onClick={() => {
                        setStatusUpdateModalIndent(indent);
                        setTargetNewStatus(indent.status);
                        setStatusReason('');
                      }}
                      className="hover:scale-105 transition cursor-pointer group flex items-center space-x-1"
                      title="Click to transition indent status"
                    >
                      <StatusBadge status={indent.status} />
                      <Sliders className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition" />
                    </button>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      indent.priority === 'Emergency' ? 'bg-rose-600 text-white border-rose-700 font-extrabold animate-pulse' :
                      indent.priority === 'Urgent' ? 'bg-rose-50 text-rose-700 border-rose-300 font-bold' :
                      indent.priority === 'High' ? 'bg-amber-50 text-amber-700 border-amber-300' :
                      'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {indent.priority} Priority
                    </span>

                    <span className="text-xs text-slate-500 font-mono font-medium">Req Date: {indent.request_date || indent.created_at?.replace('T', ' ').substring(0, 19) || '2026-09-06 23:57'}</span>
                    <span className="text-xs text-slate-600 font-semibold">&bull; Dept: {indent.department_name}</span>
                  </div>

                  {/* Actions & Total Amount */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 font-mono mr-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                      Est Total: ₹{(indent.total_estimated_amount || 0).toLocaleString()}
                    </span>

                    {/* Change Status Action Dropdown Trigger */}
                    <button 
                      onClick={() => {
                        setStatusUpdateModalIndent(indent);
                        setTargetNewStatus(indent.status);
                        setStatusReason('');
                      }}
                      className="bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1 border border-purple-200 transition"
                      title="Transition indent status (12 valid statuses)"
                    >
                      <Sliders className="w-3.5 h-3.5 text-purple-600" />
                      <span>Status Workflow</span>
                    </button>

                    {/* View Details */}
                    <button 
                      onClick={() => {
                        setDetailModalIndent(indent);
                        setActiveDetailTab('overview');
                      }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1 transition"
                      title="View Details & Audit History"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-600" />
                      <span>Details</span>
                    </button>

                    {/* Print PDF */}
                    <button 
                      onClick={() => setPrintDoc(indent)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1 transition"
                      title="Print / Save PDF Requisition"
                    >
                      <Printer className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Print</span>
                    </button>

                    {/* Copy */}
                    <button 
                      onClick={() => handleCopyIndent(indent)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1 transition"
                      title="Copy Indent to New Draft Requisition"
                    >
                      <Copy className="w-3.5 h-3.5 text-purple-600" />
                      <span>Copy</span>
                    </button>

                    {/* Edit */}
                    {canEdit && (
                      <button 
                        onClick={() => handleOpenEditModal(indent)}
                        className="bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1 border border-amber-300 transition"
                        title="Edit Indent Requisition"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                        <span>Edit</span>
                      </button>
                    )}

                    {/* Submit */}
                    {canSubmit && (
                      <button 
                        onClick={() => handleSubmitIndent(indent.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center space-x-1 shadow-2xs transition"
                        title="Submit to Approval Workflow"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit</span>
                      </button>
                    )}

                    {/* Cancel */}
                    {canCancel && (
                      <button 
                        onClick={() => {
                          setCancelModalId(indent.id);
                          setCancelReason('');
                        }}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold px-2.5 py-1.5 rounded-xl flex items-center space-x-1 border border-rose-200 transition"
                        title="Cancel Indent"
                      >
                        <Ban className="w-3.5 h-3.5 text-rose-600" />
                        <span>Cancel</span>
                      </button>
                    )}

                    {/* Delete (Specifically enabled for Cancelled, Draft, or Rejected indents) */}
                    {canDelete && (
                      <button 
                        onClick={() => setDeleteModalIndent(indent)}
                        className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-2.5 py-1.5 rounded-xl flex items-center space-x-1 shadow-2xs transition"
                        title="Delete Indent permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Purpose & Header Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <div className="md:col-span-2">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Purpose</span>
                    <span className="text-slate-900 font-bold">{indent.purpose}</span>
                    {indent.priority_justification && (
                      <p className="text-[11px] text-rose-700 font-medium mt-1 bg-rose-50 p-1.5 rounded border border-rose-200">
                        <strong>Priority Justification:</strong> {indent.priority_justification}
                      </p>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Required Date</span>
                    <span className="text-slate-800 font-semibold">{indent.required_date}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Cost Centre / Project</span>
                    <span className="text-purple-700 font-mono font-bold">{indent.cost_centre || 'N/A'}</span>
                  </div>
                </div>

                {/* Line Items Table displaying ALL 14 fields */}
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 uppercase text-[10px] border-b border-slate-200 font-bold">
                        <th className="py-2.5 px-3">Item & Description</th>
                        <th className="py-2.5 px-2">Req Qty</th>
                        <th className="py-2.5 px-2">Appr Qty</th>
                        <th className="py-2.5 px-2">Unit</th>
                        <th className="py-2.5 px-3">Stock Availability Breakdown</th>
                        <th className="py-2.5 px-2">Est Rate</th>
                        <th className="py-2.5 px-2">Est Amount</th>
                        <th className="py-2.5 px-2">Req Date</th>
                        <th className="py-2.5 px-3">Brand & Supplier</th>
                        <th className="py-2.5 px-3">Specs / Attachment / Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {(indent.items || []).map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60">
                          <td className="py-3 px-3 min-w-[160px]">
                            <span className="font-mono text-purple-700 font-bold block text-[11px]">{item.item_code}</span>
                            <span className="text-slate-900 font-bold block">{item.item_name}</span>
                            {item.description && <p className="text-slate-500 text-[10px] line-clamp-2 mt-0.5">{item.description}</p>}
                          </td>

                          <td className="py-3 px-2 font-mono font-bold text-slate-900">
                            {item.requested_qty}
                          </td>

                          <td className="py-3 px-2 font-mono font-semibold text-emerald-700">
                            {item.approved_qty || item.requested_qty}
                          </td>

                          <td className="py-3 px-2 text-slate-700 font-bold font-mono">
                            {item.uom_symbol || 'Pcs'}
                          </td>

                          <td className="py-3 px-3 font-mono">
                            <div className="flex flex-wrap items-center gap-1">
                              <span className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-1.5 py-0.5 rounded" title="Current Stock">
                                Curr: {item.current_stock || 0}
                              </span>
                              <span className="bg-rose-50 text-rose-700 text-[10px] font-semibold px-1.5 py-0.5 rounded" title="Reserved Stock">
                                Res: {item.reserved_stock || 0}
                              </span>
                              <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded" title="Available Stock = Current - Reserved">
                                Avail: {item.available_stock || 0}
                              </span>
                              <span className="bg-amber-50 text-amber-800 text-[10px] px-1.5 py-0.5 rounded" title="Reorder Level">
                                Reorder: {item.reorder_level || 0}
                              </span>
                              {(item.open_po_qty || 0) > 0 && (
                                <span className="bg-blue-50 text-blue-700 text-[10px] px-1.5 py-0.5 rounded" title="Open Purchase Order Qty">
                                  Open PO: {item.open_po_qty}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3 px-2 font-mono text-slate-700">₹{(item.estimated_rate || 0).toLocaleString()}</td>
                          <td className="py-3 px-2 font-mono font-bold text-slate-900">₹{(item.estimated_amount || 0).toLocaleString()}</td>
                          <td className="py-3 px-2 text-slate-600 text-[11px] font-medium">{item.required_date || indent.required_date}</td>

                          <td className="py-3 px-3 text-slate-600 text-[11px] min-w-[130px]">
                            {item.preferred_brand_name && <span className="block font-semibold text-slate-800">Brand: {item.preferred_brand_name}</span>}
                            {item.suggested_supplier_name && <span className="block text-slate-500 text-[10px]">Supplier: {item.suggested_supplier_name}</span>}
                            {!item.preferred_brand_name && !item.suggested_supplier_name && <span className="text-slate-400">Standard</span>}
                          </td>

                          <td className="py-3 px-3 text-slate-600 text-[11px] max-w-xs space-y-0.5">
                            {item.technical_spec && <p className="text-slate-800 font-medium"><strong>Spec:</strong> {item.technical_spec}</p>}
                            {item.attachment_name && (
                              <p className="text-purple-700 font-bold flex items-center space-x-1 text-[10px]">
                                <Paperclip className="w-3 h-3 shrink-0" />
                                <span>{item.attachment_name}</span>
                              </p>
                            )}
                            {item.line_remarks && <p className="text-slate-500 text-[10px] italic">Remarks: {item.line_remarks}</p>}
                            {!item.technical_spec && !item.attachment_name && !item.line_remarks && <span className="text-slate-400">N/A</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT INDENT MODAL */}
      {showFormModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-5xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-900 text-white">
              <div>
                <h3 className="font-bold text-sm uppercase tracking-wider font-heading flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-purple-400" />
                  <span>{editingIndentId ? 'Edit Material Indent Requisition' : 'Raise Material Indent Request'}</span>
                </h3>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Internal material request form (Pre-Purchase Order)
                </p>
              </div>
              <button 
                onClick={() => setShowFormModal(false)}
                className="text-slate-400 hover:text-white p-1 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Validation Alert Bar */}
            {(formErrors.length > 0 || formWarnings.length > 0) && (
              <div className="px-6 pt-4 space-y-2">
                {formErrors.map((err, i) => (
                  <div key={i} className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold px-3 py-2 rounded-xl flex items-center space-x-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{err}</span>
                  </div>
                ))}
                {formWarnings.map((warn, i) => (
                  <div key={i} className="bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold px-3 py-2 rounded-xl flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{warn}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Form Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
              {/* Header Fields Section */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center space-x-1.5 border-b border-slate-200 pb-2">
                  <Building2 className="w-4 h-4 text-purple-600" />
                  <span>Requisition Header Details</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Indent Number</label>
                    <input 
                      type="text" 
                      disabled 
                      value={editingIndentId ? indents.find(i => i.id === editingIndentId)?.indent_number || '' : 'Auto-generated (IND-2026-XXXXXX)'} 
                      className="w-full bg-slate-200/70 border border-slate-300 rounded-xl px-3 py-2 text-slate-700 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Request Date</label>
                    <input 
                      type="date" 
                      disabled 
                      value={new Date().toISOString().split('T')[0]} 
                      className="w-full bg-slate-200/70 border border-slate-300 rounded-xl px-3 py-2 text-slate-700 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Requested By</label>
                    <input 
                      type="text" 
                      disabled 
                      value={user?.name || 'Current User'} 
                      className="w-full bg-slate-200/70 border border-slate-300 rounded-xl px-3 py-2 text-slate-700 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Department *</label>
                    <select 
                      value={form.department_id}
                      onChange={e => setForm({ ...form, department_id: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-hidden focus:border-purple-600"
                    >
                      {departmentsMaster.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Required Date *</label>
                    <input 
                      type="date" 
                      required
                      value={form.required_date} 
                      onChange={e => setForm({ ...form, required_date: e.target.value })} 
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-hidden focus:border-purple-600"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Cost Centre or Project</label>
                    <input 
                      type="text" 
                      value={form.cost_centre} 
                      onChange={e => setForm({ ...form, cost_centre: e.target.value })}
                      placeholder="e.g. IT-001, PUR-002" 
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-mono focus:outline-hidden focus:border-purple-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-600 font-bold mb-1">Purpose *</label>
                    <input 
                      type="text" 
                      required
                      value={form.purpose} 
                      onChange={e => setForm({ ...form, purpose: e.target.value })}
                      placeholder="Business reason for requesting material..." 
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-hidden focus:border-purple-600"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Priority</label>
                    <select 
                      value={form.priority} 
                      onChange={e => setForm({ ...form, priority: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-bold focus:outline-hidden focus:border-purple-600"
                    >
                      <option value="Low">Low</option>
                      <option value="Normal">Normal</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                      <option value="Emergency">Emergency</option>
                    </select>
                  </div>
                </div>

                {(form.priority === 'Urgent' || form.priority === 'Emergency') && (
                  <div className="bg-rose-50 p-3 rounded-xl border border-rose-200 space-y-1">
                    <label className="block text-rose-800 font-bold text-[11px] flex items-center space-x-1">
                      <AlertOctagon className="w-4 h-4 text-rose-600" />
                      <span>{form.priority} Request Explanation / Justification *</span>
                    </label>
                    <textarea 
                      rows="2"
                      required
                      value={form.priority_justification}
                      onChange={e => setForm({ ...form, priority_justification: e.target.value })}
                      placeholder="Required justification explanation for urgent or emergency prioritization..."
                      className="w-full bg-white border border-rose-300 rounded-lg p-2 text-slate-900 text-xs focus:outline-hidden focus:border-rose-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Remarks</label>
                  <textarea 
                    rows="2"
                    value={form.remarks}
                    onChange={e => setForm({ ...form, remarks: e.target.value })}
                    placeholder="Additional notes for approvers or purchasing staff..."
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-800 focus:outline-hidden focus:border-purple-600"
                  />
                </div>
              </div>

              {/* Line Items Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
                    <Layers className="w-4 h-4 text-purple-600" />
                    <span>Requested Line Items ({form.items.length})</span>
                  </h4>
                  <button 
                    type="button" 
                    onClick={handleAddLineItem}
                    className="bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1 border border-purple-200 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Line Item</span>
                  </button>
                </div>

                {form.items.map((line, idx) => {
                  const stockInfo = getSelectedStockInfo(line.item_id);

                  return (
                    <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3.5 relative shadow-2xs">
                      <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                        <span className="font-bold text-slate-800 text-[11px] flex items-center space-x-2">
                          <span className="bg-purple-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">
                            {idx + 1}
                          </span>
                          <span>Line Item #{idx + 1}</span>
                        </span>
                        {form.items.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => handleRemoveLineItem(idx)}
                            className="text-rose-600 hover:text-rose-800 text-[11px] font-bold flex items-center space-x-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove Line</span>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-600 text-[10px] font-bold uppercase mb-1">Item *</label>
                          <select 
                            value={line.item_id}
                            onChange={e => handleLineItemChange(idx, 'item_id', e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-bold text-xs focus:border-purple-600"
                          >
                            <option value="">-- Choose Item Master --</option>
                            {itemsMaster.map(item => (
                              <option key={item.id} value={item.id}>
                                {item.item_code} - {item.item_name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-slate-600 text-[10px] font-bold uppercase mb-1">Description</label>
                          <input 
                            type="text" 
                            value={line.description}
                            onChange={e => handleLineItemChange(idx, 'description', e.target.value)}
                            placeholder="Detailed item description snapshot..."
                            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 text-xs focus:border-purple-600"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        <div>
                          <label className="block text-slate-600 text-[10px] font-bold uppercase mb-1">Requested Qty *</label>
                          <input 
                            type="number"
                            min="1"
                            value={line.requested_qty}
                            onChange={e => handleLineItemChange(idx, 'requested_qty', e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-mono font-bold text-xs focus:border-purple-600"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-600 text-[10px] font-bold uppercase mb-1">Unit (UOM)</label>
                          <select 
                            value={line.uom_id}
                            onChange={e => handleLineItemChange(idx, 'uom_id', e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-slate-800 font-semibold text-xs focus:border-purple-600"
                          >
                            <option value="uom-01">Pcs (Pieces)</option>
                            <option value="uom-02">Box (Box of 20)</option>
                            <option value="uom-03">Kg (Kilograms)</option>
                            <option value="uom-04">Mtr (Meters)</option>
                            <option value="uom-05">Ltr (Liters)</option>
                            {uomsMaster.map(u => (
                              <option key={u.id} value={u.id}>{u.unit_symbol} ({u.unit_name})</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-slate-600 text-[10px] font-bold uppercase mb-1">Approved Qty</label>
                          <input 
                            type="number"
                            min="0"
                            value={line.approved_qty}
                            onChange={e => handleLineItemChange(idx, 'approved_qty', e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-mono text-xs focus:border-purple-600"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-600 text-[10px] font-bold uppercase mb-1">Estimated Rate (₹)</label>
                          <input 
                            type="number"
                            value={line.estimated_rate}
                            onChange={e => handleLineItemChange(idx, 'estimated_rate', e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-mono text-xs focus:border-purple-600"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-600 text-[10px] font-bold uppercase mb-1">Estimated Amount</label>
                          <input 
                            type="text"
                            disabled
                            value={`₹${(line.estimated_amount || 0).toLocaleString()}`}
                            className="w-full bg-slate-200/70 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-mono font-bold text-xs"
                          />
                        </div>
                      </div>

                      {line.item_id && (
                        <div className="bg-purple-50/80 p-2.5 rounded-lg border border-purple-200 flex flex-wrap items-center justify-between text-[11px] gap-2">
                          <div className="flex items-center space-x-1.5 font-bold text-purple-900">
                            <PackageCheck className="w-3.5 h-3.5 text-purple-700" />
                            <span>Available Stock Calculation:</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 font-mono">
                            <span className="bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-semibold" title="Current stock on hand">
                              Current: {stockInfo.current_stock}
                            </span>
                            <span className="bg-white text-rose-700 px-2 py-0.5 rounded border border-rose-200 font-semibold" title="Reserved stock">
                              Reserved: {stockInfo.reserved_stock}
                            </span>
                            <span className="bg-emerald-600 text-white px-2.5 py-0.5 rounded font-extrabold" title="Available stock = Current - Reserved">
                              Available Stock: {stockInfo.available_stock}
                            </span>
                            <span className="bg-white text-amber-800 px-2 py-0.5 rounded border border-amber-200" title="Reorder level">
                              Reorder: {stockInfo.reorder_level}
                            </span>
                            <span className="bg-white text-blue-700 px-2 py-0.5 rounded border border-blue-200" title="Open Purchase Order Qty">
                              Open PO: {stockInfo.open_po_qty}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-slate-600 text-[10px] font-bold uppercase mb-1">Required Date</label>
                          <input 
                            type="date"
                            value={line.required_date}
                            onChange={e => handleLineItemChange(idx, 'required_date', e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 text-xs focus:border-purple-600"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-600 text-[10px] font-bold uppercase mb-1">Preferred Brand</label>
                          <select 
                            value={line.preferred_brand_id}
                            onChange={e => handleLineItemChange(idx, 'preferred_brand_id', e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 text-xs focus:border-purple-600"
                          >
                            <option value="">Standard Brand</option>
                            {brandsMaster.map(b => (
                              <option key={b.id} value={b.id}>{b.brand_name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-slate-600 text-[10px] font-bold uppercase mb-1">Suggested Supplier</label>
                          <select 
                            value={line.suggested_supplier_id}
                            onChange={e => handleLineItemChange(idx, 'suggested_supplier_id', e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 text-xs focus:border-purple-600"
                          >
                            <option value="">No Preference</option>
                            {suppliersMaster.map(s => (
                              <option key={s.id} value={s.id}>{s.supplier_name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-slate-600 text-[10px] font-bold uppercase mb-1">Technical Specification</label>
                          <input 
                            type="text"
                            value={line.technical_spec}
                            onChange={e => handleLineItemChange(idx, 'technical_spec', e.target.value)}
                            placeholder="Technical specification details..."
                            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 text-xs focus:border-purple-600"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-600 text-[10px] font-bold uppercase mb-1">Attachment</label>
                          <div className="flex items-center space-x-2">
                            <input 
                              type="file"
                              id={`file-input-${idx}`}
                              className="hidden"
                              onChange={e => {
                                const file = e.target.files[0];
                                if (file) {
                                  handleLineItemChange(idx, 'attachment_name', file.name);
                                }
                              }}
                            />
                            <label 
                              htmlFor={`file-input-${idx}`}
                              className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold px-2 py-1 rounded-lg cursor-pointer flex items-center space-x-1 text-xs shrink-0"
                            >
                              <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                              <span>Upload File</span>
                            </label>
                            <span className="text-[11px] text-slate-600 truncate font-mono">
                              {line.attachment_name || 'No attachment'}
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-600 text-[10px] font-bold uppercase mb-1">Line Remarks</label>
                          <input 
                            type="text"
                            value={line.line_remarks}
                            onChange={e => handleLineItemChange(idx, 'line_remarks', e.target.value)}
                            placeholder="Additional line item remarks..."
                            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 text-xs focus:border-purple-600"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <span className="text-xs font-mono font-bold text-slate-800">
                Total Est Requisition Amount: ₹{form.items.reduce((s, i) => s + (Number(i.estimated_amount) || 0), 0).toLocaleString()}
              </span>
              <div className="flex items-center space-x-3">
                <button 
                  type="button" 
                  onClick={() => setShowFormModal(false)}
                  disabled={isSubmittingForm}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={() => handleSaveForm('Draft')}
                  disabled={isSubmittingForm}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs shadow-2xs transition disabled:opacity-50 flex items-center space-x-1"
                >
                  {isSubmittingForm ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>{isSubmittingForm ? 'Saving...' : 'Save Draft'}</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => handleSaveForm('Under review')}
                  disabled={isSubmittingForm}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-xs flex items-center space-x-1 transition disabled:opacity-50"
                >
                  {isSubmittingForm ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{isSubmittingForm ? 'Submitting...' : 'Submit for Review'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL & AUDIT HISTORY MODAL */}
      {detailModalIndent && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <span className="font-mono text-base font-bold text-purple-300 bg-purple-950 px-3 py-1 rounded-lg border border-purple-800">
                  {detailModalIndent.indent_number}
                </span>
                <StatusBadge status={detailModalIndent.status} />
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => {
                    setStatusUpdateModalIndent(detailModalIndent);
                    setTargetNewStatus(detailModalIndent.status);
                    setStatusReason('');
                  }}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1 shadow-2xs"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Change Status</span>
                </button>

                {(detailModalIndent.status === 'Cancelled' || detailModalIndent.status === 'Draft' || detailModalIndent.status === 'Rejected') && (
                  <button 
                    onClick={() => setDeleteModalIndent(detailModalIndent)}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1 shadow-2xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                )}
                <button 
                  onClick={() => setDetailModalIndent(null)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-slate-100 border-b border-slate-200 px-6 flex space-x-4 text-xs font-bold">
              <button 
                onClick={() => setActiveDetailTab('overview')}
                className={`py-3 border-b-2 transition ${activeDetailTab === 'overview' ? 'border-purple-600 text-purple-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              >
                Overview & All 14 Line Fields
              </button>
              <button 
                onClick={() => setActiveDetailTab('history')}
                className={`py-3 border-b-2 transition flex items-center space-x-1 ${activeDetailTab === 'history' ? 'border-purple-600 text-purple-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Status History & Audit</span>
              </button>
              <button 
                onClick={() => setActiveDetailTab('comments')}
                className={`py-3 border-b-2 transition flex items-center space-x-1 ${activeDetailTab === 'comments' ? 'border-purple-600 text-purple-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Comments ({detailModalIndent.comments?.length || 0})</span>
              </button>
            </div>

            {/* Modal Body Tabs */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              {activeDetailTab === 'overview' && (
                <div className="space-y-4">
                  {/* Summary Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Department</span>
                      <span className="font-bold text-slate-800">{detailModalIndent.department_name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Requested By</span>
                      <span className="font-bold text-slate-800">{detailModalIndent.requested_by_name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Required Date</span>
                      <span className="font-bold text-slate-800">{detailModalIndent.required_date}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Cost Centre</span>
                      <span className="font-bold font-mono text-purple-700">{detailModalIndent.cost_centre}</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Purpose</span>
                    <p className="font-bold text-slate-900">{detailModalIndent.purpose}</p>
                    {detailModalIndent.remarks && (
                      <p className="text-slate-500 text-[11px] pt-1"><strong>Remarks:</strong> {detailModalIndent.remarks}</p>
                    )}
                  </div>

                  {/* Detailed Line Items Table showing ALL 14 Line Fields */}
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                        <tr>
                          <th className="p-3">1. Item & 2. Description</th>
                          <th className="p-2">3. Req Qty</th>
                          <th className="p-2">6. Appr Qty</th>
                          <th className="p-2">4. Unit</th>
                          <th className="p-3">5. Stock Availability</th>
                          <th className="p-2">7. Est Rate</th>
                          <th className="p-2">8. Est Amount</th>
                          <th className="p-2">9. Req Date</th>
                          <th className="p-3">10 & 11. Brand & Supplier</th>
                          <th className="p-3">12, 13, 14. Specs, Attachment, Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {(detailModalIndent.items || []).map((item, i) => (
                          <tr key={i}>
                            <td className="p-3">
                              <span className="font-mono font-bold text-purple-700 block">{item.item_code}</span>
                              <span className="font-bold text-slate-900">{item.item_name}</span>
                              {item.description && <p className="text-slate-500 text-[10px] mt-0.5">{item.description}</p>}
                            </td>
                            <td className="p-2 font-mono font-bold">{item.requested_qty}</td>
                            <td className="p-2 font-mono text-emerald-700 font-semibold">{item.approved_qty || item.requested_qty}</td>
                            <td className="p-2 font-mono font-bold">{item.uom_symbol || 'Pcs'}</td>
                            <td className="p-3 font-mono">
                              <span className="text-slate-700 font-bold">Curr: {item.current_stock || 0}</span> |{' '}
                              <span className="text-rose-600 font-bold">Res: {item.reserved_stock || 0}</span> |{' '}
                              <span className="text-emerald-700 font-extrabold">Avail: {item.available_stock || 0}</span>
                            </td>
                            <td className="p-2 font-mono">₹{(item.estimated_rate || 0).toLocaleString()}</td>
                            <td className="p-2 font-mono font-bold text-slate-900">₹{(item.estimated_amount || 0).toLocaleString()}</td>
                            <td className="p-2 text-slate-600">{item.required_date || detailModalIndent.required_date}</td>
                            <td className="p-3 text-slate-700">
                              {item.preferred_brand_name && <span className="block font-semibold">Brand: {item.preferred_brand_name}</span>}
                              {item.suggested_supplier_name && <span className="block text-slate-500 text-[10px]">Supplier: {item.suggested_supplier_name}</span>}
                            </td>
                            <td className="p-3 text-slate-700 max-w-xs space-y-1">
                              {item.technical_spec && <p className="text-slate-900"><strong>Spec:</strong> {item.technical_spec}</p>}
                              {item.attachment_name && (
                                <p className="text-purple-700 font-bold flex items-center space-x-1 text-[10px]">
                                  <Paperclip className="w-3 h-3 shrink-0" />
                                  <span>{item.attachment_name}</span>
                                </p>
                              )}
                              {item.line_remarks && <p className="text-slate-500 italic">Remarks: {item.line_remarks}</p>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeDetailTab === 'history' && (
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Audit History Timeline</h4>
                  <div className="border-l-2 border-purple-200 pl-4 space-y-4">
                    {(detailModalIndent.history || []).map((h, i) => (
                      <div key={i} className="relative bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <div className="w-3 h-3 rounded-full bg-purple-600 absolute -left-[23px] top-4 border-2 border-white"></div>
                        <div className="flex justify-between items-center text-[11px] mb-1">
                          <span className="font-bold text-slate-800">{h.changed_by_name || 'System User'}</span>
                          <span className="text-slate-400 font-mono">{new Date(h.changed_at).toLocaleString()}</span>
                        </div>
                        <p className="text-slate-700">
                          Status changed: <span className="font-bold text-slate-900">{h.old_status || 'Created'}</span> &rarr; <span className="font-bold text-purple-700">{h.new_status}</span>
                        </p>
                        {h.reason && <p className="text-slate-500 text-[11px] mt-0.5">Reason: {h.reason}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeDetailTab === 'comments' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    {(detailModalIndent.comments || []).map((c, i) => (
                      <div key={i} className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <div className="flex justify-between items-center text-[11px] mb-1">
                          <span className="font-bold text-slate-800">{c.user_name}</span>
                          <span className="text-slate-400 font-mono">{new Date(c.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-slate-700 text-xs">{c.comment}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-slate-200">
                    <input 
                      type="text" 
                      value={newCommentText}
                      onChange={e => setNewCommentText(e.target.value)}
                      placeholder="Write a comment..." 
                      className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                    />
                    <button 
                      onClick={handleAddComment}
                      className="bg-purple-600 text-white font-bold px-4 py-2 rounded-xl text-xs"
                    >
                      Post Comment
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CANCEL MODAL WITH REASON */}
      {cancelModalId && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider font-heading flex items-center space-x-2">
              <Ban className="w-5 h-5 text-rose-600" />
              <span>Cancel Indent Requisition</span>
            </h3>
            <p className="text-xs text-slate-500">
              Please provide a mandatory cancellation reason for audit tracking:
            </p>
            <textarea 
              rows="3"
              required
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              placeholder="Enter mandatory cancellation reason..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-hidden focus:border-rose-500"
            />
            <div className="flex justify-end space-x-3 pt-2">
              <button 
                onClick={() => setCancelModalId(null)} 
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Back
              </button>
              <button 
                onClick={handleConfirmCancel} 
                disabled={!cancelReason.trim()}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-2xs"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATUS WORKFLOW TRANSITION MODAL (All 12 Statuses) */}
      {statusUpdateModalIndent && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <Sliders className="w-5 h-5 text-purple-700" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 font-heading">Update Requisition Status</h3>
                <p className="text-xs font-mono text-purple-700 font-bold">{statusUpdateModalIndent.indent_number}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Current Status</label>
                <div className="mb-2">
                  <StatusBadge status={statusUpdateModalIndent.status} />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Select New Status (12 Valid Statuses) *</label>
                <select 
                  value={targetNewStatus}
                  onChange={e => setTargetNewStatus(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:border-purple-600"
                >
                  <option value="Draft">Draft</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Under review">Under review</option>
                  <option value="Returned for correction">Returned for correction</option>
                  <option value="Partially approved">Partially approved</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Converted to RFQ">Converted to RFQ</option>
                  <option value="Partially fulfilled">Partially fulfilled</option>
                  <option value="Fulfilled">Fulfilled</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Transition Reason / Remarks</label>
                <textarea 
                  rows="2"
                  value={statusReason}
                  onChange={e => setStatusReason(e.target.value)}
                  placeholder="Reason for status change..."
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-800 focus:border-purple-600"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button 
                onClick={() => setStatusUpdateModalIndent(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmStatusUpdate}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Confirm Status Transition
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModalIndent && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 font-heading">Delete Indent Requisition</h3>
                <p className="text-xs font-mono text-purple-700 font-semibold">{deleteModalIndent.indent_number}</p>
              </div>
            </div>

            <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-xs text-rose-800 space-y-1">
              <p className="font-bold">Warning: This action cannot be undone.</p>
              <p className="text-[11px] text-rose-700">
                Deleting this indent will permanently remove the requisition header, all line items, status history timeline, comments, and audit records from the system database.
              </p>
            </div>

            <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <p><strong>Purpose:</strong> {deleteModalIndent.purpose}</p>
              <p><strong>Department:</strong> {deleteModalIndent.department_name}</p>
              <p><strong>Status:</strong> {deleteModalIndent.status}</p>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button 
                onClick={() => setDeleteModalIndent(null)} 
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmDelete} 
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-2xs flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT PREVIEW MODAL */}
      {printDoc && (
        <PrintModal 
          isOpen={!!printDoc} 
          onClose={() => setPrintDoc(null)} 
          docType="MATERIAL INDENT REQUISITION" 
          docData={printDoc} 
        />
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

            <button 
              type="button" 
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-white transition p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
