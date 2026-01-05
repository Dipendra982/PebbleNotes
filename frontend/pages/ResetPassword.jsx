import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const API_BASE = `${window.location.protocol}//${window.location.hostname}:4000`;
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const qs = new URLSearchParams(location.search);
    const t = qs.get('token') || '';
    setToken(t);
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    if (!password || !confirm) {
      setStatus('Please enter and confirm your new password.');
      return;
    }
    if (password !== confirm) {
      setStatus('Passwords do not match.');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset failed');
      setStatus('Password reset successful. Redirecting to sign in...');
      setTimeout(() => navigate('/signin'), 1200);
    } catch (e) {
      setStatus(e.message);
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
          <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Reset your password</h1>
          <p className="text-sm text-slate-500 mb-8">Enter a new password for your account</p>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-widest mb-2">New Password</label>
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
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-widest mb-2">Confirm Password</label>
              <input
                required
                type="password"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-0 outline-none transition bg-white"
                placeholder="••••••••"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
              />
            </div>
            <div>
              <button type="submit" className="w-full flex justify-center py-4 px-4 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 transition shadow-lg shadow-slate-200">
                Reset Password
              </button>
            </div>
          </form>

          {status && <p className="mt-6 text-sm font-medium text-blue-600">{status}</p>}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
