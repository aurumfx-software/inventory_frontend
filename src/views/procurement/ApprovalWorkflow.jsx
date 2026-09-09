import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckSquare, Check, X, RotateCcw, Send, UserCheck, ShieldAlert, Clock, 
  Search, Filter, Plus, Calendar, AlertTriangle, Layers, Building2, User, 
  DollarSign, CheckCircle2, ChevronRight, Sliders, ArrowRight, Trash2, Edit3, MessageSquare, AlertCircle, RefreshCw, BookOpen, ShieldCheck, GitCommit, FileText
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';

export default function ApprovalWorkflow() {
  const { user } = useAuth();

  // Active Tab: 'inbox' | 'history' | 'workflows' | 'delegations' | 'guide'
  const [activeTab, setActiveTab] = useState('inbox');

  // Primary Data States
  const [approvals, setApprovals] = useState([]);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [delegations, setDelegations] = useState([]);
  const [usersMaster, setUsersMaster] = useState([]);
  const [departmentsMaster, setDepartmentsMaster] = useState([]);
  const [categoriesMaster, setCategoriesMaster] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filtering for Inbox
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Active Action Modal & Form States
  const [selectedApp, setSelectedApp] = useState(null);
  const [actionType, setActionType] = useState('Approve'); // 'Approve' | 'Return' | 'Reject' | 'Forward' | 'Delegate'
  const [actionComments, setActionComments] = useState('');
  const [forwardUserId, setForwardUserId] = useState('');
  const [delegateUserId, setDelegateUserId] = useState('');
  const [lineItemsState, setLineItemsState] = useState([]);

  // Workflow Rule Modal State
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [editingWorkflowId, setEditingWorkflowId] = useState(null);
  const [workflowForm, setWorkflowForm] = useState({
    name: 'Standard High Value Indent Approval Matrix',
    transaction_type: 'INDENT',
    department_id: 'ALL',
    branch_id: 'ALL',
    item_category_id: 'ALL',
    min_amount: 0,
    max_amount: '',
    urgency: 'ALL',
    steps: [
      { step_number: 1, step_name: 'Department Manager Approval', approver_role_id: 'role-dept-mgr', min_amount: 0, can_change_qty: true, can_approve_lines: true },
      { step_number: 2, step_name: 'Store Manager Stock Check', approver_role_id: 'role-store', min_amount: 0, can_change_qty: true, can_approve_lines: true },
      { step_number: 3, step_name: 'Purchase Manager Review', approver_role_id: 'role-purchase', min_amount: 0, can_change_qty: true, can_approve_lines: true },
      { step_number: 4, step_name: 'Finance Manager Sign-off (> ₹100,000)', approver_role_id: 'role-finance', min_amount: 100000, can_change_qty: false, can_approve_lines: true },
      { step_number: 5, step_name: 'Director Approval (> ₹500,000)', approver_role_id: 'role-admin', min_amount: 500000, can_change_qty: false, can_approve_lines: true }
    ]
  });

  // Delegation Modal State
  const [showDelegationModal, setShowDelegationModal] = useState(false);
  const [delegationForm, setDelegationForm] = useState({
    delegator_id: user?.id || 'usr-04',
    delegatee_id: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    remarks: 'Vacation approval delegation'
  });

  // Floating Toast Notification State
  const [toast, setToast] = useState(null);

  const showToast = (type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Initial Fetch with instant local cache for 0ms page transitions
  useEffect(() => {
    try {
      const cached = localStorage.getItem('app_approval_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.approvals) setApprovals(parsed.approvals);
        if (parsed.historyLogs) setHistoryLogs(parsed.historyLogs);
        if (parsed.workflows) setWorkflows(parsed.workflows);
        if (parsed.delegations) setDelegations(parsed.delegations);
        if (parsed.usersMaster) setUsersMaster(parsed.usersMaster);
        if (parsed.departmentsMaster) setDepartmentsMaster(parsed.departmentsMaster);
        if (parsed.categoriesMaster) setCategoriesMaster(parsed.categoriesMaster);
        setIsLoading(false);
      }
    } catch (e) {
      console.warn('Cache error:', e);
    }

    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    if (!localStorage.getItem('app_approval_cache')) {
      setIsLoading(true);
    }
    try {
      const [appRes, histRes, wfRes, delRes, usersRes, deptsRes, catRes] = await Promise.all([
        fetch('/api/approvals').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/approvals/history').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/approvals/workflows').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/approvals/delegations').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/users').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/departments').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/masters/item-categories').then(r => r.json()).catch(() => ({ success: false }))
      ]);

      const cacheObj = {};
      if (appRes && appRes.success) { setApprovals(appRes.data || []); cacheObj.approvals = appRes.data || []; }
      if (histRes && histRes.success) { setHistoryLogs(histRes.data || []); cacheObj.historyLogs = histRes.data || []; }
      if (wfRes && wfRes.success) { setWorkflows(wfRes.data || []); cacheObj.workflows = wfRes.data || []; }
      if (delRes && delRes.success) { setDelegations(delRes.data || []); cacheObj.delegations = delRes.data || []; }
      if (usersRes && usersRes.success) { setUsersMaster(usersRes.data || []); cacheObj.usersMaster = usersRes.data || []; }
      if (deptsRes && deptsRes.success) { setDepartmentsMaster(deptsRes.data || []); cacheObj.departmentsMaster = deptsRes.data || []; }
      if (catRes && catRes.success) { setCategoriesMaster(catRes.data || []); cacheObj.categoriesMaster = catRes.data || []; }

      if (Object.keys(cacheObj).length > 0) {
        localStorage.setItem('app_approval_cache', JSON.stringify(cacheObj));
      }
    } catch (err) {
      console.error('Failed to load approval workflow data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtered Inbox Requests
  const filteredInbox = useMemo(() => {
    return approvals.filter(app => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        app.transaction_id?.toLowerCase().includes(q) ||
        app.txnDetails?.doc_number?.toLowerCase().includes(q) ||
        app.txnDetails?.requested_by?.toLowerCase().includes(q) ||
        app.txnDetails?.department?.toLowerCase().includes(q) ||
        app.txnDetails?.purpose?.toLowerCase().includes(q)
      );

      const matchesType = typeFilter === 'ALL' || app.transaction_type === typeFilter;
      const matchesStatus = statusFilter === 'ALL' || app.status?.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [approvals, searchQuery, typeFilter, statusFilter]);

  // KPI Calculations
  const stats = useMemo(() => {
    const totalPending = approvals.filter(a => a.status === 'Pending').length;
    const approvedCount = historyLogs.filter(h => h.action === 'Approve').length;
    const returnedCount = historyLogs.filter(h => h.action === 'Return' || h.action === 'Returned for correction').length;
    const rejectedCount = historyLogs.filter(h => h.action === 'Reject').length;
    const activeDelCount = delegations.filter(d => d.is_active !== false).length;
    return { totalPending, approvedCount, returnedCount, rejectedCount, activeDelCount };
  }, [approvals, historyLogs, delegations]);

  // Open Action Modal Handler
  const handleOpenActionModal = (app, defaultAction = 'Approve') => {
    setSelectedApp(app);
    setActionType(defaultAction);
    setActionComments('');
    setForwardUserId(usersMaster[0]?.id || '');
    setDelegateUserId(usersMaster[0]?.id || '');

    if (app.txnDetails?.items) {
      setLineItemsState(app.txnDetails.items.map(item => ({
        id: item.id,
        item_code: item.item_code,
        item_name: item.item_name,
        category_name: item.category_name || 'General',
        requested_qty: item.requested_qty || 1,
        approved_qty: item.approved_qty !== undefined ? item.approved_qty : item.requested_qty || 1,
        is_approved: item.is_approved !== false
      })));
    } else {
      setLineItemsState([]);
    }
  };

  // Submit Approval Action
  const handleSubmitAction = async () => {
    if (!selectedApp) return;

    if ((actionType === 'Reject' || actionType === 'Return') && (!actionComments || !actionComments.trim())) {
      showToast('danger', 'Mandatory Comment Required', `Please enter an explanation comment for ${actionType} action.`);
      return;
    }

    try {
      const payload = {
        action: actionType,
        comments: actionComments,
        user_id: user?.id || 'usr-04',
        user_name: user?.name || 'Department Manager',
        approved_items: lineItemsState,
        forward_user_id: forwardUserId,
        delegate_user_id: delegateUserId,
        is_admin_override: user?.role_id === 'role-admin'
      };

      const res = await fetch(`/api/approvals/${selectedApp.id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setSelectedApp(null);
        fetchAllData();
        const typeLabel = actionType === 'Approve' ? 'Approved' : actionType === 'Return' ? 'Returned for Correction' : actionType;
        showToast(
          actionType === 'Approve' ? 'success' : actionType === 'Return' ? 'warning' : 'danger',
          `Request ${typeLabel}`,
          data.message || `Transaction ${selectedApp.txnDetails?.doc_number || selectedApp.transaction_id} ${typeLabel.toLowerCase()}.`
        );
      } else {
        showToast('danger', 'Action Failed', data.message || 'Failed to process approval action.');
      }
    } catch (err) {
      console.error('Approval action error:', err);
      showToast('danger', 'Server Error', 'Failed to execute approval action.');
    }
  };

  // Step Handler for Workflow Builder Modal
  const handleAddStepToForm = () => {
    const nextNum = (workflowForm.steps || []).length + 1;
    const newStep = {
      step_number: nextNum,
      step_name: `Step ${nextNum} Reviewer`,
      approver_role_id: 'role-purchase',
      min_amount: nextNum === 4 ? 100000 : nextNum === 5 ? 500000 : 0,
      can_change_qty: true,
      can_approve_lines: true
    };
    setWorkflowForm({ ...workflowForm, steps: [...workflowForm.steps, newStep] });
  };

  const handleRemoveStepFromForm = (index) => {
    const updated = workflowForm.steps.filter((_, i) => i !== index).map((s, idx) => ({
      ...s,
      step_number: idx + 1
    }));
    setWorkflowForm({ ...workflowForm, steps: updated });
  };

  // Edit Workflow Rule
  const handleEditWorkflow = (wf) => {
    setEditingWorkflowId(wf.id);
    setWorkflowForm({
      name: wf.name || '',
      transaction_type: wf.transaction_type || 'INDENT',
      department_id: wf.department_id || 'ALL',
      branch_id: wf.branch_id || 'ALL',
      item_category_id: wf.item_category_id || 'ALL',
      min_amount: wf.min_amount || 0,
      max_amount: wf.max_amount !== null && wf.max_amount !== undefined ? wf.max_amount : '',
      urgency: wf.urgency || 'ALL',
      steps: wf.steps || []
    });
    setShowWorkflowModal(true);
  };

  // Save Workflow Rule
  const handleSaveWorkflow = async () => {
    if (!workflowForm.name || !workflowForm.transaction_type) {
      showToast('danger', 'Validation Error', 'Workflow name and transaction type are required.');
      return;
    }

    try {
      const url = '/api/approvals/workflows';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...workflowForm,
          id: editingWorkflowId
        })
      });

      const data = await res.json();
      if (data.success) {
        setShowWorkflowModal(false);
        fetchAllData();
        showToast('success', 'Workflow Rule Saved', data.message || 'Workflow matrix rule saved successfully.');
      } else {
        showToast('danger', 'Save Failed', data.message);
      }
    } catch (err) {
      console.error('Error saving workflow rule:', err);
      showToast('danger', 'Server Error', 'Failed to save workflow rule.');
    }
  };

  const handleDeleteWorkflow = async (id) => {
    try {
      const res = await fetch(`/api/approvals/workflows/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchAllData();
        showToast('warning', 'Workflow Rule Deleted', 'Workflow matrix rule removed.');
      }
    } catch (err) {
      console.error('Error deleting workflow rule:', err);
    }
  };

  // Save Delegation Rule
  const handleSaveDelegation = async () => {
    if (!delegationForm.delegatee_id || !delegationForm.start_date || !delegationForm.end_date) {
      showToast('danger', 'Validation Error', 'Select delegatee user and valid date range.');
      return;
    }

    if (delegationForm.start_date > delegationForm.end_date) {
      showToast('danger', 'Invalid Date Range', 'Start date cannot be later than end date.');
      return;
    }

    try {
      const res = await fetch('/api/approvals/delegations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(delegationForm)
      });

      const data = await res.json();
      if (data.success) {
        setShowDelegationModal(false);
        fetchAllData();
        showToast('success', 'Delegation Rule Active', data.message || 'Approval delegation rule active.');
      } else {
        showToast('danger', 'Save Failed', data.message);
      }
    } catch (err) {
      console.error('Error saving delegation rule:', err);
      showToast('danger', 'Server Error', 'Failed to save delegation rule.');
    }
  };

  const handleDeleteDelegation = async (id) => {
    try {
      const res = await fetch(`/api/approvals/delegations/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchAllData();
        showToast('warning', 'Delegation Revoked', 'Approval delegation rule revoked.');
      }
    } catch (err) {
      console.error('Error revoking delegation rule:', err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Inbox</p>
            <h3 className="text-xl font-bold text-amber-700 font-heading">{stats.totalPending}</h3>
            <span className="text-[10px] text-amber-600 font-medium">Awaiting Your Action</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Approved Requests</p>
            <h3 className="text-xl font-bold text-emerald-700 font-heading">{stats.approvedCount}</h3>
            <span className="text-[10px] text-emerald-600 font-medium">Completed Workflows</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Returned for Correction</p>
            <h3 className="text-xl font-bold text-purple-700 font-heading">{stats.returnedCount}</h3>
            <span className="text-[10px] text-purple-600 font-medium">Sent back to requester</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <X className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Rejected Requests</p>
            <h3 className="text-xl font-bold text-rose-700 font-heading">{stats.rejectedCount}</h3>
            <span className="text-[10px] text-rose-600 font-medium">Declined requisitions</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Delegations</p>
            <h3 className="text-xl font-bold text-indigo-700 font-heading">{stats.activeDelCount}</h3>
            <span className="text-[10px] text-indigo-600 font-medium">Temporary Authority</span>
          </div>
        </div>
      </div>

      {/* Control Header & Tabs Navigation */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-heading flex items-center space-x-2">
              <CheckSquare className="w-5 h-5 text-purple-600" />
              <span>Multi-Level Approval Workflows Page</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Control transaction authorization, line-level quantity sign-offs, audit trails & approval matrix rules.
            </p>
          </div>

        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
          <button 
            onClick={() => setActiveTab('inbox')}
            className={`px-4 py-2 rounded-xl transition flex items-center space-x-2 ${
              activeTab === 'inbox' ? 'bg-purple-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Pending Inbox ({stats.totalPending})</span>
          </button>

          <button 
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl transition flex items-center space-x-2 ${
              activeTab === 'history' ? 'bg-purple-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Audit History & Trail ({historyLogs.length})</span>
          </button>
        </div>

        {/* Filter Controls for Inbox */}
        {activeTab === 'inbox' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input 
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search Doc #, requester, purpose..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-800 focus:outline-hidden focus:border-purple-500"
              />
            </div>

            <div>
              <select 
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden focus:border-purple-500 font-medium"
              >
                <option value="ALL">All Transaction Types</option>
                <option value="INDENT">Material Indent (INDENT)</option>
                <option value="PO">Purchase Order (PO)</option>
                <option value="REQUISITION">Material Requisition</option>
              </select>
            </div>

            <div>
              <select 
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden focus:border-purple-500 font-medium"
              >
                <option value="ALL">All Request Statuses</option>
                <option value="Pending">Pending Review</option>
                <option value="Approved">Approved</option>
                <option value="Returned for correction">Returned for Correction</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* TAB 1: PENDING APPROVALS INBOX */}
      {activeTab === 'inbox' && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-slate-400 space-y-2">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-purple-600" />
              <p className="text-xs font-semibold">Loading approval requests inbox...</p>
            </div>
          ) : filteredInbox.length === 0 ? (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-slate-500 space-y-3">
              <CheckSquare className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-sm text-slate-800">No pending approval requests</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                All submitted transaction requisitions have been processed or approved.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInbox.map(app => {
                const isAdmin = user?.role_id === 'role-admin';
                const isSelfRequest = app.txnDetails?.requested_by_id === user?.id;
                const isBlockedSelfApproval = isSelfRequest && !isAdmin;
                const reqAmount = app.txnDetails?.amount || 0;
                const isFinanceThreshold = reqAmount >= 100000;
                const isDirectorThreshold = reqAmount >= 500000;
                const isUrgent = app.txnDetails?.priority === 'Urgent' || app.txnDetails?.priority === 'Emergency';

                return (
                  <div 
                    key={app.id} 
                    className={`bg-white border rounded-2xl p-5 shadow-2xs space-y-4 transition ${
                      isUrgent ? 'border-rose-300 bg-rose-50/10' : 'border-slate-200/80 hover:border-purple-300'
                    }`}
                  >
                    {/* Header Bar */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-100 pb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-purple-50 text-purple-700 border border-purple-200 font-mono text-xs font-bold px-2.5 py-1 rounded-lg">
                          {app.transaction_type}
                        </span>
                        <span className="font-mono text-sm font-bold text-slate-900">
                          {app.txnDetails?.doc_number || app.transaction_id}
                        </span>
                        <StatusBadge status={app.status} />

                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono">
                          Approval Level {app.approval_level || 1}
                        </span>

                        {isUrgent && (
                          <span className="bg-rose-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-extrabold animate-pulse">
                            {app.txnDetails?.priority} Urgency
                          </span>
                        )}

                        {isDirectorThreshold ? (
                          <span className="bg-rose-100 text-rose-900 border border-rose-300 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            Director Threshold (&gt;₹500k)
                          </span>
                        ) : isFinanceThreshold ? (
                          <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            Finance Threshold (&gt;₹100k)
                          </span>
                        ) : null}
                      </div>

                      <div className="text-xs text-slate-500 font-mono flex items-center space-x-2">
                        <span>Assigned: {app.assigned_date ? new Date(app.assigned_date).toLocaleDateString() : 'Today'}</span>
                        <span className="text-slate-300">&bull;</span>
                        <span className="text-slate-700 font-semibold">Approver: {app.approver_name}</span>
                      </div>
                    </div>

                    {/* Self-Approval Restrict Alert Banner */}
                    {isBlockedSelfApproval && (
                      <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs p-3 rounded-xl flex items-center space-x-2 font-medium">
                        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>
                          <strong>Self-Approval Notice:</strong> Under compliance rules, standard users cannot approve their own request. Another authorized manager must sign off.
                        </span>
                      </div>
                    )}

                    {isSelfRequest && isAdmin && (
                      <div className="bg-purple-50 border border-purple-200 text-purple-900 text-xs p-3 rounded-xl flex items-center space-x-2 font-medium">
                        <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
                        <span>
                          <strong>Super Administrator Privilege:</strong> As a Super Administrator, you have authorization to approve your own requisition request.
                        </span>
                      </div>
                    )}

                    {/* Details Grid */}
                    {app.txnDetails && (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Department & Branch</span>
                          <span className="text-slate-900 font-bold">{app.txnDetails.department} ({app.txnDetails.branch || 'Main Branch'})</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Requested By & Role</span>
                          <span className="text-slate-900 font-bold">{app.txnDetails.requested_by} ({app.txnDetails.user_designation || 'Staff'})</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Purpose / Project</span>
                          <span className="text-slate-900 font-semibold line-clamp-1">{app.txnDetails.purpose} [{app.txnDetails.project}]</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Estimated Total Value</span>
                          <span className="text-emerald-700 font-mono font-extrabold text-sm">₹{(app.txnDetails.amount || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    )}

                    {/* Line Items Table Preview */}
                    {app.txnDetails?.items && app.txnDetails.items.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Line Items Sign-Off Preview ({app.txnDetails.items.length} items)
                        </span>
                        <div className="overflow-x-auto border border-slate-200 rounded-xl">
                          <table className="w-full text-xs text-left">
                            <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                              <tr>
                                <th className="py-2 px-3">Item Code & Name</th>
                                <th className="py-2 px-2">Category</th>
                                <th className="py-2 px-2">Requested Qty</th>
                                <th className="py-2 px-2">Approved Qty</th>
                                <th className="py-2 px-2">Est Rate</th>
                                <th className="py-2 px-2">Total Amount</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                              {app.txnDetails.items.map((line, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/60 font-mono">
                                  <td className="py-2 px-3">
                                    <span className="font-bold text-purple-700 mr-2">{line.item_code}</span>
                                    <span className="font-sans font-semibold text-slate-900">{line.item_name}</span>
                                  </td>
                                  <td className="py-2 px-2 font-sans text-slate-600 text-[11px]">{line.category_name || 'General'}</td>
                                  <td className="py-2 px-2 font-bold text-slate-900">{line.requested_qty}</td>
                                  <td className="py-2 px-2 font-bold text-emerald-700">{line.approved_qty || line.requested_qty}</td>
                                  <td className="py-2 px-2 text-slate-700">₹{(line.estimated_rate || line.valuation_rate || 0).toLocaleString()}</td>
                                  <td className="py-2 px-2 font-bold text-slate-900">₹{(line.estimated_amount || (line.requested_qty * (line.estimated_rate || 0))).toLocaleString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Action Bar */}
                    {app.status === 'Pending' && (
                      <div className="flex flex-wrap justify-between items-center border-t border-slate-100 pt-3 gap-2">
                        <div className="flex items-center space-x-2 text-xs">
                          <span className="text-slate-400 font-medium">Available Actions:</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button 
                            disabled={isBlockedSelfApproval}
                            onClick={() => handleOpenActionModal(app, 'Approve')}
                            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center space-x-1 shadow-2xs transition cursor-pointer disabled:cursor-not-allowed"
                            title={isBlockedSelfApproval ? 'Self-approval restricted' : 'Approve Request / Adjust Quantities & Lines'}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve / Line Qty</span>
                          </button>

                          <button 
                            onClick={() => handleOpenActionModal(app, 'Return')}
                            className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center space-x-1 shadow-2xs transition cursor-pointer"
                            title="Return for Correction with mandatory comment"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Return for Correction</span>
                          </button>

                          <button 
                            disabled={isBlockedSelfApproval}
                            onClick={() => handleOpenActionModal(app, 'Reject')}
                            className="bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center space-x-1 shadow-2xs transition cursor-pointer disabled:cursor-not-allowed"
                            title="Reject Requisition with mandatory comment"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>

                          <button 
                            onClick={() => handleOpenActionModal(app, 'Forward')}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1 transition"
                            title="Forward request to another manager"
                          >
                            <Send className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Forward</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: APPROVAL AUDIT LOG & HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider font-heading flex items-center space-x-2">
            <MessageSquare className="w-4 h-4 text-purple-600" />
            <span>Immutable Approval Audit Trail Log</span>
          </h3>

          {historyLogs.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-6 text-center">No approval audit actions recorded yet.</p>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="py-2.5 px-3">Date & Time</th>
                    <th className="py-2.5 px-3">Transaction ID & Type</th>
                    <th className="py-2.5 px-3">Approval Level</th>
                    <th className="py-2.5 px-3">Approver</th>
                    <th className="py-2.5 px-2">Action</th>
                    <th className="py-2.5 px-3">Rationale Comment</th>
                    <th className="py-2.5 px-3">Status Transition</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {historyLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">
                        {new Date(log.action_date).toLocaleString()}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-purple-700">
                        {log.transaction_type} #{log.transaction_id}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-700">
                        Level {log.approval_level || 1}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-800">
                        {log.approver_name}
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          log.action === 'Approve' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                          log.action === 'Reject' ? 'bg-rose-50 text-rose-700 border-rose-300' :
                          log.action === 'Return' || log.action === 'Returned for correction' ? 'bg-purple-50 text-purple-700 border-purple-300' :
                          'bg-indigo-50 text-indigo-700 border-indigo-300'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-700 max-w-xs truncate">
                        {log.comment || 'N/A'}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px]">
                        <span className="text-slate-400">{log.previous_status || 'Pending'}</span>
                        <span className="text-slate-400 mx-1">&rarr;</span>
                        <span className="font-bold text-slate-900">{log.new_status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* APPROVAL ACTION MODAL (Approve, Return, Reject, Forward, Delegate) */}
      {selectedApp && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm uppercase tracking-wider font-heading flex items-center space-x-2">
                  <CheckSquare className="w-4 h-4 text-purple-400" />
                  <span>Execute Approval Action &ndash; {actionType}</span>
                </h3>
                <p className="text-[11px] text-slate-300 font-mono mt-0.5">
                  {selectedApp.transaction_type} #{selectedApp.txnDetails?.doc_number || selectedApp.transaction_id} (Level {selectedApp.approval_level || 1})
                </p>
              </div>
              <button onClick={() => setSelectedApp(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
              {/* Action Selector Buttons */}
              <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
                <button 
                  onClick={() => setActionType('Approve')}
                  className={`px-3.5 py-2 rounded-xl font-bold transition flex items-center space-x-1.5 ${
                    actionType === 'Approve' ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>Approve</span>
                </button>

                <button 
                  onClick={() => setActionType('Return')}
                  className={`px-3.5 py-2 rounded-xl font-bold transition flex items-center space-x-1.5 ${
                    actionType === 'Return' ? 'bg-purple-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Return for Correction</span>
                </button>

                <button 
                  onClick={() => setActionType('Reject')}
                  className={`px-3.5 py-2 rounded-xl font-bold transition flex items-center space-x-1.5 ${
                    actionType === 'Reject' ? 'bg-rose-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <X className="w-4 h-4" />
                  <span>Reject</span>
                </button>

                <button 
                  onClick={() => setActionType('Forward')}
                  className={`px-3.5 py-2 rounded-xl font-bold transition flex items-center space-x-1.5 ${
                    actionType === 'Forward' ? 'bg-indigo-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>Forward</span>
                </button>

                <button 
                  onClick={() => setActionType('Delegate')}
                  className={`px-3.5 py-2 rounded-xl font-bold transition flex items-center space-x-1.5 ${
                    actionType === 'Delegate' ? 'bg-blue-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Delegate</span>
                </button>
              </div>

              {/* Line Items Approval & Approved Quantity Adjustment */}
              {actionType === 'Approve' && lineItemsState.length > 0 && (
                <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex justify-between items-center">
                    <span>Approve Selected Lines & Change Quantities</span>
                    <span className="text-[10px] text-slate-400 lowercase font-normal">Check line to approve</span>
                  </h4>
                  <div className="space-y-2">
                    {lineItemsState.map((line, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 gap-3">
                        <div className="flex items-center space-x-3 flex-1">
                          <input 
                            type="checkbox"
                            checked={line.is_approved !== false}
                            onChange={e => {
                              const updated = [...lineItemsState];
                              updated[idx].is_approved = e.target.checked;
                              setLineItemsState(updated);
                            }}
                            className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                          />
                          <div>
                            <span className="font-mono font-bold text-purple-700 text-[11px] mr-2">{line.item_code}</span>
                            <span className="text-slate-900 font-bold text-xs">{line.item_name}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-[11px]">
                            <span className="text-slate-400 block font-bold text-[10px]">Req Qty</span>
                            <span className="font-mono font-bold text-slate-800">{line.requested_qty}</span>
                          </div>
                          <div>
                            <label className="block text-slate-600 font-bold text-[10px]">Approved Qty</label>
                            <input 
                              type="number"
                              min="0"
                              max={line.requested_qty}
                              value={line.approved_qty}
                              disabled={!line.is_approved}
                              onChange={e => {
                                const updated = [...lineItemsState];
                                updated[idx].approved_qty = Number(e.target.value);
                                setLineItemsState(updated);
                              }}
                              className="w-20 bg-white border border-slate-300 rounded-lg px-2 py-1 font-mono font-bold text-xs disabled:opacity-40"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Forward User Selector */}
              {actionType === 'Forward' && (
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Select User to Forward Request To *</label>
                  <select 
                    value={forwardUserId}
                    onChange={e => setForwardUserId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold"
                  >
                    {usersMaster.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role_id || u.role || 'Manager'})</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Delegate User Selector */}
              {actionType === 'Delegate' && (
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Select Delegatee User for Sign-off *</label>
                  <select 
                    value={delegateUserId}
                    onChange={e => setDelegateUserId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold"
                  >
                    {usersMaster.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role_id || u.role || 'Manager'})</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Remarks / Mandatory Reason Textarea */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  {actionType === 'Reject' || actionType === 'Return' ? 'Mandatory Rationale Comment *' : 'Approval Comments / Remarks'}
                </label>
                <textarea 
                  rows="3"
                  required={actionType === 'Reject' || actionType === 'Return'}
                  value={actionComments}
                  onChange={e => setActionComments(e.target.value)}
                  placeholder={
                    actionType === 'Reject' ? 'Provide mandatory rejection rationale...' :
                    actionType === 'Return' ? 'Specify required corrections for the requester...' :
                    'Optional approval remarks...'
                  }
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-hidden focus:border-purple-600"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-3">
              <button 
                onClick={() => setSelectedApp(null)} 
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmitAction} 
                className={`px-4 py-2 text-white font-bold text-xs rounded-xl shadow-2xs ${
                  actionType === 'Approve' ? 'bg-emerald-600 hover:bg-emerald-700' :
                  actionType === 'Reject' ? 'bg-rose-600 hover:bg-rose-700' :
                  actionType === 'Return' ? 'bg-purple-600 hover:bg-purple-700' :
                  'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                Confirm {actionType}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT WORKFLOW RULE MODAL */}
      {showWorkflowModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm uppercase tracking-wider font-heading flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-purple-400" />
                <span>{editingWorkflowId ? 'Edit Approval Workflow Rule' : 'Configure Approval Workflow Matrix'}</span>
              </h3>
              <button onClick={() => setShowWorkflowModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Workflow Rule Name *</label>
                <input 
                  type="text" 
                  value={workflowForm.name}
                  onChange={e => setWorkflowForm({ ...workflowForm, name: e.target.value })}
                  placeholder="e.g. High Value Purchase Order Approval Matrix"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Transaction Type</label>
                  <select 
                    value={workflowForm.transaction_type}
                    onChange={e => setWorkflowForm({ ...workflowForm, transaction_type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold"
                  >
                    <option value="INDENT">Material Indent (INDENT)</option>
                    <option value="PO">Purchase Order (PO)</option>
                    <option value="REQUISITION">Material Requisition</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Department Scope</label>
                  <select 
                    value={workflowForm.department_id}
                    onChange={e => setWorkflowForm({ ...workflowForm, department_id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold"
                  >
                    <option value="ALL">All Departments</option>
                    {departmentsMaster.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Item Category Scope</label>
                  <select 
                    value={workflowForm.item_category_id || 'ALL'}
                    onChange={e => setWorkflowForm({ ...workflowForm, item_category_id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold"
                  >
                    <option value="ALL">All Item Categories</option>
                    {categoriesMaster.map(c => (
                      <option key={c.id} value={c.id}>{c.category_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Min Value Threshold (₹)</label>
                  <input 
                    type="number" 
                    value={workflowForm.min_amount}
                    onChange={e => setWorkflowForm({ ...workflowForm, min_amount: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Max Value Threshold (₹)</label>
                  <input 
                    type="number" 
                    value={workflowForm.max_amount !== null && workflowForm.max_amount !== undefined ? workflowForm.max_amount : ''}
                    onChange={e => setWorkflowForm({ ...workflowForm, max_amount: e.target.value !== '' ? Number(e.target.value) : '' })}
                    placeholder="Leave empty for unlimited"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Urgency Condition</label>
                  <select 
                    value={workflowForm.urgency || 'ALL'}
                    onChange={e => setWorkflowForm({ ...workflowForm, urgency: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold"
                  >
                    <option value="ALL">All Priorities</option>
                    <option value="Normal">Normal Priority</option>
                    <option value="High">High Priority</option>
                    <option value="Urgent">Urgent / Emergency</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800 uppercase text-[11px] tracking-wider block">Sequential Approval Sequence Steps</span>
                  <button 
                    onClick={handleAddStepToForm}
                    className="bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-bold px-2.5 py-1 rounded-lg border border-purple-200 transition"
                  >
                    + Add Step
                  </button>
                </div>

                {(workflowForm.steps || []).map((step, idx) => (
                  <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                    <div className="grid grid-cols-4 gap-2 items-center">
                      <div>
                        <span className="font-mono text-[10px] font-bold text-purple-700 block">Step {idx + 1} Name</span>
                        <input 
                          type="text"
                          value={step.step_name}
                          onChange={e => {
                            const updated = [...workflowForm.steps];
                            updated[idx].step_name = e.target.value;
                            setWorkflowForm({ ...workflowForm, steps: updated });
                          }}
                          className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-bold text-xs"
                        />
                      </div>
                      <div>
                        <span className="font-mono text-[10px] font-bold text-slate-500 block">Approver Role</span>
                        <select 
                          value={step.approver_role_id}
                          onChange={e => {
                            const updated = [...workflowForm.steps];
                            updated[idx].approver_role_id = e.target.value;
                            setWorkflowForm({ ...workflowForm, steps: updated });
                          }}
                          className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 text-xs font-semibold"
                        >
                          <option value="role-dept-mgr">Dept Manager (role-dept-mgr)</option>
                          <option value="role-store">Store Manager (role-store)</option>
                          <option value="role-purchase">Purchase Manager (role-purchase)</option>
                          <option value="role-finance">Finance Manager (role-finance)</option>
                          <option value="role-admin">Super Admin / Director (role-admin)</option>
                        </select>
                      </div>
                      <div>
                        <span className="font-mono text-[10px] font-bold text-slate-500 block">Min Value Trigger (₹)</span>
                        <input 
                          type="number"
                          value={step.min_amount || 0}
                          onChange={e => {
                            const updated = [...workflowForm.steps];
                            updated[idx].min_amount = Number(e.target.value);
                            setWorkflowForm({ ...workflowForm, steps: updated });
                          }}
                          className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 text-xs font-mono font-bold"
                        />
                      </div>
                      <div className="flex justify-end items-end pt-4">
                        <button 
                          onClick={() => handleRemoveStepFromForm(idx)}
                          className="text-rose-600 hover:text-rose-800 text-xs font-bold p-1"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-3">
              <button onClick={() => setShowWorkflowModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">
                Cancel
              </button>
              <button onClick={handleSaveWorkflow} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs">
                Save Workflow Matrix
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD DELEGATION MODAL */}
      {showDelegationModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider font-heading flex items-center space-x-2">
              <UserCheck className="w-5 h-5 text-indigo-600" />
              <span>Add Approval Delegation Rule</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Delegatee (Acting Approver) *</label>
                <select 
                  value={delegationForm.delegatee_id}
                  onChange={e => setDelegationForm({ ...delegationForm, delegatee_id: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold"
                >
                  <option value="">-- Choose Delegatee User --</option>
                  {usersMaster.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role_id || u.role || 'Manager'})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Start Date *</label>
                  <input 
                    type="date"
                    value={delegationForm.start_date}
                    onChange={e => setDelegationForm({ ...delegationForm, start_date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">End Date *</label>
                  <input 
                    type="date"
                    value={delegationForm.end_date}
                    onChange={e => setDelegationForm({ ...delegationForm, end_date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Remarks / Reason</label>
                <textarea 
                  rows="2"
                  value={delegationForm.remarks}
                  onChange={e => setDelegationForm({ ...delegationForm, remarks: e.target.value })}
                  placeholder="Reason for delegating approval authority..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button onClick={() => setShowDelegationModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">
                Cancel
              </button>
              <button onClick={handleSaveDelegation} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-2xs">
                Activate Delegation
              </button>
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
              {toast.type === 'danger' && <X className="w-5 h-5" />}
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
