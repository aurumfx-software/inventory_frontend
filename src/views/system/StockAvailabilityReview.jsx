import React, { useState, useEffect, useMemo } from 'react';
import { 
  ClipboardCheck, CheckCircle2, ShoppingCart, Send, AlertTriangle, X, 
  Search, Filter, RefreshCw, Layers, ArrowRight, ShieldAlert, Check, DollarSign, PackageCheck, AlertCircle, RefreshCcw
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';

export default function StockAvailabilityReview() {
  const { user } = useAuth();

  // Primary Data States
  const [queue, setQueue] = useState([]);
  const [itemsMaster, setItemsMaster] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, issue-full, partial, purchase-full, reviewed

  // Active Review Modal State
  const [selectedIndent, setSelectedIndent] = useState(null);
  const [selectedLine, setSelectedLine] = useState(null);
  const [actionChoice, setActionChoice] = useState('partial'); // issue-full, purchase-full, partial, substitute, reject
  const [customIssueQty, setCustomIssueQty] = useState(0);
  const [substituteItemId, setSubstituteItemId] = useState('');
  const [actionReason, setActionReason] = useState('');

  // Floating Toast Notification
  const [toast, setToast] = useState(null);

  const showToast = (type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  useEffect(() => {
    fetchReviewData();
  }, []);

  const fetchReviewData = async () => {
    setIsLoading(true);
    try {
      const [queueRes, itemsRes] = await Promise.all([
        fetch('/api/indents/stock-review-queue').then(r => r.json()),
        fetch('/api/items').then(r => r.json()).catch(() => ({ success: true, data: [] }))
      ]);

      if (queueRes.success) setQueue(queueRes.data || []);
      if (itemsRes.success) setItemsMaster(itemsRes.data || []);
    } catch (err) {
      console.error('Failed to load stock availability review queue:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // KPI Metrics Calculations
  const stats = useMemo(() => {
    let totalPendingLines = 0;
    let fullIssueLines = 0;
    let partialSplitLines = 0;
    let fullPurchaseLines = 0;
    let totalSavingsValue = 0;

    queue.forEach(indent => {
      (indent.items || []).forEach(line => {
        if (line.review_status === 'Under Review' || !line.review_status) {
          totalPendingLines++;
          if (line.suggested_action === 'issue-full') fullIssueLines++;
          else if (line.suggested_action === 'partial') partialSplitLines++;
          else if (line.suggested_action === 'purchase-full') fullPurchaseLines++;
        }
        
        // Calculate savings from issued stock instead of buying new
        const issuedQty = Number(line.issue_from_stock_qty || 0);
        const rate = Number(line.valuation_rate || line.estimated_rate || 0);
        totalSavingsValue += (issuedQty * rate);
      });
    });

    return { totalPendingLines, fullIssueLines, partialSplitLines, fullPurchaseLines, totalSavingsValue };
  }, [queue]);

  // Filtered Queue Items
  const filteredQueue = useMemo(() => {
    return queue.filter(indent => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        indent.indent_number?.toLowerCase().includes(q) ||
        indent.requested_by_name?.toLowerCase().includes(q) ||
        indent.department_name?.toLowerCase().includes(q) ||
        (indent.items || []).some(i => i.item_code?.toLowerCase().includes(q) || i.item_name?.toLowerCase().includes(q))
      );

      let matchesTab = true;
      if (activeTab === 'issue-full') {
        matchesTab = (indent.items || []).some(i => i.suggested_action === 'issue-full' && (i.review_status === 'Under Review' || !i.review_status));
      } else if (activeTab === 'partial') {
        matchesTab = (indent.items || []).some(i => i.suggested_action === 'partial' && (i.review_status === 'Under Review' || !i.review_status));
      } else if (activeTab === 'purchase-full') {
        matchesTab = (indent.items || []).some(i => i.suggested_action === 'purchase-full' && (i.review_status === 'Under Review' || !i.review_status));
      } else if (activeTab === 'reviewed') {
        matchesTab = (indent.items || []).some(i => i.review_status && i.review_status !== 'Under Review');
      } else {
        // ALL tab: show indents that have at least one line item
        matchesTab = (indent.items || []).length > 0;
      }

      return matchesSearch && matchesTab;
    });
  }, [queue, searchQuery, activeTab]);

  // Open Decision Modal
  const handleOpenReviewModal = (indent, line) => {
    setSelectedIndent(indent);
    setSelectedLine(line);

    const available = line.available_qty || 0;
    const reqQty = line.requested_qty || 1;

    let defaultChoice = 'partial';
    if (available >= reqQty) {
      defaultChoice = 'issue-full';
    } else if (available === 0) {
      defaultChoice = 'purchase-full';
    }

    setActionChoice(defaultChoice);
    setCustomIssueQty(Math.min(available, reqQty));
    setSubstituteItemId(itemsMaster.find(i => i.id !== line.item_id && i.is_active !== false)?.id || '');
    setActionReason('');
  };

  // Submit Review Action
  const handleExecuteReviewAction = async (e) => {
    e.preventDefault();
    if (!selectedIndent || !selectedLine) return;

    if (actionChoice === 'reject' && (!actionReason || !actionReason.trim())) {
      showToast('danger', 'Mandatory Explanation', 'Please enter a reason for rejecting the request.');
      return;
    }

    try {
      const reqQty = selectedLine.requested_qty || 1;
      let finalIssueQty = 0;
      let finalPurchaseQty = 0;

      if (actionChoice === 'issue-full') {
        finalIssueQty = reqQty;
        finalPurchaseQty = 0;
      } else if (actionChoice === 'purchase-full') {
        finalIssueQty = 0;
        finalPurchaseQty = reqQty;
      } else if (actionChoice === 'partial') {
        finalIssueQty = Number(customIssueQty);
        finalPurchaseQty = Math.max(0, reqQty - finalIssueQty);
      }

      const payload = {
        indent_id: selectedIndent.id,
        line_item_id: selectedLine.id,
        action_choice: actionChoice,
        issue_qty: finalIssueQty,
        purchase_qty: finalPurchaseQty,
        substitute_item_id: actionChoice === 'substitute' ? substituteItemId : null,
        reason: actionReason,
        user_id: user?.id || 'usr-03'
      };

      const res = await fetch('/api/indents/stock-review-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setSelectedIndent(null);
        setSelectedLine(null);
        fetchReviewData();
        showToast('success', 'Stock Action Executed', data.message || 'Stock availability review completed.');
      } else {
        showToast('danger', 'Action Error', data.message || 'Failed to process stock review.');
      }
    } catch (err) {
      console.error('Error applying stock review action:', err);
      showToast('danger', 'Server Error', 'Failed to execute stock availability review.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* KPI Stats Header Bar */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <ClipboardCheck className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Line Reviews</p>
            <h3 className="text-xl font-bold text-purple-700 font-heading">{stats.totalPendingLines}</h3>
            <span className="text-[10px] text-purple-600 font-medium">Store Queue</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <PackageCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Full Stock Available</p>
            <h3 className="text-xl font-bold text-emerald-700 font-heading">{stats.fullIssueLines}</h3>
            <span className="text-[10px] text-emerald-600 font-medium">Issue Directly</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Partial Split Required</p>
            <h3 className="text-xl font-bold text-amber-700 font-heading">{stats.partialSplitLines}</h3>
            <span className="text-[10px] text-amber-600 font-medium">Issue Stock + Procure</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Full Purchase Needed</p>
            <h3 className="text-xl font-bold text-rose-700 font-heading">{stats.fullPurchaseLines}</h3>
            <span className="text-[10px] text-rose-600 font-medium">Out of Stock</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Purchasing Cost Saved</p>
            <h3 className="text-lg font-mono font-extrabold text-indigo-700">₹{stats.totalSavingsValue.toLocaleString()}</h3>
            <span className="text-[10px] text-indigo-600 font-medium">Existing Inventory Used</span>
          </div>
        </div>
      </div>

      {/* Control Header & Tabs Navigation */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-heading flex items-center space-x-2">
              <ClipboardCheck className="w-5 h-5 text-purple-600" />
              <span>Stock Availability Review Page</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review stock availability per requested indent line to prevent unnecessary purchasing and split between Stock Issue & RFQ Procurement.
            </p>
          </div>
        </div>

        {/* Tab Buttons & Search */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex flex-wrap gap-2 text-xs font-bold">
            <button 
              onClick={() => setActiveTab('ALL')}
              className={`px-3.5 py-1.5 rounded-xl transition ${
                activeTab === 'ALL' ? 'bg-purple-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Indents Queue
            </button>

            <button 
              onClick={() => setActiveTab('issue-full')}
              className={`px-3.5 py-1.5 rounded-xl transition ${
                activeTab === 'issue-full' ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Ready for Full Issue ({stats.fullIssueLines})
            </button>

            <button 
              onClick={() => setActiveTab('partial')}
              className={`px-3.5 py-1.5 rounded-xl transition ${
                activeTab === 'partial' ? 'bg-amber-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Partial Split Required ({stats.partialSplitLines})
            </button>

            <button 
              onClick={() => setActiveTab('purchase-full')}
              className={`px-3.5 py-1.5 rounded-xl transition ${
                activeTab === 'purchase-full' ? 'bg-rose-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Full Purchase Needed ({stats.fullPurchaseLines})
            </button>

            <button 
              onClick={() => setActiveTab('reviewed')}
              className={`px-3.5 py-1.5 rounded-xl transition ${
                activeTab === 'reviewed' ? 'bg-indigo-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Reviewed & Processed
            </button>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64 text-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input 
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search Doc #, item code, requester..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-800 focus:outline-hidden focus:border-purple-500"
              />
            </div>

            <button 
              onClick={fetchReviewData}
              title="Refresh Review Queue"
              className="bg-slate-100 hover:bg-purple-100 text-slate-600 hover:text-purple-700 p-2.5 rounded-xl transition flex items-center justify-center shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Review Queue Cards */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-slate-400 space-y-2">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-purple-600" />
            <p className="text-xs font-semibold">Loading stock review queue...</p>
          </div>
        ) : filteredQueue.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-slate-500 space-y-3">
            <ClipboardCheck className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-sm text-slate-800">No requisitions match active filter</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              All submitted indent requisitions have been reviewed for stock availability.
            </p>
          </div>
        ) : (
          filteredQueue.map(indent => (
            <div key={indent.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-4 transition hover:border-purple-300">
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-bold text-purple-700">{indent.indent_number}</span>
                  <StatusBadge status={indent.status} />
                  <span className="text-xs text-slate-500">Requested: {indent.request_date}</span>
                  <span className="text-slate-300">&bull;</span>
                  <span className="text-xs text-slate-800 font-bold">Dept: {indent.department_name}</span>
                  <span className="text-slate-300">&bull;</span>
                  <span className="text-xs text-slate-700">Requester: {indent.requested_by_name}</span>
                </div>

                <div className="text-xs font-mono font-extrabold text-emerald-700">
                  Total Est: ₹{(indent.total_estimated_amount || 0).toLocaleString()}
                </div>
              </div>

              {/* Line Items Stock Breakdown Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Item Code & Name</th>
                      <th className="py-2.5 px-2">Requested Qty</th>
                      <th className="py-2.5 px-2">On-Hand Stock</th>
                      <th className="py-2.5 px-2">Reserved Qty</th>
                      <th className="py-2.5 px-2">Available Qty</th>
                      <th className="py-2.5 px-2">Issue / Procure Outcome</th>
                      <th className="py-2.5 px-3">Review Status</th>
                      <th className="py-2.5 px-2">Store Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white font-mono">
                    {(indent.items || []).map((line, idx) => {
                      const isFullIssue = line.available_qty >= line.requested_qty;
                      const isPartial = line.available_qty > 0 && line.available_qty < line.requested_qty;
                      const isOutOfStock = line.available_qty === 0;

                      return (
                        <tr key={idx} className="hover:bg-slate-50/60">
                          <td className="py-3 px-3 font-sans">
                            <span className="font-mono font-bold text-purple-700 mr-2">{line.item_code}</span>
                            <span className="font-bold text-slate-900 block text-xs">{line.item_name}</span>
                          </td>
                          <td className="py-3 px-2 font-bold text-slate-900">{line.requested_qty}</td>
                          <td className="py-3 px-2 text-slate-700">{line.on_hand_qty}</td>
                          <td className="py-3 px-2 text-amber-700">{line.reserved_qty}</td>
                          <td className="py-3 px-2 font-bold text-emerald-700">{line.available_qty}</td>
                          <td className="py-3 px-2 text-[11px] font-sans">
                            <span className="text-emerald-700 font-bold block">&bull; Stock Issue: {line.issue_from_stock_qty || 0}</span>
                            <span className="text-amber-700 font-bold block">&bull; Procure: {line.purchase_required_qty || 0}</span>
                          </td>
                          <td className="py-3 px-3 font-sans">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              isFullIssue ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                              isPartial ? 'bg-amber-50 text-amber-800 border-amber-300' :
                              'bg-rose-50 text-rose-700 border-rose-300'
                            }`}>
                              {line.review_status || (isFullIssue ? 'Full Stock Available' : isPartial ? 'Partial Split Needed' : 'Out of Stock')}
                            </span>
                          </td>
                          <td className="py-3 px-2 font-sans">
                            <button 
                              onClick={() => handleOpenReviewModal(indent, line)}
                              className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1 shadow-2xs transition"
                            >
                              <ClipboardCheck className="w-3.5 h-3.5" />
                              <span>Review & Action</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>

      {/* INTERACTIVE STORE MANAGER ACTION & SPLIT MODAL */}
      {selectedIndent && selectedLine && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm uppercase tracking-wider font-heading flex items-center space-x-2">
                  <ClipboardCheck className="w-4 h-4 text-purple-400" />
                  <span>Stock Availability Decision Engine</span>
                </h3>
                <p className="text-[11px] text-slate-300 font-mono mt-0.5">
                  Indent #{selectedIndent.indent_number} &bull; Item: {selectedLine.item_code}
                </p>
              </div>
              <button onClick={() => setSelectedIndent(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteReviewAction} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
              {/* Requested Item Info Card */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-xs">{selectedLine.item_name}</h4>
                <div className="grid grid-cols-4 gap-2 font-mono text-[11px] pt-1">
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-bold font-sans">Requested Qty</span>
                    <span className="font-bold text-purple-700">{selectedLine.requested_qty}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-bold font-sans">On-Hand Stock</span>
                    <span className="font-bold text-slate-800">{selectedLine.on_hand_qty}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-bold font-sans">Reserved</span>
                    <span className="font-bold text-amber-700">{selectedLine.reserved_qty}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-bold font-sans">Available Stock</span>
                    <span className="font-bold text-emerald-700">{selectedLine.available_qty}</span>
                  </div>
                </div>
              </div>

              {/* 5 Store Manager Options */}
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Select Store Manager Action Choice *</label>
                <div className="space-y-2">
                  <label className={`flex items-start space-x-3 p-3 rounded-xl border cursor-pointer transition ${
                    actionChoice === 'partial' ? 'bg-purple-50 border-purple-300 text-purple-950 font-semibold' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <input 
                      type="radio" 
                      name="actionChoice" 
                      value="partial"
                      checked={actionChoice === 'partial'}
                      onChange={e => setActionChoice(e.target.value)}
                      className="mt-0.5 text-purple-600"
                    />
                    <div className="flex-1">
                      <span className="font-bold text-slate-900 block text-xs">1. Purchase Partial Quantity (Split Request)</span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        Issue available stock ({selectedLine.available_qty} units) and create procurement requirement for remaining balance.
                      </span>
                    </div>
                  </label>

                  <label className={`flex items-start space-x-3 p-3 rounded-xl border cursor-pointer transition ${
                    actionChoice === 'issue-full' ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <input 
                      type="radio" 
                      name="actionChoice" 
                      value="issue-full"
                      checked={actionChoice === 'issue-full'}
                      onChange={e => setActionChoice(e.target.value)}
                      className="mt-0.5 text-emerald-600"
                    />
                    <div className="flex-1">
                      <span className="font-bold text-slate-900 block text-xs">2. Issue Full Quantity from Stock ({selectedLine.requested_qty} units)</span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        Fulfill full requisition directly from existing warehouse inventory (No purchasing required).
                      </span>
                    </div>
                  </label>

                  <label className={`flex items-start space-x-3 p-3 rounded-xl border cursor-pointer transition ${
                    actionChoice === 'purchase-full' ? 'bg-rose-50 border-rose-300 text-rose-950 font-semibold' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <input 
                      type="radio" 
                      name="actionChoice" 
                      value="purchase-full"
                      checked={actionChoice === 'purchase-full'}
                      onChange={e => setActionChoice(e.target.value)}
                      className="mt-0.5 text-rose-600"
                    />
                    <div className="flex-1">
                      <span className="font-bold text-slate-900 block text-xs">3. Purchase Full Quantity ({selectedLine.requested_qty} units)</span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        Do not issue from current stock. Raise full procurement requirement candidate for RFQ.
                      </span>
                    </div>
                  </label>

                  <label className={`flex items-start space-x-3 p-3 rounded-xl border cursor-pointer transition ${
                    actionChoice === 'substitute' ? 'bg-indigo-50 border-indigo-300 text-indigo-950 font-semibold' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <input 
                      type="radio" 
                      name="actionChoice" 
                      value="substitute"
                      checked={actionChoice === 'substitute'}
                      onChange={e => setActionChoice(e.target.value)}
                      className="mt-0.5 text-indigo-600"
                    />
                    <div className="flex-1">
                      <span className="font-bold text-slate-900 block text-xs">4. Use Substitute Item</span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        Select an equivalent in-stock substitute item from Item Master instead.
                      </span>
                    </div>
                  </label>

                  <label className={`flex items-start space-x-3 p-3 rounded-xl border cursor-pointer transition ${
                    actionChoice === 'reject' ? 'bg-slate-100 border-slate-300 text-slate-900 font-semibold' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <input 
                      type="radio" 
                      name="actionChoice" 
                      value="reject"
                      checked={actionChoice === 'reject'}
                      onChange={e => setActionChoice(e.target.value)}
                      className="mt-0.5 text-slate-600"
                    />
                    <div className="flex-1">
                      <span className="font-bold text-slate-900 block text-xs">5. Reject Due to Invalid Request</span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        Decline requested line item with mandatory explanation rationale.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Dynamic Inputs based on Action Choice */}
              {actionChoice === 'partial' && (
                <div className="bg-purple-50/70 p-3.5 rounded-xl border border-purple-200 space-y-3">
                  <h4 className="font-bold text-purple-900 text-xs">Live Partial Split Calculator</h4>
                  <div className="grid grid-cols-2 gap-3 font-mono">
                    <div>
                      <label className="block text-purple-800 text-[10px] font-bold uppercase font-sans mb-1">Issue from Stock Qty</label>
                      <input 
                        type="number"
                        min="0"
                        max={selectedLine.requested_qty}
                        value={customIssueQty}
                        onChange={e => setCustomIssueQty(Number(e.target.value))}
                        className="w-full bg-white border border-purple-300 rounded-xl px-3 py-1.5 text-slate-900 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-purple-800 text-[10px] font-bold uppercase font-sans mb-1">Purchase Required Qty</label>
                      <input 
                        type="number"
                        disabled
                        value={Math.max(0, selectedLine.requested_qty - customIssueQty)}
                        className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3 py-1.5 text-amber-800 font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {actionChoice === 'substitute' && (
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Select Substitute Item from Master *</label>
                  <select 
                    value={substituteItemId}
                    onChange={e => setSubstituteItemId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold"
                  >
                    <option value="">-- Select Substitute Item --</option>
                    {itemsMaster.filter(im => im.id !== selectedLine.item_id).map(im => (
                      <option key={im.id} value={im.id}>
                        {im.item_code} - {im.item_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Rationale / Remarks Textarea */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  {actionChoice === 'reject' ? 'Mandatory Rejection Reason *' : 'Store Review Remarks / Notes'}
                </label>
                <textarea 
                  rows="2"
                  required={actionChoice === 'reject'}
                  value={actionReason}
                  onChange={e => setActionReason(e.target.value)}
                  placeholder={actionChoice === 'reject' ? 'Provide mandatory explanation for rejecting this line...' : 'Optional store manager review comments...'}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-hidden focus:border-purple-600"
                />
              </div>

              {/* Dual Transaction Outcome Summary Banner */}
              <div className="bg-slate-900 text-white p-3.5 rounded-xl space-y-1.5 text-[11px] font-mono">
                <span className="font-bold text-purple-400 font-sans block uppercase text-[10px]">Dual Transaction Creation Outcome:</span>
                {actionChoice === 'issue-full' && (
                  <p className="text-emerald-400 font-semibold">&bull; Creates Stock Issue request for {selectedLine.requested_qty} units & deducts inventory balances.</p>
                )}
                {actionChoice === 'purchase-full' && (
                  <p className="text-amber-400 font-semibold">&bull; Creates Procurement Requirement candidate for {selectedLine.requested_qty} units in RFQ queue.</p>
                )}
                {actionChoice === 'partial' && (
                  <>
                    <p className="text-emerald-400 font-semibold">&bull; Creates Stock Issue request for {customIssueQty} units (Available stock used).</p>
                    <p className="text-amber-400 font-semibold">&bull; Creates Procurement Requirement candidate for {Math.max(0, selectedLine.requested_qty - customIssueQty)} units.</p>
                  </>
                )}
                {actionChoice === 'substitute' && (
                  <p className="text-indigo-400 font-semibold">&bull; Replaces item with chosen substitute and evaluates substitute inventory balance.</p>
                )}
                {actionChoice === 'reject' && (
                  <p className="text-rose-400 font-semibold">&bull; Rejects line item and notifies requester with rationale comment.</p>
                )}
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-3 -mx-6 -mb-6 mt-4">
                <button 
                  type="button" 
                  onClick={() => setSelectedIndent(null)} 
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-2xs"
                >
                  Confirm Stock Action
                </button>
              </div>
            </form>
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
