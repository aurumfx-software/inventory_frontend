import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Building2, 
  Layers,
  UserCheck,
  FileText, 
  CheckSquare, 
  ClipboardCheck, 
  Send, 
  ShoppingCart, 
  Boxes, 
  RotateCcw,
  Truck,
  Sliders,
  ClipboardList, 
  BookmarkCheck,
  Laptop, 
  Bell,
  BarChart3, 
  History, 
  Settings as SettingsIcon,
  Upload,
  Search,
  Paperclip,
  Zap,
  X,
  Warehouse,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, isOpen, onClose }) {
  const { user, switchRole, activeWarehouse, setActiveWarehouse } = useAuth();
  const [pendingApprovalCount, setPendingApprovalCount] = React.useState(0);
  const [showRoleDropdown, setShowRoleDropdown] = React.useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = React.useState('');

  const rolesList = [
    { id: 'role-admin', label: 'Super Administrator' },
    { id: 'role-purchase', label: 'Purchase Manager' },
    { id: 'role-store', label: 'Store Manager' },
    { id: 'role-dept-mgr', label: 'Department Manager' },
    { id: 'role-requester', label: 'Employee / Requester' },
    { id: 'role-finance', label: 'Finance User' },
    { id: 'role-auditor', label: 'Auditor' }
  ];

  React.useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const res = await fetch('/api/approvals');
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          const pending = data.data.filter(a => a.status === 'Pending').length;
          setPendingApprovalCount(pending);
        }
      } catch (err) {
        console.error('Failed to load pending approval count:', err);
      }
    };

    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 3000);
    return () => clearInterval(interval);
  }, []);

  // Pure Real Software RBAC Module Permissions
  const rolePermissions = {
    'role-admin': [
      'sec-5', 'sec-6', 'sec-7', 'sec-8', 'sec-9', 'sec-10',
      'sec-11', 'sec-12', 'sec-13', 'sec-14', 'sec-15', 'sec-16', 'sec-17', 'sec-18', 'sec-19', 'sec-20',
      'sec-21', 'sec-22', 'sec-23', 'sec-24', 'sec-25', 'sec-26', 'sec-27', 'sec-28', 'sec-29', 'sec-30',
      'sec-31', 'sec-32', 'sec-33', 'sec-34', 'sec-35'
    ],
    'role-purchase': [
      'sec-5', 'sec-6', 'sec-7', 'sec-11', 'sec-14', 'sec-15', 'sec-16', 'sec-20', 'sec-23', 'sec-29', 'sec-30'
    ],
    'role-store': [
      'sec-5', 'sec-6', 'sec-8', 'sec-9', 'sec-13', 'sec-17', 'sec-18', 'sec-19', 'sec-20', 'sec-21', 'sec-22', 'sec-23', 'sec-24', 'sec-25', 'sec-26', 'sec-27', 'sec-28', 'sec-29', 'sec-30'
    ],
    'role-dept-mgr': [
      'sec-5', 'sec-8', 'sec-11', 'sec-12', 'sec-20', 'sec-22', 'sec-29', 'sec-30'
    ],
    'role-requester': [
      'sec-5', 'sec-11', 'sec-22', 'sec-29'
    ],
    'role-finance': [
      'sec-5', 'sec-12', 'sec-15', 'sec-16', 'sec-17', 'sec-20', 'sec-23', 'sec-29', 'sec-30'
    ],
    'role-auditor': [
      'sec-5', 'sec-19', 'sec-20', 'sec-26', 'sec-29', 'sec-30', 'sec-31'
    ],
    'role-director': [
      'sec-5', 'sec-11', 'sec-12', 'sec-13', 'sec-16', 'sec-29', 'sec-30'
    ]
  };

  const allowedTabs = rolePermissions[user?.role_id] || rolePermissions['role-admin'];

  // Clean Real Production ERP Software Navigation Menu (No Numbers)
  const menuGroups = [
    {
      group: "MAIN OVERVIEW",
      items: [
        { id: 'sec-5', label: 'Executive Dashboard', icon: LayoutDashboard }
      ]
    },
    {
      group: "MASTER DATA DIRECTORY",
      items: [
        { id: 'sec-6', label: 'Item Master', icon: Package },
        { id: 'sec-7', label: 'Supplier Directory', icon: Users },
        { id: 'sec-8', label: 'Department Master', icon: Building2 },
        { id: 'sec-9', label: 'Warehouse & Locations', icon: Layers },
        { id: 'sec-10', label: 'User Management', icon: UserCheck }
      ]
    },
    {
      group: "PROCUREMENT CYCLE",
      items: [
        { id: 'sec-11', label: 'Indent Requisitions', icon: FileText },
        { id: 'sec-12', label: 'Approval Workflows', icon: CheckSquare, badge: pendingApprovalCount > 0 ? String(pendingApprovalCount) : null },
        { id: 'sec-13', label: 'Stock Availability Review', icon: ClipboardCheck },
        { id: 'sec-14', label: 'RFQ Management', icon: Send },
        { id: 'sec-15', label: 'Quotation Matrix', icon: Send },
        { id: 'sec-16', label: 'Purchase Orders', icon: ShoppingCart }
      ]
    },
    {
      group: "INVENTORY OPERATIONS",
      items: [
        { id: 'sec-17', label: 'Goods Receipt Note (GRN)', icon: ClipboardCheck },
        { id: 'sec-18', label: 'Quality Inspection', icon: CheckSquare },
        { id: 'sec-19', label: 'Inventory Stock Ledger', icon: Boxes },
        { id: 'sec-21', label: 'Stock Issue Page', icon: Boxes },
        { id: 'sec-22', label: 'Stock Return Page', icon: RotateCcw },
        { id: 'sec-23', label: 'Supplier Return Page', icon: Truck },
        { id: 'sec-24', label: 'Stock Transfers', icon: Boxes },
        { id: 'sec-25', label: 'Stock Adjustments', icon: Sliders },
        { id: 'sec-26', label: 'Physical Verification', icon: ClipboardList },
        { id: 'sec-27', label: 'Reservation Management', icon: BookmarkCheck },
        { id: 'sec-28', label: 'Asset Tracking', icon: Laptop }
      ]
    },
    {
      group: "INTELLIGENCE & SYSTEM",
      items: [
        { id: 'sec-29', label: 'System Notifications', icon: Bell },
        { id: 'sec-30', label: 'Specialized Reports', icon: BarChart3 },
        { id: 'sec-31', label: 'Audit Activity Logs', icon: History },
        { id: 'sec-32', label: 'System Settings', icon: SettingsIcon },
        { id: 'sec-33', label: 'Data Import & Export', icon: Upload },
        { id: 'sec-34', label: 'Search & Filters Engine', icon: Search },
        { id: 'sec-35', label: 'Document Attachments', icon: Paperclip }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 sm:w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 select-none shadow-xs transition-transform duration-300 ease-in-out md:static md:z-auto md:translate-x-0
        ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        <div>
          {/* Brand Header */}
          <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
                <Boxes className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-sm text-slate-900 font-heading tracking-tight leading-none">Inventory Software</h1>
                <span className="text-[10px] text-purple-600 font-bold tracking-wider uppercase block mt-1">Management System</span>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button 
              onClick={onClose}
              className="md:hidden p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              title="Close Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Profile & Quick Actions Card inside Hamburger Drawer */}
          <div className="md:hidden p-3 border-b border-slate-100 bg-slate-50/80 space-y-2.5">
            {/* Welcome & Role Switcher */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Welcome To</span>
                <p className="text-xs font-bold text-purple-700 font-heading leading-tight">{user?.name || 'Sarah Jenkins'}</p>
              </div>

              {/* Role Switcher */}
              <div className="relative">
                <button 
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  className="flex items-center space-x-1 bg-purple-100/80 border border-purple-200 px-2 py-1 rounded-lg text-[11px] text-purple-700 font-bold cursor-pointer"
                >
                  <ShieldCheck className="w-3 h-3 text-purple-600" />
                  <span>{user?.role}</span>
                  <ChevronDown className="w-3 h-3 text-purple-500" />
                </button>

                {showRoleDropdown && (
                  <div className="absolute right-0 mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50">
                    <div className="px-3 py-1 border-b border-slate-100 flex items-center justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider">
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
                        className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-purple-50 hover:text-purple-700 ${user?.role_id === r.id ? 'text-purple-700 font-bold bg-purple-50' : 'text-slate-700'}`}
                      >
                        <span>{r.label}</span>
                        {user?.role_id === r.id && <CheckCircle2 className="w-3 h-3 text-purple-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Active Warehouse Picker */}
            <div className="flex items-center space-x-2 bg-white border border-slate-200 px-2.5 py-1 rounded-xl text-xs shadow-2xs">
              <Warehouse className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="text-slate-400 font-bold text-[10px] uppercase">Warehouse:</span>
              <select 
                value={activeWarehouse} 
                onChange={(e) => setActiveWarehouse(e.target.value)}
                className="bg-transparent text-emerald-700 font-bold focus:outline-none cursor-pointer text-xs w-full"
              >
                <option value="wh-01">WH-MAIN (Central)</option>
                <option value="wh-02">WH-SUB1 (Electronics)</option>
                <option value="wh-03">WH-TRANS (Transit Store)</option>
              </select>
            </div>
          </div>

          {/* Clean Real Software Menu */}
          <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-220px)] md:max-h-[calc(100vh-140px)]">
            {menuGroups.map((group, idx) => {
              const filteredItems = group.items.filter(item => allowedTabs.includes(item.id));
              if (filteredItems.length === 0) return null;

              return (
                <div key={idx} className="space-y-1">
                  <h3 className="px-3 text-[10px] font-bold text-slate-400 tracking-wider uppercase">{group.group}</h3>
                  {filteredItems.map(item => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          if (onClose) onClose();
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition group ${
                          isActive 
                            ? 'bg-rose-50 text-rose-700 font-bold border-r-4 border-rose-600 shadow-2xs' 
                            : 'text-slate-600 hover:bg-rose-50/50 hover:text-rose-700 font-medium'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <Icon className={`w-4 h-4 transition ${isActive ? 'text-rose-600' : 'text-slate-400 group-hover:text-rose-600'}`} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full shadow-2xs">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Powered Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Logged in: <strong className="text-slate-800">{user?.name?.split(' ')[0]}</strong></span>
          </div>
        </div>
      </aside>
    </>
  );
}
