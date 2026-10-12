import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ShoppingCart, Search, Plus, Minus, Trash2, User, Receipt,
  CreditCard, Banknote, Smartphone, Building, AlertCircle,
  CheckCircle, RefreshCw, Printer, X, ChevronDown,
  Package, Tag, Zap, FileText, ArrowLeft, Edit3,
  Clock, Calendar, Hash, AlertTriangle, Loader2, Check,
  PauseCircle, PlayCircle, Barcode, Filter, Sparkles, SlidersHorizontal,
  Mail, Phone, MapPin, Users
} from 'lucide-react';
import InvoicePDF from './InvoicePDF';
import CustomerModal from './CustomerModal';

// ─── Number Formatting ────────────────────────────────────────────────────────
const fmt = (n) => `₹${(Number(n) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtDec = (n, d = 2) => (Number(n) || 0).toFixed(d);

// ─── Amount in Words ──────────────────────────────────────────────────────────
function amountInWords(amount) {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  function toWords(n) {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + toWords(n % 100) : '');
    if (n < 100000) return toWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + toWords(n % 1000) : '');
    if (n < 10000000) return toWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + toWords(n % 100000) : '');
    return toWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + toWords(n % 10000000) : '');
  }
  const int = Math.floor(Math.abs(amount));
  const dec = Math.round((Math.abs(amount) - int) * 100);
  let words = 'Rupees ' + toWords(int);
  if (dec > 0) words += ' and ' + toWords(dec) + ' Paise';
  return words + ' Only';
}

function round2(n) { return Math.round(n * 100) / 100; }

// ─── Sound Feedback on Barcode Scan ───────────────────────────────────────────
function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1760, ctx.currentTime); // High pitch POS beep
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch {
    // AudioContext not allowed or not supported; ignore
  }
}

// ─── Payment Methods ──────────────────────────────────────────────────────────
const PAYMENT_METHODS = [
  { id: 'Cash', label: 'Cash', icon: Banknote },
  { id: 'UPI', label: 'UPI / QR', icon: Smartphone },
  { id: 'Card', label: 'Debit / Card', icon: CreditCard },
];

// ─── Bill Summary Calculation ─────────────────────────────────────────────────
function computeBillSummary(cartItems, saleType = 'intra') {
  let subtotal = 0;
  let totalDiscount = 0;
  let grossMRP = 0;
  let totalCGST = 0;
  let totalSGST = 0;
  let totalIGST = 0;

  cartItems.forEach(item => {
    const qty = Number(item.quantity) || 1;
    const rate = Number(item.unit_price) || 0;
    const mrp = Number(item.mrp) || rate;
    const lineSubtotal = round2(rate * qty);
    const discPct = Number(item.discount) || 0;
    const discAmt = round2(lineSubtotal * discPct / 100);
    const taxableVal = round2(lineSubtotal - discAmt);

    const gstRate = Number(item.gst_rate) || 0;
    const gstAmt = round2(taxableVal * gstRate / 100);

    if (saleType === 'inter') {
      totalIGST += gstAmt;
    } else {
      totalCGST += round2(gstAmt / 2);
      totalSGST += round2(gstAmt / 2);
    }

    grossMRP += round2(mrp * qty);
    subtotal += lineSubtotal;
    totalDiscount += discAmt;
  });

  subtotal = round2(subtotal);
  totalDiscount = round2(totalDiscount);
  grossMRP = round2(grossMRP);
  const taxableAmount = round2(subtotal - totalDiscount);
  totalCGST = round2(totalCGST);
  totalSGST = round2(totalSGST);
  totalIGST = round2(totalIGST);
  const totalGST = round2(totalCGST + totalSGST + totalIGST);
  const grandRaw = taxableAmount + totalGST;
  const roundOff = round2(Math.round(grandRaw) - grandRaw);
  const grandTotal = round2(grandRaw + roundOff);

  const billTotal = grossMRP >= grandTotal ? grossMRP : grandTotal;
  const savings = Math.max(0, round2(billTotal - grandTotal));

  return {
    subtotal,
    totalDiscount,
    grossMRP,
    taxableAmount,
    totalCGST,
    totalSGST,
    totalIGST,
    totalGST,
    roundOff,
    grandTotal,
    bill_total: billTotal,
    savings
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// MAIN BILLING / POS COMPONENT
// ──────────────────────────────────────────────────────────────────────────────
export default function BillingPage({ initialView = 'billing' }) {
  const { user } = useAuth();

  // Navigation views
  const [view, setView] = useState(initialView); // 'billing' | 'success' | 'history' | 'invoice-detail'
  const [billingSettings, setBillingSettings] = useState(null);

  // Sync view whenever initialView prop changes (e.g. sidebar navigation)
  useEffect(() => {
    setView(initialView);
  }, [initialView]);
  
  // Cart & Transaction state
  const [cartItems, setCartItems] = useState([]);
  const [customer, setCustomer] = useState({ name: 'Walk-in Customer', phone: '', email: '', address: '', state: '', gstin: '', is_walk_in: true });
  const [saleType, setSaleType] = useState('intra');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [amountReceived, setAmountReceived] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('SH/25-27/0000001');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);
  const [selectedHistoryInvoice, setSelectedHistoryInvoice] = useState(null);

  // Search & Products state
  const [barcodeInput, setBarcodeInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [productsLoading, setProductsLoading] = useState(false);

  // Held Bills state (persisted to localStorage)
  const [heldBills, setHeldBills] = useState(() => {
    try {
      const saved = localStorage.getItem('pos_held_bills');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showHeldBillsModal, setShowHeldBillsModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  // Live Clock
  const [currentTime, setCurrentTime] = useState(new Date());

  // Refs
  const barcodeInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Keep clock running
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Fetch next bill number on mount
  const fetchNextInvoiceNumber = useCallback(() => {
    fetch('/api/billing/invoice-number')
      .then(r => r.json())
      .then(d => {
        if (d.success && d.invoice_number) {
          setInvoiceNumber(d.invoice_number);
        }
      })
      .catch(() => setInvoiceNumber('SH/25-27/0000001'));
  }, []);

  useEffect(() => {
    fetchNextInvoiceNumber();
  }, [fetchNextInvoiceNumber]);

  // Fetch billing settings from PostgreSQL
  const fetchBillingSettings = useCallback(() => {
    fetch('/api/billing/settings')
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) {
          setBillingSettings(d.data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchBillingSettings();
  }, [fetchBillingSettings]);

  // Fetch categories
  useEffect(() => {
    fetch('/api/billing/categories')
      .then(r => r.json())
      .then(d => {
        if (d.success && Array.isArray(d.data)) {
          setCategories(d.data);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch products with search and category filtering
  const loadProducts = useCallback(async (query = '', catId = 'all') => {
    setProductsLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set('q', query.trim());
      if (catId && catId !== 'all') params.set('category_id', catId);
      
      const res = await fetch(`/api/billing/products/search?${params.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setProducts(data.data);
      } else {
        setProducts([]);
      }
    } catch {
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  // Initial products load and when category changes
  useEffect(() => {
    loadProducts(searchQuery, selectedCategory);
  }, [loadProducts, selectedCategory]);

  // Debounced search query
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      loadProducts(searchQuery, selectedCategory);
    }, 250);
    return () => clearTimeout(searchTimeoutRef.current);
  }, [searchQuery, selectedCategory, loadProducts]);

  // Focus barcode input on mount and view changes
  useEffect(() => {
    if (view === 'billing') {
      setTimeout(() => barcodeInputRef.current?.focus(), 100);
    }
  }, [view]);

  // Save held bills to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('pos_held_bills', JSON.stringify(heldBills));
    } catch {
      // Storage error
    }
  }, [heldBills]);

  // ── Cart Operations ──────────────────────────────────────────────────────────
  const addToCart = (product) => {
    if (!product) return;
    const stock = Number(product.available_stock) || 0;
    if (stock <= 0) {
      setError(`"${product.name}" is out of stock!`);
      return;
    }

    setCartItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        const nextQty = existing.quantity + 1;
        if (nextQty > stock) {
          setError(`Cannot add more. Only ${stock} units available for "${product.name}".`);
          return prev;
        }
        return prev.map(i => i.id === product.id ? { ...i, quantity: nextQty } : i);
      }
      return [...prev, {
        ...product,
        quantity: 1,
        discount: Number(product.discount) || 0
      }];
    });

    setError('');
    playBeep();
  };

  const updateQty = (id, newQty) => {
    const q = parseFloat(newQty);
    if (isNaN(q) || q < 0) return;
    const item = cartItems.find(i => i.id === id);
    if (!item) return;

    if (q === 0) {
      removeItem(id);
      return;
    }

    const maxStock = Number(item.available_stock) || 999;
    if (q > maxStock) {
      setError(`Cannot set quantity to ${q}. Available stock is only ${maxStock} units.`);
      return;
    }

    setCartItems(prev => prev.map(i => i.id === id ? { ...i, quantity: q } : i));
    setError('');
  };

  const updateDiscount = (id, disc) => {
    const d = Math.min(100, Math.max(0, parseFloat(disc) || 0));
    setCartItems(prev => prev.map(i => i.id === id ? { ...i, discount: d } : i));
  };

  const removeItem = (id) => {
    setCartItems(prev => prev.filter(i => i.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
    setAmountReceived('');
    setTransactionId('');
    setError('');
    setNotes('');
  };

  const cancelBill = () => {
    if (cartItems.length > 0 && !window.confirm('Are you sure you want to cancel and clear the current bill?')) {
      return;
    }
    clearCart();
    setCustomer({ name: 'Walk-in Customer', phone: '', email: '', address: '', state: '', gstin: '', is_walk_in: true });
    setPaymentMethod('Cash');
    fetchNextInvoiceNumber();
    barcodeInputRef.current?.focus();
  };

  // ── Barcode Scanner Handler ──────────────────────────────────────────────────
  const handleBarcodeSubmit = async (e) => {
    if (e) e.preventDefault();
    const code = barcodeInput.trim();
    if (!code) return;

    setError('');
    // First search in currently loaded products list
    let matched = products.find(p => p.barcode === code || p.sku === code || p.item_code === code);

    // If not found in current products, search via API
    if (!matched) {
      try {
        const res = await fetch(`/api/billing/products/search?q=${encodeURIComponent(code)}`);
        const data = await res.json();
        if (data.success && data.data && data.data.length > 0) {
          matched = data.data.find(p => p.barcode === code || p.sku === code) || data.data[0];
        }
      } catch {
        // Search error
      }
    }

    if (matched) {
      addToCart(matched);
      setBarcodeInput('');
    } else {
      setError(`Product with barcode "${code}" not found.`);
      setBarcodeInput('');
    }

    // Re-focus barcode field immediately for consecutive scans
    setTimeout(() => {
      barcodeInputRef.current?.focus();
    }, 50);
  };

  // ── Hold & Retrieve Bill ─────────────────────────────────────────────────────
  const handleHoldBill = () => {
    if (cartItems.length === 0) {
      setError('Cannot hold an empty bill.');
      return;
    }

    const holdRecord = {
      id: `hold-${Date.now()}`,
      heldAt: new Date().toISOString(),
      invoiceNumber,
      cartItems: [...cartItems],
      customer: { ...customer },
      saleType,
      notes,
      summary: computeBillSummary(cartItems, saleType)
    };

    setHeldBills(prev => [holdRecord, ...prev]);
    clearCart();
    setCustomer({ name: 'Walk-in Customer', phone: '', email: '', address: '', state: '', gstin: '', is_walk_in: true });
    fetchNextInvoiceNumber();
    setError('');
  };

  const handleResumeBill = (holdRecord) => {
    if (cartItems.length > 0) {
      if (!window.confirm('Current cart has items. Resuming will replace the current cart with the held bill. Continue?')) {
        return;
      }
    }

    setCartItems(holdRecord.cartItems);
    setCustomer(holdRecord.customer || { name: 'Walk-in Customer', phone: '', email: '', address: '', state: '', gstin: '', is_walk_in: true });
    setSaleType(holdRecord.saleType || 'intra');
    setNotes(holdRecord.notes || '');
    
    // Remove from held list
    setHeldBills(prev => prev.filter(h => h.id !== holdRecord.id));
    setShowHeldBillsModal(false);
    setError('');
  };

  const handleDiscardHeldBill = (holdId) => {
    setHeldBills(prev => prev.filter(h => h.id !== holdId));
  };

  // ── Summary Calculations ─────────────────────────────────────────────────────
  const summary = computeBillSummary(cartItems, saleType);
  const changeAmount = Math.max(0, round2((parseFloat(amountReceived) || 0) - summary.grandTotal));

  // ── Complete Sale / Create Invoice ───────────────────────────────────────────
  const handleCompleteSale = async () => {
    if (cartItems.length === 0) {
      setError('Please add at least one product to the cart before checkout.');
      return;
    }

    if (paymentMethod === 'Cash') {
      const rec = parseFloat(amountReceived) || 0;
      if (rec < summary.grandTotal) {
        setError(`Amount received (₹${rec.toFixed(2)}) is less than Grand Total (₹${summary.grandTotal.toFixed(2)}).`);
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        customer,
        items: cartItems.map(i => ({
          product_id: i.id,
          quantity: i.quantity,
          unit_price: i.unit_price,
          mrp: i.mrp,
          discount: i.discount || 0,
          warehouse_id: 'wh-01'
        })),
        payment_method: paymentMethod,
        amount_paid: paymentMethod === 'Cash' ? (parseFloat(amountReceived) || summary.grandTotal) : summary.grandTotal,
        transaction_id: transactionId,
        sale_type: saleType,
        notes,
        warehouse_id: 'wh-01'
      };

      const res = await fetch('/api/billing/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || '',
          'x-company-name': user?.company_name || 'Organization',
          'x-user-role': user?.role_id || ''
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.detail || data.message || 'Failed to complete sale.');
        return;
      }

      setSuccessData(data.data);
      setView('success');
      // Refresh products stock in background
      loadProducts(searchQuery, selectedCategory);
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Dedicated Print Trigger ──────────────────────────────────────────────────
  const handlePrintCurrentBill = () => {
    if (cartItems.length === 0) {
      setError('Cannot print an empty bill.');
      return;
    }
    window.print();
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER SUB-VIEWS
  // ─────────────────────────────────────────────────────────────────────────────
  if (view === 'success' && successData) {
    return (
      <SuccessScreen
        successData={successData}
        settings={billingSettings}
        onNewBill={() => {
          clearCart();
          setSuccessData(null);
          setView('billing');
          fetchNextInvoiceNumber();
        }}
        onViewHistory={() => setView('history')}
        onViewDetail={() => {
          setSelectedHistoryInvoice(successData.invoice.id);
          setView('invoice-detail');
        }}
      />
    );
  }

  if (view === 'history') {
    return (
      <BillingHistory
        settings={billingSettings}
        onBack={() => {
          setView('billing');
          fetchNextInvoiceNumber();
        }}
        onSelectInvoice={(invId) => {
          setSelectedHistoryInvoice(invId);
          setView('invoice-detail');
        }}
      />
    );
  }

  if (view === 'invoice-detail' && selectedHistoryInvoice) {
    return (
      <InvoiceDetailView
        invoiceId={selectedHistoryInvoice}
        settings={billingSettings}
        onBack={() => setView('history')}
      />
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // MAIN WHITE SUPERMARKET POS LAYOUT
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-[calc(100vh-100px)] min-h-[640px] bg-white text-slate-900 border border-slate-200 rounded-2xl shadow-sm overflow-hidden select-none font-sans">
      
      {/* ── 1. CLEAN TOP HEADER ── */}
      <header className="flex items-center justify-between px-5 py-3 bg-white border-b border-slate-200 shrink-0 no-print">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
              <Receipt className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-black tracking-tight text-slate-900 font-heading">
                  {billingSettings?.store_name || 'AMMUS SUPERMARKET'}
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-300">
                  POS Counter
                </span>
              </div>
              <p className="text-xs font-mono font-semibold text-slate-500">
                Bill No: <span className="font-bold text-slate-900">{invoiceNumber}</span>
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-3 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 font-medium">
            <div className="flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentTime.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-mono">{currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <div className="hidden lg:block text-right mr-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cashier</p>
            <p className="text-xs font-bold text-slate-800">{user?.name || user?.email || 'Active Cashier'}</p>
          </div>

          {/* Held Bills Button */}
          <button
            onClick={() => setShowHeldBillsModal(true)}
            className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
              heldBills.length > 0
                ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <PauseCircle className="w-4 h-4 text-amber-600" />
            <span>Held Bills</span>
            {heldBills.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-amber-600 text-white rounded-full text-[10px] font-bold">
                {heldBills.length}
              </span>
            )}
          </button>

          {/* Billing History Button */}
          <button
            onClick={() => setView('history')}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
          >
            <FileText className="w-4 h-4 text-slate-500" />
            <span>History</span>
          </button>

          {/* Billing Settings Button */}
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('navigate-tab', { detail: 'sec-38' }));
            }}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
            title="Open Billing Settings"
          >
            <SlidersHorizontal className="w-4 h-4 text-purple-600" />
            <span>Settings</span>
          </button>

          {/* Cancel / New Bill Button */}
          <button
            onClick={cancelBill}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>New Bill</span>
          </button>
        </div>
      </header>

      {/* ── 2. MAIN SPLIT AREA ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden bg-slate-50/50">
        
        {/* ── LEFT / MAIN PRODUCT CATALOG (60%) ── */}
        <div className="flex flex-col flex-1 min-w-0 border-r border-slate-200 bg-white">
          
          {/* Top Inputs: Barcode Scanner + Text Search */}
          <div className="p-3 bg-white border-b border-slate-200 space-y-2 shrink-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              
              {/* Hardware Barcode Scanner Input */}
              <form onSubmit={handleBarcodeSubmit} className="relative">
                <div className="flex items-center bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 shadow-xs focus-within:border-slate-900 focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-900/10 transition">
                  <Barcode className="w-5 h-5 text-slate-500 mr-2 shrink-0" />
                  <input
                    ref={barcodeInputRef}
                    type="text"
                    value={barcodeInput}
                    onChange={e => setBarcodeInput(e.target.value)}
                    placeholder="Scan or enter barcode..."
                    className="flex-1 text-xs font-mono font-medium text-slate-900 placeholder-slate-400 bg-transparent outline-none"
                    autoFocus
                  />
                  {barcodeInput && (
                    <button
                      type="submit"
                      className="ml-2 px-2.5 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg hover:bg-slate-800 transition cursor-pointer"
                    >
                      Scan
                    </button>
                  )}
                </div>
              </form>

              {/* General Product Search */}
              <div className="relative">
                <div className="flex items-center bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 shadow-xs focus-within:border-slate-900 focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-900/10 transition">
                  <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search name, SKU, brand, category..."
                    className="flex-1 text-xs font-medium text-slate-900 placeholder-slate-400 bg-transparent outline-none"
                  />
                  {productsLoading && <Loader2 className="w-4 h-4 text-slate-500 animate-spin mr-1" />}
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer ml-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Category Filter Horizontal Pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto py-1 scrollbar-none text-xs">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs shrink-0 transition cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                All Products
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg font-medium text-xs shrink-0 transition cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-slate-900 text-white font-bold shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {cat.name}
                  {cat.count > 0 && <span className="ml-1 text-[10px] opacity-70">({cat.count})</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid / Catalog */}
          <div className="flex-1 overflow-y-auto p-3">
            {productsLoading && products.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin mb-2 text-slate-600" />
                <p className="text-xs font-medium">Loading supermarket catalog...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center text-slate-400">
                <Package className="w-12 h-12 text-slate-300 mb-2 stroke-1" />
                <p className="text-sm font-semibold text-slate-600">No products found</p>
                <p className="text-xs text-slate-400 mt-1">Try another search keyword or switch category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5">
                {products.map(product => {
                  const stock = Number(product.available_stock) || 0;
                  const isOutOfStock = stock <= 0;
                  const hasOffer = product.offer && product.offer !== 'None';
                  const inCartItem = cartItems.find(i => i.id === product.id);

                  return (
                    <div
                      key={product.id}
                      onClick={() => !isOutOfStock && addToCart(product)}
                      className={`group flex flex-col justify-between p-3 rounded-xl border transition duration-150 relative bg-white ${
                        isOutOfStock
                          ? 'border-slate-200 opacity-60 cursor-not-allowed bg-slate-50'
                          : inCartItem
                          ? 'border-slate-900 ring-1 ring-slate-900/10 shadow-xs cursor-pointer hover:border-slate-900'
                          : 'border-slate-200 hover:border-slate-400 hover:shadow-xs cursor-pointer'
                      }`}
                    >
                      {/* Top Badges */}
                      <div className="flex items-start justify-between gap-1 mb-1.5">
                        <span className="text-[10px] font-mono font-semibold text-slate-400 truncate">
                          {product.sku || product.item_code}
                        </span>
                        {hasOffer && (
                          <span className="shrink-0 text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                            {product.offer}
                          </span>
                        )}
                      </div>

                      {/* Product Name & Brand */}
                      <div className="mb-2">
                        <h3 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-slate-950">
                          {product.name}
                        </h3>
                        <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                          {product.brand_name || 'Supermarket'} • {product.category_name || 'General'}
                        </p>
                      </div>

                      {/* Barcode & Stock */}
                      <div className="flex items-center justify-between text-[10px] mb-2 text-slate-500">
                        <span className="font-mono text-[9.5px] text-slate-400">
                          {product.barcode}
                        </span>
                        <span className={`font-bold ${isOutOfStock ? 'text-rose-600' : stock <= 10 ? 'text-amber-600' : 'text-emerald-700'}`}>
                          {isOutOfStock ? 'Out of Stock' : `${stock} ${product.uom_symbol || 'units'}`}
                        </span>
                      </div>

                      {/* Price & Add Button */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-auto">
                        <div>
                          <div className="text-xs font-black text-slate-900 font-mono">
                            {fmt(product.unit_price)}
                          </div>
                          {product.mrp > product.unit_price && (
                            <div className="text-[10px] text-slate-400 line-through font-mono">
                              {fmt(product.mrp)}
                            </div>
                          )}
                        </div>

                        {inCartItem ? (
                          <div className="flex items-center space-x-1">
                            <span className="text-xs font-bold px-2 py-1 bg-slate-900 text-white rounded-lg font-mono">
                              {inCartItem.quantity}
                            </span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            disabled={isOutOfStock}
                            className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-800 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            + Add
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT / CART & PAYMENT PANEL (40%) ── */}
        <div className="w-96 xl:w-[440px] flex flex-col shrink-0 bg-white border-l border-slate-200">
          
          {/* Customer Bar */}
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-slate-700" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {customer.name || 'Walk-in Customer'}
                  </p>
                  {customer.is_walk_in && (
                    <span className="text-[9px] font-semibold text-slate-500 bg-slate-200/80 px-1.5 py-0.2 rounded">
                      Walk-in
                    </span>
                  )}
                </div>
                {customer.phone && (
                  <p className="text-[10px] text-slate-500 font-mono">{customer.phone}</p>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowCustomerModal(true)}
              className="px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition cursor-pointer flex items-center space-x-1"
            >
              <Edit3 className="w-3 h-3" />
              <span>Change</span>
            </button>
          </div>

          {/* Cart Header */}
          <div className="px-3 py-2 bg-white border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
            <div className="flex items-center space-x-1.5">
              <ShoppingCart className="w-4 h-4 text-slate-900" />
              <span>Current Cart ({cartItems.length} items)</span>
            </div>
            {cartItems.length > 0 && (
              <button
                onClick={clearCart}
                className="text-[10px] font-semibold text-rose-600 hover:text-rose-800 hover:underline cursor-pointer"
              >
                Clear Cart
              </button>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-400">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                  <ShoppingCart className="w-7 h-7 text-slate-400" />
                </div>
                <p className="text-sm font-bold text-slate-700">Your cart is empty</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Scan a barcode or click any item on the left to add it to this bill.
                </p>
              </div>
            ) : (
              cartItems.map((item) => {
                const lineTotal = round2(
                  item.unit_price * item.quantity * (1 - (item.discount || 0) / 100)
                );

                return (
                  <div key={item.id} className="p-3 hover:bg-slate-50/70 transition">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-1.5">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {item.name}
                          </p>
                          {item.offer && item.offer !== 'None' && (
                            <span className="text-[9px] font-extrabold text-emerald-800 bg-emerald-50 px-1 py-0.2 rounded shrink-0">
                              {item.offer}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-3 text-[10px] text-slate-400 font-mono mt-0.5">
                          <span>{item.sku}</span>
                          <span>MRP: {fmt(item.mrp || item.unit_price)}</span>
                          <span>Rate: {fmt(item.unit_price)}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-slate-300 hover:text-rose-600 transition cursor-pointer p-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Quantity & Line Total Row */}
                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100">
                      {/* Qty Controls */}
                      <div className="flex items-center space-x-1 bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                        <button
                          onClick={() => updateQty(item.id, item.quantity - 1)}
                          className="w-5 h-5 rounded bg-white text-slate-700 flex items-center justify-center hover:bg-slate-200 transition cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={e => updateQty(item.id, e.target.value)}
                          min="1"
                          max={item.available_stock}
                          className="w-10 text-center text-xs font-bold font-mono text-slate-900 bg-transparent outline-none"
                        />
                        <button
                          onClick={() => updateQty(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.available_stock}
                          className="w-5 h-5 rounded bg-white text-slate-700 flex items-center justify-center hover:bg-slate-200 transition cursor-pointer disabled:opacity-40"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Discount Input */}
                      <div className="flex items-center space-x-1 text-xs">
                        <span className="text-[10px] text-slate-400 font-medium">Disc:</span>
                        <input
                          type="number"
                          value={item.discount || ''}
                          onChange={e => updateDiscount(item.id, e.target.value)}
                          placeholder="0"
                          min="0"
                          max="100"
                          className="w-10 px-1 py-0.5 text-center text-[11px] font-bold font-mono text-slate-800 bg-slate-50 border border-slate-200 rounded outline-none"
                        />
                        <span className="text-[10px] text-slate-400">%</span>
                      </div>

                      {/* Line Amount */}
                      <div className="text-right">
                        <span className="text-xs font-extrabold font-mono text-slate-900">
                          {fmt(lineTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* ── 3. BOTTOM PAYMENT & TOTALS AREA ── */}
          <div className="p-3 bg-white border-t border-slate-200 space-y-2.5">
            
            {/* Error Message */}
            {error && (
              <div className="flex items-start space-x-2 bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded-xl text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-tight">{error}</span>
              </div>
            )}

            {/* Calculations Breakdown */}
            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono font-semibold">{fmt(summary.subtotal)}</span>
              </div>

              {summary.totalDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Discount Savings:</span>
                  <span className="font-mono font-bold">-{fmt(summary.totalDiscount)}</span>
                </div>
              )}

              {summary.totalGST > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>GST ({saleType === 'inter' ? 'IGST' : 'CGST+SGST'}):</span>
                  <span className="font-mono font-semibold">{fmt(summary.totalGST)}</span>
                </div>
              )}

              {summary.roundOff !== 0 && (
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Round Off:</span>
                  <span className="font-mono">{fmt(summary.roundOff)}</span>
                </div>
              )}

              {/* Grand Total */}
              <div className="flex justify-between items-baseline pt-1.5 border-t border-slate-200 text-slate-900">
                <div>
                  <span className="text-sm font-black tracking-tight">Grand Total:</span>
                  {summary.savings > 0 && (
                    <span className="block text-[10px] font-bold text-emerald-700">
                      Total Savings: {fmt(summary.savings)}
                    </span>
                  )}
                </div>
                <span className="text-xl font-black font-mono text-slate-950">
                  {fmt(summary.grandTotal)}
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Payment Method
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {PAYMENT_METHODS.map(pm => {
                  const Icon = pm.icon;
                  const active = paymentMethod === pm.id;
                  return (
                    <button
                      key={pm.id}
                      onClick={() => setPaymentMethod(pm.id)}
                      className={`flex items-center justify-center space-x-1.5 py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
                        active
                          ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{pm.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cash Tender & Change */}
            {paymentMethod === 'Cash' && (
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      value={amountReceived}
                      onChange={e => setAmountReceived(e.target.value)}
                      placeholder={summary.grandTotal.toFixed(2)}
                      className="w-full pl-7 pr-3 py-1.5 text-xs font-mono font-bold text-slate-900 bg-white border border-slate-300 rounded-lg outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10"
                    />
                  </div>

                  {/* Exact Cash Button */}
                  <button
                    onClick={() => setAmountReceived(summary.grandTotal.toString())}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold rounded-lg transition cursor-pointer shrink-0"
                  >
                    Exact
                  </button>
                </div>

                {/* Quick Cash Buttons */}
                <div className="flex space-x-1 text-[10px] font-bold">
                  {[100, 200, 500, 2000].map(val => (
                    <button
                      key={val}
                      onClick={() => setAmountReceived(val.toString())}
                      className="flex-1 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded transition cursor-pointer"
                    >
                      ₹{val}
                    </button>
                  ))}
                </div>

                {/* Change Due Display */}
                {parseFloat(amountReceived) > 0 && (
                  <div className={`flex justify-between items-center px-3 py-1.5 rounded-lg border text-xs font-bold ${
                    parseFloat(amountReceived) >= summary.grandTotal
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}>
                    <span>{parseFloat(amountReceived) >= summary.grandTotal ? 'Change / Return:' : 'Remaining Balance:'}</span>
                    <span className="font-mono text-sm">
                      {fmt(changeAmount >= 0 ? changeAmount : Math.abs(parseFloat(amountReceived) - summary.grandTotal))}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* UPI or Card Reference Input */}
            {paymentMethod !== 'Cash' && (
              <div>
                <input
                  type="text"
                  value={transactionId}
                  onChange={e => setTransactionId(e.target.value)}
                  placeholder={`Enter ${paymentMethod} Reference / Transaction ID (Optional)...`}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 outline-none focus:border-slate-900"
                />
              </div>
            )}

            {/* POS Action Bar */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={handleHoldBill}
                disabled={cartItems.length === 0}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <PauseCircle className="w-4 h-4 text-amber-600" />
                <span>Hold Bill</span>
              </button>

              <button
                onClick={handlePrintCurrentBill}
                disabled={cartItems.length === 0}
                className="py-2.5 px-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>Print Bill</span>
              </button>
            </div>

            {/* Complete Sale Button */}
            <button
              onClick={handleCompleteSale}
              disabled={loading || cartItems.length === 0}
              className="w-full py-3 bg-slate-900 hover:bg-black text-white text-sm font-extrabold rounded-xl shadow-md transition-all duration-150 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Processing Sale...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 text-white" />
                  <span>Complete Sale • {fmt(summary.grandTotal)}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── HIDDEN THERMAL RECEIPT FOR ACTIVE CART (Used when Print Bill clicked) ── */}
      <div className="hidden">
        <InvoicePDF
          invoiceNumber={invoiceNumber}
          cartItems={cartItems}
          customer={customer}
          summary={summary}
          saleType={saleType}
          paymentMethod={paymentMethod}
          billerName={user?.name || user?.email}
          amountPaid={paymentMethod === 'Cash' ? (parseFloat(amountReceived) || summary.grandTotal) : summary.grandTotal}
          transactionId={transactionId}
          settings={billingSettings}
        />
      </div>

      {/* ── MODALS ── */}
      {/* Customer Modal */}
      {showCustomerModal && (
        <CustomerModal
          customer={customer}
          onSave={c => {
            setCustomer(c);
            setShowCustomerModal(false);
          }}
          onClose={() => setShowCustomerModal(false)}
        />
      )}

      {/* Held Bills Modal */}
      {showHeldBillsModal && (
        <HeldBillsModal
          heldBills={heldBills}
          onResume={handleResumeBill}
          onDiscard={handleDiscardHeldBill}
          onClose={() => setShowHeldBillsModal(false)}
        />
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// HELD BILLS MODAL
// ──────────────────────────────────────────────────────────────────────────────
function HeldBillsModal({ heldBills, onResume, onDiscard, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 no-print">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] flex flex-col border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <PauseCircle className="w-5 h-5 text-amber-600" />
            <h2 className="text-sm font-bold text-slate-900 font-heading">
              Held Bills ({heldBills.length})
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {heldBills.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <PauseCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-600">No held bills</p>
              <p className="text-xs text-slate-400 mt-1">Held customer transactions will show here.</p>
            </div>
          ) : (
            heldBills.map(hold => (
              <div
                key={hold.id}
                className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-900">
                      {hold.customer?.name || 'Walk-in Customer'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(hold.heldAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {hold.cartItems.length} items • <strong className="text-slate-900">{fmt(hold.summary.grandTotal)}</strong>
                  </p>
                  <p className="text-[10px] text-slate-400 truncate max-w-xs mt-0.5">
                    {hold.cartItems.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onResume(hold)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg transition cursor-pointer flex items-center space-x-1"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>Resume</span>
                  </button>
                  <button
                    onClick={() => onDiscard(hold.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-200 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-100 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// SUCCESS SCREEN (WITH DEDICATED THERMAL BILL LAYOUT)
// ──────────────────────────────────────────────────────────────────────────────
function SuccessScreen({ successData, onNewBill, onViewHistory, onViewDetail, settings }) {
  const { invoice, items, payment } = successData;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[580px] p-6 bg-slate-50">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl shadow-sm p-6 text-center no-print">
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
          <CheckCircle className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-black text-slate-900 tracking-tight font-heading">
          Sale Completed!
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Bill <strong className="font-mono text-slate-900">{invoice.invoice_number}</strong> created successfully.
        </p>

        {/* Transaction Summary Card */}
        <div className="my-5 bg-slate-50 rounded-xl p-4 border border-slate-200 text-left space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Bill Number:</span>
            <span className="font-bold font-mono text-slate-900">{invoice.invoice_number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Customer:</span>
            <span className="font-semibold text-slate-800">{invoice.customer_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Payment Method:</span>
            <span className="font-semibold text-slate-800">{invoice.payment_method}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-sm text-slate-900">
            <span>Amount Paid:</span>
            <span className="font-mono">{fmt(invoice.grand_total)}</span>
          </div>
          {Number(invoice.change_amount) > 0 && (
            <div className="flex justify-between text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded">
              <span>Change Returned:</span>
              <span className="font-mono">{fmt(invoice.change_amount)}</span>
            </div>
          )}
          {Number(invoice.savings) > 0 && (
            <div className="text-center text-[11px] font-bold text-emerald-700 pt-1">
              Customer Saved {fmt(invoice.savings)}!
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={handlePrint}
            className="w-full py-3 bg-slate-900 hover:bg-black text-white text-xs font-extrabold rounded-xl shadow-md transition cursor-pointer flex items-center justify-center space-x-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onNewBill}
              className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Next Bill</span>
            </button>
            <button
              onClick={onViewHistory}
              className="py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Billing History
            </button>
          </div>
        </div>
      </div>

      {/* ── PRINT-ONLY DEDICATED THERMAL RECEIPT ── */}
      <InvoicePDF
        invoiceNumber={invoice.invoice_number}
        cartItems={items.map(i => ({
          id: i.product_id,
          name: i.product_name_snapshot,
          sku: i.sku_snapshot,
          unit_price: i.unit_price,
          mrp: i.mrp,
          quantity: i.quantity,
          discount: i.discount_pct,
          gst_rate: i.gst_rate,
          uom_symbol: i.uom_symbol
        }))}
        customer={{
          name: invoice.customer_name,
          phone: invoice.customer_phone,
          gstin: invoice.customer_gstin
        }}
        summary={{
          subtotal: invoice.subtotal,
          totalDiscount: invoice.discount,
          taxableAmount: invoice.taxable_amount,
          totalCGST: invoice.cgst,
          totalSGST: invoice.sgst,
          totalIGST: invoice.igst,
          roundOff: invoice.round_off,
          grandTotal: invoice.grand_total,
          bill_total: invoice.bill_total,
          savings: invoice.savings
        }}
        saleType={invoice.sale_type}
        paymentMethod={invoice.payment_method}
        billerName={invoice.biller_name}
        amountPaid={invoice.amount_paid}
        transactionId={invoice.transaction_id}
        invoiceDate={invoice.created_at}
        settings={settings}
      />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// BILLING HISTORY VIEW
// ──────────────────────────────────────────────────────────────────────────────
function BillingHistory({ onBack, onSelectInvoice, settings }) {
  const [activeTab, setActiveTab] = useState('invoices'); // 'invoices' | 'customers'
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [customersTotal, setCustomersTotal] = useState(0);
  const LIMIT = 20;

  const [activePrintInvoice, setActivePrintInvoice] = useState(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'invoices') {
        const params = new URLSearchParams({ page, limit: LIMIT });
        if (search.trim()) params.set('search', search.trim());
        const res = await fetch(`/api/billing/invoices?${params.toString()}`);
        const data = await res.json();
        if (data.success) {
          setInvoices(data.data || []);
          setTotal(data.total || 0);
        }
      } else {
        const params = new URLSearchParams({ page, limit: LIMIT });
        if (search.trim()) params.set('search', search.trim());
        const res = await fetch(`/api/billing/customers?${params.toString()}`);
        const data = await res.json();
        if (data.success) {
          setCustomers(data.data || []);
          setCustomersTotal(data.total || 0);
        }
      }
    } catch {
      if (activeTab === 'invoices') setInvoices([]);
      else setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, activeTab]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handlePrintHistoricalReceipt = async (inv) => {
    try {
      const res = await fetch(`/api/billing/invoices/${inv.id}`);
      const data = await res.json();
      if (data.success && data.data) {
        setActivePrintInvoice(data.data);
        setTimeout(() => {
          window.print();
        }, 150);
      }
    } catch {
      // Print fetch error
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden text-slate-900">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white shrink-0 no-print">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            title="Back to POS"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-base font-bold text-slate-900 font-heading">
              Billing History & Transactions
            </h2>
            <p className="text-xs text-slate-500">
              {activeTab === 'invoices' ? `Total ${total} bills recorded` : `Total ${customersTotal} customers recorded`}
            </p>
          </div>
        </div>

        {/* Tab switchers + Search */}
        <div className="flex items-center space-x-3">
          <div className="flex p-0.5 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => { setActiveTab('invoices'); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'invoices' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Receipt className="w-3.5 h-3.5 text-purple-600" />
              <span>Invoices & Bills</span>
              {total > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-purple-100 text-purple-700 rounded-full text-[10px] font-bold">
                  {total}
                </span>
              )}
            </button>
            <button
              onClick={() => { setActiveTab('customers'); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'customers' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-purple-600" />
              <span>Customers</span>
              {customersTotal > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded-full text-[10px] font-bold">
                  {customersTotal}
                </span>
              )}
            </button>
          </div>

          <div className="w-64">
            <div className="flex items-center bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs">
              <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder={activeTab === 'invoices' ? 'Search by Bill, Name, Phone...' : 'Search by Name, Phone, Email...'}
                className="flex-1 bg-transparent text-slate-900 placeholder-slate-400 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto no-print">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
          </div>
        ) : activeTab === 'invoices' ? (
          invoices.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">No invoices found</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px] sticky top-0 z-10 shadow-xs">
                <tr>
                  <th className="py-3 px-3.5 whitespace-nowrap">Bill No</th>
                  <th className="py-3 px-3 whitespace-nowrap">Date & Time</th>
                  <th className="py-3 px-3.5 whitespace-nowrap">Customer Name</th>
                  <th className="py-3 px-3 whitespace-nowrap">Customer Number</th>
                  <th className="py-3 px-3 whitespace-nowrap">Mail</th>
                  <th className="py-3 px-3 whitespace-nowrap">Address</th>
                  <th className="py-3 px-3 text-center whitespace-nowrap">Purchase</th>
                  <th className="py-3 px-3.5 text-right whitespace-nowrap">Price</th>
                  <th className="py-3 px-3 text-center whitespace-nowrap">Status</th>
                  <th className="py-3 px-3.5 text-right whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition">
                    {/* 1. Bill Number */}
                    <td className="py-3 px-3.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {inv.invoice_number}
                    </td>

                    {/* 2. Date & Time */}
                    <td className="py-3 px-3 whitespace-nowrap text-slate-600">
                      <div className="font-semibold text-slate-800">
                        {new Date(inv.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {new Date(inv.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    {/* 3. Customer Name */}
                    <td className="py-3 px-3.5 font-bold text-slate-900 whitespace-nowrap">
                      {inv.customer_name || 'Walk-in Customer'}
                    </td>

                    {/* 4. Customer Number (Phone) */}
                    <td className="py-3 px-3 font-mono text-slate-700 whitespace-nowrap">
                      {inv.customer_phone ? (
                        <div className="flex items-center space-x-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{inv.customer_phone}</span>
                        </div>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    {/* 5. Mail (Email) */}
                    <td className="py-3 px-3 text-slate-600 max-w-[150px] truncate" title={inv.customer_email}>
                      {inv.customer_email ? (
                        <div className="flex items-center space-x-1">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{inv.customer_email}</span>
                        </div>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    {/* 6. Address */}
                    <td className="py-3 px-3 text-slate-600 max-w-[160px] truncate" title={inv.customer_address}>
                      {inv.customer_address ? (
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{inv.customer_address}</span>
                        </div>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    {/* 7. Purchase (Products Count) */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {inv.items_count || 1} Products
                      </span>
                    </td>

                    {/* 8. Price */}
                    <td className="py-3 px-3.5 text-right font-mono font-extrabold text-slate-900 whitespace-nowrap">
                      {fmt(inv.grand_total)}
                    </td>

                    {/* 9. Payment & Status */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="space-y-0.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          inv.payment_status === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {inv.payment_status || 'Paid'}
                        </span>
                        <div className="text-[9px] text-slate-400 font-semibold">{inv.payment_method}</div>
                      </div>
                    </td>

                    {/* 10. Action */}
                    <td className="py-3 px-3.5 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => handlePrintHistoricalReceipt(inv)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-700 text-[11px] font-bold rounded-lg transition cursor-pointer inline-flex items-center space-x-1"
                        title="Print 80mm Thermal Receipt"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Print</span>
                      </button>
                      <button
                        onClick={() => onSelectInvoice(inv.id)}
                        className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[11px] font-bold rounded-lg transition cursor-pointer"
                        title="View Full Bill Details"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : (
          /* Customer Directory Table */
          customers.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">No customers registered yet</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px] sticky top-0 z-10 shadow-xs">
                <tr>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Customer Number</th>
                  <th className="py-3 px-4">Mail</th>
                  <th className="py-3 px-4">Address</th>
                  <th className="py-3 px-4">Registered Date</th>
                  <th className="py-3 px-4 text-center">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {c.name || 'Walk-in Customer'}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {c.phone ? (
                        <div className="flex items-center space-x-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{c.phone}</span>
                        </div>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {c.email ? (
                        <div className="flex items-center space-x-1">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{c.email}</span>
                        </div>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {c.address ? (
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{c.address}</span>
                        </div>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {c.created_at ? new Date(c.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        c.is_walk_in ? 'bg-slate-100 text-slate-600' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {c.is_walk_in ? 'Walk-in' : 'Registered'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>

      {/* Hidden Thermal Receipt for Historical Print */}
      {activePrintInvoice && (
        <div className="hidden">
          <InvoicePDF
            invoiceNumber={activePrintInvoice.invoice.invoice_number}
            cartItems={activePrintInvoice.items.map(i => ({
              id: i.product_id,
              name: i.product_name_snapshot,
              sku: i.sku_snapshot,
              unit_price: i.unit_price,
              mrp: i.mrp,
              quantity: i.quantity,
              discount: i.discount_pct,
              gst_rate: i.gst_rate,
              uom_symbol: i.uom_symbol
            }))}
            customer={{
              name: activePrintInvoice.invoice.customer_name,
              phone: activePrintInvoice.invoice.customer_phone,
              gstin: activePrintInvoice.invoice.customer_gstin
            }}
            summary={{
              subtotal: activePrintInvoice.invoice.subtotal,
              totalDiscount: activePrintInvoice.invoice.discount,
              taxableAmount: activePrintInvoice.invoice.taxable_amount,
              totalCGST: activePrintInvoice.invoice.cgst,
              totalSGST: activePrintInvoice.invoice.sgst,
              totalIGST: activePrintInvoice.invoice.igst,
              roundOff: activePrintInvoice.invoice.round_off,
              grandTotal: activePrintInvoice.invoice.grand_total,
              bill_total: activePrintInvoice.invoice.bill_total,
              savings: activePrintInvoice.invoice.savings
            }}
            saleType={activePrintInvoice.invoice.sale_type}
            paymentMethod={activePrintInvoice.invoice.payment_method}
            billerName={activePrintInvoice.invoice.biller_name}
            amountPaid={activePrintInvoice.invoice.amount_paid}
            transactionId={activePrintInvoice.invoice.transaction_id}
            invoiceDate={activePrintInvoice.invoice.created_at}
            settings={settings}
          />
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// INVOICE DETAIL VIEW
// ──────────────────────────────────────────────────────────────────────────────
function InvoiceDetailView({ invoiceId, onBack, settings }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/billing/invoices/${invoiceId}`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) {
          setData(d.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [invoiceId]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-2xl border border-slate-200">
        <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
      </div>
    );
  }

  const { invoice, items } = data;

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-2xl shadow-sm overflow-y-auto p-5">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 no-print">
        <button
          onClick={onBack}
          className="flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Billing History</span>
        </button>

        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center space-x-1.5 shadow-sm"
        >
          <Printer className="w-4 h-4" />
          <span>Print Invoice</span>
        </button>
      </div>

      <div className="flex justify-center">
        <InvoicePDF
          invoiceNumber={invoice.invoice_number}
          cartItems={items.map(i => ({
            id: i.product_id,
            name: i.product_name_snapshot,
            sku: i.sku_snapshot,
            unit_price: i.unit_price,
            mrp: i.mrp,
            quantity: i.quantity,
            discount: i.discount_pct,
            gst_rate: i.gst_rate,
            uom_symbol: i.uom_symbol
          }))}
          customer={{
            name: invoice.customer_name,
            phone: invoice.customer_phone,
            gstin: invoice.customer_gstin
          }}
          summary={{
            subtotal: invoice.subtotal,
            totalDiscount: invoice.discount,
            taxableAmount: invoice.taxable_amount,
            totalCGST: invoice.cgst,
            totalSGST: invoice.sgst,
            totalIGST: invoice.igst,
            roundOff: invoice.round_off,
            grandTotal: invoice.grand_total,
            bill_total: invoice.bill_total,
            savings: invoice.savings
          }}
          saleType={invoice.sale_type}
          paymentMethod={invoice.payment_method}
          billerName={invoice.biller_name}
          amountPaid={invoice.amount_paid}
          transactionId={invoice.transaction_id}
          invoiceDate={invoice.created_at}
          preview
          settings={settings}
        />
      </div>
    </div>
  );
}
