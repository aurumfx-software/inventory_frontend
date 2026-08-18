import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Search, Plus, Minus, Trash2, Printer, CheckCircle2, 
  CreditCard, DollarSign, QrCode, User, Building, ArrowLeft, RefreshCw, 
  Tag, ShieldCheck, FileText, Zap, Layers, Sparkles, Filter, ChevronRight, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function BillingPOS({ onBackToLogin }) {
  const { user } = useAuth();

  // Master Data States
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // POS State
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  
  // Customer Details
  const [customer, setCustomer] = useState({
    name: 'Walk-in Customer',
    phone: '+91 98765 43210',
    email: 'customer@gmail.com',
    gstin: '29ABCDE1234F1Z5',
    address: 'Bangalore, Karnataka'
  });

  // Payment Details
  const [paymentMode, setPaymentMode] = useState('UPI'); // 'Cash', 'UPI', 'Card', 'Credit'
  const [amountReceived, setAmountReceived] = useState(0);
  const [discountGlobalPct, setDiscountGlobalPct] = useState(0);

  // Invoices History & Print Preview Modal
  const [invoices, setInvoices] = useState([]);
  const [printInvoice, setPrintInvoice] = useState(null);
  const [activeTab, setActiveTab] = useState('pos'); // 'pos' | 'history'

  // Sample Products Fallback if API offline
  const sampleItems = [
    { id: 'itm-01', item_code: 'IT-LAP-0001', item_name: 'Dell Latitude 5440 Laptop', category: 'IT Equipment', valuation_rate: 72000, hsn_sac_code: '84713010', uom: 'Pcs', available_qty: 25, tax_rate: 18, image_url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=300&auto=format&fit=crop&q=60' },
    { id: 'itm-02', item_code: 'ELE-CBL-0002', item_name: 'Cat6 Ethernet Cable (305m)', category: 'Electrical', valuation_rate: 4500, hsn_sac_code: '85444999', uom: 'Drum', available_qty: 50, tax_rate: 18, image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=60' },
    { id: 'itm-03', item_code: 'OFF-PPR-0003', item_name: 'A4 Copy Paper 80GSM (Rim)', category: 'Office Supplies', valuation_rate: 280, hsn_sac_code: '48025690', uom: 'Rim', available_qty: 200, tax_rate: 12, image_url: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=300&auto=format&fit=crop&q=60' },
    { id: 'itm-04', item_code: 'RAW-CHM-0004', item_name: 'Industrial Cleaning Solvent C-40', category: 'Chemicals', valuation_rate: 1850, hsn_sac_code: '38140010', uom: 'Can', available_qty: 40, tax_rate: 18, image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=60' },
    { id: 'itm-05', item_code: 'IT-MOU-0005', item_name: 'Logitech Wireless Ergonomic Mouse', category: 'IT Equipment', valuation_rate: 1490, hsn_sac_code: '84716060', uom: 'Pcs', available_qty: 85, tax_rate: 18, image_url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=300&auto=format&fit=crop&q=60' },
    { id: 'itm-06', item_code: 'OFF-DES-0006', item_name: 'Ergonomic Mesh Office Chair', category: 'Office Supplies', valuation_rate: 8900, hsn_sac_code: '94033010', uom: 'Pcs', available_qty: 15, tax_rate: 18, image_url: 'https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?w=300&auto=format&fit=crop&q=60' }
  ];

  const sampleInvoices = [
    {
      id: 'inv-101',
      invoice_number: 'INV-2026-000101',
      date: '2026-08-18',
      time: '11:20 AM',
      customer_name: 'Sarah Jenkins',
      customer_phone: '+91 98765 43210',
      payment_mode: 'UPI',
      grand_total: 73490,
      tax_amount: 11210,
      items_count: 2,
      status: 'Paid'
    },
    {
      id: 'inv-102',
      invoice_number: 'INV-2026-000102',
      date: '2026-08-18',
      time: '10:45 AM',
      customer_name: 'Walk-in Customer',
      customer_phone: '+91 91234 56789',
      payment_mode: 'Cash',
      grand_total: 5040,
      tax_amount: 540,
      items_count: 3,
      status: 'Paid'
    }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [itemRes, catRes] = await Promise.all([
        fetch('/api/items').then(r => r.json()).catch(() => ({})),
        fetch('/api/categories').then(r => r.json()).catch(() => ({}))
      ]);

      if (itemRes.success && Array.isArray(itemRes.data) && itemRes.data.length > 0) {
        setItems(itemRes.data);
      } else {
        setItems(sampleItems);
      }

      if (catRes.success && Array.isArray(catRes.data)) {
        setCategories(catRes.data);
      } else {
        setCategories([
          { id: 'all', category_name: 'All' },
          { id: 'cat-01', category_name: 'IT Equipment' },
          { id: 'cat-02', category_name: 'Electrical' },
          { id: 'cat-03', category_name: 'Office Supplies' },
          { id: 'cat-04', category_name: 'Chemicals' }
        ]);
      }

      const savedInv = localStorage.getItem('app_billing_invoices');
      if (savedInv) setInvoices(JSON.parse(savedInv));
      else setInvoices(sampleInvoices);
    } catch (err) {
      console.error(err);
      setItems(sampleItems);
      setInvoices(sampleInvoices);
    } finally {
      setLoading(false);
    }
  };

  // Add Item to Bill Cart
  const addToCart = (product) => {
    const existing = cart.find(c => c.id === product.id);
    if (existing) {
      setCart(cart.map(c => c.id === product.id ? { ...c, qty: c.qty + 1 } : c));
    } else {
      setCart([...cart, {
        id: product.id,
        item_code: product.item_code,
        item_name: product.item_name,
        hsn_sac_code: product.hsn_sac_code || '84713010',
        unit_rate: product.valuation_rate || 1000,
        qty: 1,
        uom: product.uom || 'Pcs',
        tax_rate: product.tax_rate || 18,
        discount_pct: 0
      }]);
    }
  };

  // Update Cart Quantity
  const updateCartQty = (id, newQty) => {
    if (newQty <= 0) {
      setCart(cart.filter(c => c.id !== id));
    } else {
      setCart(cart.map(c => c.id === id ? { ...c, qty: newQty } : c));
    }
  };

  // Update Cart Line Discount
  const updateCartDiscount = (id, disc) => {
    setCart(cart.map(c => c.id === id ? { ...c, discount_pct: Number(disc) } : c));
  };

  // Financial Calculations
  const grossTotal = cart.reduce((acc, item) => acc + (item.unit_rate * item.qty), 0);
  const lineDiscounts = cart.reduce((acc, item) => acc + (item.unit_rate * item.qty * (item.discount_pct / 100)), 0);
  const globalDiscountAmount = (grossTotal - lineDiscounts) * (discountGlobalPct / 100);
  const totalDiscount = lineDiscounts + globalDiscountAmount;
  const taxableAmount = grossTotal - totalDiscount;

  const totalTaxAmount = cart.reduce((acc, item) => {
    const itemSubtotal = (item.unit_rate * item.qty) * (1 - item.discount_pct / 100);
    return acc + (itemSubtotal * (item.tax_rate / 100));
  }, 0);

  const grandTotal = Math.round(taxableAmount + totalTaxAmount);
  const cgstAmount = totalTaxAmount / 2;
  const sgstAmount = totalTaxAmount / 2;
  const changeDue = Math.max(0, amountReceived - grandTotal);

  // Generate POS Tax Invoice & Post to Stock Ledger
  const handleGenerateInvoice = async () => {
    if (cart.length === 0) {
      alert('Please add at least one item to the bill cart.');
      return;
    }

    const newInvoice = {
      id: `inv-${Date.now()}`,
      invoice_number: `INV-2026-00${invoices.length + 101}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      customer_name: customer.name,
      customer_phone: customer.phone,
      customer_email: customer.email,
      customer_gstin: customer.gstin,
      customer_address: customer.address,
      payment_mode: paymentMode,
      gross_total: grossTotal,
      total_discount: totalDiscount,
      taxable_amount: taxableAmount,
      cgst_amount: cgstAmount,
      sgst_amount: sgstAmount,
      total_tax: totalTaxAmount,
      grand_total: grandTotal,
      amount_received: amountReceived || grandTotal,
      change_due: changeDue,
      items: cart,
      cashier: user?.name || 'Sarah Jenkins (Admin)',
      status: 'Paid'
    };

    const updated = [newInvoice, ...invoices];
    setInvoices(updated);
    localStorage.setItem('app_billing_invoices', JSON.stringify(updated));

    // Post to backend API
    try {
      await fetch('/api/stock-issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purpose: `POS Billing Invoice ${newInvoice.invoice_number}`,
          items: cart
        })
      });
    } catch (err) {
      console.error(err);
    }

    setPrintInvoice(newInvoice);
    setCart([]);
    setDiscountGlobalPct(0);
    setAmountReceived(0);
  };

  // Filtered Products Catalog
  const filteredProducts = items.filter(i => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      (i.item_name || '').toLowerCase().includes(q) ||
      (i.item_code || '').toLowerCase().includes(q) ||
      (i.hsn_sac_code || '').toLowerCase().includes(q);
    const matchesCat = selectedCategory === 'All' || i.category === selectedCategory || i.category_id === selectedCategory;

    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col overflow-hidden select-none">
      
      {/* POS Top Navigation Bar */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-4">
          {onBackToLogin && (
            <button 
              onClick={onBackToLogin} 
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition flex items-center space-x-1 text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Login</span>
            </button>
          )}
          
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md shadow-rose-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-black text-base text-white tracking-wide font-heading leading-none">POS & BILLING PORTAL</h1>
              <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider block mt-0.5">Enterprise GST Invoicing Engine</span>
            </div>
          </div>
        </div>

        {/* Center Tabs */}
        <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button 
            onClick={() => setActiveTab('pos')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'pos' ? 'bg-rose-500 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>POS Counter</span>
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'history' ? 'bg-rose-500 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Invoice History ({invoices.length})</span>
          </button>
        </div>

        {/* Right Info */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl font-mono text-[11px]">
            <span className="text-slate-400">Store: </span>
            <span className="text-emerald-400 font-bold">WH-MAIN (Central)</span>
          </div>
          <div className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl font-mono text-[11px]">
            <span className="text-slate-400">Cashier: </span>
            <span className="text-purple-300 font-bold">{user?.name || 'Sarah Jenkins'}</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      {activeTab === 'pos' ? (
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          
          {/* LEFT 60%: Product Catalog & Search Grid */}
          <div className="flex-1 flex flex-col p-5 space-y-4 overflow-y-auto border-r border-slate-800/80 bg-slate-950">
            
            {/* Search Bar & Barcode Scanner */}
            <div className="flex items-center space-x-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Scan Barcode or Search Item Name, Code, HSN..."
                  className="w-full bg-slate-900 border border-slate-800 pl-10 pr-4 py-2.5 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                />
              </div>

              <button 
                onClick={fetchData} 
                className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-2xl border border-slate-800 transition"
                title="Refresh Product Catalog"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none pb-1">
              {['All', 'IT Equipment', 'Electrical', 'Office Supplies', 'Chemicals'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                    selectedCategory === cat 
                      ? 'bg-rose-500 text-white shadow-xs' 
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5 overflow-y-auto pr-1">
              {filteredProducts.map(product => (
                <div 
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="bg-slate-900 border border-slate-800 hover:border-rose-500/80 rounded-2xl p-3.5 flex flex-col justify-between transition cursor-pointer hover:shadow-lg group relative overflow-hidden"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-[10px] text-purple-400 font-bold bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-800/40">
                        {product.item_code}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/40">
                        {product.available_qty || 20} {product.uom || 'Pcs'}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-white group-hover:text-rose-400 transition line-clamp-2">
                      {product.item_name}
                    </h4>

                    <div className="text-[10px] text-slate-400 font-mono">
                      HSN: {product.hsn_sac_code || '84713010'} &bull; GST {product.tax_rate || 18}%
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800/80">
                    <span className="text-base font-black text-white font-mono">
                      ₹{(product.valuation_rate || 1000).toLocaleString()}
                    </span>
                    <button className="bg-rose-500/20 group-hover:bg-rose-500 text-rose-400 group-hover:text-white p-1.5 rounded-xl transition">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT 40%: Active Cart & Invoice Settlement Panel */}
          <div className="w-full md:w-[450px] bg-slate-900/90 flex flex-col h-full border-l border-slate-800">
            
            {/* Customer Details Box */}
            <div className="p-4 border-b border-slate-800 bg-slate-900 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span className="flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-rose-400" />
                  <span>Customer Details</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">GST B2B / B2C</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <input 
                  type="text" 
                  value={customer.name} 
                  onChange={e => setCustomer({ ...customer, name: e.target.value })}
                  placeholder="Customer Name"
                  className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white font-semibold text-xs"
                />
                <input 
                  type="text" 
                  value={customer.phone} 
                  onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                  placeholder="Phone Number"
                  className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white font-mono text-xs"
                />
              </div>
            </div>

            {/* Cart Items Table */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center p-6 space-y-2">
                  <ShoppingCart className="w-12 h-12 stroke-1 text-slate-700" />
                  <p className="font-bold text-xs text-slate-400">Bill Cart is Empty</p>
                  <p className="text-[11px] text-slate-600">Click products from the catalog to add to bill.</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="bg-slate-950 border border-slate-800/80 rounded-2xl p-3 space-y-2">
                    <div className="flex justify-between items-start text-xs">
                      <div>
                        <span className="font-mono text-[10px] text-purple-400 font-bold">{item.item_code}</span>
                        <h5 className="font-bold text-white leading-tight">{item.item_name}</h5>
                      </div>
                      <button 
                        onClick={() => updateCartQty(item.id, 0)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-900">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => updateCartQty(item.id, item.qty - 1)} className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono font-bold text-white w-6 text-center">{item.qty}</span>
                        <button onClick={() => updateCartQty(item.id, item.qty + 1)} className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right font-mono">
                        <span className="text-[10px] text-slate-400 block">₹{item.unit_rate} &times; {item.qty}</span>
                        <span className="font-black text-rose-400">₹{(item.unit_rate * item.qty).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Calculations & Payment Settlement */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-3 shrink-0">
              
              {/* Totals Breakdown */}
              <div className="space-y-1.5 text-xs font-mono border-b border-slate-800 pb-3">
                <div className="flex justify-between text-slate-400">
                  <span>Gross Amount:</span>
                  <span>₹{grossTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>Taxable Value:</span>
                  <span>₹{taxableAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-purple-400">
                  <span>CGST (9%) + SGST (9%):</span>
                  <span>₹{totalTaxAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-base font-black text-white pt-1">
                  <span>Grand Total:</span>
                  <span className="text-rose-400">₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Payment Mode Options */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Payment Mode</span>
                <div className="grid grid-cols-4 gap-1.5">
                  {['UPI', 'Cash', 'Card', 'Credit'].map(mode => (
                    <button
                      key={mode}
                      onClick={() => setPaymentMode(mode)}
                      className={`py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                        paymentMode === mode 
                          ? 'bg-rose-500 border-rose-500 text-white shadow-xs' 
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Print & Complete Order Action */}
              <button 
                onClick={handleGenerateInvoice}
                disabled={cart.length === 0}
                className="w-full bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-black text-xs py-3.5 rounded-2xl shadow-lg shadow-rose-500/25 flex items-center justify-center space-x-2 transition cursor-pointer disabled:opacity-50"
              >
                <Printer className="w-4 h-4" />
                <span>Complete Bill & Generate Tax Invoice (₹{grandTotal.toLocaleString()})</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* INVOICE HISTORY TAB */
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          <div className="flex justify-between items-center bg-slate-900 p-4 rounded-2xl border border-slate-800">
            <div>
              <h3 className="font-bold text-sm text-white uppercase font-heading">Recent Invoices Registry</h3>
              <p className="text-xs text-slate-400">History of all generated GST tax invoices and POS transactions.</p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-xs text-left font-mono">
              <thead>
                <tr className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                  <th className="p-3.5">Invoice #</th>
                  <th className="p-3.5">Date & Time</th>
                  <th className="p-3.5">Customer Name</th>
                  <th className="p-3.5">Payment Mode</th>
                  <th className="p-3.5">Tax Amount</th>
                  <th className="p-3.5">Grand Total</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Reprint</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-800/50">
                    <td className="p-3.5 font-bold text-purple-400">{inv.invoice_number}</td>
                    <td className="p-3.5 text-slate-400">{inv.date} &bull; {inv.time}</td>
                    <td className="p-3.5 text-white font-bold">{inv.customer_name}</td>
                    <td className="p-3.5 text-emerald-400 font-bold">{inv.payment_mode}</td>
                    <td className="p-3.5 text-purple-300">₹{(inv.total_tax || inv.tax_amount || 0).toLocaleString()}</td>
                    <td className="p-3.5 font-black text-rose-400">₹{(inv.grand_total || 0).toLocaleString()}</td>
                    <td className="p-3.5"><span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md">Paid</span></td>
                    <td className="p-3.5 text-right">
                      <button onClick={() => setPrintInvoice(inv)} className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg">
                        <Printer className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAX INVOICE PRINT MODAL (PDF DOCUMENT VIEW) */}
      {printInvoice && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white text-slate-900 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden font-sans">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-rose-400" />
                <h3 className="font-bold text-xs uppercase tracking-wider">GST Tax Invoice Preview ({printInvoice.invoice_number})</h3>
              </div>
              <button onClick={() => setPrintInvoice(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Document Body */}
            <div className="p-8 overflow-y-auto space-y-6 text-xs text-slate-800">
              {/* Document Header */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 font-heading">Apex Enterprises Pvt Ltd</h2>
                  <p className="text-[11px] text-slate-500">100 Industrial Park, Zone 4, Bangalore, KA - 560001</p>
                  <p className="text-[11px] text-slate-500">GSTIN: <strong>29AAAAA0000A1Z5</strong> | Phone: +91 80 2345 6789</p>
                </div>
                <div className="text-right">
                  <span className="bg-rose-100 text-rose-800 font-bold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider block mb-1">TAX INVOICE</span>
                  <p className="font-mono text-sm font-bold text-slate-900">{printInvoice.invoice_number}</p>
                  <p className="text-[11px] text-slate-500 font-mono">Date: {printInvoice.date} {printInvoice.time}</p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Billed To (Customer):</span>
                  <span className="font-bold text-slate-900 block">{printInvoice.customer_name}</span>
                  <span className="text-slate-600 block">{printInvoice.customer_phone}</span>
                  {printInvoice.customer_gstin && <span className="font-mono text-slate-700 block">GSTIN: {printInvoice.customer_gstin}</span>}
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Payment Details:</span>
                  <span className="font-bold text-emerald-700 block">Mode: {printInvoice.payment_mode}</span>
                  <span className="text-slate-600 block">Status: Paid & Settled</span>
                  <span className="text-slate-600 block">Cashier: {printInvoice.cashier}</span>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                    <th className="py-2 px-3">Item Description</th>
                    <th className="py-2 px-3">HSN Code</th>
                    <th className="py-2 px-3 text-right">Qty</th>
                    <th className="py-2 px-3 text-right">Rate</th>
                    <th className="py-2 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {(printInvoice.items || []).map((itm, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-3 font-sans font-medium text-slate-900">{itm.item_name}</td>
                      <td className="py-2 px-3 text-slate-500">{itm.hsn_sac_code || '84713010'}</td>
                      <td className="py-2 px-3 text-right font-bold">{itm.qty} {itm.uom}</td>
                      <td className="py-2 px-3 text-right">₹{itm.unit_rate}</td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900">₹{(itm.unit_rate * itm.qty).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Tax Summary */}
              <div className="flex justify-between items-end border-t border-slate-200 pt-4">
                <div className="text-[10px] text-slate-500 space-y-1">
                  <p><strong>Terms & Conditions:</strong> Goods once sold will not be taken back unless damaged.</p>
                  <p>Computer generated invoice, no physical signature required.</p>
                </div>
                <div className="w-64 space-y-1 text-xs text-right font-mono">
                  <div className="flex justify-between text-slate-500">
                    <span>Taxable Amount:</span>
                    <span>₹{(printInvoice.taxable_amount || printInvoice.gross_total || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>CGST + SGST:</span>
                    <span>₹{(printInvoice.total_tax || printInvoice.tax_amount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-200">
                    <span>Grand Total:</span>
                    <span className="text-rose-600">₹{(printInvoice.grand_total || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 bg-slate-100 flex justify-end space-x-3 border-t border-slate-200">
              <button onClick={() => setPrintInvoice(null)} className="px-4 py-2 bg-slate-200 text-slate-700 font-bold text-xs rounded-xl">Close</button>
              <button onClick={() => window.print()} className="px-5 py-2 bg-rose-600 text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-2">
                <Printer className="w-4 h-4" />
                <span>Print PDF Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
