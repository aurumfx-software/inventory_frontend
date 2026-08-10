import React, { useState, useEffect } from 'react';
import { Boxes, History, Send, ArrowLeftRight, Plus, Search } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

export default function StockOperations({ initialSubTab = 'current-stock' }) {
  const [activeSubTab, setActiveSubTab] = useState(initialSubTab);
  const [items, setItems] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [issues, setIssues] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  useEffect(() => {
    if (initialSubTab) setActiveSubTab(initialSubTab);
  }, [initialSubTab]);

  const [issueForm, setIssueForm] = useState({
    item_id: 'itm-01',
    issue_qty: 1,
    department_id: 'dept-01',
    warehouse_id: 'wh-01',
    issue_type: 'Consumable issue'
  });

  const [transferForm, setTransferForm] = useState({
    source_warehouse_id: 'wh-01',
    destination_warehouse_id: 'wh-02',
    item_id: 'itm-01',
    quantity: 2,
    action: 'Dispatch'
  });

  useEffect(() => {
    fetchStockData();
  }, [activeSubTab]);

  const fetchStockData = async () => {
    try {
      const [resItems, resLedger, resIssues, resTransfers] = await Promise.all([
        fetch('/api/items').then(r => r.json()),
        fetch('/api/reports/stock-ledger').then(r => r.json()),
        fetch('/api/stock-issues').then(r => r.json()),
        fetch('/api/stock-transfers').then(r => r.json())
      ]);

      if (resItems.success) setItems(resItems.data);
      if (resLedger.success) setLedger(resLedger.data);
      if (resIssues.success) setIssues(resIssues.data);
      if (resTransfers.success) setTransfers(resTransfers.data);
    } catch (err) {
      console.error(err);
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
          items: [{ item_id: issueForm.item_id, issue_qty: Number(issueForm.issue_qty) }]
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
          items: [{ item_id: transferForm.item_id, quantity: Number(transferForm.quantity) }]
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

  return (
    <div className="space-y-6">
      {/* Navigation Sub-Tabs */}
      <div className="flex justify-between items-center bg-white p-5 border border-slate-200/80 rounded-2xl shadow-xs">
        <div className="flex space-x-2">
          <button 
            onClick={() => setActiveSubTab('current-stock')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition ${
              activeSubTab === 'current-stock' ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Current Stock Balances</span>
          </button>
          <button 
            onClick={() => setActiveSubTab('ledger')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition ${
              activeSubTab === 'ledger' ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Official Inventory Ledger</span>
          </button>
          <button 
            onClick={() => setActiveSubTab('issues')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition ${
              activeSubTab === 'issues' ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Stock Issues</span>
          </button>
          <button 
            onClick={() => setActiveSubTab('transfers')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition ${
              activeSubTab === 'transfers' ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>Two-Step Stock Transfers</span>
          </button>
        </div>

        <div className="flex space-x-2">
          <button 
            onClick={() => setShowIssueModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center space-x-1 shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Issue Stock</span>
          </button>
          <button 
            onClick={() => setShowTransferModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center space-x-1 shadow-xs transition"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>+ New Transfer</span>
          </button>
        </div>
      </div>

      {/* Sub-Tab Content */}
      {activeSubTab === 'current-stock' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200 font-bold">
                <th className="p-3.5">Item Code</th>
                <th className="p-3.5">Item Name</th>
                <th className="p-3.5 font-mono text-right">Physical On-Hand</th>
                <th className="p-3.5 font-mono text-right">Reserved Stock</th>
                <th className="p-3.5 font-mono text-right">Available Stock</th>
                <th className="p-3.5 font-mono text-right">Valuation Rate</th>
                <th className="p-3.5 font-mono text-right">Total Stock Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-3.5 font-bold text-purple-700">{item.item_code}</td>
                  <td className="p-3.5 font-sans font-semibold text-slate-800">{item.item_name}</td>
                  <td className="p-3.5 text-right font-bold text-slate-900">{item.on_hand_qty} {item.uom_symbol}</td>
                  <td className="p-3.5 text-right font-bold text-rose-600">{item.reserved_qty || 0}</td>
                  <td className="p-3.5 text-right font-bold text-emerald-700">{item.available_qty}</td>
                  <td className="p-3.5 text-right text-slate-600">₹{(item.valuation_rate || 0).toLocaleString()}</td>
                  <td className="p-3.5 text-right font-bold text-slate-900">₹{(item.stock_value || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeSubTab === 'ledger' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200 font-bold font-sans">
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Transaction Type</th>
                <th className="p-3.5">Reference No</th>
                <th className="p-3.5">Item Name</th>
                <th className="p-3.5 text-right font-mono">Qty In (+)</th>
                <th className="p-3.5 text-right font-mono">Qty Out (-)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {ledger.map(entry => (
                <tr key={entry.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-3.5 text-slate-500 font-sans">{new Date(entry.transaction_date).toLocaleDateString()}</td>
                  <td className="p-3.5 font-bold text-slate-800 font-sans">{entry.transaction_type}</td>
                  <td className="p-3.5 text-purple-700 font-bold">{entry.reference_number}</td>
                  <td className="p-3.5 text-slate-800 font-sans">{entry.item_name}</td>
                  <td className="p-3.5 text-right font-bold text-emerald-700">{entry.qty_in > 0 ? `+${entry.qty_in}` : '-'}</td>
                  <td className="p-3.5 text-right font-bold text-rose-600">{entry.qty_out > 0 ? `-${entry.qty_out}` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeSubTab === 'transfers' && (
        <div className="space-y-4">
          {transfers.map(trn => (
            <div key={trn.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex justify-between items-center hover:border-purple-200 transition">
              <div>
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-sm font-bold text-purple-700">{trn.transfer_number}</span>
                  <StatusBadge status={trn.status} />
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  From <strong className="text-purple-700">{trn.source_warehouse_name}</strong> &rarr; To <strong className="text-emerald-700">{trn.destination_warehouse_name}</strong>
                </p>
              </div>
              <span className="text-xs font-mono text-slate-500">Date: {trn.transfer_date}</span>
            </div>
          ))}
        </div>
      )}

      {/* Stock Issue Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider font-heading border-b border-slate-100 pb-2">Record Stock Issue</h3>
            <form onSubmit={handleCreateIssue} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Select Item</label>
                <select value={issueForm.item_id} onChange={e => setIssueForm({ ...issueForm, item_id: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800">
                  {items.map(i => <option key={i.id} value={i.id}>{i.item_code} - {i.item_name} (Avail: {i.available_qty})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-bold mb-1">Issue Quantity</label>
                <input type="number" min="1" value={issueForm.issue_qty} onChange={e => setIssueForm({ ...issueForm, issue_qty: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold" />
              </div>
              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowIssueModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-purple-600 text-white font-bold rounded-xl shadow-xs">Issue Stock</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider font-heading border-b border-slate-100 pb-2">Create Stock Transfer Dispatch</h3>
            <form onSubmit={handleCreateTransfer} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Select Item</label>
                <select value={transferForm.item_id} onChange={e => setTransferForm({ ...transferForm, item_id: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800">
                  {items.map(i => <option key={i.id} value={i.id}>{i.item_code} - {i.item_name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Source Warehouse</label>
                  <select value={transferForm.source_warehouse_id} onChange={e => setTransferForm({ ...transferForm, source_warehouse_id: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800">
                    <option value="wh-01">WH-MAIN (Central)</option>
                    <option value="wh-02">WH-SUB1 (Electronics)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Destination Warehouse</label>
                  <select value={transferForm.destination_warehouse_id} onChange={e => setTransferForm({ ...transferForm, destination_warehouse_id: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800">
                    <option value="wh-02">WH-SUB1 (Electronics)</option>
                    <option value="wh-01">WH-MAIN (Central)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-slate-600 font-bold mb-1">Transfer Quantity</label>
                <input type="number" value={transferForm.quantity} onChange={e => setTransferForm({ ...transferForm, quantity: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold" />
              </div>
              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowTransferModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-xs">Dispatch Transfer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
