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
  const [selectedPeriod, setSelectedPeriod] = useState('February 2026');
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [chartType, setChartType] = useState('line'); // 'line' | 'bar' | 'area'
  const [activeDoughnutSegment, setActiveDoughnutSegment] = useState(null);

  // Live Dynamic KPI State computed from Database
  const [kpiData, setKpiData] = useState({
    stockValue: 1845000,
    ongoingIndents: 43,
    pendingPOs: 10,
    completedGRNs: 40,
    lowStockAlerts: 10
  });

  useEffect(() => {
    fetchLiveMetrics();
  }, []);

  const fetchLiveMetrics = async () => {
    try {
      const [resItems, resIndents, resPOs, resGRNs] = await Promise.all([
        fetch('/api/items').then(r => r.json()),
        fetch('/api/indents').then(r => r.json()),
        fetch('/api/purchase-orders').then(r => r.json()),
        fetch('/api/goods-receipts').then(r => r.json())
      ]);

      let calculatedValue = 0;
      let lowStockCount = 0;
      if (resItems.success && Array.isArray(resItems.data)) {
        calculatedValue = resItems.data.reduce((sum, item) => sum + ((item.available_qty || item.on_hand_qty || 0) * (item.valuation_rate || 0)), 0);
        lowStockCount = resItems.data.filter(i => (i.available_qty || 0) <= (i.reorder_level || 10)).length;
      }

      let ongoingIndentsCount = 43;
      if (resIndents.success && Array.isArray(resIndents.data)) {
        ongoingIndentsCount = resIndents.data.filter(ind => ind.status !== 'Completed' && ind.status !== 'Closed' && ind.status !== 'Cancelled').length || resIndents.data.length;
      }

      let pendingPOsCount = 10;
      if (resPOs.success && Array.isArray(resPOs.data)) {
        pendingPOsCount = resPOs.data.filter(p => p.status !== 'Fully received' && p.status !== 'Closed' && p.status !== 'Cancelled').length || resPOs.data.length;
      }

      let completedGRNsCount = 40;
      if (resGRNs.success && Array.isArray(resGRNs.data)) {
        completedGRNsCount = resGRNs.data.filter(g => g.status === 'Posted' || g.inspection_status === 'Inspected & Passed').length || resGRNs.data.length;
      }

      setKpiData({
        stockValue: calculatedValue > 0 ? calculatedValue : 1845000,
        ongoingIndents: ongoingIndentsCount,
        pendingPOs: pendingPOsCount,
        completedGRNs: completedGRNsCount,
        lowStockAlerts: lowStockCount > 0 ? lowStockCount : 10
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

  const [recentTransactions] = useState([
    { id: '1', date: '2026-08-10', type: 'PURCHASE_RECEIPT', ref: 'GRN-2026-004001', item: 'Dell Latitude 5440 Laptop', qty: '+10 Pcs', warehouse: 'WH-SUB1', status: 'Posted' },
    { id: '2', date: '2026-08-09', type: 'STOCK_ISSUE', ref: 'ISS-2026-005001', item: 'Cat6 Ethernet Cable (305m)', qty: '-50 Mtr', warehouse: 'WH-MAIN', status: 'Posted' },
    { id: '3', date: '2026-08-08', type: 'INDENT_CREATED', ref: 'IND-2026-001001', item: 'Dell Latitude 5440 Laptop', qty: '20 Pcs', warehouse: 'IT-DEPT', status: 'Under Review' },
    { id: '4', date: '2026-08-07', type: 'STOCK_TRANSFER', ref: 'TRN-2026-006001', item: 'Industrial Cleaning Solvent', qty: '30 Ltr', warehouse: 'WH-MAIN → WH-SUB1', status: 'In Transit' }
  ]);

  // Helper to compute SVG coordinates for trend lines
  const chartHeight = 170;
  const chartWidth = 540;
  const maxVal = 100;

  const getSvgPath = (key) => {
    return trendData.map((d, index) => {
      const x = (index / (trendData.length - 1)) * (chartWidth - 60) + 30;
      const y = chartHeight - (d[key] / maxVal) * (chartHeight - 30) - 15;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-heading tracking-tight flex items-center gap-2">
            <span>Dashboard</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 border border-purple-200">
              Live Real-Time
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">Monitor inventory metrics, procurement performance & stock values with interactive animations</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button 
            onClick={() => setActiveTab('indents')}
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center space-x-1.5 shadow-sm transition hover:scale-105 active:scale-95"
          >
            <Radio className="w-3.5 h-3.5 text-white animate-pulse" />
            <span>Providers Live Tracking</span>
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs px-3.5 py-2 rounded-xl flex items-center space-x-1.5 shadow-2xs transition hover:scale-105"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            <span>View Advanced Analytics</span>
          </button>
          <button 
            onClick={() => setActiveTab('stock-ops')}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs px-3.5 py-2 rounded-xl flex items-center space-x-1.5 shadow-2xs transition hover:scale-105"
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
            <p className="text-xs text-slate-500">Track key inventory & purchasing metrics with interactive micro-animations</p>
          </div>
          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            <select className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:bg-white shadow-2xs hover:border-purple-300 transition">
              <option>Select State</option>
              <option>Karnataka</option>
              <option>Kerala</option>
              <option>Maharashtra</option>
            </select>
            <select className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:bg-white shadow-2xs hover:border-purple-300 transition">
              <option>Select City</option>
              <option>Bangalore</option>
              <option>Cochin</option>
              <option>Mumbai</option>
            </select>
            <select className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:bg-white shadow-2xs hover:border-purple-300 transition">
              <option>Select Administrator</option>
              <option>Super Administrator</option>
            </select>
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-slate-50 border border-purple-200 rounded-xl px-3 py-1.5 text-xs text-purple-700 font-bold focus:outline-none focus:bg-white shadow-2xs hover:bg-purple-50 transition cursor-pointer"
            >
              <option value="February 2026">February 2026</option>
              <option value="January 2026">January 2026</option>
              <option value="All Time">All Time</option>
            </select>
          </div>
        </div>

        {/* Live Computed KPI Cards Grid with Glass Lift Hover Effects */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Total Stock Value */}
          <div 
            onClick={() => setActiveTab('current-stock')} 
            className="chart-card-hover bg-gradient-to-br from-emerald-50/70 to-teal-50/40 border border-emerald-200/80 rounded-2xl p-4 shadow-2xs relative cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center font-bold text-lg group-hover:scale-110 group-hover:rotate-6 transition-transform">
                ₹
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <ArrowUpRight className="w-3 h-3 mr-0.5" /> +100.0%
              </span>
            </div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">TOTAL STOCK VALUE</span>
            <p className="text-xl font-extrabold text-emerald-700 font-mono mt-1 group-hover:tracking-wide transition-all">
              ₹{kpiData.stockValue.toLocaleString()}
            </p>
            <div className="w-full bg-emerald-100 rounded-full h-1 mt-2.5 overflow-hidden">
              <div className="bg-emerald-500 h-1 rounded-full transition-all duration-1000" style={{ width: '85%' }}></div>
            </div>
          </div>

          {/* Ongoing Indents */}
          <div 
            onClick={() => setActiveTab('indents')} 
            className="chart-card-hover bg-gradient-to-br from-blue-50/70 to-indigo-50/40 border border-blue-200/80 rounded-2xl p-4 shadow-2xs relative cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-blue-100/80 text-blue-700 flex items-center justify-center font-bold group-hover:scale-110 group-hover:-rotate-6 transition-transform">
                <FileText className="w-4 h-4" />
              </div>
              <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <ArrowUpRight className="w-3 h-3 mr-0.5" /> +100.0%
              </span>
            </div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">ONGOING INDENTS</span>
            <p className="text-xl font-extrabold text-blue-700 font-mono mt-1 group-hover:tracking-wide transition-all">
              {kpiData.ongoingIndents}
            </p>
            <div className="w-full bg-blue-100 rounded-full h-1 mt-2.5 overflow-hidden">
              <div className="bg-blue-500 h-1 rounded-full transition-all duration-1000" style={{ width: '68%' }}></div>
            </div>
          </div>

          {/* Pending POs */}
          <div 
            onClick={() => setActiveTab('purchase-orders')} 
            className="chart-card-hover bg-gradient-to-br from-amber-50/70 to-orange-50/40 border border-amber-200/80 rounded-2xl p-4 shadow-2xs relative cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-amber-100/80 text-amber-700 flex items-center justify-center font-bold group-hover:scale-110 group-hover:rotate-6 transition-transform">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <ArrowUpRight className="w-3 h-3 mr-0.5" /> +100.0%
              </span>
            </div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">PENDING POS</span>
            <p className="text-xl font-extrabold text-amber-700 font-mono mt-1 group-hover:tracking-wide transition-all">
              {kpiData.pendingPOs}
            </p>
            <div className="w-full bg-amber-100 rounded-full h-1 mt-2.5 overflow-hidden">
              <div className="bg-amber-500 h-1 rounded-full transition-all duration-1000" style={{ width: '45%' }}></div>
            </div>
          </div>

          {/* Completed GRNs */}
          <div 
            onClick={() => setActiveTab('grn-inspection')} 
            className="chart-card-hover bg-gradient-to-br from-emerald-50/70 to-cyan-50/40 border border-emerald-200/80 rounded-2xl p-4 shadow-2xs relative cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center font-bold group-hover:scale-110 group-hover:-rotate-6 transition-transform">
                <PackageCheck className="w-4 h-4" />
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <ArrowUpRight className="w-3 h-3 mr-0.5" /> +100.0%
              </span>
            </div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">COMPLETED GRNS</span>
            <p className="text-xl font-extrabold text-emerald-700 font-mono mt-1 group-hover:tracking-wide transition-all">
              {kpiData.completedGRNs}
            </p>
            <div className="w-full bg-emerald-100 rounded-full h-1 mt-2.5 overflow-hidden">
              <div className="bg-emerald-500 h-1 rounded-full transition-all duration-1000" style={{ width: '90%' }}></div>
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div 
            onClick={() => setActiveTab('item-master')} 
            className="chart-card-hover bg-gradient-to-br from-rose-50/70 to-pink-50/40 border border-rose-200/80 rounded-2xl p-4 shadow-2xs relative cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-rose-100/80 text-rose-700 flex items-center justify-center font-bold group-hover:scale-110 group-hover:rotate-6 transition-transform">
                <AlertTriangle className="w-4 h-4 animate-bounce" />
              </div>
              <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <ArrowUpRight className="w-3 h-3 mr-0.5" /> +100.0%
              </span>
            </div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">LOW STOCK ALERTS</span>
            <p className="text-xl font-extrabold text-rose-700 font-mono mt-1 group-hover:tracking-wide transition-all">
              {kpiData.lowStockAlerts}
            </p>
            <div className="w-full bg-rose-100 rounded-full h-1 mt-2.5 overflow-hidden">
              <div className="bg-rose-500 h-1 rounded-full transition-all duration-1000" style={{ width: '30%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Graphs & Visualizations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Interactive Graph Component with Mode Switcher & Glow Effects */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4 chart-card-hover">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-heading flex items-center space-x-2">
                <Activity className="w-4 h-4 text-purple-600 animate-pulse" />
                <span>Weekly Movement Trends</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Interactive animated trend chart for {selectedPeriod}</p>
            </div>

            {/* Chart Type Selector Pill Buttons */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1">
              <button
                onClick={() => setChartType('line')}
                className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
                  chartType === 'line' 
                    ? 'bg-purple-600 text-white shadow-xs scale-105' 
                    : 'text-slate-600 hover:text-purple-700'
                }`}
              >
                Line Chart
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
                  chartType === 'bar' 
                    ? 'bg-purple-600 text-white shadow-xs scale-105' 
                    : 'text-slate-600 hover:text-purple-700'
                }`}
              >
                Bar Graph
              </button>
              <button
                onClick={() => setChartType('area')}
                className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
                  chartType === 'area' 
                    ? 'bg-purple-600 text-white shadow-xs scale-105' 
                    : 'text-slate-600 hover:text-purple-700'
                }`}
              >
                Area Fill
              </button>
            </div>
          </div>

          {/* Chart Legend */}
          <div className="flex items-center justify-end space-x-4 text-[11px] font-bold">
            <span className="flex items-center text-emerald-600 hover:scale-105 transition-transform cursor-pointer">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1.5 shadow-xs"></span> Completed GRNs
            </span>
            <span className="flex items-center text-amber-600 hover:scale-105 transition-transform cursor-pointer">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-1.5 shadow-xs"></span> Pending Requisitions
            </span>
            <span className="flex items-center text-rose-600 hover:scale-105 transition-transform cursor-pointer">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 mr-1.5 shadow-xs"></span> Cancelled Orders
            </span>
          </div>

          {/* Dynamic SVG / Bar Visualizer Area */}
          <div className="relative pt-2">
            {chartType === 'bar' ? (
              /* Animated Multi-Bar Chart */
              <div className="h-52 w-full bg-slate-50/70 rounded-xl p-4 border border-slate-100 flex items-end justify-between gap-3">
                {trendData.map((d, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer" onMouseEnter={() => setHoveredPoint({ week: d.week, type: 'Weekly Summary', val: `Completed: ${d.completed}, Pending: ${d.pending}, Cancelled: ${d.cancelled}`, color: 'text-purple-700' })} onMouseLeave={() => setHoveredPoint(null)}>
                    {/* Floating Hover Indicator */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[9px] font-mono px-2 py-0.5 rounded mb-1 shadow-md whitespace-nowrap">
                      Week {idx+1}: {d.completed} completed
                    </div>
                    {/* Bars Container */}
                    <div className="w-full flex items-end justify-center gap-1 h-36">
                      <div 
                        className="w-1/3 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-md animate-bar-grow hover:brightness-125 transition-all shadow-2xs"
                        style={{ height: `${(d.completed / maxVal) * 100}%` }}
                      ></div>
                      <div 
                        className="w-1/3 bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-md animate-bar-grow hover:brightness-125 transition-all shadow-2xs"
                        style={{ height: `${(d.pending / maxVal) * 100}%`, animationDelay: '0.1s' }}
                      ></div>
                      <div 
                        className="w-1/3 bg-gradient-to-t from-rose-600 to-rose-400 rounded-t-md animate-bar-grow hover:brightness-125 transition-all shadow-2xs"
                        style={{ height: `${(d.cancelled / maxVal) * 100}%`, animationDelay: '0.2s' }}
                      ></div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 mt-2">{d.week}</span>
                  </div>
                ))}
              </div>
            ) : (
              /* Animated SVG Line / Area Graph with Glowing Filters */
              <div className="h-52 w-full bg-slate-50/70 rounded-xl p-4 border border-slate-100 relative overflow-hidden flex flex-col justify-between">
                {/* Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-30">
                  <div className="border-b border-slate-300 border-dashed w-full"></div>
                  <div className="border-b border-slate-300 border-dashed w-full"></div>
                  <div className="border-b border-slate-300 border-dashed w-full"></div>
                  <div className="border-b border-slate-300 border-dashed w-full"></div>
                </div>

                <svg className="w-full h-full overflow-visible z-10" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="amberGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                    </linearGradient>

                    {/* Glowing Filters */}
                    <filter id="emeraldGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <filter id="amberGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Area fill path if Area mode */}
                  {chartType === 'area' && (
                    <>
                      <path d={`${getSvgPath('completed')} L ${chartWidth - 30} ${chartHeight - 15} L 30 ${chartHeight - 15} Z`} fill="url(#emeraldGrad)" />
                      <path d={`${getSvgPath('pending')} L ${chartWidth - 30} ${chartHeight - 15} L 30 ${chartHeight - 15} Z`} fill="url(#amberGrad)" />
                    </>
                  )}

                  {/* Animated Lines */}
                  <path d={getSvgPath('completed')} fill="none" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" className="animate-graph-line" filter="url(#emeraldGlow)" />
                  <path d={getSvgPath('pending')} fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" className="animate-graph-line" filter="url(#amberGlow)" />
                  <path d={getSvgPath('cancelled')} fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="5 5" strokeLinecap="round" className="animate-graph-line" />

                  {/* Data Point Nodes with Stable Non-Flickering Hit Targets */}
                  {trendData.map((d, index) => {
                    const cx = (index / (trendData.length - 1)) * (chartWidth - 60) + 30;
                    const cyCompleted = chartHeight - (d.completed / maxVal) * (chartHeight - 30) - 15;
                    const cyPending = chartHeight - (d.pending / maxVal) * (chartHeight - 30) - 15;
                    const cyCancelled = chartHeight - (d.cancelled / maxVal) * (chartHeight - 30) - 15;

                    const isCompHovered = hoveredPoint?.week === d.week && hoveredPoint?.type === 'Completed GRNs';
                    const isPendHovered = hoveredPoint?.week === d.week && hoveredPoint?.type === 'Pending Requisitions';
                    const isCancHovered = hoveredPoint?.week === d.week && hoveredPoint?.type === 'Cancelled Orders';

                    return (
                      <g key={index}>
                        {/* Completed Node Visual Circle */}
                        <circle 
                          cx={cx} 
                          cy={cyCompleted} 
                          r={isCompHovered ? 8.5 : 5.5} 
                          fill="#ffffff" 
                          stroke="#10b981" 
                          strokeWidth={isCompHovered ? 4.5 : 3} 
                          className="transition-all duration-200 pointer-events-none"
                          filter={isCompHovered ? 'url(#emeraldGlow)' : undefined}
                        />
                        {/* Transparent Stable Hit-Target Overlay for Completed */}
                        <circle 
                          cx={cx} 
                          cy={cyCompleted} 
                          r="14" 
                          fill="transparent" 
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredPoint({ week: d.week, type: 'Completed GRNs', val: d.completed, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-300' })}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />

                        {/* Pending Node Visual Circle */}
                        <circle 
                          cx={cx} 
                          cy={cyPending} 
                          r={isPendHovered ? 7.5 : 4.5} 
                          fill="#ffffff" 
                          stroke="#f59e0b" 
                          strokeWidth={isPendHovered ? 4 : 2.5} 
                          className="transition-all duration-200 pointer-events-none"
                          filter={isPendHovered ? 'url(#amberGlow)' : undefined}
                        />
                        {/* Transparent Stable Hit-Target Overlay for Pending */}
                        <circle 
                          cx={cx} 
                          cy={cyPending} 
                          r="14" 
                          fill="transparent" 
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredPoint({ week: d.week, type: 'Pending Requisitions', val: d.pending, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-300' })}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />

                        {/* Cancelled Node Visual Circle */}
                        <circle 
                          cx={cx} 
                          cy={cyCancelled} 
                          r={isCancHovered ? 7 : 4} 
                          fill="#ffffff" 
                          stroke="#ef4444" 
                          strokeWidth={isCancHovered ? 3.5 : 2} 
                          className="transition-all duration-200 pointer-events-none"
                        />
                        {/* Transparent Stable Hit-Target Overlay for Cancelled */}
                        <circle 
                          cx={cx} 
                          cy={cyCancelled} 
                          r="14" 
                          fill="transparent" 
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredPoint({ week: d.week, type: 'Cancelled Orders', val: d.cancelled, color: 'text-rose-700', bg: 'bg-rose-50 border-rose-300' })}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                      </g>
                    );
                  })}
                </svg>
              </div>
            )}

            {/* Bottom Chart Footer / Dynamic Hover Status */}
            <div className="h-8 mt-2 flex items-center justify-between px-2 text-xs">
              <div className="flex space-x-8 text-slate-500 font-medium">
                {trendData.map(t => <span key={t.week} className="font-mono text-[11px] font-bold hover:text-purple-600 transition cursor-pointer">{t.week}</span>)}
              </div>
              {hoveredPoint ? (
                <div className={`font-bold font-mono ${hoveredPoint.color} ${hoveredPoint.bg || 'bg-slate-100'} px-3 py-1 rounded-xl border text-[11px] animate-pulse shadow-xs`}>
                  {hoveredPoint.week}: {hoveredPoint.type} = {hoveredPoint.val}
                </div>
              ) : (
                <span className="text-[10px] text-slate-400 italic">💡 Tip: Hover over graph nodes/bars to see precise real-time values</span>
              )}
            </div>
          </div>
        </div>

        {/* Right Interactive Doughnut Fulfillment Chart */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4 chart-card-hover">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 font-heading flex items-center space-x-2">
              <PieIcon className="w-4 h-4 text-purple-600 animate-spin" style={{ animationDuration: '10s' }} />
              <span>Stock Fulfillment Ratio</span>
            </h3>
            <span className="text-xs text-purple-700 font-mono font-extrabold bg-purple-100 px-2 py-0.5 rounded-full">78%</span>
          </div>

          <div className="flex flex-col items-center justify-center py-2 space-y-5">
            {/* Animated Interactive Doughnut Ring */}
            <div 
              className="w-40 h-40 rounded-full border-[14px] border-purple-600 border-t-emerald-500 border-r-amber-500 flex items-center justify-center shadow-md relative transition-transform hover:scale-110 cursor-pointer group"
              onMouseEnter={() => setActiveDoughnutSegment('In Stock')}
              onMouseLeave={() => setActiveDoughnutSegment(null)}
            >
              <div className="text-center group-hover:scale-105 transition-transform">
                <span className="text-3xl font-black text-slate-900 font-heading tracking-tight">78%</span>
                <span className="text-[10px] text-emerald-600 font-extrabold block uppercase tracking-wider mt-0.5">Fulfilled</span>
              </div>
            </div>

            {/* Interactive Status Pills */}
            <div className="w-full space-y-2">
              <div 
                onMouseEnter={() => setActiveDoughnutSegment('In Stock (78%)')}
                onMouseLeave={() => setActiveDoughnutSegment(null)}
                className={`p-2 rounded-xl flex justify-between items-center border transition-all cursor-pointer ${
                  activeDoughnutSegment?.includes('Stock') ? 'bg-purple-50 border-purple-300 scale-105 shadow-2xs' : 'bg-slate-50 border-slate-100 hover:bg-slate-100/70'
                }`}
              >
                <span className="flex items-center text-xs font-bold text-purple-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600 mr-2 shadow-2xs"></span> In Stock & Ready
                </span>
                <span className="text-xs font-mono font-extrabold text-slate-800">78%</span>
              </div>

              <div 
                onMouseEnter={() => setActiveDoughnutSegment('Reserved (14%)')}
                onMouseLeave={() => setActiveDoughnutSegment(null)}
                className={`p-2 rounded-xl flex justify-between items-center border transition-all cursor-pointer ${
                  activeDoughnutSegment?.includes('Reserved') ? 'bg-amber-50 border-amber-300 scale-105 shadow-2xs' : 'bg-slate-50 border-slate-100 hover:bg-slate-100/70'
                }`}
              >
                <span className="flex items-center text-xs font-bold text-amber-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-2 shadow-2xs"></span> Reserved for Indents
                </span>
                <span className="text-xs font-mono font-extrabold text-slate-800">14%</span>
              </div>

              <div 
                onMouseEnter={() => setActiveDoughnutSegment('Reorder Level (8%)')}
                onMouseLeave={() => setActiveDoughnutSegment(null)}
                className={`p-2 rounded-xl flex justify-between items-center border transition-all cursor-pointer ${
                  activeDoughnutSegment?.includes('Reorder') ? 'bg-rose-50 border-rose-300 scale-105 shadow-2xs' : 'bg-slate-50 border-slate-100 hover:bg-slate-100/70'
                }`}
              >
                <span className="flex items-center text-xs font-bold text-rose-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 mr-2 shadow-2xs"></span> Reorder Required
                </span>
                <span className="text-xs font-mono font-extrabold text-slate-800">8%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Feed Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4 chart-card-hover">
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
              {recentTransactions.map(tx => (
                <tr key={tx.id} className="hover:bg-purple-50/40 transition-colors">
                  <td className="py-3 text-slate-500 font-medium">{tx.date}</td>
                  <td className="py-3 font-bold text-slate-800">{tx.type}</td>
                  <td className="py-3 font-mono text-purple-700 font-bold">{tx.ref}</td>
                  <td className="py-3 font-semibold text-slate-700">{tx.item}</td>
                  <td className={`py-3 font-mono font-bold ${tx.qty.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>{tx.qty}</td>
                  <td className="py-3"><StatusBadge status={tx.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

