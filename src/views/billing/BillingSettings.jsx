import React, { useState, useEffect } from 'react';
import {
  Store,
  Receipt,
  Percent,
  FileText,
  Printer,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Phone,
  MapPin,
  Hash,
  Sparkles,
  SlidersHorizontal,
  ShieldCheck,
  Building2,
  HelpCircle,
  Check,
  Palette,
  ShoppingCart,
  Laptop,
  Armchair,
  Edit3,
  Wand2,
  Sliders,
  ArrowLeft
} from 'lucide-react';
import InvoicePDF from './InvoicePDF';
import BillThemeCustomizerModal from './BillThemeCustomizerModal';
import VisualBillDesignerModal from './VisualBillDesignerModal';

const DEFAULT_SETTINGS = {
  store_name: "AMMUS SUPERMARKET",
  store_subtitle: "Fresh Grocery & Supermarket",
  store_address: "JUNCTION ROAD, NEAR BUS STAND, TRIVANDRUM",
  store_phone: "9895820417, 0471-224488",
  store_email: "contact@ammussupermarket.com",
  gstin: "32DPHPB3199N1ZL",
  fssai: "11324001000001",
  bill_prefix: "SH/25-27/",
  bill_sequence_start: 1,
  bill_sequence_padding: 7,
  bill_theme: "supermarket", // "supermarket" | "software" | "furniture" | "custom"
  custom_theme_config: null,
  default_gst_rate: 5.0,
  cgst_rate: 2.5,
  sgst_rate: 2.5,
  igst_rate: 5.0,
  enable_gst: true,
  enable_round_off: true,
  enable_discounts: true,
  max_discount_pct: 25.0,
  default_discount_pct: 0.0,
  invoice_title: "TAX INVOICE",
  footer_greeting: "**** Thank You Visit Again ****",
  savings_text: "You Have Saved Rs.",
  footer_note: "Exchange within 7 days with original bill. Thank you!",
  paper_width: "80mm",
  show_cashier: true,
  show_barcode: true
};

// Sample items for the live thermal receipt preview
const PREVIEW_SAMPLE_ITEMS = [
  { id: '1', name: 'Aashirvaad Shudh Chakki Atta 5kg', quantity: 1, unit_price: 245.0, mrp: 275.0, gst_rate: 5.0 },
  { id: '2', name: 'Fortune Sunlite Refined Oil 1L', quantity: 2, unit_price: 135.0, mrp: 155.0, gst_rate: 5.0 },
  { id: '3', name: 'Tata Tea Gold Leaf Pouch 500g', quantity: 1, unit_price: 310.0, mrp: 340.0, gst_rate: 5.0 }
];

