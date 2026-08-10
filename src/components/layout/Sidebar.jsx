import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Target,
  Cpu,
  Database,
  Lock,
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
  GitGraph,
  Code,
  ShieldCheck,
  Zap,
  TestTube,
  ListOrdered,
  PlayCircle
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { user } = useAuth();

  // Full Role Permissions Scoping for all 43 PDF Sections in Exact Chronological Order
  const rolePermissions = {
    'role-admin': [
      'sec-1', 'sec-2', 'sec-3', 'sec-5', 'sec-6', 'sec-7', 'sec-8', 'sec-9', 'sec-10',
      'sec-11', 'sec-12', 'sec-13', 'sec-14', 'sec-15', 'sec-16', 'sec-17', 'sec-18', 'sec-19', 'sec-20',
      'sec-21', 'sec-22', 'sec-23', 'sec-24', 'sec-25', 'sec-26', 'sec-27', 'sec-28', 'sec-29', 'sec-30',
      'sec-31', 'sec-32', 'sec-33', 'sec-34', 'sec-35', 'sec-36', 'sec-37', 'sec-38', 'sec-39', 'sec-40',
      'sec-41', 'sec-42', 'sec-43'
    ],
    'role-purchase': [
      'sec-1', 'sec-5', 'sec-6', 'sec-7', 'sec-11', 'sec-14', 'sec-15', 'sec-16', 'sec-20', 'sec-23', 'sec-29', 'sec-30'
    ],
    'role-store': [
      'sec-1', 'sec-5', 'sec-6', 'sec-8', 'sec-9', 'sec-13', 'sec-17', 'sec-18', 'sec-19', 'sec-20', 'sec-21', 'sec-22', 'sec-23', 'sec-24', 'sec-25', 'sec-26', 'sec-27', 'sec-28', 'sec-29', 'sec-30'
    ],
    'role-dept-mgr': [
      'sec-1', 'sec-5', 'sec-8', 'sec-11', 'sec-12', 'sec-20', 'sec-22', 'sec-29', 'sec-30'
    ],
    'role-requester': [
      'sec-1', 'sec-5', 'sec-11', 'sec-22', 'sec-29'
    ],
    'role-finance': [
      'sec-1', 'sec-5', 'sec-12', 'sec-15', 'sec-16', 'sec-20', 'sec-23', 'sec-29', 'sec-30'
    ],
    'role-auditor': [
      'sec-1', 'sec-5', 'sec-19', 'sec-20', 'sec-26', 'sec-29', 'sec-30', 'sec-31', 'sec-36', 'sec-37', 'sec-38', 'sec-39'
    ]
  };

  const allowedTabs = rolePermissions[user?.role_id] || rolePermissions['role-admin'];

  // All 43 Sections Organized in Groups in Exact PDF Chronological Order (Page 1 to Page 39)
  const menuGroups = [
    {
      group: "SECTION 1 - 5: SYSTEM & DASHBOARD",
      items: [
        { id: 'sec-1', label: '1. System Objective', icon: Target },
        { id: 'sec-2', label: '2. Technical Architecture', icon: Cpu },
        { id: 'sec-3', label: '3. Common Database Fields', icon: Database },
        { id: 'sec-5', label: '5. Dashboard Page', icon: LayoutDashboard }
      ]
    },
    {
      group: "SECTION 6 - 10: MASTERS & ACCESS",
      items: [
        { id: 'sec-6', label: '6. Item Master Page', icon: Package },
        { id: 'sec-7', label: '7. Supplier Master Page', icon: Users },
        { id: 'sec-8', label: '8. Department Master Page', icon: Building2 },
        { id: 'sec-9', label: '9. Warehouse & Location Master', icon: Layers },
        { id: 'sec-10', label: '10. User Management Page', icon: UserCheck }
      ]
    },
    {
      group: "SECTION 11 - 16: PROCUREMENT CYCLE",
      items: [
        { id: 'sec-11', label: '11. Indent Management Page', icon: FileText },
        { id: 'sec-12', label: '12. Approval Workflow Page', icon: CheckSquare, badge: '1' },
        { id: 'sec-13', label: '13. Stock Availability Review', icon: ClipboardCheck },
        { id: 'sec-14', label: '14. RFQ Page', icon: Send },
        { id: 'sec-15', label: '15. Quotation Management Page', icon: Send },
        { id: 'sec-16', label: '16. Purchase Order Page', icon: ShoppingCart }
      ]
    },
    {
      group: "SECTION 17 - 28: INVENTORY OPERATIONS",
      items: [
        { id: 'sec-17', label: '17. Goods Receipt Note Page', icon: ClipboardCheck },
        { id: 'sec-18', label: '18. Quality Inspection Page', icon: CheckSquare },
        { id: 'sec-19', label: '19. Inventory Ledger Page', icon: Boxes },
        { id: 'sec-20', label: '20. Current Stock Page', icon: Layers },
        { id: 'sec-21', label: '21. Stock Issue Page', icon: Boxes },
        { id: 'sec-22', label: '22. Stock Return Page', icon: RotateCcw },
        { id: 'sec-23', label: '23. Supplier Return Page', icon: Truck },
        { id: 'sec-24', label: '24. Stock Transfer Page', icon: Boxes },
        { id: 'sec-25', label: '25. Stock Adjustment Page', icon: Sliders },
        { id: 'sec-26', label: '26. Physical Stock Verification', icon: ClipboardList },
        { id: 'sec-27', label: '27. Reservation Management', icon: BookmarkCheck },
        { id: 'sec-28', label: '28. Asset Tracking Page', icon: Laptop }
      ]
    },
    {
      group: "SECTION 29 - 35: SYSTEM & INTELLIGENCE",
      items: [
        { id: 'sec-29', label: '29. Notifications Page', icon: Bell },
        { id: 'sec-30', label: '30. Reports Page (16 Reports)', icon: BarChart3 },
        { id: 'sec-31', label: '31. Audit Log Page', icon: History },
        { id: 'sec-32', label: '32. Settings Page', icon: SettingsIcon },
        { id: 'sec-33', label: '33. Import and Export Page', icon: Upload },
        { id: 'sec-34', label: '34. Search and Filters Engine', icon: Search },
        { id: 'sec-35', label: '35. Document Attachments Page', icon: Paperclip }
      ]
    },
    {
      group: "SECTION 36 - 43: TECHNICAL & WORKFLOW",
      items: [
        { id: 'sec-36', label: '36. Database Relationships', icon: GitGraph },
        { id: 'sec-37', label: '37. Recommended API Structure', icon: Code },
        { id: 'sec-38', label: '38. Important Coding Rules', icon: Code },
        { id: 'sec-39', label: '39. Security Requirements', icon: ShieldCheck },
        { id: 'sec-40', label: '40. Performance Requirements', icon: Zap },
        { id: 'sec-41', label: '41. Testing Requirements', icon: TestTube },
        { id: 'sec-42', label: '42. Development Phases', icon: ListOrdered },
        { id: 'sec-43', label: '43. Final Workflow Example (Sim)', icon: PlayCircle }
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
            <h1 className="font-bold text-base text-slate-900 font-heading tracking-tight leading-none">Apex SerQ</h1>
            <span className="text-[10px] text-purple-600 font-bold tracking-wider uppercase block mt-1">43 PDF Sections</span>
          </div>
        </div>

        {/* Dynamic Navigation Menu Listing All 43 PDF Sections in Exact Chronological Order */}
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
