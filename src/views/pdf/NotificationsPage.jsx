import React, { useState } from 'react';
import { Bell, Info, AlertTriangle, CheckCircle2, MessageSquare, Mail, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function NotificationsPage() {
  const { notifications, setNotifications } = useAuth();
  const [activeChannel, setActiveChannel] = useState('in-app');

  const notificationTypes = [
    { type: 'Indent Submitted', count: 2, icon: Info, cls: 'text-purple-600 bg-purple-50 border-purple-200' },
    { type: 'Approval Pending', count: 1, icon: AlertTriangle, cls: 'text-amber-600 bg-amber-50 border-amber-200' },
    { type: 'Indent Approved/Rejected', count: 3, icon: CheckCircle2, cls: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { type: 'RFQ Closing Soon', count: 1, icon: Info, cls: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
    { type: 'Quotation Received', count: 2, icon: CheckCircle2, cls: 'text-purple-600 bg-purple-50 border-purple-200' },
    { type: 'PO Approved / Overdue', count: 1, icon: AlertTriangle, cls: 'text-rose-600 bg-rose-50 border-rose-200' },
    { type: 'Goods Received (GRN)', count: 4, icon: CheckCircle2, cls: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { type: 'Low Stock Alert', count: 2, icon: AlertTriangle, cls: 'text-rose-600 bg-rose-50 border-rose-200' },
    { type: 'Expiry Approaching', count: 1, icon: AlertTriangle, cls: 'text-rose-600 bg-rose-50 border-rose-200' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 border border-slate-200/80 rounded-2xl shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 font-heading flex items-center space-x-2">
          <Bell className="w-5 h-5 text-purple-600" />
          <span>29. Notifications & Alert Delivery Center</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">Alerts users about actions requiring attention across In-App, Email, SMS & WhatsApp channels (PDF Page 29-30).</p>
      </div>

      {/* Delivery Channels */}
      <div className="grid grid-cols-4 gap-4 text-xs font-bold">
        <button onClick={() => setActiveChannel('in-app')} className={`p-4 rounded-2xl border flex items-center space-x-3 transition ${activeChannel === 'in-app' ? 'bg-purple-600 text-white border-purple-600 shadow-xs' : 'bg-white text-slate-700 border-slate-200'}`}>
          <Bell className="w-5 h-5" />
          <span>In-Application Alerts</span>
        </button>
        <button onClick={() => setActiveChannel('email')} className={`p-4 rounded-2xl border flex items-center space-x-3 transition ${activeChannel === 'email' ? 'bg-purple-600 text-white border-purple-600 shadow-xs' : 'bg-white text-slate-700 border-slate-200'}`}>
          <Mail className="w-5 h-5" />
          <span>Email Queue</span>
        </button>
        <button onClick={() => setActiveChannel('sms')} className={`p-4 rounded-2xl border flex items-center space-x-3 transition ${activeChannel === 'sms' ? 'bg-purple-600 text-white border-purple-600 shadow-xs' : 'bg-white text-slate-700 border-slate-200'}`}>
          <Send className="w-5 h-5" />
          <span>SMS Alerts</span>
        </button>
        <button onClick={() => setActiveChannel('whatsapp')} className={`p-4 rounded-2xl border flex items-center space-x-3 transition ${activeChannel === 'whatsapp' ? 'bg-purple-600 text-white border-purple-600 shadow-xs' : 'bg-white text-slate-700 border-slate-200'}`}>
          <MessageSquare className="w-5 h-5" />
          <span>WhatsApp Integration</span>
        </button>
      </div>

      {/* Notification Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {notificationTypes.map((nt, idx) => {
          const Icon = nt.icon;
          return (
            <div key={idx} className={`p-4 rounded-2xl border ${nt.cls} flex items-center justify-between`}>
              <div className="flex items-center space-x-3">
                <Icon className="w-5 h-5 shrink-0" />
                <span className="text-xs font-bold">{nt.type}</span>
              </div>
              <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-white/80 border border-current">{nt.count}</span>
            </div>
          );
        })}
      </div>

      {/* Notifications History List */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
        <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider font-heading">Recent System Notifications</h3>
        <div className="divide-y divide-slate-100">
          {notifications.map(n => (
            <div key={n.id} className="py-3 flex justify-between items-center text-xs">
              <div>
                <p className="font-bold text-slate-900">{n.title}</p>
                <p className="text-slate-600 text-[11px] mt-0.5">{n.message}</p>
              </div>
              <span className="text-[10px] text-slate-400 font-mono font-medium">{n.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
