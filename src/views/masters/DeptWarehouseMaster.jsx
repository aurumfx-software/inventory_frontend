import React, { useState, useEffect } from 'react';
import { Building2, Warehouse, MapPin, Layers } from 'lucide-react';

export default function DeptWarehouseMaster() {
  const [departments, setDepartments] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  useEffect(() => {
    fetch('/api/departments').then(r => r.json()).then(d => d.success && setDepartments(d.data));
    fetch('/api/warehouses').then(r => r.json()).then(w => w.success && setWarehouses(w.data));
  }, []);

  return (
    <div className="space-y-6">
      {/* Departments Section */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 font-heading uppercase tracking-wider flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-purple-600" />
              <span>Department Master & Cost Centres</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Financial cost allocation, cost centers, department heads & budget limits.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map(dept => (
            <div key={dept.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
              <div className="flex justify-between items-start">
                <span className="font-mono text-[10px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                  {dept.code}
                </span>
                <span className="font-mono text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  CC: {dept.cost_centre}
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-900">{dept.name}</h3>
              <div className="text-xs text-slate-600 space-y-1 pt-1 border-t border-slate-200">
                <p className="flex justify-between">
                  <span>Annual Budget:</span>
                  <span className="font-mono font-bold text-slate-900">₹{(dept.budget_annual || 0).toLocaleString()}</span>
                </p>
                <p className="flex justify-between text-[11px]">
                  <span>Status:</span>
                  <span className="text-emerald-700 font-bold">Active</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Warehouses & Location Hierarchy Section */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 font-heading uppercase tracking-wider flex items-center space-x-2">
              <Warehouse className="w-4 h-4 text-emerald-600" />
              <span>Warehouse & Location Storage Hierarchy</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Physical storage mapping: Warehouse &rarr; Zone &rarr; Rack &rarr; Shelf &rarr; Bin.</p>
          </div>
        </div>

        <div className="space-y-4">
          {warehouses.map(wh => (
            <div key={wh.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-start border-b border-slate-200 pb-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs text-emerald-700 font-bold">{wh.code}</span>
                    <h3 className="font-bold text-sm text-slate-900">{wh.name}</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center">
                    <MapPin className="w-3 h-3 text-slate-400 mr-1" /> {wh.address}
                  </p>
                </div>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                  Operational
                </span>
              </div>

              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center">
                  <Layers className="w-3 h-3 mr-1 text-purple-600" /> Configured Bin Locations:
                </p>
                <div className="flex flex-wrap gap-2">
                  {(wh.locations || []).map(loc => (
                    <div key={loc.id} className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-mono text-purple-700 font-bold flex items-center space-x-2 shadow-2xs">
                      <span className="text-[10px] text-slate-400 uppercase">{loc.zone} &bull;</span>
                      <span>{loc.code}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
