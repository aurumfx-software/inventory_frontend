import React from 'react';
import { Target, Cpu, Database, FileText, CheckCircle2 } from 'lucide-react';

export default function SystemOverview() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 border border-slate-200/80 rounded-2xl shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 font-heading flex items-center space-x-2">
          <Target className="w-5 h-5 text-purple-600" />
          <span>1. System Objective & 2. Technical Architecture</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">Functional specifications, end-to-end procurement cycle & technical architecture guidance (PDF Page 2-3).</p>
      </div>

      {/* 1. System Objective */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900 font-heading uppercase tracking-wider">1. System Objective & Lifecycle Flow</h3>
        <p className="text-xs text-slate-600">The software manages the complete inventory & procurement lifecycle seamlessly:</p>

        <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl font-mono text-xs text-purple-800 font-bold flex items-center justify-between overflow-x-auto">
          <span>Indent Request &rarr; Approval &rarr; Supplier RFQ &rarr; Quotation Comparison &rarr; Purchase Order &rarr; Goods Receipt &rarr; Stock Update &rarr; Stock Issue/Return/Transfer &rarr; Audit & Reports</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-2">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mb-1" />
            <strong className="block text-slate-800">Role-Based Access (RBAC)</strong>
            <span className="text-[11px] text-slate-500">7 predefined roles with permission scoping.</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mb-1" />
            <strong className="block text-slate-800">Approval Workflows</strong>
            <span className="text-[11px] text-slate-500">Multi-tier amount-based authorization.</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mb-1" />
            <strong className="block text-slate-800">Inventory Tracking</strong>
            <span className="text-[11px] text-slate-500">Serial, Batch & FEFO Expiry controls.</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mb-1" />
            <strong className="block text-slate-800">Complete Audit History</strong>
            <span className="text-[11px] text-slate-500">Tamper-proof activity audit trails.</span>
          </div>
        </div>
      </div>

      {/* 2. Suggested Technical Architecture */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900 font-heading uppercase tracking-wider flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-purple-600" />
          <span>2. Technical Architecture & Tech Stack</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <strong className="text-purple-700 block uppercase tracking-wider text-[11px]">Frontend Layer</strong>
            <ul className="space-y-1 text-slate-600">
              <li>&bull; React SPA with Vite 6</li>
              <li>&bull; Vanilla CSS Design System</li>
              <li>&bull; Lucide Modern Icons</li>
              <li>&bull; Responsive Neumorphic Light UI</li>
            </ul>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <strong className="text-purple-700 block uppercase tracking-wider text-[11px]">Backend API Layer</strong>
            <ul className="space-y-1 text-slate-600">
              <li>&bull; Node.js with Express API</li>
              <li>&bull; Modern ESM Standard</li>
              <li>&bull; Business Rules & Recalculation</li>
              <li>&bull; RESTful Endpoints</li>
            </ul>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <strong className="text-purple-700 block uppercase tracking-wider text-[11px]">Database Layer</strong>
            <ul className="space-y-1 text-slate-600">
              <li>&bull; PostgreSQL / LowDB Store</li>
              <li>&bull; File System Synchronization</li>
              <li>&bull; Append-Only Stock Ledger</li>
              <li>&bull; Transaction Safety Locks</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 3. Common Database Fields */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900 font-heading uppercase tracking-wider flex items-center space-x-2">
          <Database className="w-4 h-4 text-purple-600" />
          <span>3. Common Database Fields Specification</span>
        </h3>
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200 font-bold font-mono">
              <th className="p-3">Field</th>
              <th className="p-3">Purpose & Rule</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            <tr><td className="p-3 font-bold text-purple-700">id</td><td className="p-3 text-slate-700 font-sans">Unique internal record identifier</td></tr>
            <tr><td className="p-3 font-bold text-purple-700">created_at</td><td className="p-3 text-slate-700 font-sans">Date and time when record was created (UTC)</td></tr>
            <tr><td className="p-3 font-bold text-purple-700">created_by</td><td className="p-3 text-slate-700 font-sans">User ID who created the record</td></tr>
            <tr><td className="p-3 font-bold text-purple-700">updated_at</td><td className="p-3 text-slate-700 font-sans">Date and time of last update</td></tr>
            <tr><td className="p-3 font-bold text-purple-700">updated_by</td><td className="p-3 text-slate-700 font-sans">User ID who last modified record</td></tr>
            <tr><td className="p-3 font-bold text-purple-700">is_active</td><td className="p-3 text-slate-700 font-sans">Boolean flag marking record active or inactive</td></tr>
            <tr><td className="p-3 font-bold text-purple-700">deleted_at</td><td className="p-3 text-slate-700 font-sans">Soft deletion timestamp (records soft-deleted)</td></tr>
            <tr><td className="p-3 font-bold text-purple-700">company_id</td><td className="p-3 text-slate-700 font-sans">Multi-tenant company separation ID</td></tr>
            <tr><td className="p-3 font-bold text-purple-700">branch_id</td><td className="p-3 text-slate-700 font-sans">Identifies related branch or location</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
