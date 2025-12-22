
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      email: formData.email,
      role: role
    };
    setStore.user(newUser);
    setStore.session(newUser);
    window.location.href = '/#/dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="text-3xl font-black text-blue-600 text-center block mb-8">PebbleNote</Link>
        <div className="bg-white py-10 px-6 shadow-xl sm:rounded-3xl sm:px-12 border border-gray-100">
          <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-8">Create Account</h2>
          
          {/* <div className="flex p-1 bg-gray-100 rounded-xl mb-8">
            <button 
              onClick={() => setRole('USER')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${role === 'USER' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >Student</button>
          </div> */}

          <form className="space-y-6" onSubmit={handleSubmit}>
             <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
              <input 
                required
                type="text" 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                placeholder="John Doe"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
              <input 
                required
                type="email" 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                placeholder="you@college.edu"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
              <input 
                required
                type="password" 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
            <div>
              <button 
                type="submit"
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 transition"
              >
                Get Started
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Already have an account? <Link to="/signin" className="font-bold text-blue-600 hover:text-blue-500">Sign in here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
