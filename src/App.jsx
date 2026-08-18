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
import UserManagement from './views/masters/UserManagement';
import IndentManagement from './views/procurement/IndentManagement';
import ApprovalWorkflow from './views/procurement/ApprovalWorkflow';
import RFQManagement from './views/procurement/RFQManagement';
import RFQQuotationComparison from './views/procurement/RFQQuotationComparison';
import PurchaseOrder from './views/procurement/PurchaseOrder';
import GRNInspection from './views/inventory/GRNInspection';
import QualityInspection from './views/inventory/QualityInspection';
import StockOperations from './views/inventory/StockOperations';
import StockIssue from './views/inventory/StockIssue';
import StockReturns from './views/inventory/StockReturns';
import SupplierReturns from './views/inventory/SupplierReturns';
import StockVerification from './views/inventory/StockVerification';
import AssetTracking from './views/inventory/AssetTracking';
import Reports from './views/Reports';
import AuditLogs from './views/AuditLogs';
import Settings from './views/Settings';

// System & Document Feature Views
import StockAvailabilityReview from './views/system/StockAvailabilityReview';
import StockAdjustment from './views/inventory/StockAdjustment';
import ReservationManagement from './views/inventory/ReservationManagement';
import NotificationsPage from './views/system/NotificationsPage';
import DataImportExport from './views/system/DataImportExport';
import SearchFiltersEngine from './views/system/SearchFiltersEngine';
import DocumentAttachments from './views/system/DocumentAttachments';
import BillingPOS from './views/BillingPOS';

function MainLayout() {
  const { user } = useAuth();
  const [activeTab, setActiveTabState] = useState(() => {
    return localStorage.getItem('app-active-tab') || 'sec-pos';
  });

  const setActiveTab = (tabId) => {
    localStorage.setItem('app-active-tab', tabId);
    setActiveTabState(tabId);
  };

  // Real Enterprise Software RBAC Module Permissions
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
      'sec-5', 'sec-12', 'sec-15', 'sec-16', 'sec-20', 'sec-23', 'sec-29', 'sec-30'
    ],
    'role-auditor': [
      'sec-5', 'sec-19', 'sec-20', 'sec-26', 'sec-29', 'sec-30', 'sec-31'
    ]
  };

  // Ensure active tab is allowed for current user role
  useEffect(() => {
    if (user) {
      const allowed = rolePermissions[user.role_id] || rolePermissions['role-admin'];
      if (!allowed.includes(activeTab)) {
        setActiveTab('sec-6');
      }
    }
  }, [user]);

  // Standalone Separate Login Page Gate (Section 4 PDF Specification)
  if (!user) {
    return <Login />;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'sec-5':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'sec-6':
        return <ItemMaster />;
      case 'sec-7':
        return <SupplierMaster />;
      case 'sec-8':
        return <DeptWarehouseMaster initialSubTab="dept" />;
      case 'sec-9':
        return <DeptWarehouseMaster initialSubTab="wh" />;
      case 'sec-10':
        return <UserManagement />;
      case 'sec-11':
        return <IndentManagement />;
      case 'sec-12':
        return <ApprovalWorkflow />;
      case 'sec-13':
        return <StockAvailabilityReview />;
      case 'sec-14':
        return <RFQManagement />;
      case 'sec-15':
        return <RFQQuotationComparison initialSubTab="matrix" setActiveTab={setActiveTab} />;
      case 'sec-16':
        return <PurchaseOrder />;
      case 'sec-17':
        return <GRNInspection initialSubTab="grn" />;
      case 'sec-18':
        return <QualityInspection />;
      case 'sec-19':
        return <StockOperations initialSubTab="ledger" />;
      case 'sec-20':
        return <StockOperations initialSubTab="current-stock" />;
      case 'sec-21':
        return <StockIssue />;
      case 'sec-22':
        return <StockReturns />;
      case 'sec-23':
        return <SupplierReturns />;
      case 'sec-24':
        return <StockOperations initialSubTab="transfer" />;
      case 'sec-25':
        return <StockAdjustment />;
      case 'sec-26':
        return <StockVerification />;
      case 'sec-27':
        return <ReservationManagement />;
      case 'sec-28':
        return <AssetTracking />;
      case 'sec-29':
        return <NotificationsPage />;
      case 'sec-30':
        return <Reports />;
      case 'sec-31':
        return <AuditLogs />;
      case 'sec-32':
        return <Settings initialSubTab="company" />;
      case 'sec-33':
        return <DataImportExport />;
      case 'sec-34':
        return <SearchFiltersEngine />;
      case 'sec-35':
        return <DocumentAttachments />;
      case 'sec-pos':
        return <BillingPOS />;
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
  const [showSplash, setShowSplash] = useState(false);

  return (
    <>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </>
  );
}
