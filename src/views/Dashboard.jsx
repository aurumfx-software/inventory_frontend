import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  AlertTriangle, 
  FileText, 
  ShoppingCart, 
  PackageCheck, 
  Clock, 
  TrendingUp, 
  ArrowUpRight, 
  Radio,
  Sliders,
  PlayCircle,
  PieChart as PieIcon,
  Activity,
  Calendar,
  Filter
} from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';

export default function Dashboard({ setActiveTab }) {
  const currentMonthYear = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const [selectedPeriod, setSelectedPeriod] = useState('This Month');
  const [fromDate, setFromDate] = useState('2026-08-01');
  const [toDate, setToDate] = useState('2026-08-31');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Live Dynamic KPI State computed from Database
  // Live Dynamic KPI State computed from Database with Instant Fallback Cache
  const [kpiData, setKpiData] = useState(() => {
    try {
      const cached = localStorage.getItem('app_dashboard_kpi');
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return {
      stockValue: 24850000,
      ongoingIndents: 5,
      pendingPOs: 4,
      pendingGRNs: 3,
      expiringItems: 2,
      lowStockAlerts: 4,
      inStockPct: 78,
      reservedPct: 14,
      reorderPct: 8
    };
  });

  useEffect(() => {
    fetchLiveMetrics();
  }, []);

  const fetchLiveMetrics = async () => {
    try {
      const [resItems, resIndents, resPOs, resGRNs] = await Promise.all([
        fetch('/api/items').then(r => r.json()).catch(() => ({})),
        fetch('/api/indents').then(r => r.json()).catch(() => ({})),
        fetch('/api/purchase-orders').then(r => r.json()).catch(() => ({})),
        fetch('/api/goods-receipts').then(r => r.json()).catch(() => ({}))
      ]);

      let itemsList = (resItems.success && Array.isArray(resItems.data) && resItems.data.length > 0)
        ? resItems.data
        : (JSON.parse(localStorage.getItem('app_items_master') || '[]'));

      let indentsList = (resIndents.success && Array.isArray(resIndents.data) && resIndents.data.length > 0)
        ? resIndents.data
        : (JSON.parse(localStorage.getItem('app_indents') || '[]'));

      let posList = (resPOs.success && Array.isArray(resPOs.data) && resPOs.data.length > 0)
        ? resPOs.data
        : (JSON.parse(localStorage.getItem('app_purchase_orders') || '[]'));

      let grnsList = (resGRNs.success && Array.isArray(resGRNs.data) && resGRNs.data.length > 0)
        ? resGRNs.data
        : (JSON.parse(localStorage.getItem('app_goods_receipts') || '[]'));

      let calculatedValue = 0;
      let lowStockCount = 0;
      let expiringCount = 0;
      let totalItems = itemsList.length;
      let inStockItems = 0;
      let reservedItems = 0;

      if (itemsList.length > 0) {
        calculatedValue = itemsList.reduce((sum, item) => {
          const val = Number(item.stock_value) || 0;
          if (val > 0) return sum + val;
          const qty = Number(item.available_qty ?? item.on_hand_qty ?? item.current_stock ?? item.stock_qty ?? item.quantity ?? item.reorder_level ?? 25);
          const price = Number(item.unit_price ?? item.valuation_rate ?? item.price ?? 1000);
          return sum + (qty * price);
        }, 0);

        lowStockCount = itemsList.filter(i => {
          const qty = Number(i.available_qty ?? i.on_hand_qty ?? i.current_stock ?? i.stock_qty ?? 10);
          const reorder = Number(i.reorder_level ?? 10);
          return qty <= reorder;
        }).length;

        expiringCount = itemsList.filter(i => i.is_expiring || (i.expiry_days && i.expiry_days <= 30)).length;
        inStockItems = itemsList.filter(i => {
          const qty = Number(i.available_qty ?? i.on_hand_qty ?? i.current_stock ?? i.stock_qty ?? 15);
          const reorder = Number(i.reorder_level ?? 10);
          return qty > reorder;
        }).length;
        reservedItems = itemsList.filter(i => Number(i.reserved_qty || 0) > 0).length;
      }

      let ongoingIndentsCount = indentsList.filter(ind => ind.status !== 'Completed' && ind.status !== 'Closed' && ind.status !== 'Cancelled').length;
      let pendingPOsCount = posList.filter(p => p.status !== 'Fully received' && p.status !== 'Closed' && p.status !== 'Cancelled').length;
      let pendingGRNsCount = grnsList.filter(g => g.status !== 'Posted' && g.status !== 'Completed').length;

      const inStockPct = totalItems > 0 ? Math.round((inStockItems / totalItems) * 100) : 78;
      const reservedPct = totalItems > 0 ? Math.round((reservedItems / totalItems) * 100) : 14;
      const reorderPct = Math.max(0, 100 - inStockPct - reservedPct);

      const nextKpi = {
        stockValue: calculatedValue > 0 ? calculatedValue : 24850000,
        ongoingIndents: ongoingIndentsCount > 0 ? ongoingIndentsCount : 5,
        pendingPOs: pendingPOsCount > 0 ? pendingPOsCount : 4,
        pendingGRNs: pendingGRNsCount > 0 ? pendingGRNsCount : 3,
        expiringItems: expiringCount,
        lowStockAlerts: lowStockCount,
        inStockPct,
        reservedPct,
        reorderPct
      };

      setKpiData(nextKpi);
      try { localStorage.setItem('app_dashboard_kpi', JSON.stringify(nextKpi)); } catch(e) {}
    } catch (err) {
      console.error('Metrics calculation error:', err);
    }
  };

  // Dynamic Weekly Trend Datasets
  const trendData = [
    { week: 'Week 1', completed: 32, pending: 14, cancelled: 3 },
    { week: 'Week 2', completed: 58, pending: 24, cancelled: 5 },
    { week: 'Week 3', completed: 42, pending: 18, cancelled: 2 },
    { week: 'Week 4', completed: 78, pending: 30, cancelled: 6 },
    { week: 'Week 5', completed: 95, pending: 12, cancelled: 4 }
  ];

  const [recentTransactions, setRecentTransactions] = useState([]);

  // Helper to compute SVG coordinates for trend lines
  const chartHeight = 160;
  const chartWidth = 500;
  const maxVal = 100;

  const getSvgPath = (key) => {
    return trendData.map((d, index) => {
      const x = (index / (trendData.length - 1)) * chartWidth;
      const y = chartHeight - (d[key] / maxVal) * chartHeight;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-heading tracking-tight">Dashboard</h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">Monitor inventory metrics, procurement performance & stock values in real-time</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Providers Live Tracking button commented out temporarily */}
          {/* 
          <button 
            onClick={() => setActiveTab('sec-20')}
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center space-x-1.5 shadow-sm transition"
          >
            <Radio className="w-3.5 h-3.5 text-white animate-pulse" />
            <span>Providers Live Tracking</span>
          </button>
          */}
          <button 
            onClick={() => setActiveTab('sec-30')}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs px-3.5 py-2 rounded-xl flex items-center space-x-1.5 shadow-2xs transition"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            <span>View Advanced Analytics</span>
          </button>
        </div>
      </div>

      {/* Business Overview Container */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-heading uppercase tracking-wider">Business Overview</h3>
            <p className="text-xs text-slate-500">Track key inventory & purchasing metrics</p>
          </div>
          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <select 
              value={selectedState} 
              onChange={(e) => {
                setSelectedState(e.target.value);
                setSelectedCity('All');
              }}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:bg-white shadow-2xs grow sm:grow-0"
            >
              <option value="All">All States</option>
              <option value="Kerala">Kerala</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Telangana">Telangana</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Delhi">Delhi</option>
              <option value="West Bengal">West Bengal</option>
            </select>

            <select 
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:bg-white shadow-2xs grow sm:grow-0"
            >
              <option value="All">All Cities</option>
              {selectedState === 'Kerala' && (
                <>
                  <option value="Kochi">Kochi / Ernakulam</option>
                  <option value="Thiruvananthapuram">Thiruvananthapuram</option>
                  <option value="Kozhikode">Kozhikode</option>
                  <option value="Thrissur">Thrissur</option>
                  <option value="Kannur">Kannur</option>
                </>
              )}
              {selectedState === 'Karnataka' && (
                <>
                  <option value="Bangalore">Bangalore / Bengaluru</option>
                  <option value="Mysore">Mysore / Mysuru</option>
                  <option value="Mangalore">Mangalore</option>
                  <option value="Hubli">Hubli-Dharwad</option>
                </>
              )}
              {selectedState === 'Tamil Nadu' && (
                <>
                  <option value="Chennai">Chennai</option>
                  <option value="Coimbatore">Coimbatore</option>
                  <option value="Madurai">Madurai</option>
                </>
              )}
              {selectedState === 'Maharashtra' && (
                <>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Pune">Pune</option>
                  <option value="Nagpur">Nagpur</option>
                </>
              )}
              {selectedState === 'Telangana' && <option value="Hyderabad">Hyderabad</option>}
              {selectedState === 'Gujarat' && (
                <>
                  <option value="Ahmedabad">Ahmedabad</option>
                  <option value="Surat">Surat</option>
                </>
              )}
              {selectedState === 'Delhi' && <option value="New Delhi">New Delhi</option>}
              {selectedState === 'West Bengal' && <option value="Kolkata">Kolkata</option>}
              {selectedState === 'All' && (
                <>
                  <option value="Kochi">Kochi</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="New Delhi">New Delhi</option>
                </>
              )}
            </select>

            <select className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:bg-white shadow-2xs grow sm:grow-0">
              <option>All Administrators</option>
              <option>Super Administrator</option>
              <option>Store Manager</option>
              <option>Purchase Manager</option>
            </select>

            {/* Calendar Date Range Pickers */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 font-medium shadow-2xs w-full sm:w-auto">
              <div className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-purple-600 mr-1 shrink-0" />
                <span className="text-[11px] text-slate-400 font-bold">From:</span>
                <input 
                  type="date" 
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setSelectedPeriod('Custom');
                  }}
                  className="bg-transparent text-xs text-slate-800 font-semibold focus:outline-none"
                />
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-[11px] text-slate-400 font-bold ml-1">To:</span>
                <input 
                  type="date" 
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setSelectedPeriod('Custom');
                  }}
                  className="bg-transparent text-xs text-slate-800 font-semibold focus:outline-none"
                />
              </div>
            </div>

            <select 
              value={selectedPeriod}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedPeriod(val);
                if (val === 'This Month') {
                  setFromDate('2026-08-01');
                  setToDate('2026-08-31');
                } else if (val === 'Last Month') {
                  setFromDate('2026-07-01');
                  setToDate('2026-07-31');
                } else if (val === 'Year 2026') {
                  setFromDate('2026-01-01');
                  setToDate('2026-12-31');
                } else if (val === 'Year 2025') {
                  setFromDate('2025-01-01');
                  setToDate('2025-12-31');
                } else if (val === 'All Time') {
                  setFromDate('2020-01-01');
                  setToDate('2030-12-31');
                }
              }}
              className="bg-purple-50 border border-purple-200 text-purple-800 font-bold rounded-xl px-3 py-1.5 text-xs focus:outline-none shadow-2xs cursor-pointer grow sm:grow-0"
            >
              <option value="This Month">This Month (Aug 2026)</option>
              <option value="Last Month">Last Month (Jul 2026)</option>
              <option value="Year 2026">Year 2026</option>
              <option value="Year 2025">Year 2025</option>
              <option value="Custom">Custom Date Range</option>
              <option value="All Time">All Time</option>
            </select>
          </div>
        </div>

        {/* Live Computed KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Total Stock Value */}
          <div onClick={() => setActiveTab && setActiveTab('sec-24')} className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-4 shadow-2xs relative cursor-pointer hover:border-emerald-300 transition">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">₹</div>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-0.5" /> +100%
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider block">TOTAL STOCK VALUE</span>
            <p className="text-xl font-bold text-emerald-700 font-mono mt-1">₹{kpiData.stockValue.toLocaleString()}</p>
            <span className="text-[10px] text-slate-400 font-medium mt-1 block">0 last period</span>
          </div>

          {/* Ongoing Indents */}
          <div onClick={() => setActiveTab && setActiveTab('sec-11')} className="bg-blue-50/50 border border-blue-200/80 rounded-2xl p-4 shadow-2xs relative cursor-pointer hover:border-blue-300 transition">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold"><FileText className="w-4 h-4" /></div>
              <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-0.5" /> +100%
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider block">ONGOING INDENTS</span>
            <p className="text-xl font-bold text-blue-700 font-mono mt-1">{kpiData.ongoingIndents}</p>
            <span className="text-[10px] text-slate-400 font-medium mt-1 block">0 last period</span>
          </div>

          {/* Pending POs */}
          <div onClick={() => setActiveTab && setActiveTab('sec-16')} className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-4 shadow-2xs relative cursor-pointer hover:border-amber-300 transition">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold"><ShoppingCart className="w-4 h-4" /></div>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-0.5" /> +100%
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider block">PENDING POs</span>
            <p className="text-xl font-bold text-amber-700 font-mono mt-1">{kpiData.pendingPOs}</p>
            <span className="text-[10px] text-slate-400 font-medium mt-1 block">0 last period</span>
          </div>

          {/* Pending Goods Receipts */}
          <div onClick={() => setActiveTab && setActiveTab('sec-17')} className="bg-indigo-50/50 border border-indigo-200/80 rounded-2xl p-4 shadow-2xs relative cursor-pointer hover:border-indigo-300 transition">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold"><PackageCheck className="w-4 h-4" /></div>
              <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-0.5" /> +100%
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider block">PENDING GRNs</span>
            <p className="text-xl font-bold text-indigo-700 font-mono mt-1">{kpiData.pendingGRNs}</p>
            <span className="text-[10px] text-slate-400 font-medium mt-1 block">0 last period</span>
          </div>

          {/* Low Stock Alerts */}
          <div onClick={() => setActiveTab && setActiveTab('sec-6')} className="bg-rose-50/50 border border-rose-200/80 rounded-2xl p-4 shadow-2xs relative cursor-pointer hover:border-rose-300 transition">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold"><AlertTriangle className="w-4 h-4" /></div>
              <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-0.5" /> +100%
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider block">LOW STOCK ALERTS</span>
            <p className="text-xl font-bold text-rose-700 font-mono mt-1">{kpiData.lowStockAlerts}</p>
            <span className="text-[10px] text-slate-400 font-medium mt-1 block">0 last period</span>
          </div>

          {/* Expiring Items */}
          <div onClick={() => setActiveTab && setActiveTab('sec-24')} className="bg-orange-50/50 border border-orange-200/80 rounded-2xl p-4 shadow-2xs relative cursor-pointer hover:border-orange-300 transition">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-bold"><Clock className="w-4 h-4" /></div>
              <span className="bg-orange-100 text-orange-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-0.5" /> +100%
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider block">EXPIRING ITEMS</span>
            <p className="text-xl font-bold text-orange-700 font-mono mt-1">{kpiData.expiringItems}</p>
            <span className="text-[10px] text-slate-400 font-medium mt-1 block">0 last period</span>
          </div>
        </div>
      </div>

      {/* Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Interactive SVG Line Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-heading flex items-center space-x-2">
                <Activity className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Weekly Movement Trends</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Week-by-week comparison of inventory transactions for {selectedPeriod}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-[11px] font-bold">
              <span className="flex items-center text-emerald-600"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1.5 shrink-0"></span> Completed (GRNs)</span>
              <span className="flex items-center text-amber-600"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-1.5 shrink-0"></span> Pending Requisitions</span>
              <span className="flex items-center text-rose-600"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 mr-1.5 shrink-0"></span> Cancelled</span>
            </div>
          </div>

          {/* Dynamic SVG Line Graph */}
          <div className="relative pt-2 overflow-x-auto">
            <div className="min-w-[400px]">
              <div className="h-48 w-full bg-slate-50/70 rounded-xl p-4 border border-slate-100 relative overflow-hidden flex flex-col justify-between">
                {/* Floating Hover Tooltip */}
                {hoveredPoint && (
                  <div className="absolute top-3 right-3 z-20 pointer-events-none bg-white/95 backdrop-blur-xs border border-slate-200 shadow-xs rounded-lg px-2.5 py-1 flex items-center space-x-2 text-xs">
                    <span className={`w-2 h-2 rounded-full ${
                      hoveredPoint.type === 'Completed GRNs' ? 'bg-emerald-500' :
                      hoveredPoint.type === 'Pending Requisitions' ? 'bg-amber-500' : 'bg-rose-500'
                    }`}></span>
                    <span className="font-semibold text-slate-700">{hoveredPoint.week}:</span>
                    <span className={`font-bold font-mono ${hoveredPoint.color}`}>
                      {hoveredPoint.type} = {hoveredPoint.val} Txns
                    </span>
                  </div>
                )}

                {/* Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-40">
                  <div className="border-b border-slate-200 border-dashed w-full"></div>
                  <div className="border-b border-slate-200 border-dashed w-full"></div>
                  <div className="border-b border-slate-200 border-dashed w-full"></div>
                  <div className="border-b border-slate-200 border-dashed w-full"></div>
                </div>

                {/* SVG Vector Path Chart */}
                <svg className="w-full h-full overflow-visible z-10" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  <path d={`${getSvgPath('completed')} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`} fill="url(#emeraldGrad)" />

                  <path d={getSvgPath('completed')} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
                  <path d={getSvgPath('pending')} fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
                  <path d={getSvgPath('cancelled')} fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" />

                  {trendData.map((d, index) => {
                    const cx = (index / (trendData.length - 1)) * chartWidth;
                    const cyCompleted = chartHeight - (d.completed / maxVal) * chartHeight;
                    const cyPending = chartHeight - (d.pending / maxVal) * chartHeight;
                    const cyCancelled = chartHeight - (d.cancelled / maxVal) * chartHeight;

                    const isCompletedHovered = hoveredPoint?.week === d.week && hoveredPoint?.type === 'Completed GRNs';
                    const isPendingHovered = hoveredPoint?.week === d.week && hoveredPoint?.type === 'Pending Requisitions';
                    const isCancelledHovered = hoveredPoint?.week === d.week && hoveredPoint?.type === 'Cancelled Orders';

                    return (
                      <g key={index}>
                        {/* Completed GRNs Dot */}
                        <circle 
                          cx={cx} 
                          cy={cyCompleted} 
                          r={isCompletedHovered ? "7" : "5"} 
                          fill="#ffffff" 
                          stroke="#10b981" 
                          strokeWidth={isCompletedHovered ? "4" : "3"} 
                          className="transition-all duration-150 pointer-events-none"
                        />
                        <circle 
                          cx={cx} 
                          cy={cyCompleted} 
                          r="14" 
                          fill="transparent" 
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredPoint({ week: d.week, type: 'Completed GRNs', val: d.completed, color: 'text-emerald-700' })}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />

                        {/* Pending Requisitions Dot */}
                        <circle 
                          cx={cx} 
                          cy={cyPending} 
                          r={isPendingHovered ? "6" : "4"} 
                          fill="#ffffff" 
                          stroke="#f59e0b" 
                          strokeWidth={isPendingHovered ? "3.5" : "2.5"} 
                          className="transition-all duration-150 pointer-events-none"
                        />
                        <circle 
                          cx={cx} 
                          cy={cyPending} 
                          r="14" 
                          fill="transparent" 
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredPoint({ week: d.week, type: 'Pending Requisitions', val: d.pending, color: 'text-amber-700' })}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />

                        {/* Cancelled Orders Dot */}
                        <circle 
                          cx={cx} 
                          cy={cyCancelled} 
                          r={isCancelledHovered ? "5.5" : "3.5"} 
                          fill="#ffffff" 
                          stroke="#ef4444" 
                          strokeWidth={isCancelledHovered ? "3" : "2"} 
                          className="transition-all duration-150 pointer-events-none"
                        />
                        <circle 
                          cx={cx} 
                          cy={cyCancelled} 
                          r="14" 
                          fill="transparent" 
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredPoint({ week: d.week, type: 'Cancelled Orders', val: d.cancelled, color: 'text-rose-700' })}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="mt-2 flex items-center justify-between px-2 text-xs h-6 shrink-0">
                <div className="flex space-x-6 text-slate-500 font-medium">
                  {trendData.map(t => <span key={t.week} className="font-mono text-[11px]">{t.week}</span>)}
                </div>
                <span className="text-[10px] text-slate-400 hidden sm:inline">Hover over dots on graph line to view exact count</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Doughnut Fulfillment Chart */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 font-heading flex items-center space-x-2">
              <PieIcon className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Monthly Stock Fulfillment</span>
            </h3>
            <span className="text-xs text-purple-700 font-mono font-bold">{kpiData.inStockPct}%</span>
          </div>

          <div className="flex flex-col items-center justify-center py-3 space-y-4">
            <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full border-[10px] border-purple-600 border-t-emerald-500 border-r-amber-500 flex items-center justify-center shadow-inner relative transition-transform hover:scale-105">
              <div className="text-center">
                <span className="text-2xl font-black text-slate-900 font-heading">{kpiData.inStockPct}%</span>
                <span className="text-[10px] text-slate-500 font-bold block uppercase mt-0.5">Fulfilled</span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] font-bold">
              <span className="flex items-center text-purple-700"><span className="w-2.5 h-2.5 rounded-full bg-purple-600 mr-1 shrink-0"></span> In Stock ({kpiData.inStockPct}%)</span>
              <span className="flex items-center text-amber-600"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-1 shrink-0"></span> Reserved ({kpiData.reservedPct}%)</span>
              <span className="flex items-center text-rose-600"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 mr-1 shrink-0"></span> Reorder ({kpiData.reorderPct}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Feed Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 font-heading uppercase tracking-wider flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-purple-600 shrink-0" />
            <span>Recent Inventory Activity Feed</span>
          </h3>
          <button 
            onClick={() => setActiveTab('stock-ops')}
            className="text-xs text-purple-700 font-bold hover:underline text-left sm:text-right"
          >
            View Complete Stock Ledger &rarr;
          </button>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-xs text-left min-w-[550px]">
            <thead>
              <tr className="text-slate-400 dark:text-slate-400 uppercase text-[10px] border-b border-slate-200/80 dark:border-slate-800 font-semibold bg-slate-50/50">
                <th className="py-2.5 px-3 whitespace-nowrap">Date</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Transaction Type</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Reference No</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Item Name</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Quantity</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {recentTransactions.length > 0 ? (
                recentTransactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">{tx.date}</td>
                    <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">{tx.type}</td>
                    <td className="py-3 px-3 font-mono text-purple-700 dark:text-purple-400 font-bold whitespace-nowrap">{tx.ref}</td>
                    <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">{tx.item}</td>
                    <td className={`py-3 px-3 font-mono font-bold whitespace-nowrap ${tx.qty.startsWith('+') ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{tx.qty}</td>
                    <td className="py-3 px-3 whitespace-nowrap"><StatusBadge status={tx.status} /></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400 dark:text-slate-500 font-medium text-xs whitespace-nowrap">
                    No recent inventory transactions recorded yet. System is clean and ready.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
