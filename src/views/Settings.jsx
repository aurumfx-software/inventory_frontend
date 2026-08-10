import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Upload, Save } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('company');
  const [importRows, setImportRows] = useState('');
  const [importStatus, setImportStatus] = useState('');

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => d.success && setSettings(d.data));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (data.success) alert('Settings saved successfully.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleImport = async (type) => {
    setImportStatus('Processing bulk import...');
    try {
      const lines = importRows.trim().split('\n');
      const rows = lines.map(line => {
        const parts = line.split(',');
        return type === 'items' 
          ? { item_code: parts[0]?.trim(), item_name: parts[1]?.trim(), valuation_rate: parts[2]?.trim() }
          : { supplier_code: parts[0]?.trim(), supplier_name: parts[1]?.trim(), phone: parts[2]?.trim() };
      });

      const res = await fetch(`/api/import/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows })
      });
      const data = await res.json();
      if (data.success) {
        setImportStatus(data.message);
        setImportRows('');
      }
    } catch (err) {
      setImportStatus('Import failed.');
    }
  };

  if (!settings) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 border border-slate-200/80 rounded-2xl shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 font-heading flex items-center space-x-2">
          <SettingsIcon className="w-5 h-5 text-purple-600" />
          <span>System Configuration & Data Import Wizard</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">Company profile, document numbering series, valuation methods & CSV bulk migration.</p>
      </div>

      {/* Sub Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        <button onClick={() => setActiveSubTab('company')} className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeSubTab === 'company' ? 'bg-purple-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
          Company & Tax Profile
        </button>
        <button onClick={() => setActiveSubTab('numbering')} className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeSubTab === 'numbering' ? 'bg-purple-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
          Numbering Series Setup
        </button>
        <button onClick={() => setActiveSubTab('import')} className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeSubTab === 'import' ? 'bg-purple-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
          Bulk CSV Import Wizard
        </button>
      </div>

      {/* Forms */}
      {activeSubTab === 'company' && (
        <form onSubmit={handleSave} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4 text-xs max-w-2xl">
          <div>
            <label className="block text-slate-600 font-bold mb-1">Company Name</label>
            <input type="text" value={settings.company_name} onChange={e => setSettings({ ...settings, company_name: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800" />
          </div>
          <div>
            <label className="block text-slate-600 font-bold mb-1">Registered Address</label>
            <textarea rows="2" value={settings.address} onChange={e => setSettings({ ...settings, address: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-600 font-bold mb-1">GSTIN Tax ID</label>
              <input type="text" value={settings.tax_number} onChange={e => setSettings({ ...settings, tax_number: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono font-bold" />
            </div>
            <div>
              <label className="block text-slate-600 font-bold mb-1">Financial Year</label>
              <input type="text" value={settings.financial_year} onChange={e => setSettings({ ...settings, financial_year: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800" />
            </div>
          </div>
          <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-xl flex items-center space-x-2 shadow-xs">
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </form>
      )}

      {activeSubTab === 'numbering' && (
        <form onSubmit={handleSave} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4 text-xs max-w-xl">
          <p className="text-slate-500 font-bold text-xs mb-2">Concurrency-safe Document Counters:</p>
          {Object.keys(settings.numbering_series || {}).map(key => (
            <div key={key} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="font-bold text-purple-700 font-mono">{key} Series Counter</span>
              <input 
                type="number" 
                value={settings.numbering_series[key]} 
                onChange={e => setSettings({
                  ...settings,
                  numbering_series: { ...settings.numbering_series, [key]: Number(e.target.value) }
                })}
                className="bg-white border border-slate-200 rounded-lg px-3 py-1 text-slate-800 font-mono text-right w-32 font-bold"
              />
            </div>
          ))}
          <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-xl shadow-xs">Save Counters</button>
        </form>
      )}

      {activeSubTab === 'import' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4 text-xs max-w-2xl">
          <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider font-heading flex items-center space-x-2">
            <Upload className="w-4 h-4 text-purple-600" />
            <span>Bulk CSV Data Upload Wizard</span>
          </h3>
          <p className="text-slate-500 text-xs">Paste CSV lines (Comma Separated) for bulk migration into the local database:</p>

          <div>
            <label className="block text-slate-600 font-bold mb-1">CSV Content Format: (Code, Name, Rate or Phone)</label>
            <textarea 
              rows="5" 
              value={importRows}
              onChange={e => setImportRows(e.target.value)}
              placeholder="ITM-9001, Wireless Mouse Pro, 1200&#10;ITM-9002, Mechanical Keyboard RGB, 4500" 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono text-xs"
            />
          </div>

          {importStatus && <p className="text-emerald-700 font-bold font-mono">{importStatus}</p>}

          <div className="flex space-x-3">
            <button type="button" onClick={() => handleImport('items')} className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-xl shadow-xs">
              Import Items
            </button>
            <button type="button" onClick={() => handleImport('suppliers')} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl shadow-xs">
              Import Suppliers
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
