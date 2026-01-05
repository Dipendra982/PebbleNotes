
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetOld, setResetOld] = useState('');
  const [resetNew, setResetNew] = useState('');
  const [resetConfirm, setResetConfirm] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [awaiting, setAwaiting] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:4000/api/auth/login', {
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
      const res = await fetch('http://localhost:4000/api/auth/resend-verification', {
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
    if (!resetEmail || !resetOld || !resetNew || !resetConfirm) {
      setError('All fields are required');
      return;
    }
    if (resetNew !== resetConfirm) {
      setError('New passwords do not match');
      return;
    }
    if (resetNew.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    setResetLoading(true);
    try {
      const res = await fetch('http://localhost:4000/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, current_password: resetOld, new_password: resetNew })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password');
      setShowReset(false);
      setResetEmail('');
      setResetOld('');
      setResetNew('');
      setResetConfirm('');
      setError('Password updated. Please sign in with new password.');
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

          <div className="mt-8 text-center">
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
              <h2 className="text-lg font-bold text-slate-900 mb-2">Change Password</h2>
              <p className="text-xs text-slate-500 mb-4">Enter your email, old password, and new password.</p>
              <div className="space-y-3">
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-0 outline-none transition bg-white"
                  placeholder="you@college.edu"
                />
                <div className="relative">
                  <input
                    type={showOldPass ? 'text' : 'password'}
                    value={resetOld}
                    onChange={(e) => setResetOld(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-0 outline-none transition bg-white pr-12"
                    placeholder="Old password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPass(s => !s)}
                    className="absolute inset-y-0 right-3 my-auto px-2 text-xs font-bold text-slate-500 hover:text-slate-700"
                  >
                    {showOldPass ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={resetNew}
                    onChange={(e) => setResetNew(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-0 outline-none transition bg-white pr-12"
                    placeholder="New password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(s => !s)}
                    className="absolute inset-y-0 right-3 my-auto px-2 text-xs font-bold text-slate-500 hover:text-slate-700"
                  >
                    {showNewPass ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    value={resetConfirm}
                    onChange={(e) => setResetConfirm(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-0 outline-none transition bg-white pr-12"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(s => !s)}
                    className="absolute inset-y-0 right-3 my-auto px-2 text-xs font-bold text-slate-500 hover:text-slate-700"
                  >
                    {showConfirmPass ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-end space-x-2">
                <button onClick={() => setShowReset(false)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700">Cancel</button>
                <button onClick={handleResetSubmit} disabled={resetLoading} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 disabled:opacity-60">
                  {resetLoading ? 'Updating…' : 'Update Password'}
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
