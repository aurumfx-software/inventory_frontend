import React, { useState, useEffect, useMemo } from 'react';
import { 
  Send, 
  Plus, 
  FileText, 
  CheckCircle2, 
  Clock, 
  X, 
  Search, 
  Paperclip, 
  UserCheck, 
  MapPin, 
  Building2, 
  Calendar, 
  DollarSign, 
  Eye, 
  Lock, 
  Download, 
  Mail, 
  Globe, 
  Cpu, 
  ShieldCheck, 
  Star,
  Layers,
  AlertCircle,
  Trash2
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

export default function RFQManagement() {
  const [rfqs, setRfqs] = useState([]);
  const [itemsMaster, setItemsMaster] = useState([]);
  const [suppliersMaster, setSuppliersMaster] = useState([]);
  const [indentsMaster, setIndentsMaster] = useState([]);
  const [suggestedSuppliers, setSuggestedSuppliers] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusTab, setStatusTab] = useState('ALL');

  // Modals state
  const [showRfqModal, setShowRfqModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [selectedRfq, setSelectedRfq] = useState(null);
  const [supplierStatusData, setSupplierStatusData] = useState(null);

  // RFQ Header & Items Form
  const [rfqForm, setRfqForm] = useState({
    id: null,
    rfq_number: '',
    rfq_date: new Date().toISOString().split('T')[0],
    closing_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    buyer: 'Purchase Officer',
    delivery_location: 'Central Goods Warehouse, Main Branch',
    currency: 'INR',
    terms: 'FOB Destination, Payment Net 30 days after GRN approval.',
    contact_person: 'Purchase Department (procurement@company.com / +91-9876543210)',
    source_indent_numbers: [],
    supplier_ids: [],
    status: 'Draft',
    attachments: [],
    items: [
      {
        item_id: '',
        item_code_snapshot: '',
        item_name_snapshot: '',
        specification: '',
        quantity: 1,
        unit: 'Pcs',
        required_delivery_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        acceptable_brands: '',
        technical_document: null,
        remarks: ''
      }
    ]
  });

  // Send Modal Form
  const [sendForm, setSendForm] = useState({
    send_method: 'Email with PDF attachment',
    recipient_emails: '',
    notes: ''
  });

  useEffect(() => {
    // 1. Instant Cache Restoration
    const cachedRfqs = localStorage.getItem('app_rfqs_master');
    const cachedItems = localStorage.getItem('app_items_master');
    const cachedSups = localStorage.getItem('app_suppliers_master');

    if (cachedRfqs) { try { setRfqs(JSON.parse(cachedRfqs)); setIsLoading(false); } catch(e){} }
    if (cachedItems) { try { setItemsMaster(JSON.parse(cachedItems)); } catch(e){} }
    if (cachedSups) { try { setSuppliersMaster(JSON.parse(cachedSups)); } catch(e){} }

    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    if (!localStorage.getItem('app_rfqs_master')) setIsLoading(true);
    try {
      const [rfqRes, itemRes, supRes, indRes] = await Promise.all([
        fetch('/api/rfqs').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/items').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/suppliers').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/indents').then(r => r.json()).catch(() => ({ success: false }))
      ]);

      if (rfqRes.success && Array.isArray(rfqRes.data)) {
        setRfqs(rfqRes.data);
        localStorage.setItem('app_rfqs_master', JSON.stringify(rfqRes.data));
      }
      if (itemRes.success && Array.isArray(itemRes.data)) {
        setItemsMaster(itemRes.data);
        localStorage.setItem('app_items_master', JSON.stringify(itemRes.data));
      }
      if (supRes.success && Array.isArray(supRes.data)) {
        setSuppliersMaster(supRes.data);
        localStorage.setItem('app_suppliers_master', JSON.stringify(supRes.data));
      }
      if (indRes.success && Array.isArray(indRes.data)) {
        const approved = (indRes.data || []).filter(i => i.status === 'Approved' || i.status === 'Submitted');
        setIndentsMaster(approved);
      }
    } catch (err) {
      console.error('Failed to load RFQ data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch System Suggested Suppliers based on selected items & location
  const fetchSuggestedSuppliers = async (itemId, categoryId, location) => {
    try {
      const query = new URLSearchParams();
      if (itemId) query.append('item_ids', itemId);
      if (categoryId) query.append('category_id', categoryId);
      if (location) query.append('delivery_location', location);

      const res = await fetch(`/api/rfqs/suggested-suppliers?${query.toString()}`);
      const data = await res.json();
      if (data.success) {
        setSuggestedSuppliers(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch suggested suppliers:', err);
    }
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    const today = new Date().toISOString().split('T')[0];
    const closing = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
    
    setRfqForm({
      id: null,
      rfq_number: `RFQ-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      rfq_date: today,
      closing_date: closing,
      buyer: 'Sarah Jenkins (Super Administrator)',
      delivery_location: 'Central Goods Warehouse, Main Branch',
      currency: 'INR',
      terms: 'FOB Destination, Payment Net 30 days after GRN approval.',
      contact_person: 'Sarah Jenkins (procurement@company.com / +91-9876543210)',
      source_indent_numbers: [],
      supplier_ids: [],
      status: 'Draft',
      attachments: [],
      items: [
        {
          item_id: itemsMaster[0]?.id || '',
          item_code_snapshot: itemsMaster[0]?.item_code || '',
          item_name_snapshot: itemsMaster[0]?.item_name || '',
          specification: itemsMaster[0]?.description || '',
          quantity: 1,
          unit: itemsMaster[0]?.uom || 'Pcs',
          required_delivery_date: closing,
          acceptable_brands: itemsMaster[0]?.preferred_brand_name || 'Standard',
          technical_document: null,
          remarks: ''
        }
      ]
    });

    if (itemsMaster[0]) {
      fetchSuggestedSuppliers(itemsMaster[0].id, itemsMaster[0].category_id, 'Central Goods Warehouse, Main Branch');
    } else {
      setSuggestedSuppliers(suppliersMaster);
    }

    setShowRfqModal(true);
  };

  // Handle Item Selection Change (Preserves Snapshot!)
  const handleItemChange = (index, itemId) => {
    const itemMaster = itemsMaster.find(i => i.id === itemId);
    const updatedItems = [...rfqForm.items];
    
    if (itemMaster) {
      updatedItems[index] = {
        ...updatedItems[index],
        item_id: itemMaster.id,
        item_code_snapshot: itemMaster.item_code,
        item_name_snapshot: itemMaster.item_name,
        specification: itemMaster.description || '',
        unit: itemMaster.uom_symbol || itemMaster.uom || 'Pcs',
        acceptable_brands: itemMaster.preferred_brand_name || ''
      };

      // Refresh suggested suppliers
      fetchSuggestedSuppliers(itemMaster.id, itemMaster.category_id, rfqForm.delivery_location);
    } else {
      updatedItems[index].item_id = itemId;
    }

    setRfqForm({ ...rfqForm, items: updatedItems });
  };

  // Add Item Line
  const handleAddItemLine = () => {
    setRfqForm({
      ...rfqForm,
      items: [
        ...rfqForm.items,
        {
          item_id: '',
          item_code_snapshot: '',
          item_name_snapshot: '',
          specification: '',
          quantity: 1,
          unit: 'Pcs',
          required_delivery_date: rfqForm.closing_date,
          acceptable_brands: '',
          technical_document: null,
          remarks: ''
        }
      ]
    });
  };

  // Remove Item Line
  const handleRemoveItemLine = (index) => {
    if (rfqForm.items.length === 1) return;
    const updated = rfqForm.items.filter((_, idx) => idx !== index);
    setRfqForm({ ...rfqForm, items: updated });
  };

  // Toggle Supplier Selection
  const handleToggleSupplier = (supplierId) => {
    const current = rfqForm.supplier_ids || [];
    if (current.includes(supplierId)) {
      setRfqForm({ ...rfqForm, supplier_ids: current.filter(id => id !== supplierId) });
    } else {
      setRfqForm({ ...rfqForm, supplier_ids: [...current, supplierId] });
    }
  };

  // Select Indent Source
  const handleToggleIndentSource = (indentNo) => {
    const current = rfqForm.source_indent_numbers || [];
    if (current.includes(indentNo)) {
      setRfqForm({ ...rfqForm, source_indent_numbers: current.filter(no => no !== indentNo) });
    } else {
      setRfqForm({ ...rfqForm, source_indent_numbers: [...current, indentNo] });
    }
  };

  // Save RFQ (Draft or Approved)
  const handleSaveRfq = async (targetStatus) => {
    try {
      const payload = {
        ...rfqForm,
        status: targetStatus || rfqForm.status || 'Draft'
      };

      const res = await fetch('/api/rfqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setShowRfqModal(false);
        fetchInitialData();
      }
    } catch (err) {
      console.error('Failed to save RFQ:', err);
    }
  };

  // Open Send Modal
  const handleOpenSendModal = (rfq) => {
    setSelectedRfq(rfq);
    const emails = (rfq.suppliers || []).map(s => s.email).filter(Boolean).join(', ');
    setSendForm({
      send_method: 'Email with PDF attachment',
      recipient_emails: emails || 'vendors@procurement-suppliers.com',
      notes: `Request for Quotation ${rfq.rfq_number} for immediate commercial bid response.`
    });
    setShowSendModal(true);
  };

  // Submit Send Action
  const handleExecuteSend = async (e) => {
    e.preventDefault();
    if (!selectedRfq) return;

    try {
      const res = await fetch(`/api/rfqs/${selectedRfq.id}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sendForm)
      });

      const data = await res.json();
      if (data.success) {
        setShowSendModal(false);
        fetchInitialData();
      }
    } catch (err) {
      console.error('Failed to send RFQ:', err);
    }
  };

  // Close RFQ
  const handleCloseRfq = async (rfqId) => {
    try {
      const res = await fetch(`/api/rfqs/${rfqId}/close`, { method: 'POST' });
      const data = await res.json();
      if (data.success) fetchInitialData();
    } catch (err) {
      console.error('Failed to close RFQ:', err);
    }
  };

  // Delete RFQ (Closed or Draft)
  const handleDeleteRfq = async (rfqId, rfqNumber) => {
    if (!window.confirm(`Are you sure you want to delete RFQ ${rfqNumber}? This action cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/rfqs/${rfqId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchInitialData();
    } catch (err) {
      console.error('Failed to delete RFQ:', err);
    }
  };

  // Open Supplier Tracking Modal
  const handleOpenTrackingModal = async (rfq) => {
    setSelectedRfq(rfq);
    try {
      const res = await fetch(`/api/rfqs/${rfq.id}/supplier-status`);
      const data = await res.json();
      if (data.success) {
        setSupplierStatusData(data);
        setShowTrackingModal(true);
      }
    } catch (err) {
      console.error('Failed to fetch supplier tracking status:', err);
    }
  };

  // Open RFQ Detail Modal
  const handleOpenDetailModal = (rfq) => {
    setSelectedRfq(rfq);
    setShowDetailModal(true);
  };

  // Filtered RFQs List
  const filteredRfqs = useMemo(() => {
    const list = rfqs.filter(r => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = !q || (
        r.rfq_number?.toLowerCase().includes(q) ||
        r.buyer?.toLowerCase().includes(q) ||
        r.delivery_location?.toLowerCase().includes(q) ||
        (r.items || []).some(i => i.item_code?.toLowerCase().includes(q) || i.item_name?.toLowerCase().includes(q))
      );

      let matchesStatus = true;
      if (statusTab !== 'ALL') {
        matchesStatus = r.status?.toLowerCase() === statusTab.toLowerCase();
      }

      return matchesQuery && matchesStatus;
    });

    return [...list].sort((a, b) => {
      const dateA = new Date(a.created_at || a.rfq_date || 0).getTime();
      const dateB = new Date(b.created_at || b.rfq_date || 0).getTime();
      if (dateA !== dateB) return dateB - dateA;
      return String(b.rfq_number || b.id).localeCompare(String(a.rfq_number || a.id));
    });
  }, [rfqs, searchQuery, statusTab]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none font-sans text-slate-800">
      
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200/80 p-5 rounded-2xl shadow-2xs">
        <div>
          <div className="flex items-center space-x-2">
            <Send className="w-5 h-5 text-purple-600" />
            <h1 className="text-lg font-bold text-slate-900 font-heading tracking-tight">Request for Quotation (RFQ) Page</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Create, issue, and manage RFQs sent to one or more suppliers with item specification snapshot preservation.
          </p>
        </div>

        <button 
          onClick={handleOpenCreateModal}
          className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center space-x-2 shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Create New RFQ</span>
        </button>
      </div>

      {/* SNAPSHOT IMPLEMENTATION RULE BADGE */}
      <div className="bg-purple-50/80 border border-purple-200 p-3.5 rounded-2xl flex items-start space-x-3 text-xs text-purple-900 shadow-2xs">
        <Lock className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold text-purple-950 block">Implementation Rule & Item Snapshot Preservation:</strong>
          <span>This RFQ engine preserves a permanent snapshot of item codes, names, and specifications at creation time. Later modifications in Item Master will never alter historical RFQ document records.</span>
        </div>
      </div>

      {/* CONTROLS: SEARCH & STATUS TABS */}
      <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 justify-between items-center">
          
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input 
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search RFQ #, Buyer, Delivery Location..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:border-purple-500 font-medium"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1.5 text-xs font-bold w-full md:w-auto">
            {['ALL', 'Draft', 'Approved', 'Sent', 'Partially responded', 'Closed', 'Cancelled'].map(tab => (
              <button
                key={tab}
                onClick={() => setStatusTab(tab)}
                className={`px-3 py-1.5 rounded-xl transition ${
                  statusTab === tab 
                    ? 'bg-purple-600 text-white shadow-2xs' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RFQ DOCUMENTS TABLE */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading RFQ documents...</div>
        ) : filteredRfqs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-600">No Request for Quotations found.</p>
            <p className="text-[11px]">Click "Create New RFQ" above to issue a new commercial bid request.</p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-xs text-left min-w-[950px]">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 whitespace-nowrap">RFQ Number & Date</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Buyer & Contact</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Delivery Location</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Items Count</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Suppliers Invited</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Closing Date</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
                  <th className="py-3.5 px-4 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredRfqs.map(rfq => (
                  <tr key={rfq.id} className="hover:bg-purple-50/30 transition">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <strong className="font-mono text-purple-700 font-bold block">{rfq.rfq_number}</strong>
                      <span className="text-[11px] text-slate-500 font-mono font-medium block mt-0.5">Date: {rfq.rfq_date || rfq.created_at?.replace('T', ' ').substring(0, 19) || '2026-09-06 23:57'}</span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-bold text-slate-900 block">{rfq.buyer}</span>
                      <span className="text-[11px] text-slate-500 font-mono block">{rfq.contact_person}</span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                      <span className="font-medium">{rfq.delivery_location}</span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                      {rfq.items?.length || 0} Item(s)
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="bg-indigo-50 text-indigo-700 border border-indigo-200/80 font-mono font-bold px-2.5 py-0.5 rounded-lg text-[11px] inline-block">
                        {rfq.suppliers?.length || 0} Vendor(s)
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-700 font-medium whitespace-nowrap">
                      {rfq.closing_date}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={rfq.status} />
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-2 shrink-0">
                        <button 
                          onClick={() => handleOpenDetailModal(rfq)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-xl transition shadow-2xs"
                          title="View RFQ Header & Item Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button 
                          onClick={() => handleOpenTrackingModal(rfq)}
                          className="bg-purple-50 hover:bg-purple-100 text-purple-700 p-2 rounded-xl transition shadow-2xs"
                          title="Track Supplier Response Status & Logs"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                        </button>

                        {rfq.status !== 'Closed' && rfq.status !== 'Cancelled' && (
                          <button 
                            onClick={() => handleOpenSendModal(rfq)}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl flex items-center space-x-1.5 shadow-2xs transition"
                            title="Send RFQ via Email / Portal / API"
                          >
                            <Send className="w-3 h-3" />
                            <span>Send</span>
                          </button>
                        )}

                        {rfq.status !== 'Closed' && (
                          <button 
                            onClick={() => handleCloseRfq(rfq.id)}
                            className="bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-bold text-[11px] px-2.5 py-1.5 rounded-xl border border-slate-200 transition"
                            title="Close RFQ"
                          >
                            Close
                          </button>
                        )}

                        {(rfq.status === 'Closed' || rfq.status === 'Cancelled' || rfq.status === 'Draft') && (
                          <button 
                            onClick={() => handleDeleteRfq(rfq.id, rfq.rfq_number)}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 p-2 rounded-xl border border-rose-200 transition flex items-center space-x-1 font-bold text-[11px] shadow-2xs"
                            title="Delete Closed RFQ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT RFQ FORM MODAL */}
      {showRfqModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-bold text-sm uppercase tracking-wider font-heading flex items-center space-x-2">
                  <Send className="w-4 h-4 text-purple-400" />
                  <span>Create Request for Quotation (RFQ)</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Complete RFQ Header, Item Fields & Supplier Selection as per procurement policy.
                </p>
              </div>
              <button onClick={() => setShowRfqModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
              
              {/* SECTION 1: RFQ HEADER FIELDS */}
              <div className="bg-slate-50/70 border border-slate-200 p-4 rounded-2xl space-y-4">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-2 flex items-center space-x-1.5">
                  <FileText className="w-4 h-4 text-purple-600" />
                  <span>1. RFQ Header Fields</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">RFQ Number *</label>
                    <input 
                      type="text" 
                      value={rfqForm.rfq_number}
                      onChange={e => setRfqForm({ ...rfqForm, rfq_number: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">RFQ Date *</label>
                    <input 
                      type="date" 
                      value={rfqForm.rfq_date}
                      onChange={e => setRfqForm({ ...rfqForm, rfq_date: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Closing Date *</label>
                    <input 
                      type="date" 
                      value={rfqForm.closing_date}
                      onChange={e => setRfqForm({ ...rfqForm, closing_date: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Buyer *</label>
                    <input 
                      type="text" 
                      value={rfqForm.buyer}
                      onChange={e => setRfqForm({ ...rfqForm, buyer: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Delivery Location *</label>
                    <input 
                      type="text" 
                      value={rfqForm.delivery_location}
                      onChange={e => setRfqForm({ ...rfqForm, delivery_location: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-medium text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Currency *</label>
                    <select 
                      value={rfqForm.currency}
                      onChange={e => setRfqForm({ ...rfqForm, currency: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Contact Person *</label>
                    <input 
                      type="text" 
                      value={rfqForm.contact_person}
                      onChange={e => setRfqForm({ ...rfqForm, contact_person: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-medium text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Source Indents</label>
                    <div className="bg-white border border-slate-300 rounded-xl p-2 max-h-24 overflow-y-auto space-y-1">
                      {indentsMaster.length === 0 ? (
                        <span className="text-[11px] text-slate-400 italic">No approved indents available</span>
                      ) : (
                        indentsMaster.map(ind => (
                          <label key={ind.id} className="flex items-center space-x-1.5 cursor-pointer text-[11px]">
                            <input 
                              type="checkbox"
                              checked={(rfqForm.source_indent_numbers || []).includes(ind.indent_number)}
                              onChange={() => handleToggleIndentSource(ind.indent_number)}
                              className="rounded text-purple-600 focus:ring-purple-500"
                            />
                            <span className="font-mono font-bold text-purple-700">{ind.indent_number}</span>
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Attachments (RFQ Header Documents)</label>
                    <div className="bg-white border border-slate-300 rounded-xl p-2 space-y-2">
                      <input 
                        type="file"
                        onChange={e => {
                          const file = e.target.files[0];
                          if (file) {
                            const newAtt = {
                              id: `att-${Date.now()}`,
                              name: file.name,
                              size: `${(file.size / 1024).toFixed(1)} KB`
                            };
                            setRfqForm({ ...rfqForm, attachments: [...(rfqForm.attachments || []), newAtt] });
                          }
                        }}
                        className="text-[11px] text-slate-600 w-full file:mr-2 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                      />
                      {(rfqForm.attachments || []).length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {rfqForm.attachments.map((att, aIdx) => (
                            <span key={aIdx} className="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded text-[10px] font-mono flex items-center space-x-1">
                              <Paperclip className="w-3 h-3 text-purple-600" />
                              <span className="truncate max-w-[120px]">{att.name}</span>
                              <button 
                                type="button" 
                                onClick={() => {
                                  const updated = rfqForm.attachments.filter((_, i) => i !== aIdx);
                                  setRfqForm({ ...rfqForm, attachments: updated });
                                }}
                                className="text-rose-600 hover:text-rose-800 font-bold ml-1"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Terms & Conditions *</label>
                  <textarea 
                    rows="2"
                    value={rfqForm.terms}
                    onChange={e => setRfqForm({ ...rfqForm, terms: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
              </div>

              {/* SECTION 2: RFQ ITEM FIELDS */}
              <div className="bg-slate-50/70 border border-slate-200 p-4 rounded-2xl space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
                    <Layers className="w-4 h-4 text-purple-600" />
                    <span>2. RFQ Item Fields (Preserves Specification Snapshot)</span>
                  </h4>
                  <button 
                    type="button"
                    onClick={handleAddItemLine}
                    className="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold px-3 py-1 rounded-xl flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {rfqForm.items.map((line, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-3 shadow-2xs relative">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <span className="bg-purple-600 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Item Line #{idx + 1}
                        </span>
                        {rfqForm.items.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => handleRemoveItemLine(idx)}
                            className="text-rose-600 hover:text-rose-800 text-[11px] font-bold"
                          >
                            Remove Line
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="md:col-span-2">
                          <label className="block text-slate-700 font-bold mb-1">Item Selection *</label>
                          <select 
                            value={line.item_id}
                            onChange={e => handleItemChange(idx, e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                          >
                            <option value="">-- Choose Item Master --</option>
                            {itemsMaster.map(i => (
                              <option key={i.id} value={i.id}>{i.item_code} - {i.item_name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Quantity *</label>
                          <input 
                            type="number"
                            min="1"
                            value={line.quantity}
                            onChange={e => {
                              const updated = [...rfqForm.items];
                              updated[idx].quantity = Number(e.target.value);
                              setRfqForm({ ...rfqForm, items: updated });
                            }}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Unit (UOM) *</label>
                          <input 
                            type="text"
                            value={line.unit}
                            onChange={e => {
                              const updated = [...rfqForm.items];
                              updated[idx].unit = e.target.value;
                              setRfqForm({ ...rfqForm, items: updated });
                            }}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-slate-700 font-bold mb-1">
                            Specification Snapshot (Preserved Snapshot) *
                          </label>
                          <textarea 
                            rows="2"
                            value={line.specification}
                            onChange={e => {
                              const updated = [...rfqForm.items];
                              updated[idx].specification = e.target.value;
                              setRfqForm({ ...rfqForm, items: updated });
                            }}
                            placeholder="Exact technical description snapshot..."
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Required Delivery Date *</label>
                          <input 
                            type="date"
                            value={line.required_delivery_date}
                            onChange={e => {
                              const updated = [...rfqForm.items];
                              updated[idx].required_delivery_date = e.target.value;
                              setRfqForm({ ...rfqForm, items: updated });
                            }}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-medium text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Acceptable Brands</label>
                          <input 
                            type="text"
                            value={line.acceptable_brands}
                            onChange={e => {
                              const updated = [...rfqForm.items];
                              updated[idx].acceptable_brands = e.target.value;
                              setRfqForm({ ...rfqForm, items: updated });
                            }}
                            placeholder="e.g. Cisco, D-Link"
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Technical Document</label>
                          <input 
                            type="text"
                            value={line.technical_document || ''}
                            onChange={e => {
                              const updated = [...rfqForm.items];
                              updated[idx].technical_document = e.target.value;
                              setRfqForm({ ...rfqForm, items: updated });
                            }}
                            placeholder="Tech doc file name / URL..."
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                          />
                        </div>

                        <div className="md:col-span-3">
                          <label className="block text-slate-700 font-bold mb-1">Remarks</label>
                          <input 
                            type="text"
                            value={line.remarks || ''}
                            onChange={e => {
                              const updated = [...rfqForm.items];
                              updated[idx].remarks = e.target.value;
                              setRfqForm({ ...rfqForm, items: updated });
                            }}
                            placeholder="Line item remarks, special instructions..."
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 3: SUPPLIER SELECTION (SYSTEM SUGGESTIONS) */}
              <div className="bg-slate-50/70 border border-slate-200 p-4 rounded-2xl space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <div>
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
                      <UserCheck className="w-4 h-4 text-indigo-600" />
                      <span>3. Supplier Selection (System Intelligent Recommendations)</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Suggested based on supplier-item relationship, category, past purchase history, rating, location & approved status.
                    </p>
                  </div>
                  <span className="bg-purple-100 text-purple-800 font-bold font-mono px-2.5 py-1 rounded-lg text-[11px]">
                    {(rfqForm.supplier_ids || []).length} Selected
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {suggestedSuppliers.map(sup => {
                    const isSelected = (rfqForm.supplier_ids || []).includes(sup.id);
                    return (
                      <div 
                        key={sup.id}
                        onClick={() => handleToggleSupplier(sup.id)}
                        className={`p-3.5 rounded-2xl border transition cursor-pointer flex justify-between items-start space-x-3 ${
                          isSelected 
                            ? 'bg-purple-50/90 border-purple-400 shadow-2xs' 
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <input 
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="rounded text-purple-600 focus:ring-purple-500"
                            />
                            <strong className="font-bold text-slate-900 text-xs">{sup.supplier_name}</strong>
                          </div>
                          <p className="text-[11px] text-slate-500 font-mono">{sup.email} | {sup.city || 'Main Branch'}</p>

                          {/* 6 Criteria Match Badges */}
                          <div className="flex flex-wrap gap-1 pt-1">
                            {(sup.match_reasons || ['Approved Vendor', 'High Rating']).map((reason, rIdx) => (
                              <span key={rIdx} className="bg-slate-100 text-slate-800 text-[9px] font-bold px-1.5 py-0.5 rounded-md border border-slate-200">
                                {reason}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="text-right shrink-0 space-y-1">
                          <span className="bg-purple-100 text-purple-800 font-mono font-bold text-[10px] px-2 py-0.5 rounded-full block">
                            {sup.match_score || 80}% Match
                          </span>
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold text-[10px] px-2 py-0.5 rounded-full block">
                            ★ {sup.rating || 4.5}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-3 shrink-0">
              <button 
                onClick={() => setShowRfqModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                Cancel
              </button>

              <button 
                onClick={() => handleSaveRfq('Draft')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs transition"
              >
                Save as Draft
              </button>

              <button 
                onClick={() => handleSaveRfq('Approved')}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
              >
                Save & Approve RFQ
              </button>
            </div>

          </div>
        </div>
      )}

      {/* SEND RFQ MODAL (SENDING METHODS: EMAIL WITH PDF, PORTAL, DOWNLOAD, API) */}
      {showSendModal && selectedRfq && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider font-heading flex items-center space-x-2">
                  <Send className="w-4 h-4 text-purple-600" />
                  <span>Send RFQ {selectedRfq.rfq_number}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Select dispatch method to transmit commercial bid request.</p>
              </div>
              <button onClick={() => setShowSendModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteSend} className="space-y-4 text-xs">
              
              {/* Sending Methods Radio Selection */}
              <div>
                <label className="block text-slate-700 font-bold mb-2">Sending Method *</label>
                <div className="space-y-2">
                  {[
                    { id: 'Email with PDF attachment', icon: Mail, desc: 'Dispatches automated email with attached RFQ PDF' },
                    { id: 'Supplier portal', icon: Globe, desc: 'Publishes RFQ bid directly to Supplier Web Portal' },
                    { id: 'Download and manual sharing', icon: Download, desc: 'Generates PDF document for offline sharing' },
                    { id: 'API integration', icon: Cpu, desc: 'Pushes RFQ payload via B2B API Integration' }
                  ].map(method => {
                    const Icon = method.icon;
                    return (
                      <label 
                        key={method.id}
                        className={`p-3 rounded-xl border flex items-start space-x-3 cursor-pointer transition ${
                          sendForm.send_method === method.id ? 'bg-purple-50 border-purple-400' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <input 
                          type="radio" 
                          name="send_method"
                          checked={sendForm.send_method === method.id}
                          onChange={() => setSendForm({ ...sendForm, send_method: method.id })}
                          className="mt-0.5 text-purple-600 focus:ring-purple-500"
                        />
                        <div>
                          <span className="font-bold text-slate-900 flex items-center space-x-1.5">
                            <Icon className="w-3.5 h-3.5 text-purple-700" />
                            <span>{method.id}</span>
                          </span>
                          <span className="text-[10px] text-slate-500 block mt-0.5">{method.desc}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Recipient Email(s) *</label>
                <input 
                  type="text" 
                  value={sendForm.recipient_emails}
                  onChange={e => setSendForm({ ...sendForm, recipient_emails: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Dispatch Notes</label>
                <textarea 
                  rows="2"
                  value={sendForm.notes}
                  onChange={e => setSendForm({ ...sendForm, notes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setShowSendModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-2xs"
                >
                  Dispatch RFQ
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* SUPPLIER RESPONSE TRACKING & DISPATCH LOG MODAL */}
      {showTrackingModal && selectedRfq && supplierStatusData && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider font-heading flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-purple-600" />
                  <span>Supplier Status & Dispatch Audit Logs</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Tracking for RFQ {selectedRfq.rfq_number}</p>
              </div>
              <button onClick={() => setShowTrackingModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              
              {/* Supplier Response Matrix */}
              <div>
                <h4 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider mb-2">Supplier Response Status</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold">
                      <tr>
                        <th className="py-2 px-3">Supplier Name</th>
                        <th className="py-2 px-3">Email</th>
                        <th className="py-2 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {(supplierStatusData.suppliers || []).map((s, idx) => (
                        <tr key={idx}>
                          <td className="py-2.5 px-3 font-bold text-slate-900">{s.supplier_name}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-600">{s.email || 'N/A'}</td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              s.status === 'Quotation Received' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                                : 'bg-amber-50 text-amber-700 border-amber-300'
                            }`}>
                              {s.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Dispatch Email & API Logs */}
              <div>
                <h4 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider mb-2">Transmission Audit Logs</h4>
                {(supplierStatusData.email_logs || []).length === 0 ? (
                  <p className="text-slate-400 italic text-[11px] py-2">No dispatch transmission logs recorded yet.</p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {(supplierStatusData.email_logs || []).map((log, idx) => (
                      <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-mono text-[11px] space-y-1">
                        <div className="flex justify-between font-bold text-slate-800">
                          <span>{log.send_method}</span>
                          <span className="text-emerald-700">{log.status}</span>
                        </div>
                        <p className="text-slate-600">Recipients: {log.recipients}</p>
                        <span className="text-[10px] text-slate-400 block">{new Date(log.sent_at).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            <div className="flex justify-end pt-2">
              <button 
                onClick={() => setShowTrackingModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* RFQ DETAIL VIEW MODAL */}
      {showDetailModal && selectedRfq && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider font-heading flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-purple-600" />
                  <span>Request for Quotation Document Details</span>
                </h3>
                <p className="text-xs text-purple-700 font-mono font-bold mt-0.5">{selectedRfq.rfq_number}</p>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              
              {/* Header Fields Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 font-mono">
                <div>
                  <span className="text-slate-400 text-[10px] font-bold block uppercase font-sans">RFQ Date</span>
                  <span className="font-bold text-slate-900">{selectedRfq.rfq_date}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] font-bold block uppercase font-sans">Closing Date</span>
                  <span className="font-bold text-rose-700">{selectedRfq.closing_date}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] font-bold block uppercase font-sans">Buyer</span>
                  <span className="font-bold text-slate-900">{selectedRfq.buyer}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] font-bold block uppercase font-sans">Currency</span>
                  <span className="font-bold text-emerald-700">{selectedRfq.currency}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] font-bold block uppercase">Delivery Location</span>
                <p className="font-medium text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-200 mt-1">{selectedRfq.delivery_location}</p>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] font-bold block uppercase">Terms & Conditions</span>
                <p className="font-medium text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-200 mt-1">{selectedRfq.terms}</p>
              </div>

              {/* Attachments Section */}
              {(selectedRfq.attachments || []).length > 0 && (
                <div>
                  <span className="text-slate-400 text-[10px] font-bold block uppercase mb-1">Header Attachments</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedRfq.attachments.map((att, aIdx) => (
                      <span key={aIdx} className="bg-purple-50 text-purple-700 border border-purple-200 font-mono text-[11px] px-2.5 py-1 rounded-lg flex items-center space-x-1.5 font-bold">
                        <Paperclip className="w-3.5 h-3.5 text-purple-600" />
                        <span>{att.name}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Items Table */}
              <div>
                <h4 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider mb-2">Item Specifications (Preserved Snapshot)</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold">
                      <tr>
                        <th className="py-2 px-3">Item Code & Name</th>
                        <th className="py-2 px-3">Specification Snapshot</th>
                        <th className="py-2 px-3">Qty & Unit</th>
                        <th className="py-2 px-3">Required Date</th>
                        <th className="py-2 px-3">Technical Doc</th>
                        <th className="py-2 px-3">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {(selectedRfq.items || []).map((line, idx) => (
                        <tr key={idx}>
                          <td className="py-2.5 px-3 font-mono font-bold text-purple-700">
                            {line.item_code} - {line.item_name}
                          </td>
                          <td className="py-2.5 px-3 text-slate-700 max-w-xs">{line.specification}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">{line.quantity} {line.unit}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-700">{line.required_delivery_date}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-600">{line.technical_document || 'N/A'}</td>
                          <td className="py-2.5 px-3 text-slate-600 italic">{line.remarks || 'None'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              {(selectedRfq.status === 'Closed' || selectedRfq.status === 'Cancelled' || selectedRfq.status === 'Draft') && (
                <button 
                  onClick={() => {
                    setShowDetailModal(false);
                    handleDeleteRfq(selectedRfq.id, selectedRfq.rfq_number);
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-2xs flex items-center space-x-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete RFQ</span>
                </button>
              )}
              <button 
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
