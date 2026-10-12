import React, { useState } from 'react';
import {
  Palette,
  Layout,
  Type,
  FileText,
  Check,
  RotateCcw,
  Printer,
  X,
  Sparkles,
  Sliders,
  Save,
  CreditCard,
  ShoppingCart,
  Laptop,
  Armchair,
  Maximize2,
  ChevronDown,
  ChevronRight,
  Eye,
  CheckCircle2
} from 'lucide-react';
import InvoicePDF from './InvoicePDF';

// Pre-built template presets that user can start customizing from
export const THEME_PRESETS = {
  supermarket: {
    theme_id: 'supermarket',
    theme_name: 'Supermarket / Retail POS (80mm)',
    layout_type: 'thermal_80mm',
    primary_color: '#000000',
    accent_color: '#334155',
    header_bg_color: '#ffffff',
    text_color: '#000000',
    font_family: "'Courier New', Courier, monospace",
    font_size: 'compact',
    border_style: 'dashed',
    header_alignment: 'center',
    invoice_title: 'TAX INVOICE',
    show_logo: false,
    show_subtitle: true,
    show_phone: true,
    show_email: false,
    show_address: true,
    show_gstin: true,
    show_fssai: true,
    show_sku: true,
    show_hsn: false,
    show_mrp: true,
    show_discount: true,
    show_tax_rate: true,
    show_tax_breakdown: true,
    show_bank_details: false,
    bank_name: 'State Bank of India',
    bank_account_no: '39482910482',
    bank_ifsc: 'SBIN0004829',
    bank_upi: 'store@upi',
    show_signatures: 'none',
    signature_title: 'Authorized Signatory',
    terms_and_conditions: 'Exchange within 7 days with original bill.',
    footer_greeting: '**** Thank You Visit Again ****'
  },
  software: {
    theme_id: 'software',
    theme_name: 'Software Company (A4 Corporate)',
    layout_type: 'a4',
    primary_color: '#2563eb',
    accent_color: '#0f172a',
    header_bg_color: '#f8fafc',
    text_color: '#0f172a',
    font_family: "Inter, -apple-system, sans-serif",
    font_size: 'medium',
    border_style: 'card',
    header_alignment: 'split',
    invoice_title: 'TAX INVOICE / SERVICE BILL',
    show_logo: true,
    show_subtitle: true,
    show_phone: true,
    show_email: true,
    show_address: true,
    show_gstin: true,
    show_fssai: false,
    show_sku: true,
    show_hsn: true,
    show_mrp: false,
    show_discount: true,
    show_tax_rate: true,
    show_tax_breakdown: true,
    show_bank_details: true,
    bank_name: 'HDFC Bank Ltd, Techno Park Branch',
    bank_account_no: '50200084920194',
    bank_ifsc: 'HDFC0001248',
    bank_upi: 'aurumtechnologies@okhdfcbank',
    show_signatures: 'stamp',
    signature_title: 'Authorized Signatory',
    terms_and_conditions: '1. Payment due within 15 days of invoice date.\n2. All intellectual property remains provider property until full settlement.\n3. Late payment interest 1.5% per month.',
    footer_greeting: 'Thank you for your valued partnership!'
  },
  furniture: {
    theme_id: 'furniture',
    theme_name: 'Furniture Showroom (A4 Luxury)',
    layout_type: 'a4',
    primary_color: '#92400e',
    accent_color: '#1c1917',
    header_bg_color: '#fef3c7',
    text_color: '#1c1917',
    font_family: "Georgia, Cambria, serif",
    font_size: 'medium',
    border_style: 'luxury',
    header_alignment: 'split',
    invoice_title: 'SHOWROOM TAX INVOICE',
    show_logo: true,
    show_subtitle: true,
    show_phone: true,
    show_email: true,
    show_address: true,
    show_gstin: true,
    show_fssai: false,
    show_sku: true,
    show_hsn: true,
    show_mrp: true,
    show_discount: true,
    show_tax_rate: true,
    show_tax_breakdown: true,
    show_bank_details: false,
    bank_name: 'Federal Bank Ltd',
    bank_account_no: '109200294819',
    bank_ifsc: 'FDRL0001829',
    bank_upi: 'royalliving@okaxis',
    show_signatures: 'dual',
    signature_title: 'Showroom Manager / Authorized Signatory',
    terms_and_conditions: '1. 3-Year comprehensive warranty on wood borer, termites & joinery defects.\n2. Please inspect polished surfaces & fabric before signing handover challan.\n3. Doorstep white-glove assembly complimentary.',
    footer_greeting: 'Experience the Art of Luxurious Living'
  }
};

