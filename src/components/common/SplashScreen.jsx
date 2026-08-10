import React, { useState, useEffect } from 'react';
import { Boxes, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

export default function SplashScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing Enterprise Engine...');
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const statusMessages = [
      { at: 15, text: 'Connecting Secure API Enclave...' },
      { at: 40, text: 'Loading Master Data & Stock Balances...' },
      { at: 70, text: 'Syncing Requisitions & Approval Matrix...' },
      { at: 90, text: 'Finalizing Dashboard Analytics...' },
      { at: 100, text: 'System Ready. Welcome to Apex SerQ!' }
    ];

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setFadeOut(true);
            setTimeout(() => {
              if (onComplete) onComplete();
            }, 600);
          }, 400);
          return 100;
        }

        const next = prev + 5;
        const msg = statusMessages.find(m => next >= m.at);
        if (msg) setStatusText(msg.text);

        return next;
      });
    }, 60);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 text-white select-none transition-opacity duration-700 font-sans ${fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      
      {/* Background Ambient Glow Effects */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-purple-600/20 blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 rounded-full bg-rose-600/20 blur-3xl pointer-events-none animate-pulse"></div>

      {/* Main Container */}
      <div className="w-full max-w-md text-center space-y-8 z-10">
        
        {/* Animated Brand Logo Icon */}
        <div className="relative flex items-center justify-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-rose-500 via-purple-600 to-indigo-600 flex items-center justify-center shadow-2xl shadow-purple-500/40 border border-white/20 animate-bounce">
            <Boxes className="w-10 h-10 text-white" />
          </div>
          <div className="absolute w-28 h-28 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin"></div>
        </div>

        {/* Brand Title */}
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight font-heading bg-gradient-to-r from-white via-purple-200 to-rose-200 bg-clip-text text-transparent">
            APEX SERQ
          </h1>
          <p className="text-xs font-bold text-purple-400 tracking-widest uppercase">
            Inventory & Procurement ERP System
          </p>
        </div>

        {/* Progress Bar & Status Message */}
        <div className="space-y-3 pt-4">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-400 font-medium">{statusText}</span>
            <span className="font-bold text-purple-300">{progress}%</span>
          </div>

          <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-white/10 p-0.5 shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 via-rose-500 to-indigo-500 rounded-full transition-all duration-150 ease-out shadow-xs"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Footnote Badge */}
        <div className="pt-6 flex items-center justify-center space-x-2 text-[11px] text-slate-500 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>256-Bit Encrypted &bull; Enterprise RBAC v2026</span>
        </div>

      </div>
    </div>
  );
}
