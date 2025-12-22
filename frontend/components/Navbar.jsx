
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 items-center">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="bg-slate-900 text-white p-1 rounded-md group-hover:bg-blue-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
              </div>
              <span className="text-sm font-bold tracking-tight text-slate-900">PebbleNote</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/marketplace" className="text-xs font-semibold text-slate-500 hover:text-slate-900 uppercase tracking-wider transition">Marketplace</Link>
                <Link to="/about" className="text-xs font-semibold text-slate-500 hover:text-slate-900 uppercase tracking-wider transition">About</Link>
            </div>
          </div>

          <div className="flex items-center space-x-5">
            {user ? (
              <div className="flex items-center space-x-5">
                <Link to="/dashboard" className="text-xs font-semibold text-slate-500 hover:text-slate-900 uppercase tracking-wider transition">Dashboard</Link>
                <div className="h-4 w-px bg-slate-200"></div>
                <Link to="/profile" className="flex items-center space-x-2">
                   <div className="w-7 h-7 rounded-full bg-slate-900 flex items-center justify-center text-white text-[10px] font-bold">
                     {user.name.charAt(0).toUpperCase()}
                   </div>
                </Link>
                <button onClick={onLogout} className="text-slate-400 hover:text-red-500 transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/signin" className="text-xs font-bold text-slate-600 hover:text-slate-900 uppercase tracking-widest transition">Sign In</Link>
                <Link to="/signup" className="bg-slate-900 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-800 transition shadow-sm">Get Started</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
