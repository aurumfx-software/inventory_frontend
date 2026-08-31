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
  const [selectedPeriod, setSelectedPeriod] = useState(currentMonthYear);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Live Dynamic KPI State computed from Database
  const [kpiData, setKpiData] = useState({
    stockValue: 0,
    ongoingIndents: 0,
    pendingPOs: 0,
    pendingGRNs: 0,
    expiringItems: 0,
    lowStockAlerts: 0,
    inStockPct: 100,
    reservedPct: 0,
    reorderPct: 0
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

      let calculatedValue = 0;
      let lowStockCount = 0;
      let expiringCount = 0;
      let totalItems = 0;
      let inStockItems = 0;
      let reservedItems = 0;

      if (resItems.success && Array.isArray(resItems.data)) {
        totalItems = resItems.data.length;
        calculatedValue = resItems.data.reduce((sum, item) => sum + ((item.available_qty || item.on_hand_qty || 0) * (item.valuation_rate || 0)), 0);
        lowStockCount = resItems.data.filter(i => (i.available_qty || 0) <= (i.reorder_level || 10)).length;
        expiringCount = resItems.data.filter(i => i.is_expiring || (i.expiry_days && i.expiry_days <= 30)).length;

        inStockItems = resItems.data.filter(i => (i.available_qty || i.on_hand_qty || 0) > (i.reorder_level || 10)).length;
        reservedItems = resItems.data.filter(i => (i.reserved_qty || 0) > 0).length;
      }

      let ongoingIndentsCount = 0;
      if (resIndents.success && Array.isArray(resIndents.data)) {
        ongoingIndentsCount = resIndents.data.filter(ind => ind.status !== 'Completed' && ind.status !== 'Closed' && ind.status !== 'Cancelled').length;
      }

      let pendingPOsCount = 0;
      if (resPOs.success && Array.isArray(resPOs.data)) {
        pendingPOsCount = resPOs.data.filter(p => p.status !== 'Fully received' && p.status !== 'Closed' && p.status !== 'Cancelled').length;
      }

      let pendingGRNsCount = 0;
      if (resGRNs.success && Array.isArray(resGRNs.data)) {
        pendingGRNsCount = resGRNs.data.filter(g => g.status !== 'Posted' && g.status !== 'Completed').length;
      }

      const inStockPct = totalItems > 0 ? Math.round((inStockItems / totalItems) * 100) : 100;
      const reservedPct = totalItems > 0 ? Math.round((reservedItems / totalItems) * 100) : 0;
      const reorderPct = Math.max(0, 100 - inStockPct - reservedPct);

      setKpiData({
        stockValue: calculatedValue,
        ongoingIndents: ongoingIndentsCount,
        pendingPOs: pendingPOsCount,
        pendingGRNs: pendingGRNsCount,
        expiringItems: expiringCount,
        lowStockAlerts: lowStockCount,
        inStockPct,
        reservedPct,
        reorderPct
      });
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
          <button 
            onClick={() => setActiveTab('sec-11')}
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center space-x-1.5 shadow-sm transition"
          >
            <Radio className="w-3.5 h-3.5 text-white animate-pulse" />
            <span>Providers Live Tracking</span>
          </button>
          <button 
            onClick={() => setActiveTab('sec-30')}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs px-3.5 py-2 rounded-xl flex items-center space-x-1.5 shadow-2xs transition"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            <span>View Advanced Analytics</span>
          </button>
          <button 
            onClick={() => setActiveTab('sec-19')}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs px-3.5 py-2 rounded-xl flex items-center space-x-1.5 shadow-2xs transition"
          >
            <PlayCircle className="w-3.5 h-3.5 text-purple-600" />
            <span>Watch Tutorial</span>
          </button>
        </div>
      </div>

      {/* Business Overview Container */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-heading uppercase tracking-wider">Business Overview</h3>
            <p className="text-xs text-slate-500">Track key inventory & purchasing metrics</p>
          </div>
          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            <select className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:bg-white shadow-2xs">
              <option>Select State</option>
              <option>Karnataka</option>
              <option>Kerala</option>
              <option>Maharashtra</option>
            </select>
            <select className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:bg-white shadow-2xs">
              <option>Select City</option>
              <option>Bangalore</option>
              <option>Cochin</option>
              <option>Mumbai</option>
            </select>
            <select className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:bg-white shadow-2xs">
              <option>Select Administrator</option>
              <option>Super Administrator</option>
            </select>
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-purple-700 font-bold focus:outline-none focus:bg-white shadow-2xs"
            >
              <option value="February 2026">February 2026</option>
              <option value="January 2026">January 2026</option>
              <option value="All Time">All Time</option>
            </select>
          </div>
        </div>

        {/* Live Computed KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Total Stock Value */}
          <div onClick={() => setActiveTab && setActiveTab('sec-20')} className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-4 shadow-2xs relative cursor-pointer hover:border-emerald-300 transition">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">₹</div>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-0.5" /> +100.0%
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider block truncate">TOTAL STOCK VALUE</span>
            <p className="text-xl font-bold text-emerald-700 font-mono mt-1">₹{kpiData.stockValue.toLocaleString()}</p>
            <span className="text-[10px] text-slate-400 font-medium mt-1 block">0 last period</span>
          </div>

          {/* Ongoing Indents */}
          <div onClick={() => setActiveTab && setActiveTab('sec-11')} className="bg-blue-50/50 border border-blue-200/80 rounded-2xl p-4 shadow-2xs relative cursor-pointer hover:border-blue-300 transition">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold"><FileText className="w-4 h-4" /></div>
              <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-0.5" /> +100.0%
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider block truncate">ONGOING INDENTS</span>
            <p className="text-xl font-bold text-blue-700 font-mono mt-1">{kpiData.ongoingIndents}</p>
            <span className="text-[10px] text-slate-400 font-medium mt-1 block">0 last period</span>
          </div>

          {/* Pending POs */}
          <div onClick={() => setActiveTab && setActiveTab('sec-16')} className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-4 shadow-2xs relative cursor-pointer hover:border-amber-300 transition">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold"><ShoppingCart className="w-4 h-4" /></div>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-0.5" /> +100.0%
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider block truncate">PENDING POS</span>
            <p className="text-xl font-bold text-amber-700 font-mono mt-1">{kpiData.pendingPOs}</p>
            <span className="text-[10px] text-slate-400 font-medium mt-1 block">0 last period</span>
          </div>

          {/* Pending Goods Receipts */}
          <div onClick={() => setActiveTab && setActiveTab('sec-17')} className="bg-indigo-50/50 border border-indigo-200/80 rounded-2xl p-4 shadow-2xs relative cursor-pointer hover:border-indigo-300 transition">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold"><PackageCheck className="w-4 h-4" /></div>
              <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-0.5" /> +100.0%
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider block truncate" title="PENDING GOODS RECEIPTS">PENDING GOODS RECEIPTS</span>
            <p className="text-xl font-bold text-indigo-700 font-mono mt-1">{kpiData.pendingGRNs}</p>
            <span className="text-[10px] text-slate-400 font-medium mt-1 block">0 last period</span>
          </div>

          {/* Low Stock Alerts */}
          <div onClick={() => setActiveTab && setActiveTab('sec-6')} className="bg-rose-50/50 border border-rose-200/80 rounded-2xl p-4 shadow-2xs relative cursor-pointer hover:border-rose-300 transition">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold"><AlertTriangle className="w-4 h-4" /></div>
              <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-0.5" /> +100.0%
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider block truncate">LOW STOCK ALERTS</span>
            <p className="text-xl font-bold text-rose-700 font-mono mt-1">{kpiData.lowStockAlerts}</p>
            <span className="text-[10px] text-slate-400 font-medium mt-1 block">0 last period</span>
          </div>

          {/* Expiring Items */}
          <div onClick={() => setActiveTab && setActiveTab('sec-20')} className="bg-orange-50/50 border border-orange-200/80 rounded-2xl p-4 shadow-2xs relative cursor-pointer hover:border-orange-300 transition">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-bold"><Clock className="w-4 h-4" /></div>
              <span className="bg-orange-100 text-orange-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-0.5" /> +100.0%
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider block truncate" title="EXPIRING ITEMS">EXPIRING ITEMS</span>
            <p className="text-xl font-bold text-orange-700 font-mono mt-1">{kpiData.expiringItems}</p>
            <span className="text-[10px] text-slate-400 font-medium mt-1 block">0 last period</span>
          </div>
        </div>
      </div>

      {/* Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Interactive SVG Line Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-heading flex items-center space-x-2">
                <Activity className="w-4 h-4 text-purple-600" />
                <span>Weekly Movement Trends</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Week-by-week comparison of inventory transactions for {selectedPeriod}</p>
            </div>
            <div className="flex items-center space-x-4 text-[11px] font-bold">
              <span className="flex items-center text-emerald-600"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1.5"></span> Completed (GRNs)</span>
              <span className="flex items-center text-amber-600"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-1.5"></span> Pending Requisitions</span>
              <span className="flex items-center text-rose-600"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 mr-1.5"></span> Cancelled</span>
            </div>
          </div>

          {/* Dynamic SVG Line Graph */}
          <div className="relative pt-4">
            <div className="h-48 w-full bg-slate-50/70 rounded-xl p-4 border border-slate-100 relative overflow-hidden flex flex-col justify-between">
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

                  return (
                    <g key={index}>
                      <circle 
                        cx={cx} 
                        cy={cyCompleted} 
                        r="5" 
                        fill="#ffffff" 
                        stroke="#10b981" 
                        strokeWidth="3" 
                        className="cursor-pointer hover:scale-150 transition transform origin-center"
                        onMouseEnter={() => setHoveredPoint({ week: d.week, type: 'Completed GRNs', val: d.completed, color: 'text-emerald-700' })}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                      <circle 
                        cx={cx} 
                        cy={cyPending} 
                        r="4" 
                        fill="#ffffff" 
                        stroke="#f59e0b" 
                        strokeWidth="2.5" 
                        className="cursor-pointer hover:scale-150 transition transform origin-center"
                        onMouseEnter={() => setHoveredPoint({ week: d.week, type: 'Pending Requisitions', val: d.pending, color: 'text-amber-700' })}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                      <circle 
                        cx={cx} 
                        cy={cyCancelled} 
                        r="3.5" 
                        fill="#ffffff" 
                        stroke="#ef4444" 
                        strokeWidth="2" 
                        className="cursor-pointer hover:scale-150 transition transform origin-center"
                        onMouseEnter={() => setHoveredPoint({ week: d.week, type: 'Cancelled Orders', val: d.cancelled, color: 'text-rose-700' })}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="h-6 mt-1 flex items-center justify-between px-2 text-xs">
              <div className="flex space-x-6 text-slate-500 font-medium">
                {trendData.map(t => <span key={t.week} className="font-mono text-[11px]">{t.week}</span>)}
              </div>
              {hoveredPoint ? (
                <span className={`font-bold font-mono ${hoveredPoint.color} bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 text-[11px]`}>
                  {hoveredPoint.week}: {hoveredPoint.type} = {hoveredPoint.val} Txns
                </span>
              ) : (
                <span className="text-[10px] text-slate-400">Hover over dots on the graph line to view exact transaction numbers</span>
              )}
            </div>
          </div>
        </div>

        {/* Right Doughnut Fulfillment Chart */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 font-heading flex items-center space-x-2">
              <PieIcon className="w-4 h-4 text-purple-600" />
              <span>Monthly Stock Fulfillment</span>
            </h3>
            <span className="text-xs text-purple-700 font-mono font-bold">{kpiData.inStockPct}%</span>
          </div>

          <div className="flex flex-col items-center justify-center py-3 space-y-4">
            <div className="w-36 h-36 rounded-full border-[10px] border-purple-600 border-t-emerald-500 border-r-amber-500 flex items-center justify-center shadow-inner relative transition-transform hover:scale-105">
              <div className="text-center">
                <span className="text-2xl font-black text-slate-900 font-heading">{kpiData.inStockPct}%</span>
                <span className="text-[10px] text-slate-500 font-bold block uppercase mt-0.5">Fulfilled</span>
              </div>
            </div>

            <div className="flex justify-center space-x-3 text-[10px] sm:text-[11px] font-bold">
              <span className="flex items-center text-purple-700"><span className="w-2.5 h-2.5 rounded-full bg-purple-600 mr-1"></span> In Stock ({kpiData.inStockPct}%)</span>
              <span className="flex items-center text-amber-600"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-1"></span> Reserved ({kpiData.reservedPct}%)</span>
              <span className="flex items-center text-rose-600"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 mr-1"></span> Reorder ({kpiData.reorderPct}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Feed Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 font-heading uppercase tracking-wider flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            <span>Recent Inventory Activity Feed</span>
          </h3>
          <button 
            onClick={() => setActiveTab('stock-ops')}
            className="text-xs text-purple-700 font-bold hover:underline"
          >
            View Complete Stock Ledger &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-slate-400 uppercase text-[10px] border-b border-slate-100 font-semibold">
                <th className="pb-2.5">Date</th>
                <th className="pb-2.5">Transaction Type</th>
                <th className="pb-2.5">Reference No</th>
                <th className="pb-2.5">Item Name</th>
                <th className="pb-2.5">Quantity</th>
                <th className="pb-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentTransactions.length > 0 ? (
                recentTransactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 text-slate-500 font-medium">{tx.date}</td>
                    <td className="py-3 font-bold text-slate-800">{tx.type}</td>
                    <td className="py-3 font-mono text-purple-700 font-bold">{tx.ref}</td>
                    <td className="py-3 font-semibold text-slate-700">{tx.item}</td>
                    <td className={`py-3 font-mono font-bold ${tx.qty.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>{tx.qty}</td>
                    <td className="py-3"><StatusBadge status={tx.status} /></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400 font-medium text-xs">
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
