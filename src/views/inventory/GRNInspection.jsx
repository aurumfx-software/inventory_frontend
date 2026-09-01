import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, 
  Plus, 
  CheckCircle2, 
  X, 
  AlertTriangle, 
  Printer, 
  Search, 
  Filter, 
  Boxes, 
  Layers, 
  ShieldAlert, 
  FileText, 
  Check, 
  RotateCcw, 
  Clock, 
  Settings, 
  ChevronDown, 
  ChevronUp, 
  Building2, 
  Calendar, 
  Package, 
  Upload, 
  Info,
  ExternalLink,
  Ban,
  Pencil,
  Trash2
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

export default function GRNInspection({ initialSubTab = 'grn' }) {
  const [subTab, setSubTab] = useState(initialSubTab);
  const [grns, setGrns] = useState([]);
  const [pos, setPos] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [rejectedMaterials, setRejectedMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [expandedGrnId, setExpandedGrnId] = useState(null);

  // Modals state
  const [showGrnModal, setShowGrnModal] = useState(false);
  const [showInspectionModal, setShowInspectionModal] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [editingGrn, setEditingGrn] = useState(null);
  const [modalError, setModalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Settings State
  const [rejectCountsAsReceived, setRejectCountsAsReceived] = useState(false);

  // Cancel Reason State
  const [cancelReason, setCancelReason] = useState('');

  // Create GRN Form State
  const [grnForm, setGrnForm] = useState({
    grn_number: `GRN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    po_id: '',
    receipt_date: new Date().toISOString().split('T')[0],
    supplier_id: '',
    supplier_name: '',
    supplier_invoice_number: `INV-${Math.floor(10000 + Math.random() * 90000)}`,
    supplier_invoice_date: new Date().toISOString().split('T')[0],
    delivery_challan_number: `DC-${Math.floor(10000 + Math.random() * 90000)}`,
    vehicle_number: 'KA-01-EA-5566',
    warehouse_id: 'wh-01',
    received_by: 'usr-03',
    remarks: 'Physical material verified at receiving bay',
    attachments: '',
    status: 'Pending inspection',
    is_excess_authorized: false,
    is_expired_authorized: false
  });

  const [grnFormItems, setGrnFormItems] = useState([]);
  const [loadingPoItems, setLoadingPoItems] = useState(false);

  // Quality Inspection Form State
  const [inspectForm, setInspectForm] = useState({
    pass_fail_result: 'PASSED',
    actual_results: 'All physical dimensions, material integrity, and specs verified.',
    remarks: 'Quality check completed and passed.',
    auto_post: true,
    item_results: []
  });

  useEffect(() => {
    setSubTab(initialSubTab);
  }, [initialSubTab]);

  useEffect(() => {
    if (subTab === 'rejected') {
      fetchRejectedMaterials();
    }
  }, [subTab]);

  useEffect(() => {
    fetchGrns();
    fetchPos();
    fetchWarehouses();
    fetchRejectedMaterials();
  }, []);

  const fetchGrns = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/goods-receipts');
      const data = await res.json();
      if (data.success) setGrns(data.data || []);
    } catch (err) {
      console.error('Failed to fetch GRNs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPos = async () => {
    try {
      const res = await fetch('/api/purchase-orders');
      const data = await res.json();
      if (data.success) {
        // Filter approved or receiving POs
        const validPos = (data.data || []).filter(p => p.status !== 'Closed' && p.status !== 'Cancelled');
        setPos(validPos);
      }
    } catch (err) {
      console.error('Failed to fetch POs:', err);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const res = await fetch('/api/warehouses');
      const data = await res.json();
      if (data.success) setWarehouses(data.data || []);
    } catch (err) {
      console.error('Failed to fetch warehouses:', err);
    }
  };

  const fetchRejectedMaterials = async () => {
    try {
      const res = await fetch('/api/rejected-materials');
      const data = await res.json();
      if (data.success) setRejectedMaterials(data.data || []);
    } catch (err) {
      console.error('Failed to fetch rejected materials:', err);
    }
  };

  // Handle PO selection change in GRN modal
  const handlePoChange = async (poId) => {
    if (!poId) {
      setGrnForm(prev => ({ ...prev, po_id: '', supplier_id: '', supplier_name: '' }));
      setGrnFormItems([]);
      return;
    }

    setLoadingPoItems(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/purchase-orders/${poId}/pending-items`);
      const data = await res.json();
      if (data.success && data.data) {
        const poData = data.data.po;
        const pendingItems = data.data.items || [];

        setGrnForm(prev => ({
          ...prev,
          po_id: poData.id,
          supplier_id: poData.supplier_id,
          supplier_name: poData.supplier_name,
          warehouse_id: poData.warehouse_id || prev.warehouse_id
        }));

        // Build item rows with initial default quantities & tracking flags
        const formItems = pendingItems.map(pi => {
          const defaultAccepted = Math.max(0, Number(pi.pending_quantity || 0));
          const randSuffix = Math.floor(1000 + Math.random() * 9000);
          const defaultSerials = pi.is_serial_tracked 
            ? Array.from({ length: defaultAccepted }, (_, idx) => `SN-${pi.item_code}-${Date.now().toString().substr(-4)}${randSuffix}-${idx + 1}`) 
            : [];

          return {
            po_item_id: pi.po_item_id,
            item_id: pi.item_id,
            item_code: pi.item_code,
            item_name: pi.item_name,
            uom: pi.uom,
            ordered_qty: Number(pi.ordered_quantity || 0),
            previously_received_qty: Number(pi.previously_received_quantity || 0),
            pending_quantity: Number(pi.pending_quantity || 0),
            accepted_qty: defaultAccepted,
            rejected_qty: 0,
            unit_rate: Number(pi.unit_rate || 0),
            batch_number: pi.is_batch_tracked ? `BAT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}` : '',
            mfg_date: new Date().toISOString().split('T')[0],
            expiry_date: pi.is_expiry_tracked ? new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0] : '',
            serial_numbers_text: defaultSerials.join(', '),
            storage_location_id: 'loc-01',
            quality_remarks: 'Visual check clear',
            rejection_reason: '',
            disposition: 'Return to Supplier',
            is_batch_tracked: pi.is_batch_tracked,
            is_serial_tracked: pi.is_serial_tracked,
            is_expiry_tracked: pi.is_expiry_tracked
          };
        });

        setGrnFormItems(formItems);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load pending PO items.');
    } finally {
      setLoadingPoItems(false);
    }
  };

  // Update item field in Create GRN Modal
  const updateGrnItemField = (index, field, value) => {
    setGrnFormItems(prev => {
      const updated = [...prev];
      const line = { ...updated[index], [field]: value };

      if (field === 'accepted_qty' || field === 'rejected_qty') {
        const acc = Number(line.accepted_qty || 0);

        // Auto regenerate serial placeholders if count changed
        if (line.is_serial_tracked && field === 'accepted_qty') {
          const serials = Array.from({ length: acc }, (_, idx) => `SN-${line.item_code}-${Date.now().toString().substr(-4)}-${idx + 1}`);
          line.serial_numbers_text = serials.join(', ');
        }
      }

      updated[index] = line;
      return updated;
    });
  };

  // Handle Create GRN Submission
  const handleCreateGrnSubmit = async (e, targetStatus) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setModalError('');
    setSuccessMsg('');

    if (!grnForm.po_id) {
      setModalError('Please select a Purchase Order.');
      return;
    }

    if (grnFormItems.length === 0) {
      setModalError('No line items found for this GRN.');
      return;
    }

    // Format serial numbers array from text
    const formattedItems = grnFormItems.map(item => {
      const serials = item.is_serial_tracked && item.serial_numbers_text
        ? item.serial_numbers_text.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      return {
        po_item_id: item.po_item_id,
        item_id: item.item_id || item.po_item_id,
        item_code: item.item_code,
        item_name: item.item_name,
        ordered_qty: Number(item.ordered_qty),
        previously_received_qty: Number(item.previously_received_qty),
        accepted_qty: Number(item.accepted_qty || 0),
        rejected_qty: Number(item.rejected_qty || 0),
        received_qty: Number(item.accepted_qty || 0) + Number(item.rejected_qty || 0),
        unit_rate: Number(item.unit_rate),
        batch_number: item.batch_number,
        mfg_date: item.mfg_date || null,
        expiry_date: item.expiry_date || null,
        serial_numbers: serials,
        storage_location_id: item.storage_location_id,
        quality_remarks: item.quality_remarks,
        rejection_reason: item.rejection_reason,
        disposition: item.disposition
      };
    });

    const url = editingGrn ? `/api/goods-receipts/${editingGrn.id}` : '/api/goods-receipts';
    const method = editingGrn ? 'PUT' : 'POST';

    setIsSubmitting(true);
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...grnForm,
          status: targetStatus || grnForm.status,
          reject_counts_as_received: rejectCountsAsReceived,
          items: formattedItems
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setModalError(data.message || 'Failed to record GRN.');
        setIsSubmitting(false);
        return;
      }

      setSuccessMsg(data.message || (editingGrn ? 'GRN updated successfully!' : 'GRN created successfully!'));
      setShowGrnModal(false);
      setEditingGrn(null);
      setModalError('');
      fetchGrns();
      fetchPos();
      fetchRejectedMaterials();
    } catch (err) {
      console.error(err);
      setModalError('An unexpected error occurred while saving GRN.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit GRN Modal
  const handleOpenEditModal = (grn) => {
    setEditingGrn(grn);
    setGrnForm({
      grn_number: grn.grn_number,
      po_id: grn.po_id || '',
      receipt_date: grn.receipt_date || new Date().toISOString().split('T')[0],
      supplier_id: grn.supplier_id || '',
      supplier_name: grn.supplier_name || '',
      supplier_invoice_number: grn.supplier_invoice_number || '',
      supplier_invoice_date: grn.supplier_invoice_date || '',
      delivery_challan_number: grn.delivery_challan_number || '',
      vehicle_number: grn.vehicle_number || '',
      warehouse_id: grn.warehouse_id || 'wh-01',
      received_by: grn.received_by || 'usr-03',
      remarks: grn.remarks || '',
      attachments: grn.attachments || '',
      status: grn.status || 'Pending inspection',
      inspection_status: grn.inspection_status || 'Pending inspection'
    });

    const formItems = (grn.items || []).map(line => ({
      po_item_id: line.po_item_id,
      item_id: line.item_id,
      item_code: line.item_code,
      item_name: line.item_name,
      uom: line.uom || 'Pcs',
      ordered_qty: Number(line.ordered_qty || 0),
      previously_received_qty: Number(line.previously_received_qty || 0),
      pending_quantity: Math.max(0, Number(line.ordered_qty || 0) - Number(line.previously_received_qty || 0)),
      accepted_qty: Number(line.accepted_qty || 0),
      rejected_qty: Number(line.rejected_qty || 0),
      unit_rate: Number(line.unit_rate || 0),
      batch_number: line.batch_number || '',
      mfg_date: line.mfg_date || '',
      expiry_date: line.expiry_date || '',
      serial_numbers_text: Array.isArray(line.serial_numbers) ? line.serial_numbers.join(', ') : (line.serial_numbers || ''),
      storage_location_id: line.storage_location_id || 'loc-01',
      quality_remarks: line.quality_remarks || '',
      rejection_reason: line.rejection_reason || '',
      disposition: line.disposition || 'Return to Supplier',
      is_batch_tracked: !!line.batch_number,
      is_serial_tracked: Array.isArray(line.serial_numbers) && line.serial_numbers.length > 0,
      is_expiry_tracked: !!line.expiry_date
    }));

    setGrnFormItems(formItems);
    setErrorMsg('');
    setModalError('');
    setShowGrnModal(true);
  };

  // Handle Delete GRN Submission
  const handleDeleteGrnSubmit = async (grnId) => {
    setErrorMsg('');
    setModalError('');
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/goods-receipts/${grnId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setModalError(data.message || 'Failed to delete GRN.');
        setIsSubmitting(false);
        return;
      }

      setSuccessMsg(data.message || 'GRN deleted successfully.');
      setShowDeleteModal(null);
      fetchGrns();
      fetchPos();
      fetchRejectedMaterials();
    } catch (err) {
      console.error(err);
      setModalError('Failed to delete GRN.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add Inspection Parameter Row
  const handleAddInspectionRow = () => {
    setInspectForm(prev => ({
      ...prev,
      inspection_rows: [
        ...(prev.inspection_rows || []),
        {
          parameter: 'Packaging',
          required_spec: 'Sealed & undamaged',
          actual_result: 'No visible damage',
          pass_fail: 'Pass'
        }
      ]
    }));
  };

  // Remove Inspection Parameter Row
  const handleRemoveInspectionRow = (index) => {
    setInspectForm(prev => ({
      ...prev,
      inspection_rows: prev.inspection_rows.filter((_, idx) => idx !== index)
    }));
  };

  // Update Inspection Parameter Row
  const handleUpdateInspectionRow = (index, field, value) => {
    setInspectForm(prev => {
      const rows = [...(prev.inspection_rows || [])];
      rows[index] = { ...rows[index], [field]: value };
      return { ...prev, inspection_rows: rows };
    });
  };

  // Open Inspection Modal & initialize item inspect state
  const handleOpenInspectionModal = (grn) => {
    setModalError('');
    setErrorMsg('');
    setShowInspectionModal(grn);

    const firstItem = (grn.items || [])[0] || {};
    const receivedQty = Number(firstItem.received_qty || (Number(firstItem.accepted_qty || 0) + Number(firstItem.rejected_qty || 0)) || Number(firstItem.ordered_qty || 0) || 1);
    let acceptedQty = Number(firstItem.accepted_qty !== undefined ? firstItem.accepted_qty : receivedQty);
    let rejectedQty = Number(firstItem.rejected_qty || 0);

    if (acceptedQty + rejectedQty > receivedQty || acceptedQty > receivedQty) {
      acceptedQty = receivedQty;
      rejectedQty = 0;
    }

    const lineResults = (grn.items || []).map(line => ({
      id: line.id,
      item_id: line.item_id,
      item_code: line.item_code,
      item_name: line.item_name,
      received_qty: Number(line.received_qty || 1),
      accepted_qty: Number(line.accepted_qty !== undefined ? line.accepted_qty : line.received_qty),
      rejected_qty: Number(line.rejected_qty || 0),
      quality_remarks: line.quality_remarks || 'Inspection passed standard tolerances',
      rejection_reason: line.rejection_reason || '',
      disposition: line.disposition || 'Return to Supplier'
    }));

    setInspectForm({
      inspection_reference: `QI-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
      grn_reference: grn.grn_number,
      selected_item_id: firstItem.id || firstItem.item_id || '',
      received_qty: receivedQty,
      inspection_rows: [
        {
          parameter: 'Dimensions',
          required_spec: '14 inch',
          actual_result: '14 inch',
          pass_fail: 'Pass'
        },
        {
          parameter: 'Packaging',
          required_spec: 'Sealed and undamaged',
          actual_result: 'No visible damage',
          pass_fail: 'Pass'
        }
      ],
      inspected_by: 'Sarah Jenkins',
      inspection_date: new Date().toISOString().split('T')[0],
      accepted_qty: acceptedQty,
      rejected_qty: rejectedQty,
      inspection_outcome: 'Accepted',
      remarks: 'Material condition verified. All inspection checks passed.',
      attachment: '',
      auto_post: true,
      item_results: lineResults
    });
  };

  const handleInspectGrnSelect = (grnRef) => {
    const targetGrn = grns.find(g => g.grn_number === grnRef || g.id === grnRef);
    if (targetGrn) {
      handleOpenInspectionModal(targetGrn);
    } else {
      setInspectForm(prev => ({ ...prev, grn_reference: grnRef, selected_item_id: '' }));
    }
  };

  // Handle Quality Inspection Item Change
  const handleInspectItemChange = (itemId) => {
    const selected = (inspectForm.item_results || []).find(i => i.id === itemId || i.item_id === itemId);
    if (selected) {
      const maxRecv = Number(selected.received_qty || 1);
      let acc = Number(selected.accepted_qty !== undefined ? selected.accepted_qty : maxRecv);
      let rej = Number(selected.rejected_qty || 0);

      if (acc + rej > maxRecv || acc > maxRecv) {
        acc = maxRecv;
        rej = 0;
      }

      setInspectForm(prev => ({
        ...prev,
        selected_item_id: itemId,
        received_qty: maxRecv,
        accepted_qty: acc,
        rejected_qty: rej
      }));
    }
  };

  // Handle Quality Inspection Submit
  const handleRecordInspectionSubmit = async (e, actionOutcome) => {
    if (e) e.preventDefault();
    if (!showInspectionModal) return;
    setErrorMsg('');
    setModalError('');

    const outcomeToUse = actionOutcome || inspectForm.inspection_outcome || 'Accepted';

    // Quantity Validation (Section 14): Accepted Qty + Rejected Qty <= Received Qty
    const selectedItem = (showInspectionModal.items || []).find(i => i.id === inspectForm.selected_item_id || i.item_id === inspectForm.selected_item_id) || (showInspectionModal.items || [])[0] || {};
    const maxReceived = Number(selectedItem.received_qty || inspectForm.received_qty || (Number(inspectForm.accepted_qty) + Number(inspectForm.rejected_qty)));
    const totalInputQty = Number(inspectForm.accepted_qty || 0) + Number(inspectForm.rejected_qty || 0);

    if (totalInputQty > maxReceived) {
      setModalError(`Quantity Validation Error: Accepted Quantity (${inspectForm.accepted_qty}) + Rejected Quantity (${inspectForm.rejected_qty}) = ${totalInputQty}, which exceeds GRN Received Quantity (${maxReceived}).`);
      return;
    }

    let passFailBackend = 'PASSED';
    if (outcomeToUse === 'Rejected' || outcomeToUse === 'REJECTED') passFailBackend = 'REJECTED';
    else if (outcomeToUse === 'Accepted with deviation' || outcomeToUse === 'PARTIALLY_PASSED') passFailBackend = 'PARTIALLY_PASSED';
    else if (outcomeToUse === 'Sent for rework' || outcomeToUse === 'REWORK') passFailBackend = 'REWORK';
    else if (outcomeToUse === 'Pending laboratory result' || outcomeToUse === 'PENDING_LAB') passFailBackend = 'PENDING_LAB';

    const updatedItemResults = (inspectForm.item_results || []).map(line => {
      if (line.id === inspectForm.selected_item_id || line.item_id === inspectForm.selected_item_id) {
        return {
          ...line,
          accepted_qty: Number(inspectForm.accepted_qty || 0),
          rejected_qty: Number(inspectForm.rejected_qty || 0),
          received_qty: Number(inspectForm.accepted_qty || 0) + Number(inspectForm.rejected_qty || 0)
        };
      }
      return line;
    });

    const primaryRow = (inspectForm.inspection_rows || [])[0] || {};

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/goods-receipts/${showInspectionModal.id}/inspect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grn_reference: inspectForm.grn_reference || showInspectionModal.grn_number,
          item_id: inspectForm.selected_item_id,
          inspection_rows: inspectForm.inspection_rows,
          inspection_parameter: primaryRow.parameter || 'Dimensions',
          required_specification: primaryRow.required_spec || '',
          actual_results: primaryRow.actual_result || '',
          pass_fail_result: passFailBackend,
          inspection_outcome: outcomeToUse,
          inspected_by: inspectForm.inspected_by,
          inspection_date: inspectForm.inspection_date,
          remarks: inspectForm.remarks,
          attachment: inspectForm.attachment,
          accepted_qty: inspectForm.accepted_qty,
          rejected_qty: inspectForm.rejected_qty,
          auto_post: inspectForm.auto_post,
          items: updatedItemResults
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setModalError(data.message || 'Failed to submit inspection.');
        setIsSubmitting(false);
        return;
      }

      setSuccessMsg(data.message || 'Quality inspection recorded successfully!');
      setShowInspectionModal(null);
      setModalError('');
      fetchGrns();
      fetchRejectedMaterials();
    } catch (err) {
      console.error(err);
      setModalError('Failed to process quality inspection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Explicitly Post a GRN to Inventory Ledger
  const handlePostGrn = async (grnId) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch(`/api/goods-receipts/${grnId}/post`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Failed to post GRN.');
        return;
      }
      setSuccessMsg(data.message || 'GRN posted successfully!');
      fetchGrns();
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to post GRN.');
    }
  };

  // Cancel GRN Submit
  const handleCancelGrnSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!showCancelModal) return;
    setErrorMsg('');
    setModalError('');

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/goods-receipts/${showCancelModal.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setModalError(data.message || 'Failed to cancel GRN.');
        setIsSubmitting(false);
        return;
      }

      setSuccessMsg(data.message || 'GRN cancelled successfully.');
      setShowCancelModal(null);
      setCancelReason('');
      setModalError('');
      fetchGrns();
      fetchPos();
    } catch (err) {
      console.error(err);
      setModalError('Failed to cancel GRN.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Print GRN Handler
  const handlePrintGrn = (grn) => {
    window.print();
  };

  // Filtered GRNs list
  const filteredGrns = grns.filter(g => {
    if (statusFilter !== 'All' && g.status !== statusFilter && g.inspection_status !== statusFilter) return false;
    if (supplierFilter && g.supplier_id !== supplierFilter) return false;
    if (warehouseFilter && g.warehouse_id !== warehouseFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        g.grn_number?.toLowerCase().includes(q) ||
        g.po_number?.toLowerCase().includes(q) ||
        g.supplier_name?.toLowerCase().includes(q) ||
        g.supplier_invoice_number?.toLowerCase().includes(q) ||
        g.delivery_challan_number?.toLowerCase().includes(q) ||
        g.vehicle_number?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pendingInspectionCount = grns.filter(g => g.inspection_status === 'Pending inspection' || g.status === 'Pending inspection').length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 border border-slate-200/80 rounded-2xl shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-purple-600/10 border border-purple-200 flex items-center justify-center text-purple-700 font-bold shrink-0 shadow-2xs">
            <ClipboardCheck className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-heading tracking-tight flex items-center space-x-2">
              <span>Goods Receipt Note (GRN) & Quality Inspection</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Physical material receipt, batch & serial validation, quality parameter inspection & atomic stock posting.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              setEditingGrn(null);
              setGrnForm(prev => ({
                ...prev,
                grn_number: `GRN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
                po_id: '',
                supplier_id: '',
                supplier_name: '',
                supplier_invoice_number: `INV-${Math.floor(10000 + Math.random() * 90000)}`,
                delivery_challan_number: `DC-${Math.floor(10000 + Math.random() * 9000)}`
              }));
              setGrnFormItems([]);
              setErrorMsg('');
              setModalError('');
              setShowGrnModal(true);
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center space-x-2 shadow-xs transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Goods Receipt (GRN)</span>
          </button>
        </div>
      </div>

      {/* Global Toast Messages */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs px-4 py-3 rounded-xl flex items-center justify-between shadow-2xs">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="text-rose-500 hover:text-rose-700"><X className="w-4 h-4" /></button>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-xl flex items-center justify-between shadow-2xs">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-500 hover:text-emerald-700"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-3 pt-2 rounded-t-2xl shadow-2xs">
        <button
          onClick={() => setSubTab('grn')}
          className={`px-4 py-3 text-xs font-bold flex items-center space-x-2 border-b-2 transition cursor-pointer ${
            subTab === 'grn' ? 'border-purple-600 text-purple-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ClipboardCheck className="w-4 h-4" />
          <span>Goods Receipt Notes (GRN)</span>
          <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-[10px] font-bold">{grns.length}</span>
        </button>

        <button
          onClick={() => setSubTab('inspection')}
          className={`px-4 py-3 text-xs font-bold flex items-center space-x-2 border-b-2 transition cursor-pointer ${
            subTab === 'inspection' ? 'border-purple-600 text-purple-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Quality Inspection</span>
          {pendingInspectionCount > 0 && (
            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[10px] font-bold animate-pulse">
              {pendingInspectionCount} Pending
            </span>
          )}
        </button>

        <button
          onClick={() => setSubTab('rejected')}
          className={`px-4 py-3 text-xs font-bold flex items-center space-x-2 border-b-2 transition cursor-pointer ${
            subTab === 'rejected' ? 'border-purple-600 text-purple-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Ban className="w-4 h-4" />
          <span>Rejected Materials Log</span>
          <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full text-[10px] font-bold">{rejectedMaterials.length}</span>
        </button>

        <button
          onClick={() => setSubTab('settings')}
          className={`px-4 py-3 text-xs font-bold flex items-center space-x-2 border-b-2 transition cursor-pointer ${
            subTab === 'settings' ? 'border-purple-600 text-purple-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>GRN Settings & Rules</span>
        </button>
      </div>

      {/* SUB-TAB 1: GOODS RECEIPT NOTES (GRN) LIST */}
      {subTab === 'grn' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 border border-slate-200/80 rounded-2xl shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-3 flex-1 min-w-[240px]">
              <div className="relative w-full">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search GRN #, PO #, Invoice #, Vendor..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-800 focus:outline-none focus:border-purple-500 font-sans"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3 flex-wrap">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-bold"
              >
                <option value="All">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Pending inspection">Pending inspection</option>
                <option value="Accepted">Accepted</option>
                <option value="Partially accepted">Partially accepted</option>
                <option value="Rejected">Rejected</option>
                <option value="Posted">Posted</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              <select
                value={warehouseFilter}
                onChange={e => setWarehouseFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-bold"
              >
                <option value="">All Warehouses</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.wh_name || w.name}</option>)}
              </select>
            </div>
          </div>

          {/* GRNs List */}
          {loading ? (
            <div className="text-center py-12 text-slate-400 font-medium text-xs">Loading Goods Receipt Notes...</div>
          ) : filteredGrns.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 space-y-3">
              <ClipboardCheck className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-bold text-sm text-slate-700">No Goods Receipt Notes Found</p>
              <p className="text-xs text-slate-400">Click "+ Create Goods Receipt (GRN)" to receive material physically from a supplier.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredGrns.map(grn => {
                return (
                  <div key={grn.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4 hover:border-purple-200 transition">
                    {/* Card Header */}
                    <div className="flex flex-wrap justify-between items-start border-b border-slate-100 pb-3 gap-2">
                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-sm font-bold text-purple-700">{grn.grn_number}</span>
                        <StatusBadge status={grn.status} />
                        <span className="text-xs text-slate-500 font-mono">Date: {grn.receipt_date}</span>
                        <span className="text-xs text-slate-800 font-bold">&bull; Supplier: {grn.supplier_name}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                          grn.inspection_status === 'Inspected & Passed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          grn.inspection_status === 'Partially Passed' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          grn.inspection_status === 'Failed Inspection' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {grn.inspection_status || 'Pending inspection'}
                        </span>

                        {grn.status !== 'Posted' && grn.status !== 'Cancelled' && (
                          <button
                            onClick={() => handlePostGrn(grn.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1 rounded-xl flex items-center space-x-1 shadow-2xs transition cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Post GRN</span>
                          </button>
                        )}

                        {grn.status !== 'Cancelled' && (
                          <button
                            onClick={() => handleOpenInspectionModal(grn)}
                            className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3 py-1 rounded-xl flex items-center space-x-1 shadow-2xs transition cursor-pointer"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>Quality Check</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenEditModal(grn)}
                          className="bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold px-2.5 py-1 rounded-xl transition cursor-pointer flex items-center space-x-1 border border-purple-200"
                          title="Edit GRN"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handlePrintGrn(grn)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold p-1.5 rounded-xl transition cursor-pointer"
                          title="Print GRN"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {grn.status !== 'Cancelled' && (
                          <button
                            onClick={() => {
                              setShowCancelModal(grn);
                              setModalError('');
                            }}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold p-1.5 rounded-xl transition cursor-pointer"
                            title="Cancel GRN"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setShowDeleteModal(grn);
                            setModalError('');
                          }}
                          className="bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-bold p-1.5 rounded-xl transition cursor-pointer"
                          title="Delete GRN"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Metadata Header Summary Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs bg-slate-50/80 p-3.5 rounded-xl border border-slate-100 font-mono">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold font-sans">PO Number</span>
                        <span className="text-purple-700 font-bold">{grn.po_number}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold font-sans">Invoice No & Date</span>
                        <span className="text-slate-800 font-semibold">{grn.supplier_invoice_number} ({grn.supplier_invoice_date || grn.receipt_date})</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold font-sans">Challan No</span>
                        <span className="text-slate-800 font-semibold">{grn.delivery_challan_number}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold font-sans">Vehicle No</span>
                        <span className="text-slate-800 font-semibold">{grn.vehicle_number}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold font-sans">Warehouse</span>
                        <span className="text-slate-800 font-semibold">{grn.warehouse_name}</span>
                      </div>
                    </div>

                    {/* GRN Items Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-100 font-bold">
                            <th className="py-2 px-3 font-sans">Item Code & Name</th>
                            <th className="py-2 px-3 font-sans">Ordered</th>
                            <th className="py-2 px-3 font-sans">Prev Recv</th>
                            <th className="py-2 px-3 font-sans">Current Recv</th>
                            <th className="py-2 px-3 font-sans">Accepted</th>
                            <th className="py-2 px-3 font-sans">Rejected</th>
                            <th className="py-2 px-3 font-sans">Variance</th>
                            <th className="py-2 px-3 font-sans">Batch / Serial Numbers</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-mono">
                          {(grn.items || []).map((line, idx) => {
                            const recvQty = Number(line.received_qty || (Number(line.accepted_qty || 0) + Number(line.rejected_qty || 0)));
                            const shortQty = Number(line.short_qty || 0);
                            const excessQty = Number(line.excess_qty || 0);

                            return (
                              <tr key={idx} className="hover:bg-slate-50/50">
                                <td className="py-2.5 px-3 font-sans">
                                  <span className="text-purple-700 font-mono font-bold block">{line.item_code}</span>
                                  <span className="text-slate-800 font-semibold">{line.item_name}</span>
                                </td>
                                <td className="py-2.5 px-3 text-slate-500">{line.ordered_qty}</td>
                                <td className="py-2.5 px-3 text-slate-500">{line.previously_received_qty || 0}</td>
                                <td className="py-2.5 px-3 font-bold text-slate-900">{recvQty}</td>
                                <td className="py-2.5 px-3 font-bold text-emerald-700">{line.accepted_qty}</td>
                                <td className="py-2.5 px-3 font-bold text-rose-600">{line.rejected_qty || 0}</td>
                                <td className="py-2.5 px-3 font-sans">
                                  {excessQty > 0 ? (
                                    <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                      + {excessQty} Excess
                                    </span>
                                  ) : shortQty > 0 ? (
                                    <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                      - {shortQty} Short
                                    </span>
                                  ) : (
                                    <span className="text-emerald-600 text-[10px] font-bold">Matched</span>
                                  )}
                                </td>
                                <td className="py-2.5 px-3 text-slate-700 text-[11px] font-sans">
                                  {line.batch_number && (
                                    <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md font-mono mr-2 text-purple-700 font-bold">
                                      Batch: {line.batch_number} {line.expiry_date ? `(Exp: ${line.expiry_date})` : ''}
                                    </span>
                                  )}
                                  {line.serial_numbers && Array.isArray(line.serial_numbers) && line.serial_numbers.length > 0 && (
                                    <span className="text-purple-700 font-mono font-semibold">
                                      Serials: {line.serial_numbers.join(', ')}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: QUALITY INSPECTION WORKFLOW */}
      {subTab === 'inspection' && (
        <div className="space-y-4">
          <div className="bg-white p-5 border border-slate-200/80 rounded-2xl shadow-2xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 font-heading">Quality Inspection Queue</h3>
                <p className="text-xs text-slate-500">Perform inbound quality checks on received materials before accepting into active stock.</p>
              </div>
              <button
                onClick={() => {
                  const defaultGrn = grns[0] || { grn_number: 'GRN-2026-5710', items: [] };
                  handleOpenInspectionModal(defaultGrn);
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center space-x-2 shadow-2xs transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>New Quality Inspection</span>
              </button>
            </div>

            <div className="space-y-3">
              {grns.filter(g => g.inspection_status === 'Pending inspection' || g.status === 'Pending inspection').map(grn => (
                <div key={grn.id} className="bg-amber-50/50 border border-amber-200 rounded-xl p-4 flex flex-wrap justify-between items-center gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-purple-700">{grn.grn_number}</span>
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Pending Inspection</span>
                      <span className="text-xs text-slate-500">PO: {grn.po_number}</span>
                    </div>
                    <p className="text-xs text-slate-700 mt-1 font-medium">
                      Supplier: <strong>{grn.supplier_name}</strong> &bull; Received Items: {(grn.items || []).length} lines &bull; Date: {grn.receipt_date}
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenInspectionModal(grn)}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center space-x-2 shadow-2xs transition cursor-pointer"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>Conduct Quality Inspection</span>
                  </button>
                </div>
              ))}

              {grns.filter(g => g.inspection_status === 'Pending inspection' || g.status === 'Pending inspection').length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs font-medium">
                  🎉 No pending quality inspections! All received GRNs have been inspected.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: REJECTED MATERIALS LOG DIRECTORY */}
      {subTab === 'rejected' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 font-heading">Rejected Materials Directory</h3>
              <p className="text-xs text-slate-500">Tracking of items failed during quality inspection awaiting return to supplier or scrap disposition.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-100 font-bold">
                  <th className="py-2.5 px-3 font-sans">GRN Number</th>
                  <th className="py-2.5 px-3 font-sans">Item Code & Name</th>
                  <th className="py-2.5 px-3 font-sans">Supplier</th>
                  <th className="py-2.5 px-3 font-sans">Rejected Qty</th>
                  <th className="py-2.5 px-3 font-sans">Rejection Reason</th>
                  <th className="py-2.5 px-3 font-sans">Disposition</th>
                  <th className="py-2.5 px-3 font-sans">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {rejectedMaterials.map((rm, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 text-purple-700 font-bold">{rm.grn_number}</td>
                    <td className="py-3 px-3 font-sans">
                      <span className="font-mono font-bold text-slate-800 block">{rm.item_code}</span>
                      <span className="text-slate-600">{rm.item_name}</span>
                    </td>
                    <td className="py-3 px-3 font-sans text-slate-800 font-medium">{rm.supplier_name}</td>
                    <td className="py-3 px-3 font-bold text-rose-600">{rm.quantity} {rm.uom}</td>
                    <td className="py-3 px-3 text-slate-700 font-sans">{rm.rejection_reason}</td>
                    <td className="py-3 px-3 font-sans">
                      <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md font-bold text-[10px]">
                        {rm.disposition || 'Return to Supplier'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                        {rm.status || 'Pending Return'}
                      </span>
                    </td>
                  </tr>
                ))}

                {rejectedMaterials.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-slate-400 font-sans">
                      No rejected materials recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: GRN CONFIGURATION SETTINGS */}
      {subTab === 'settings' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-6 max-w-2xl">
          <div>
            <h3 className="font-bold text-sm text-slate-900 font-heading">Goods Receipt Note Rules & Quantity Logic</h3>
            <p className="text-xs text-slate-500">Configure global behavior for PO pending quantity calculations and material receipt validations.</p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200/80">
              <div>
                <label className="font-bold text-slate-800 block">Count Rejected Quantity against PO Receipt</label>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  When enabled, total received against PO includes rejected quantity (`Current Received = Accepted + Rejected`). When disabled, pending PO quantity is based strictly on accepted quantity.
                </p>
              </div>
              <input
                type="checkbox"
                checked={rejectCountsAsReceived}
                onChange={e => setRejectCountsAsReceived(e.target.checked)}
                className="w-5 h-5 text-purple-600 rounded-md border-slate-300 focus:ring-purple-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* CREATE GRN MODAL */}
      {showGrnModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="font-bold text-sm text-slate-900 font-heading uppercase tracking-wider">Record Goods Receipt Note (GRN)</h3>
                <p className="text-xs text-slate-500">Select Purchase Order and record incoming materials physically received.</p>
              </div>
              <button onClick={() => setShowGrnModal(false)} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            {/* Modal Error Banner */}
            {modalError && (
              <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center justify-between shadow-2xs">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="font-semibold">{modalError}</span>
                </div>
                <button onClick={() => setModalError('')} className="text-rose-500 hover:text-rose-700"><X className="w-4 h-4" /></button>
              </div>
            )}

            {/* Modal Body Form wrapping controls and footer */}
            <form onSubmit={e => handleCreateGrnSubmit(e, 'Pending inspection')} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
                {/* SECTION 1 — GRN HEADER (ALL 13 HEADER FIELDS) */}
                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-purple-700 font-heading uppercase tracking-wider flex items-center space-x-2 border-b border-purple-100 pb-2">
                    <FileText className="w-4 h-4 text-purple-600" />
                    <span>SECTION 1 — GRN HEADER (13 Required Fields)</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/80 p-4 rounded-xl border border-slate-200/80">
                    {/* Field 1 */}
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">1. GRN Number</label>
                      <input
                        type="text"
                        value={grnForm.grn_number || ''}
                        onChange={e => setGrnForm({ ...grnForm, grn_number: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-purple-700 font-bold font-mono"
                      />
                    </div>

                    {/* Field 2 */}
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">2. Receipt Date *</label>
                      <input
                        type="date"
                        value={grnForm.receipt_date}
                        onChange={e => setGrnForm({ ...grnForm, receipt_date: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono"
                        required
                      />
                    </div>

                    {/* Field 3 */}
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">3. Purchase Order *</label>
                      <select
                        value={grnForm.po_id}
                        onChange={e => handlePoChange(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold font-mono"
                        required
                      >
                        <option value="">-- Select Approved PO --</option>
                        {pos.map(p => (
                          <option key={p.id} value={p.id}>{p.po_number} - {p.supplier_name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Field 4 */}
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">4. Supplier</label>
                      <input
                        type="text"
                        value={grnForm.supplier_name || ''}
                        onChange={e => setGrnForm({ ...grnForm, supplier_name: e.target.value })}
                        placeholder="Supplier Name"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-bold"
                      />
                    </div>

                    {/* Field 5 */}
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">5. Supplier Invoice Number *</label>
                      <input
                        type="text"
                        value={grnForm.supplier_invoice_number}
                        onChange={e => setGrnForm({ ...grnForm, supplier_invoice_number: e.target.value })}
                        placeholder="e.g. INV-9901"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold font-mono"
                        required
                      />
                    </div>

                    {/* Field 6 */}
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">6. Supplier Invoice Date</label>
                      <input
                        type="date"
                        value={grnForm.supplier_invoice_date}
                        onChange={e => setGrnForm({ ...grnForm, supplier_invoice_date: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono"
                      />
                    </div>

                    {/* Field 7 */}
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">7. Delivery Challan Number</label>
                      <input
                        type="text"
                        value={grnForm.delivery_challan_number}
                        onChange={e => setGrnForm({ ...grnForm, delivery_challan_number: e.target.value })}
                        placeholder="e.g. DC-8810"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono"
                      />
                    </div>

                    {/* Field 8 */}
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">8. Vehicle Number</label>
                      <input
                        type="text"
                        value={grnForm.vehicle_number}
                        onChange={e => setGrnForm({ ...grnForm, vehicle_number: e.target.value })}
                        placeholder="e.g. KA-01-EA-5566"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono"
                      />
                    </div>

                    {/* Field 9 */}
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">9. Warehouse *</label>
                      <select
                        value={grnForm.warehouse_id}
                        onChange={e => setGrnForm({ ...grnForm, warehouse_id: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold"
                      >
                        {warehouses.map(w => <option key={w.id} value={w.id}>{w.wh_name || w.name}</option>)}
                      </select>
                    </div>

                    {/* Field 10 */}
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">10. Received By</label>
                      <input
                        type="text"
                        value={grnForm.received_by}
                        onChange={e => setGrnForm({ ...grnForm, received_by: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                      />
                    </div>

                    {/* Field 11 */}
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">11. Inspection Status</label>
                      <select
                        value={grnForm.inspection_status || 'Pending inspection'}
                        onChange={e => setGrnForm({ ...grnForm, inspection_status: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold"
                      >
                        <option value="Pending inspection">Pending inspection</option>
                        <option value="Inspected & Passed">Inspected & Passed</option>
                        <option value="Partially Passed">Partially Passed</option>
                        <option value="Failed Inspection">Failed Inspection</option>
                      </select>
                    </div>

                    {/* Field 12 */}
                    <div className="md:col-span-2">
                      <label className="block text-slate-700 font-bold mb-1">12. Remarks</label>
                      <input
                        type="text"
                        value={grnForm.remarks}
                        onChange={e => setGrnForm({ ...grnForm, remarks: e.target.value })}
                        placeholder="General receipt remarks or gate pass notes..."
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                      />
                    </div>

                    {/* Field 13 */}
                    <div className="md:col-span-3">
                      <label className="block text-slate-700 font-bold mb-1">13. Attachments</label>
                      <input
                        type="text"
                        value={grnForm.attachments}
                        onChange={e => setGrnForm({ ...grnForm, attachments: e.target.value })}
                        placeholder="Attachment reference URL or file path..."
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 2 — GRN ITEMS (ALL 14 ITEM FIELDS PER PO ITEM) */}
                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <h4 className="font-bold text-xs text-purple-700 font-heading uppercase tracking-wider flex items-center space-x-2 border-b border-purple-100 pb-2">
                    <Package className="w-4 h-4 text-purple-600" />
                    <span>SECTION 2 — GRN ITEMS (14 Required Fields Per PO Item)</span>
                  </h4>

                  {loadingPoItems ? (
                    <div className="text-center py-6 text-slate-400">Loading line items from Purchase Order...</div>
                  ) : grnFormItems.length === 0 ? (
                    <div className="p-4 bg-slate-50 rounded-xl text-slate-400 text-center">
                      Select a Purchase Order above to auto-populate line items.
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {grnFormItems.map((item, idx) => {
                        const currentReceived = Number(item.accepted_qty || 0) + Number(item.rejected_qty || 0);
                        const pendingPo = Math.max(0, item.ordered_qty - item.previously_received_qty);
                        const shortQty = Math.max(0, pendingPo - currentReceived);
                        const excessQty = Math.max(0, currentReceived - pendingPo);

                        return (
                          <div key={idx} className="p-4 bg-slate-50/80 border border-slate-200 rounded-xl space-y-4 shadow-2xs">
                            <div className="font-bold text-xs text-slate-800 border-b border-slate-200/80 pb-2 flex justify-between items-center">
                              <span className="text-purple-700">Line #{idx + 1} — {item.item_code} ({item.item_name})</span>
                              <span className="text-slate-500 text-[11px] font-mono font-normal">Item Config: Batch Tracked: {item.is_batch_tracked ? 'Yes' : 'No'} | Serial Tracked: {item.is_serial_tracked ? 'Yes' : 'No'}</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                              {/* Field 14 */}
                              <div className="md:col-span-2">
                                <label className="block text-slate-700 font-bold mb-1">14. PO Item</label>
                                <input
                                  type="text"
                                  value={item.item_name ? `${item.item_code} - ${item.item_name}` : item.item_code || ''}
                                  onChange={e => updateGrnItemField(idx, 'item_name', e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-purple-700 font-bold font-mono"
                                />
                              </div>

                              {/* Field 15 */}
                              <div>
                                <label className="block text-slate-700 font-bold mb-1">15. Ordered Quantity</label>
                                <input
                                  type="number"
                                  min="0"
                                  value={item.ordered_qty}
                                  onChange={e => updateGrnItemField(idx, 'ordered_qty', e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold font-mono"
                                />
                              </div>

                              {/* Field 16 */}
                              <div>
                                <label className="block text-slate-700 font-bold mb-1">16. Previously Received Quantity</label>
                                <input
                                  type="number"
                                  min="0"
                                  value={item.previously_received_qty}
                                  onChange={e => updateGrnItemField(idx, 'previously_received_qty', e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold font-mono"
                                />
                              </div>

                              {/* Field 17 */}
                              <div>
                                <label className="block text-slate-700 font-bold mb-1">17. Current Received Quantity</label>
                                <input
                                  type="number"
                                  min="0"
                                  value={currentReceived}
                                  onChange={e => updateGrnItemField(idx, 'accepted_qty', e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold font-mono"
                                />
                              </div>

                              {/* Field 18 */}
                              <div>
                                <label className="block text-slate-700 font-bold mb-1">18. Accepted Quantity</label>
                                <input
                                  type="number"
                                  min="0"
                                  value={item.accepted_qty}
                                  onChange={e => updateGrnItemField(idx, 'accepted_qty', e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-emerald-700 font-mono"
                                />
                              </div>

                              {/* Field 19 */}
                              <div>
                                <label className="block text-slate-700 font-bold mb-1">19. Rejected Quantity</label>
                                <input
                                  type="number"
                                  min="0"
                                  value={item.rejected_qty}
                                  onChange={e => updateGrnItemField(idx, 'rejected_qty', e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-rose-600 font-mono"
                                />
                              </div>

                              {/* Field 20 */}
                              <div>
                                <label className="block text-slate-700 font-bold mb-1">20. Short Quantity</label>
                                <input
                                  type="number"
                                  min="0"
                                  value={shortQty}
                                  onChange={e => updateGrnItemField(idx, 'short_qty', e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-rose-600 font-mono"
                                />
                              </div>

                              {/* Field 21 */}
                              <div>
                                <label className="block text-slate-700 font-bold mb-1">21. Excess Quantity</label>
                                <input
                                  type="number"
                                  min="0"
                                  value={excessQty}
                                  onChange={e => updateGrnItemField(idx, 'excess_qty', e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-amber-600 font-mono"
                                />
                              </div>

                              {/* Field 22 */}
                              <div>
                                <label className="block text-slate-700 font-bold mb-1">22. Batch Number</label>
                                <input
                                  type="text"
                                  value={item.batch_number || ''}
                                  onChange={e => updateGrnItemField(idx, 'batch_number', e.target.value)}
                                  placeholder="e.g. BAT-2026-X99"
                                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-mono text-purple-900 font-bold"
                                />
                              </div>

                              {/* Field 23 */}
                              <div>
                                <label className="block text-slate-700 font-bold mb-1">23. Manufacturing Date</label>
                                <input
                                  type="date"
                                  value={item.mfg_date || ''}
                                  onChange={e => updateGrnItemField(idx, 'mfg_date', e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono"
                                />
                              </div>

                              {/* Field 24 */}
                              <div>
                                <label className="block text-slate-700 font-bold mb-1">24. Expiry Date</label>
                                <input
                                  type="date"
                                  value={item.expiry_date || ''}
                                  onChange={e => updateGrnItemField(idx, 'expiry_date', e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono"
                                />
                              </div>

                              {/* Field 25 */}
                              <div className="md:col-span-2">
                                <label className="block text-purple-700 font-bold mb-1">25. Serial Numbers (Comma-separated)</label>
                                <input
                                  type="text"
                                  value={item.serial_numbers_text || ''}
                                  onChange={e => updateGrnItemField(idx, 'serial_numbers_text', e.target.value)}
                                  placeholder="SN-1001, SN-1002, SN-1003..."
                                  className="w-full bg-white border border-purple-300 rounded-xl px-3 py-2 font-mono text-purple-900 text-xs font-semibold"
                                />
                              </div>

                              {/* Field 26 */}
                              <div className="md:col-span-2">
                                <label className="block text-slate-700 font-bold mb-1">26. Storage Location</label>
                                <select
                                  value={item.storage_location_id}
                                  onChange={e => updateGrnItemField(idx, 'storage_location_id', e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                                >
                                  <option value="loc-01">Zone A - Rack 01 (loc-01)</option>
                                  <option value="loc-02">Zone A - Rack 02 (loc-02)</option>
                                  <option value="loc-03">Zone IT - Rack IT-1 (loc-03)</option>
                                </select>
                              </div>

                              {/* Field 27 */}
                              <div className="md:col-span-4">
                                <label className="block text-slate-700 font-bold mb-1">27. Quality Remarks</label>
                                <input
                                  type="text"
                                  value={item.quality_remarks || ''}
                                  onChange={e => updateGrnItemField(idx, 'quality_remarks', e.target.value)}
                                  placeholder="Inspection observations or quality notes..."
                                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                                />
                              </div>
                            </div>

                            {/* Excess Alert */}
                            {excessQty > 0 && (
                              <div className="bg-amber-100/80 border border-amber-300 p-2.5 rounded-xl text-[11px] text-amber-900 flex items-center justify-between font-medium">
                                <span>⚠️ Received quantity ({currentReceived}) exceeds pending PO quantity ({pendingPo}).</span>
                                <label className="flex items-center space-x-1 cursor-pointer font-bold">
                                  <input
                                    type="checkbox"
                                    checked={grnForm.is_excess_authorized}
                                    onChange={e => setGrnForm({ ...grnForm, is_excess_authorized: e.target.checked })}
                                    className="rounded text-purple-600"
                                  />
                                  <span>Authorize Excess Receipt</span>
                                </label>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
                <button type="button" onClick={() => setShowGrnModal(false)} disabled={isSubmitting} className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer disabled:opacity-50">
                  Cancel
                </button>

                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={e => handleCreateGrnSubmit(e, 'Draft')}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : 'Save as Draft'}
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={e => handleCreateGrnSubmit(e, 'Posted')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs transition cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? 'Posting...' : 'Post GRN & Update Stock'}
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-xs transition cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit for Inspection'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUALITY INSPECTION MODAL */}
      {showInspectionModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
            {/* Header Title */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 uppercase tracking-wider font-heading flex items-center space-x-2">
                  <ShieldAlert className="w-5 h-5 text-purple-600" />
                  <span>QUALITY INSPECTION</span>
                </h3>
                <p className="text-xs text-slate-500">Checks whether received material meets quality requirements.</p>
              </div>
              <button onClick={() => setShowInspectionModal(null)} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Alert */}
            {modalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center justify-between shadow-2xs">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="font-semibold">{modalError}</span>
                </div>
                <button onClick={() => setModalError('')} className="text-rose-500 hover:text-rose-700"><X className="w-4 h-4" /></button>
              </div>
            )}

            <form onSubmit={e => handleRecordInspectionSubmit(e)} className="space-y-5 text-xs">
              {/* SECTION 1: QUALITY INSPECTION HEADER */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-purple-700 font-heading uppercase tracking-wider border-b border-purple-100 pb-1">
                  QUALITY INSPECTION HEADER
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Inspection Reference</label>
                    <input
                      type="text"
                      value={inspectForm.inspection_reference || `QI-2026-${Math.floor(100000 + Math.random() * 900000)}`}
                      onChange={e => setInspectForm({ ...inspectForm, inspection_reference: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-purple-700 font-bold font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">GRN Reference *</label>
                    <select
                      value={inspectForm.grn_reference || (showInspectionModal && showInspectionModal.grn_number) || ''}
                      onChange={e => handleInspectGrnSelect(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-purple-700 font-bold font-mono text-xs"
                      required
                    >
                      <option value="">-- Select Existing GRN --</option>
                      {grns.map(g => (
                        <option key={g.id} value={g.grn_number}>
                          {g.grn_number} ({g.supplier_name || 'Supplier'} - {g.po_number || 'PO'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Item *</label>
                    <select
                      value={inspectForm.selected_item_id || ''}
                      onChange={e => handleInspectItemChange(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 text-xs"
                    >
                      {(() => {
                        const itemsList = (showInspectionModal && showInspectionModal.items && showInspectionModal.items.length > 0)
                          ? showInspectionModal.items
                          : (inspectForm.item_results && inspectForm.item_results.length > 0)
                          ? inspectForm.item_results
                          : [];

                        return itemsList.map((line, idx) => (
                          <option key={idx} value={line.id || line.item_id || `itm-${idx+1}`}>
                            {line.item_code ? `${line.item_code} - ` : ''}{line.item_name || 'Select Item'} ({line.uom || line.unit || 'Pcs'})
                          </option>
                        ));
                      })()}
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 2: INSPECTION DETAILS (MULTIPLE ROWS TABLE) */}
              <div className="space-y-2">
                <div className="flex justify-between items-center border-b border-purple-100 pb-1">
                  <h4 className="font-bold text-xs text-purple-700 font-heading uppercase tracking-wider">
                    INSPECTION DETAILS
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddInspectionRow}
                    className="bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-lg border border-purple-200 flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Inspection Parameter</span>
                  </button>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3 min-w-[150px]">Inspection Parameter</th>
                        <th className="py-2.5 px-3 min-w-[140px]">Required Specification</th>
                        <th className="py-2.5 px-3 min-w-[140px]">Actual Result</th>
                        <th className="py-2.5 px-3 min-w-[100px]">Pass/Fail Result</th>
                        <th className="py-2.5 px-2 w-10 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {(inspectForm.inspection_rows || []).map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-2">
                            <select
                              value={row.parameter}
                              onChange={e => handleUpdateInspectionRow(idx, 'parameter', e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-800 text-xs"
                            >
                              <option value="Dimensions">Dimensions</option>
                              <option value="Weight">Weight</option>
                              <option value="Colour">Colour</option>
                              <option value="Material Grade">Material Grade</option>
                              <option value="Voltage">Voltage</option>
                              <option value="Performance">Performance</option>
                              <option value="Packaging">Packaging</option>
                              <option value="Expiry">Expiry</option>
                              <option value="Physical Damage">Physical Damage</option>
                            </select>
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={row.required_spec}
                              onChange={e => handleUpdateInspectionRow(idx, 'required_spec', e.target.value)}
                              placeholder="e.g. 14 inch / Sealed"
                              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 text-xs"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={row.actual_result}
                              onChange={e => handleUpdateInspectionRow(idx, 'actual_result', e.target.value)}
                              placeholder="e.g. 14 inch / Minor damage"
                              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 text-xs"
                            />
                          </td>
                          <td className="p-2">
                            <select
                              value={row.pass_fail}
                              onChange={e => handleUpdateInspectionRow(idx, 'pass_fail', e.target.value)}
                              className={`w-full border rounded-lg px-2.5 py-1.5 font-bold text-xs ${
                                row.pass_fail === 'Pass' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                              }`}
                            >
                              <option value="Pass">Pass</option>
                              <option value="Fail">Fail</option>
                            </select>
                          </td>
                          <td className="p-2 text-center">
                            {(inspectForm.inspection_rows || []).length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveInspectionRow(idx)}
                                className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION 3: INSPECTOR INFORMATION */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-purple-700 font-heading uppercase tracking-wider border-b border-purple-100 pb-1">
                  INSPECTOR INFORMATION
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Inspected By *</label>
                    <input
                      type="text"
                      value={inspectForm.inspected_by || 'Store Manager'}
                      onChange={e => setInspectForm({ ...inspectForm, inspected_by: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Inspection Date *</label>
                    <input
                      type="date"
                      value={inspectForm.inspection_date || new Date().toISOString().split('T')[0]}
                      onChange={e => setInspectForm({ ...inspectForm, inspection_date: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: QUANTITY & SECTION 5: RESULT */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* QUANTITY */}
                <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                  <h4 className="font-bold text-xs text-purple-700 font-heading uppercase tracking-wider border-b border-purple-100 pb-1">
                    QUANTITY
                  </h4>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-emerald-700 font-bold mb-1">Accepted Quantity *</label>
                      <input
                        type="number"
                        min="0"
                        value={inspectForm.accepted_qty !== undefined ? inspectForm.accepted_qty : 0}
                        onChange={e => setInspectForm({ ...inspectForm, accepted_qty: Number(e.target.value) })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-emerald-700 font-mono text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-rose-700 font-bold mb-1">Rejected Quantity *</label>
                      <input
                        type="number"
                        min="0"
                        value={inspectForm.rejected_qty !== undefined ? inspectForm.rejected_qty : 0}
                        onChange={e => setInspectForm({ ...inspectForm, rejected_qty: Number(e.target.value) })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-rose-600 font-mono text-sm"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* RESULT */}
                <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                  <h4 className="font-bold text-xs text-purple-700 font-heading uppercase tracking-wider border-b border-purple-100 pb-1">
                    RESULT
                  </h4>
                  <div className="pt-1">
                    <label className="block text-slate-700 font-bold mb-1">Inspection Outcome *</label>
                    <select
                      value={inspectForm.inspection_outcome || 'Accepted'}
                      onChange={e => setInspectForm({ ...inspectForm, inspection_outcome: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-purple-900 text-sm"
                    >
                      <option value="Accepted">Accepted</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Accepted with deviation">Accepted with deviation</option>
                      <option value="Sent for rework">Sent for rework</option>
                      <option value="Pending laboratory result">Pending laboratory result</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 6: REMARKS */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-purple-700 font-heading uppercase tracking-wider border-b border-purple-100 pb-1">
                  REMARKS
                </h4>
                <textarea
                  rows="2"
                  value={inspectForm.remarks || ''}
                  onChange={e => setInspectForm({ ...inspectForm, remarks: e.target.value })}
                  placeholder="Additional inspection observations..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-sans"
                />
              </div>

              {/* SECTION 7: ATTACHMENT */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-purple-700 font-heading uppercase tracking-wider border-b border-purple-100 pb-1">
                  ATTACHMENT
                </h4>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={inspectForm.attachment || ''}
                    onChange={e => setInspectForm({ ...inspectForm, attachment: e.target.value })}
                    placeholder="Upload test report file or document path..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono"
                  />
                  <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl cursor-pointer font-bold shrink-0 flex items-center space-x-1">
                    <Upload className="w-4 h-4 text-slate-600" />
                    <span>Browse...</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={e => {
                        if (e.target.files?.[0]) {
                          setInspectForm({ ...inspectForm, attachment: `doc-${Date.now()}-${e.target.files[0].name}` });
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* SECTION 8: ACTIONS */}
              <div className="flex flex-wrap items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <div className="flex flex-wrap items-center space-x-2 gap-y-2">
                  {/* Cancel */}
                  <button
                    type="button"
                    onClick={() => setShowInspectionModal(null)}
                    disabled={isSubmitting}
                    className="px-3.5 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  {/* Save Draft */}
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={e => handleRecordInspectionSubmit(e, 'Pending laboratory result')}
                    className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl shadow-2xs cursor-pointer disabled:opacity-50"
                  >
                    Save Draft
                  </button>

                  {/* Accept */}
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={e => handleRecordInspectionSubmit(e, 'Accepted')}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-2xs cursor-pointer disabled:opacity-50"
                  >
                    Accept
                  </button>

                  {/* Reject */}
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={e => handleRecordInspectionSubmit(e, 'Rejected')}
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-2xs cursor-pointer disabled:opacity-50"
                  >
                    Reject
                  </button>

                  {/* Send for Rework */}
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={e => handleRecordInspectionSubmit(e, 'Sent for rework')}
                    className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-2xs cursor-pointer disabled:opacity-50"
                  >
                    Send for Rework
                  </button>

                  {/* Submit Inspection */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-2xs cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Inspection'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CANCEL GRN MODAL */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 font-heading">Cancel GRN {showCancelModal.grn_number}</h3>
              <button onClick={() => setShowCancelModal(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center justify-between shadow-2xs">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="font-semibold">{modalError}</span>
                </div>
                <button onClick={() => setModalError('')} className="text-rose-500 hover:text-rose-700"><X className="w-4 h-4" /></button>
              </div>
            )}

            <form onSubmit={handleCancelGrnSubmit} className="space-y-4 text-xs">
              <p className="text-slate-600">
                Are you sure you want to cancel GRN <strong>{showCancelModal.grn_number}</strong>? 
                If already posted, inventory stock entries will be automatically reversed.
              </p>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Reason for Cancellation *</label>
                <textarea
                  rows="3"
                  required
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  placeholder="Provide reason for cancelling this Goods Receipt Note..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setShowCancelModal(null)} disabled={isSubmitting} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer disabled:opacity-50">
                  Back
                </button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-rose-600 text-white font-bold rounded-xl shadow-xs cursor-pointer disabled:opacity-50">
                  {isSubmitting ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* DELETE GRN MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 font-heading">Delete GRN {showDeleteModal.grn_number}</h3>
              <button onClick={() => setShowDeleteModal(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center justify-between shadow-2xs">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="font-semibold">{modalError}</span>
                </div>
                <button onClick={() => setModalError('')} className="text-rose-500 hover:text-rose-700"><X className="w-4 h-4" /></button>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <p className="text-slate-600 font-medium">
                Are you sure you want to permanently delete GRN <strong className="text-slate-900 font-mono">{showDeleteModal.grn_number}</strong>? 
                This action cannot be undone and will remove all associated line items and quality records.
              </p>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(null)}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteGrnSubmit(showDeleteModal.id)}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Deleting...' : 'Delete GRN'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
