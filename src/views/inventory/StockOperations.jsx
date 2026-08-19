import React, { useState, useEffect } from 'react';
import { 
  Boxes, History, Send, ArrowLeftRight, Plus, Search, Filter, AlertTriangle, ShieldCheck, 
  Download, Lock, RefreshCw, PlusCircle, CheckCircle2, TrendingUp, TrendingDown, Layers, FileSpreadsheet, X
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import StockIssue from './StockIssue';

export default function StockOperations({ initialSubTab = 'current-stock' }) {
  const [activeSubTab, setActiveSubTab] = useState(initialSubTab);
  const [items, setItems] = useState([]);
  const [balances, setBalances] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [issues, setIssues] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  // Current Stock 8 Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [whFilter, setWhFilter] = useState('All');
  const [itemFilter, setItemFilter] = useState('All');
  const [catFilter, setCatFilter] = useState('All');
  const [locFilter, setLocFilter] = useState('All');
  const [batchFilter, setBatchFilter] = useState('All');
  const [brandFilter, setBrandFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [filterOptions, setFilterOptions] = useState({
    items: [],
    categories: [],
    warehouses: [],
    locations: [],
    batches: [],
    brands: [],
    departments: [],
    stock_statuses: ['In Stock', 'Low Stock', 'Out of Stock']
  });

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Modals
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [postError, setPostError] = useState('');

  useEffect(() => {
    if (initialSubTab) setActiveSubTab(initialSubTab);
  }, [initialSubTab]);

  const [issueForm, setIssueForm] = useState({
    item_id: 'itm-01',
    requested_qty: 5,
    approved_qty: 5,
    issue_qty: 5,
    unit: 'Pcs',
    department_id: 'dept-01',
    issued_to: 'Employee - John Doe',
    warehouse_id: 'wh-01',
    indent_reference: 'IND-2026-004',
    cost_centre: 'CC-ENGINEERING',
    project: 'PROJ-ALPHA',
    purpose: 'Routine Maintenance Issue',
    issue_type: 'Consumable issue',
    batch_number: 'BAT-2026-X99',
    serial_number: 'SN-9901, SN-9902',
    condition: 'Good',
    remarks: 'Approved by Dept Manager'
  });

  const [transferForm, setTransferForm] = useState({
    source_warehouse_id: 'wh-01',
    destination_warehouse_id: 'wh-02',
    item_id: 'itm-01',
    quantity: 10,
    batch_number: 'BAT-2026-X99',
    serial_number: 'SN-TRN-101',
    transport_details: 'Express Logistics Van KA-01-EA-5566',
    remarks: 'Inter-branch inventory balancing',
    action: 'Dispatch'
  });

  const [postForm, setPostForm] = useState({
    transaction_date: new Date().toISOString().slice(0, 16),
    transaction_type: 'OPENING_STOCK',
    reference_number: '',
    item_id: '',
    warehouse_id: 'wh-01',
    location_id: 'loc-01',
    batch_number: '',
    serial_number: '',
    qty_in: 10,
    qty_out: 0,
    unit_rate: 0,
    created_by: 'usr-03'
  });

  useEffect(() => {
    fetchStockData();
  }, [activeSubTab, typeFilter, whFilter, dateFrom, dateTo]);

  const fetchStockData = async () => {
    try {
      let ledgerUrl = `/api/inventory-ledger?`;
      if (typeFilter !== 'All') ledgerUrl += `transaction_type=${encodeURIComponent(typeFilter)}&`;
      if (whFilter !== 'All') ledgerUrl += `warehouse_id=${encodeURIComponent(whFilter)}&`;
      if (dateFrom) ledgerUrl += `date_from=${encodeURIComponent(dateFrom)}&`;
      if (dateTo) ledgerUrl += `date_to=${encodeURIComponent(dateTo)}&`;

      const [resItems, resBalances, resLedger, resIssues, resTransfers, resWh] = await Promise.all([
        fetch('/api/items').then(r => r.json()),
        fetch('/api/inventory-balances').then(r => r.json()),
        fetch(ledgerUrl).then(r => r.json()),
        fetch('/api/stock-issues').then(r => r.json()),
        fetch('/api/stock-transfers').then(r => r.json()),
        fetch('/api/warehouses').then(r => r.json()).catch(() => ({ success: false }))
      ]);

      if (resItems.success) {
        setItems(resItems.data || []);
        if (!postForm.item_id && resItems.data?.length > 0) {
          setPostForm(prev => ({ ...prev, item_id: resItems.data[0].id, unit_rate: resItems.data[0].standard_cost || 0 }));
        }
      }
      if (resBalances.success) {
        setBalances(resBalances.data || []);
        if (resBalances.filterOptions) {
          setFilterOptions(resBalances.filterOptions);
        }
      }
      if (resLedger.success) setLedger(resLedger.data || []);
      if (resIssues.success) setIssues(resIssues.data || []);
      if (resTransfers.success) setTransfers(resTransfers.data || []);
      if (resWh.success) setWarehouses(resWh.data || []);
    } catch (err) {
      console.error('Failed to fetch stock data:', err);
    }
  };

  const handleCreateIssue = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/stock-issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...issueForm,
          items: [{
            item_id: issueForm.item_id,
            requested_qty: Number(issueForm.requested_qty),
            approved_qty: Number(issueForm.approved_qty),
            issue_qty: Number(issueForm.issue_qty),
            batch_number: issueForm.batch_number,
            serial_number: issueForm.serial_number,
            condition: issueForm.condition
          }]
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowIssueModal(false);
        fetchStockData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTransfer = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/stock-transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...transferForm,
          items: [{
            item_id: transferForm.item_id,
            quantity: Number(transferForm.quantity),
            batch_number: transferForm.batch_number,
            serial_number: transferForm.serial_number
          }]
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowTransferModal(false);
        fetchStockData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const isStockOutType = (type) => {
    const stockOuts = ['STOCK_ISSUE', 'TRANSFER_OUT', 'NEGATIVE_ADJUSTMENT', 'SUPPLIER_RETURN', 'PRODUCTION_CONSUMPTION', 'SCRAP', 'DISPOSAL'];
    return stockOuts.includes(type);
  };

  const handlePostTransaction = async (e) => {
    e.preventDefault();
    setPostError('');

    const payload = {
      transaction_date: postForm.transaction_date ? new Date(postForm.transaction_date).toISOString() : new Date().toISOString(),
      transaction_type: postForm.transaction_type,
      reference_number: postForm.reference_number || `REF-${Date.now()}`,
      item_id: postForm.item_id,
      warehouse_id: postForm.warehouse_id,
      location_id: postForm.location_id || 'loc-01',
      batch_number: postForm.batch_number || '',
      serial_number: postForm.serial_number || '',
      qty_in: Number(postForm.qty_in || 0),
      qty_out: Number(postForm.qty_out || 0),
      unit_rate: Number(postForm.unit_rate || 0),
      created_by: postForm.created_by || 'usr-03'
    };

    try {
      const res = await fetch('/api/inventory-ledger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setShowPostModal(false);
        setPostForm({
          transaction_date: new Date().toISOString().slice(0, 16),
          transaction_type: 'OPENING_STOCK',
          reference_number: '',
          item_id: items[0]?.id || '',
          warehouse_id: 'wh-01',
          location_id: 'loc-01',
          batch_number: '',
          serial_number: '',
          qty_in: 10,
          qty_out: 0,
          unit_rate: items[0]?.standard_cost || 0,
          created_by: 'usr-03'
        });
        fetchStockData();
      } else {
        setPostError(data.message || data.error || 'Failed to post inventory transaction.');
      }
    } catch (err) {
      setPostError(err.message || 'Server connection error.');
    }
  };

  const exportLedgerCSV = () => {
    if (!filteredLedger || filteredLedger.length === 0) return;
    const headers = [
      'Txn Date', 'Transaction Type', 'Reference Number', 'Item Code', 'Item Name',
      'Warehouse', 'Location', 'Batch Number', 'Serial Number', 'Qty In', 'Qty Out',
      'Unit Rate (INR)', 'Value (INR)', 'Running Balance', 'Created By'
    ];

    const rows = filteredLedger.map(l => [
      `"${new Date(l.transaction_date).toLocaleString()}"`,
      `"${l.transaction_type}"`,
      `"${l.reference_number || ''}"`,
      `"${l.item_code || ''}"`,
      `"${l.item_name || ''}"`,
      `"${l.warehouse_name || ''}"`,
      `"${l.location_name || l.location_id || ''}"`,
      `"${l.batch_number || ''}"`,
      `"${l.serial_number || ''}"`,
      l.qty_in || l.quantity_in || 0,
      l.qty_out || l.quantity_out || 0,
      l.unit_rate || 0,
      l.value !== undefined ? l.value : 0,
      l.running_balance !== undefined ? l.running_balance : 0,
      `"${l.created_by_name || l.created_by || ''}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Inventory_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetAllFilters = () => {
    setSearchQuery('');
    setItemFilter('All');
    setCatFilter('All');
    setWhFilter('All');
    setLocFilter('All');
    setBatchFilter('All');
    setBrandFilter('All');
    setDeptFilter('All');
    setStatusFilter('All');
  };

  const exportCurrentStockCSV = () => {
    if (!filteredBalances || filteredBalances.length === 0) return;
    const headers = [
      'Item Code', 'Item Name', 'Warehouse', 'Location', 'Batch Number',
      'Expiry Date', 'On-Hand Quantity', 'Reserved Quantity', 'Available Quantity',
      'Unit Rate (INR)', 'Stock Value (INR)', 'Stock Status'
    ];

    const rows = filteredBalances.map(b => [
      `"${b.item_code || ''}"`,
      `"${b.item_name || ''}"`,
      `"${b.warehouse_name || ''}"`,
      `"${b.location_code || b.location_id || ''}"`,
      `"${b.batch_number || 'N/A'}"`,
      `"${b.expiry_date || 'N/A'}"`,
      b.on_hand_qty || 0,
      b.reserved_qty || 0,
      b.available_qty || 0,
      b.unit_rate || 0,
      b.stock_value || 0,
      `"${b.stock_status || ''}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Current_Stock_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredBalances = balances.filter(b => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      b.item_code?.toLowerCase().includes(q) || 
      b.item_name?.toLowerCase().includes(q) || 
      b.warehouse_name?.toLowerCase().includes(q) ||
      b.location_code?.toLowerCase().includes(q) ||
      b.batch_number?.toLowerCase().includes(q) ||
      b.brand_name?.toLowerCase().includes(q) ||
      b.category_name?.toLowerCase().includes(q) ||
      b.department_name?.toLowerCase().includes(q);

    const matchesItem = itemFilter === 'All' || b.item_id === itemFilter || b.item_code === itemFilter;
    const matchesCat = catFilter === 'All' || b.category_id === catFilter || b.category_name === catFilter;
    const matchesWh = whFilter === 'All' || b.warehouse_id === whFilter;
    const matchesLoc = locFilter === 'All' || b.location_id === locFilter || b.location_code === locFilter;
    const matchesBatch = batchFilter === 'All' || b.batch_number?.toLowerCase().includes(batchFilter.toLowerCase());
    const matchesBrand = brandFilter === 'All' || b.brand_id === brandFilter || b.brand_name === brandFilter;
    const matchesDept = deptFilter === 'All' || b.department_id === deptFilter || b.department_name === deptFilter;
    const matchesStatus = statusFilter === 'All' || b.stock_status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesItem && matchesCat && matchesWh && matchesLoc && matchesBatch && matchesBrand && matchesDept && matchesStatus;
  });

  // Calculate Current Stock Summary Metrics
  const totalStockItemsCount = filteredBalances.length;
  const totalOnHandQty = filteredBalances.reduce((sum, b) => sum + Number(b.on_hand_qty || 0), 0);
  const totalReservedQty = filteredBalances.reduce((sum, b) => sum + Number(b.reserved_qty || 0), 0);
  const totalAvailableQty = filteredBalances.reduce((sum, b) => sum + Number(b.available_qty || 0), 0);
  const totalStockValue = filteredBalances.reduce((sum, b) => sum + Number(b.stock_value || (b.on_hand_qty * (b.unit_rate || b.valuation_rate || 0))), 0);

  const filteredLedger = ledger.filter(l => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || 
      l.reference_number?.toLowerCase().includes(q) || 
      l.item_code?.toLowerCase().includes(q) || 
      l.item_name?.toLowerCase().includes(q) ||
      l.batch_number?.toLowerCase().includes(q) ||
      l.serial_number?.toLowerCase().includes(q);
    const matchesType = typeFilter === 'All' || l.transaction_type === typeFilter;
    const matchesWh = whFilter === 'All' || l.warehouse_id === whFilter;
    return matchesSearch && matchesType && matchesWh;
  });

  // Calculate Ledger Quick Stats
  const totalLedgerCount = filteredLedger.length;
  const totalQtyIn = filteredLedger.reduce((acc, l) => acc + Number(l.qty_in || l.quantity_in || 0), 0);
  const totalQtyOut = filteredLedger.reduce((acc, l) => acc + Number(l.qty_out || l.quantity_out || 0), 0);
  const totalNetValuation = filteredLedger.reduce((acc, l) => acc + Number(l.value !== undefined ? l.value : 0), 0);

  const getTransactionTypeBadge = (type) => {
    switch (type) {
      case 'OPENING_STOCK':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">OPENING STOCK</span>;
      case 'PURCHASE_RECEIPT':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">PURCHASE RECEIPT</span>;
      case 'STOCK_ISSUE':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">STOCK ISSUE</span>;
      case 'STOCK_RETURN':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200">STOCK RETURN</span>;
      case 'TRANSFER_OUT':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">TRANSFER OUT</span>;
      case 'TRANSFER_IN':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">TRANSFER IN</span>;
      case 'POSITIVE_ADJUSTMENT':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">POSITIVE ADJ</span>;
      case 'NEGATIVE_ADJUSTMENT':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-orange-100 text-orange-800 border border-orange-200">NEGATIVE ADJ</span>;
      case 'SUPPLIER_RETURN':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-pink-100 text-pink-800 border border-pink-200">SUPPLIER RETURN</span>;
      case 'PRODUCTION_RECEIPT':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-100 text-cyan-800 border border-cyan-200">PROD RECEIPT</span>;
      case 'PRODUCTION_CONSUMPTION':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-violet-100 text-violet-800 border border-violet-200">PROD CONSUMPTION</span>;
      case 'SCRAP':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 text-slate-800 border border-slate-300">SCRAP</span>;
      case 'DISPOSAL':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">DISPOSAL</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">{type}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Sub-Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 border border-slate-200/80 rounded-2xl shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 font-heading flex items-center space-x-2">
            <Boxes className="w-5 h-5 text-purple-600" />
            <span>Stock Ledger & Warehouse Operations</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Append-only stock ledger history, live balances & stock transfers.</p>
        </div>

        <div className="flex items-center space-x-3">
          {activeSubTab === 'ledger' && (
            <button
              onClick={() => setShowPostModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center space-x-2 shadow-xs transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Stock Movement</span>
            </button>
          )}

          {activeSubTab === 'issues' && (
            <button
              onClick={() => setShowIssueModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center space-x-2 shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Record Stock Issue</span>
            </button>
          )}

          {activeSubTab === 'transfers' && (
            <button
              onClick={() => setShowTransferModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center space-x-2 shadow-xs transition cursor-pointer"
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>New Stock Transfer</span>
            </button>
          )}

          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveSubTab('current-stock')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                activeSubTab === 'current-stock' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Current Balances
            </button>

            <button
              onClick={() => setActiveSubTab('ledger')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition flex items-center space-x-1.5 ${
                activeSubTab === 'ledger' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Stock Ledger</span>
            </button>

            <button
              onClick={() => setActiveSubTab('issues')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                activeSubTab === 'issues' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Issues
            </button>

            <button
              onClick={() => setActiveSubTab('transfers')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                activeSubTab === 'transfers' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Transfers
            </button>
          </div>
        </div>
      </div>

      {/* SUB-TAB 1: CURRENT STOCK BALANCES */}
      {activeSubTab === 'current-stock' && (
        <div className="space-y-4">
          {/* Quantity Definitions Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 text-white p-4 rounded-2xl shadow-sm border border-purple-900/40">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-sm tracking-wide font-heading">Current Stock Balances</h3>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold rounded-md uppercase tracking-wider">
                    LIVE BALANCES
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Shows available inventory balances across item codes, warehouses, bin locations, and tracked batches.
                </p>
              </div>

              {/* Quantity Definitions Panel */}
              <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 text-[11px] font-sans space-y-1 w-full lg:w-auto">
                <div className="text-[10px] font-bold uppercase tracking-wider text-purple-300 border-b border-white/10 pb-1 mb-1">
                  Quantity Definitions
                </div>
                <div className="flex items-center space-x-2 text-slate-200">
                  <span className="font-bold text-white">On-Hand Stock</span> = <span className="text-slate-300">Physical posted stock</span>
                </div>
                <div className="flex items-center space-x-2 text-amber-300">
                  <span className="font-bold">Reserved Stock</span> = <span className="text-amber-200/90">Allocated to approved requests but not yet issued</span>
                </div>
                <div className="flex items-center space-x-2 text-emerald-300 font-bold">
                  <span>Available Stock</span> = <span className="text-emerald-200 font-mono">On-Hand Stock - Reserved Stock</span>
                </div>
              </div>
            </div>
          </div>

          {/* Metrics Summary Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="bg-white border border-slate-200/80 p-3.5 rounded-2xl shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Stock Lines</span>
              <span className="text-lg font-bold font-mono text-slate-900">{totalStockItemsCount}</span>
            </div>

            <div className="bg-white border border-slate-200/80 p-3.5 rounded-2xl shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total On-Hand Stock</span>
              <span className="text-lg font-bold font-mono text-purple-700">{totalOnHandQty.toLocaleString()}</span>
            </div>

            <div className="bg-white border border-slate-200/80 p-3.5 rounded-2xl shadow-2xs">
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">Total Reserved Stock</span>
              <span className="text-lg font-bold font-mono text-amber-700">{totalReservedQty.toLocaleString()}</span>
            </div>

            <div className="bg-white border border-slate-200/80 p-3.5 rounded-2xl shadow-2xs">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Total Available Stock</span>
              <span className="text-lg font-bold font-mono text-emerald-700">{totalAvailableQty.toLocaleString()}</span>
            </div>

            <div className="bg-white border border-slate-200/80 p-3.5 rounded-2xl shadow-2xs col-span-2 lg:col-span-1">
              <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block">Total Stock Value</span>
              <span className="text-lg font-bold font-mono text-purple-900">
                ₹{totalStockValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* 8 Filters Toolbar */}
          <div className="bg-white p-4 border border-slate-200/80 rounded-2xl shadow-2xs space-y-3 text-xs">
            {/* Top Search & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[260px]">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search current stock by Item Code, Name, Warehouse, Location, Batch, Brand, Department..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={exportCurrentStockCSV}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center space-x-1.5 transition shadow-xs cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Export CSV</span>
                </button>

                <button
                  onClick={resetAllFilters}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center space-x-1.5 transition cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset Filters</span>
                </button>
              </div>
            </div>

            {/* 8 Distinct Filter Selectors Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-2 border-t border-slate-100">
              {/* 1. Item Filter */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">1. Item</label>
                <select
                  value={itemFilter}
                  onChange={e => setItemFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 font-semibold text-xs focus:ring-1 focus:ring-purple-500"
                >
                  <option value="All">All Items</option>
                  {filterOptions.items?.map(i => (
                    <option key={i.id} value={i.id}>{i.code} - {i.name}</option>
                  ))}
                </select>
              </div>

              {/* 2. Category Filter */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">2. Category</label>
                <select
                  value={catFilter}
                  onChange={e => setCatFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 font-semibold text-xs focus:ring-1 focus:ring-purple-500"
                >
                  <option value="All">All Categories</option>
                  {filterOptions.categories?.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* 3. Warehouse Filter */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">3. Warehouse</label>
                <select
                  value={whFilter}
                  onChange={e => setWhFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 font-semibold text-xs focus:ring-1 focus:ring-purple-500 font-bold text-purple-900"
                >
                  <option value="All">All Warehouses</option>
                  {filterOptions.warehouses?.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>

              {/* 4. Location Filter */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">4. Location</label>
                <select
                  value={locFilter}
                  onChange={e => setLocFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 font-semibold text-xs focus:ring-1 focus:ring-purple-500"
                >
                  <option value="All">All Locations</option>
                  {filterOptions.locations?.map(l => (
                    <option key={l.id} value={l.id}>{l.code}</option>
                  ))}
                </select>
              </div>

              {/* 5. Batch Filter */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">5. Batch</label>
                <select
                  value={batchFilter}
                  onChange={e => setBatchFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 font-semibold text-xs focus:ring-1 focus:ring-purple-500"
                >
                  <option value="All">All Batches</option>
                  {filterOptions.batches?.map((b, idx) => (
                    <option key={idx} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* 6. Brand Filter */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">6. Brand</label>
                <select
                  value={brandFilter}
                  onChange={e => setBrandFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 font-semibold text-xs focus:ring-1 focus:ring-purple-500"
                >
                  <option value="All">All Brands</option>
                  {filterOptions.brands?.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* 7. Department Filter */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">7. Department</label>
                <select
                  value={deptFilter}
                  onChange={e => setDeptFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 font-semibold text-xs focus:ring-1 focus:ring-purple-500"
                >
                  <option value="All">All Departments</option>
                  {filterOptions.departments?.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              {/* 8. Stock Status Filter */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">8. Stock Status</label>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 font-bold text-xs focus:ring-1 focus:ring-purple-500"
                >
                  <option value="All">All Statuses</option>
                  <option value="In Stock">In Stock</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>
            </div>
          </div>

          {/* Current Stock Data Table (11 Columns Required) */}
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200 font-bold font-sans">
                    <th className="p-3">1. Item Code</th>
                    <th className="p-3">2. Item Name</th>
                    <th className="p-3">3. Warehouse</th>
                    <th className="p-3">4. Location</th>
                    <th className="p-3">5. Batch</th>
                    <th className="p-3">6. Expiry Date</th>
                    <th className="p-3 font-mono text-right">7. On-Hand Qty</th>
                    <th className="p-3 font-mono text-right text-amber-700">8. Reserved Qty</th>
                    <th className="p-3 font-mono text-right text-emerald-700">9. Available Qty</th>
                    <th className="p-3 font-mono text-right">10. Unit Rate</th>
                    <th className="p-3 font-mono text-right">11. Stock Value</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {filteredBalances.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="p-8 text-center text-slate-400">
                        <Boxes className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="font-bold text-slate-600 text-sm">No inventory balances found</p>
                        <p className="text-xs text-slate-400 mt-0.5">Try adjusting your search criteria or reset filters.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredBalances.map(bal => (
                      <tr key={bal.id || `${bal.item_id}-${bal.warehouse_id}-${bal.location_id}-${bal.batch_number}`} className="hover:bg-slate-50/80 transition">
                        {/* 1. Item Code */}
                        <td className="p-3 font-mono text-purple-700 font-bold">
                          {bal.item_code || (items.find(i => i.id === bal.item_id)?.item_code) || 'IT-LAP-0001'}
                        </td>

                        {/* 2. Item Name */}
                        <td className="p-3">
                          <strong className="text-slate-900 block">
                            {bal.item_name || (items.find(i => i.id === bal.item_id)?.item_name) || 'Dell Latitude Laptop'}
                          </strong>
                          <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 mt-0.5">
                            {(bal.category_name || 'IT Equipment') && <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-medium">{bal.category_name || 'IT Equipment'}</span>}
                            {(bal.brand_name || 'Dell') && <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-medium">{bal.brand_name || 'Dell'}</span>}
                          </div>
                        </td>

                        {/* 3. Warehouse */}
                        <td className="p-3 text-slate-700 font-medium">
                          {bal.warehouse_name || (warehouses.find(w => w.id === bal.warehouse_id)?.name) || 'Central Goods Warehouse'}
                        </td>

                        {/* 4. Location */}
                        <td className="p-3 font-mono text-slate-600">
                          <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded text-[11px]">
                            {bal.location_code || bal.location_id || 'Zone A'}
                          </span>
                        </td>

                        {/* 5. Batch */}
                        <td className="p-3 font-mono text-slate-700 font-semibold">
                          {bal.batch_number || 'N/A'}
                        </td>

                        {/* 6. Expiry Date */}
                        <td className="p-3 text-slate-600 font-mono text-[11px]">
                          {bal.expiry_date ? bal.expiry_date.slice(0, 10) : 'N/A'}
                        </td>

                        {/* 7. On-hand quantity */}
                        <td className="p-3 text-right font-mono font-bold text-slate-900">
                          {bal.on_hand_qty} <span className="text-[10px] text-slate-400 font-normal">{bal.uom}</span>
                        </td>

                        {/* 8. Reserved quantity */}
                        <td className="p-3 text-right font-mono font-bold text-amber-700 bg-amber-50/30">
                          {bal.reserved_qty} <span className="text-[10px] text-amber-500 font-normal">{bal.uom}</span>
                        </td>

                        {/* 9. Available quantity */}
                        <td className="p-3 text-right font-mono font-bold text-emerald-700 bg-emerald-50/30">
                          {bal.available_qty} <span className="text-[10px] text-emerald-500 font-normal">{bal.uom}</span>
                        </td>

                        {/* 10. Unit rate */}
                        <td className="p-3 text-right font-mono text-slate-600">
                          ₹{Number(bal.unit_rate || bal.valuation_rate || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>

                        {/* 11. Stock value */}
                        <td className="p-3 text-right font-mono font-bold text-purple-900">
                          ₹{Number(bal.stock_value || (bal.on_hand_qty * (bal.unit_rate || 0))).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>

                        {/* Stock Status Badge */}
                        <td className="p-3 text-center">
                          {bal.stock_status === 'Out of Stock' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              Out of Stock
                            </span>
                          ) : bal.stock_status === 'Low Stock' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              Low Stock
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              In Stock
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: INVENTORY STOCK LEDGER (APPEND-ONLY) */}
      {activeSubTab === 'ledger' && (
        <div className="space-y-4">
          {/* Official Append-Only Banner */}
          <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-600/30 border border-purple-400/40 rounded-xl">
                <Lock className="w-5 h-5 text-purple-300" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-sm tracking-wide">Official Inventory Stock Ledger</h3>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold rounded-md">APPEND-ONLY IMMUTABLE HISTORY</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Existing entries cannot be modified or deleted. Concurrency locking & balance validation enabled.</p>
              </div>
            </div>

            <button
              onClick={exportLedgerCSV}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center space-x-1.5 transition shadow-xs cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white border border-slate-200/80 p-3.5 rounded-2xl shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Ledger Entries</span>
              <span className="text-lg font-bold font-mono text-purple-700">{totalLedgerCount}</span>
            </div>

            <div className="bg-white border border-slate-200/80 p-3.5 rounded-2xl shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Quantity In (+)</span>
              <span className="text-lg font-bold font-mono text-emerald-700">+{totalQtyIn}</span>
            </div>

            <div className="bg-white border border-slate-200/80 p-3.5 rounded-2xl shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Quantity Out (-)</span>
              <span className="text-lg font-bold font-mono text-rose-600">-{totalQtyOut}</span>
            </div>

            <div className="bg-white border border-slate-200/80 p-3.5 rounded-2xl shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Net Valuation Added</span>
              <span className={`text-lg font-bold font-mono ${totalNetValuation >= 0 ? 'text-emerald-800' : 'text-rose-700'}`}>
                ₹{totalNetValuation.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Comprehensive Filter Bar */}
          <div className="bg-white p-4 border border-slate-200/80 rounded-2xl shadow-2xs space-y-3 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-3 flex-1 min-w-[240px]">
                <div className="relative w-full">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by Ref #, Item Code/Name, Batch #, Serial #..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-800"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-bold"
                >
                  <option value="All">All 13 Transaction Types</option>
                  <option value="OPENING_STOCK">Opening Stock</option>
                  <option value="PURCHASE_RECEIPT">Purchase Receipt</option>
                  <option value="STOCK_ISSUE">Stock Issue</option>
                  <option value="STOCK_RETURN">Stock Return</option>
                  <option value="TRANSFER_OUT">Transfer Out</option>
                  <option value="TRANSFER_IN">Transfer In</option>
                  <option value="POSITIVE_ADJUSTMENT">Positive Adjustment</option>
                  <option value="NEGATIVE_ADJUSTMENT">Negative Adjustment</option>
                  <option value="SUPPLIER_RETURN">Supplier Return</option>
                  <option value="PRODUCTION_RECEIPT">Production Receipt</option>
                  <option value="PRODUCTION_CONSUMPTION">Production Consumption</option>
                  <option value="SCRAP">Scrap</option>
                  <option value="DISPOSAL">Disposal</option>
                </select>

                <select
                  value={whFilter}
                  onChange={e => setWhFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-bold"
                >
                  <option value="All">All Warehouses</option>
                  <option value="wh-01">Central Warehouse (wh-01)</option>
                  <option value="wh-02">Electronics Sub-Warehouse (wh-02)</option>
                  <option value="wh-03">Chemical Yard (wh-03)</option>
                </select>

                <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
                  <span className="text-[10px] text-slate-400 font-bold">From:</span>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={e => setDateFrom(e.target.value)}
                    className="bg-transparent text-slate-800 text-xs focus:outline-none"
                  />
                </div>

                <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
                  <span className="text-[10px] text-slate-400 font-bold">To:</span>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={e => setDateTo(e.target.value)}
                    className="bg-transparent text-slate-800 text-xs focus:outline-none"
                  />
                </div>

                {(typeFilter !== 'All' || whFilter !== 'All' || searchQuery || dateFrom || dateTo) && (
                  <button
                    onClick={() => {
                      setTypeFilter('All');
                      setWhFilter('All');
                      setSearchQuery('');
                      setDateFrom('');
                      setDateTo('');
                    }}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* All 14 Columns Inventory Ledger Table */}
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200 font-bold font-sans">
                    <th className="p-3">1. Txn Date</th>
                    <th className="p-3">2. Type</th>
                    <th className="p-3">3. Ref Number</th>
                    <th className="p-3">4. Item (Code & Name)</th>
                    <th className="p-3">5. Warehouse</th>
                    <th className="p-3">6. Location</th>
                    <th className="p-3 font-mono">7. Batch #</th>
                    <th className="p-3 font-mono">8. Serial #</th>
                    <th className="p-3 font-mono text-right">9. Qty In (+)</th>
                    <th className="p-3 font-mono text-right">10. Qty Out (-)</th>
                    <th className="p-3 font-mono text-right">11. Rate (₹)</th>
                    <th className="p-3 font-mono text-right">12. Value (₹)</th>
                    <th className="p-3 font-mono text-right">13. Running Bal</th>
                    <th className="p-3">14. Created By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {filteredLedger.length === 0 ? (
                    <tr>
                      <td colSpan="14" className="p-8 text-center text-slate-400 font-sans">
                        No inventory ledger entries found matching your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredLedger.map(entry => {
                      const qIn = entry.qty_in || entry.quantity_in || 0;
                      const qOut = entry.qty_out || entry.quantity_out || 0;
                      const rate = entry.unit_rate || 0;
                      const entryVal = entry.value !== undefined ? entry.value : ((qIn - qOut) * rate);

                      return (
                        <tr key={entry.id} className="hover:bg-purple-50/40 transition">
                          <td className="p-3 text-slate-500 font-sans">
                            {new Date(entry.transaction_date).toLocaleString('en-IN', {
                              dateStyle: 'short',
                              timeStyle: 'short'
                            })}
                          </td>
                          <td className="p-3 font-sans">
                            {getTransactionTypeBadge(entry.transaction_type)}
                          </td>
                          <td className="p-3 text-purple-700 font-bold">{entry.reference_number}</td>
                          <td className="p-3 text-slate-800 font-sans">
                            <span className="font-mono text-purple-800 font-bold mr-1.5">{entry.item_code}</span>
                            <span>{entry.item_name}</span>
                          </td>
                          <td className="p-3 font-sans text-slate-600">{entry.warehouse_name}</td>
                          <td className="p-3 font-sans text-slate-500">{entry.location_name || entry.location_id || 'loc-01'}</td>
                          <td className="p-3 text-purple-900">{entry.batch_number || '-'}</td>
                          <td className="p-3 text-slate-700">{entry.serial_number || '-'}</td>
                          <td className="p-3 text-right font-bold text-emerald-700">
                            {qIn > 0 ? `+${qIn}` : '-'}
                          </td>
                          <td className="p-3 text-right font-bold text-rose-600">
                            {qOut > 0 ? `-${qOut}` : '-'}
                          </td>
                          <td className="p-3 text-right text-slate-600">
                            ₹{rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className={`p-3 text-right font-bold ${entryVal >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                            ₹{entryVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-3 text-right font-bold text-slate-900 bg-slate-50/70">
                            {entry.running_balance !== undefined ? entry.running_balance : '-'}
                          </td>
                          <td className="p-3 font-sans text-slate-500">{entry.created_by_name || entry.created_by}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: STOCK ISSUES */}
      {(activeSubTab === 'issues' || activeSubTab === 'issue') && (
        <StockIssue />
      )}

      {/* SUB-TAB 4: TWO-STEP STOCK TRANSFERS */}
      {activeSubTab === 'transfers' && (
        <div className="space-y-4">
          {transfers.map(trn => (
            <div key={trn.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-wrap justify-between items-center gap-4 hover:border-purple-200 transition">
              <div>
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-sm font-bold text-purple-700">{trn.transfer_number}</span>
                  <StatusBadge status={trn.status} />
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Source: <strong className="text-purple-700">{trn.source_warehouse_name}</strong> &rarr; Destination: <strong className="text-emerald-700">{trn.destination_warehouse_name}</strong>
                </p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">Transport: {trn.transport_details || 'Company Logistics'}</p>
              </div>

              <div className="text-right text-xs font-mono">
                <span className="text-slate-500">Transfer Date: {trn.transfer_date}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* POST STOCK MOVEMENT MODAL (ALL 14 LEDGER FIELDS) */}
      {showPostModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider font-heading flex items-center space-x-2">
                  <PlusCircle className="w-4 h-4 text-purple-600" />
                  <span>Post Official Stock Movement (All 14 Fields)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Official append-only ledger entry creation with real-time balance validation.</p>
              </div>
              <button onClick={() => setShowPostModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {postError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span className="font-bold">{postError}</span>
              </div>
            )}

            <form onSubmit={handlePostTransaction} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Field 1: Transaction Date */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">1. Transaction Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={postForm.transaction_date}
                    onChange={e => setPostForm({ ...postForm, transaction_date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono"
                  />
                </div>

                {/* Field 2: Transaction Type */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">2. Transaction Type *</label>
                  <select
                    value={postForm.transaction_type}
                    onChange={e => {
                      const newType = e.target.value;
                      const isOut = isStockOutType(newType);
                      const currentQty = (Number(postForm.qty_in || 0) || Number(postForm.qty_out || 0) || 10);
                      setPostForm({
                        ...postForm,
                        transaction_type: newType,
                        qty_in: isOut ? 0 : currentQty,
                        qty_out: isOut ? currentQty : 0
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold"
                  >
                    <option value="OPENING_STOCK">Opening Stock (+)</option>
                    <option value="PURCHASE_RECEIPT">Purchase Receipt (+)</option>
                    <option value="STOCK_ISSUE">Stock Issue (-)</option>
                    <option value="STOCK_RETURN">Stock Return (+)</option>
                    <option value="TRANSFER_OUT">Transfer Out (-)</option>
                    <option value="TRANSFER_IN">Transfer In (+)</option>
                    <option value="POSITIVE_ADJUSTMENT">Positive Adjustment (+)</option>
                    <option value="NEGATIVE_ADJUSTMENT">Negative Adjustment (-)</option>
                    <option value="SUPPLIER_RETURN">Supplier Return (-)</option>
                    <option value="PRODUCTION_RECEIPT">Production Receipt (+)</option>
                    <option value="PRODUCTION_CONSUMPTION">Production Consumption (-)</option>
                    <option value="SCRAP">Scrap (-)</option>
                    <option value="DISPOSAL">Disposal (-)</option>
                  </select>
                </div>

                {/* Field 3: Reference Number */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">3. Reference Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. REF-2026-0010"
                    value={postForm.reference_number}
                    onChange={e => setPostForm({ ...postForm, reference_number: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono"
                  />
                </div>

                {/* Field 4: Item */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">4. Select Item *</label>
                  <select
                    value={postForm.item_id}
                    onChange={e => {
                      const selectedItem = items.find(i => i.id === e.target.value);
                      setPostForm({
                        ...postForm,
                        item_id: e.target.value,
                        unit_rate: selectedItem?.standard_cost || postForm.unit_rate
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold"
                  >
                    {items.map(i => (
                      <option key={i.id} value={i.id}>
                        {i.item_code} - {i.item_name} ({i.uom_symbol})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Field 5: Warehouse */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">5. Warehouse *</label>
                  <select
                    value={postForm.warehouse_id}
                    onChange={e => setPostForm({ ...postForm, warehouse_id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold"
                  >
                    <option value="wh-01">Central Warehouse (wh-01)</option>
                    <option value="wh-02">Electronics Sub-Warehouse (wh-02)</option>
                    <option value="wh-03">Chemical Yard (wh-03)</option>
                  </select>
                </div>

                {/* Field 6: Location */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">6. Location *</label>
                  <input
                    type="text"
                    placeholder="e.g. loc-01 / Rack A1"
                    value={postForm.location_id}
                    onChange={e => setPostForm({ ...postForm, location_id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono"
                  />
                </div>

                {/* Field 7: Batch Number */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">7. Batch Number</label>
                  <input
                    type="text"
                    placeholder="e.g. BAT-2026-001"
                    value={postForm.batch_number}
                    onChange={e => setPostForm({ ...postForm, batch_number: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono"
                  />
                </div>

                {/* Field 8: Serial Number */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">8. Serial Number</label>
                  <input
                    type="text"
                    placeholder="e.g. SN-889001"
                    value={postForm.serial_number}
                    onChange={e => setPostForm({ ...postForm, serial_number: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono"
                  />
                </div>

                {/* Field 9: Quantity In */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">9. Quantity In (+)</label>
                  <input
                    type="number"
                    min="0"
                    value={postForm.qty_in}
                    onChange={e => setPostForm({ ...postForm, qty_in: Number(e.target.value), qty_out: Number(e.target.value) > 0 ? 0 : postForm.qty_out })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-emerald-700 font-bold font-mono"
                  />
                </div>

                {/* Field 10: Quantity Out */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">10. Quantity Out (-)</label>
                  <input
                    type="number"
                    min="0"
                    value={postForm.qty_out}
                    onChange={e => setPostForm({ ...postForm, qty_out: Number(e.target.value), qty_in: Number(e.target.value) > 0 ? 0 : postForm.qty_in })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-rose-600 font-bold font-mono"
                  />
                </div>

                {/* Field 11: Unit Rate */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">11. Unit Rate (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={postForm.unit_rate}
                    onChange={e => setPostForm({ ...postForm, unit_rate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono"
                  />
                </div>

                {/* Field 12: Value (Calculated Preview) */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">12. Total Value (₹)</label>
                  <input
                    type="text"
                    readOnly
                    value={`₹${(((Number(postForm.qty_in || 0) - Number(postForm.qty_out || 0)) * Number(postForm.unit_rate || 0))).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-purple-900 font-bold font-mono cursor-not-allowed"
                  />
                </div>

                {/* Field 13: Running Balance Preview */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">13. Projected Running Balance</label>
                  {(() => {
                    const currentBal = (balances.find(b => b.item_id === postForm.item_id && b.warehouse_id === postForm.warehouse_id)?.on_hand_qty) || 0;
                    const projected = currentBal + Number(postForm.qty_in || 0) - Number(postForm.qty_out || 0);
                    return (
                      <input
                        type="text"
                        readOnly
                        value={`Current: ${currentBal} → New: ${projected}`}
                        className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold font-mono cursor-not-allowed"
                      />
                    );
                  })()}
                </div>

                {/* Field 14: Created By */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">14. Created By *</label>
                  <select
                    value={postForm.created_by}
                    onChange={e => setPostForm({ ...postForm, created_by: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold"
                  >
                    <option value="usr-03">System Storekeeper (usr-03)</option>
                    <option value="usr-01">Sarah Jenkins - Store Manager (usr-01)</option>
                    <option value="usr-02">Rajesh Kumar - Purchase Manager (usr-02)</option>
                    <option value="usr-04">Ananya Sharma - Finance Officer (usr-04)</option>
                    <option value="usr-05">David Miller - Dept Requester (usr-05)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs cursor-pointer transition flex items-center space-x-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Post Stock Movement</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STOCK ISSUE MODAL */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider font-heading border-b border-slate-100 pb-2">Record Stock Issue (Store Issue Voucher)</h3>
            <form onSubmit={handleCreateIssue} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Issue Type *</label>
                  <select value={issueForm.issue_type} onChange={e => setIssueForm({ ...issueForm, issue_type: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold">
                    <option value="Consumable issue">Consumable issue</option>
                    <option value="Returnable issue">Returnable issue</option>
                    <option value="Asset issue">Asset issue</option>
                    <option value="Project issue">Project issue</option>
                    <option value="Production issue">Production issue</option>
                    <option value="Emergency issue">Emergency issue</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Target Department *</label>
                  <select value={issueForm.department_id} onChange={e => setIssueForm({ ...issueForm, department_id: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800">
                    <option value="dept-01">Information Technology (dept-01)</option>
                    <option value="dept-02">Manufacturing & Operations (dept-02)</option>
                    <option value="dept-03">Quality Assurance (dept-03)</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">Select Item to Issue *</label>
                  <select value={issueForm.item_id} onChange={e => setIssueForm({ ...issueForm, item_id: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold">
                    {items.map(i => <option key={i.id} value={i.id}>{i.item_code} - {i.item_name} (Available: {i.available_qty} {i.uom_symbol})</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Requested Qty</label>
                  <input type="number" min="1" value={issueForm.requested_qty} onChange={e => setIssueForm({ ...issueForm, requested_qty: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold font-mono" />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Issue Quantity *</label>
                  <input type="number" min="1" value={issueForm.issue_qty} onChange={e => setIssueForm({ ...issueForm, issue_qty: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold font-mono text-purple-900" />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Issued To Employee</label>
                  <input type="text" value={issueForm.issued_to} onChange={e => setIssueForm({ ...issueForm, issued_to: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800" />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Indent Reference</label>
                  <input type="text" value={issueForm.indent_reference} onChange={e => setIssueForm({ ...issueForm, indent_reference: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono" />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowIssueModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-purple-600 text-white font-bold rounded-xl shadow-xs cursor-pointer">Post Stock Issue</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STOCK TRANSFER MODAL */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider font-heading border-b border-slate-100 pb-2">Create Two-Step Stock Transfer Dispatch</h3>
            <form onSubmit={handleCreateTransfer} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Select Item to Transfer *</label>
                <select value={transferForm.item_id} onChange={e => setTransferForm({ ...transferForm, item_id: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold">
                  {items.map(i => <option key={i.id} value={i.id}>{i.item_code} - {i.item_name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Source Warehouse *</label>
                  <select value={transferForm.source_warehouse_id} onChange={e => setTransferForm({ ...transferForm, source_warehouse_id: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold">
                    <option value="wh-01">Central Warehouse (wh-01)</option>
                    <option value="wh-02">Electronics Sub-Warehouse (wh-02)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Destination Warehouse *</label>
                  <select value={transferForm.destination_warehouse_id} onChange={e => setTransferForm({ ...transferForm, destination_warehouse_id: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold">
                    <option value="wh-02">Electronics Sub-Warehouse (wh-02)</option>
                    <option value="wh-01">Central Warehouse (wh-01)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Transfer Quantity *</label>
                <input type="number" min="1" value={transferForm.quantity} onChange={e => setTransferForm({ ...transferForm, quantity: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold font-mono text-indigo-900" />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Transport Details & Vehicle #</label>
                <input type="text" value={transferForm.transport_details} onChange={e => setTransferForm({ ...transferForm, transport_details: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800" />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowTransferModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-xs cursor-pointer">Dispatch Transfer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
