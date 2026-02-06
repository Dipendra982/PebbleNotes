
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const API_BASE = `${window.location.protocol}//${window.location.hostname}:4000`;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [awaiting, setAwaiting] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [showAdminDemo, setShowAdminDemo] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      const { user, token } = data;
      if (user && token) {
        try {
          localStorage.setItem('pebble_session', JSON.stringify({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            token
          }));
        } catch {}
      }
      if (user?.role === 'ADMIN') {
        navigate('/admin/upload');
      } else {
        navigate('/marketplace');
      }
    } catch (err) {
      setError(err.message);
      // Offer resend verification if blocked by verification requirement
      if (err.message.toLowerCase().includes('verify your email')) {
        // Track awaiting verification for countdown
        const payload = { email, requestedAt: Date.now() };
        try { localStorage.setItem('awaiting_verification', JSON.stringify(payload)); } catch {}
        setAwaiting(payload);
        startCountdown(payload);
      }
    }
  };

  const handleAdminDemoClick = () => {
    setShowAdminDemo(true);
    setAdminEmail('');
    setAdminPassword('');
    setError('');
  };

  const handleAdminDemoSubmit = async () => {
    setError('');
    if (!adminEmail || !adminPassword) {
      setError('Please enter both email and password');
      return;
    }
    setAdminLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      const { user, token } = data;
      if (user && token) {
        try {
          localStorage.setItem('pebble_session', JSON.stringify({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            token
          }));
        } catch {}
      }
      if (user?.role === 'ADMIN') {
        navigate('/admin/upload');
      } else {
        setError('This account does not have admin access');
        setAdminLoading(false);
      }
    } catch (err) {
      setError(err.message);
      setAdminLoading(false);
    }
  };

  const startCountdown = (payload) => {
    const ms = 60000 - (Date.now() - (payload?.requestedAt || Date.now()));
    const initial = Math.max(0, Math.ceil(ms / 1000));
    setSecondsLeft(initial);
    // Tick each second
    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timer);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  React.useEffect(() => {
    // Load awaiting verification info on mount
    try {
      const raw = localStorage.getItem('awaiting_verification');
      if (raw) {
        const payload = JSON.parse(raw);
        setAwaiting(payload);
        startCountdown(payload);
      }
    } catch {}
  }, []);

  const handleResendVerification = async () => {
    if (!awaiting?.email) return;
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: awaiting.email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Resend failed');
      const payload = { email: awaiting.email, requestedAt: Date.now() };
      try { localStorage.setItem('awaiting_verification', JSON.stringify(payload)); } catch {}
      setAwaiting(payload);
      startCountdown(payload);
      setError('Verification email resent. Check your inbox.');
    } catch (e) {
      setError(e.message);
    }
  };

  const handleResetSubmit = async () => {
    setError('');
    if (!resetEmail) {
      setError('Please enter your account email');
      return;
    }
    setResetLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send reset link');
      setShowReset(false);
      setResetEmail('');
      setError('Reset link sent. Check your email on your phone.');
    } catch (e) {
      setError(e.message);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] py-24 px-6 sm:px-8">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-center mb-8">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-slate-900 text-white p-1 rounded-md group-hover:bg-blue-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
            </div>
            <span className="text-sm font-bold tracking-tight text-slate-900">PebbleNote</span>
          </Link>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
          {awaiting && (
            <div className="mb-4 p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-600 flex items-center justify-between">
              <span>
                We sent a verification link to <span className="font-bold">{awaiting.email}</span>. Link valid for 1 minute.
                {secondsLeft > 0 && <> You can resend in <span className="font-bold">{secondsLeft}s</span>.</>}
              </span>
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={secondsLeft > 0}
                className="ml-3 px-3 py-2 rounded-lg bg-slate-900 text-white font-bold disabled:opacity-60"
              >
                Resend
              </button>
            </div>
          )}
          <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Welcome back</h1>
          <p className="text-sm text-slate-500 mb-8">Sign in to continue</p>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
              <input
                required
                type="email"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-0 outline-none transition bg-white"
                placeholder="you@college.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-widest mb-2">Password</label>
              {error && <p className="text-sm font-medium text-red-600 mb-4">{error}</p>}
              <div className="relative">
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-0 outline-none transition bg-white pr-12"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute inset-y-0 right-3 my-auto px-2 text-xs font-bold text-slate-500 hover:text-slate-700"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-4 px-4 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 transition shadow-lg shadow-slate-200"
              >
                Sign In
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-slate-500 font-medium">OR</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAdminDemoClick}
              className="mt-4 w-full flex items-center justify-center py-3 px-4 rounded-xl text-sm font-bold text-slate-900 bg-gradient-to-r from-amber-100 to-orange-100 hover:from-amber-200 hover:to-orange-200 transition border-2 border-amber-300 shadow-md"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
              Admin Demo
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Don't have an account? <Link to="/signup" className="font-bold text-blue-600 hover:text-blue-700">Sign up for free</Link>
            </p>
            <button
              type="button"
              onClick={() => setShowReset(true)}
              className="mt-3 text-xs font-bold text-slate-500 hover:text-slate-700 uppercase tracking-widest"
            >
              Forgot password?
            </button>
          </div>
        </div>

        {showReset && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 mb-2">Reset Password</h2>
              <p className="text-xs text-slate-500 mb-4">Enter your account email. We'll send a reset link you can open on your phone.</p>
              <div className="space-y-3">
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-0 outline-none transition bg-white"
                  placeholder="you@college.edu"
                />
              </div>
              <div className="mt-4 flex items-center justify-end space-x-2">
                <button onClick={() => setShowReset(false)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700">Cancel</button>
                <button onClick={handleResetSubmit} disabled={resetLoading} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 disabled:opacity-60">
                  {resetLoading ? 'Sending…' : 'Send Reset Link'}
                </button>
              </div>
            </div>
          </div>
        )}

        {showAdminDemo && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-amber-200">
              <div className="flex items-center mb-3">
                <div className="bg-gradient-to-r from-amber-100 to-orange-100 p-2 rounded-lg mr-3">
                  <svg className="w-6 h-6 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-slate-900">Admin Demo Access</h2>
              </div>
              <p className="text-xs text-slate-500 mb-4">Enter admin credentials to access the dashboard</p>
              {error && <p className="text-sm font-medium text-red-600 mb-4">{error}</p>}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Admin Email</label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-0 outline-none transition bg-white"
                    placeholder="admin@gmail.com"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Admin Password</label>
                  <div className="relative">
                    <input
                      type={showAdminPassword ? 'text' : 'password'}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAdminDemoSubmit()}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-0 outline-none transition bg-white pr-12"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(s => !s)}
                      className="absolute inset-y-0 right-3 my-auto px-2 text-xs font-bold text-slate-500 hover:text-slate-700"
                    >
                      {showAdminPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-end space-x-2">
                <button 
                  onClick={() => {
                    setShowAdminDemo(false);
                    setError('');
                  }} 
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAdminDemoSubmit} 
                  disabled={adminLoading}
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-xs font-bold hover:from-amber-600 hover:to-orange-600 disabled:opacity-60 shadow-md"
                >
                  {adminLoading ? 'Logging in…' : 'Access Dashboard'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
