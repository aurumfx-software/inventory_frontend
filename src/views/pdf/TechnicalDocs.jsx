import React, { useState } from 'react';
import { Database, Code, ShieldCheck, Zap, TestTube, CheckCircle2, Play, ArrowRight } from 'lucide-react';

export default function TechnicalDocs() {
  const [activeTab, setActiveTab] = useState('workflow-sim');
  const [currentStep, setCurrentStep] = useState(1);
  const [stepLog, setStepLog] = useState([
    "Step 1: Employee creates indent IND-2026-001001 for 20 laptops."
  ]);

  const workflowSteps = [
    "1. Employee creates an indent for 20 laptops.",
    "2. The department manager reviews and approves it.",
    "3. The store manager checks available stock.",
    "4. Five laptops are available and reserved.",
    "5. The remaining 15 laptops are sent for procurement.",
    "6. The purchase department creates an RFQ.",
    "7. Three approved suppliers receive the RFQ.",
    "8. Their quotations are entered into the system.",
    "9. The software compares price, tax, delivery, and warranty.",
    "10. The buyer selects a supplier and records the reason.",
    "11. A purchase order is generated and approved.",
    "12. The supplier delivers 10 laptops.",
    "13. A partial GRN is created.",
    "14. Serial numbers are recorded.",
    "15. Quality inspection accepts all 10 units.",
    "16. The stock ledger increases by 10 units.",
    "17. The PO remains partially received for five units.",
    "18. The store issues the five previously available laptops to the employee.",
    "19. The remaining laptops are issued after the second delivery.",
    "20. All actions remain visible in reports and audit logs."
  ];

  const handleNextStep = () => {
    if (currentStep < workflowSteps.length) {
      const nextStepNum = currentStep + 1;
      setCurrentStep(nextStepNum);
      setStepLog([...stepLog, `Step ${nextStepNum}: ${workflowSteps[nextStepNum - 1]}`]);
    }
  };

  const handleResetWorkflow = () => {
    setCurrentStep(1);
    setStepLog(["Step 1: Employee creates indent IND-2026-001001 for 20 laptops."]);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 border border-slate-200/80 rounded-2xl shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 font-heading flex items-center space-x-2">
          <Code className="w-5 h-5 text-purple-600" />
          <span>36-43. Technical Architecture, Security & 20-Step Workflow Simulator</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">Database ERD relationships, API structure, coding rules, security, performance & 20-step execution simulator (PDF Page 34-39).</p>
      </div>

      {/* Sub Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button onClick={() => setActiveTab('workflow-sim')} className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${activeTab === 'workflow-sim' ? 'bg-purple-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
          43. Final 20-Step Workflow Simulator
        </button>
        <button onClick={() => setActiveTab('rules')} className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${activeTab === 'rules' ? 'bg-purple-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
          38. Important Coding Rules
        </button>
        <button onClick={() => setActiveTab('security')} className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${activeTab === 'security' ? 'bg-purple-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
          39. Security & 40. Performance
        </button>
        <button onClick={() => setActiveTab('api')} className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${activeTab === 'api' ? 'bg-purple-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
          36. ERD & 37. API Endpoints
        </button>
      </div>

      {activeTab === 'workflow-sim' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 font-heading uppercase tracking-wider flex items-center space-x-2">
                <Play className="w-4 h-4 text-purple-600" />
                <span>43. Final Complete Lifecycle Workflow Simulator (PDF Page 39)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Executes the exact 20-step end-to-end procurement and stock cycle specified on PDF page 39.</p>
            </div>
            <div className="flex space-x-2">
              <button onClick={handleResetWorkflow} className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200">Reset Simulator</button>
              {currentStep < 20 && (
                <button onClick={handleNextStep} className="px-4 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-xl shadow-xs flex items-center space-x-1">
                  <span>Execute Step {currentStep + 1}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Execution Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-purple-700 font-mono">Workflow Progress: Step {currentStep} of 20</span>
              <span className="text-emerald-600 font-mono">{Math.round((currentStep / 20) * 100)}% Completed</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div className="h-full bg-gradient-to-r from-purple-600 to-emerald-500 transition-all duration-300" style={{ width: `${(currentStep / 20) * 100}%` }}></div>
            </div>
          </div>

          {/* Active Log Box */}
          <div className="p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-2xl shadow-inner space-y-1.5 max-h-72 overflow-y-auto border border-slate-800">
            <div className="text-slate-400 border-b border-slate-800 pb-1 text-[10px] uppercase font-bold">LIVE EXECUTION AUDIT TRAIL LOG:</div>
            {stepLog.map((log, idx) => (
              <p key={idx} className="leading-relaxed">&gt; {log}</p>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'rules' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4 text-xs">
          <h3 className="font-bold text-sm text-slate-900 font-heading uppercase tracking-wider">38. Mandatory Coding Rules (PDF Page 36-37)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <strong className="text-purple-700 font-bold block">38.1 Database Transactions</strong>
              <p className="text-slate-600">All GRN postings, stock issues, transfers, and adjustments must run in atomic database transactions. Either all succeed or all roll back.</p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <strong className="text-purple-700 font-bold block">38.2 Race Condition Locks</strong>
              <p className="text-slate-600">Row-level locking and optimistic concurrency checks prevent negative stock when multiple users issue stock simultaneously.</p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <strong className="text-purple-700 font-bold block">38.3 Backend Calculation Recalculation</strong>
              <p className="text-slate-600">Backend recalculates taxes, discounts, totals, and stock limits to prevent frontend manipulation.</p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <strong className="text-purple-700 font-bold block">38.4 Historical Snapshots</strong>
              <p className="text-slate-600">PO documents preserve supplier name, address, tax rate, and item desc snapshots so master updates do not corrupt history.</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4 text-xs">
          <h3 className="font-bold text-sm text-slate-900 font-heading uppercase tracking-wider flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>39. Security & 40. Performance Requirements</span>
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <strong className="text-purple-700 font-bold block">Security Protections:</strong>
              <p className="text-slate-600">&bull; Password Hashing (bcrypt/Argon2)</p>
              <p className="text-slate-600">&bull; Role-Based Access Control (RBAC)</p>
              <p className="text-slate-600">&bull; SQL Injection & XSS Protection</p>
              <p className="text-slate-600">&bull; Tamper-Proof Audit Logging</p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <strong className="text-purple-700 font-bold block">Performance Optimizations:</strong>
              <p className="text-slate-600">&bull; Server-Side Pagination on Large Datasets</p>
              <p className="text-slate-600">&bull; Cached Dashboard Summaries</p>
              <p className="text-slate-600">&bull; Indexed Foreign Keys</p>
              <p className="text-slate-600">&bull; Optimized Stock Queries</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'api' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4 text-xs font-mono">
          <h3 className="font-bold text-sm text-slate-900 font-heading uppercase tracking-wider font-sans">37. Recommended API Endpoints Structure</h3>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-slate-700">
            <p className="text-purple-700 font-bold">/api/auth &bull; /api/users &bull; /api/roles &bull; /api/permissions</p>
            <p className="text-purple-700 font-bold">/api/items &bull; /api/categories &bull; /api/units &bull; /api/suppliers</p>
            <p className="text-purple-700 font-bold">/api/indents &bull; /api/approvals &bull; /api/rfqs &bull; /api/quotations</p>
            <p className="text-purple-700 font-bold">/api/purchase-orders &bull; /api/goods-receipts &bull; /api/quality-inspections</p>
            <p className="text-purple-700 font-bold">/api/stock &bull; /api/stock-issues &bull; /api/stock-returns &bull; /api/stock-transfers</p>
            <p className="text-purple-700 font-bold">/api/stock-adjustments &bull; /api/stock-counts &bull; /api/reports &bull; /api/audit-logs</p>
          </div>
        </div>
      )}
    </div>
  );
}
