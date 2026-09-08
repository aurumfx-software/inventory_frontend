import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Boxes, Eye, EyeOff, CheckCircle2, X, RefreshCw, UserPlus, ShieldCheck } from 'lucide-react';

function IsometricFactoryGraphic() {
  return (
    <div className="w-full max-w-md mx-auto flex items-center justify-center p-1 relative select-none">
      <img 
        src="/3d_warehouse_illustration.webp" 
        alt="Smart 3D Warehouse & Logistics Automation" 
        loading="eager"
        decoding="async"
        className="w-full h-auto object-contain drop-shadow-xl hover:scale-102 transition-transform duration-500 rounded-2xl"
      />
    </div>
  );
}

export default function Login() {
  const { login, sendOTP, loginWithOTP } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [regLoading, setRegLoading] = useState(false);

  // Login Mode State
  const [loginMode, setLoginMode] = useState('password'); // 'password' or 'otp'
  const [phone, setPhone] = useState('8111814075');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpMessage, setOtpMessage] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  // Registration Form State
  const [regFullName, setRegFullName] = useState('');
  const [regCompanyName, setRegCompanyName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRoleId, setRegRoleId] = useState('role-admin');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regError, setRegError] = useState('');

  const roles = [
    { id: 'role-admin', label: 'Super Administrator' },
    { id: 'role-purchase', label: 'Purchase Manager' },
    { id: 'role-store', label: 'Store Manager' },
    { id: 'role-dept-mgr', label: 'Department Manager' },
    { id: 'role-requester', label: 'Requester / Employee' },
    { id: 'role-finance', label: 'Finance User' },
    { id: 'role-auditor', label: 'Auditor' }
  ];

  const isValidEmail = (emailStr) => {
    const clean = (emailStr || '').trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(clean)) return false;
    const domain = clean.split('@')[1] || '';
    const dummyDomains = [
      'tempmail.com', 'mailinator.com', '10minutemail.com', 'dispostable.com', 
      'trashmail.com', 'guerrillamail.com', 'maildrop.cc', 'dummy.com', 'test.com', 
      'example.com', 'fake.com', 'test.in', 'dummy.in', 'fake.in', 'testmail.com'
    ];
    if (dummyDomains.includes(domain) || domain.includes('dummy') || domain.includes('fake') || domain.includes('tempmail')) {
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your Email address or Phone number to log in.');
      return;
    }

    if (email.includes('@') && !isValidEmail(email)) {
      setError('Invalid Email Address: Please enter a valid personal or work email address (e.g. name@company.com or name@gmail.com). Dummy/fake emails are blocked.');
      return;
    }
    
    if (!password) {
      setError('Please enter your password to log in.');
      return;
    }

    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (!res.success) {
      setError(res.message || 'Authentication Failed: Incorrect email/phone or password. Access denied.');
    }
  };

  const handleSendOTP = async () => {
    setError('');
    setOtpMessage('');
    if (!phone || phone.length < 7) {
      setError('Please enter a valid Phone number to receive OTP.');
      return;
    }
    setOtpLoading(true);
    const res = await sendOTP(phone);
    setOtpLoading(false);
    if (res.success) {
      setOtpSent(true);
      setOtp('');
      setOtpMessage(res.message || 'OTP successfully sent!');
    } else {
      setError(res.message || 'Failed to send OTP.');
    }
  };

  const handleOTPLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!phone || !otp) {
      setError('Please enter Phone number and 6-digit OTP.');
      return;
    }
    setLoading(true);
    const res = await loginWithOTP(phone, otp);
    setLoading(false);
    if (!res.success) {
      setError(res.message || 'OTP verification failed.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (!isValidEmail(regEmail)) {
      setRegError('Invalid Email Address: Please enter a valid email address (e.g. name@company.com or name@gmail.com). Temporary/dummy email domains are blocked.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match. Please re-enter your password.');
      return;
    }

    setRegLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: regFullName,
          company_name: regCompanyName,
          email: regEmail,
          phone: regPhone,
          role_id: regRoleId,
          password: regPassword
        })
      });

      const data = await res.json();
      setRegLoading(false);

      if (res.ok && data.success) {
        localStorage.removeItem('app_import_history');
        localStorage.removeItem('app_attachments');
        localStorage.removeItem('app_audit_logs');
        localStorage.removeItem('app_users_master');
        localStorage.setItem('app_current_company', regCompanyName || regEmail);

        setRegSuccess(data.message || 'Account registered successfully!');
        setEmail(regEmail);
        setPassword(regPassword);

        setTimeout(() => {
          setShowRegisterModal(false);
          setRegSuccess('');
        }, 2000);
      } else {
        setRegError(data.detail || data.message || 'Failed to create account. Please try again.');
      }
    } catch (err) {
      setRegLoading(false);
      setRegError('Network error. Could not connect to backend server.');
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

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 select-none font-sans relative overflow-hidden bg-gradient-to-br from-slate-50 via-emerald-50/50 to-teal-50/60">
      
      {/* Light Pista Green Animated Gradient Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-emerald-50/60 to-teal-50/50" />
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-200/40 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-200/40 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-300/20 rounded-full blur-[140px]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      {/* Center Floating Sign Box Container - White & Soft Pista Green */}
      <div className="w-full max-w-5xl bg-gradient-to-br from-white via-emerald-50/40 to-teal-50/30 backdrop-blur-md rounded-[32px] shadow-2xl shadow-emerald-950/5 border border-emerald-100/80 p-3 sm:p-4 flex flex-col md:flex-row min-h-[580px] overflow-hidden z-10 relative">
        
        {/* Left Artwork Section Card - White & Pista Green (On Mobile: Order 2 - Below Form, On Desktop: Order 1 - Left) */}
        <div className="order-2 md:order-1 md:w-5/12 rounded-[24px] overflow-hidden p-5 sm:p-7 flex flex-col justify-between text-slate-900 relative min-h-[340px] md:min-h-auto bg-gradient-to-br from-white via-emerald-50/80 to-teal-50/60 border-0 shadow-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-200/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-200/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b9810a_1px,transparent_1px),linear-gradient(to_bottom,#10b9810a_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

          {/* Top Header inside section card */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-red-600 flex items-center justify-center shadow-md shadow-rose-500/20">
                <Boxes className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-xs tracking-wide text-slate-800 font-heading">Inventory System</span>
            </div>
            <button 
              type="button" 
              onClick={() => setShowRegisterModal(true)}
              className="bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full border border-rose-400/30 transition cursor-pointer flex items-center space-x-1 shadow-sm shadow-rose-500/20"
            >
              <UserPlus className="w-3.5 h-3.5 mr-1 text-rose-100" />
              Sign Up
            </button>
          </div>

          {/* Middle 3D Isometric Factory & Warehouse Vector Graphic - Borderless Seamless Blend */}
          <div className="z-10 my-auto py-1 text-center space-y-2">
            <IsometricFactoryGraphic />
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight font-heading">Smart Warehouse Logistics</h2>
              <p className="text-[11px] text-slate-600 mt-0.5 font-medium max-w-xs mx-auto">Real-time Warehouse Racks, Automated Fleet & Cloud Inventory Sync</p>
            </div>
          </div>

          {/* Bottom Card Branding */}
          <div className="z-10 space-y-2">
            <div className="inline-flex items-center space-x-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-emerald-200/80 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-[11px] font-bold text-slate-800">Enterprise Ready Software</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Multi-tenant Cloud & Local Instance Support</p>
          </div>
        </div>

        {/* Right Section Card - Form Area (On Mobile: Order 1 - Top, On Desktop: Order 2 - Right) */}
        <div className="order-1 md:order-2 md:w-7/12 p-6 sm:p-10 flex flex-col justify-center space-y-6 bg-gradient-to-b from-white/90 via-emerald-50/30 to-teal-50/20 rounded-[24px]">
          
          {/* Brand Logo & Header */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center font-black text-sm shadow-md shadow-rose-500/20">
                <Boxes className="w-4 h-4" />
              </div>
              <h1 className="font-black text-lg text-slate-900 tracking-tight font-heading">INVENTORY SOFTWARE</h1>
            </div>

            <div className="bg-white border border-emerald-200/80 px-3 py-1 rounded-full text-slate-600 text-[11px] font-bold flex items-center space-x-1 shadow-2xs">
              <span>🇬🇧 EN</span>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center md:text-left space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading">
              Welcome Back
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Sign in to your organization inventory portal
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-slate-100/80 p-1 rounded-2xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => { setLoginMode('password'); setError(''); setOtpMessage(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                loginMode === 'password' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🔑 Password Login
            </button>
            <button
              type="button"
              onClick={() => { setLoginMode('otp'); setError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                loginMode === 'otp' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📱 Phone + OTP Login
            </button>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-2xl font-medium">
              {error}
            </div>
          )}

          {otpMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-2xl font-medium flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{otpMessage}</span>
            </div>
          )}

          {/* Password Login Form */}
          {loginMode === 'password' && (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <div className="relative">
                  <input 
                    type="text" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Email or Phone Number"
                    className="w-full bg-white border border-emerald-200/90 rounded-xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:bg-white transition shadow-2xs font-medium"
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
                    className="w-full bg-white border border-emerald-200/90 rounded-xl pl-4 pr-10 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:bg-white transition shadow-2xs font-medium"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex justify-end mt-1.5">
                  <button 
                    type="button" 
                    onClick={() => setShowForgotModal(true)}
                    className="text-[11px] text-rose-500 font-bold hover:underline cursor-pointer"
                  >
                    Forgot password ?
                  </button>
                </div>
              </div>

              {/* Main Submit Button - Red */}
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm py-3.5 rounded-full shadow-lg shadow-rose-500/25 flex items-center justify-center space-x-2 transition cursor-pointer"
              >
                {loading && <RefreshCw className="w-4 h-4 animate-spin text-white" />}
                <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              </button>
            </form>
          )}

          {/* Phone + OTP Login Form */}
          {loginMode === 'otp' && (
            <form onSubmit={handleOTPLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Mobile Phone Number</label>
                <div className="flex space-x-2">
                  <input 
                    type="text" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="Enter phone e.g. 8111814075"
                    className="flex-1 bg-white border border-emerald-200/90 rounded-xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:bg-white transition shadow-2xs font-medium"
                  />
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={otpLoading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-xs transition flex items-center space-x-1 shrink-0 cursor-pointer"
                  >
                    {otpLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />}
                    <span>{otpLoading ? 'Sending...' : 'Send OTP'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Enter 6-Digit OTP</label>
                <input 
                  type="text" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                  placeholder="Enter 6-digit OTP"
                  className="w-full bg-white border border-emerald-200/90 rounded-xl px-4 py-3 text-xs font-mono font-bold tracking-widest text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:bg-white transition shadow-2xs"
                />
              </div>

              {/* Main Submit Button - Red */}
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm py-3.5 rounded-full shadow-lg shadow-rose-500/25 flex items-center justify-center space-x-2 transition cursor-pointer"
              >
                {loading && <RefreshCw className="w-4 h-4 animate-spin text-white" />}
                <span>{loading ? 'Verifying OTP & Logging in...' : 'Verify OTP & Sign In'}</span>
              </button>
            </form>
          )}

          {/* Sign Up Link - Red */}
          <div className="text-center pt-2">
            <p className="text-xs text-slate-500 font-medium">
              Don't have an account?{' '}
              <button 
                type="button"
                onClick={() => setShowRegisterModal(true)}
                className="text-rose-600 font-bold hover:underline cursor-pointer"
              >
                Sign Up / Register Organization
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 my-8">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-rose-500 text-white flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider font-heading">Register Account / Company</h3>
              </div>
              <button onClick={() => setShowRegisterModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {regSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3.5 rounded-2xl font-bold flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{regSuccess}</span>
              </div>
            )}

            {regError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-2xl font-medium">
                {regError}
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Full Name *</label>
                <input 
                  type="text" 
                  required 
                  value={regFullName}
                  onChange={e => setRegFullName(e.target.value)}
                  placeholder="Enter full name" 
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500" 
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Company / Organization Name *</label>
                <input 
                  type="text" 
                  required 
                  value={regCompanyName}
                  onChange={e => setRegCompanyName(e.target.value)}
                  placeholder="Enter company name" 
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500" 
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Work Email *</label>
                  <input 
                    type="email" 
                    required 
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    placeholder="Enter work email address" 
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500" 
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Phone Number</label>
                  <input 
                    type="tel" 
                    value={regPhone}
                    onChange={e => setRegPhone(e.target.value)}
                    placeholder="Enter phone number" 
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Select Access Role *</label>
                <select 
                  value={regRoleId}
                  onChange={e => setRegRoleId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
                >
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Password *</label>
                  <input 
                    type="password" 
                    required 
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder="Enter password" 
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500" 
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Confirm Password *</label>
                  <input 
                    type="password" 
                    required 
                    value={regConfirmPassword}
                    onChange={e => setRegConfirmPassword(e.target.value)}
                    placeholder="Confirm password" 
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500" 
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button 
                  type="button" 
                  onClick={() => setShowRegisterModal(false)} 
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={regLoading}
                  className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-md shadow-rose-500/20 flex items-center space-x-2 transition cursor-pointer"
                >
                  {regLoading && <RefreshCw className="w-4 h-4 animate-spin text-white" />}
                  <span>{regLoading ? 'Registering...' : 'Create Account'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-sm p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider font-heading">Reset Account Password</h3>
              <button onClick={() => setShowForgotModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer"><X className="w-4 h-4" /></button>
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
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-rose-500" 
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button type="button" onClick={() => setShowForgotModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-xs cursor-pointer">Send Link</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
