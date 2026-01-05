
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { setStore } from '../store';

const Signup = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('USER');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const [status, setStatus] = useState('');
  const [showSentModal, setShowSentModal] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    try {
      const res = await fetch('http://localhost:4000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, email: formData.email, password: formData.password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      // Store awaiting verification info to drive countdown on Sign In
      try {
        localStorage.setItem('awaiting_verification', JSON.stringify({ email: formData.email, requestedAt: Date.now() }));
      } catch {}
      setShowSentModal(true);
      setStatus('Registration successful. Check your email.');
      // Redirect to sign-in shortly
      setTimeout(() => navigate('/signin'), 2000);
    } catch (err) {
      setStatus(err.message);
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
          <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Create your account</h1>
          <p className="text-sm text-slate-500 mb-8">Join the PebbleNote community</p>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-widest mb-2">Full Name</label>
              <input
                required
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-0 outline-none transition bg-white"
                placeholder="John Doe"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
              <input
                required
                type="email"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-0 outline-none transition bg-white"
                placeholder="you@college.edu"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-widest mb-2">Password</label>
              <div className="relative">
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-0 outline-none transition bg-white pr-12"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
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
                Get Started
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            {status && <p className="text-sm font-medium text-blue-600 mb-4">{status}</p>}
            <p className="text-sm text-slate-600">
              Already have an account? <Link to="/signin" className="font-bold text-blue-600 hover:text-blue-700">Sign in here</Link>
            </p>
          </div>
        </div>
      </div>
      {showSentModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-2">Verification Email Sent</h2>
            <p className="text-xs text-slate-600 mb-3">We sent a verification link to <span className="font-bold">{formData.email}</span>.</p>
            <p className="text-xs text-slate-600">The link is valid for <span className="font-bold">1 minute</span>. You'll be redirected to Sign In. If it expires, you can resend from there.</p>
            <div className="mt-4 flex items-center justify-end">
              <button onClick={() => setShowSentModal(false)} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800">OK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;
