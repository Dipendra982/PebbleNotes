
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getStore, setStore } from '../store';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const users = getStore.users();
    const user = users.find(u => u.email === email);
    
    if (user) {
      onLogin(user.email, user.role);
    } else {
      onLogin(email, email.includes('admin') ? 'ADMIN' : 'USER');
    }
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="text-3xl font-black text-blue-600 text-center block mb-8">PebbleNote</Link>
        <div className="bg-white py-10 px-6 shadow-xl sm:rounded-3xl sm:px-12 border border-gray-100">
          <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-8">Sign In</h2>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
              <input 
                required
                type="email" 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                placeholder="you@college.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
              <input 
                required
                type="password" 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <div>
              <button 
                type="submit"
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 transition"
              >
                Sign In
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account? <Link to="/signup" className="font-bold text-blue-600 hover:text-blue-500">Sign up for free</Link>
            </p>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-100 text-center">
             <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-4">Demo Accounts</p>
             <div className="flex justify-center space-x-4">
                <button 
                  onClick={() => { setEmail('student@demo.com'); setPassword('password'); }}
                  className="text-xs font-medium bg-gray-50 px-3 py-1 rounded-full text-gray-500 hover:bg-gray-100 transition"
                >Student Demo</button>
                <button 
                  onClick={() => { setEmail('admin@demo.com'); setPassword('password'); }}
                  className="text-xs font-medium bg-gray-50 px-3 py-1 rounded-full text-gray-500 hover:bg-gray-100 transition"
                >Admin Demo</button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