const SAMPLE_CUSTOMIZER_ITEMS = [
  { id: '1', name: 'Cloud Infrastructure & API Architecture Consultation', sku: 'SRV-API-01', hsn_sac: '998313', quantity: 1, unit_price: 18500.0, mrp: 22000.0, discount: 0, gst_rate: 18.0 },
  { id: '2', name: 'Full-Stack ERP Inventory & POS Billing Module', sku: 'SFW-POS-2026', hsn_sac: '998314', quantity: 1, unit_price: 34000.0, mrp: 40000.0, discount: 5, gst_rate: 18.0 },
  { id: '3', name: 'Annual Server Maintenance & Database Backup SLA', sku: 'SLA-ANNUAL', hsn_sac: '998316', quantity: 1, unit_price: 8500.0, mrp: 10000.0, discount: 0, gst_rate: 18.0 }
];

export default function BillThemeCustomizerModal({
  isOpen,
  onClose,
  initialSettings,
  onSave
}) {
  if (!isOpen) return null;

  // Initialize custom config from settings or fallback to default
  const [config, setConfig] = useState(() => {
    if (initialSettings?.custom_theme_config) {
      return { ...initialSettings.custom_theme_config };
    }
    const base = initialSettings?.bill_theme || 'supermarket';
    return { ...(THEME_PRESETS[base] || THEME_PRESETS.supermarket) };
  });

  const [activeTab, setActiveTab] = useState('templates'); // 'templates' | 'colors' | 'typography' | 'layout' | 'header' | 'columns' | 'bank' | 'footer'
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [previewDevice, setPreviewDevice] = useState(config.layout_type === 'a4' ? 'a4' : 'thermal');

  const updateField = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const loadPreset = (presetKey) => {
    const preset = THEME_PRESETS[presetKey];
    if (preset) {
      setConfig({ ...preset });
      setPreviewDevice(preset.layout_type === 'a4' ? 'a4' : 'thermal');
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(config);
    }
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  const handleTestPrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-hidden animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-7xl h-[95vh] flex flex-col overflow-hidden">
        
        {/* ── TOP HEADER / ACTION BAR ── */}
        <div className="p-4 px-6 border-b border-slate-200 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-900 font-heading">
                  WordPress-Style Bill Theme Customizer
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                  Live Visual Studio
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Customize fonts, colors, headers, tables & layout in real-time with instant WYSIWYG preview
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-end sm:self-auto">
            <button
              onClick={() => loadPreset('supermarket')}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold flex items-center space-x-1 transition cursor-pointer"
              title="Reset to default preset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              onClick={handleTestPrint}
              className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Test Print</span>
            </button>

            <button
              onClick={handleSave}
              className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md transition cursor-pointer ${
                saveSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {saveSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Theme Applied & Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Apply & Save Theme</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── MAIN WORKSPACE (SPLIT PANEL: CONTROLS vs LIVE PREVIEW) ── */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden bg-slate-100">
          
          {/* ── LEFT PANEL: WORDPRESS-STYLE CUSTOMIZER CONTROLS ── */}
          <div className="w-full md:w-[420px] bg-white border-r border-slate-200 flex flex-col shrink-0 min-h-0 overflow-hidden shadow-xs">
            
            {/* Customizer Navigation Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50/80 overflow-x-auto p-1 text-xs shrink-0 no-scrollbar">
              {[
                { id: 'templates', label: 'Presets', icon: Sparkles },
                { id: 'colors', label: 'Colors', icon: Palette },
                { id: 'typography', label: 'Typography', icon: Type },
                { id: 'layout', label: 'Layout', icon: Layout },
                { id: 'header', label: 'Header', icon: FileText },
                { id: 'columns', label: 'Columns', icon: Sliders },
                { id: 'bank', label: 'Bank Wire', icon: CreditCard },
                { id: 'footer', label: 'Terms', icon: Check }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-white text-purple-700 shadow-xs border border-slate-200/60'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Customizer Active Tab Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-slate-700">
              
              {/* ── TAB 1: PRESETS & TEMPLATES ── */}
              {activeTab === 'templates' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Choose Base Template</h3>
                    <p className="text-slate-500 text-[11px] mt-0.5">Select a starting design to customize further:</p>
                  </div>

                  <div className="space-y-2.5">
                    {/* Preset 1 */}
                    <div
                      onClick={() => loadPreset('supermarket')}
                      className="p-3.5 rounded-2xl border-2 border-slate-200 hover:border-purple-600 bg-white hover:bg-purple-50/20 transition cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                          <ShoppingCart className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs">Supermarket / Retail POS</h4>
                          <p className="text-[10px] text-slate-500">80mm thermal roll, monospace, savings breakdown</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">Load</span>
                    </div>

                    {/* Preset 2 */}
                    <div
                      onClick={() => loadPreset('software')}
                      className="p-3.5 rounded-2xl border-2 border-slate-200 hover:border-blue-600 bg-white hover:bg-blue-50/20 transition cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                          <Laptop className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs">Software & IT Services</h4>
                          <p className="text-[10px] text-slate-500">Corporate A4 tech invoice, bank wire & digital seal</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">Load</span>
                    </div>

                    {/* Preset 3 */}
                    <div
                      onClick={() => loadPreset('furniture')}
                      className="p-3.5 rounded-2xl border-2 border-slate-200 hover:border-amber-700 bg-white hover:bg-amber-50/20 transition cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                          <Armchair className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs">Furniture Showroom</h4>
                          <p className="text-[10px] text-slate-500">Luxury architectural A4 invoice with warranty terms</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-lg">Load</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <label className="block font-bold text-slate-700 mb-1">Custom Theme Name</label>
                    <input
                      type="text"
                      value={config.theme_name}
                      onChange={e => updateField('theme_name', e.target.value)}
                      placeholder="e.g. My Premium Store Theme"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-purple-600 outline-none text-slate-900 font-semibold"
                    />
                  </div>
                </div>
              )}

              {/* ── TAB 2: BRAND COLORS & STYLING ── */}
              {activeTab === 'colors' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Theme Color Palette</h3>
                    <p className="text-slate-500 text-[11px] mt-0.5">Customize headers, accents, and table brand colors:</p>
                  </div>

                  {/* Primary Color Picker */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <label className="block font-bold text-slate-800">Primary Brand Accent Color</label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={config.primary_color || '#2563eb'}
                        onChange={e => updateField('primary_color', e.target.value)}
                        className="w-10 h-10 rounded-xl cursor-pointer border border-slate-300"
                      />
                      <input
                        type="text"
                        value={config.primary_color || '#2563eb'}
                        onChange={e => updateField('primary_color', e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 font-mono font-bold text-xs"
                      />
                    </div>
                    {/* Quick color dots */}
                    <div className="flex items-center space-x-2 pt-1">
                      {['#000000', '#2563eb', '#92400e', '#059669', '#7c3aed', '#dc2626', '#0f172a'].map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => updateField('primary_color', c)}
                          style={{ backgroundColor: c }}
                          className="w-5 h-5 rounded-full border-2 border-white shadow-xs hover:scale-110 transition cursor-pointer"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Header Background Color */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <label className="block font-bold text-slate-800">Header Background Tint</label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={config.header_bg_color || '#ffffff'}
                        onChange={e => updateField('header_bg_color', e.target.value)}
                        className="w-10 h-10 rounded-xl cursor-pointer border border-slate-300"
                      />
                      <input
                        type="text"
                        value={config.header_bg_color || '#ffffff'}
                        onChange={e => updateField('header_bg_color', e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 font-mono font-bold text-xs"
                      />
                    </div>
                  </div>

                  {/* Body Text Color */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <label className="block font-bold text-slate-800">Primary Text Color</label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={config.text_color || '#0f172a'}
                        onChange={e => updateField('text_color', e.target.value)}
                        className="w-10 h-10 rounded-xl cursor-pointer border border-slate-300"
                      />
                      <input
                        type="text"
                        value={config.text_color || '#0f172a'}
                        onChange={e => updateField('text_color', e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 font-mono font-bold text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 3: TYPOGRAPHY & FONT ── */}
              {activeTab === 'typography' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Typography & Sizing</h3>
                    <p className="text-slate-500 text-[11px] mt-0.5">Select font family and size scaling for print:</p>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Font Family</label>
                    <select
                      value={config.font_family}
                      onChange={e => updateField('font_family', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium text-slate-900 outline-none"
                    >
                      <option value="Inter, -apple-system, sans-serif">Modern Sans-Serif (Inter / System UI)</option>
                      <option value="'Courier New', Courier, monospace">Monospace POS Receipt (Courier New)</option>
                      <option value="Georgia, Cambria, serif">Classic Luxury Serif (Georgia / Cambria)</option>
                      <option value="'Roboto', sans-serif">Clean Industrial (Roboto)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Base Font Scaling</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'compact', label: 'Compact (10px)' },
                        { id: 'medium', label: 'Medium (12px)' },
                        { id: 'large', label: 'Spacious (13px)' }
                      ].map(sz => (
                        <button
                          key={sz.id}
                          type="button"
                          onClick={() => updateField('font_size', sz.id)}
                          className={`p-2.5 rounded-xl border font-bold text-center transition cursor-pointer ${
                            config.font_size === sz.id
                              ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {sz.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 4: LAYOUT & PAPER GEOMETRY ── */}
              {activeTab === 'layout' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Paper Geometry & Formats</h3>
                    <p className="text-slate-500 text-[11px] mt-0.5">Choose paper size for printer compatibility:</p>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Paper Layout Format</label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {[
                        { id: 'thermal_80mm', label: '80mm Thermal Roll', desc: 'Standard POS receipt printer' },
                        { id: 'thermal_58mm', label: '58mm Compact Roll', desc: 'Mini handheld thermal roll' },
                        { id: 'a4', label: 'A4 Full Page (Portrait)', desc: 'Laser / Inkjet office printers' },
                        { id: 'a5', label: 'A5 Half Page', desc: 'Compact stationery bill' }
                      ].map(fmt => (
                        <button
                          key={fmt.id}
                          type="button"
                          onClick={() => {
                            updateField('layout_type', fmt.id);
                            setPreviewDevice(fmt.id === 'a4' || fmt.id === 'a5' ? 'a4' : 'thermal');
                          }}
                          className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                            config.layout_type === fmt.id
                              ? 'bg-purple-50/70 border-purple-600 text-purple-900'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <strong className="block font-bold text-xs">{fmt.label}</strong>
                          <span className="text-[10px] text-slate-500">{fmt.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Container Border Style</label>
                    <select
                      value={config.border_style}
                      onChange={e => updateField('border_style', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium text-slate-900 outline-none"
                    >
                      <option value="none">None / Borderless Clean</option>
                      <option value="dashed">Dashed Receipt Line (POS Style)</option>
                      <option value="card">Modern Rounded Card Border</option>
                      <option value="luxury">Luxury Architectural Border</option>
                    </select>
                  </div>
                </div>
              )}

              {/* ── TAB 5: HEADER & STORE IDENTITY ── */}
              {activeTab === 'header' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Header & Store Branding</h3>
                    <p className="text-slate-500 text-[11px] mt-0.5">Control company information visible on the bill:</p>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Invoice Document Title</label>
                    <input
                      type="text"
                      value={config.invoice_title}
                      onChange={e => updateField('invoice_title', e.target.value)}
                      placeholder="TAX INVOICE / CASH MEMO"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Header Layout Alignment</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['center', 'split', 'left'].map(al => (
                        <button
                          key={al}
                          type="button"
                          onClick={() => updateField('header_alignment', al)}
                          className={`p-2 rounded-xl border font-bold capitalize transition cursor-pointer ${
                            config.header_alignment === al
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'bg-white text-slate-700 border-slate-200'
                          }`}
                        >
                          {al}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <span className="font-bold text-slate-800 block text-xs">Visible Header Elements</span>
                    {[
                      { key: 'show_logo', label: 'Show Company Logo / Emblem' },
                      { key: 'show_subtitle', label: 'Show Tagline / Business Subtitle' },
                      { key: 'show_phone', label: 'Show Store Phone Number' },
                      { key: 'show_email', label: 'Show Store Email' },
                      { key: 'show_address', label: 'Show Store Physical Address' },
                      { key: 'show_gstin', label: 'Show Store GSTIN Number' },
                      { key: 'show_fssai', label: 'Show FSSAI License Number' }
                    ].map(itm => (
                      <label key={itm.key} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer">
                        <span className="font-medium text-slate-700">{itm.label}</span>
                        <input
                          type="checkbox"
                          checked={config[itm.key]}
                          onChange={e => updateField(itm.key, e.target.checked)}
                          className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* ── TAB 6: ITEM TABLE COLUMNS ── */}
              {activeTab === 'columns' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Line Items Table Columns</h3>
                    <p className="text-slate-500 text-[11px] mt-0.5">Choose which product columns to display:</p>
                  </div>

                  <div className="space-y-2">
                    {[
                      { key: 'show_sku', label: 'Product SKU / Item Code' },
                      { key: 'show_hsn', label: 'HSN / SAC Code Column' },
                      { key: 'show_mrp', label: 'Show Maximum Retail Price (MRP)' },
                      { key: 'show_discount', label: 'Show Discount Column & Line Savings' },
                      { key: 'show_tax_rate', label: 'Show GST Rate % per line item' },
                      { key: 'show_tax_breakdown', label: 'Show CGST / SGST / IGST summary breakdown' }
                    ].map(col => (
                      <label key={col.key} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer">
                        <span className="font-medium text-slate-700">{col.label}</span>
                        <input
                          type="checkbox"
                          checked={config[col.key]}
                          onChange={e => updateField(col.key, e.target.checked)}
                          className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* ── TAB 7: BANK & REMITTANCE ── */}
              {activeTab === 'bank' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Bank Remittance Box</h3>
                      <p className="text-slate-500 text-[11px] mt-0.5">Show banking details for direct wire transfer / UPI:</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.show_bank_details}
                      onChange={e => updateField('show_bank_details', e.target.checked)}
                      className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                    />
                  </div>

                  {config.show_bank_details && (
                    <div className="space-y-3 pt-2">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Bank Name</label>
                        <input
                          type="text"
                          value={config.bank_name || ''}
                          onChange={e => updateField('bank_name', e.target.value)}
                          placeholder="e.g. HDFC Bank Ltd"
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-300 outline-none text-xs"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Account Number</label>
                        <input
                          type="text"
                          value={config.bank_account_no || ''}
                          onChange={e => updateField('bank_account_no', e.target.value)}
                          placeholder="e.g. 50200084920194"
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-300 font-mono outline-none text-xs"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">IFSC / Branch Code</label>
                        <input
                          type="text"
                          value={config.bank_ifsc || ''}
                          onChange={e => updateField('bank_ifsc', e.target.value)}
                          placeholder="e.g. HDFC0001248"
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-300 font-mono outline-none text-xs"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">UPI ID (Google Pay / PhonePe)</label>
                        <input
                          type="text"
                          value={config.bank_upi || ''}
                          onChange={e => updateField('bank_upi', e.target.value)}
                          placeholder="e.g. company@okhdfcbank"
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-300 font-mono outline-none text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB 8: TERMS & SIGNATURES ── */}
              {activeTab === 'footer' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Terms & Signatures</h3>
                    <p className="text-slate-500 text-[11px] mt-0.5">Customize legal terms, return policy & signatures:</p>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Terms & Conditions</label>
                    <textarea
                      rows={3}
                      value={config.terms_and_conditions || ''}
                      onChange={e => updateField('terms_and_conditions', e.target.value)}
                      placeholder="e.g. 1. Goods once sold will not be returned..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Footer Greeting Text</label>
                    <input
                      type="text"
                      value={config.footer_greeting || ''}
                      onChange={e => updateField('footer_greeting', e.target.value)}
                      placeholder="**** Thank You Visit Again ****"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none font-bold text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Signature Section Style</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'none', label: 'No Signature' },
                        { id: 'single', label: 'Single Authorized Sign' },
                        { id: 'dual', label: 'Dual (Client + Store)' },
                        { id: 'stamp', label: 'Verified Digital Seal' }
                      ].map(sig => (
                        <button
                          key={sig.id}
                          type="button"
                          onClick={() => updateField('show_signatures', sig.id)}
                          className={`p-2.5 rounded-xl border font-bold text-xs text-left transition cursor-pointer ${
                            config.show_signatures === sig.id
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {sig.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* ── RIGHT PANEL: REAL-TIME LIVE PREVIEW (WYSIWYG) ── */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-slate-200/70 p-4 sm:p-6">
            
            {/* Live Preview Controls Topbar */}
            <div className="flex items-center justify-between pb-3 shrink-0">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-bold text-slate-700">Real-Time WYSIWYG Preview</span>
              </div>

              {/* View scale selector */}
              <div className="flex p-0.5 bg-white border border-slate-300 rounded-xl text-xs font-bold shadow-xs">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('thermal')}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                    previewDevice === 'thermal' ? 'bg-purple-600 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  80mm Thermal
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('a4')}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                    previewDevice === 'a4' ? 'bg-purple-600 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  A4 Corporate
                </button>
              </div>
            </div>

            {/* Live Render Area */}
            <div className="flex-1 overflow-y-auto p-4 flex justify-center items-start rounded-2xl bg-slate-300/40 border border-slate-300/60 shadow-inner">
              <InvoicePDF
                invoiceNumber="INV-2026-LIVE001"
                cartItems={SAMPLE_CUSTOMIZER_ITEMS}
                customer={{
                  name: 'Apex Global Enterprises',
                  phone: '+91 98470 12345',
                  email: 'billing@apexglobal.com',
                  address: 'Suite 402, HighTech World Towers, Infopark Kochi',
                  gstin: '32AABCA8912P1ZM'
                }}
                summary={{
                  subtotal: 61000.0,
                  totalDiscount: 1700.0,
                  taxableAmount: 59300.0,
                  totalCGST: 5337.0,
                  totalSGST: 5337.0,
                  totalIGST: 0.0,
                  roundOff: 0.0,
                  bill_total: 72000.0,
                  grandTotal: 69974.0,
                  savings: 1700.0
                }}
                saleType="intra"
                paymentMethod="Bank Transfer / UPI"
                billerName="Admin Manager"
                amountPaid={69974.0}
                transactionId="TXN-2026-94819"
                preview={false}
                settings={{
                  ...initialSettings,
                  bill_theme: 'custom',
                  store_name: initialSettings?.store_name || 'AURUM ENTERPRISES',
                  store_subtitle: initialSettings?.store_subtitle || 'Enterprise Technology & Living Solutions',
                  store_address: initialSettings?.store_address || 'Trivandrum Central Technopark, Kerala - 695001',
                  store_phone: initialSettings?.store_phone || '9895820417, 0471-224488',
                  store_email: initialSettings?.store_email || 'billing@aurumworks.com',
                  gstin: initialSettings?.gstin || '32DPHPB3199N1ZL',
                  custom_theme_config: config
                }}
                theme="custom"
                customConfig={config}
              />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
