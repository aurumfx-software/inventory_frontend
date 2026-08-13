import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Plus, 
  CheckCircle2, 
  X, 
  AlertTriangle, 
  Search, 
  FileText, 
  Upload, 
  Info,
  Layers,
  Clock,
  Trash2,
  Package,
  UserCheck,
  Calendar,
  Check,
  Filter,
  Pencil
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function QualityInspection() {
  const { user } = useAuth();
  const [grns, setGrns] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [modalError, setModalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingInspection, setEditingInspection] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);

  // Filter state for inspection log
  const [searchQuery, setSearchQuery] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState('All');

  // Form State
  const generateInspectionRef = () => `QI-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

  const [inspectForm, setInspectForm] = useState({
    inspection_reference: generateInspectionRef(),
    grn_id: '',
    grn_reference: '',
    selected_item_id: '',
    inspected_by: user?.name || 'Store Manager',
    inspection_date: new Date().toISOString().split('T')[0],
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
        actual_result: 'Minor damage',
        pass_fail: 'Fail'
      }
    ],
    accepted_qty: 95,
    rejected_qty: 5,
    inspection_outcome: 'Accepted with deviation',
    remarks: 'Packaging damaged on 5 units. Product performance is acceptable.',
    attachment: ''
  });

  // Currently selected GRN object and Item object for read-only reference
  const [selectedGrn, setSelectedGrn] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchGrns();
    fetchInspections();
  }, []);

  const fetchGrns = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/goods-receipts');
      const data = await res.json();
      if (data.success) {
        setGrns(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch GRNs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInspections = async () => {
    try {
      const res = await fetch('/api/quality-inspections');
      const data = await res.json();
      if (data.success) {
        setInspections(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch inspections:', err);
    }
  };

  // When GRN selection changes
  const handleGrnSelect = (grnId) => {
    setModalError('');
    if (!grnId) {
      setSelectedGrn(null);
      setSelectedItem(null);
      setInspectForm(prev => ({
        ...prev,
        grn_id: '',
        grn_reference: '',
        selected_item_id: '',
        accepted_qty: 0,
        rejected_qty: 0
      }));
      return;
    }

    const grn = grns.find(g => g.id === grnId || g.grn_number === grnId);
    if (grn) {
      setSelectedGrn(grn);
      const firstItem = (grn.items || [])[0] || null;
      setSelectedItem(firstItem);

      const maxInspectable = firstItem 
        ? Number(firstItem.received_qty || (Number(firstItem.accepted_qty || 0) + Number(firstItem.rejected_qty || 0)) || Number(firstItem.ordered_qty || 0) || 0)
        : 0;

      let initAccepted = firstItem ? Number(firstItem.accepted_qty !== undefined ? firstItem.accepted_qty : maxInspectable) : 0;
      let initRejected = firstItem ? Number(firstItem.rejected_qty || 0) : 0;

      if (initAccepted + initRejected > maxInspectable || initAccepted > maxInspectable) {
        initAccepted = maxInspectable;
        initRejected = 0;
      }

      setInspectForm(prev => ({
        ...prev,
        grn_id: grn.id,
        grn_reference: grn.grn_number,
        selected_item_id: firstItem ? (firstItem.id || firstItem.item_id) : '',
        accepted_qty: initAccepted,
        rejected_qty: initRejected
      }));
    }
  };

  // When Item selection changes
  const handleItemSelect = (itemId) => {
    setModalError('');
    if (!selectedGrn) return;
    const item = (selectedGrn.items || []).find(i => i.id === itemId || i.item_id === itemId);
    if (item) {
      setSelectedItem(item);
      const maxInspectable = Number(item.received_qty || (Number(item.accepted_qty || 0) + Number(item.rejected_qty || 0)) || Number(item.ordered_qty || 0) || 0);
      let initAccepted = Number(item.accepted_qty !== undefined ? item.accepted_qty : maxInspectable);
      let initRejected = Number(item.rejected_qty || 0);

      if (initAccepted + initRejected > maxInspectable || initAccepted > maxInspectable) {
        initAccepted = maxInspectable;
        initRejected = 0;
      }

      setInspectForm(prev => ({
        ...prev,
        selected_item_id: itemId,
        accepted_qty: initAccepted,
        rejected_qty: initRejected
      }));
    }
  };

  // Add parameter row
  const handleAddParameterRow = () => {
    setInspectForm(prev => ({
      ...prev,
      inspection_rows: [
        ...prev.inspection_rows,
        {
          parameter: 'Physical Damage',
          required_spec: 'None',
          actual_result: 'None',
          pass_fail: 'Pass'
        }
      ]
    }));
  };

  // Remove parameter row
  const handleRemoveParameterRow = (index) => {
    if (inspectForm.inspection_rows.length <= 1) return;
    setInspectForm(prev => ({
      ...prev,
      inspection_rows: prev.inspection_rows.filter((_, idx) => idx !== index)
    }));
  };

  // Update parameter row field
  const handleUpdateParameterRow = (index, field, value) => {
    setInspectForm(prev => {
      const rows = [...prev.inspection_rows];
      rows[index] = { ...rows[index], [field]: value };
      return { ...prev, inspection_rows: rows };
    });
  };

  // Open modal for new Quality Inspection
  const handleOpenNewInspectionModal = () => {
    setErrorMsg('');
    setModalError('');
    setEditingInspection(null);
    const newRef = generateInspectionRef();
    const firstGrn = grns[0] || null;

    if (firstGrn) {
      setSelectedGrn(firstGrn);
      const firstItem = (firstGrn.items || [])[0] || null;
      setSelectedItem(firstItem);

      const maxInspectable = firstItem 
        ? Number(firstItem.received_qty || (Number(firstItem.accepted_qty || 0) + Number(firstItem.rejected_qty || 0)) || Number(firstItem.ordered_qty || 0) || 0)
        : 0;

      setInspectForm({
        inspection_reference: newRef,
        grn_id: firstGrn.id,
        grn_reference: firstGrn.grn_number,
        selected_item_id: firstItem ? (firstItem.id || firstItem.item_id) : '',
        inspected_by: user?.name || 'Store Manager',
        inspection_date: new Date().toISOString().split('T')[0],
        inspection_rows: [
          {
            parameter: 'Dimensions',
            required_spec: '14 inch',
            actual_result: '14 inch',
            pass_fail: 'Pass'
          },
          {
            parameter: 'Packaging',
            required_spec: 'Sealed',
            actual_result: 'Good',
            pass_fail: 'Pass'
          }
        ],
        accepted_qty: maxInspectable,
        rejected_qty: 0,
        inspection_outcome: 'Accepted',
        remarks: 'All quality check parameters verified.',
        attachment: ''
      });
    } else {
      setSelectedGrn(null);
      setSelectedItem(null);
      setInspectForm({
        inspection_reference: newRef,
        grn_id: '',
        grn_reference: '',
        selected_item_id: '',
        inspected_by: user?.name || 'Store Manager',
        inspection_date: new Date().toISOString().split('T')[0],
        inspection_rows: [
          { parameter: 'Dimensions', required_spec: '14 inch', actual_result: '14 inch', pass_fail: 'Pass' }
        ],
        accepted_qty: 0,
        rejected_qty: 0,
        inspection_outcome: 'Accepted',
        remarks: '',
        attachment: ''
      });
    }

    setShowFormModal(true);
  };

  // Open modal for editing existing Quality Inspection
  const handleOpenEditInspectionModal = (qi) => {
    setErrorMsg('');
    setModalError('');
    setEditingInspection(qi);

    const grn = grns.find(g => g.id === qi.grn_id || g.grn_number === qi.grn_reference) || null;
    setSelectedGrn(grn);

    let item = null;
    if (grn) {
      item = (grn.items || []).find(i => i.id === qi.item_id || i.item_id === qi.item_id) || (grn.items || [])[0] || null;
    }
    setSelectedItem(item);

    setInspectForm({
      id: qi.id,
      inspection_reference: qi.inspection_reference || qi.id,
      grn_id: qi.grn_id || grn?.id || '',
      grn_reference: qi.grn_reference || grn?.grn_number || '',
      selected_item_id: qi.item_id || item?.id || '',
      inspected_by: qi.inspected_by || user?.name || 'Store Manager',
      inspection_date: qi.inspection_date || new Date().toISOString().split('T')[0],
      inspection_rows: Array.isArray(qi.inspection_rows) && qi.inspection_rows.length > 0 ? qi.inspection_rows : [
        { parameter: 'Dimensions', required_spec: '14 inch', actual_result: '14 inch', pass_fail: 'Pass' }
      ],
      accepted_qty: Number(qi.accepted_qty !== undefined ? qi.accepted_qty : 0),
      rejected_qty: Number(qi.rejected_qty !== undefined ? qi.rejected_qty : 0),
      inspection_outcome: qi.inspection_outcome || qi.pass_fail_result || 'Accepted',
      remarks: qi.remarks || '',
      attachment: qi.attachment || ''
    });

    setShowFormModal(true);
  };

  // Delete Inspection Handler
  const handleDeleteInspectionSubmit = async (qiId) => {
    setIsSubmitting(true);
    setModalError('');
    try {
      const res = await fetch(`/api/quality-inspections/${qiId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setModalError(data.message || 'Failed to delete quality inspection.');
        setIsSubmitting(false);
        return;
      }
      setSuccessMsg(data.message || 'Quality inspection deleted successfully.');
      setShowDeleteModal(null);
      fetchInspections();
      fetchGrns();
    } catch (err) {
      console.error(err);
      setModalError('Failed to delete quality inspection due to network error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Inspection Handler (Create / Update)
  const handleSubmitInspection = async (e, outcomeOverride) => {
    if (e) e.preventDefault();
    setModalError('');
    setErrorMsg('');
    setSuccessMsg('');

    if (!inspectForm.grn_reference) {
      setModalError('Please select a GRN Reference.');
      return;
    }

    const outcomeToSubmit = outcomeOverride || inspectForm.inspection_outcome || 'Accepted';

    // Quantity Validation Rule: Accepted Qty + Rejected Qty <= Available GRN Quantity
    const maxAvailable = selectedItem 
      ? Number(selectedItem.received_qty || (Number(selectedItem.accepted_qty || 0) + Number(selectedItem.rejected_qty || 0)) || 100)
      : 999999;

    const totalEnteredQty = Number(inspectForm.accepted_qty || 0) + Number(inspectForm.rejected_qty || 0);

    if (totalEnteredQty > maxAvailable) {
      setModalError(`Quantity Validation Error: Accepted Quantity (${inspectForm.accepted_qty}) + Rejected Quantity (${inspectForm.rejected_qty}) = ${totalEnteredQty}, which exceeds GRN inspectable quantity (${maxAvailable}).`);
      return;
    }

    const targetGrnId = inspectForm.grn_id || inspectForm.grn_reference;

    setIsSubmitting(true);
    try {
      let res, data;
      if (editingInspection) {
        // Update Existing Inspection
        res = await fetch(`/api/quality-inspections/${editingInspection.id || editingInspection.inspection_reference}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            inspected_by: inspectForm.inspected_by,
            inspection_date: inspectForm.inspection_date,
            inspection_rows: inspectForm.inspection_rows,
            accepted_qty: Number(inspectForm.accepted_qty || 0),
            rejected_qty: Number(inspectForm.rejected_qty || 0),
            inspection_outcome: outcomeToSubmit,
            remarks: inspectForm.remarks,
            attachment: inspectForm.attachment
          })
        });
        data = await res.json();
      } else {
        // Create New Inspection
        res = await fetch(`/api/goods-receipts/${targetGrnId}/inspect`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            inspection_reference: inspectForm.inspection_reference,
            grn_reference: inspectForm.grn_reference,
            item_id: inspectForm.selected_item_id,
            inspected_by: inspectForm.inspected_by,
            inspection_date: inspectForm.inspection_date,
            inspection_rows: inspectForm.inspection_rows,
            accepted_qty: Number(inspectForm.accepted_qty || 0),
            rejected_qty: Number(inspectForm.rejected_qty || 0),
            inspection_outcome: outcomeToSubmit,
            remarks: inspectForm.remarks,
            attachment: inspectForm.attachment,
            items: selectedGrn?.items ? selectedGrn.items.map(line => {
              if (line.id === inspectForm.selected_item_id || line.item_id === inspectForm.selected_item_id) {
                return {
                  ...line,
                  accepted_qty: Number(inspectForm.accepted_qty || 0),
                  rejected_qty: Number(inspectForm.rejected_qty || 0)
                };
              }
              return line;
            }) : []
          })
        });
        data = await res.json();
      }

      if (!res.ok || !data.success) {
        setModalError(data.message || 'Failed to submit quality inspection.');
        setIsSubmitting(false);
        return;
      }

      setSuccessMsg(data.message || `Quality Inspection ${inspectForm.inspection_reference} saved successfully with outcome '${outcomeToSubmit}'.`);
      setShowFormModal(false);
      setEditingInspection(null);
      fetchGrns();
      fetchInspections();
    } catch (err) {
      console.error(err);
      setModalError('Failed to record quality inspection due to network error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered Inspections list
  const filteredInspections = inspections.filter(qi => {
    if (outcomeFilter !== 'All' && qi.inspection_outcome !== outcomeFilter && qi.pass_fail_result !== outcomeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        qi.inspection_reference?.toLowerCase().includes(q) ||
        qi.grn_reference?.toLowerCase().includes(q) ||
        qi.item_name?.toLowerCase().includes(q) ||
        qi.item_code?.toLowerCase().includes(q) ||
        qi.inspected_by?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 border border-slate-200/80 rounded-2xl shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-purple-600/10 border border-purple-200 flex items-center justify-center text-purple-700 font-bold shrink-0 shadow-2xs">
            <ShieldAlert className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-heading tracking-tight flex items-center space-x-2">
              <span>Quality Inspection Module</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Dedicated inbound parameter check form, specification validation, and quality disposition.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleOpenNewInspectionModal}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center space-x-2 shadow-xs transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Quality Inspection</span>
          </button>
        </div>
      </div>

      {/* Global Alerts */}
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

      {/* FILTER & SEARCH ENGINE BAR */}
      <div className="bg-white p-4 border border-slate-200/80 rounded-2xl shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3 flex-1 min-w-[240px]">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search Inspection #, GRN #, Item, Inspector..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-800 focus:outline-none focus:border-purple-500 font-sans"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={outcomeFilter}
            onChange={e => setOutcomeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-bold"
          >
            <option value="All">All Outcomes</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
            <option value="Accepted with deviation">Accepted with deviation</option>
            <option value="Sent for rework">Sent for rework</option>
            <option value="Pending laboratory result">Pending laboratory result</option>
          </select>
        </div>
      </div>

      {/* QUALITY INSPECTION RECORDS TABLE */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900 font-heading">Quality Inspection Log</h3>
            <p className="text-xs text-slate-500">Record of executed parameter checks and material quality outcomes.</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400 text-xs font-medium">Loading quality inspections...</div>
        ) : filteredInspections.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 space-y-3">
            <ShieldAlert className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-bold text-sm text-slate-700">No Quality Inspection Records Found</p>
            <p className="text-xs text-slate-400">Click "+ New Quality Inspection" above to create a dedicated inspection record.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-100 font-bold">
                  <th className="py-3 px-3 font-sans">Inspection Ref</th>
                  <th className="py-3 px-3 font-sans">GRN Reference</th>
                  <th className="py-3 px-3 font-sans">Item Code & Name</th>
                  <th className="py-3 px-3 font-sans">Inspector & Date</th>
                  <th className="py-3 px-3 font-sans">Accepted / Rejected Qty</th>
                  <th className="py-3 px-3 font-sans">Inspection Outcome</th>
                  <th className="py-3 px-3 font-sans">Remarks</th>
                  <th className="py-3 px-3 font-sans text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredInspections.map((qi, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 font-bold text-purple-700">{qi.inspection_reference || qi.id}</td>
                    <td className="py-3 px-3 text-slate-800 font-semibold">{qi.grn_reference || qi.grn_number}</td>
                    <td className="py-3 px-3 font-sans">
                      <span className="font-mono font-bold text-purple-900 block">{qi.item_code}</span>
                      <span className="text-slate-700 font-medium">{qi.item_name}</span>
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <span className="text-slate-800 font-bold block">{qi.inspected_by}</span>
                      <span className="text-slate-400 text-[11px] font-mono">{qi.inspection_date || qi.created_at?.split('T')[0]}</span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold">
                      <span className="text-emerald-700 mr-2">Acc: {qi.accepted_qty || 0}</span>
                      <span className="text-rose-600">Rej: {qi.rejected_qty || 0}</span>
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] border ${
                        qi.inspection_outcome === 'Accepted' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        qi.inspection_outcome === 'Accepted with deviation' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                        qi.inspection_outcome === 'Sent for rework' ? 'bg-orange-50 text-orange-800 border-orange-200' :
                        qi.inspection_outcome === 'Pending laboratory result' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                        'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {qi.inspection_outcome || qi.pass_fail_result || 'Accepted'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-sans text-slate-600 max-w-[200px] truncate">
                      {qi.remarks || 'None'}
                    </td>
                    <td className="py-3 px-3 text-center font-sans">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => handleOpenEditInspectionModal(qi)}
                          className="p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg border border-purple-200 transition cursor-pointer"
                          title="Edit Quality Inspection"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setShowDeleteModal(qi);
                            setModalError('');
                          }}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg border border-rose-200 transition cursor-pointer"
                          title="Delete Quality Inspection"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DEDICATED QUALITY INSPECTION FORM MODAL */}
      {showFormModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="font-bold text-base text-slate-900 uppercase tracking-wider font-heading flex items-center space-x-2">
                  <ShieldAlert className="w-5 h-5 text-purple-600" />
                  <span>QUALITY INSPECTION</span>
                </h3>
                <p className="text-xs text-slate-500">Dedicated inbound material quality verification form.</p>
              </div>
              <button onClick={() => setShowFormModal(false)} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Alert */}
            {modalError && (
              <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center justify-between shadow-2xs">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="font-semibold">{modalError}</span>
                </div>
                <button onClick={() => setModalError('')} className="text-rose-500 hover:text-rose-700"><X className="w-4 h-4" /></button>
              </div>
            )}

            {/* Form Body */}
            <form onSubmit={e => handleSubmitInspection(e)} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
                
                {/* QUALITY INSPECTION HEADER */}
                <div className="space-y-3">
                  <h4 className="font-bold text-xs text-purple-700 font-heading uppercase tracking-wider border-b border-purple-100 pb-2">
                    QUALITY INSPECTION HEADER
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                    {/* Inspection Reference */}
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Inspection Reference</label>
                      <input
                        type="text"
                        value={inspectForm.inspection_reference}
                        onChange={e => setInspectForm({ ...inspectForm, inspection_reference: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-purple-700 font-bold font-mono"
                        required
                      />
                    </div>

                    {/* GRN Reference */}
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">GRN Reference *</label>
                      <select
                        value={inspectForm.grn_id || inspectForm.grn_reference}
                        onChange={e => handleGrnSelect(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold font-mono"
                        required
                      >
                        <option value="">-- Select Existing GRN --</option>
                        {grns.map(g => (
                          <option key={g.id} value={g.id}>
                            {g.grn_number} - {g.supplier_name} ({g.receipt_date})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Item */}
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Item *</label>
                      <select
                        value={inspectForm.selected_item_id}
                        onChange={e => handleItemSelect(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold"
                        required
                      >
                        {selectedGrn && (selectedGrn.items || []).map((line, idx) => (
                          <option key={idx} value={line.id || line.item_id}>
                            {line.item_code} - {line.item_name} ({line.uom || 'Pcs'})
                          </option>
                        ))}
                        {(!selectedGrn || (selectedGrn.items || []).length === 0) && (
                          <option value="">-- Select GRN first --</option>
                        )}
                      </select>
                    </div>

                    {/* Inspected By */}
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Inspected By *</label>
                      <input
                        type="text"
                        value={inspectForm.inspected_by}
                        onChange={e => setInspectForm({ ...inspectForm, inspected_by: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold"
                        required
                      />
                    </div>

                    {/* Inspection Date */}
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Inspection Date *</label>
                      <input
                        type="date"
                        value={inspectForm.inspection_date}
                        onChange={e => setInspectForm({ ...inspectForm, inspection_date: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono"
                        required
                      />
                    </div>
                  </div>

                  {/* Read-Only GRN Reference Summary (Small Reference Card) */}
                  {selectedGrn && selectedItem && (
                    <div className="p-3 bg-purple-50/60 border border-purple-100 rounded-xl text-xs flex flex-wrap items-center justify-between gap-2 font-mono">
                      <div className="flex items-center space-x-2">
                        <Info className="w-4 h-4 text-purple-600 shrink-0" />
                        <span className="text-purple-900 font-bold">GRN Reference Info:</span>
                        <span className="text-slate-700">{selectedGrn.grn_number}</span>
                        <span className="text-slate-400">&bull;</span>
                        <span className="text-slate-700">Supplier: {selectedGrn.supplier_name}</span>
                      </div>
                      <div className="text-slate-700">
                        Available Qty for Inspection: <strong className="text-purple-700 font-bold">{selectedItem.received_qty || (Number(selectedItem.accepted_qty || 0) + Number(selectedItem.rejected_qty || 0))} {selectedItem.uom || 'Pcs'}</strong>
                      </div>
                    </div>
                  )}
                </div>

                {/* INSPECTION PARAMETERS TABLE */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-purple-100 pb-2">
                    <h4 className="font-bold text-xs text-purple-700 font-heading uppercase tracking-wider">
                      INSPECTION PARAMETERS
                    </h4>
                    <button
                      type="button"
                      onClick={handleAddParameterRow}
                      className="bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1.5 rounded-xl border border-purple-200 flex items-center space-x-1.5 cursor-pointer shadow-2xs transition active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Inspection Parameter</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                        <tr>
                          <th className="py-2.5 px-3 min-w-[160px]">Inspection Parameter</th>
                          <th className="py-2.5 px-3 min-w-[150px]">Required Specification</th>
                          <th className="py-2.5 px-3 min-w-[150px]">Actual Result</th>
                          <th className="py-2.5 px-3 min-w-[120px]">Pass/Fail Result</th>
                          <th className="py-2.5 px-2 w-10 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white font-sans">
                        {inspectForm.inspection_rows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            {/* Inspection Parameter */}
                            <td className="p-2">
                              <select
                                value={row.parameter}
                                onChange={e => handleUpdateParameterRow(idx, 'parameter', e.target.value)}
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

                            {/* Required Specification */}
                            <td className="p-2">
                              <input
                                type="text"
                                value={row.required_spec}
                                onChange={e => handleUpdateParameterRow(idx, 'required_spec', e.target.value)}
                                placeholder="Required spec..."
                                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 text-xs"
                              />
                            </td>

                            {/* Actual Result */}
                            <td className="p-2">
                              <input
                                type="text"
                                value={row.actual_result}
                                onChange={e => handleUpdateParameterRow(idx, 'actual_result', e.target.value)}
                                placeholder="Actual result..."
                                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 text-xs"
                              />
                            </td>

                            {/* Pass/Fail Result */}
                            <td className="p-2">
                              <select
                                value={row.pass_fail}
                                onChange={e => handleUpdateParameterRow(idx, 'pass_fail', e.target.value)}
                                className={`w-full border rounded-lg px-2.5 py-1.5 font-bold text-xs ${
                                  row.pass_fail === 'Pass' 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                    : 'bg-rose-50 text-rose-700 border-rose-200'
                                }`}
                              >
                                <option value="Pass">Pass</option>
                                <option value="Fail">Fail</option>
                              </select>
                            </td>

                            {/* Action Delete */}
                            <td className="p-2 text-center">
                              {inspectForm.inspection_rows.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveParameterRow(idx)}
                                  className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                                  title="Remove parameter row"
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

                {/* INSPECTION QUANTITY & OUTCOME SECTION */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* INSPECTION QUANTITY */}
                  <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                    <h4 className="font-bold text-xs text-purple-700 font-heading uppercase tracking-wider border-b border-purple-100 pb-1">
                      INSPECTION QUANTITY
                    </h4>
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-emerald-700 font-bold mb-1">Accepted Quantity *</label>
                        <input
                          type="number"
                          min="0"
                          value={inspectForm.accepted_qty}
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
                          value={inspectForm.rejected_qty}
                          onChange={e => setInspectForm({ ...inspectForm, rejected_qty: Number(e.target.value) })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-rose-600 font-mono text-sm"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* INSPECTION OUTCOME */}
                  <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                    <h4 className="font-bold text-xs text-purple-700 font-heading uppercase tracking-wider border-b border-purple-100 pb-1">
                      INSPECTION OUTCOME
                    </h4>
                    <div className="pt-1">
                      <label className="block text-slate-700 font-bold mb-1">Inspection Outcome *</label>
                      <select
                        value={inspectForm.inspection_outcome}
                        onChange={e => setInspectForm({ ...inspectForm, inspection_outcome: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-purple-900 text-sm"
                        required
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

                {/* REMARKS */}
                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-purple-700 font-heading uppercase tracking-wider border-b border-purple-100 pb-1">
                    REMARKS
                  </h4>
                  <textarea
                    rows="3"
                    value={inspectForm.remarks}
                    onChange={e => setInspectForm({ ...inspectForm, remarks: e.target.value })}
                    placeholder="Enter detailed inspection observation remarks..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-sans"
                  />
                </div>

                {/* ATTACHMENT */}
                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-purple-700 font-heading uppercase tracking-wider border-b border-purple-100 pb-1">
                    ATTACHMENT
                  </h4>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={inspectForm.attachment}
                      onChange={e => setInspectForm({ ...inspectForm, attachment: e.target.value })}
                      placeholder="Upload inspection report file or path..."
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
              </div>

              {/* Modal Footer Actions */}
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>

                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={e => handleSubmitInspection(e, 'Pending laboratory result')}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition cursor-pointer disabled:opacity-50 shadow-2xs"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Draft'}
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-xs transition cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Inspection'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE QUALITY INSPECTION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 font-heading">
                Delete Inspection {showDeleteModal.inspection_reference || showDeleteModal.id}
              </h3>
              <button onClick={() => setShowDeleteModal(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
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
                Are you sure you want to permanently delete Quality Inspection record <strong className="text-slate-900 font-mono">{showDeleteModal.inspection_reference || showDeleteModal.id}</strong>? 
                This action cannot be undone.
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
                  onClick={() => handleDeleteInspectionSubmit(showDeleteModal.id || showDeleteModal.inspection_reference)}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Deleting...' : 'Delete Inspection'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
