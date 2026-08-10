import React, { useState, useEffect } from 'react';
import { Send, FileCheck2, Award, Plus, CheckCircle2, TrendingDown, DollarSign, X } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

export default function RFQQuotationComparison({ setActiveTab }) {
  const [rfqs, setRfqs] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [itemsMaster, setItemsMaster] = useState([]);
  const [activeRfqId, setActiveRfqId] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [showRfqModal, setShowRfqModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  const [rfqForm, setRfqForm] = useState({
    closing_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    supplier_ids: ['sup-01', 'sup-02', 'sup-03'],
    items: [{ item_id: 'itm-01', quantity: 15 }]
  });

  const [quoteForm, setQuoteForm] = useState({
    rfq_id: '',
    supplier_id: 'sup-01',
    supplier_quote_ref: 'QT-9901',
    unit_rate: 71000,
    discount_pct: 2,
    tax_pct: 18,
    freight_allocation: 1500,
    delivery_days: 5,
    technical_compliance: 'Fully Compliant'
  });

  useEffect(() => {
    fetchRfqs();
    fetch('/api/suppliers').then(r => r.json()).then(d => d.success && setSuppliers(d.data));
    fetch('/api/items').then(r => r.json()).then(d => d.success && setItemsMaster(d.data));
  }, []);

  const fetchRfqs = async () => {
    try {
      const res = await fetch('/api/rfqs');
      const data = await res.json();
      if (data.success) {
        setRfqs(data.data);
        if (data.data.length > 0) loadComparison(data.data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadComparison = async (rfqId) => {
    setActiveRfqId(rfqId);
    try {
      const res = await fetch(`/api/rfqs/${rfqId}/comparison`);
      const data = await res.json();
      if (data.success) setComparisonData(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateRfq = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/rfqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rfqForm)
      });
      const data = await res.json();
      if (data.success) {
        setShowRfqModal(false);
        fetchRfqs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRecordQuote = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rfq_id: activeRfqId,
          supplier_id: quoteForm.supplier_id,
          supplier_quote_ref: quoteForm.supplier_quote_ref,
          items: [{ item_id: 'itm-01', offered_quantity: 15, unit_rate: quoteForm.unit_rate, discount_pct: quoteForm.discount_pct, tax_pct: quoteForm.tax_pct, freight_allocation: quoteForm.freight_allocation }]
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowQuoteModal(false);
        loadComparison(activeRfqId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGeneratePO = async (quote) => {
    try {
      const res = await fetch('/api/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quotation_id: quote.id,
          supplier_id: quote.supplier_id,
          rfq_id: activeRfqId,
          items: (quote.items || []).map(i => ({ item_id: i.item_id || 'itm-01', ordered_quantity: i.offered_quantity || 15, unit_rate: i.unit_rate || 71000 }))
        })
      });
      const data = await res.json();
      if (data.success) {
        setActiveTab('purchase-orders');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-5 border border-slate-200/80 rounded-2xl shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 font-heading flex items-center space-x-2">
            <Send className="w-5 h-5 text-purple-600" />
            <span>RFQ & Side-by-Side Quotation Comparison Matrix</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Request for quotation, recorder & automated commercial landed cost evaluation (L1 selection).</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setShowRfqModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center space-x-2 shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create New RFQ</span>
          </button>
          {activeRfqId && (
            <button 
              onClick={() => setShowQuoteModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center space-x-2 shadow-xs transition"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>+ Record Supplier Quote</span>
            </button>
          )}
        </div>
      </div>

      {/* RFQ Selector Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        {rfqs.map(r => (
          <button
            key={r.id}
            onClick={() => loadComparison(r.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition ${
              activeRfqId === r.id ? 'bg-purple-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className="font-mono">{r.rfq_number}</span>
            <StatusBadge status={r.status} />
          </button>
        ))}
      </div>

      {/* Side-by-Side Comparison Matrix */}
      {comparisonData && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 font-heading flex items-center space-x-2">
                <Award className="w-5 h-5 text-amber-500" />
                <span>Commercial Evaluation Matrix - RFQ #{comparisonData.rfq.rfq_number}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Closing Date: {comparisonData.rfq.closing_date} &bull; Delivery: {comparisonData.rfq.delivery_location}</p>
            </div>
            {comparisonData.lowestCostQuoteId && (
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3.5 py-1 rounded-full flex items-center space-x-1 shadow-2xs">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>L1 Supplier Auto-Identified</span>
              </span>
            )}
          </div>

          {/* Comparison Table */}
          {comparisonData.quotations.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs font-medium">
              No supplier quotations recorded yet for this RFQ. Click "+ Record Supplier Quote" above.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200">
                    <th className="p-3.5">Evaluation Parameter</th>
                    {comparisonData.quotations.map(q => (
                      <th key={q.id} className={`p-3.5 text-center border-l border-slate-200 ${q.id === comparisonData.lowestCostQuoteId ? 'bg-emerald-50/50' : ''}`}>
                        <div className="font-bold text-slate-900 text-xs">{q.supplier_name}</div>
                        <span className="font-mono text-[10px] text-slate-500">{q.supplier_code}</span>
                        {q.id === comparisonData.lowestCostQuoteId && (
                          <span className="block mt-1 bg-emerald-600 text-white font-bold text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                            Lowest Bidder (L1)
                          </span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  <tr>
                    <td className="p-3.5 font-semibold text-slate-700 font-sans">Quotation Ref & Date</td>
                    {comparisonData.quotations.map(q => (
                      <td key={q.id} className="p-3.5 text-center border-l border-slate-200 text-slate-600 font-sans">
                        {q.supplier_quote_ref} ({q.quotation_date})
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3.5 font-semibold text-slate-700 font-sans">Basic Rate per Unit</td>
                    {comparisonData.quotations.map(q => (
                      <td key={q.id} className="p-3.5 text-center border-l border-slate-200 font-bold text-slate-900">
                        ₹{(q.items[0]?.unit_rate || 0).toLocaleString()}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3.5 font-semibold text-slate-700 font-sans">Discount Offered</td>
                    {comparisonData.quotations.map(q => (
                      <td key={q.id} className="p-3.5 text-center border-l border-slate-200 text-rose-600 font-bold">
                        -₹{(q.discount_amount || 0).toLocaleString()} ({q.items[0]?.discount_pct || 0}%)
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3.5 font-semibold text-slate-700 font-sans">GST Tax (18%)</td>
                    {comparisonData.quotations.map(q => (
                      <td key={q.id} className="p-3.5 text-center border-l border-slate-200 text-slate-500">
                        +₹{(q.tax_amount || 0).toLocaleString()}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3.5 font-semibold text-slate-700 font-sans">Freight & Delivery Charge</td>
                    {comparisonData.quotations.map(q => (
                      <td key={q.id} className="p-3.5 text-center border-l border-slate-200 text-slate-500">
                        +₹{(q.freight_amount || 0).toLocaleString()}
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-slate-50 font-bold text-sm">
                    <td className="p-3.5 text-slate-900 font-sans">Total Landed Cost</td>
                    {comparisonData.quotations.map(q => (
                      <td key={q.id} className={`p-3.5 text-center border-l border-slate-200 ${q.id === comparisonData.lowestCostQuoteId ? 'text-emerald-700 text-base' : 'text-slate-800'}`}>
                        ₹{(q.total_landed_cost || 0).toLocaleString()}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3.5 font-semibold text-slate-700 font-sans">Delivery Lead Time</td>
                    {comparisonData.quotations.map(q => (
                      <td key={q.id} className="p-3.5 text-center border-l border-slate-200 text-emerald-700 font-bold">
                        {q.delivery_lead_time_days || 5} Days
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3.5 font-semibold text-slate-700 font-sans">Vendor Rating</td>
                    {comparisonData.quotations.map(q => (
                      <td key={q.id} className="p-3.5 text-center border-l border-slate-200 text-amber-600 font-bold">
                        ★ {q.supplier_rating || '4.8'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3.5 font-semibold text-slate-700 font-sans text-right">Award Purchase Order</td>
                    {comparisonData.quotations.map(q => (
                      <td key={q.id} className="p-3.5 text-center border-l border-slate-200">
                        <button 
                          onClick={() => handleGeneratePO(q)}
                          className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 shadow-xs transition ${
                            q.id === comparisonData.lowestCostQuoteId ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                          }`}
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>Generate PO</span>
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Record Quote Modal */}
      {showQuoteModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider font-heading">Record Supplier Quotation</h3>
              <button onClick={() => setShowQuoteModal(false)} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleRecordQuote} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Select Supplier Vendor</label>
                <select value={quoteForm.supplier_id} onChange={e => setQuoteForm({ ...quoteForm, supplier_id: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800">
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.supplier_name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Vendor Quote Ref</label>
                  <input type="text" value={quoteForm.supplier_quote_ref} onChange={e => setQuoteForm({ ...quoteForm, supplier_quote_ref: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800" />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Unit Rate (₹)</label>
                  <input type="number" value={quoteForm.unit_rate} onChange={e => setQuoteForm({ ...quoteForm, unit_rate: Number(e.target.value) })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold text-emerald-700" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Discount (%)</label>
                  <input type="number" value={quoteForm.discount_pct} onChange={e => setQuoteForm({ ...quoteForm, discount_pct: Number(e.target.value) })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800" />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Freight Charge (₹)</label>
                  <input type="number" value={quoteForm.freight_allocation} onChange={e => setQuoteForm({ ...quoteForm, freight_allocation: Number(e.target.value) })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800" />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowQuoteModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-purple-600 text-white font-bold rounded-xl shadow-xs">Record Quotation</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
