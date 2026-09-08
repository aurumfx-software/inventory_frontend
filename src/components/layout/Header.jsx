import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Bell, 
  Search, 
  ShieldCheck, 
  Warehouse, 
  User, 
  LogOut, 
  ChevronDown, 
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  Radio,
  Package,
  Users,
  FileText,
  ShoppingCart,
  ArrowRight,
  Sun,
  Moon,
  X,
  Menu
} from 'lucide-react';

export default function Header({ setActiveTab, onToggleMobileSidebar }) {
  const { 
    user, 
    switchRole, 
    activeWarehouse, 
    setActiveWarehouse, 
    notifications, 
    setNotifications, 
    logout,
    themeMode,
    toggleThemeMode 
  } = useAuth();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Global Instant Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ items: [], suppliers: [], indents: [], pages: [] });
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef(null);

  const [itemsData, setItemsData] = useState([]);
  const [suppliersData, setSuppliersData] = useState([]);
  const [indentsData, setIndentsData] = useState([]);

  const pagesList = [
    { id: 'dashboard', name: 'Dashboard Page', desc: 'Main executive KPI summary & analytics' },
    { id: 'item-master', name: 'Item Master', desc: 'Permanent catalog of inventory items & specs' },
    { id: 'supplier-master', name: 'Supplier Directory', desc: 'Vendor database & performance ratings' },
    { id: 'dept-wh-master', name: 'Depts & Warehouses', desc: 'Department cost centres & storage bins' },
    { id: 'indents', name: 'Indent Requisitions', desc: 'Material requests & approval status' },
    { id: 'approvals', name: 'Approval Workflows', desc: 'Multi-level transaction approval inbox' },
    { id: 'stock-review', name: 'Stock Availability Review', desc: 'Store manager review & stock issue split' },
    { id: 'rfq-quotes', name: 'RFQ & Quotes Matrix', desc: 'Commercial landed cost evaluation & L1 matrix' },
    { id: 'purchase-orders', name: 'Purchase Orders', desc: 'PO commitments & invoice printing' },
    { id: 'current-stock', name: 'Current Stock Page', desc: 'Available, on-hand & reserved stock balances' },
    { id: 'grn-inspection', name: 'GRN & Quality Inspection', desc: 'Goods receipts & quality inspection' },
    { id: 'stock-ops', name: 'Stock Ledger & Transfers', icon: Package, desc: 'Append-only stock ledger & two-step transfers' },
    { id: 'stock-returns', name: 'Stock Return Page', desc: 'Department unused material returns' },
    { id: 'supplier-returns', name: 'Supplier Return Page', desc: 'Vendor rejections & damaged returns' },
    { id: 'stock-adjustment', name: 'Stock Adjustment Page', desc: 'Positive/negative stock adjustments' },
    { id: 'stock-verification', name: 'Physical Stock Verification', desc: 'Count sessions & blind count audit' },
    { id: 'reservation-management', name: 'Reservation Management', desc: 'Active reserved stock allocations' },
    { id: 'asset-tracking', name: 'Asset Tracking Page', desc: 'IT equipment tracking & warranty' },
    { id: 'reports', name: '16 Specialized Reports', desc: 'Stock valuation, ageing & consumption reports' },
    { id: 'audit-logs', name: 'Audit Activity Logs', desc: 'Tamper-proof system activity trail' },
    { id: 'settings', name: 'System Configuration', desc: 'Company settings & document counters' }
  ];

  useEffect(() => {
    // Fetch search data sources
    fetch('/api/items').then(r => r.json()).then(d => d.success && setItemsData(d.data));
    fetch('/api/suppliers').then(r => r.json()).then(d => d.success && setSuppliersData(d.data));
    fetch('/api/indents').then(r => r.json()).then(d => d.success && setIndentsData(d.data));
  }, []);

  // Perform Live Global Search when searchQuery changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ items: [], suppliers: [], indents: [], pages: [] });
      setShowSearchDropdown(false);
      return;
    }

    const q = searchQuery.toLowerCase();

    const matchedItems = itemsData.filter(i => 
      i.item_code.toLowerCase().includes(q) || 
      i.item_name.toLowerCase().includes(q) ||
      (i.description && i.description.toLowerCase().includes(q))
    ).slice(0, 4);

    const matchedSuppliers = suppliersData.filter(s => 
      s.supplier_code.toLowerCase().includes(q) || 
      s.supplier_name.toLowerCase().includes(q) ||
      (s.contact_person && s.contact_person.toLowerCase().includes(q))
    ).slice(0, 3);

    const matchedIndents = indentsData.filter(ind => 
      ind.indent_number.toLowerCase().includes(q) || 
      ind.purpose.toLowerCase().includes(q)
    ).slice(0, 3);

    const matchedPages = pagesList.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.desc.toLowerCase().includes(q)
    ).slice(0, 4);

    setSearchResults({
      items: matchedItems,
      suppliers: matchedSuppliers,
      indents: matchedIndents,
      pages: matchedPages
    });

    setShowSearchDropdown(true);
  }, [searchQuery]);

  const handleNavigate = (tabId) => {
    if (setActiveTab) setActiveTab(tabId);
    setShowSearchDropdown(false);
    setSearchQuery('');
  };

  const [liveNotifs, setLiveNotifs] = useState([]);

  useEffect(() => {
    fetchLiveNotifications();
    const interval = setInterval(fetchLiveNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchLiveNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setLiveNotifs(data.data);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  const displayNotifications = liveNotifs.length > 0 ? liveNotifs : notifications;
  const unreadCount = displayNotifications.filter(n => n.unread || !n.is_read).length;

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications/read-all', { method: 'POST' });
      setLiveNotifs(liveNotifs.map(n => ({ ...n, unread: false, is_read: true })));
      setNotifications(notifications.map(n => ({ ...n, unread: false, is_read: true })));
    } catch (e) {
      setNotifications(notifications.map(n => ({ ...n, unread: false })));
    }
  };

  const rolesList = [
    { id: 'role-admin', label: 'Super Administrator' },
    { id: 'role-purchase', label: 'Purchase Manager' },
    { id: 'role-store', label: 'Store Manager' },
    { id: 'role-dept-mgr', label: 'Department Manager' },
    { id: 'role-requester', label: 'Employee / Requester' },
    { id: 'role-finance', label: 'Finance User' },
    { id: 'role-auditor', label: 'Auditor' }
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Welcome Greeting & Brand Header */}
      <div className="flex items-center space-x-3">
        {/* 3-Line Hamburger Menu Button for Mobile */}
        <button
          onClick={onToggleMobileSidebar}
          className="md:hidden p-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-700 transition cursor-pointer shadow-2xs shrink-0"
          title="Open Navigation Menu"
        >
          <Menu className="w-5 h-5 text-slate-800" />
        </button>

        <div className="hidden lg:block shrink-0">
          <p className="text-xs text-slate-500 font-medium">Welcome To</p>
          <p className="text-sm font-bold text-purple-700 font-heading leading-tight">{user?.name || 'Sarah Jenkins'}</p>
        </div>
      </div>

      {/* Header Right Actions */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Global Instant Search Container - Right beside Dark Mode Toggle */}
        <div className="relative w-36 xs:w-44 sm:w-64 md:w-72 lg:w-80" ref={searchRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.trim() && setShowSearchDropdown(true)}
            placeholder="Search items, POs..." 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 sm:pl-9 pr-7 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:bg-white transition shadow-2xs font-medium"
          />
          {searchQuery && (
            <button 
              onClick={() => { setSearchQuery(''); setShowSearchDropdown(false); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Floating Instant Search Results Modal Dropdown */}
          {showSearchDropdown && (
            <div className="absolute right-0 w-72 sm:w-96 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl py-3 z-50 max-h-[80vh] overflow-y-auto divide-y divide-slate-100 text-xs">
              
              {/* Pages & Navigation Results */}
              {searchResults.pages.length > 0 && (
                <div className="p-3 space-y-1.5">
                  <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">System Pages & Modules ({searchResults.pages.length})</span>
                  {searchResults.pages.map(p => (
                    <button 
                      key={p.id}
                      onClick={() => handleNavigate(p.id)}
                      className="w-full text-left p-2 rounded-xl hover:bg-purple-50 flex items-center justify-between transition group"
                    >
                      <div>
                        <p className="font-bold text-slate-800 group-hover:text-purple-700">{p.name}</p>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{p.desc}</p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600 shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              )}

              {/* Items Master Results */}
              {searchResults.items.length > 0 && (
                <div className="p-3 space-y-1.5">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Inventory Items ({searchResults.items.length})</span>
                  {searchResults.items.map(i => (
                    <button 
                      key={i.id}
                      onClick={() => handleNavigate('item-master')}
                      className="w-full text-left p-2 rounded-xl hover:bg-emerald-50 flex items-center justify-between transition group"
                    >
                      <div>
                        <span className="font-mono text-[10px] font-bold text-purple-700">{i.item_code}</span>
                        <p className="font-bold text-slate-800 group-hover:text-emerald-700">{i.item_name}</p>
                      </div>
                      <span className="font-mono font-bold text-slate-900">₹{(i.valuation_rate || 0).toLocaleString()}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Suppliers Directory Results */}
              {searchResults.suppliers.length > 0 && (
                <div className="p-3 space-y-1.5">
                  <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">Suppliers Directory ({searchResults.suppliers.length})</span>
                  {searchResults.suppliers.map(s => (
                    <button 
                      key={s.id}
                      onClick={() => handleNavigate('supplier-master')}
                      className="w-full text-left p-2 rounded-xl hover:bg-indigo-50 flex items-center justify-between transition group"
                    >
                      <div>
                        <span className="font-mono text-[10px] font-bold text-indigo-700">{s.supplier_code}</span>
                        <p className="font-bold text-slate-800 group-hover:text-indigo-700">{s.supplier_name}</p>
                      </div>
                      <span className="text-[10px] text-slate-500">{s.contact_person}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Material Indents Results */}
              {searchResults.indents.length > 0 && (
                <div className="p-3 space-y-1.5">
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Material Indents ({searchResults.indents.length})</span>
                  {searchResults.indents.map(ind => (
                    <button 
                      key={ind.id}
                      onClick={() => handleNavigate('indents')}
                      className="w-full text-left p-2 rounded-xl hover:bg-amber-50 flex items-center justify-between transition group"
                    >
                      <div>
                        <span className="font-mono text-[10px] font-bold text-purple-700">{ind.indent_number}</span>
                        <p className="font-bold text-slate-800">{ind.purpose}</p>
                      </div>
                      <span className="font-mono font-bold text-slate-900">₹{(ind.total_estimated_amount || 0).toLocaleString()}</span>
                    </button>
                  ))}
                </div>
              )}

              {searchResults.pages.length === 0 && searchResults.items.length === 0 && searchResults.suppliers.length === 0 && searchResults.indents.length === 0 && (
                <div className="p-6 text-center text-slate-400 text-xs font-medium">
                  No matching items, indents, or pages found for "{searchQuery}".
                </div>
              )}
            </div>
          )}
        </div>

        {/* Active Warehouse Picker */}
        <div className="hidden md:flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs shadow-xs">
          <Warehouse className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-slate-500 font-medium">Warehouse:</span>
          <select 
            value={activeWarehouse} 
            onChange={(e) => setActiveWarehouse(e.target.value)}
            className="bg-transparent text-emerald-700 font-bold focus:outline-none cursor-pointer"
          >
            <option value="wh-01" className="bg-white text-slate-800">WH-MAIN (Central)</option>
            <option value="wh-02" className="bg-white text-slate-800">WH-SUB1 (Electronics)</option>
            <option value="wh-03" className="bg-white text-slate-800">WH-TRANS (Transit Store)</option>
          </select>
        </div>

        {/* Dark / Light Theme Toggle Button */}
        <button
          onClick={toggleThemeMode}
          title={themeMode === 'dark' ? "Switch to Light Theme" : "Switch to Dark Theme"}
          className="p-2 bg-slate-50 border border-slate-200 hover:border-purple-300 rounded-xl text-slate-600 transition shadow-xs cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95 group shrink-0"
        >
          {themeMode === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '12s' }} />
          ) : (
            <Moon className="w-4 h-4 text-slate-600 group-hover:text-purple-600 transition-colors" />
          )}
        </button>

        {/* Live Role Switcher */}
        <div className="relative hidden md:block">
          <button 
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center space-x-2 bg-purple-50 border border-purple-200 hover:bg-purple-100 px-3 py-1.5 rounded-xl text-xs text-purple-700 font-bold transition shadow-xs"
          >
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>{user?.role}</span>
            <ChevronDown className="w-3.5 h-3.5 text-purple-500" />
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50">
              <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <span>Switch Role Persona</span>
                <Sparkles className="w-3 h-3 text-purple-600" />
              </div>
              {rolesList.map(r => (
                <button
                  key={r.id}
                  onClick={() => {
                    switchRole(r.id);
                    setShowRoleDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-purple-50 hover:text-purple-700 transition ${user?.role_id === r.id ? 'text-purple-700 font-bold bg-purple-50/80' : 'text-slate-700'}`}
                >
                  <span>{r.label}</span>
                  {user?.role_id === r.id && <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Live Action Pill - Commented out temporarily as requested */}
        {/* 
        <button 
          onClick={() => markAllRead()}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs px-3 py-1.5 rounded-xl flex items-center space-x-1.5 shadow-xs transition cursor-pointer"
        >
          <Radio className="w-3.5 h-3.5 text-white animate-pulse" />
          <span>Live Tracking</span>
        </button>
        */}

        {/* Notifications Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="p-2 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl text-slate-600 relative transition shadow-xs"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">System Notifications ({unreadCount})</span>
                <button onClick={markAllRead} className="text-[11px] text-purple-600 font-bold hover:underline">Mark all read</button>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {displayNotifications.map(n => (
                  <div key={n.id} className={`p-3 text-xs flex space-x-3 hover:bg-slate-50 transition ${n.unread || !n.is_read ? 'bg-purple-50/50 font-medium' : ''}`}>
                    {n.type === 'warning' ? <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" /> : 
                     n.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> :
                     <Info className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />}
                    <div className="flex-1">
                      <p className="font-bold text-slate-800 text-xs">{n.title}</p>
                      <p className="text-slate-600 text-[11px] mt-0.5 leading-snug">{n.message}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block font-mono font-medium">{n.time || n.created_at?.replace('T', ' ').substring(0, 19)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center space-x-2 border-l border-slate-200 pl-3 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
              {user?.name ? user.name.charAt(0) : 'S'}
            </div>
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl py-1 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-800">{user?.name}</p>
                <p className="text-[11px] text-slate-500">{user?.email}</p>
              </div>
              <button 
                onClick={logout}
                className="w-full text-left px-4 py-2 text-xs text-red-600 font-bold hover:bg-red-50 flex items-center space-x-2 transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
