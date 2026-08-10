import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import SplashScreen from './components/common/SplashScreen';

import Login from './views/Login';
import Dashboard from './views/Dashboard';
import ItemMaster from './views/masters/ItemMaster';
import SupplierMaster from './views/masters/SupplierMaster';
import DeptWarehouseMaster from './views/masters/DeptWarehouseMaster';
import IndentManagement from './views/procurement/IndentManagement';
import ApprovalWorkflow from './views/procurement/ApprovalWorkflow';
import RFQQuotationComparison from './views/procurement/RFQQuotationComparison';
import PurchaseOrder from './views/procurement/PurchaseOrder';
import GRNInspection from './views/inventory/GRNInspection';
import StockOperations from './views/inventory/StockOperations';
import StockReturns from './views/inventory/StockReturns';
import SupplierReturns from './views/inventory/SupplierReturns';
import StockVerification from './views/inventory/StockVerification';
import AssetTracking from './views/inventory/AssetTracking';
import Reports from './views/Reports';
import AuditLogs from './views/AuditLogs';
import Settings from './views/Settings';

// Exact Enterprise PDF Section Views
import StockAvailabilityReview from './views/pdf/StockAvailabilityReview';
import StockAdjustment from './views/pdf/StockAdjustment';
import ReservationManagement from './views/pdf/ReservationManagement';
import NotificationsPage from './views/pdf/NotificationsPage';
import ImportAttachments from './views/pdf/ImportAttachments';

function MainLayout() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

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

  // Reset active tab if user role does not have access to current tab
  useEffect(() => {
    if (user) {
      const allowed = rolePermissions[user.role_id] || rolePermissions['role-admin'];
      if (!allowed.includes(activeTab)) {
        setActiveTab('dashboard');
      }
    }
  }, [user]);

  // Standalone Separate Login Page Gate (Section 4 PDF Specification)
  if (!user) {
    return <Login />;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'item-master':
        return <ItemMaster />;
      case 'supplier-master':
        return <SupplierMaster />;
      case 'dept-wh-master':
        return <DeptWarehouseMaster />;
      case 'indents':
        return <IndentManagement />;
      case 'approvals':
        return <ApprovalWorkflow />;
      case 'stock-review':
        return <StockAvailabilityReview />;
      case 'rfq-quotes':
        return <RFQQuotationComparison setActiveTab={setActiveTab} />;
      case 'purchase-orders':
        return <PurchaseOrder />;
      case 'grn-inspection':
        return <GRNInspection />;
      case 'current-stock':
        return <StockOperations initialSubTab="current-stock" />;
      case 'stock-ops':
        return <StockOperations initialSubTab="ledger" />;
      case 'stock-returns':
        return <StockReturns />;
      case 'supplier-returns':
        return <SupplierReturns />;
      case 'stock-adjustment':
        return <StockAdjustment />;
      case 'stock-verification':
        return <StockVerification />;
      case 'reservation-management':
        return <ReservationManagement />;
      case 'asset-tracking':
        return <AssetTracking />;
      case 'notifications-page':
        return <NotificationsPage />;
      case 'reports':
        return <Reports />;
      case 'audit-logs':
        return <AuditLogs />;
      case 'settings':
        return <Settings />;
      case 'import-attachments':
        return <ImportAttachments />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100/70 overflow-hidden text-slate-900 font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header setActiveTab={setActiveTab} />
        <main className="flex-1 overflow-y-auto p-6 bg-slate-100/70">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </>
  );
}
