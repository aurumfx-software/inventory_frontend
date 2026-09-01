import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, Save, Building, Hash, Box, ShoppingCart, 
  CheckSquare, Bell, Percent, RefreshCw, ShieldAlert, CheckCircle2
} from 'lucide-react';

export default function Settings({ initialSubTab = 'company' }) {
  const [activeSubTab, setActiveSubTab] = useState(initialSubTab);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Comprehensive System Settings State covering 100% of PDF Section 32 (32.1 through 32.7)
  const initialSettingsState = {
    // 32.1 Company Settings
    company_name: 'Apex Enterprises Pvt Ltd',
    logo_url: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&auto=format&fit=crop&q=60',
    address: '100 Industrial Park, Zone 4, Bangalore, KA - 560001, India',
    tax_number: '29AAAAA0000A1Z5',
    contact_email: 'support@apexenterprises.com',
    contact_phone: '+91 80 2345 6789',
    financial_year: '2026-2027',

    // 32.2 Numbering Series (Concurrency-Safe Series)
    numbering_series: {
      indent_prefix: 'IND-2026-',
      indent_counter: 124,
      rfq_prefix: 'RFQ-2026-',
      rfq_counter: 88,
      po_prefix: 'PO-2026-',
      po_counter: 45,
      grn_prefix: 'GRN-2026-',
      grn_counter: 4018,
      stock_issue_prefix: 'ISS-2026-',
      stock_issue_counter: 5001,
      stock_return_prefix: 'RET-2026-',
      stock_return_counter: 104,
      supplier_return_prefix: 'SRN-2026-',
      supplier_return_counter: 104
    },

    // 32.3 Inventory Settings
    allow_negative_stock: false,
    valuation_method: 'FIFO', // 'FIFO', 'Weighted average', 'Standard cost', 'Last purchase price'
    default_warehouse_id: 'wh-01',
    batch_tracking_enabled: true,
    serial_tracking_enabled: true,
    expiry_warning_days: 30,
    reservation_rules: 'On Indent Approval', // 'On Indent Approval', 'On Sales Order Approval', 'On Production Job Release'
    decimal_quantity_precision: 2, // 2, 3, 4

    // 32.4 Purchase Settings
    po_approval_limit: 100000,
    quotation_requirement: 'Mandatory', // 'Mandatory', 'Optional'
    min_quotations_required: 3,
    allow_direct_purchase: false,
    excess_receipt_tolerance_pct: 10,
    price_variance_tolerance_pct: 5,

    // 32.5 Approval Settings
    approval_workflow_enabled: true,
    delegation_rules_allowed: true,
    escalation_time_hrs: 48,
    reminder_frequency: 'Daily', // 'Daily', 'Every 2 days', 'Weekly'
    self_approval_restriction: true, // Enforced - User cannot approve own request

    // 32.6 Notification Settings
    email_server_type: 'SMTP Relay',
    notification_templates_active: true,
    sms_provider: 'Twilio SMS Gateway',
    alert_schedules: 'Real-time', // 'Real-time', 'Hourly Batch', 'Daily Digest'

    // 32.7 Tax Settings
    tax_rates: [
      { id: 'tax-0', name: 'Exempt (0%)', percentage: 0, tax_type: 'GST_0', effective_date: '2026-04-01' },
      { id: 'tax-5', name: 'GST 5%', percentage: 5, tax_type: 'GST_5', effective_date: '2026-04-01' },
      { id: 'tax-12', name: 'GST 12%', percentage: 12, tax_type: 'GST_12', effective_date: '2026-04-01' },
      { id: 'tax-18', name: 'GST 18%', percentage: 18, tax_type: 'GST_18', effective_date: '2026-04-01' },
      { id: 'tax-28', name: 'GST 28%', percentage: 28, tax_type: 'GST_28', effective_date: '2026-04-01' }
    ],
    tax_calculation_method: 'Exclusive' // 'Exclusive', 'Inclusive'
  };

  const [settings, setSettings] = useState(initialSettingsState);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success && data.data && Object.keys(data.data).length > 0) {
        setSettings(prev => ({ ...prev, ...data.data }));
      } else {
        const saved = localStorage.getItem('app_system_settings');
        if (saved) setSettings(JSON.parse(saved));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      localStorage.setItem('app_system_settings', JSON.stringify(settings));
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      setToastMessage('System settings saved successfully.');
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to save settings to server.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 border border-slate-200/80 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 font-heading flex items-center space-x-2.5">
            <SettingsIcon className="w-6 h-6 text-purple-600" />
            <span>System Settings & Configuration</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure system behaviour, company parameters, numbering series, inventory rules, purchasing limits & tax codes.
          </p>
        </div>
        <button 
          onClick={handleSaveSettings}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 shadow-xs transition cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save All Settings</span>
        </button>
      </div>

      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sub Tabs Navigation (32.1 through 32.7) */}
      <div className="flex items-center space-x-1.5 overflow-x-auto border-b border-slate-200 pb-2 scrollbar-none">
        {[
          { id: 'company', label: 'Company Settings', icon: Building },
          { id: 'numbering', label: 'Numbering Series', icon: Hash },
          { id: 'inventory', label: 'Inventory Settings', icon: Box },
          { id: 'purchase', label: 'Purchase Settings', icon: ShoppingCart },
          { id: 'approval', label: 'Approval Settings', icon: CheckSquare },
          { id: 'notification', label: 'Notification Settings', icon: Bell },
          { id: 'tax', label: 'Tax Settings', icon: Percent }
        ].map(tab => {
          const IconComp = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition cursor-pointer whitespace-nowrap ${
                activeSubTab === tab.id
                  ? 'bg-purple-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <IconComp className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 32.1 COMPANY SETTINGS */}
      {activeSubTab === 'company' && (
        <form onSubmit={handleSaveSettings} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4 text-xs max-w-3xl">
          <h3 className="font-bold text-sm text-slate-900 font-heading uppercase tracking-wider border-b border-slate-100 pb-2">
            Company Profile & Financial Year
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Legal Company Name</label>
              <input 
                type="text" 
                value={settings.company_name} 
                onChange={e => setSettings({ ...settings, company_name: e.target.value })} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">GSTIN / Tax Registration Number</label>
              <input 
                type="text" 
                value={settings.tax_number} 
                onChange={e => setSettings({ ...settings, tax_number: e.target.value })} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono font-bold text-purple-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Company Registered Office Address</label>
            <textarea 
              rows="2" 
              value={settings.address} 
              onChange={e => setSettings({ ...settings, address: e.target.value })} 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Contact Email</label>
              <input 
                type="email" 
                value={settings.contact_email} 
                onChange={e => setSettings({ ...settings, contact_email: e.target.value })} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Contact Phone</label>
              <input 
                type="text" 
                value={settings.contact_phone} 
                onChange={e => setSettings({ ...settings, contact_phone: e.target.value })} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Current Financial Year</label>
              <input 
                type="text" 
                value={settings.financial_year} 
                onChange={e => setSettings({ ...settings, financial_year: e.target.value })} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold"
              />
            </div>
          </div>

          <div className="pt-2">
            <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-xs">
              Save Company Settings
            </button>
          </div>
        </form>
      )}

      {/* 32.2 NUMBERING SERIES */}
      {activeSubTab === 'numbering' && (
        <form onSubmit={handleSaveSettings} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4 text-xs max-w-3xl">
          <h3 className="font-bold text-sm text-slate-900 font-heading uppercase tracking-wider border-b border-slate-100 pb-2">
            Document Numbering Series (Concurrency-Safe Engine)
          </h3>
          <p className="text-slate-500 text-xs">Configure auto-generated sequence prefixes and current counters for all transaction documents:</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <span className="font-bold text-purple-900 font-mono">Indent Request Numbering</span>
              <div className="grid grid-cols-2 gap-2">
                <input type="text" value={settings.numbering_series?.indent_prefix} onChange={e => setSettings({ ...settings, numbering_series: { ...settings.numbering_series, indent_prefix: e.target.value } })} className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-mono text-purple-700 font-bold" />
                <input type="number" value={settings.numbering_series?.indent_counter} onChange={e => setSettings({ ...settings, numbering_series: { ...settings.numbering_series, indent_counter: Number(e.target.value) } })} className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-mono font-bold text-right" />
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <span className="font-bold text-purple-900 font-mono">RFQ Numbering</span>
              <div className="grid grid-cols-2 gap-2">
                <input type="text" value={settings.numbering_series?.rfq_prefix} onChange={e => setSettings({ ...settings, numbering_series: { ...settings.numbering_series, rfq_prefix: e.target.value } })} className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-mono text-purple-700 font-bold" />
                <input type="number" value={settings.numbering_series?.rfq_counter} onChange={e => setSettings({ ...settings, numbering_series: { ...settings.numbering_series, rfq_counter: Number(e.target.value) } })} className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-mono font-bold text-right" />
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <span className="font-bold text-purple-900 font-mono">Purchase Order Numbering</span>
              <div className="grid grid-cols-2 gap-2">
                <input type="text" value={settings.numbering_series?.po_prefix} onChange={e => setSettings({ ...settings, numbering_series: { ...settings.numbering_series, po_prefix: e.target.value } })} className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-mono text-purple-700 font-bold" />
                <input type="number" value={settings.numbering_series?.po_counter} onChange={e => setSettings({ ...settings, numbering_series: { ...settings.numbering_series, po_counter: Number(e.target.value) } })} className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-mono font-bold text-right" />
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <span className="font-bold text-purple-900 font-mono">Goods Receipt (GRN) Numbering</span>
              <div className="grid grid-cols-2 gap-2">
                <input type="text" value={settings.numbering_series?.grn_prefix} onChange={e => setSettings({ ...settings, numbering_series: { ...settings.numbering_series, grn_prefix: e.target.value } })} className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-mono text-purple-700 font-bold" />
                <input type="number" value={settings.numbering_series?.grn_counter} onChange={e => setSettings({ ...settings, numbering_series: { ...settings.numbering_series, grn_counter: Number(e.target.value) } })} className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-mono font-bold text-right" />
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <span className="font-bold text-purple-900 font-mono">Stock Issue Numbering</span>
              <div className="grid grid-cols-2 gap-2">
                <input type="text" value={settings.numbering_series?.stock_issue_prefix} onChange={e => setSettings({ ...settings, numbering_series: { ...settings.numbering_series, stock_issue_prefix: e.target.value } })} className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-mono text-purple-700 font-bold" />
                <input type="number" value={settings.numbering_series?.stock_issue_counter} onChange={e => setSettings({ ...settings, numbering_series: { ...settings.numbering_series, stock_issue_counter: Number(e.target.value) } })} className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-mono font-bold text-right" />
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <span className="font-bold text-purple-900 font-mono">Stock Return & Supplier Return</span>
              <div className="grid grid-cols-2 gap-2">
                <input type="text" value={settings.numbering_series?.stock_return_prefix} onChange={e => setSettings({ ...settings, numbering_series: { ...settings.numbering_series, stock_return_prefix: e.target.value } })} className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-mono text-purple-700 font-bold" />
                <input type="number" value={settings.numbering_series?.stock_return_counter} onChange={e => setSettings({ ...settings, numbering_series: { ...settings.numbering_series, stock_return_counter: Number(e.target.value) } })} className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-mono font-bold text-right" />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-xs">
              Save Numbering Series
            </button>
          </div>
        </form>
      )}

      {/* 32.3 INVENTORY SETTINGS */}
      {activeSubTab === 'inventory' && (
        <form onSubmit={handleSaveSettings} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4 text-xs max-w-3xl">
          <h3 className="font-bold text-sm text-slate-900 font-heading uppercase tracking-wider border-b border-slate-100 pb-2">
            Inventory Rules & Valuation Methods
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Inventory Valuation Method</label>
              <select 
                value={settings.valuation_method} 
                onChange={e => setSettings({ ...settings, valuation_method: e.target.value })} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold"
              >
                <option value="Weighted average">Weighted Average Cost</option>
                <option value="FIFO">FIFO (First In, First Out)</option>
                <option value="Standard cost">Standard Cost</option>
                <option value="Last purchase price">Last Purchase Price</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Default Warehouse</label>
              <select 
                value={settings.default_warehouse_id} 
                onChange={e => setSettings({ ...settings, default_warehouse_id: e.target.value })} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold"
              >
                <option value="wh-01">Central Goods Warehouse (WH-MAIN)</option>
                <option value="wh-02">IT Assets & Electronics Store (WH-SUB1)</option>
                <option value="wh-03">Quarantine & Transit Store (WH-TRANS)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Stock Reservation Rule</label>
              <select 
                value={settings.reservation_rules} 
                onChange={e => setSettings({ ...settings, reservation_rules: e.target.value })} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
              >
                <option value="On Indent Approval">On Indent Approval</option>
                <option value="On Sales Order Approval">On Sales Order Approval</option>
                <option value="On Production Job Release">On Production Job Release</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Decimal Quantity Precision</label>
              <select 
                value={settings.decimal_quantity_precision} 
                onChange={e => setSettings({ ...settings, decimal_quantity_precision: Number(e.target.value) })} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono font-bold"
              >
                <option value={2}>2 Decimals (e.g. 10.50 Pcs)</option>
                <option value={3}>3 Decimals (e.g. 10.500 Kg)</option>
                <option value={4}>4 Decimals (e.g. 10.5000 Ltr)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.allow_negative_stock} 
                onChange={e => setSettings({ ...settings, allow_negative_stock: e.target.checked })} 
                className="rounded text-purple-600 focus:ring-purple-500"
              />
              <span className="font-bold text-slate-800">Allow Negative Stock Balances</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.batch_tracking_enabled} 
                onChange={e => setSettings({ ...settings, batch_tracking_enabled: e.target.checked })} 
                className="rounded text-purple-600 focus:ring-purple-500"
              />
              <span className="font-bold text-slate-800">Batch Tracking Feature Enabled</span>
            </label>
          </div>

          <div className="pt-2">
            <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-xs">
              Save Inventory Settings
            </button>
          </div>
        </form>
      )}

      {/* 32.4 PURCHASE SETTINGS */}
      {activeSubTab === 'purchase' && (
        <form onSubmit={handleSaveSettings} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4 text-xs max-w-3xl">
          <h3 className="font-bold text-sm text-slate-900 font-heading uppercase tracking-wider border-b border-slate-100 pb-2">
            Procurement Limits & Tolerances
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">PO Approval Limit Threshold (₹)</label>
              <input 
                type="number" 
                value={settings.po_approval_limit} 
                onChange={e => setSettings({ ...settings, po_approval_limit: Number(e.target.value) })} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Quotation Requirement Rule</label>
              <select 
                value={settings.quotation_requirement} 
                onChange={e => setSettings({ ...settings, quotation_requirement: e.target.value })} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold"
              >
                <option value="Mandatory">Mandatory (Requires Supplier Quote comparison)</option>
                <option value="Optional">Optional (Direct PO creation allowed)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Excess Receipt Tolerance (%)</label>
              <input 
                type="number" 
                value={settings.excess_receipt_tolerance_pct} 
                onChange={e => setSettings({ ...settings, excess_receipt_tolerance_pct: Number(e.target.value) })} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Price Variance Tolerance (%)</label>
              <input 
                type="number" 
                value={settings.price_variance_tolerance_pct} 
                onChange={e => setSettings({ ...settings, price_variance_tolerance_pct: Number(e.target.value) })} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono font-bold"
              />
            </div>
          </div>

          <div className="pt-2">
            <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-xs">
              Save Purchase Settings
            </button>
          </div>
        </form>
      )}

      {/* 32.5 APPROVAL SETTINGS */}
      {activeSubTab === 'approval' && (
        <form onSubmit={handleSaveSettings} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4 text-xs max-w-3xl">
          <h3 className="font-bold text-sm text-slate-900 font-heading uppercase tracking-wider border-b border-slate-100 pb-2">
            Approval Controls & Escalations
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Escalation Timeout (Hours)</label>
              <input 
                type="number" 
                value={settings.escalation_time_hrs} 
                onChange={e => setSettings({ ...settings, escalation_time_hrs: Number(e.target.value) })} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Pending Approval Reminder Frequency</label>
              <select 
                value={settings.reminder_frequency} 
                onChange={e => setSettings({ ...settings, reminder_frequency: e.target.value })} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold"
              >
                <option value="Daily">Daily Digest</option>
                <option value="Every 2 days">Every 2 Days</option>
                <option value="Weekly">Weekly Digest</option>
              </select>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.self_approval_restriction} 
                onChange={e => setSettings({ ...settings, self_approval_restriction: e.target.checked })} 
                className="rounded text-purple-600 focus:ring-purple-500"
              />
              <span className="font-bold text-slate-800">Enforce Self-Approval Restriction (User cannot approve their own Indent / PO)</span>
            </label>
          </div>

          <div className="pt-2">
            <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-xs">
              Save Approval Controls
            </button>
          </div>
        </form>
      )}

      {/* 32.6 NOTIFICATION SETTINGS */}
      {activeSubTab === 'notification' && (
        <form onSubmit={handleSaveSettings} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4 text-xs max-w-3xl">
          <h3 className="font-bold text-sm text-slate-900 font-heading uppercase tracking-wider border-b border-slate-100 pb-2">
            Notification Delivery Channels & Schedules
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Email Relay Server</label>
              <input 
                type="text" 
                value={settings.email_server_type} 
                onChange={e => setSettings({ ...settings, email_server_type: e.target.value })} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">SMS Provider Gateway</label>
              <input 
                type="text" 
                value={settings.sms_provider} 
                onChange={e => setSettings({ ...settings, sms_provider: e.target.value })} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
              />
            </div>
          </div>

          <div className="pt-2">
            <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-xs">
              Save Notification Settings
            </button>
          </div>
        </form>
      )}

      {/* TAX SETTINGS */}
      {activeSubTab === 'tax' && (
        <form onSubmit={handleSaveSettings} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4 text-xs max-w-3xl">
          <h3 className="font-bold text-sm text-slate-900 font-heading uppercase tracking-wider border-b border-slate-100 pb-2">
            Tax Settings
          </h3>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Tax Calculation Base</label>
            <select 
              value={settings.tax_calculation_method} 
              onChange={e => setSettings({ ...settings, tax_calculation_method: e.target.value })} 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold"
            >
              <option value="Exclusive">Exclusive (Tax calculated on top of net taxable value)</option>
              <option value="Inclusive">Inclusive (Tax included in unit price)</option>
            </select>
          </div>

          <div className="space-y-3">
            <span className="font-bold text-slate-800 block text-xs uppercase tracking-wide">System Tax Rates Master:</span>
            {(settings.tax_rates && settings.tax_rates.length > 0 ? settings.tax_rates : [
              { id: 'tax-0', name: 'Exempt (0%)', percentage: 0, tax_type: 'GST_0', effective_date: '2026-04-01' },
              { id: 'tax-5', name: 'GST 5%', percentage: 5, tax_type: 'GST_5', effective_date: '2026-04-01' },
              { id: 'tax-12', name: 'GST 12%', percentage: 12, tax_type: 'GST_12', effective_date: '2026-04-01' },
              { id: 'tax-18', name: 'GST 18%', percentage: 18, tax_type: 'GST_18', effective_date: '2026-04-01' },
              { id: 'tax-28', name: 'GST 28%', percentage: 28, tax_type: 'GST_28', effective_date: '2026-04-01' }
            ]).map((t, i) => (
              <div key={i} className="flex items-center justify-between bg-slate-50 p-3.5 rounded-xl border border-slate-200 hover:border-purple-200 transition">
                <div>
                  <span className="font-bold text-purple-700 font-mono block text-sm">{t.name}</span>
                  <span className="text-slate-500 font-mono text-[11px]">Tax Code: {t.tax_type}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-600 block text-xs">Rate: <strong className="text-slate-900 font-mono text-sm">{t.percentage}%</strong></span>
                  <span className="text-slate-400 text-[10px]">Effective: {t.effective_date || '2026-04-01'}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-xs">
              Save Tax Settings
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
