import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Building2, 
  FileText, 
  CheckSquare, 
  Send, 
  ShoppingCart, 
  ClipboardCheck, 
  Boxes, 
  ClipboardList, 
  Laptop, 
  BarChart3, 
  History, 
  Settings as SettingsIcon,
  ShieldAlert,
  Layers,
  RotateCcw,
  Truck,
  Sliders,
  Lock,
  Bell,
  Upload
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { user } = useAuth();

  // Real Enterprise Software RBAC Permissions
  const rolePermissions = {
    'role-admin': ['dashboard', 'current-stock', 'item-master', 'supplier-master', 'dept-wh-master', 'indents', 'approvals', 'stock-review', 'rfq-quotes', 'purchase-orders', 'grn-inspection', 'stock-ops', 'stock-returns', 'supplier-returns', 'stock-adjustment', 'stock-verification', 'reservation-management', 'asset-tracking', 'notifications-page', 'reports', 'audit-logs', 'settings', 'import-attachments'],
    'role-purchase': ['dashboard', 'current-stock', 'item-master', 'supplier-master', 'indents', 'rfq-quotes', 'purchase-orders', 'supplier-returns', 'reports', 'notifications-page'],
    'role-store': ['dashboard', 'current-stock', 'item-master', 'grn-inspection', 'stock-ops', 'stock-review', 'stock-returns', 'supplier-returns', 'stock-adjustment', 'stock-verification', 'asset-tracking', 'reports', 'notifications-page'],
    'role-dept-mgr': ['dashboard', 'current-stock', 'indents', 'approvals', 'dept-wh-master', 'stock-returns', 'reports', 'notifications-page'],
    'role-requester': ['dashboard', 'indents', 'stock-returns', 'notifications-page'],
    'role-finance': ['dashboard', 'current-stock', 'approvals', 'rfq-quotes', 'purchase-orders', 'supplier-returns', 'reports', 'notifications-page'],
    'role-auditor': ['dashboard', 'current-stock', 'stock-ops', 'stock-returns', 'supplier-returns', 'stock-verification', 'reports', 'audit-logs']
  };

  const allowedTabs = rolePermissions[user?.role_id] || rolePermissions['role-admin'];

  const menuGroups = [
    {
      group: "MAIN OVERVIEW",
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
      ]
    },
    {
      group: "MASTER DATA DIRECTORY",
      items: [
        { id: 'item-master', label: 'Item Master', icon: Package },
        { id: 'supplier-master', label: 'Supplier Directory', icon: Users },
        { id: 'dept-wh-master', label: 'Depts & Warehouses', icon: Building2 }
      ]
    },
    {
      group: "PROCUREMENT CYCLE",
      items: [
        { id: 'indents', label: 'Indent Requisitions', icon: FileText },
        { id: 'approvals', label: 'Approval Workflows', icon: CheckSquare, badge: '1' },
        { id: 'stock-review', label: 'Stock Availability Review', icon: ClipboardCheck },
        { id: 'rfq-quotes', label: 'RFQ & Quotes Matrix', icon: Send },
        { id: 'purchase-orders', label: 'Purchase Orders', icon: ShoppingCart }
      ]
    },
    {
      group: "INVENTORY OPERATIONS",
      items: [
        { id: 'current-stock', label: 'Current Stock Page', icon: Layers },
        { id: 'grn-inspection', label: 'GRN & Quality Inspection', icon: ClipboardCheck },
        { id: 'stock-ops', label: 'Stock Ledger & Transfers', icon: Boxes },
        { id: 'stock-returns', label: 'Stock Return Page', icon: RotateCcw },
        { id: 'supplier-returns', label: 'Supplier Return Page', icon: Truck },
        { id: 'stock-adjustment', label: 'Stock Adjustment Page', icon: Sliders },
        { id: 'stock-verification', label: 'Physical Stock Verification', icon: ClipboardList },
        { id: 'reservation-management', label: 'Reservation Management', icon: Lock },
        { id: 'asset-tracking', label: 'Asset Tracking Page', icon: Laptop }
      ]
    },
    {
      group: "INTELLIGENCE & SYSTEM",
      items: [
        { id: 'notifications-page', label: 'System Notifications', icon: Bell },
        { id: 'reports', label: '16 Specialized Reports', icon: BarChart3 },
        { id: 'audit-logs', label: 'Audit Activity Logs', icon: History },
        { id: 'settings', label: 'System Configuration', icon: SettingsIcon },
        { id: 'import-attachments', label: 'Data Import & Attachments', icon: Upload }
      ]
    }
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 select-none shadow-xs">
      <div>
        {/* Brand Header */}
        <div className="h-16 px-6 border-b border-slate-100 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-base text-slate-900 font-heading tracking-tight leading-none">Apex SerQ</h1>
            <span className="text-[10px] text-purple-600 font-bold tracking-wider uppercase block mt-1">Enterprise ERP</span>
          </div>
        </div>

        {/* Active Role Scope Badge */}
        <div className="mx-4 mt-3 p-2 bg-purple-50 border border-purple-200/80 rounded-xl text-purple-700 text-[11px] font-bold flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 shrink-0 text-purple-600" />
          <div className="truncate">
            <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold">Active Role Permission Scope</span>
            <span className="truncate block font-extrabold">{user?.role}</span>
          </div>
        </div>

        {/* Clean Enterprise Software Sidebar Navigation */}
        <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-210px)]">
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
                          ? 'bg-purple-100/70 text-purple-700 font-bold border-r-4 border-purple-600 shadow-2xs' 
                          : 'text-slate-600 hover:bg-purple-50/50 hover:text-purple-700 font-medium'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <Icon className={`w-4 h-4 transition ${isActive ? 'text-purple-600' : 'text-slate-400 group-hover:text-purple-600'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="bg-purple-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full shadow-2xs">
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
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>Logged in as: <strong className="text-slate-800">{user?.name?.split(' ')[0]}</strong></span>
        </div>
      </div>
    </aside>
  );
}
