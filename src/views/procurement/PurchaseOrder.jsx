import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Printer, Plus, Search, Filter, CheckCircle2, XCircle, 
  Send, AlertTriangle, FileText, ChevronRight, RefreshCw, Layers, History, Eye, Edit3, Lock, ShieldAlert
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import PrintModal from '../../components/common/PrintModal';

export default function PurchaseOrder() {
  const [pos, setPos] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [itemsMaster, setItemsMaster] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [indents, setIndents] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [supplierFilter, setSupplierFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedPo, setSelectedPo] = useState(null);
  const [printDoc, setPrintDoc] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeDrawerTab, setActiveDrawerTab] = useState('items'); // 'items', 'terms', 'history', 'revisions'

  // Form State for Create / Edit PO
  const [formData, setFormData] = useState({
    id: null,
    po_number: '',
    po_date: new Date().toISOString().split('T')[0],
    supplier_id: '',
    supplier_address: '',
    billing_address: 'Apex Enterprises HQ, 100 Industrial Park, Zone 4, Bangalore',
    delivery_address: 'Central Goods Warehouse (WH-MAIN), Gate 2, Bangalore',
    currency: 'INR',
    payment_terms: 'Net 30 days',
    delivery_terms: 'FOB Destination',
    freight_terms: 'Freight Prepaid',
    buyer: 'Sarah Jenkins (Buyer)',
    quotation_id: '',
    rfq_id: '',
    indent_id: '',
    terms_conditions: '1. Goods subject to inspection upon delivery.\n2. Invoice must quote PO number and GSTIN.\n3. Defective items returned at vendor cost.',
    status: 'Draft',
    override_quote_permission: false,
    override_indent_qty_permission: false,
    items: [
      {
        item_id: '',
        item_code: '',
        description_snapshot: '',
        ordered_quantity: 1,
        unit: 'Pcs',
        unit_rate: 0,
        discount: 0,
        tax: 18,
        delivery_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        warehouse_id: 'wh-01'
      }
    ]
  });

  const [validationErrors, setValidationErrors] = useState([]);
  const [validationWarnings, setValidationWarnings] = useState([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [poRes, supRes, itemRes, quoteRes, indRes] = await Promise.all([
        fetch('/api/purchase-orders'),
        fetch('/api/suppliers'),
        fetch('/api/items'),
        fetch('/api/quotations'),
        fetch('/api/indents')
      ]);

      const poData = await poRes.json();
      const supData = await supRes.json();
      const itemData = await itemRes.json();
      const quoteData = await quoteRes.json();
      const indData = await indRes.json();

      if (poData.success) setPos(poData.data);
      if (supData.success) setSuppliers(supData.data);
      if (itemData.success) setItemsMaster(itemData.data);
      if (quoteData.success) setQuotations(quoteData.data);
      if (indData.success) setIndents(indData.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  // KPI Computations
  const totalCount = pos.length;
  const activeCount = pos.filter(p => ['Approved', 'Sent to supplier', 'Supplier accepted'].includes(p.status)).length;
  const pendingCount = pos.filter(p => p.status === 'Pending approval').length;
  const fulfilledCount = pos.filter(p => ['Fully received', 'Closed'].includes(p.status)).length;
  const totalValue = pos.reduce((sum, p) => sum + Number(p.grand_total || p.total_amount || 0), 0);

  // Filtered POs
  const filteredPos = pos.filter(po => {
    const matchesStatus = statusFilter === 'All' || po.status === statusFilter;
    const matchesSupplier = supplierFilter === 'All' || po.supplier_id === supplierFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || (
      po.po_number?.toLowerCase().includes(q) ||
      po.supplier_name?.toLowerCase().includes(q) ||
      po.quotation_number?.toLowerCase().includes(q) ||
      po.indent_number?.toLowerCase().includes(q)
    );
    return matchesStatus && matchesSupplier && matchesSearch;
  });

  // Handle Form Change
  const handleSupplierChange = (supId) => {
    const sup = suppliers.find(s => s.id === supId);
    setFormData(prev => ({
      ...prev,
      supplier_id: supId,
      supplier_address: sup ? (sup.address_billing || sup.address_registered || '') : '',
      payment_terms: sup?.payment_terms || prev.payment_terms
    }));
  };

  const handleLineItemChange = (index, field, value) => {
    const updated = [...formData.items];
    updated[index][field] = value;

    if (field === 'item_id') {
      const itm = itemsMaster.find(i => i.id === value);
      if (itm) {
        updated[index].item_code = itm.item_code;
        updated[index].description_snapshot = itm.item_name + ' - ' + (itm.description || '');
        updated[index].unit_rate = itm.valuation_rate || 0;
        updated[index].unit = itm.uom_symbol || 'Pcs';
      }
    }

    setFormData(prev => ({ ...prev, items: updated }));
  };

  const addLineItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          item_id: '',
          item_code: '',
          description_snapshot: '',
          ordered_quantity: 1,
          unit: 'Pcs',
          unit_rate: 0,
          discount: 0,
          tax: 18,
          delivery_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
          warehouse_id: 'wh-01'
        }
      ]
    }));
  };

  const removeLineItem = (index) => {
    if (formData.items.length === 1) return;
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, idx) => idx !== index)
    }));
  };

  // Import from Quotation
  const handleImportQuotation = (quoteId) => {
    const q = quotations.find(qt => qt.id === quoteId || qt.quotation_number === quoteId);
    if (!q) return;

    const sup = suppliers.find(s => s.id === q.supplier_id);
    const supAddress = sup ? (sup.address_billing || sup.address_registered || '') : (q.supplier_address || '');

    setFormData(prev => ({
      ...prev,
      quotation_id: q.id,
      quotation_number: q.quotation_number || '',
      rfq_id: q.rfq_id || prev.rfq_id,
      supplier_id: q.supplier_id || prev.supplier_id,
      supplier_name: q.supplier_name || (sup ? sup.supplier_name : prev.supplier_name),
      supplier_address: supAddress || prev.supplier_address,
      payment_terms: q.payment_terms || prev.payment_terms,
      delivery_terms: q.delivery_terms || prev.delivery_terms,
      freight_terms: q.freight_terms || prev.freight_terms,
      items: (q.items || []).map(qi => ({
        item_id: qi.item_id,
        item_code: qi.item_code || 'ITM-CODE',
        description_snapshot: qi.item_name || 'Quoted Item',
        ordered_quantity: qi.offered_quantity || 1,
        unit: 'Pcs',
        unit_rate: qi.unit_rate || 0,
        discount: qi.discount_pct || 0,
        tax: qi.tax_pct || 18,
        delivery_date: new Date(Date.now() + (qi.delivery_days || 7) * 86400000).toISOString().split('T')[0],
        warehouse_id: 'wh-01'
      }))
    }));
  };

  // Import from Indent
  const handleImportIndent = (indentId) => {
    const ind = indents.find(i => i.id === indentId || i.indent_number === indentId);
    if (!ind) return;

    setFormData(prev => ({
      ...prev,
      indent_id: ind.id,
      items: (ind.items || []).map(ii => ({
        item_id: ii.item_id,
        item_code: ii.item_code || 'ITM-CODE',
        description_snapshot: ii.item_name || 'Indent Item',
        ordered_quantity: ii.approved_qty || ii.requested_qty || 1,
        unit: 'Pcs',
        unit_rate: ii.estimated_rate || 0,
        discount: 0,
        tax: 18,
        delivery_date: ii.required_date || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        warehouse_id: 'wh-01'
      }))
    }));
  };

  // Submit Form (Create / Edit)
  const handleSubmitPo = async (targetStatus = 'Draft') => {
    setValidationErrors([]);
    setValidationWarnings([]);

    const payload = {
      ...formData,
      status: targetStatus
    };

    try {
      const url = formData.id ? `/api/purchase-orders/${formData.id}` : '/api/purchase-orders';
      const method = formData.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!data.success) {
        if (data.errors) setValidationErrors(data.errors);
        if (data.warnings) setValidationWarnings(data.warnings);
        alert(data.message || 'Validation failed. Please review errors.');
        return;
      }

      alert(data.message);
      setIsCreateModalOpen(false);
      resetForm();
      fetchAllData();
    } catch (err) {
      console.error(err);
      alert('Network error while saving Purchase Order.');
    }
  };

  // Execute Status Action (Submit, Approve, Send, Accept, Cancel, Close)
  const executeStatusAction = async (poId, action) => {
    let endpoint = `/api/purchase-orders/${poId}/${action}`;
    let body = {};

    if (action === 'cancel') {
      const reason = prompt('Please enter cancellation reason:');
      if (!reason) return;
      body = { reason };
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchAllData();
        if (selectedPo && selectedPo.id === poId) {
          setSelectedPo(data.data);
        }
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openEditModal = (po) => {
    setFormData({
      id: po.id,
      po_number: po.po_number,
      po_date: po.po_date,
      supplier_id: po.supplier_id,
      supplier_address: po.supplier_address || '',
      billing_address: po.billing_address || '',
      delivery_address: po.delivery_address || '',
      currency: po.currency || 'INR',
      payment_terms: po.payment_terms || '',
      delivery_terms: po.delivery_terms || '',
      freight_terms: po.freight_terms || '',
      buyer: po.buyer || '',
      quotation_id: po.quotation_id || '',
      rfq_id: po.rfq_id || '',
      indent_id: po.indent_id || '',
      terms_conditions: po.terms_conditions || '',
      status: po.status,
      override_quote_permission: false,
      override_indent_qty_permission: false,
      items: (po.items || []).map(pi => ({
        item_id: pi.item_id,
        item_code: pi.item_code,
        description_snapshot: pi.description_snapshot,
        ordered_quantity: pi.ordered_quantity,
        unit: pi.unit || 'Pcs',
        unit_rate: pi.unit_rate,
        discount: pi.discount || 0,
        tax: pi.tax || 18,
        delivery_date: pi.delivery_date || new Date().toISOString().split('T')[0],
        warehouse_id: pi.warehouse_id || 'wh-01'
      }))
    });
    setIsCreateModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      id: null,
      po_number: '',
      po_date: new Date().toISOString().split('T')[0],
      supplier_id: '',
      supplier_address: '',
      billing_address: 'Apex Enterprises HQ, 100 Industrial Park, Zone 4, Bangalore',
      delivery_address: 'Central Goods Warehouse (WH-MAIN), Gate 2, Bangalore',
      currency: 'INR',
      payment_terms: 'Net 30 days',
      delivery_terms: 'FOB Destination',
      freight_terms: 'Freight Prepaid',
      buyer: 'Sarah Jenkins (Buyer)',
      quotation_id: '',
      rfq_id: '',
      indent_id: '',
      terms_conditions: '1. Goods subject to inspection upon delivery.\n2. Invoice must quote PO number and GSTIN.',
      status: 'Draft',
      override_quote_permission: false,
      override_indent_qty_permission: false,
      items: [
        {
          item_id: '',
          item_code: '',
          description_snapshot: '',
          ordered_quantity: 1,
          unit: 'Pcs',
          unit_rate: 0,
          discount: 0,
          tax: 18,
          delivery_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
          warehouse_id: 'wh-01'
        }
      ]
    });
    setValidationErrors([]);
    setValidationWarnings([]);
  };

  // Real-time Math Totals inside Modal
  const modalSubtotal = formData.items.reduce((sum, item) => {
    const gross = (Number(item.ordered_quantity) || 0) * (Number(item.unit_rate) || 0);
    const disc = (gross * (Number(item.discount) || 0)) / 100;
    return sum + (gross - disc);
  }, 0);

  const modalTaxTotal = formData.items.reduce((sum, item) => {
    const gross = (Number(item.ordered_quantity) || 0) * (Number(item.unit_rate) || 0);
    const disc = (gross * (Number(item.discount) || 0)) / 100;
    const taxable = gross - disc;
    return sum + ((taxable * (Number(item.tax) || 0)) / 100);
  }, 0);

  const modalGrandTotal = modalSubtotal + modalTaxTotal;

  return (
    <div className="space-y-6">
      {/* Top Page Header */}
      <div className="bg-white p-5 border border-slate-200/80 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 font-heading flex items-center space-x-2.5">
            <ShoppingCart className="w-6 h-6 text-purple-600" />
            <span>Formal Purchase Order Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Create purchase commitments, enforce quotation & indent limits, track versions, and generate PDF invoices with QR codes.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={fetchAllData} 
            className="p-2 text-slate-500 hover:text-purple-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => { resetForm(); setIsCreateModalOpen(true); }}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Purchase Order</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total POs</span>
          <p className="text-2xl font-black text-slate-900 font-mono mt-1">{totalCount}</p>
        </div>
        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
          <span className="text-[10px] uppercase font-bold text-amber-500">Pending Approval</span>
          <p className="text-2xl font-black text-amber-600 font-mono mt-1">{pendingCount}</p>
        </div>
        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
          <span className="text-[10px] uppercase font-bold text-purple-500">Active / Dispatched</span>
          <p className="text-2xl font-black text-purple-700 font-mono mt-1">{activeCount}</p>
        </div>
        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
          <span className="text-[10px] uppercase font-bold text-emerald-500">Fulfilled / Closed</span>
          <p className="text-2xl font-black text-emerald-700 font-mono mt-1">{fulfilledCount}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-900 to-indigo-900 text-white p-4 rounded-2xl shadow-xs">
          <span className="text-[10px] uppercase font-bold text-purple-200">Total PO Value</span>
          <p className="text-xl font-black text-white font-mono mt-1">₹{totalValue.toLocaleString()}</p>
        </div>
      </div>

      {/* Search & Filters Toolbar */}
      <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {['All', 'Draft', 'Pending approval', 'Approved', 'Sent to supplier', 'Supplier accepted', 'Partially received', 'Fully received', 'Closed', 'Cancelled'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === st 
                  ? 'bg-purple-900 text-white shadow-xs' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Supplier Filter & Search Input */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <select
            value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="All">All Suppliers</option>
            {suppliers.map(s => (
              <option key={s.id} value={s.id}>{s.supplier_name}</option>
            ))}
          </select>

          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search PO #, Supplier, Ref..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 pl-9 pr-3 py-2 text-xs rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {/* PO Cards List */}
      <div className="space-y-4">
        {filteredPos.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
            <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-slate-800 font-bold text-sm">No Purchase Orders found</h3>
            <p className="text-slate-500 text-xs mt-1">Try adjusting search query or filters.</p>
          </div>
        ) : (
          filteredPos.map(po => (
            <div key={po.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:border-purple-300 transition space-y-4">
              {/* Header Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-base font-bold text-purple-900">{po.po_number}</span>
                  {po.version_number > 1 && (
                    <span className="bg-purple-100 text-purple-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md">
                      Rev #{po.version_number}
                    </span>
                  )}
                  <StatusBadge status={po.status} />
                  <span className="text-xs text-slate-500">Date: {po.po_date}</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className="text-base font-bold text-emerald-700 font-mono">
                    ₹{Number(po.grand_total || po.total_amount || 0).toLocaleString()}
                  </span>
                  
                  {/* Action Buttons based on status */}
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setSelectedPo(po)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center space-x-1 transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>

                    {po.status === 'Draft' && (
                      <>
                        <button 
                          onClick={() => openEditModal(po)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center space-x-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button 
                          onClick={() => executeStatusAction(po.id, 'submit')}
                          className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit</span>
                        </button>
                      </>
                    )}

                    {po.status === 'Pending approval' && (
                      <button 
                        onClick={() => executeStatusAction(po.id, 'approve')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    )}

                    {po.status === 'Approved' && (
                      <>
                        <button 
                          onClick={() => openEditModal(po)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center space-x-1"
                          title="Editing approved PO will create revision and trigger reapproval"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Revise</span>
                        </button>
                        <button 
                          onClick={() => executeStatusAction(po.id, 'send')}
                          className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Send to Supplier</span>
                        </button>
                      </>
                    )}

                    {po.status === 'Sent to supplier' && (
                      <button 
                        onClick={() => executeStatusAction(po.id, 'accept')}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Supplier Accepted</span>
                      </button>
                    )}

                    <button 
                      onClick={() => setPrintDoc(po)}
                      className="bg-purple-900 hover:bg-purple-950 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1 shadow-xs transition"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print PDF</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Vendor & Header Metadata */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Supplier</span>
                  <span className="text-slate-900 font-bold">{po.supplier_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Payment & Delivery Terms</span>
                  <span className="text-slate-800 font-semibold">{po.payment_terms || 'Net 30'} &bull; {po.delivery_terms || 'FOB'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">References</span>
                  <span className="text-slate-700 font-mono text-[11px]">
                    {po.quotation_number ? `Quote: ${po.quotation_number}` : po.indent_number ? `Indent: ${po.indent_number}` : 'Direct Commercial'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Buyer</span>
                  <span className="text-slate-800 font-semibold">{po.buyer || 'Sarah Jenkins'}</span>
                </div>
              </div>

              {/* Line Items Snippet Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-100/70 text-slate-500 uppercase text-[10px] border-b border-slate-200 font-bold">
                      <th className="py-2 px-3">Item Code & Name</th>
                      <th className="py-2 px-3 text-right">Ordered Qty</th>
                      <th className="py-2 px-3 text-right">Received Qty</th>
                      <th className="py-2 px-3 text-right">Pending Qty</th>
                      <th className="py-2 px-3 text-right">Unit Rate</th>
                      <th className="py-2 px-3 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {(po.items || []).map((line, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3">
                          <span className="text-purple-800 font-mono font-bold block text-[11px]">{line.item_code}</span>
                          <span className="text-slate-800 font-medium text-xs">{line.description_snapshot || line.item_name}</span>
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-800">{line.ordered_quantity} {line.unit}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-emerald-600">{line.received_quantity || 0}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-amber-600">{line.pending_quantity || line.ordered_quantity}</td>
                        <td className="py-2 px-3 text-right font-mono text-slate-700">₹{(line.unit_rate || 0).toLocaleString()}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">₹{(line.line_total || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE / EDIT PURCHASE ORDER MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-sm uppercase tracking-wider font-heading">
                  {formData.id ? `Edit Purchase Order (${formData.po_number})` : 'New Purchase Order Creation'}
                </h3>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-800">
              {/* Validation Warnings & Errors */}
              {validationErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl space-y-1">
                  <div className="flex items-center space-x-2 font-bold text-sm">
                    <ShieldAlert className="w-5 h-5 text-red-600" />
                    <span>Purchase Order Rule Violations</span>
                  </div>
                  <ul className="list-disc list-inside text-xs space-y-1">
                    {validationErrors.map((err, i) => <li key={i}>{err}</li>)}
                  </ul>
                </div>
              )}

              {/* Import Bar */}
              <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-200/80 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-purple-900 mb-1">Import from Approved Quotation</label>
                  <select
                    onChange={(e) => handleImportQuotation(e.target.value)}
                    className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-xs font-semibold"
                  >
                    <option value="">-- Select Quotation --</option>
                    {quotations.map(q => (
                      <option key={q.id} value={q.id}>{q.quotation_number} ({q.supplier_name} - ₹{q.total_landed_cost?.toLocaleString()})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-purple-900 mb-1">Import from Material Indent</label>
                  <select
                    onChange={(e) => handleImportIndent(e.target.value)}
                    className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-xs font-semibold"
                  >
                    <option value="">-- Select Indent --</option>
                    {indents.map(i => (
                      <option key={i.id} value={i.id}>{i.indent_number} ({i.purpose})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* PO Header Fields */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">PO Number (Auto if empty)</label>
                  <input
                    type="text"
                    value={formData.po_number}
                    onChange={(e) => setFormData(p => ({ ...p, po_number: e.target.value }))}
                    placeholder="e.g. PO-2026-003004"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">PO Date</label>
                  <input
                    type="date"
                    value={formData.po_date}
                    onChange={(e) => setFormData(p => ({ ...p, po_date: e.target.value }))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Supplier *</label>
                  <select
                    value={formData.supplier_id}
                    onChange={(e) => handleSupplierChange(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  >
                    <option value="">-- Select Supplier --</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.supplier_name} ({s.supplier_code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData(p => ({ ...p, currency: e.target.value }))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Payment Terms</label>
                  <input
                    type="text"
                    value={formData.payment_terms}
                    onChange={(e) => setFormData(p => ({ ...p, payment_terms: e.target.value }))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Delivery Terms</label>
                  <input
                    type="text"
                    value={formData.delivery_terms}
                    onChange={(e) => setFormData(p => ({ ...p, delivery_terms: e.target.value }))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Freight Terms</label>
                  <input
                    type="text"
                    value={formData.freight_terms}
                    onChange={(e) => setFormData(p => ({ ...p, freight_terms: e.target.value }))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Purchasing Officer (Buyer)</label>
                  <input
                    type="text"
                    value={formData.buyer}
                    onChange={(e) => setFormData(p => ({ ...p, buyer: e.target.value }))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Billing Address</label>
                  <input
                    type="text"
                    value={formData.billing_address}
                    onChange={(e) => setFormData(p => ({ ...p, billing_address: e.target.value }))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Delivery Address</label>
                  <input
                    type="text"
                    value={formData.delivery_address}
                    onChange={(e) => setFormData(p => ({ ...p, delivery_address: e.target.value }))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              {/* Line Items Table Editor */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Purchase Order Items</h4>
                  <button
                    onClick={addLineItem}
                    className="bg-purple-100 hover:bg-purple-200 text-purple-800 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item Line</span>
                  </button>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-slate-900 text-white uppercase text-[10px]">
                        <th className="py-2.5 px-3">Item Select</th>
                        <th className="py-2.5 px-3">Ordered Qty</th>
                        <th className="py-2.5 px-3">Unit</th>
                        <th className="py-2.5 px-3">Unit Rate (₹)</th>
                        <th className="py-2.5 px-3">Discount (%)</th>
                        <th className="py-2.5 px-3">Tax (%)</th>
                        <th className="py-2.5 px-3 text-right">Line Total</th>
                        <th className="py-2.5 px-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {formData.items.map((line, idx) => {
                        const lineGross = (Number(line.ordered_quantity) || 0) * (Number(line.unit_rate) || 0);
                        const lineDisc = (lineGross * (Number(line.discount) || 0)) / 100;
                        const lineTaxable = lineGross - lineDisc;
                        const lineTotal = lineTaxable + ((lineTaxable * (Number(line.tax) || 0)) / 100);

                        return (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2.5 space-y-1 min-w-[220px]">
                              <select
                                value={line.item_id}
                                onChange={(e) => handleLineItemChange(idx, 'item_id', e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded-xl px-2 py-1.5 text-xs font-semibold"
                              >
                                <option value="">-- Select Item --</option>
                                {itemsMaster.map(itm => (
                                  <option key={itm.id} value={itm.id}>{itm.item_code} - {itm.item_name}</option>
                                ))}
                              </select>
                              <input
                                type="text"
                                value={line.description_snapshot}
                                onChange={(e) => handleLineItemChange(idx, 'description_snapshot', e.target.value)}
                                placeholder="Description Snapshot"
                                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] text-slate-600"
                              />
                            </td>

                            <td className="p-2.5 w-24">
                              <input
                                type="number"
                                min="1"
                                value={line.ordered_quantity}
                                onChange={(e) => handleLineItemChange(idx, 'ordered_quantity', Math.max(1, Number(e.target.value)))}
                                className="w-full bg-white border border-slate-300 rounded-xl px-2 py-1.5 text-xs font-mono font-bold text-right"
                              />
                            </td>

                            <td className="p-2.5 w-20">
                              <input
                                type="text"
                                value={line.unit}
                                onChange={(e) => handleLineItemChange(idx, 'unit', e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded-xl px-2 py-1.5 text-xs text-center"
                              />
                            </td>

                            <td className="p-2.5 w-28">
                              <input
                                type="number"
                                min="0"
                                value={line.unit_rate}
                                onChange={(e) => handleLineItemChange(idx, 'unit_rate', Number(e.target.value))}
                                className="w-full bg-white border border-slate-300 rounded-xl px-2 py-1.5 text-xs font-mono text-right font-bold"
                              />
                            </td>

                            <td className="p-2.5 w-20">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={line.discount}
                                onChange={(e) => handleLineItemChange(idx, 'discount', Number(e.target.value))}
                                className="w-full bg-white border border-slate-300 rounded-xl px-2 py-1.5 text-xs font-mono text-right"
                              />
                            </td>

                            <td className="p-2.5 w-20">
                              <input
                                type="number"
                                min="0"
                                value={line.tax}
                                onChange={(e) => handleLineItemChange(idx, 'tax', Number(e.target.value))}
                                className="w-full bg-white border border-slate-300 rounded-xl px-2 py-1.5 text-xs font-mono text-right"
                              />
                            </td>

                            <td className="p-2.5 text-right font-mono font-bold text-slate-900 w-32">
                              ₹{lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>

                            <td className="p-2.5 text-center w-12">
                              <button
                                onClick={() => removeLineItem(idx)}
                                className="text-red-500 hover:text-red-700 p-1"
                                title="Remove line"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Rules & Permissions Overrides Banners */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
                <p className="font-bold text-xs text-amber-900 flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Procurement Control Rule Overrides (Rules 1 & 2)</span>
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-amber-900">
                  <label className="flex items-center space-x-2 bg-white p-2.5 rounded-xl border border-amber-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.override_quote_permission}
                      onChange={(e) => setFormData(p => ({ ...p, override_quote_permission: e.target.checked }))}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span>Authorize PO rate exceeding approved Quotation rate (Rule 1 Override)</span>
                  </label>

                  <label className="flex items-center space-x-2 bg-white p-2.5 rounded-xl border border-amber-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.override_indent_qty_permission}
                      onChange={(e) => setFormData(p => ({ ...p, override_indent_qty_permission: e.target.checked }))}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span>Authorize PO qty exceeding approved Indent qty (Rule 2 Override)</span>
                  </label>
                </div>
              </div>

              {/* T&Cs Block */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Terms and Conditions</label>
                <textarea
                  rows="3"
                  value={formData.terms_conditions}
                  onChange={(e) => setFormData(p => ({ ...p, terms_conditions: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-mono"
                />
              </div>

              {/* Totals Summary */}
              <div className="bg-slate-900 text-white p-4 rounded-2xl flex justify-between items-center font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-sans font-bold">Subtotal:</span> ₹{modalSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  <span className="mx-3 text-slate-600">|</span>
                  <span className="text-[10px] text-slate-400 uppercase font-sans font-bold">GST Tax:</span> ₹{modalTaxTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-right">
                  <span className="text-xs text-purple-300 uppercase font-sans font-bold mr-2">Grand Total:</span>
                  <span className="text-xl font-black text-white">₹{modalGrandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl transition"
              >
                Cancel
              </button>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleSubmitPo('Draft')}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs px-4 py-2 rounded-xl transition"
                >
                  Save as Draft
                </button>
                <button
                  onClick={() => handleSubmitPo('Pending approval')}
                  className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-xs transition"
                >
                  Save & Submit for Approval
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PO DETAIL DRAWER */}
      {selectedPo && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-end z-50">
          <div className="bg-white w-full max-w-3xl h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-6 bg-slate-900 text-white border-b border-slate-800 flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-lg font-bold text-purple-400">{selectedPo.po_number}</span>
                  <StatusBadge status={selectedPo.status} />
                  {selectedPo.version_number > 1 && (
                    <span className="bg-purple-800 text-purple-200 text-xs font-mono font-bold px-2 py-0.5 rounded">
                      Rev #{selectedPo.version_number}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Created on {selectedPo.po_date} by {selectedPo.buyer || 'Sarah Jenkins'}
                </p>
              </div>
              <button onClick={() => setSelectedPo(null)} className="text-slate-400 hover:text-white">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Drawer Tabs Bar */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-6">
              {[
                { id: 'items', label: 'Ordered Items', icon: ShoppingCart },
                { id: 'terms', label: 'Terms & Conditions', icon: FileText },
                { id: 'history', label: 'Status Audit Log', icon: History },
                { id: 'revisions', label: `Version History (${(selectedPo.revisions || []).length})`, icon: Layers }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveDrawerTab(tab.id)}
                  className={`py-3 px-4 text-xs font-bold flex items-center space-x-1.5 border-b-2 transition ${
                    activeDrawerTab === tab.id 
                      ? 'border-purple-700 text-purple-700 bg-white' 
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Drawer Body Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-slate-800">
              {activeDrawerTab === 'items' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Supplier</span>
                      <span className="font-bold text-slate-900 text-sm block">{selectedPo.supplier_name}</span>
                      <span className="text-slate-600 block">{selectedPo.supplier_address}</span>
                      <span className="text-slate-600 block">GSTIN: {selectedPo.supplier_gst || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Delivery Address</span>
                      <span className="font-semibold text-slate-800 block">{selectedPo.delivery_address}</span>
                    </div>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="bg-slate-900 text-white uppercase text-[10px]">
                          <th className="py-2.5 px-3">Item Code & Name</th>
                          <th className="py-2.5 px-3 text-right">Ordered Qty</th>
                          <th className="py-2.5 px-3 text-right">Received Qty</th>
                          <th className="py-2.5 px-3 text-right">Unit Rate</th>
                          <th className="py-2.5 px-3 text-right">Line Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-sans">
                        {(selectedPo.items || []).map((line, idx) => (
                          <tr key={idx}>
                            <td className="py-2.5 px-3">
                              <span className="text-purple-800 font-mono font-bold block">{line.item_code}</span>
                              <span className="text-slate-800 font-semibold">{line.description_snapshot || line.item_name}</span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{line.ordered_quantity} {line.unit}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600">{line.received_quantity || 0}</td>
                            <td className="py-2.5 px-3 text-right font-mono">₹{(line.unit_rate || 0).toLocaleString()}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">₹{(line.line_total || 0).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-purple-900 text-white p-4 rounded-2xl text-right font-mono">
                    <span className="text-purple-200 text-xs font-sans uppercase font-bold mr-2">Grand Total Value:</span>
                    <span className="text-xl font-bold">₹{Number(selectedPo.grand_total || selectedPo.total_amount || 0).toLocaleString()}</span>
                  </div>
                </div>
              )}

              {activeDrawerTab === 'terms' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Payment Terms</span>
                      <span className="font-bold text-slate-800">{selectedPo.payment_terms || 'Net 30'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Delivery Terms</span>
                      <span className="font-bold text-slate-800">{selectedPo.delivery_terms || 'FOB'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Freight Terms</span>
                      <span className="font-bold text-slate-800">{selectedPo.freight_terms || 'Prepaid'}</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                    <h4 className="font-bold text-xs uppercase text-slate-900">Terms & Conditions</h4>
                    <p className="whitespace-pre-line text-slate-700 leading-relaxed font-mono text-[11px]">
                      {selectedPo.terms_conditions || 'Standard purchase terms apply.'}
                    </p>
                  </div>
                </div>
              )}

              {activeDrawerTab === 'history' && (
                <div className="space-y-3">
                  <h4 className="font-bold text-xs uppercase text-slate-900">Status Audit Trail</h4>
                  {(selectedPo.status_history || []).length === 0 ? (
                    <p className="text-slate-400 italic">No status history recorded.</p>
                  ) : (
                    <div className="relative pl-6 border-l-2 border-slate-200 space-y-4">
                      {selectedPo.status_history.map((hist, i) => (
                        <div key={i} className="relative">
                          <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-purple-600 border-2 border-white" />
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-900">{hist.changed_by}</span>
                              <span className="text-[10px] text-slate-400">{new Date(hist.changed_at).toLocaleString()}</span>
                            </div>
                            <p className="text-xs text-purple-700 font-semibold mt-1">
                              Status changed: {hist.old_status ? `${hist.old_status} → ` : ''}{hist.new_status}
                            </p>
                            {hist.comments && <p className="text-slate-600 text-[11px] mt-1">{hist.comments}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeDrawerTab === 'revisions' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-xs uppercase text-slate-900">PO Version & Revision History</h4>
                  {(selectedPo.revisions || []).length === 0 ? (
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center text-slate-500">
                      <Layers className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p>This Purchase Order is on initial Version #1. No post-approval revisions recorded.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedPo.revisions.map((rev, idx) => (
                        <div key={idx} className="bg-purple-50/50 p-4 rounded-2xl border border-purple-200">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-purple-900 font-mono">Version #{rev.version_number}</span>
                            <span className="text-[10px] text-slate-500">{new Date(rev.revised_at).toLocaleString()}</span>
                          </div>
                          <p className="text-xs text-slate-700 mt-1">Revised by: <span className="font-bold">{rev.revised_by}</span></p>
                          <p className="text-xs text-amber-800 font-medium mt-0.5">Reason: {rev.reason}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                {selectedPo.status !== 'Closed' && selectedPo.status !== 'Cancelled' && (
                  <button 
                    onClick={() => { const poToEdit = selectedPo; setSelectedPo(null); openEditModal(poToEdit); }} 
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit / Revise PO</span>
                  </button>
                )}
                <button 
                  onClick={() => setPrintDoc(selectedPo)} 
                  className="bg-purple-900 hover:bg-purple-950 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center space-x-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>
              </div>

              <button 
                onClick={() => setSelectedPo(null)} 
                className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl cursor-pointer"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Document Modal */}
      <PrintModal 
        isOpen={!!printDoc}
        onClose={() => setPrintDoc(null)}
        docType="PURCHASE ORDER"
        docData={printDoc}
      />
    </div>
  );
}

