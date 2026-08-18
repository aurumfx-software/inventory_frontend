import React, { useState, useEffect } from 'react';
import { 
  Users, Activity, CreditCard, BarChart3, Mail, Settings, LogOut, Bell, Calendar, User, Search,
  Plus, Edit2, Trash2, Printer, FileText, Percent, Sliders, CheckCircle2, X, ArrowLeft, RefreshCw, ChevronDown, Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function BillingPOS({ onBackToLogin }) {
  const { user } = useAuth();

  // Active Billing Tab State
  const [activeTab, setActiveTab] = useState('Itemized Charges'); // 'Itemized Charges' | 'Payments' | 'Adjustments' | 'Payment History'

  // Profile / Customer Data (Inventory Software Content)
  const [customer, setCustomer] = useState({
    id: 'C-2026-07155',
    name: 'SARAH JENKINS / DELL INDIA PVT LTD',
    code: 'CUST-IT-001',
    dept: 'Information Technology / Central Store (WH-MAIN)',
    ref_indent: 'IND-2026-001001',
    date: '07/20/2026'
  });

  // Master Inventory Items for Selection (Live API Sync)
  const [masterItems, setMasterItems] = useState([
    { id: 'itm-01', name: 'Dell Latitude 5440 Laptop', category: 'IT Equipment', price: 72000, code: 'IT-LAP-0001' },
    { id: 'itm-02', name: 'Cat6 Ethernet Cable (305m Drum)', category: 'Electrical', price: 4500, code: 'ELE-CBL-0002' },
    { id: 'itm-03', name: 'A4 Copy Paper 80GSM (Rim)', category: 'Office Supplies', price: 280, code: 'OFF-PPR-0003' },
    { id: 'itm-04', name: 'Industrial Cleaning Solvent C-40', category: 'Chemicals', price: 1850, code: 'RAW-CHM-0004' },
    { id: 'itm-05', name: 'Logitech Wireless Ergonomic Mouse', category: 'IT Equipment', price: 1490, code: 'IT-MOU-0005' },
    { id: 'itm-06', name: 'Ergonomic Mesh Executive Chair', category: 'Office Supplies', price: 8900, code: 'OFF-DES-0006' }
  ]);

  // Fetch Live Backend Items API
  useEffect(() => {
    fetch('/api/items')
      .then(r => r.json())
      .then(res => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const mapped = res.data.map(i => ({
            id: i.id,
            name: i.item_name,
            category: i.category || i.category_id || 'IT Equipment',
            price: i.valuation_rate || 1000,
            code: i.item_code
          }));
          setMasterItems(mapped);
        }
      })
      .catch(err => console.warn('API items connection warning:', err));
  }, []);

  // Itemized Charges List (Cart)
  const [charges, setCharges] = useState([
    { id: 'chg-1', date: '07/18/2026', category: 'IT Equipment', description: 'Dell Latitude 5440 Laptop', qty: 1, unitPrice: 72000, amount: 72000 },
    { id: 'chg-2', date: '07/18/2026', category: 'Electrical', description: 'Cat6 Ethernet Cable (305m Drum)', qty: 1, unitPrice: 4500, amount: 4500 },
    { id: 'chg-3', date: '07/19/2026', category: 'Office Supplies', description: 'A4 Copy Paper 80GSM (Rim)', qty: 5, unitPrice: 280, amount: 1400 },
    { id: 'chg-4', date: '07/19/2026', category: 'Chemicals', description: 'Industrial Cleaning Solvent C-40', qty: 2, unitPrice: 1850, amount: 3700 },
    { id: 'chg-5', date: '07/20/2026', category: 'IT Equipment', description: 'Logitech Wireless Ergonomic Mouse', qty: 3, unitPrice: 1490, amount: 4470 }
  ]);

  // Recorded Payments Summary List
  const [payments, setPayments] = useState([
    { id: 'pay-1', date: '07/18/2026', refNo: 'OR00011234', method: 'Cash', amount: 30000, receivedBy: 'Billing Staff' },
    { id: 'pay-2', date: '07/19/2026', refNo: 'OR00011278', method: 'Card', amount: 24500, receivedBy: 'Billing Staff' },
    { id: 'pay-3', date: '07/20/2026', refNo: 'OR00011321', method: 'UPI', amount: 10000, receivedBy: 'Billing Staff' }
  ]);

  // Form Input States
  const [newCategory, setNewCategory] = useState('IT Equipment');
  const [newDesc, setNewDesc] = useState('Dell Latitude 5440 Laptop');
  const [newQty, setNewQty] = useState(1);
  const [newUnitPrice, setNewUnitPrice] = useState(72000);
  const [newChargeDate, setNewChargeDate] = useState('2026-07-20');

  const [payMethod, setPayMethod] = useState('Select Payment Method');
  const [payAmount, setPayAmount] = useState('');
  const [payRefNo, setPayRefNo] = useState('');

  const [discountAmount, setDiscountAmount] = useState(0);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);

  // Financial Calculations
  const totalCharges = charges.reduce((acc, c) => acc + c.amount, 0);
  const totalPayments = payments.reduce((acc, p) => acc + p.amount, 0);
  const balanceDue = Math.max(0, totalCharges - totalPayments - discountAmount);

  // Update unit price automatically when selecting a description product
  const handleSelectProduct = (descName) => {
    setNewDesc(descName);
    const found = masterItems.find(i => i.name === descName);
    if (found) {
      setNewCategory(found.category);
      setNewUnitPrice(found.price);
    }
  };

  // Add New Charge Handler & Post to Audit Log API
  const handleAddCharge = async (e) => {
    e.preventDefault();
    if (!newDesc || newQty <= 0) return;
    const amount = newQty * newUnitPrice;
    const newEntry = {
      id: `chg-${Date.now()}`,
      date: newChargeDate.split('-').slice(1).join('/') + '/2026',
      category: newCategory,
      description: newDesc,
      qty: Number(newQty),
      unitPrice: Number(newUnitPrice),
      amount: amount
    };
    setCharges([...charges, newEntry]);
    
    // API Call to post audit log
    try {
      await fetch('/api/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'BILLING_CHARGE_ADDED',
          module: 'BILLING',
          details: `Added charge ${newDesc} (Qty: ${newQty}, Amount: ₹${amount})`
        })
      });
    } catch (err) {
      console.warn('API audit log post error:', err);
    }

    setNewQty(1);
  };

  // Record Payment Handler & Post to API
  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!payAmount || Number(payAmount) <= 0 || payMethod === 'Select Payment Method') {
      alert('Please select a payment method and enter a valid amount.');
      return;
    }
    const newPay = {
      id: `pay-${Date.now()}`,
      date: '07/20/2026',
      refNo: payRefNo || `OR000${Math.floor(100000 + Math.random() * 900000)}`,
      method: payMethod,
      amount: Number(payAmount),
      receivedBy: user?.name || 'Billing Staff'
    };
    setPayments([...payments, newPay]);

    // API Call to log payment settlement
    try {
      await fetch('/api/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'BILLING_PAYMENT_RECORDED',
          module: 'BILLING',
          details: `Recorded payment ₹${payAmount} via ${payMethod} (Ref: ${newPay.refNo})`
        })
      });
    } catch (err) {
      console.warn('API payment log error:', err);
    }

    setPayAmount('');
    setPayRefNo('');
    setPayMethod('Select Payment Method');
  };

  // Delete Charge Row
  const handleDeleteCharge = (id) => {
    setCharges(charges.filter(c => c.id !== id));
  };

  // Delete Payment Row
  const handleDeletePayment = (id) => {
    setPayments(payments.filter(p => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-800 font-sans flex flex-col select-none">
      
      {/* 1. TOP NAVIGATION HEADER BAR (NO 3-LINE ICON, INVENTORY MANAGEMENT SYSTEM TITLE) */}
      <header className="h-14 bg-[#0a1931] text-white px-5 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center space-x-3">
          {onBackToLogin && (
            <button 
              onClick={onBackToLogin}
              className="bg-blue-600/60 hover:bg-blue-600 text-white px-3 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 border border-blue-400/40 transition cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to System</span>
            </button>
          )}

          <div className="flex items-center space-x-2">
            <span className="font-black text-base tracking-wide font-heading text-white">INVENTORY MANAGEMENT SYSTEM</span>
            <span className="text-xs text-blue-300 font-medium hidden sm:inline-block border-l border-slate-600 pl-2">
              Billing & Invoicing Portal
            </span>
          </div>
        </div>

        {/* Right Header Info: Bell, Date & Time, User Avatar */}
        <div className="flex items-center space-x-5 text-xs">
          <div className="relative cursor-pointer">
            <Bell className="w-4 h-4 text-slate-300 hover:text-white" />
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
              3
            </span>
          </div>

          <div className="flex items-center space-x-1.5 text-slate-300 font-medium">
            <Calendar className="w-3.5 h-3.5" />
            <span>July 20, 2026 | 10:30 AM</span>
          </div>

          <div className="flex items-center space-x-2.5 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
            <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs">
              <User className="w-4 h-4" />
            </div>
            <div className="text-left leading-tight">
              <span className="font-bold text-white block text-xs">{user?.name || 'Billing Staff'}</span>
              <span className="text-[10px] text-slate-400 block font-mono">Cashier</span>
            </div>
          </div>
        </div>
      </header>

      {/* BODY LAYOUT: LEFT SIDEBAR + MAIN CONTENT AREA */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* 2. LEFT SIDEBAR (NO DASHBOARD, INVENTORY SYSTEM NAVIGATION) */}
        <aside className="w-60 bg-[#0a1931] text-slate-300 flex flex-col justify-between shrink-0 shadow-lg border-r border-slate-800">
          <div className="py-4 space-y-1 overflow-y-auto">
            {[
              { label: 'Customer Management', icon: Users },
              { label: 'Item Master & Stock', icon: Activity },
              { label: 'Indents & Requisitions', icon: FileText },
              { label: 'Purchase Orders', icon: CreditCard },
              { label: 'Goods Receipt (GRN)', icon: Activity },
              { label: 'Billing Update', icon: BarChart3, active: true },
              { label: 'Reports', icon: BarChart3 },
              { label: 'Messages', icon: Mail, badge: 2 },
              { label: 'Settings', icon: Settings }
            ].map((item, idx) => (
              <button
                key={idx}
                className={`w-full px-5 py-2.5 flex items-center justify-between text-xs font-semibold transition cursor-pointer ${
                  item.active 
                    ? 'bg-[#1d4ed8] text-white font-bold shadow-md' 
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className={`w-4 h-4 ${item.active ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-4 border-t border-slate-800">
            <button 
              onClick={onBackToLogin}
              className="w-full flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Exit Billing</span>
            </button>
          </div>
        </aside>

        {/* 3. MAIN CONTENT AREA (NO DASHBOARD BREADCRUMB) */}
        <main className="flex-1 p-6 overflow-y-auto space-y-5">
          
          {/* Page Title & Breadcrumb without separate Dashboard */}
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight font-heading">Billing Update</h1>
            <div className="text-xs text-slate-500 font-medium space-x-1 mt-0.5">
              <span>Billing</span>
              <span>&gt;</span>
              <span className="text-blue-700 font-semibold">Billing Update</span>
            </div>
          </div>

          {/* TOP INFO PROFILE CARD + BALANCE DUE SUMMARY CARD */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            
            {/* Left 3 Cols: Customer / Requester Details Box */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <User className="w-8 h-8" />
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center space-x-4 text-xs">
                    <span className="text-slate-500 font-medium">Customer / Requester ID</span>
                    <span className="font-bold text-slate-900 font-mono">{customer.id}</span>
                    
                    <span className="text-slate-400">|</span>
                    
                    <span className="text-slate-500 font-medium">Dept / Store</span>
                    <span className="font-bold text-slate-900">{customer.dept}</span>
                  </div>

                  <div className="flex items-center space-x-4 text-xs pt-1">
                    <span className="text-slate-500 font-medium">Customer Name</span>
                    <span className="font-bold text-slate-900 text-sm font-heading">{customer.name}</span>
                    
                    <span className="text-slate-400">|</span>
                    
                    <span className="text-slate-500 font-medium">Ref Indent</span>
                    <span className="font-bold text-blue-700 font-mono">{customer.ref_indent}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 1 Col: Balance Due Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-center items-center text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">BALANCE DUE</span>
              <span className="text-2xl font-black text-purple-700 font-mono mt-1">
                ₹ {balanceDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* MAIN BILLING TABS & TABLES vs RIGHT SETTLEMENT PANEL */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* LEFT 2 COLS: Tab Navigation, Itemized Charges Table, Payment Summary Table */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Main Tabs Bar */}
              <div className="bg-white rounded-2xl border border-slate-200 p-1 shadow-2xs flex items-center space-x-1">
                {['Itemized Charges', 'Payments', 'Adjustments', 'Payment History'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border-b-2 ${
                      activeTab === tab 
                        ? 'border-blue-700 text-blue-700 bg-blue-50/50' 
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* ITEMIZED CHARGES TABLE CONTAINER */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                        <th className="p-2.5">Date</th>
                        <th className="p-2.5">Category</th>
                        <th className="p-2.5">Description</th>
                        <th className="p-2.5 text-center">Qty</th>
                        <th className="p-2.5 text-right">Unit Price</th>
                        <th className="p-2.5 text-right">Amount</th>
                        <th className="p-2.5 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {charges.map(row => (
                        <tr key={row.id} className="hover:bg-slate-50 transition">
                          <td className="p-2.5 text-slate-500 font-mono">{row.date}</td>
                          <td className="p-2.5 font-semibold text-slate-800">{row.category}</td>
                          <td className="p-2.5 text-slate-900 font-bold">{row.description}</td>
                          <td className="p-2.5 text-center font-mono font-bold">{row.qty}</td>
                          <td className="p-2.5 text-right font-mono">₹ {row.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                          <td className="p-2.5 text-right font-mono font-bold text-slate-900">₹ {row.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                          <td className="p-2.5 text-center">
                            <div className="flex items-center justify-center space-x-1.5">
                              <button className="text-blue-600 hover:text-blue-800 p-1 cursor-pointer">
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => handleDeleteCharge(row.id)} className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer Action & Total Charges */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button 
                    onClick={() => {
                      document.getElementById('add-charge-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs rounded-xl hover:bg-blue-100 transition cursor-pointer flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add New Charge</span>
                  </button>

                  <div className="text-right">
                    <span className="text-xs font-bold text-blue-900 mr-3">TOTAL CHARGES</span>
                    <span className="text-lg font-black text-blue-900 font-mono">
                      ₹ {totalCharges.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* PAYMENTS SUMMARY TABLE CONTAINER */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900">PAYMENTS SUMMARY</h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                        <th className="p-2.5">Date</th>
                        <th className="p-2.5">OR / Reference No.</th>
                        <th className="p-2.5">Payment Method</th>
                        <th className="p-2.5 text-right">Amount (₹)</th>
                        <th className="p-2.5">Received By</th>
                        <th className="p-2.5 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {payments.map(p => (
                        <tr key={p.id} className="hover:bg-slate-50 transition">
                          <td className="p-2.5 text-slate-500 font-mono">{p.date}</td>
                          <td className="p-2.5 font-bold font-mono text-slate-800">{p.refNo}</td>
                          <td className="p-2.5 font-semibold text-slate-900">{p.method}</td>
                          <td className="p-2.5 text-right font-mono font-bold text-slate-900">₹ {p.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                          <td className="p-2.5 text-slate-600">{p.receivedBy}</td>
                          <td className="p-2.5 text-center">
                            <button onClick={() => handleDeletePayment(p.id)} className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Payments Total Summary */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-xs font-bold text-emerald-800">TOTAL PAYMENTS</span>
                  <span className="text-lg font-black text-emerald-600 font-mono">
                    ₹ {totalPayments.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT 1 COL: Billing Overview, Add New Charge Card, Payment Quick Entry Card & 4 Action Buttons */}
            <div className="space-y-4">
              
              {/* 1. BILLING OVERVIEW CARD */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="bg-[#1d4ed8] text-white px-4 py-2.5 font-bold text-xs tracking-wider uppercase font-heading">
                  BILLING OVERVIEW
                </div>
                
                <div className="p-4 space-y-2 text-xs font-medium">
                  <div className="flex justify-between text-slate-600">
                    <span>Total Charges</span>
                    <span className="font-mono font-bold text-slate-900">₹ {totalCharges.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  
                  <div className="flex justify-between text-emerald-600">
                    <span>Total Payments</span>
                    <span className="font-mono font-bold">₹ {totalPayments.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  
                  <div className="flex justify-between text-slate-600">
                    <span>Discount / Adjustment</span>
                    <span className="font-mono font-bold">₹ {discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>

                  <div className="flex justify-between items-center text-sm font-bold text-purple-800 pt-2 border-t border-slate-200">
                    <span>Balance Due</span>
                    <span className="text-base font-black font-mono">₹ {balanceDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* 2. ADD NEW CHARGE CARD */}
              <div id="add-charge-section" className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900">ADD NEW CHARGE</h3>
                
                <form onSubmit={handleAddCharge} className="space-y-2.5 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Category</label>
                    <select 
                      value={newCategory}
                      onChange={e => setNewCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-slate-800 text-xs font-medium"
                    >
                      <option value="IT Equipment">IT Equipment</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Office Supplies">Office Supplies</option>
                      <option value="Chemicals">Chemicals</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Description / Inventory Item</label>
                    <select 
                      value={newDesc}
                      onChange={e => handleSelectProduct(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-slate-800 text-xs font-medium"
                    >
                      {masterItems.map(item => (
                        <option key={item.id} value={item.name}>{item.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Quantity</label>
                      <input 
                        type="number" 
                        min="1"
                        value={newQty}
                        onChange={e => setNewQty(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 font-mono text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Unit Price (₹)</label>
                      <input 
                        type="number" 
                        value={newUnitPrice}
                        onChange={e => setNewUnitPrice(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 font-mono text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Date</label>
                    <input 
                      type="date" 
                      value={newChargeDate}
                      onChange={e => setNewChargeDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-slate-800 text-xs font-medium"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-[#001f54] hover:bg-blue-900 text-white font-bold text-xs py-2 rounded-xl transition cursor-pointer shadow-2xs mt-1"
                  >
                    Add Charge
                  </button>
                </form>
              </div>

              {/* 3. PAYMENT QUICK ENTRY CARD */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900">PAYMENT QUICK ENTRY</h3>
                
                <form onSubmit={handleRecordPayment} className="space-y-2.5 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Payment Method</label>
                    <select 
                      value={payMethod}
                      onChange={e => setPayMethod(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-slate-800 text-xs font-medium"
                    >
                      <option value="Select Payment Method">Select Payment Method</option>
                      <option value="Cash">Cash</option>
                      <option value="Card">Credit / Debit Card</option>
                      <option value="UPI">UPI / QR Code</option>
                      <option value="Net Banking">Net Banking</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Amount (₹)</label>
                      <input 
                        type="number" 
                        value={payAmount}
                        onChange={e => setPayAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 font-mono text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-0.5">OR / Reference No.</label>
                      <input 
                        type="text" 
                        value={payRefNo}
                        onChange={e => setPayRefNo(e.target.value)}
                        placeholder="Enter OR No."
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 font-mono text-xs"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-[#059669] hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded-xl transition cursor-pointer shadow-2xs mt-1"
                  >
                    Record Payment
                  </button>
                </form>
              </div>

              {/* 4. FOUR BOTTOM ACTION BUTTONS GRID */}
              <div className="grid grid-cols-4 gap-2">
                <button 
                  onClick={() => setShowPrintModal(true)}
                  className="bg-white border border-slate-200 hover:border-blue-400 p-3 rounded-2xl flex flex-col items-center justify-center text-center shadow-2xs transition cursor-pointer hover:bg-blue-50/50"
                >
                  <Printer className="w-5 h-5 text-blue-600 mb-1" />
                  <span className="text-[10px] font-bold text-slate-700 leading-tight">Print Bill</span>
                </button>

                <button 
                  onClick={() => setShowPrintModal(true)}
                  className="bg-white border border-slate-200 hover:border-blue-400 p-3 rounded-2xl flex flex-col items-center justify-center text-center shadow-2xs transition cursor-pointer hover:bg-blue-50/50"
                >
                  <FileText className="w-5 h-5 text-blue-600 mb-1" />
                  <span className="text-[10px] font-bold text-slate-700 leading-tight">View Statement</span>
                </button>

                <button 
                  onClick={() => setShowDiscountModal(true)}
                  className="bg-white border border-slate-200 hover:border-amber-400 p-3 rounded-2xl flex flex-col items-center justify-center text-center shadow-2xs transition cursor-pointer hover:bg-amber-50/50"
                >
                  <Percent className="w-5 h-5 text-amber-600 mb-1" />
                  <span className="text-[10px] font-bold text-slate-700 leading-tight">Apply Discount</span>
                </button>

                <button 
                  onClick={() => setShowAdjustmentModal(true)}
                  className="bg-white border border-slate-200 hover:border-purple-400 p-3 rounded-2xl flex flex-col items-center justify-center text-center shadow-2xs transition cursor-pointer hover:bg-purple-50/50"
                >
                  <Sliders className="w-5 h-5 text-purple-600 mb-1" />
                  <span className="text-[10px] font-bold text-slate-700 leading-tight">Add Adjustment</span>
                </button>
              </div>

            </div>

          </div>

          {/* FOOTER NOTICE */}
          <div className="text-center pt-4 border-t border-slate-200 text-[11px] text-slate-500 font-medium">
            This system is for authorized users only. All transactions are logged and monitored.
          </div>

        </main>
      </div>

      {/* PRINT STATEMENT / BILL PDF MODAL */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white text-slate-900 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden font-sans">
            <div className="px-6 py-4 bg-[#0a1931] text-white flex justify-between items-center">
              <h3 className="font-bold text-xs uppercase tracking-wider font-heading">Billing Statement & Official Receipt</h3>
              <button onClick={() => setShowPrintModal(false)} className="text-slate-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-8 overflow-y-auto space-y-6 text-xs text-slate-800">
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 font-heading">INVENTORY MANAGEMENT SYSTEM</h2>
                  <p className="text-[11px] text-slate-500">100 Industrial Park, Zone 4, Bangalore, KA - 560001</p>
                  <p className="text-[11px] text-slate-500">GSTIN: <strong>29AAAAA0000A1Z5</strong></p>
                </div>
                <div className="text-right">
                  <span className="bg-blue-100 text-blue-800 font-bold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider block mb-1">BILLING STATEMENT</span>
                  <p className="font-mono text-sm font-bold text-slate-900">REF: {customer.ref_indent}</p>
                  <p className="text-[11px] text-slate-500 font-mono">Date: 07/20/2026</p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Customer / Requester:</span>
                  <span className="font-bold text-slate-900 block">{customer.name}</span>
                  <span className="text-slate-600 block">ID: {customer.id}</span>
                  <span className="text-slate-600 block">Dept: {customer.dept}</span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Statement Summary:</span>
                  <p>Total Charges: ₹ {totalCharges.toLocaleString()}</p>
                  <p>Total Payments: ₹ {totalPayments.toLocaleString()}</p>
                  <p className="font-bold text-purple-700 text-sm">Balance Due: ₹ {balanceDue.toLocaleString()}</p>
                </div>
              </div>

              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Category</th>
                    <th className="py-2 px-3">Description</th>
                    <th className="py-2 px-3 text-center">Qty</th>
                    <th className="py-2 px-3 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {charges.map(row => (
                    <tr key={row.id}>
                      <td className="py-2 px-3 text-slate-500">{row.date}</td>
                      <td className="py-2 px-3">{row.category}</td>
                      <td className="py-2 px-3 font-sans font-bold text-slate-900">{row.description}</td>
                      <td className="py-2 px-3 text-center font-bold">{row.qty}</td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900">₹ {row.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-100 flex justify-end space-x-3 border-t border-slate-200">
              <button onClick={() => setShowPrintModal(false)} className="px-4 py-2 bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer">Close</button>
              <button onClick={() => window.print()} className="px-5 py-2 bg-[#1d4ed8] hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-2 cursor-pointer">
                <Printer className="w-4 h-4" />
                <span>Print PDF Statement</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* APPLY DISCOUNT MODAL */}
      {showDiscountModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 uppercase font-heading">Apply Discount / Adjustment</h3>
              <button onClick={() => setShowDiscountModal(false)} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
            </div>

            <div className="space-y-3 text-xs">
              <label className="block text-slate-700 font-bold">Discount Amount (₹)</label>
              <input 
                type="number" 
                value={discountAmount}
                onChange={e => setDiscountAmount(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold text-sm text-slate-900"
              />
              <div className="flex justify-end space-x-2 pt-2">
                <button onClick={() => setShowDiscountModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl">Close</button>
                <button onClick={() => setShowDiscountModal(false)} className="px-5 py-2 bg-blue-700 text-white font-bold rounded-xl shadow-xs">Apply</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD ADJUSTMENT MODAL */}
      {showAdjustmentModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 uppercase font-heading">Add Credit Adjustment</h3>
              <button onClick={() => setShowAdjustmentModal(false)} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Adjustment Type</label>
                <select className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium">
                  <option>Credit Note / Return</option>
                  <option>Waiver</option>
                  <option>Special Promotion</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button onClick={() => setShowAdjustmentModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl">Cancel</button>
                <button onClick={() => setShowAdjustmentModal(false)} className="px-5 py-2 bg-purple-700 text-white font-bold rounded-xl shadow-xs">Save Adjustment</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
