import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Boxes, Eye, EyeOff, Mail, KeyRound, ChevronLeft, ChevronRight, CheckCircle2, X, RefreshCw } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@company.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Ultra 4K High-Resolution Auto-Sliding 100vh Background State
  const [bgSlideIdx, setBgSlideIdx] = useState(0);

  const bgImages = [
    '/login_bg1.png',
    '/login_bg2.png',
    '/login_bg3.png'
  ];

  const roles = [
    { label: 'Super Administrator', email: 'admin@company.com', name: 'Sarah Jenkins', title: 'System Super Administrator' },
    { label: 'Purchase Manager', email: 'purchase@company.com', name: 'Rajesh Kumar', title: 'Head of Procurement' },
    { label: 'Store Manager', email: 'store@company.com', name: 'Michael Chang', title: 'Central Warehouse Store Manager' },
    { label: 'Department Manager', email: 'deptmgr@company.com', name: 'Dr. Ananya Roy', title: 'IT Department Manager' },
    { label: 'Employee / Requester', email: 'requester@company.com', name: 'David Miller', title: 'Senior Software Engineer' },
    { label: 'Finance User', email: 'finance@company.com', name: 'Priya Sharma', title: 'Chief Finance Auditor' },
    { label: 'Auditor', email: 'auditor@company.com', name: 'Robert Wilson', title: 'External System Compliance Auditor' }
  ];

  const [activePersonaIdx, setActivePersonaIdx] = useState(0);

  // Smooth Auto-Slide Effect with 5-Second Interval (No 3 dots)
  useEffect(() => {
    const timer = setInterval(() => {
      setBgSlideIdx((prev) => (prev + 1) % bgImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Show 2-second Authenticating loading state per user request
    await new Promise(resolve => setTimeout(resolve, 2000));

    const res = await login(email, password);
    setLoading(false);
    if (!res.success) {
      setError(res.message || 'Invalid email or password credentials.');
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setResetSuccess(`Password reset instructions sent to ${forgotEmail}.`);
    setTimeout(() => {
      setShowForgotModal(false);
      setResetSuccess('');
      setForgotEmail('');
    }, 2500);
  };

  const handlePersonaClick = async (personaEmail, idx) => {
    setActivePersonaIdx(idx);
    setEmail(personaEmail);
    setPassword('password123');
    setLoading(true);

    // Show 2-second Authenticating loading state per user request
    await new Promise(resolve => setTimeout(resolve, 2000));

    await login(personaEmail, 'password123');
    setLoading(false);
  };

  const handlePrevPersona = () => {
    const nextIdx = (activePersonaIdx - 1 + roles.length) % roles.length;
    setActivePersonaIdx(nextIdx);
    setEmail(roles[nextIdx].email);
  };

  const handleNextPersona = () => {
    const nextIdx = (activePersonaIdx + 1) % roles.length;
    setActivePersonaIdx(nextIdx);
    setEmail(roles[nextIdx].email);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 select-none font-sans relative overflow-hidden">
      
      {/* 100vh Full Screen Ultra-HD 4K Auto-Sliding Background Layer with Blur Effect */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center transition-all duration-1000 ease-in-out transform scale-110 blur-md opacity-90"
        style={{
          backgroundImage: `url('${bgImages[bgSlideIdx]}')`
        }}
      />

      {/* Dark Ambient Overlay over 100vh blurred background */}
      <div className="fixed inset-0 z-0 bg-slate-950/50 backdrop-blur-sm" />

      {/* Center Floating Login Card Container */}
      <div className="w-full max-w-5xl bg-white/95 backdrop-blur-md border border-white/40 rounded-[32px] shadow-2xl p-3 sm:p-4 flex flex-col md:flex-row min-h-[580px] overflow-hidden z-10 relative">
        
        {/* Left Section Card - Preserved exact artwork panel inside card */}
        <div 
          className="md:w-5/12 rounded-[24px] overflow-hidden p-6 sm:p-8 flex flex-col justify-between text-white relative min-h-[300px] md:min-h-auto shadow-inner"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.85)), url('/login_bg3.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Top Header inside section card */}
          <div className="flex items-center justify-between z-10">
            <span className="font-bold text-sm tracking-wide text-white/90 font-heading">Inventory System</span>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold text-white/80">Sign Up</span>
              <button 
                type="button" 
                onClick={() => handlePersonaClick(roles[activePersonaIdx].email, activePersonaIdx)}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full border border-white/30 transition cursor-pointer"
              >
                Join Us
              </button>
            </div>
          </div>

          {/* Bottom Profile Pill inside section card */}
          <div className="z-10 flex items-center justify-between pt-12">
            <div className="flex items-center space-x-3 bg-slate-900/60 backdrop-blur-md p-2.5 pr-4 rounded-full border border-white/10 shadow-lg">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white font-bold text-xs shadow-xs">
                {roles[activePersonaIdx].name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-xs text-white leading-tight">{roles[activePersonaIdx].name}</p>
                <p className="text-[10px] text-slate-300 font-medium leading-tight">{roles[activePersonaIdx].title}</p>
              </div>
            </div>

            {/* Navigation Arrows inside section card */}
            <div className="flex items-center space-x-1.5">
              <button 
                type="button" 
                onClick={handlePrevPersona}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white transition border border-white/20 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                type="button" 
                onClick={handleNextPersona}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white transition border border-white/20 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Section Card - Form Area matching reference image */}
        <div className="md:w-7/12 p-6 sm:p-10 flex flex-col justify-center space-y-6">
          {/* Brand & Language Selector */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center font-black text-sm shadow-md shadow-rose-500/20">
                <Boxes className="w-4 h-4" />
              </div>
              <h1 className="font-black text-lg text-slate-900 tracking-tight font-heading">INVENTORY SOFTWARE</h1>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 px-3 py-1 rounded-full text-slate-600 text-[11px] font-bold flex items-center space-x-1">
              <span>🇬🇧 EN</span>
              <span className="text-slate-400">v</span>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center md:text-left space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading">
              Hi Administrator
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Welcome to Inventory & Procurement Management System
            </p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-2xl font-medium">
              {error}
            </div>
          )}

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <div className="relative">
                <input 
                  type="text" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Email"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:bg-white transition shadow-2xs font-medium"
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Password"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-10 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:bg-white transition shadow-2xs font-medium"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex justify-end mt-1.5">
                <button 
                  type="button" 
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] text-rose-500 font-bold hover:underline"
                >
                  Forgot password ?
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center my-2">
              <div className="flex-1 border-t border-slate-200"></div>
              <span className="px-3 text-[11px] text-slate-400 font-medium">or</span>
              <div className="flex-1 border-t border-slate-200"></div>
            </div>

            {/* Red Action Pill Button matching reference image */}
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm py-3.5 rounded-full shadow-lg shadow-rose-500/25 flex items-center justify-center space-x-2 transition cursor-pointer"
            >
              {loading && <RefreshCw className="w-4 h-4 animate-spin text-white" />}
              <span>{loading ? 'Authenticating...' : 'Login'}</span>
            </button>
          </form>

          {/* Quick Persona Access Section */}
          <div className="pt-2 space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
              Quick One-Click Role Access:
            </p>
            <div className="flex flex-wrap justify-center gap-1.5">
              {roles.map((r, idx) => (
                <button
                  key={r.label}
                  type="button"
                  onClick={() => handlePersonaClick(r.email, idx)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold transition border cursor-pointer ${
                    email === r.email 
                      ? 'bg-rose-50 border-rose-300 text-rose-600' 
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-sm p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider font-heading">Reset Account Password</h3>
              <button onClick={() => setShowForgotModal(false)} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
            </div>

            {resetSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3 rounded-2xl font-bold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{resetSuccess}</span>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3 text-xs">
                <p className="text-slate-500 font-medium">Enter your registered email address to receive password reset instructions:</p>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Registered Email *</label>
                  <input 
                    type="email" 
                    required 
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    placeholder="user@company.com" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800" 
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button type="button" onClick={() => setShowForgotModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-rose-500 text-white font-bold rounded-xl shadow-xs">Send Link</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
