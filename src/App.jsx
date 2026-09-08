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

function MainLayout() {
  const { user } = useAuth();
  const [activeTab, setActiveTabState] = useState(() => {
    const saved = localStorage.getItem('app-active-tab');
    return saved && saved.startsWith('sec-') ? saved : 'sec-5';
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

  // Ensure user always lands on Executive Dashboard (sec-5) upon login
  useEffect(() => {
    if (user) {
      setActiveTabState('sec-5');
      localStorage.setItem('app-active-tab', 'sec-5');
    }
  }, [user?.id]);

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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
        return <StockOperations initialSubTab="current-stock" />;
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
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100/70 overflow-hidden text-slate-900 font-sans relative">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header 
          setActiveTab={setActiveTab} 
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-6 bg-slate-100/70">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught UI Error:", error, errorInfo);
  }

  handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-900 text-white text-center font-sans">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-500 flex items-center justify-center mb-4 border border-rose-500/30">
            <span className="text-2xl font-bold">!</span>
          </div>
          <h1 className="text-xl font-bold text-white font-heading mb-2">Application Render Error</h1>
          <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
            A component encountered an error during render. Cleared cached local storage state to restore smooth operation.
          </p>
          <div className="bg-slate-800 border border-slate-700 p-3 rounded-xl max-w-lg w-full text-left text-rose-400 font-mono text-xs mb-6 overflow-x-auto">
            {this.state.error?.toString()}
          </div>
          <button 
            onClick={this.handleReset}
            className="bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-lg shadow-rose-500/20 transition cursor-pointer"
          >
            Reset Session & Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    localStorage.removeItem('app_items_master');
    localStorage.removeItem('app_suppliers_master');
    localStorage.removeItem('app_departments_master');
    localStorage.removeItem('app_warehouses_master');
    localStorage.removeItem('app_locations_master');
    localStorage.removeItem('app_supplier_returns');
    localStorage.removeItem('app_stock_returns');
  }, []);

  return (
    <ErrorBoundary>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </ErrorBoundary>
  );
}