export default function BillingSettings({ onBack }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Load existing billing settings from PostgreSQL via backend API
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/billing/settings');
      const data = await res.json();
      if (data.success && data.data) {
        setSettings(prev => ({
          ...DEFAULT_SETTINGS,
          ...data.data
        }));
      }
    } catch (err) {
      console.error("Failed to load billing settings:", err);
      setErrorMsg("Failed to connect to backend. Using local defaults.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto synchronize CGST + SGST when default_gst_rate is edited
      if (field === 'default_gst_rate') {
        const num = parseFloat(value) || 0;
        updated.cgst_rate = Number((num / 2).toFixed(2));
        updated.sgst_rate = Number((num / 2).toFixed(2));
        updated.igst_rate = num;
      }
      return updated;
    });
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/billing/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'role-admin'
        },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 5000);
      } else {
        setErrorMsg(data.detail || "Failed to save settings to PostgreSQL.");
      }
    } catch (err) {
      console.error("Error saving billing settings:", err);
      setErrorMsg("Server error while saving. Please ensure PostgreSQL is running.");
    } finally {
      setSaving(false);
    }
  };

  const [showCustomizerModal, setShowCustomizerModal] = useState(false);
  const [showVisualDesignerModal, setShowVisualDesignerModal] = useState(false);
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'preview' | 'form'
  const [previewScale, setPreviewScale] = useState('fit'); // 'fit' | '100' | '75'

  const handleCustomizerSave = async (customConfig) => {
    const updated = {
      ...settings,
      bill_theme: 'custom',
      custom_theme_config: customConfig
    };
    setSettings(updated);

    // Auto-persist immediately to PostgreSQL
    setSaving(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/billing/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'role-admin'
        },
        body: JSON.stringify(updated)
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 5000);
      } else {
        setErrorMsg(data.detail || "Failed to persist customized theme settings.");
      }
    } catch (err) {
      console.error("Error auto-saving customized bill theme:", err);
      setErrorMsg("Failed to persist custom theme to database.");
    } finally {
      setSaving(false);
    }
  };

  const handleVisualDesignerSave = async (designerConfig) => {
    const updated = {
      ...settings,
      bill_theme: 'custom',
      custom_theme_config: designerConfig
    };
    setSettings(updated);

    // Auto-persist immediately to PostgreSQL
    setSaving(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/billing/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'role-admin'
        },
        body: JSON.stringify(updated)
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 5000);
      } else {
        setErrorMsg(data.detail || "Failed to persist visual designer template.");
      }
    } catch (err) {
      console.error("Error auto-saving visual designer template:", err);
      setErrorMsg("Failed to persist visual designer template to database.");
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm("Are you sure you want to reset all billing settings to AMMUS SUPERMARKET standard defaults?")) {
      setSettings(DEFAULT_SETTINGS);
    }
  };

  // Compute live bill number preview
  const liveBillNumberPreview = `${settings.bill_prefix || 'SH/25-27/'}${String(settings.bill_sequence_start || 1).padStart(parseInt(settings.bill_sequence_padding || 7, 10), '0')}`;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/50 overflow-hidden text-slate-900 font-sans">
      {/* ── TOP HEADER BAR ── */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shrink-0 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-bold transition cursor-pointer active:scale-95 shadow-2xs mr-1"
                title="Back to POS Billing"
              >
                <ArrowLeft className="w-4 h-4 text-purple-700" />
                <span>Back</span>
              </button>
            )}
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-slate-900 font-heading tracking-tight">
                  Billing & POS Settings
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 tracking-wide uppercase">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure store identity, bill sequence, tax rates, discounts, and thermal print formatting. Persisted in PostgreSQL.
              </p>
            </div>
          </div>

          {/* Quick Actions & View Mode Controls */}
          <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
            {/* View Mode Switcher */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode('split')}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${viewMode === 'split' ? 'bg-white text-purple-700 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Split View
              </button>
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${viewMode === 'preview' ? 'bg-white text-purple-700 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Full Preview
              </button>
              <button
                type="button"
                onClick={() => setViewMode('form')}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${viewMode === 'form' ? 'bg-white text-purple-700 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Form Only
              </button>
            </div>

            <button
              type="button"
              onClick={handleResetDefaults}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition cursor-pointer"
              title="Reset to default AMMUS Supermarket template"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset Defaults</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-purple-500/20 transition cursor-pointer active:scale-95"
            >
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Notifications Alert Banner */}
        {saveSuccess && (
          <div className="max-w-7xl mx-auto mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-emerald-800 text-xs font-medium animate-fadeIn">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Success!</strong> Billing settings successfully saved to PostgreSQL (.env database). All changes are live in POS Billing & Printed Receipts.
              </span>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="max-w-7xl mx-auto mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-rose-800 text-xs font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* ── MAIN CONTENT AREA (Scrollable) ── */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className={`max-w-7xl mx-auto ${viewMode === 'preview' ? 'space-y-6' : viewMode === 'form' ? 'space-y-6' : 'grid grid-cols-1 lg:grid-cols-12 gap-6'}`}>

          {/* ── LEFT COLUMN: CONFIGURATION FORM CARDS ── */}
          {viewMode !== 'preview' && (
            <div className={`${viewMode === 'form' ? 'w-full' : 'lg:col-span-6'} space-y-6`}>

            {/* ── CARD 1: STORE IDENTITY & HEADER ── */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Store className="w-4 h-4 text-purple-600" />
                  <h2 className="font-bold text-sm text-slate-800 font-heading">
                    Store Identity & Receipt Header
                  </h2>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">Printed on top of every bill</span>
              </div>

              <div className="p-5 space-y-4 text-xs">
                {/* Store Name */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Store Name (Large Header) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={settings.store_name}
                    onChange={e => handleChange('store_name', e.target.value)}
                    placeholder="e.g. AMMUS SUPERMARKET"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 text-slate-900 font-bold uppercase tracking-wider outline-none text-sm transition"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Appears in bold uppercase on top of the receipt.</p>
                </div>

                {/* Tagline / Subtitle */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Store Subtitle / Tagline
                  </label>
                  <input
                    type="text"
                    value={settings.store_subtitle || ''}
                    onChange={e => handleChange('store_subtitle', e.target.value)}
                    placeholder="e.g. Fresh Grocery & Department Store"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 text-slate-900 outline-none transition"
                  />
                </div>

                {/* Store Address */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Store Address (Multi-line or Comma separated)
                  </label>
                  <textarea
                    rows={2}
                    value={settings.store_address}
                    onChange={e => handleChange('store_address', e.target.value)}
                    placeholder="e.g. JUNCTION ROAD, NEAR BUS STAND, TRIVANDRUM"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 text-slate-900 uppercase text-xs outline-none transition resize-none font-mono"
                  />
                </div>

                {/* Contact Phone & Email Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Store Phone Numbers
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={settings.store_phone}
                        onChange={e => handleChange('store_phone', e.target.value)}
                        placeholder="e.g. 9895820417, 0471-224488"
                        className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 text-slate-900 outline-none font-mono transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Store Email (Optional)
                    </label>
                    <input
                      type="email"
                      value={settings.store_email || ''}
                      onChange={e => handleChange('store_email', e.target.value)}
                      placeholder="e.g. contact@ammussupermarket.com"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 text-slate-900 outline-none transition"
                    />
                  </div>
                </div>

                {/* GSTIN & FSSAI Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Store GSTIN Number <span className="text-purple-600 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      value={settings.gstin}
                      onChange={e => handleChange('gstin', e.target.value.toUpperCase())}
                      placeholder="e.g. 32DPHPB3199N1ZL"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 text-slate-900 font-mono font-bold tracking-wider outline-none uppercase transition"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      FSSAI License Number (Optional)
                    </label>
                    <input
                      type="text"
                      value={settings.fssai || ''}
                      onChange={e => handleChange('fssai', e.target.value)}
                      placeholder="e.g. 11324001000001"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 text-slate-900 font-mono outline-none transition"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ── CARD 2: BILL NUMBERING SCHEME ── */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Hash className="w-4 h-4 text-purple-600" />
                  <h2 className="font-bold text-sm text-slate-800 font-heading">
                    Bill / Invoice Numbering Series
                  </h2>
                </div>
                <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 text-[11px] font-mono font-bold">
                  <span>Preview:</span>
                  <span>{liveBillNumberPreview}</span>
                </div>
              </div>

              <div className="p-5 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Bill Prefix Series
                    </label>
                    <input
                      type="text"
                      value={settings.bill_prefix}
                      onChange={e => handleChange('bill_prefix', e.target.value)}
                      placeholder="e.g. SH/25-27/"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 text-slate-900 font-mono font-bold outline-none transition"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">e.g. SH/25-27/, AMU/26/</p>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Starting Sequence No.
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={settings.bill_sequence_start}
                      onChange={e => handleChange('bill_sequence_start', parseInt(e.target.value, 10) || 1)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 text-slate-900 font-mono outline-none transition"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Starting counter number</p>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Zero Padding Digits
                    </label>
                    <input
                      type="number"
                      min="3"
                      max="10"
                      value={settings.bill_sequence_padding}
                      onChange={e => handleChange('bill_sequence_padding', parseInt(e.target.value, 10) || 7)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 text-slate-900 font-mono outline-none transition"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">7 digits = 0000001</p>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start space-x-2.5 text-slate-600">
                  <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    Invoice numbers increment automatically in PostgreSQL with each completed sale. If a prefix exists, the system automatically finds the highest sequence number in the database and increments it.
                  </p>
                </div>

                {/* Auto Round-Off Bill Total */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-800">Auto Round-Off Bill Total</div>
                    <p className="text-[11px] text-slate-400">Rounds the grand total to the nearest whole rupee</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enable_round_off}
                      onChange={e => handleChange('enable_round_off', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* ── CARD 3: BILL THEME & INVOICE LAYOUT ── */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center space-x-2">
                  <Palette className="w-4 h-4 text-purple-600" />
                  <h2 className="font-bold text-sm text-slate-800 font-heading">
                    Bill Theme & Invoice Layout
                  </h2>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full uppercase">
                    {settings.bill_theme === 'custom' ? 'Custom Theme (Live Editor)' : settings.bill_theme === 'software' ? 'Software Company' : settings.bill_theme === 'furniture' ? 'Furniture Showroom' : 'Supermarket POS'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowCustomizerModal(true)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-purple-500/20 transition cursor-pointer active:scale-95"
                    title="Open WordPress-style live visual theme customizer"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Customize Theme</span>
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-4 text-xs">
                {/* Visual Bill Designer Studio (Canva / WordPress Drag & Drop Builder) */}
                <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-violet-800 rounded-2xl p-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-purple-700/20">
                  <div className="flex items-start space-x-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner">
                      <Wand2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-bold tracking-tight">
                          Visual Bill Designer & Invoice Builder
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-400 text-slate-900 uppercase tracking-wider">
                          Canva / WordPress Style
                        </span>
                      </div>
                      <p className="text-xs text-purple-100 mt-1 leading-relaxed">
                        Drag & drop components, freely reorder sections, customize dynamic item tables, generate UPI QR codes, barcodes, signatures & conditional visibility rules with realistic live preview.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowVisualDesignerModal(true)}
                    className="shrink-0 flex items-center space-x-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-purple-700 text-xs font-bold rounded-xl shadow-md transition cursor-pointer active:scale-95"
                  >
                    <Sliders className="w-4 h-4 text-purple-600" />
                    <span>Launch Visual Designer</span>
                  </button>
                </div>

                {/* WordPress Live Customizer Highlight Banner */}
                <div className="bg-gradient-to-r from-purple-50/90 via-indigo-50/70 to-fuchsia-50/60 border border-purple-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-500/20">
                      <Wand2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-xs font-bold text-slate-900 font-heading">
                          WordPress-Style Visual Theme Customizer
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-purple-600 text-white uppercase tracking-wider">
                          Live WYSIWYG
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                        Manually customize brand colors, header alignment, custom logos, fonts, thermal vs A4 page size, table columns (SKU, HSN, MRP, Discounts), bank wire details, warranty terms, and signature stamps with instant live preview.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCustomizerModal(true)}
                    className="shrink-0 flex items-center space-x-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-600/20 transition cursor-pointer active:scale-95"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Open Theme Studio</span>
                  </button>
                </div>

                <p className="text-slate-600 leading-relaxed">
                  Select a pre-built template or create your own custom bill theme. Each layout includes tailored formatting, typography, line-item structures, and specialized print stylesheets:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  {/* Theme 1: Supermarket */}
                  <div
                    onClick={() => handleChange('bill_theme', 'supermarket')}
                    className={`p-4 rounded-xl border-2 transition cursor-pointer flex flex-col justify-between ${
                      (settings.bill_theme || 'supermarket') === 'supermarket'
                        ? 'border-purple-600 bg-purple-50/40 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                          <ShoppingCart className="w-4 h-4" />
                        </div>
                        {(settings.bill_theme || 'supermarket') === 'supermarket' && (
                          <span className="flex items-center text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                            <Check className="w-3 h-3 mr-0.5" /> Active
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-900 text-xs font-heading">1. Supermarket / Retail POS</h3>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                        Compact 80mm thermal paper receipt, monospace roll layout, cashier breakdown, MRP vs Selling rate savings.
                      </p>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-slate-400 font-medium">
                      Best for: Supermarkets, Grocery, Bakeries, Retail POS
                    </div>
                  </div>

                  {/* Theme 2: Software Company */}
                  <div
                    onClick={() => handleChange('bill_theme', 'software')}
                    className={`p-4 rounded-xl border-2 transition cursor-pointer flex flex-col justify-between ${
                      settings.bill_theme === 'software'
                        ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                          <Laptop className="w-4 h-4" />
                        </div>
                        {settings.bill_theme === 'software' && (
                          <span className="flex items-center text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                            <Check className="w-3 h-3 mr-0.5" /> Active
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-900 text-xs font-heading">2. Software Company (A4)</h3>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                        Executive A4 corporate tech tax invoice, SAC/HSN codes, client cards, bank remittance wire details & digital sign.
                      </p>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-slate-400 font-medium">
                      Best for: Tech Startups, IT Agencies, SaaS, B2B Services
                    </div>
                  </div>

                  {/* Theme 3: Furniture Showroom */}
                  <div
                    onClick={() => handleChange('bill_theme', 'furniture')}
                    className={`p-4 rounded-xl border-2 transition cursor-pointer flex flex-col justify-between ${
                      settings.bill_theme === 'furniture'
                        ? 'border-amber-700 bg-amber-50/40 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                          <Armchair className="w-4 h-4" />
                        </div>
                        {settings.bill_theme === 'furniture' && (
                          <span className="flex items-center text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                            <Check className="w-3 h-3 mr-0.5" /> Active
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-900 text-xs font-heading">3. Furniture & Showroom</h3>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                        Prestigious architectural showroom invoice, wood finish specs, site delivery protocol, 3-yr warranty & dual signatures.
                      </p>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-slate-400 font-medium">
                      Best for: Furniture Showrooms, Interior Decor, Luxury Showrooms
                    </div>
                  </div>

                  {/* Theme 4: WordPress-Style Custom User Theme */}
                  <div
                    onClick={() => handleChange('bill_theme', 'custom')}
                    className={`p-4 rounded-xl border-2 transition cursor-pointer flex flex-col justify-between ${
                      settings.bill_theme === 'custom'
                        ? 'border-indigo-600 bg-indigo-50/40 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                          <Sliders className="w-4 h-4" />
                        </div>
                        {settings.bill_theme === 'custom' ? (
                          <span className="flex items-center text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                            <Check className="w-3 h-3 mr-0.5" /> Active
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                            Customizable
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-900 text-xs font-heading flex items-center justify-between">
                        <span>4. Custom User Theme</span>
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                        {settings.custom_theme_config?.theme_name || 'Tailored design'} — customized colors, fonts, bank remittance, table columns & layout.
                      </p>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-medium">
                        {settings.custom_theme_config?.layout_type === 'thermal_80mm' || settings.custom_theme_config?.paper_size === 'thermal_80mm' ? '80mm Thermal' : settings.custom_theme_config?.layout_type === 'thermal_58mm' || settings.custom_theme_config?.paper_size === 'thermal_58mm' ? '58mm Mini' : 'A4 Standard'}
                      </span>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowVisualDesignerModal(true);
                          }}
                          className="text-[11px] font-bold text-purple-600 hover:text-purple-800 flex items-center space-x-1 cursor-pointer"
                        >
                          <Wand2 className="w-3 h-3" />
                          <span>Visual Designer</span>
                        </button>
                        <span className="text-slate-300">•</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowCustomizerModal(true);
                          }}
                          className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Properties</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── CARD 4: DISCOUNTS CONFIGURATION ── */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Percent className="w-4 h-4 text-purple-600" />
                  <h2 className="font-bold text-sm text-slate-800 font-heading">
                    Discounts & Offer Controls
                  </h2>
                </div>
                <div className="flex items-center space-x-2">
                  <label className="text-xs font-semibold text-slate-600 cursor-pointer">
                    Enable Discounts
                  </label>
                  <input
                    type="checkbox"
                    checked={settings.enable_discounts}
                    onChange={e => handleChange('enable_discounts', e.target.checked)}
                    className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                  />
                </div>
              </div>

              <div className="p-5 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Max Allowed Cashier Discount %
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={settings.max_discount_pct}
                        onChange={e => handleChange('max_discount_pct', parseFloat(e.target.value) || 0)}
                        className="w-full pr-7 pl-3 py-2 rounded-xl border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 text-slate-900 font-mono font-bold outline-none transition"
                      />
                      <span className="absolute right-2.5 top-2 text-slate-400 font-bold">%</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Prevents unauthorized cashier discounts</p>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Default Store Promotion Discount %
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={settings.default_discount_pct}
                        onChange={e => handleChange('default_discount_pct', parseFloat(e.target.value) || 0)}
                        className="w-full pr-7 pl-3 py-2 rounded-xl border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 text-slate-900 font-mono outline-none transition"
                      />
                      <span className="absolute right-2.5 top-2 text-slate-400 font-bold">%</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Auto-applied if non-zero</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── CARD 5: RECEIPT FOOTER & PRINT CUSTOMIZATION ── */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Printer className="w-4 h-4 text-purple-600" />
                  <h2 className="font-bold text-sm text-slate-800 font-heading">
                    Thermal Receipt Footer & Greetings
                  </h2>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">80mm / 58mm POS Printers</span>
              </div>

              <div className="p-5 space-y-4 text-xs">
                {/* Title & Paper Width */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Bill Title Header
                    </label>
                    <input
                      type="text"
                      value={settings.invoice_title}
                      onChange={e => handleChange('invoice_title', e.target.value)}
                      placeholder="e.g. TAX INVOICE"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 text-slate-900 font-bold uppercase tracking-wider outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Paper Width Format
                    </label>
                    <select
                      value={settings.paper_width}
                      onChange={e => handleChange('paper_width', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 text-slate-900 outline-none transition"
                    >
                      <option value="80mm">80mm Thermal (Standard Supermarket)</option>
                      <option value="58mm">58mm Thermal (Compact Mobile POS)</option>
                    </select>
                  </div>
                </div>

                {/* Footer Greeting */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Receipt Footer Greeting <span className="text-purple-600 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    value={settings.footer_greeting}
                    onChange={e => handleChange('footer_greeting', e.target.value)}
                    placeholder="e.g. **** Thank You Visit Again ****"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 text-slate-900 font-bold outline-none transition"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Highlighted greeting message printed at bottom of every receipt.</p>
                </div>

                {/* Savings Line Text */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Customer Savings Label
                  </label>
                  <input
                    type="text"
                    value={settings.savings_text}
                    onChange={e => handleChange('savings_text', e.target.value)}
                    placeholder="e.g. You Have Saved Rs."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 text-slate-900 outline-none transition"
                  />
                </div>

                {/* Return Policy Note */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Return Policy & Terms Note
                  </label>
                  <textarea
                    rows={2}
                    value={settings.footer_note}
                    onChange={e => handleChange('footer_note', e.target.value)}
                    placeholder="e.g. Exchange within 7 days with original bill. Thank you!"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 text-slate-900 outline-none transition resize-none"
                  />
                </div>

                {/* Print Options Checkboxes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                  <label className="flex items-center space-x-2 text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.show_cashier}
                      onChange={e => handleChange('show_cashier', e.target.checked)}
                      className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                    />
                    <span className="font-semibold text-xs">Print Cashier Name on Bill</span>
                  </label>

                  <label className="flex items-center space-x-2 text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.show_barcode}
                      onChange={e => handleChange('show_barcode', e.target.checked)}
                      className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                    />
                    <span className="font-semibold text-xs">Print Bill Barcode on Bottom</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Bottom Save Bar */}
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={handleResetDefaults}
                className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                Reset to Defaults
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-purple-500/20 transition cursor-pointer active:scale-95"
              >
                {saving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving to PostgreSQL...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Settings</span>
                  </>
                )}
              </button>
            </div>
          </div>
          )}

          {/* ── RIGHT COLUMN: LIVE INTERACTIVE RECEIPT PREVIEW ── */}
          {viewMode !== 'form' && (
            <div className={`${viewMode === 'preview' ? 'w-full max-w-4xl mx-auto' : 'lg:col-span-6'} space-y-4`}>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sticky top-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                  <div className="flex items-center space-x-2">
                    <Receipt className="w-4 h-4 text-purple-600" />
                    <h3 className="font-bold text-sm text-slate-800 font-heading">
                      Live Bill Preview
                    </h3>
                  </div>

                  {/* Scale & Fit Controls */}
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={() => setPreviewScale('fit')}
                        className={`px-2 py-0.5 rounded transition ${previewScale === 'fit' ? 'bg-white text-purple-700 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'}`}
                      >
                        Fit Width
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewScale('75')}
                        className={`px-2 py-0.5 rounded transition ${previewScale === '75' ? 'bg-white text-purple-700 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'}`}
                      >
                        75%
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewScale('100')}
                        className={`px-2 py-0.5 rounded transition ${previewScale === '100' ? 'bg-white text-purple-700 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'}`}
                      >
                        100%
                      </button>
                    </div>

                    <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                      Real-time Sync
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 my-2">
                  Live realistic WYSIWYG preview formatted according to chosen theme and print stylesheets:
                </p>

                {/* Scaled Responsive Bill Container */}
                <div className="bg-slate-100/90 p-3 sm:p-5 rounded-2xl border border-slate-200 flex justify-center overflow-x-auto min-h-[520px]">
                  <div 
                    className="transition-all duration-200 origin-top flex justify-center w-full"
                    style={{
                      transform: previewScale === 'fit' && settings.bill_theme !== 'supermarket' ? 'scale(0.85)' : previewScale === '75' ? 'scale(0.75)' : 'none',
                      maxWidth: '100%'
                    }}
                  >
                    <InvoicePDF
                      invoiceNumber={liveBillNumberPreview}
                      cartItems={PREVIEW_SAMPLE_ITEMS}
                      customer={{ name: 'Walk-in Customer', phone: '9847012345' }}
                      summary={{
                        subtotal: 690.0,
                        discount: 0,
                        taxableAmount: 657.14,
                        totalCGST: 16.43,
                        totalSGST: 16.43,
                        totalIGST: 0,
                        roundOff: 0.0,
                        bill_total: 770.0,
                        grandTotal: 690.0
                      }}
                      saleType="intra"
                      paymentMethod="Cash"
                      billerName="Admin Cashier"
                      amountPaid={700.0}
                      preview={false}
                      settings={settings}
                      theme={settings.bill_theme}
                      customConfig={settings.custom_theme_config}
                    />
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-slate-500 text-xs">
                  <span className="text-[11px] font-medium text-slate-600">
                    {settings.bill_theme === 'supermarket' ? '80mm POS Thermal Receipt' : settings.bill_theme === 'software' ? 'A4 Corporate Tax Invoice' : settings.bill_theme === 'furniture' ? 'A4 Showroom Invoice' : 'Custom Tailored Design'}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowVisualDesignerModal(true)}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 rounded-lg text-xs font-bold transition cursor-pointer"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>Visual Designer</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition cursor-pointer shadow-xs"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Test Print</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── WORDPRESS-STYLE LIVE THEME CUSTOMIZER STUDIO MODAL ── */}
      <BillThemeCustomizerModal
        isOpen={showCustomizerModal}
        onClose={() => setShowCustomizerModal(false)}
        initialSettings={settings}
        onSave={handleCustomizerSave}
      />

      {/* ── CANVA / WORDPRESS-STYLE VISUAL BILL DESIGNER & INVOICE BUILDER ── */}
      <VisualBillDesignerModal
        isOpen={showVisualDesignerModal}
        onClose={() => setShowVisualDesignerModal(false)}
        initialSettings={settings}
        onSave={handleVisualDesignerSave}
      />
    </div>
  );
}
