import React, { useState, useEffect, useMemo } from 'react';
import { 
  Send, 
  FileCheck2, 
  Award, 
  Plus, 
  CheckCircle2, 
  TrendingDown, 
  DollarSign, 
  X, 
  FileText, 
  Paperclip, 
  Search, 
  Layers, 
  ShieldCheck, 
  Clock, 
  UserCheck, 
  Split, 
  History, 
  AlertCircle,
  HelpCircle,
  Check,
  Building2,
  TrendingUp,
  Download
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

export default function RFQQuotationComparison({ initialSubTab = 'matrix', setActiveTab }) {
  const [subTab, setSubTab] = useState(initialSubTab); // 'matrix' or 'management'
  const [rfqs, setRfqs] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [itemsMaster, setItemsMaster] = useState([]);
  const [activeRfqId, setActiveRfqId] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [quotationsList, setQuotationsList] = useState([]);

  // Modals
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showJustificationModal, setShowJustificationModal] = useState(false);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [selectedQuoteForDetail, setSelectedQuoteForDetail] = useState(null);
  const [selectedSupplierForJustification, setSelectedSupplierForJustification] = useState(null);

  // Buyer Decision Form States
  const [justificationRemarks, setJustificationRemarks] = useState('');
  const [splitAllocations, setSplitAllocations] = useState({});

  // Quotation Header & Item Form State
  const [quoteForm, setQuoteForm] = useState({
    rfq_id: '',
    supplier_id: '',
    supplier_quote_ref: `REF-${Math.floor(1000 + Math.random() * 9000)}`,
    quotation_date: new Date().toISOString().split('T')[0],
    valid_until: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    currency: 'INR',
    payment_terms: 'Net 30 Days',
    freight_terms: 'Freight Prepaid / FOB Destination',
    delivery_terms: 'Door Delivery',
    warranty: '1 Year Standard Manufacturer Warranty',
    attachment: null,
    remarks: '',
    items: [
      {
        item_id: '',
        offered_brand: 'Standard Brand',
        offered_quantity: 10,
        unit_rate: 5000,
        discount: 0, // Discount Pct
        tax: 18, // Tax Pct
        freight_allocation: 500,
        delivery_time: 5, // Lead time in days
        warranty: '1 Year',
        technical_compliance: 'Fully Compliant',
        supplier_remarks: ''
      }
    ]
  });

  useEffect(() => {
    // 1. Instant Cache Restoration for 0ms delay
    const cachedRfqs = localStorage.getItem('app_rfqs_master');
    const cachedQuotes = localStorage.getItem('app_quotations_master');
    const cachedSups = localStorage.getItem('app_suppliers_master');
    const cachedItems = localStorage.getItem('app_items_master');

    let initialRfqId = null;
    let loadedRfqs = [];
    let loadedQuotes = [];

    if (cachedRfqs) {
      try {
        loadedRfqs = JSON.parse(cachedRfqs);
        if (Array.isArray(loadedRfqs) && loadedRfqs.length > 0) {
          setRfqs(loadedRfqs);
          initialRfqId = loadedRfqs[0].id;
          setActiveRfqId(initialRfqId);
        }
      } catch (e) {}
    }
    if (cachedQuotes) {
      try {
        loadedQuotes = JSON.parse(cachedQuotes);
        if (Array.isArray(loadedQuotes)) setQuotationsList(loadedQuotes);
      } catch (e) {}
    }
    if (cachedSups) { try { setSuppliers(JSON.parse(cachedSups)); } catch (e) {} }
    if (cachedItems) { try { setItemsMaster(JSON.parse(cachedItems)); } catch (e) {} }

    if (initialRfqId && loadedQuotes.length > 0) {
      buildFallbackComparison(initialRfqId, loadedRfqs, loadedQuotes);
    }

    fetchInitialData(initialRfqId);
  }, []);

  const fetchInitialData = async (presetRfqId = null) => {
    try {
      const [rfqRes, supRes, itemRes, quoteRes] = await Promise.all([
        fetch('/api/rfqs').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/suppliers').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/items').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/quotations').then(r => r.json()).catch(() => ({ success: false }))
      ]);

      let fetchedRfqs = [];
      let fetchedQuotes = [];

      if (supRes.success && Array.isArray(supRes.data)) {
        setSuppliers(supRes.data);
        localStorage.setItem('app_suppliers_master', JSON.stringify(supRes.data));
      }
      if (itemRes.success && Array.isArray(itemRes.data)) {
        setItemsMaster(itemRes.data);
        localStorage.setItem('app_items_master', JSON.stringify(itemRes.data));
      }
      if (quoteRes.success && Array.isArray(quoteRes.data)) {
        fetchedQuotes = quoteRes.data;
        setQuotationsList(fetchedQuotes);
        localStorage.setItem('app_quotations_master', JSON.stringify(fetchedQuotes));
      }

      if (rfqRes.success && Array.isArray(rfqRes.data) && rfqRes.data.length > 0) {
        fetchedRfqs = rfqRes.data;
        setRfqs(fetchedRfqs);
        localStorage.setItem('app_rfqs_master', JSON.stringify(fetchedRfqs));
        
        const targetRfqId = presetRfqId || fetchedRfqs[0].id;
        setActiveRfqId(targetRfqId);
        loadComparison(targetRfqId, fetchedRfqs, fetchedQuotes);

        const defaultItemId = (itemRes.success && itemRes.data?.length > 0) ? itemRes.data[0].id : 'itm-01';
        const defaultRfq = fetchedRfqs.find(r => r.id === targetRfqId) || fetchedRfqs[0];

        const rfqItems = (defaultRfq.items && defaultRfq.items.length > 0)
          ? defaultRfq.items.map(ri => ({
              item_id: ri.item_id || defaultItemId,
              offered_brand: 'Standard Brand',
              offered_quantity: ri.quantity || 1,
              unit_rate: 5000,
              discount: 0,
              tax: 18,
              freight_allocation: 500,
              delivery_time: 5,
              warranty: '1 Year',
              technical_compliance: 'Fully Compliant',
              supplier_remarks: ''
            }))
          : [
              {
                item_id: defaultItemId,
                offered_brand: 'Standard Brand',
                offered_quantity: 10,
                unit_rate: 5000,
                discount: 0,
                tax: 18,
                freight_allocation: 500,
                delivery_time: 5,
                warranty: '1 Year',
                technical_compliance: 'Fully Compliant',
                supplier_remarks: ''
              }
            ];

        setQuoteForm(prev => ({
          ...prev,
          rfq_id: targetRfqId,
          supplier_id: (supRes.data && supRes.data[0]?.id) || 'sup-01',
          items: rfqItems
        }));
      } else {
        buildFallbackComparison(presetRfqId || 'rfq-01', rfqs, quotationsList);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
      buildFallbackComparison(presetRfqId || 'rfq-01', rfqs, quotationsList);
    }
  };

  const loadComparison = async (rfqId, customRfqs = null, customQuotes = null) => {
    setActiveRfqId(rfqId);
    try {
      const res = await fetch(`/api/rfqs/${rfqId}/comparison`);
      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
      const data = await res.json();
      if (data.success && data.rfq) {
        const formattedData = {
          rfq: data.rfq,
          quotations: data.quotations || (Array.isArray(data.data) ? data.data : []),
          lowestCostQuoteId: data.lowestCostQuoteId || (data.quotations?.[0]?.id) || null,
          rfqItems: data.rfqItems || [
            {
              item_id: 'itm-01',
              item_code: 'IT-LAP-0001',
              item_name: 'Dell Latitude 5440 Laptop',
              quantity: 20,
              unit: 'Pcs',
              previous_purchase_rate: 72000
            }
          ],
          selectionDecision: data.selectionDecision || null
        };

        setComparisonData(formattedData);

        const initialSplits = {};
        (formattedData.rfqItems || []).forEach(item => {
          initialSplits[item.item_id] = formattedData.quotations[0]?.supplier_id || '';
        });
        setSplitAllocations(initialSplits);
        return;
      }
    } catch (err) {
      console.warn('Backend comparison endpoint warning, building local matrix:', err);
    }
    buildFallbackComparison(rfqId, customRfqs, customQuotes);
  };

  const buildFallbackComparison = (rfqId, customRfqs = null, customQuotes = null) => {
    const rfqsPool = (customRfqs && customRfqs.length > 0) ? customRfqs : (rfqs.length > 0 ? rfqs : []);
    const quotesPool = (customQuotes && customQuotes.length > 0) ? customQuotes : (quotationsList.length > 0 ? quotationsList : []);

    const defaultRfq = rfqsPool.find(r => r.id === rfqId || r.rfq_number === rfqId) || rfqsPool[0] || {
      id: rfqId || 'rfq-01',
      rfq_number: 'RFQ-2026-001001',
      closing_date: new Date().toISOString().split('T')[0],
      due_date: new Date().toISOString().split('T')[0],
      delivery_location: 'Central Goods Warehouse (WH-MAIN)',
      currency: 'INR',
      buyer: 'Sarah Jenkins (Purchase Manager)'
    };

    let targetQuotes = quotesPool.filter(q => q.rfq_id === defaultRfq.id || q.rfq_id === rfqId || q.rfq_number === defaultRfq.rfq_number);
    if (targetQuotes.length === 0 && quotesPool.length > 0) {
      targetQuotes = quotesPool;
    }

    let lowestId = null;
    if (targetQuotes.length > 0) {
      const sorted = [...targetQuotes].sort((a, b) => Number(a.total_landed_cost || 0) - Number(b.total_landed_cost || 0));
      lowestId = sorted[0].id;
    }

    const rfqItems = (defaultRfq.items && defaultRfq.items.length > 0)
      ? defaultRfq.items.map((it, idx) => ({
          item_id: it.item_id || `itm-${idx+1}`,
          item_code: it.item_code_snapshot || it.item_code || `SKU-00${idx+1}`,
          item_name: it.item_name_snapshot || it.item_name || 'Procurement Material Item',
          quantity: it.quantity || 10,
          unit: it.unit || 'Pcs',
          previous_purchase_rate: it.unit_rate || 50000
        }))
      : [
          { item_id: 'itm-01', item_code: 'SKU-LAP-001', item_name: 'Dell Latitude Core i7 Laptop', quantity: 10, unit: 'Pcs', previous_purchase_rate: 65000 }
        ];

    const formattedData = {
      rfq: defaultRfq,
      quotations: targetQuotes,
      lowestCostQuoteId: lowestId,
      rfqItems: rfqItems,
      selectionDecision: null
    };

    setComparisonData(formattedData);

    const initialSplits = {};
    rfqItems.forEach(item => {
      initialSplits[item.item_id] = targetQuotes[0]?.supplier_id || '';
    });
    setSplitAllocations(initialSplits);
  };

  // Live Backend Math Calculation Preview for Form Modal
  const calculatedPreview = useMemo(() => {
    let gross = 0;
    let discountAmt = 0;
    let taxable = 0;
    let taxAmt = 0;
    let freight = 0;
    let totalLanded = 0;

    (quoteForm.items || []).forEach(line => {
      const q = Number(line.offered_quantity || 1);
      const r = Number(line.unit_rate || 0);
      const dPct = Number(line.discount || 0);
      const tPct = Number(line.tax || 18);
      const f = Number(line.freight_allocation || 0);

      const lineGross = q * r;
      const lineDiscAmt = (lineGross * dPct) / 100;
      const lineTaxable = lineGross - lineDiscAmt;
      const lineTaxAmt = (lineTaxable * tPct) / 100;
      const lineTotal = lineTaxable + lineTaxAmt + f;

      gross += lineGross;
      discountAmt += lineDiscAmt;
      taxable += lineTaxable;
      taxAmt += lineTaxAmt;
      freight += f;
      totalLanded += lineTotal;
    });

    return { gross, discountAmt, taxable, taxAmt, freight, totalLanded };
  }, [quoteForm.items]);

  // Handle Form Input Changes
  const handleAddItemLine = () => {
    setQuoteForm(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          item_id: itemsMaster[0]?.id || '',
          offered_brand: 'Standard Brand',
          offered_quantity: 1,
          unit_rate: 1000,
          discount: 0,
          tax: 18,
          freight_allocation: 0,
          delivery_time: 5,
          warranty: '1 Year',
          technical_compliance: 'Fully Compliant',
          supplier_remarks: ''
        }
      ]
    }));
  };

  const handleRemoveItemLine = (idx) => {
    setQuoteForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx)
    }));
  };

  // Submit Quotation (Backend Calculation Enforcement)
  const handleRecordQuote = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quoteForm)
      });
      const data = await res.json();
      if (data.success) {
        setShowQuoteModal(false);
        fetchInitialData();
        if (activeRfqId) loadComparison(activeRfqId);
      }
    } catch (err) {
      console.error('Error submitting quotation:', err);
    }
  };

  // Buyer Decision Actions
  const handleSelectLowestSupplier = async () => {
    if (!comparisonData?.lowestCostQuoteId) return;
    const l1Quote = comparisonData.quotations.find(q => q.id === comparisonData.lowestCostQuoteId);
    if (!l1Quote) return;

    if (!window.confirm(`Confirm awarding contract to Lowest-Cost (L1) Supplier: ${l1Quote.supplier_name}?`)) return;

    try {
      const res = await fetch(`/api/quotation-comparisons/${activeRfqId}/select`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selection_type: 'Lowest Cost (L1)',
          selected_supplier_id: l1Quote.supplier_id,
          selected_quotation_id: l1Quote.id,
          justification_remarks: 'Auto-awarded to L1 Lowest Landed Cost Bidder.'
        })
      });
      const data = await res.json();
      if (data.success) loadComparison(activeRfqId);
    } catch (err) {
      console.error('Failed to submit L1 selection:', err);
    }
  };

  const handleConfirmNonLowestSelection = async () => {
    if (!selectedSupplierForJustification || !justificationRemarks.trim()) return;

    try {
      const res = await fetch(`/api/quotation-comparisons/${activeRfqId}/select`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selection_type: 'Non-Lowest with Justification',
          selected_supplier_id: selectedSupplierForJustification.supplier_id,
          justification_remarks: justificationRemarks
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowJustificationModal(false);
        setJustificationRemarks('');
        loadComparison(activeRfqId);
      }
    } catch (err) {
      console.error('Failed to submit non-lowest selection:', err);
    }
  };

  const handleConfirmSplitSelection = async () => {
    try {
      const res = await fetch(`/api/quotation-comparisons/${activeRfqId}/select`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selection_type: 'Split Items',
          item_allocations: splitAllocations,
          justification_remarks: 'Line items split across multiple suppliers for optimal pricing and capacity.'
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowSplitModal(false);
        loadComparison(activeRfqId);
      }
    } catch (err) {
      console.error('Failed to submit split selection:', err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-5 border border-slate-200/80 rounded-2xl shadow-2xs gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 font-heading flex items-center space-x-2">
            <Award className="w-5 h-5 text-purple-600" />
            <span>Quotation Management & Side-by-Side Comparison Matrix</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Record supplier prices, commercial terms, backend math validation & side-by-side evaluation (L1, Split & Justified awards).
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          {/* Sub-Tab Selector */}
          <div className="bg-slate-100 p-1 rounded-xl flex text-xs font-bold w-full md:w-auto">
            <button
              onClick={() => setSubTab('matrix')}
              className={`px-3.5 py-1.5 rounded-lg transition ${
                subTab === 'matrix' ? 'bg-purple-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Comparison Matrix
            </button>
            <button
              onClick={() => setSubTab('management')}
              className={`px-3.5 py-1.5 rounded-lg transition ${
                subTab === 'management' ? 'bg-purple-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Record & Manage Quotations
            </button>
          </div>

          <button
            onClick={() => setShowQuoteModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center space-x-1.5 shadow-2xs transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Record Supplier Quote</span>
          </button>
        </div>
      </div>

      {/* BACKEND CALCULATIONS NOTICE */}
      <div className="bg-emerald-50/80 border border-emerald-200 p-3 rounded-2xl flex items-center space-x-3 text-xs text-emerald-950 shadow-2xs">
        <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
        <div>
          <strong className="font-bold block">Backend Math Calculation Enforcement:</strong>
          <span>Gross Amount, Discount Amount, Taxable Amount, Tax Amount, Freight Allocation, and Total Landed Cost are recalculated and validated on the backend to prevent pricing manipulation.</span>
        </div>
      </div>

      {/* SUB-TAB 1: COMPARISON MATRIX */}
      {subTab === 'matrix' && (
        <div className="space-y-6">
          
          {/* RFQ SELECTOR BAR */}
          <div className="bg-white p-4 border border-slate-200/80 rounded-2xl shadow-2xs space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Select Request for Quotation (RFQ) to Compare Received Offers:
            </label>
            <div className="flex flex-wrap gap-2">
              {rfqs.map(r => (
                <button
                  key={r.id}
                  onClick={() => loadComparison(r.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition border ${
                    activeRfqId === r.id 
                      ? 'bg-purple-600 text-white border-purple-600 shadow-2xs' 
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="font-mono">{r.rfq_number}</span>
                  <span className="text-[11px] opacity-80">({r.buyer})</span>
                  <StatusBadge status={r.status} />
                </button>
              ))}
            </div>
          </div>

          {/* COMPARATIVE MATRIX CONTAINER */}
          {comparisonData && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-6">
              
              {/* Matrix Header & Buyer Selection Action Bar */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-100 pb-4 gap-3">
                <div>
                  <h3 className="font-bold text-base text-slate-900 font-heading flex items-center space-x-2">
                    <FileCheck2 className="w-5 h-5 text-purple-600" />
                    <span>Commercial Comparison Matrix — RFQ #{comparisonData.rfq.rfq_number}</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Closing Date: {comparisonData.rfq.closing_date} &bull; Delivery: {comparisonData.rfq.delivery_location} &bull; Currency: {comparisonData.rfq.currency || 'INR'}
                  </p>
                </div>

                {/* Buyer Award Actions */}
                {comparisonData.quotations.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleSelectLowestSupplier}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center space-x-1.5 shadow-2xs transition"
                      title="Award 100% of order to lowest cost L1 supplier"
                    >
                      <TrendingDown className="w-3.5 h-3.5" />
                      <span>Award to L1 (Lowest Cost)</span>
                    </button>

                    <button
                      onClick={() => setShowSplitModal(true)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center space-x-1.5 shadow-2xs transition"
                      title="Split line items among multiple suppliers"
                    >
                      <Split className="w-3.5 h-3.5" />
                      <span>Split Items</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Selection Decision Status Banner if already recorded */}
              {comparisonData.selectionDecision && (
                <div className="bg-indigo-50 border border-indigo-200 p-3.5 rounded-2xl flex items-center justify-between text-xs text-indigo-950">
                  <div className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <strong className="font-bold block">Buyer Selection Approved: {comparisonData.selectionDecision.selection_type}</strong>
                      <span className="text-[11px] text-indigo-800">{comparisonData.selectionDecision.justification_remarks}</span>
                    </div>
                  </div>
                  <span className="bg-indigo-600 text-white font-bold px-2.5 py-1 rounded-lg text-[10px] uppercase tracking-wider">
                    Award Confirmed
                  </span>
                </div>
              )}

              {/* SIDE-BY-SIDE MATRIX TABLE */}
              {comparisonData.quotations.length === 0 ? (
                <div className="p-12 text-center text-slate-400 space-y-2">
                  <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-600">No supplier quotations recorded yet for this RFQ.</p>
                  <p className="text-[11px]">Click "+ Record Supplier Quote" above to record received supplier prices & commercial terms.</p>
                </div>
              ) : (
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-xs text-left border-collapse min-w-[1050px]">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold border-b border-slate-200">
                        <th className="p-3.5 min-w-[200px] whitespace-nowrap">Comparison Criteria</th>
                        <th className="p-3.5 text-center bg-slate-200/60 min-w-[140px] whitespace-nowrap">
                          Previous PO Benchmark
                        </th>
                        {comparisonData.quotations.map(q => {
                          const isL1 = q.id === comparisonData.lowestCostQuoteId;
                          return (
                            <th 
                              key={q.id} 
                              className={`p-3.5 text-center border-l border-slate-200 min-w-[210px] ${
                                isL1 ? 'bg-emerald-50/90 border-t-2 border-t-emerald-600' : 'bg-slate-50'
                              }`}
                            >
                              <div className="font-bold text-slate-900 text-xs flex items-center justify-center space-x-1">
                                <span>{q.supplier_name}</span>
                                <span className="text-amber-500 font-mono text-[10px]">★{q.supplier_rating}</span>
                              </div>
                              <span className="font-mono text-[10px] text-slate-400 block">{q.supplier_code}</span>
                              
                              {isL1 && (
                                <span className="inline-block mt-1 bg-emerald-600 text-white font-bold text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                                  L1 Lowest Cost
                                </span>
                              )}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-slate-800">
                      
                      {/* HEADER LEVEL CRITERIA */}
                      <tr className="bg-slate-50/50 font-sans font-bold text-slate-900">
                        <td colSpan={2 + comparisonData.quotations.length} className="p-2.5 uppercase text-[10px] tracking-wider text-purple-700 border-b border-slate-200">
                          1. Header & Commercial Terms Overview
                        </td>
                      </tr>

                      <tr>
                        <td className="p-3.5 font-bold font-sans text-slate-800">Quote Ref & Date</td>
                        <td className="p-3.5 text-center bg-slate-100/50 text-slate-400 font-sans">N/A</td>
                        {comparisonData.quotations.map(q => (
                          <td key={q.id} className="p-3.5 text-center border-l border-slate-200 font-sans">
                            <span className="font-bold text-purple-700 block">{q.supplier_quote_ref}</span>
                            <span className="text-[11px] text-slate-400">{q.quotation_date} (Valid to {q.valid_until})</span>
                          </td>
                        ))}
                      </tr>

                      <tr>
                        <td className="p-3.5 font-bold font-sans text-slate-800">Basic Price (Gross)</td>
                        <td className="p-3.5 text-center bg-slate-100/50 text-slate-400">Baseline</td>
                        {comparisonData.quotations.map(q => (
                          <td key={q.id} className="p-3.5 text-center border-l border-slate-200 font-bold">
                            ₹{(q.gross_amount || 0).toLocaleString()}
                          </td>
                        ))}
                      </tr>

                      <tr>
                        <td className="p-3.5 font-bold font-sans text-slate-800">Discount (-₹)</td>
                        <td className="p-3.5 text-center bg-slate-100/50 text-slate-400">-</td>
                        {comparisonData.quotations.map(q => (
                          <td key={q.id} className="p-3.5 text-center border-l border-slate-200 text-rose-600 font-bold">
                            -₹{(q.discount_amount || 0).toLocaleString()}
                          </td>
                        ))}
                      </tr>

                      <tr>
                        <td className="p-3.5 font-bold font-sans text-slate-800">GST Tax (+₹)</td>
                        <td className="p-3.5 text-center bg-slate-100/50 text-slate-400">-</td>
                        {comparisonData.quotations.map(q => (
                          <td key={q.id} className="p-3.5 text-center border-l border-slate-200 text-slate-600">
                            +₹{(q.tax_amount || 0).toLocaleString()}
                          </td>
                        ))}
                      </tr>

                      <tr>
                        <td className="p-3.5 font-bold font-sans text-slate-800">Freight Allocation (+₹)</td>
                        <td className="p-3.5 text-center bg-slate-100/50 text-slate-400">-</td>
                        {comparisonData.quotations.map(q => (
                          <td key={q.id} className="p-3.5 text-center border-l border-slate-200 text-slate-600">
                            +₹{(q.freight_amount || 0).toLocaleString()}
                          </td>
                        ))}
                      </tr>

                      {/* TOTAL LANDED COST ROW */}
                      <tr className="bg-slate-100/80 font-bold text-sm">
                        <td className="p-3.5 text-slate-900 font-sans">Total Landed Cost</td>
                        <td className="p-3.5 text-center bg-slate-200 text-slate-500 font-sans text-xs">Benchmark</td>
                        {comparisonData.quotations.map(q => {
                          const isL1 = q.id === comparisonData.lowestCostQuoteId;
                          return (
                            <td key={q.id} className={`p-3.5 text-center border-l border-slate-200 ${isL1 ? 'text-emerald-700 bg-emerald-50 font-extrabold text-base' : 'text-slate-900'}`}>
                              ₹{(q.total_landed_cost || 0).toLocaleString()}
                            </td>
                          );
                        })}
                      </tr>

                      <tr>
                        <td className="p-3.5 font-bold font-sans text-slate-800">Delivery Lead Time</td>
                        <td className="p-3.5 text-center bg-slate-100/50 text-slate-400 font-sans">Standard</td>
                        {comparisonData.quotations.map(q => (
                          <td key={q.id} className="p-3.5 text-center border-l border-slate-200 text-emerald-700 font-bold font-sans">
                            {q.items?.[0]?.delivery_days || 5} Days
                          </td>
                        ))}
                      </tr>

                      <tr>
                        <td className="p-3.5 font-bold font-sans text-slate-800">Payment Terms</td>
                        <td className="p-3.5 text-center bg-slate-100/50 text-slate-400 font-sans">Net 30</td>
                        {comparisonData.quotations.map(q => (
                          <td key={q.id} className="p-3.5 text-center border-l border-slate-200 text-slate-700 font-sans">
                            {q.payment_terms || 'Net 30 Days'}
                          </td>
                        ))}
                      </tr>

                      <tr>
                        <td className="p-3.5 font-bold font-sans text-slate-800">Warranty Terms</td>
                        <td className="p-3.5 text-center bg-slate-100/50 text-slate-400 font-sans">1 Year</td>
                        {comparisonData.quotations.map(q => (
                          <td key={q.id} className="p-3.5 text-center border-l border-slate-200 text-slate-700 font-sans">
                            {q.warranty || '1 Year Standard'}
                          </td>
                        ))}
                      </tr>

                      {/* ITEM LEVEL COMPARISON */}
                      <tr className="bg-slate-50/50 font-sans font-bold text-slate-900">
                        <td colSpan={2 + comparisonData.quotations.length} className="p-2.5 uppercase text-[10px] tracking-wider text-purple-700 border-b border-slate-200 border-t border-slate-200">
                          2. Line Item Level Commercial & Technical Breakdown
                        </td>
                      </tr>

                      {(comparisonData.rfqItems || []).map((rfqItem, iIdx) => (
                        <React.Fragment key={iIdx}>
                          <tr className="bg-purple-50/40 font-bold">
                            <td className="p-3 font-sans text-purple-950 flex items-center space-x-2">
                              <span className="bg-purple-600 text-white font-mono text-[9px] px-1.5 py-0.5 rounded">Line #{iIdx + 1}</span>
                              <span>{rfqItem.item_code} - {rfqItem.item_name} ({rfqItem.quantity} {rfqItem.unit || 'Pcs'})</span>
                            </td>
                            <td className="p-3 text-center bg-slate-200/80 font-bold text-slate-800">
                              ₹{(rfqItem.previous_purchase_rate || 0).toLocaleString()} /unit
                            </td>
                            {comparisonData.quotations.map(q => {
                              const line = (q.items || []).find(qi => qi.item_id === rfqItem.item_id) || q.items?.[iIdx] || {};
                              const rate = Number(line.unit_rate || 0);
                              const prevRate = Number(rfqItem.previous_purchase_rate || rate);
                              const diffPct = prevRate > 0 ? (((rate - prevRate) / prevRate) * 100).toFixed(1) : 0;

                              return (
                                <td key={q.id} className="p-3 text-center border-l border-slate-200">
                                  <span className="font-bold text-slate-900 block">₹{rate.toLocaleString()} /unit</span>
                                  <span className={`text-[10px] font-bold ${diffPct <= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                                    {diffPct <= 0 ? `↓ ${Math.abs(diffPct)}% vs Prev` : `↑ +${diffPct}% vs Prev`}
                                  </span>
                                </td>
                              );
                            })}
                          </tr>

                          <tr>
                            <td className="p-2.5 pl-6 font-sans text-slate-600 text-[11px]">Offered Brand & Compliance</td>
                            <td className="p-2.5 text-center bg-slate-100/50 text-slate-400 font-sans text-[11px]">Baseline</td>
                            {comparisonData.quotations.map(q => {
                              const line = (q.items || []).find(qi => qi.item_id === rfqItem.item_id) || q.items?.[iIdx] || {};
                              return (
                                <td key={q.id} className="p-2.5 text-center border-l border-slate-200 font-sans text-[11px]">
                                  <span className="font-bold text-slate-800 block">{line.offered_brand || 'Standard'}</span>
                                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded text-[9px] font-bold inline-block mt-0.5">
                                    {line.technical_compliance || 'Fully Compliant'}
                                  </span>
                                </td>
                              );
                            })}
                          </tr>
                        </React.Fragment>
                      ))}

                      {/* SELECTION ACTIONS ROW */}
                      <tr className="bg-slate-50 font-sans font-bold">
                        <td className="p-4 text-slate-900">Award Supplier Contract</td>
                        <td className="p-4 text-center bg-slate-200 text-slate-400 text-[11px]">N/A</td>
                        {comparisonData.quotations.map(q => {
                          const isL1 = q.id === comparisonData.lowestCostQuoteId;
                          return (
                            <td key={q.id} className="p-4 text-center border-l border-slate-200">
                              {isL1 ? (
                                <button
                                  onClick={handleSelectLowestSupplier}
                                  className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-2xs transition"
                                >
                                  Award to L1 Supplier
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setSelectedSupplierForJustification(q);
                                    setShowJustificationModal(true);
                                  }}
                                  className="w-full py-2 px-3 bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 font-bold text-xs rounded-xl border border-slate-300 transition"
                                >
                                  Award with Justification
                                </button>
                              )}
                            </td>
                          );
                        })}
                      </tr>

                    </tbody>
                  </table>
                </div>
              )}

            </div>
          )}

        </div>
      )}

      {/* SUB-TAB 2: QUOTATION MANAGEMENT */}
      {subTab === 'management' && (
        <div className="space-y-6">
          
          {/* QUOTATIONS RECORDED TABLE */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center space-x-2">
                <FileText className="w-4 h-4 text-purple-600" />
                <span>All Recorded Supplier Quotations ({quotationsList.length})</span>
              </h3>
            </div>

            {quotationsList.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs font-medium">
                No quotations recorded yet. Click "+ Record Supplier Quote" above.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Quote Number & Ref</th>
                      <th className="py-3 px-4">Supplier Vendor</th>
                      <th className="py-3 px-4">RFQ Ref</th>
                      <th className="py-3 px-4">Revision</th>
                      <th className="py-3 px-4">Valid Until</th>
                      <th className="py-3 px-4">Total Landed Cost</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white font-mono">
                    {quotationsList.map(q => (
                      <tr key={q.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3.5 px-4">
                          <strong className="font-bold text-purple-700 block">{q.quotation_number}</strong>
                          <span className="text-[11px] text-slate-500">Ref: {q.supplier_quote_ref}</span>
                        </td>

                        <td className="py-3.5 px-4 font-sans font-bold text-slate-900">
                          {q.supplier_name}
                        </td>

                        <td className="py-3.5 px-4 font-bold text-slate-700">
                          {q.rfq_number}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="bg-purple-50 text-purple-700 border border-purple-200 font-bold px-2 py-0.5 rounded text-[10px]">
                            {q.revision_number > 1 ? `Rev #${q.revision_number}` : 'Original (Rev 1)'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-slate-600">
                          {q.valid_until}
                        </td>

                        <td className="py-3.5 px-4 font-bold text-emerald-700 text-sm">
                          ₹{(q.total_landed_cost || 0).toLocaleString()}
                        </td>

                        <td className="py-3.5 px-4 text-right font-sans">
                          <button
                            onClick={() => {
                              setSelectedQuoteForDetail(q);
                              setShowDetailModal(true);
                            }}
                            className="bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 font-bold px-3 py-1.5 rounded-lg border border-slate-200 transition text-[11px]"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RECORD QUOTATION MODAL */}
      {showQuoteModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-bold text-sm uppercase tracking-wider font-heading flex items-center space-x-2">
                  <FileCheck2 className="w-4 h-4 text-purple-400" />
                  <span>Record Supplier Quotation & Commercial Terms</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Calculations performed automatically on backend to ensure zero price manipulation.
                </p>
              </div>
              <button onClick={() => setShowQuoteModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordQuote} className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
              
              {/* SECTION 1: HEADER FIELDS */}
              <div className="bg-slate-50/80 border border-slate-200 p-4 rounded-2xl space-y-4">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-2">
                  1. Quotation Header Fields
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">RFQ Reference *</label>
                    <select
                      value={quoteForm.rfq_id || (rfqs.length > 0 ? rfqs[0].id : 'rfq-1')}
                      onChange={e => {
                        const selRfqId = e.target.value;
                        const selRfq = rfqs.find(r => r.id === selRfqId || r.rfq_number === selRfqId);
                        setQuoteForm(prev => ({
                          ...prev,
                          rfq_id: selRfqId,
                          items: (selRfq?.items && selRfq.items.length > 0)
                            ? selRfq.items.map(ri => ({
                                item_id: ri.item_id || 'itm-01',
                                offered_brand: 'Standard Brand',
                                offered_quantity: ri.quantity || 1,
                                unit_rate: 5000,
                                discount: 0,
                                tax: 18,
                                freight_allocation: 500,
                                delivery_time: 5,
                                warranty: '1 Year',
                                technical_compliance: 'Fully Compliant',
                                supplier_remarks: ''
                              }))
                            : prev.items
                        }));
                      }}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold text-purple-700"
                      required
                    >
                      <option value="">-- Select RFQ Reference --</option>
                      {rfqs.map(r => (
                        <option key={r.id} value={r.id}>
                          {r.rfq_number} ({r.buyer || 'Buyer'})
                        </option>
                      ))}
                      {rfqs.length === 0 && (
                        <option value="rfq-1">RFQ-2026-001001 (Purchase Officer)</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Supplier Vendor *</label>
                    <select
                      value={quoteForm.supplier_id}
                      onChange={e => setQuoteForm({ ...quoteForm, supplier_id: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                    >
                      {suppliers.map(s => (
                        <option key={s.id} value={s.id}>{s.supplier_name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Supplier Quote Ref *</label>
                    <input
                      type="text"
                      value={quoteForm.supplier_quote_ref}
                      onChange={e => setQuoteForm({ ...quoteForm, supplier_quote_ref: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Quotation Date *</label>
                    <input
                      type="date"
                      value={quoteForm.quotation_date}
                      onChange={e => setQuoteForm({ ...quoteForm, quotation_date: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Valid Until Date *</label>
                    <input
                      type="date"
                      value={quoteForm.valid_until}
                      onChange={e => setQuoteForm({ ...quoteForm, valid_until: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Currency *</label>
                    <select
                      value={quoteForm.currency}
                      onChange={e => setQuoteForm({ ...quoteForm, currency: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Payment Terms</label>
                    <input
                      type="text"
                      value={quoteForm.payment_terms}
                      onChange={e => setQuoteForm({ ...quoteForm, payment_terms: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Freight Terms</label>
                    <input
                      type="text"
                      value={quoteForm.freight_terms}
                      onChange={e => setQuoteForm({ ...quoteForm, freight_terms: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Delivery Terms</label>
                    <input
                      type="text"
                      value={quoteForm.delivery_terms}
                      onChange={e => setQuoteForm({ ...quoteForm, delivery_terms: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Header Warranty & Commercial Notes</label>
                  <input
                    type="text"
                    value={quoteForm.warranty}
                    onChange={e => setQuoteForm({ ...quoteForm, warranty: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              {/* SECTION 2: ITEM FIELDS & LINE COSTS */}
              <div className="bg-slate-50/80 border border-slate-200 p-4 rounded-2xl space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                    2. Quotation Item Line Pricing & Technical Compliance
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddItemLine}
                    className="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold px-3 py-1 rounded-xl flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item Line</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {quoteForm.items.map((line, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-3 shadow-2xs">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <span className="bg-purple-600 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Line #{idx + 1}
                        </span>
                        {quoteForm.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItemLine(idx)}
                            className="text-rose-600 hover:text-rose-800 text-[11px] font-bold"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="md:col-span-2">
                          <label className="block text-slate-700 font-bold mb-1">RFQ Item Selection *</label>
                          <select
                            value={line.item_id || (itemsMaster.length > 0 ? itemsMaster[0].id : 'itm-01')}
                            onChange={e => {
                              const updated = [...quoteForm.items];
                              updated[idx].item_id = e.target.value;
                              setQuoteForm({ ...quoteForm, items: updated });
                            }}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                            required
                          >
                            <option value="">-- Choose Item --</option>
                            {itemsMaster.map(i => (
                              <option key={i.id} value={i.id}>{i.item_code} - {i.item_name}</option>
                            ))}
                            {itemsMaster.length === 0 && (
                              <option value="itm-01">IT-LAP-0001 - Dell Latitude 5440 Laptop</option>
                            )}
                          </select>
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Offered Brand</label>
                          <input
                            type="text"
                            value={line.offered_brand}
                            onChange={e => {
                              const updated = [...quoteForm.items];
                              updated[idx].offered_brand = e.target.value;
                              setQuoteForm({ ...quoteForm, items: updated });
                            }}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Offered Qty *</label>
                          <input
                            type="number"
                            min="1"
                            value={line.offered_quantity}
                            onChange={e => {
                              const updated = [...quoteForm.items];
                              updated[idx].offered_quantity = Number(e.target.value);
                              setQuoteForm({ ...quoteForm, items: updated });
                            }}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Unit Rate (₹) *</label>
                          <input
                            type="number"
                            min="0"
                            value={line.unit_rate}
                            onChange={e => {
                              const updated = [...quoteForm.items];
                              updated[idx].unit_rate = Number(e.target.value);
                              setQuoteForm({ ...quoteForm, items: updated });
                            }}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-emerald-700"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Discount (%)</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={line.discount}
                            onChange={e => {
                              const updated = [...quoteForm.items];
                              updated[idx].discount = Number(e.target.value);
                              setQuoteForm({ ...quoteForm, items: updated });
                            }}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Tax / GST (%)</label>
                          <input
                            type="number"
                            value={line.tax}
                            onChange={e => {
                              const updated = [...quoteForm.items];
                              updated[idx].tax = Number(e.target.value);
                              setQuoteForm({ ...quoteForm, items: updated });
                            }}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Freight Allocation (₹)</label>
                          <input
                            type="number"
                            value={line.freight_allocation}
                            onChange={e => {
                              const updated = [...quoteForm.items];
                              updated[idx].freight_allocation = Number(e.target.value);
                              setQuoteForm({ ...quoteForm, items: updated });
                            }}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Delivery Time (Days)</label>
                          <input
                            type="number"
                            value={line.delivery_time}
                            onChange={e => {
                              const updated = [...quoteForm.items];
                              updated[idx].delivery_time = Number(e.target.value);
                              setQuoteForm({ ...quoteForm, items: updated });
                            }}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Technical Compliance</label>
                          <select
                            value={line.technical_compliance}
                            onChange={e => {
                              const updated = [...quoteForm.items];
                              updated[idx].technical_compliance = e.target.value;
                              setQuoteForm({ ...quoteForm, items: updated });
                            }}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                          >
                            <option value="Fully Compliant">Fully Compliant</option>
                            <option value="Partially Compliant">Partially Compliant</option>
                            <option value="Non-Compliant">Non-Compliant</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* LIVE BACKEND MATH CALCULATION PREVIEW */}
              <div className="bg-purple-950 text-white p-4 rounded-2xl space-y-2 font-mono text-xs shadow-lg">
                <div className="flex justify-between border-b border-purple-800 pb-2">
                  <span className="text-purple-300 uppercase font-sans font-bold">Calculation Breakdown Preview (Enforced on Backend)</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-1 text-[11px]">
                  <div>
                    <span className="text-purple-400 block text-[10px]">Gross Amount</span>
                    <span className="font-bold text-white">₹{calculatedPreview.gross.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-purple-400 block text-[10px]">Discount Amount</span>
                    <span className="font-bold text-rose-300">-₹{calculatedPreview.discountAmt.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-purple-400 block text-[10px]">Taxable Amount</span>
                    <span className="font-bold text-purple-200">₹{calculatedPreview.taxable.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-purple-400 block text-[10px]">Tax Amount (GST)</span>
                    <span className="font-bold text-purple-200">+₹{calculatedPreview.taxAmt.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-purple-400 block text-[10px]">Freight Allocation</span>
                    <span className="font-bold text-purple-200">+₹{calculatedPreview.freight.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-emerald-400 block text-[10px] font-bold uppercase">Total Landed Cost</span>
                    <span className="font-extrabold text-emerald-300 text-sm">₹{calculatedPreview.totalLanded.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQuoteModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-2xs"
                >
                  Record Quotation (Backend Calculation)
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* NON-LOWEST JUSTIFICATION MODAL */}
      {showJustificationModal && selectedSupplierForJustification && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider font-heading">
                Award to Non-Lowest Supplier
              </h3>
              <button onClick={() => setShowJustificationModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-amber-950 space-y-1">
                <strong className="font-bold block">Non-L1 Selection Alert:</strong>
                <span>You are awarding to {selectedSupplierForJustification.supplier_name} who is not the lowest landed cost bidder. Procurement audit policy requires mandatory justification.</span>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Mandatory Buyer Justification Remarks *</label>
                <textarea
                  rows="3"
                  value={justificationRemarks}
                  onChange={e => setJustificationRemarks(e.target.value)}
                  placeholder="e.g. Faster delivery lead time (2 days vs 10 days), higher technical compliance score, or superior warranty terms."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  onClick={() => setShowJustificationModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  disabled={!justificationRemarks.trim()}
                  onClick={handleConfirmNonLowestSelection}
                  className="px-4 py-2 bg-purple-600 disabled:opacity-50 hover:bg-purple-700 text-white font-bold rounded-xl shadow-2xs"
                >
                  Confirm Award with Justification
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SPLIT ITEMS ALLOCATION MODAL */}
      {showSplitModal && comparisonData && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider font-heading flex items-center space-x-2">
                <Split className="w-4 h-4 text-indigo-600" />
                <span>Split Line Items Among Multiple Suppliers</span>
              </h3>
              <button onClick={() => setShowSplitModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-slate-600">
                Assign individual item lines to different suppliers based on item-level L1 pricing or vendor capacity.
              </p>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {(comparisonData.rfqItems || []).map(ri => (
                  <div key={ri.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center">
                    <div>
                      <strong className="font-bold text-slate-900 block">{ri.item_code} - {ri.item_name}</strong>
                      <span className="text-[11px] text-slate-500 font-mono">Qty: {ri.quantity} {ri.unit || 'Pcs'}</span>
                    </div>

                    <select
                      value={splitAllocations[ri.item_id] || ''}
                      onChange={e => setSplitAllocations({ ...splitAllocations, [ri.item_id]: e.target.value })}
                      className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 font-bold text-purple-700 text-xs"
                    >
                      {comparisonData.quotations.map(q => (
                        <option key={q.id} value={q.supplier_id}>{q.supplier_name}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  onClick={() => setShowSplitModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSplitSelection}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-2xs"
                >
                  Confirm Split Award
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* QUOTATION DETAIL MODAL */}
      {showDetailModal && selectedQuoteForDetail && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider font-heading">
                  Supplier Quotation Details
                </h3>
                <p className="text-purple-700 font-mono font-bold">{selectedQuoteForDetail.quotation_number} (Ref: {selectedQuoteForDetail.supplier_quote_ref})</p>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Header Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 font-mono">
              <div>
                <span className="text-slate-400 text-[10px] font-bold block uppercase font-sans">Supplier</span>
                <span className="font-bold text-slate-900">{selectedQuoteForDetail.supplier_name}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] font-bold block uppercase font-sans">RFQ Ref</span>
                <span className="font-bold text-purple-700">{selectedQuoteForDetail.rfq_number}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] font-bold block uppercase font-sans">Quote Date</span>
                <span className="font-bold text-slate-800">{selectedQuoteForDetail.quotation_date}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] font-bold block uppercase font-sans">Valid Until</span>
                <span className="font-bold text-rose-700">{selectedQuoteForDetail.valid_until}</span>
              </div>
            </div>

            {/* Total Landed Cost Card */}
            <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl flex justify-between items-center">
              <div>
                <span className="text-purple-700 font-bold block uppercase text-[10px]">Total Landed Cost (Backend Validated)</span>
                <span className="text-2xl font-extrabold text-purple-950 font-mono">₹{(selectedQuoteForDetail.total_landed_cost || 0).toLocaleString()}</span>
              </div>
              <span className="bg-purple-600 text-white font-bold px-3 py-1 rounded-full text-xs font-mono">
                {selectedQuoteForDetail.currency || 'INR'}
              </span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
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
