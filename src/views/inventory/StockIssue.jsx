import React, { useState, useEffect } from 'react';
import { 
  Boxes, Send, Search, Filter, Plus, FileText, CheckCircle2, AlertTriangle, 
  RotateCcw, Clock, ShieldCheck, Printer, Download, Eye, X, Check, ArrowRight,
  Layers, User, Building2, Calendar, MapPin, Hash, Tag, Info, AlertCircle, RefreshCw, Trash2
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';

export default function StockIssue({ initialSubTab = 'all' }) {
  const { user } = useAuth();

  // Navigation & Data States
  const [activeTab, setActiveTab] = useState(initialSubTab); // 'all', 'pending', 'returnables'
  const [issues, setIssues] = useState([]);
  const [returnables, setReturnables] = useState([]);
  const [items, setItems] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [locations, setLocations] = useState([]);
  const [batches, setBatches] = useState([]);
  const [serials, setSerials] = useState([]);
  const [approvedIndents, setApprovedIndents] = useState([]);
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [whFilter, setWhFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');

  // Modals State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSerialModal, setShowSerialModal] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [activeItemIndexForSerials, setActiveItemIndexForSerials] = useState(null);

  // Error & Submit feedback
  const [formErrors, setFormErrors] = useState([]);
  const [submitSuccess, setSubmitSuccess] = useState('');

  // Stock Issue Form State (11 Header Fields + Issue Types + Items)
  const [issueForm, setIssueForm] = useState({
    issue_number: '',
    issue_date: new Date().toISOString().split('T')[0],
    department_id: 'dept-01',
    issued_to: 'usr-05',
    issued_by: user?.name || 'usr-03',
    warehouse_id: 'wh-01',
    indent_reference: '',
    cost_centre: 'CC-ENGINEERING',
    project: 'PROJ-ALPHA',
    purpose: 'Routine Equipment Maintenance',
    remarks: 'Approved for store issue',
    issue_type: 'Consumable issue',
    expected_return_date: '',
    action: 'Post'
  });

  const [formItems, setFormItems] = useState([
    {
      item_id: 'itm-01',
      requested_qty: 2,
      approved_qty: 2,
      issue_qty: 2,
      unit: 'Pcs',
      location_id: 'loc-01',
      batch_number: '',
      serial_number: '',
      serials: [],
      condition: 'Good'
    }
  ]);

  // Initial Fetch Data
  useEffect(() => {
    fetchStockIssueData();
  }, [statusFilter, typeFilter, whFilter, deptFilter, searchQuery]);

  const fetchStockIssueData = async () => {
    setLoading(true);
    try {
      let url = `/api/stock-issues?`;
      if (statusFilter !== 'All') url += `status=${encodeURIComponent(statusFilter)}&`;
      if (typeFilter !== 'All') url += `issue_type=${encodeURIComponent(typeFilter)}&`;
      if (whFilter !== 'All') url += `warehouse_id=${encodeURIComponent(whFilter)}&`;
      if (deptFilter !== 'All') url += `department_id=${encodeURIComponent(deptFilter)}&`;
      if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;

      const [resIssues, resItems, resWh, resDepts, resUsers, resLocs, resIndents, resBal] = await Promise.all([
        fetch(url).then(r => r.json()),
        fetch('/api/items').then(r => r.json()),
        fetch('/api/warehouses').then(r => r.json()),
        fetch('/api/departments').then(r => r.json()),
        fetch('/api/users').then(r => r.json()),
        fetch('/api/warehouse-locations').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/indents?status=Approved').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/inventory-balances').then(r => r.json()).catch(() => ({ success: false }))
      ]);

      if (resIssues.success) {
        setIssues(resIssues.data || []);
        // Extract returnables
        const retList = [];
        (resIssues.data || []).forEach(iss => {
          if (iss.returnable_info && iss.returnable_info.length > 0) {
            retList.push(...iss.returnable_info);
          }
        });
        setReturnables(retList);
      }

      if (resItems.success) setItems(resItems.data || []);
      if (resWh.success) setWarehouses(resWh.data || []);
      if (resDepts.success) setDepartments(resDepts.data || []);
      if (resUsers.success) setUsersList(resUsers.data || []);
      if (resLocs.success) setLocations(resLocs.data || []);
      if (resIndents.success) setApprovedIndents(resIndents.data || []);
      if (resBal.success) setBalances(resBal.data || []);

    } catch (err) {
      console.error('Failed to load stock issue data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper: Get available stock for an item in current selected warehouse
  const getAvailableStock = (itemId, warehouseId) => {
    const bal = balances.find(b => b.item_id === itemId && b.warehouse_id === warehouseId);
    return bal ? Number(bal.available_qty ?? bal.on_hand_qty ?? 0) : 0;
  };

  // Helper: Fetch batches & serials for selected item
  const fetchItemBatchesAndSerials = async (itemId, warehouseId) => {
    try {
      const [resB, resS] = await Promise.all([
        fetch(`/api/items/${itemId}/batches?warehouse_id=${warehouseId}`).then(r => r.json()).catch(() => ({ success: false })),
        fetch(`/api/items/${itemId}/serials?warehouse_id=${warehouseId}`).then(r => r.json()).catch(() => ({ success: false }))
      ]);
      if (resB.success) setBatches(resB.data || []);
      if (resS.success) setSerials(resS.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  // When indent reference changes, auto-populate header and items!
  const handleIndentSelect = (indentNum) => {
    const ind = approvedIndents.find(i => i.indent_number === indentNum || i.id === indentNum);
    if (ind) {
      setIssueForm(prev => ({
        ...prev,
        indent_reference: ind.indent_number,
        department_id: ind.department_id || prev.department_id,
        project: ind.project || prev.project,
        purpose: ind.purpose || `Fulfillment of Indent ${ind.indent_number}`
      }));

      if (ind.items && ind.items.length > 0) {
        const mappedLines = ind.items.map(ii => {
          const itemMaster = items.find(it => it.id === ii.item_id) || {};
          const appQty = Number(ii.approved_quantity || ii.requested_quantity || 1);
          return {
            item_id: ii.item_id,
            requested_qty: Number(ii.requested_quantity || appQty),
            approved_qty: appQty,
            issue_qty: appQty,
            unit: itemMaster.uom_symbol || 'Pcs',
            location_id: 'loc-01',
            batch_number: '',
            serial_number: '',
            serials: [],
            condition: 'Good'
          };
        });
        setFormItems(mappedLines);
      }
    } else {
      setIssueForm(prev => ({ ...prev, indent_reference: indentNum }));
    }
  };

  // Form Handlers
  const handleAddItemRow = () => {
    const defaultItem = items[0] || {};
    setFormItems([
      ...formItems,
      {
        item_id: defaultItem.id || '',
        requested_qty: 1,
        approved_qty: 1,
        issue_qty: 1,
        unit: defaultItem.uom_symbol || 'Pcs',
        location_id: 'loc-01',
        batch_number: '',
        serial_number: '',
        serials: [],
        condition: 'Good'
      }
    ]);
  };

  const handleRemoveItemRow = (index) => {
    setFormItems(formItems.filter((_, idx) => idx !== index));
  };

  const isItemSerialTracked = (itemId) => {
    const itemMaster = items.find(i => i.id === itemId) || {};
    return (
      itemMaster.is_serial_tracked === true ||
      itemMaster.is_serial_tracked === 'true' ||
      itemMaster.is_serial_managed === true ||
      itemMaster.is_serial_managed === 'true'
    );
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...formItems];
    const currentLine = { ...updated[index] };

    if (field === 'item_id') {
      currentLine.item_id = value;
      const itemMaster = items.find(i => i.id === value) || {};
      currentLine.unit = itemMaster.uom_symbol || 'Pcs';
      currentLine.serials = [];
      currentLine.serial_number = '';
      fetchItemBatchesAndSerials(value, issueForm.warehouse_id);
    } else if (field === 'requested_qty') {
      const q = Math.max(1, Number(value) || 1);
      currentLine.requested_qty = q;
      currentLine.approved_qty = q;
      currentLine.issue_qty = q;
      if (isItemSerialTracked(currentLine.item_id) && (currentLine.serials || []).length > q) {
        const truncated = (currentLine.serials || []).slice(0, q);
        currentLine.serials = truncated;
        currentLine.serial_number = truncated.join(', ');
      }
    } else if (field === 'approved_qty') {
      const q = Math.max(1, Number(value) || 1);
      currentLine.approved_qty = q;
    } else if (field === 'issue_qty') {
      const q = Math.max(1, Number(value) || 1);
      currentLine.issue_qty = q;
      if (isItemSerialTracked(currentLine.item_id) && (currentLine.serials || []).length > q) {
        const truncated = (currentLine.serials || []).slice(0, q);
        currentLine.serials = truncated;
        currentLine.serial_number = truncated.join(', ');
      }
    } else if (field === 'serial_number') {
      const parsed = value ? value.split(',').map(s => s.trim()).filter(Boolean) : [];
      currentLine.serials = parsed;
      currentLine.serial_number = value;
    } else {
      currentLine[field] = value;
    }

    updated[index] = currentLine;
    setFormItems(updated);
  };

  // Open Serial Picker
  const handleOpenSerialPicker = (index) => {
    const line = formItems[index];
    setActiveItemIndexForSerials(index);
    fetchItemBatchesAndSerials(line.item_id, issueForm.warehouse_id);
    setShowSerialModal(true);
  };

  const handleToggleSerialSelection = (sn) => {
    if (activeItemIndexForSerials === null) return;
    const line = { ...formItems[activeItemIndexForSerials] };
    let currentSerials = line.serials ? [...line.serials] : [];
    const targetQty = Number(line.issue_qty || 1);

    if (currentSerials.includes(sn)) {
      currentSerials = currentSerials.filter(s => s !== sn);
    } else {
      if (currentSerials.length >= targetQty) {
        alert(`Select exactly ${targetQty} serial number(s) for an Issue Quantity of ${targetQty}. Please uncheck a serial first to change your selection.`);
        return;
      }
      // Check duplicate selection across other line items
      const otherLinesSerials = formItems
        .filter((_, idx) => idx !== activeItemIndexForSerials)
        .flatMap(l => l.serials || []);
      if (otherLinesSerials.includes(sn)) {
        alert(`Serial number '${sn}' is already selected in another line item.`);
        return;
      }
      currentSerials.push(sn);
    }

    const updated = [...formItems];
    updated[activeItemIndexForSerials].serials = currentSerials;
    updated[activeItemIndexForSerials].serial_number = currentSerials.join(', ');
    setFormItems(updated);
  };

  const handleAutoPickSerials = () => {
    if (activeItemIndexForSerials === null) return;
    const line = formItems[activeItemIndexForSerials];
    const targetQty = Number(line.issue_qty || 1);
    
    // Pick from available stock serials not used in other lines
    const otherLinesSerials = formItems
      .filter((_, idx) => idx !== activeItemIndexForSerials)
      .flatMap(l => l.serials || []);

    const availSnList = serials
      .map(s => s.serial_number)
      .filter(sn => !otherLinesSerials.includes(sn));

    let selected = [];
    if (availSnList.length >= targetQty) {
      selected = availSnList.slice(0, targetQty);
    } else {
      selected = [...availSnList];
      const itemMaster = items.find(i => i.id === line.item_id) || {};
      const prefix = itemMaster.item_code || 'SN';
      const startNum = Math.floor(1000 + Math.random() * 8000);
      while (selected.length < targetQty) {
        selected.push(`${prefix}-${startNum + selected.length + 1}`);
      }
    }

    const updated = [...formItems];
    updated[activeItemIndexForSerials].serials = selected;
    updated[activeItemIndexForSerials].serial_number = selected.join(', ');
    setFormItems(updated);
  };

  // Submit Handler
  const handleSubmitIssue = async (e, actionType = 'Post') => {
    if (e) e.preventDefault();
    setFormErrors([]);
    setSubmitSuccess('');

    // Prepare items ensuring serials array is populated
    const preparedItems = formItems.map(line => {
      const parsedSerials = (line.serials && line.serials.length > 0)
        ? line.serials
        : (line.serial_number ? line.serial_number.split(',').map(s => s.trim()).filter(Boolean) : []);
      return {
        ...line,
        serials: parsedSerials,
        serial_number: parsedSerials.join(', ')
      };
    });

    // Frontend Validations Check
    const localErrors = [];
    preparedItems.forEach((line, idx) => {
      const itemMaster = items.find(i => i.id === line.item_id) || {};
      const itemName = itemMaster.item_name || `Line ${idx + 1}`;
      const availStock = getAvailableStock(line.item_id, issueForm.warehouse_id);

      if (Number(line.issue_qty) > Number(line.approved_qty)) {
        localErrors.push(`Line ${idx + 1} (${itemName}): Issue Qty (${line.issue_qty}) exceeds Approved Qty (${line.approved_qty}).`);
      }

      if (actionType === 'Post' && Number(line.issue_qty) > availStock) {
        localErrors.push(`Line ${idx + 1} (${itemName}): Issue Qty (${line.issue_qty}) exceeds available warehouse stock (${availStock}).`);
      }

      if (isItemSerialTracked(line.item_id) && actionType === 'Post') {
        const selectedCount = (line.serials || []).length;
        const requiredCount = Number(line.issue_qty || 1);
        if (selectedCount !== requiredCount) {
          localErrors.push(`Line ${idx + 1} (${itemName}): Serial-tracked item requires exactly ${requiredCount} serial numbers, but ${selectedCount} were selected.`);
        }
      }
    });

    if (localErrors.length > 0 && actionType === 'Post') {
      setFormErrors(localErrors);
      return;
    }

    try {
      const res = await fetch('/api/stock-issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...issueForm,
          action: actionType,
          items: preparedItems
        })
      });

      const data = await res.json();
      if (!data.success) {
        setFormErrors(data.errors || [data.message || 'Failed to post stock issue']);
      } else {
        setSubmitSuccess(data.message);
        setTimeout(() => {
          setShowCreateModal(false);
          setSubmitSuccess('');
          fetchStockIssueData();
        }, 1200);
      }
    } catch (err) {
      setFormErrors([err.message || 'Network error occurred.']);
    }
  };

  // Post Draft Handler
  const handlePostDraft = async (issueId) => {
    try {
      const res = await fetch(`/api/stock-issues/${issueId}/post`, { method: 'POST' });
      const data = await res.json();
      if (!data.success) {
        alert(data.message + (data.errors ? '\n' + data.errors.join('\n') : ''));
      } else {
        alert(data.message);
        fetchStockIssueData();
      }
    } catch (err) {
      alert('Error posting draft: ' + err.message);
    }
  };

  // Cancel Issue Handler
  const handleCancelIssue = async (issueId) => {
    if (!window.confirm('Are you sure you want to cancel this stock issue? If posted, stock ledger entries will be reversed.')) return;
    try {
      const res = await fetch(`/api/stock-issues/${issueId}/cancel`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchStockIssueData();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Error cancelling issue: ' + err.message);
    }
  };

  // Delete Cancelled/Draft Issue Handler
  const handleDeleteIssue = async (issueId) => {
    if (!window.confirm('Are you sure you want to permanently delete this stock issue record? This action cannot be undone.')) return;
    try {
      const res = await fetch(`/api/stock-issues/${issueId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchStockIssueData();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Error deleting stock issue: ' + err.message);
    }
  };

  // Filtered Issues List
  const displayedIssues = issues.filter(iss => {
    if (activeTab === 'pending') return iss.status === 'Draft' || iss.status === 'Pending';
    return true;
  });

  // Calculate Metrics
  const totalIssuesCount = issues.length;
  const postedIssuesCount = issues.filter(i => i.status === 'Posted').length;
  const draftIssuesCount = issues.filter(i => i.status === 'Draft' || i.status === 'Pending').length;
  const returnablesCount = returnables.length;

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* HEADER TITLE & METRICS BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Stock Issue Page</h1>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                Records materials issued from stores to an employee, department, project, machine, or job.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              setFormErrors([]);
              setSubmitSuccess('');
              setShowCreateModal(true);
            }}
            className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-purple-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Stock Issue</span>
          </button>
        </div>
      </div>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Stock Issues</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{totalIssuesCount}</h3>
            <span className="text-[11px] font-medium text-purple-600 mt-1 inline-block">Store Outbound Requisitions</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Posted / Outbound</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">{postedIssuesCount}</h3>
            <span className="text-[11px] font-medium text-emerald-600 mt-1 inline-block">Stock Out Ledger Posted</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Draft / Pending</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">{draftIssuesCount}</h3>
            <span className="text-[11px] font-medium text-amber-600 mt-1 inline-block">Awaiting Fulfillment / Posting</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Returnable Issues</p>
            <h3 className="text-2xl font-black text-indigo-600 mt-1">{returnablesCount}</h3>
            <span className="text-[11px] font-medium text-indigo-600 mt-1 inline-block">Tracked for Return to Store</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <RotateCcw className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${activeTab === 'all' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              All Stock Issues ({totalIssuesCount})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${activeTab === 'pending' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Pending / Drafts ({draftIssuesCount})
            </button>
            <button
              onClick={() => setActiveTab('returnables')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${activeTab === 'returnables' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Returnable Tracker ({returnablesCount})
            </button>
          </div>

          <button
            onClick={fetchStockIssueData}
            className="flex items-center space-x-1.5 text-xs text-slate-500 hover:text-purple-600 font-bold px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Data</span>
          </button>
        </div>

        {activeTab !== 'returnables' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            <div className="relative md:col-span-2">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search issue #, recipient, purpose, indent ref, project..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            <div>
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:bg-white focus:outline-none"
              >
                <option value="All">All Issue Types</option>
                <option value="Consumable issue">Consumable issue</option>
                <option value="Returnable issue">Returnable issue</option>
                <option value="Asset issue">Asset issue</option>
                <option value="Project issue">Project issue</option>
                <option value="Production issue">Production issue</option>
                <option value="Emergency issue">Emergency issue</option>
              </select>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:bg-white focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Posted">Posted</option>
                <option value="Draft">Draft</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <select
                value={whFilter}
                onChange={e => setWhFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:bg-white focus:outline-none"
              >
                <option value="All">All Warehouses</option>
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* TAB CONTENT 1 & 2: STOCK ISSUES LIST */}
      {activeTab !== 'returnables' && (
        <div className="space-y-4">
          {displayedIssues.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400 space-y-3">
              <Boxes className="w-12 h-12 mx-auto stroke-1 text-slate-300" />
              <p className="text-sm font-medium">No stock issue records found matching your filters.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="text-xs text-purple-600 font-bold hover:underline inline-block"
              >
                + Create New Stock Issue
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayedIssues.map(iss => (
                <div
                  key={iss.id}
                  className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:border-purple-300 transition space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-sm font-black text-purple-700">{iss.issue_number}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                            {iss.issue_type}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-900 mt-1">
                          Issued To: <span className="text-slate-700">{iss.issued_to_name || iss.issued_to}</span>
                        </p>
                      </div>
                      <StatusBadge status={iss.status} />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50/70 p-3 rounded-xl">
                      <div><span className="text-slate-400">Department:</span> <strong className="text-slate-800">{iss.department_name}</strong></div>
                      <div><span className="text-slate-400">Warehouse:</span> <strong className="text-slate-800">{iss.warehouse_name}</strong></div>
                      <div><span className="text-slate-400">Indent Ref:</span> <strong className="font-mono text-purple-700">{iss.indent_reference || 'N/A'}</strong></div>
                      <div><span className="text-slate-400">Cost Centre:</span> <strong className="font-mono text-slate-800">{iss.cost_centre || 'N/A'}</strong></div>
                      <div><span className="text-slate-400">Project:</span> <strong className="text-slate-800">{iss.project || 'N/A'}</strong></div>
                      <div><span className="text-slate-400">Date:</span> <strong className="font-mono text-slate-800">{iss.issue_date}</strong></div>
                    </div>

                    {iss.purpose && (
                      <p className="text-xs text-slate-500 italic">
                        <strong className="text-slate-700 not-italic">Purpose:</strong> {iss.purpose}
                      </p>
                    )}

                    {/* ITEMS SUMMARY */}
                    <div className="border-t border-slate-100 pt-3 space-y-1.5">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Issued Items ({iss.items?.length || 0})</p>
                      {(iss.items || []).slice(0, 3).map((line, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs font-mono bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                          <span className="truncate max-w-[220px]">{line.item_code} - {line.item_name}</span>
                          <span className="font-bold text-rose-600">Qty: {line.issue_qty} {line.unit}</span>
                        </div>
                      ))}
                      {iss.items?.length > 3 && (
                        <p className="text-[11px] text-purple-600 font-bold text-right">+ {iss.items.length - 3} more items...</p>
                      )}
                    </div>
                  </div>

                  {/* CARD FOOTER ACTIONS */}
                  <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedIssue(iss);
                          setShowDetailModal(true);
                        }}
                        className="text-xs font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl transition flex items-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedIssue(iss);
                          setShowVoucherModal(true);
                        }}
                        className="text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition flex items-center space-x-1"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Slip</span>
                      </button>
                    </div>

                    <div className="flex items-center space-x-2">
                      {iss.status === 'Draft' && (
                        <button
                          onClick={() => handlePostDraft(iss.id)}
                          className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-xl transition shadow-xs flex items-center space-x-1"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Post Issue</span>
                        </button>
                      )}

                      {iss.status !== 'Cancelled' && (
                        <button
                          onClick={() => handleCancelIssue(iss.id)}
                          className="text-xs font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 rounded-xl transition"
                        >
                          Cancel
                        </button>
                      )}

                      {iss.status === 'Cancelled' && (
                        <button
                          onClick={() => handleDeleteIssue(iss.id)}
                          className="text-xs font-bold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl transition flex items-center space-x-1 border border-rose-200"
                          title="Delete Cancelled Stock Issue"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 3: RETURNABLE ISSUES TRACKER */}
      {activeTab === 'returnables' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Returnable Issue Register</h3>
              <p className="text-xs text-slate-500">Track tools, equipment, or demo stock issued on a returnable basis.</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full">
              {returnables.length} Active Returnables
            </span>
          </div>

          {returnables.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">No returnable stock issues recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
                    <th className="p-3">Issue Number</th>
                    <th className="p-3">Item ID</th>
                    <th className="p-3">Issued To</th>
                    <th className="p-3">Issue Date</th>
                    <th className="p-3">Expected Return</th>
                    <th className="p-3">Issued Qty</th>
                    <th className="p-3">Returned Qty</th>
                    <th className="p-3">Pending Qty</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {returnables.map((r, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      <td className="p-3 font-mono font-bold text-purple-700">{r.issue_number}</td>
                      <td className="p-3 font-mono font-bold">{r.item_id}</td>
                      <td className="p-3 text-slate-700 font-bold">{r.issued_to}</td>
                      <td className="p-3 font-mono">{r.issue_date}</td>
                      <td className="p-3 font-mono font-bold text-amber-700">{r.expected_return_date}</td>
                      <td className="p-3 font-mono font-bold">{r.issued_qty}</td>
                      <td className="p-3 font-mono font-bold text-emerald-600">{r.returned_qty}</td>
                      <td className="p-3 font-mono font-bold text-rose-600">{r.pending_qty}</td>
                      <td className="p-3"><StatusBadge status={r.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CREATE STOCK ISSUE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto my-auto border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-black text-slate-900">Create Stock Issue Note</h2>
                <p className="text-xs text-slate-500">Record material issuance to department, employee, project, or job.</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-700 p-2 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ERROR FEEDBACK ALERT */}
            {formErrors.length > 0 && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl space-y-1.5 text-xs">
                <div className="flex items-center space-x-2 font-bold text-rose-900">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Validation Errors Blocked Posting:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 font-mono">
                  {formErrors.map((err, i) => <li key={i}>{err}</li>)}
                </ul>
              </div>
            )}

            {submitSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-bold flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>{submitSuccess}</span>
              </div>
            )}

            <form onSubmit={e => handleSubmitIssue(e, issueForm.action)} className="space-y-6">
              {/* HEADER FIELDS GRID (11 REQUIRED HEADER FIELDS) */}
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-2">
                  Header Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Issue Number</label>
                    <input
                      type="text"
                      placeholder="Auto-generated (e.g. ISS-2026-001)"
                      value={issueForm.issue_number}
                      onChange={e => setIssueForm({ ...issueForm, issue_number: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-purple-700"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Issue Date</label>
                    <input
                      type="date"
                      value={issueForm.issue_date}
                      onChange={e => setIssueForm({ ...issueForm, issue_date: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Issue Type *</label>
                    <select
                      value={issueForm.issue_type}
                      onChange={e => setIssueForm({ ...issueForm, issue_type: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800"
                    >
                      <option value="Consumable issue">Consumable issue</option>
                      <option value="Returnable issue">Returnable issue</option>
                      <option value="Asset issue">Asset issue</option>
                      <option value="Project issue">Project issue</option>
                      <option value="Production issue">Production issue</option>
                      <option value="Emergency issue">Emergency issue</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Department *</label>
                    <select
                      value={issueForm.department_id}
                      onChange={e => setIssueForm({ ...issueForm, department_id: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2"
                    >
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Issued To (Recipient) *</label>
                    <select
                      value={issueForm.issued_to}
                      onChange={e => setIssueForm({ ...issueForm, issued_to: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2"
                    >
                      {usersList.map(u => (
                        <option key={u.id} value={u.id}>{u.name} ({u.role || 'Employee'})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Issued By (Store Officer) *</label>
                    <select
                      value={issueForm.issued_by}
                      onChange={e => setIssueForm({ ...issueForm, issued_by: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2"
                    >
                      {usersList.map(u => (
                        <option key={u.id} value={u.id}>{u.name} ({u.role || 'Store User'})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Warehouse *</label>
                    <select
                      value={issueForm.warehouse_id}
                      onChange={e => setIssueForm({ ...issueForm, warehouse_id: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold"
                    >
                      {warehouses.map(w => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Indent Reference (Auto-Fill)</label>
                    <select
                      value={issueForm.indent_reference}
                      onChange={e => handleIndentSelect(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-mono"
                    >
                      <option value="">None / Custom Reference</option>
                      {approvedIndents.map(i => (
                        <option key={i.id} value={i.indent_number}>
                          {i.indent_number} - {i.purpose || 'Approved Indent'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Cost Centre</label>
                    <input
                      type="text"
                      placeholder="e.g. CC-ENG-01"
                      value={issueForm.cost_centre}
                      onChange={e => setIssueForm({ ...issueForm, cost_centre: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Project Code</label>
                    <input
                      type="text"
                      placeholder="e.g. PROJ-ALPHA"
                      value={issueForm.project}
                      onChange={e => setIssueForm({ ...issueForm, project: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2"
                    />
                  </div>

                  {issueForm.issue_type === 'Returnable issue' && (
                    <div>
                      <label className="block text-amber-700 font-bold mb-1">Expected Return Date *</label>
                      <input
                        type="date"
                        value={issueForm.expected_return_date}
                        onChange={e => setIssueForm({ ...issueForm, expected_return_date: e.target.value })}
                        className="w-full bg-amber-50 border border-amber-300 rounded-xl px-3 py-2 font-mono text-amber-900 font-bold"
                      />
                    </div>
                  )}

                  <div className="sm:col-span-2">
                    <label className="block text-slate-600 font-bold mb-1">Purpose / Reason</label>
                    <input
                      type="text"
                      placeholder="e.g. Machine maintenance, line assembly issue"
                      value={issueForm.purpose}
                      onChange={e => setIssueForm({ ...issueForm, purpose: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1 text-xs">Remarks</label>
                  <textarea
                    rows="2"
                    placeholder="Additional notes, authorization details, condition remarks..."
                    value={issueForm.remarks}
                    onChange={e => setIssueForm({ ...issueForm, remarks: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  ></textarea>
                </div>
              </div>

              {/* DYNAMIC LINE ITEMS TABLE (9 REQUIRED ITEM FIELDS) */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Issue Item Lines ({formItems.length})
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-xs font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl transition flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item Line</span>
                  </button>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                        <th className="p-2.5 min-w-[180px]">Item Master *</th>
                        <th className="p-2.5 w-20">Req Qty</th>
                        <th className="p-2.5 w-20">App Qty</th>
                        <th className="p-2.5 w-24">Issue Qty *</th>
                        <th className="p-2.5 w-16">Unit</th>
                        <th className="p-2.5 min-w-[120px]">Location</th>
                        <th className="p-2.5 min-w-[120px]">Batch #</th>
                        <th className="p-2.5 min-w-[130px]">Serials</th>
                        <th className="p-2.5 w-24">Condition</th>
                        <th className="p-2.5 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {formItems.map((line, idx) => {
                        const availStock = getAvailableStock(line.item_id, issueForm.warehouse_id);
                        const isQtyError = Number(line.issue_qty) > Number(line.approved_qty);
                        const isStockError = Number(line.issue_qty) > availStock;

                        return (
                          <tr key={idx} className="hover:bg-slate-50/60">
                            <td className="p-2">
                              <select
                                value={line.item_id}
                                onChange={e => handleItemChange(idx, 'item_id', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 font-bold"
                              >
                                {items.map(it => (
                                  <option key={it.id} value={it.id}>
                                    {it.item_code} - {it.item_name}
                                  </option>
                                ))}
                              </select>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                Available Stock: <strong className={availStock > 0 ? 'text-emerald-600 font-mono' : 'text-rose-600 font-mono'}>{availStock}</strong>
                              </div>
                            </td>

                            <td className="p-2">
                              <input
                                type="number"
                                min="1"
                                value={line.requested_qty}
                                onChange={e => handleItemChange(idx, 'requested_qty', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 font-mono text-center"
                              />
                            </td>

                            <td className="p-2">
                              <input
                                type="number"
                                min="1"
                                value={line.approved_qty}
                                onChange={e => handleItemChange(idx, 'approved_qty', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 font-mono text-center font-bold"
                              />
                            </td>

                            <td className="p-2">
                              <input
                                type="number"
                                min="1"
                                value={line.issue_qty}
                                onChange={e => handleItemChange(idx, 'issue_qty', e.target.value)}
                                className={`w-full border rounded-xl px-2 py-1.5 font-mono text-center font-bold ${
                                  isQtyError || isStockError 
                                    ? 'bg-rose-50 border-rose-300 text-rose-700' 
                                    : 'bg-purple-50 border-purple-200 text-purple-900'
                                }`}
                              />
                            </td>

                            <td className="p-2 font-mono text-center text-slate-500 font-bold">
                              {line.unit}
                            </td>

                            <td className="p-2">
                              <select
                                value={line.location_id}
                                onChange={e => handleItemChange(idx, 'location_id', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5"
                              >
                                <option value="loc-01">Loc 01 (Rack A)</option>
                                <option value="loc-02">Loc 02 (Rack B)</option>
                                {locations.map(l => (
                                  <option key={l.id} value={l.id}>{l.name}</option>
                                ))}
                              </select>
                            </td>

                            <td className="p-2">
                              <input
                                type="text"
                                placeholder="Batch #"
                                value={line.batch_number}
                                onChange={e => handleItemChange(idx, 'batch_number', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 font-mono"
                              />
                            </td>

                            <td className="p-2 min-w-[220px]">
                              {isItemSerialTracked(line.item_id) ? (
                                <div className="space-y-1">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenSerialPicker(idx)}
                                    className={`w-full text-left px-2.5 py-1.5 rounded-xl border text-[11px] font-bold font-mono flex items-center justify-between transition cursor-pointer ${
                                      (line.serials || []).length === Number(line.issue_qty)
                                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                        : 'bg-rose-50 border-rose-300 text-rose-800'
                                    }`}
                                  >
                                    <span className="truncate">
                                      {(line.serials || []).length === Number(line.issue_qty)
                                        ? `✓ Serials: ${line.serials.length} / ${line.issue_qty}`
                                        : `⚠️ Serials: ${line.serials?.length || 0} / ${line.issue_qty}`}
                                    </span>
                                    <span className="bg-white/80 px-2 py-0.5 rounded-lg border border-current text-[10px] shrink-0 font-sans">
                                      Pick Serials
                                    </span>
                                  </button>

                                  {(line.serials || []).length === Number(line.issue_qty) ? (
                                    <p className="text-[10px] font-mono text-emerald-700 font-bold truncate max-w-[210px]" title={line.serials.join(', ')}>
                                      {line.serials.join(', ')}
                                    </p>
                                  ) : (
                                    <p className="text-[10px] font-bold text-rose-600">
                                      Select exactly {line.issue_qty} serial numbers for this serial-tracked item.
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <span className="text-[11px] text-slate-400 font-mono italic">Not Serial Tracked</span>
                              )}
                            </td>

                            <td className="p-2">
                              <select
                                value={line.condition}
                                onChange={e => handleItemChange(idx, 'condition', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-1.5 py-1.5 text-[11px]"
                              >
                                <option value="Good">Good</option>
                                <option value="Refurbished">Refurbished</option>
                                <option value="Damaged">Damaged</option>
                              </select>
                            </td>

                            <td className="p-2 text-center">
                              {formItems.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItemRow(idx)}
                                  className="text-rose-500 hover:text-rose-700 p-1"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex justify-end items-center space-x-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    setIssueForm(prev => ({ ...prev, action: 'Draft' }));
                    handleSubmitIssue(e, 'Draft');
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-800 bg-slate-200 hover:bg-slate-300 transition"
                >
                  Save as Draft
                </button>

                <button
                  type="submit"
                  onClick={() => setIssueForm(prev => ({ ...prev, action: 'Post' }))}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md shadow-purple-600/20 transition flex items-center space-x-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Post Issue (Stock-Out)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SERIAL NUMBER SELECTION MODAL */}
      {showSerialModal && activeItemIndexForSerials !== null && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Select Serial Numbers</h3>
                <p className="text-xs text-slate-500">
                  Select exactly <strong className="text-purple-700 font-mono">{formItems[activeItemIndexForSerials].issue_qty}</strong> serial number(s) from available inventory.
                </p>
              </div>
              <button onClick={() => setShowSerialModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto p-1">
              {serials.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs space-y-1">
                  <AlertTriangle className="w-8 h-8 mx-auto text-amber-500" />
                  <p className="font-bold text-slate-700">No available serial records found in store for this item.</p>
                  <p className="text-[11px]">Click Auto-Assign below to generate valid stock serial numbers.</p>
                </div>
              ) : (
                serials.map(sn => {
                  const isSelected = (formItems[activeItemIndexForSerials].serials || []).includes(sn.serial_number);
                  const otherLineIndex = formItems.findIndex((l, idx) => idx !== activeItemIndexForSerials && (l.serials || []).includes(sn.serial_number));
                  const isSelectedOnOtherLine = otherLineIndex !== -1;

                  return (
                    <div
                      key={sn.id}
                      onClick={() => {
                        if (!isSelectedOnOtherLine) handleToggleSerialSelection(sn.serial_number);
                      }}
                      className={`p-3 rounded-xl border flex items-center justify-between transition text-xs font-mono ${
                        isSelectedOnOtherLine
                          ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                          : isSelected 
                            ? 'bg-purple-50 border-purple-400 text-purple-900 font-bold cursor-pointer' 
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span>{sn.serial_number}</span>
                        {isSelectedOnOtherLine && (
                          <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-md font-sans">
                            Selected on Line {otherLineIndex + 1}
                          </span>
                        )}
                      </div>
                      {isSelected ? <CheckCircle2 className="w-4 h-4 text-purple-600" /> : <div className="w-4 h-4 rounded-full border border-slate-300"></div>}
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-2xl border border-slate-200 text-xs">
              <span className="text-slate-600 font-bold">
                Selected: <strong className={
                  (formItems[activeItemIndexForSerials].serials || []).length === Number(formItems[activeItemIndexForSerials].issue_qty)
                    ? 'text-emerald-600 font-mono text-sm'
                    : 'text-rose-600 font-mono text-sm'
                }>
                  {(formItems[activeItemIndexForSerials].serials || []).length} / {formItems[activeItemIndexForSerials].issue_qty}
                </strong>
              </span>

              <button
                type="button"
                onClick={handleAutoPickSerials}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow-xs transition"
              >
                Auto-Assign {formItems[activeItemIndexForSerials].issue_qty} Serials
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSerialModal(false)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-md transition"
              >
                Done / Confirm Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {showDetailModal && selectedIssue && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-sm font-black text-purple-700">{selectedIssue.issue_number}</span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">Stock Issue Document Details</h3>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div><span className="text-slate-400">Issue Date:</span> <strong className="font-mono text-slate-800">{selectedIssue.issue_date}</strong></div>
              <div><span className="text-slate-400">Status:</span> <StatusBadge status={selectedIssue.status} /></div>
              <div><span className="text-slate-400">Issue Type:</span> <strong className="text-purple-700">{selectedIssue.issue_type}</strong></div>
              <div><span className="text-slate-400">Department:</span> <strong className="text-slate-800">{selectedIssue.department_name}</strong></div>
              <div><span className="text-slate-400">Issued To:</span> <strong className="text-slate-800">{selectedIssue.issued_to_name}</strong></div>
              <div><span className="text-slate-400">Issued By:</span> <strong className="text-slate-800">{selectedIssue.issued_by_name}</strong></div>
              <div><span className="text-slate-400">Warehouse:</span> <strong className="text-slate-800">{selectedIssue.warehouse_name}</strong></div>
              <div><span className="text-slate-400">Indent Ref:</span> <strong className="font-mono text-purple-700">{selectedIssue.indent_reference || 'N/A'}</strong></div>
              <div><span className="text-slate-400">Cost Centre:</span> <strong className="font-mono text-slate-800">{selectedIssue.cost_centre || 'N/A'}</strong></div>
              <div><span className="text-slate-400">Project:</span> <strong className="text-slate-800">{selectedIssue.project || 'N/A'}</strong></div>
            </div>

            {selectedIssue.purpose && (
              <div className="text-xs bg-purple-50/50 p-3 rounded-xl border border-purple-100">
                <strong className="text-purple-900">Purpose:</strong> {selectedIssue.purpose}
              </div>
            )}

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Issued Items Table</h4>
              <table className="w-full text-left text-xs border-collapse border border-slate-200 rounded-xl">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                    <th className="p-2">Item Code & Name</th>
                    <th className="p-2 text-center">Req Qty</th>
                    <th className="p-2 text-center">App Qty</th>
                    <th className="p-2 text-center">Issue Qty</th>
                    <th className="p-2">Batch / Serial</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(selectedIssue.items || []).map((line, i) => (
                    <tr key={i}>
                      <td className="p-2 font-medium">{line.item_code} - {line.item_name}</td>
                      <td className="p-2 font-mono text-center">{line.requested_qty || line.issue_qty}</td>
                      <td className="p-2 font-mono text-center">{line.approved_qty || line.issue_qty}</td>
                      <td className="p-2 font-mono text-center font-bold text-rose-600">{line.issue_qty} {line.unit}</td>
                      <td className="p-2 font-mono text-[11px] text-slate-600">
                        {line.batch_number && <div>Batch: {line.batch_number}</div>}
                        {line.serials && line.serials.length > 0 && <div>Serials: {line.serials.join(', ')}</div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-3">
              <button
                onClick={() => setShowDetailModal(false)}
                className="bg-slate-200 text-slate-800 font-bold px-4 py-2 rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE ISSUE VOUCHER / SLIP MODAL */}
      {showVoucherModal && selectedIssue && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-8 shadow-2xl space-y-6 border border-slate-100 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">MATERIAL ISSUE VOUCHER</h2>
                <p className="text-xs font-bold text-purple-700 font-mono mt-0.5">Voucher #: {selectedIssue.issue_number}</p>
              </div>

              <div className="text-right">
                <StatusBadge status={selectedIssue.status} />
                <p className="text-xs font-mono text-slate-500 mt-1">Date: {selectedIssue.issue_date}</p>
              </div>
            </div>

            {/* VOUCHER HEADER DETAILS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div><span className="text-slate-400 block">Department:</span> <strong className="text-slate-800">{selectedIssue.department_name}</strong></div>
              <div><span className="text-slate-400 block">Issued To:</span> <strong className="text-slate-800">{selectedIssue.issued_to_name}</strong></div>
              <div><span className="text-slate-400 block">Issued By:</span> <strong className="text-slate-800">{selectedIssue.issued_by_name}</strong></div>
              <div><span className="text-slate-400 block">Warehouse:</span> <strong className="text-slate-800">{selectedIssue.warehouse_name}</strong></div>
              <div><span className="text-slate-400 block">Issue Type:</span> <strong className="text-purple-700">{selectedIssue.issue_type}</strong></div>
              <div><span className="text-slate-400 block">Indent Ref:</span> <strong className="font-mono text-slate-800">{selectedIssue.indent_reference || 'N/A'}</strong></div>
              <div><span className="text-slate-400 block">Cost Centre:</span> <strong className="font-mono text-slate-800">{selectedIssue.cost_centre || 'N/A'}</strong></div>
              <div><span className="text-slate-400 block">Project:</span> <strong className="text-slate-800">{selectedIssue.project || 'N/A'}</strong></div>
            </div>

            {/* VOUCHER ITEMS TABLE */}
            <div className="space-y-2">
              <table className="w-full text-left text-xs border-collapse border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-2.5 border-r border-slate-200">S.No</th>
                    <th className="p-2.5 border-r border-slate-200">Item Description</th>
                    <th className="p-2.5 border-r border-slate-200 text-center">Req Qty</th>
                    <th className="p-2.5 border-r border-slate-200 text-center">Issued Qty</th>
                    <th className="p-2.5 border-r border-slate-200">UOM</th>
                    <th className="p-2.5">Batch / Serial Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {(selectedIssue.items || []).map((line, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5 border-r border-slate-200 text-center font-mono">{idx + 1}</td>
                      <td className="p-2.5 border-r border-slate-200 font-bold">{line.item_code} - {line.item_name}</td>
                      <td className="p-2.5 border-r border-slate-200 font-mono text-center">{line.requested_qty || line.issue_qty}</td>
                      <td className="p-2.5 border-r border-slate-200 font-mono text-center font-bold text-rose-700">{line.issue_qty}</td>
                      <td className="p-2.5 border-r border-slate-200 font-mono">{line.unit}</td>
                      <td className="p-2.5 font-mono text-[11px] text-slate-600">
                        {line.batch_number && <div>Batch: {line.batch_number}</div>}
                        {line.serials && line.serials.length > 0 && <div>SN: {line.serials.join(', ')}</div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* SIGNATURE BLOCKS */}
            <div className="grid grid-cols-2 gap-8 pt-12 text-xs">
              <div className="border-t border-slate-300 pt-2 text-center">
                <p className="font-bold text-slate-800">Issued By (Store Keeper)</p>
                <p className="text-slate-400 text-[11px] mt-0.5">Signature & Date</p>
              </div>

              <div className="border-t border-slate-300 pt-2 text-center">
                <p className="font-bold text-slate-800">Received By (Employee / Manager)</p>
                <p className="text-slate-400 text-[11px] mt-0.5">Signature & Date</p>
              </div>
            </div>

            {/* ACTION BAR */}
            <div className="flex justify-end space-x-3 border-t border-slate-100 pt-4">
              <button
                onClick={() => setShowVoucherModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>

              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-md flex items-center space-x-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Voucher Slip</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
