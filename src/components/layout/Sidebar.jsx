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
  Zap
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { user } = useAuth();
  const [pendingApprovalCount, setPendingApprovalCount] = React.useState(0);

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
      'sec-31', 'sec-32', 'sec-33', 'sec-34', 'sec-35', 'sec-pos'
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
      'sec-5', 'sec-12', 'sec-15', 'sec-16', 'sec-20', 'sec-23', 'sec-29', 'sec-30'
    ],
    'role-auditor': [
      'sec-5', 'sec-19', 'sec-20', 'sec-26', 'sec-29', 'sec-30', 'sec-31'
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
        { id: 'sec-20', label: 'Current Stock Page', icon: Layers },
        { id: 'sec-21', label: 'Stock Issue Page', icon: Boxes },
        { id: 'sec-22', label: 'Stock Return Page', icon: RotateCcw },
        { id: 'sec-23', label: 'Supplier Return Page', icon: Truck },
        { id: 'sec-24', label: 'Stock Transfers', icon: Boxes },
        { id: 'sec-25', label: 'Stock Adjustments', icon: Sliders },
        { id: 'sec-26', label: 'Physical Verification', icon: ClipboardList },
        { id: 'sec-27', label: 'Reservation Management', icon: BookmarkCheck },
        { id: 'sec-28', label: 'Asset Tracking', icon: Laptop },
        { id: 'sec-pos', label: 'POS Billing & Invoicing', icon: Zap }
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
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 select-none shadow-xs">
      <div>
        {/* Brand Header */}
        <div className="h-16 px-6 border-b border-slate-100 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-slate-900 font-heading tracking-tight leading-none">Inventory Software</h1>
            <span className="text-[10px] text-purple-600 font-bold tracking-wider uppercase block mt-1">Management System</span>
          </div>
        </div>

        {/* Clean Real Software Menu */}
        <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-140px)]">
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
                      onClick={() => setActiveTab(item.id)}
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
  );
}
