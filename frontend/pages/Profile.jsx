import React, { useState, useEffect, useRef } from 'react';
import { getStore, setStore } from '../store';
import { useNavigate } from 'react-router-dom';

const Profile = ({ user, onUserUpdate }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const fileInputRef = useRef(null);
  const [toast, setToast] = useState({ open: false, message: '', type: 'success' });

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: ''
    });
    setAvatarPreview(user.avatar || null);
  }, [user, navigate]);

  if (!user) return null;

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveChanges = async () => {
    try {
      const session = getStore.session();
      const token = session?.token;
      if (!token) throw new Error('Please sign in again.');
      let newAvatarUrl = null;
      if (avatarFile) {
        const fd = new FormData();
        fd.append('avatar', avatarFile);
        const up = await fetch('http://localhost:4000/api/users/avatar', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: fd
        });
        const upJson = await up.json().catch(() => ({}));
        if (!up.ok) throw new Error(upJson?.error || 'Avatar upload failed');
        newAvatarUrl = upJson?.avatar || null;
      }
      const res = await fetch('http://localhost:4000/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: formData.name })
      });
      let updated = {};
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        try { updated = await res.json(); } catch { updated = {}; }
      } else {
        const text = await res.text();
        if (!res.ok) throw new Error(text || 'Update failed');
      }
      if (!res.ok) throw new Error(updated?.error || 'Update failed');
      const updatedUser = { ...user, name: updated.name ?? formData.name, avatar: newAvatarUrl ?? updated.avatar ?? avatarPreview };
      setStore.session(updatedUser);
      if (typeof onUserUpdate === 'function') onUserUpdate(updatedUser);
      setIsEditing(false);
      setToast({ open: true, message: 'All changes saved successfully', type: 'success' });
      setTimeout(() => setToast({ open: false, message: '', type: 'success' }), 2200);
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (e) {
      setToast({ open: true, message: e.message || 'Update failed', type: 'error' });
      setTimeout(() => setToast({ open: false, message: '', type: 'error' }), 2200);
    }
  };

  const getInitials = (name) => {
    return name.charAt(0).toUpperCase();
  };

  const onChooseAvatar = () => {
    fileInputRef.current?.click();
  };

  const onAvatarSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        setAvatarPreview(result);
      }
      setAvatarFile(file);
      setIsEditing(true);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    setAvatarFile(null);
    setIsEditing(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      {/* Toast */}
      {toast.open && (
        <div className="fixed top-4 right-4 z-50">
          <div className="px-4 py-3 rounded-lg shadow-lg border text-sm font-medium bg-green-600 text-white border-green-700">
            {toast.message}
          </div>
        </div>
      )}
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Account Settings</h1>
          <p className="mt-2 text-slate-600">Manage your public profile and account details.</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
          {/* Avatar and Name Section */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="relative w-24 h-24">
                <div
                  onClick={onChooseAvatar}
                  className="group cursor-pointer w-24 h-24 rounded-full bg-slate-900 ring-4 ring-slate-100 shadow-md overflow-hidden flex items-center justify-center"
                >
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                      {getInitials(user.name)}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h2l1-2h6l1 2h2a2 2 0 012 2v8a2 2 0 01-2 2H3a2 2 0 01-2-2V9a2 2 0 012-2zm9 3a3 3 0 100 6 3 3 0 000-6z" />
                    </svg>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onAvatarSelected}
                />
                <button
                  onClick={onChooseAvatar}
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:bg-slate-50 transition"
                  aria-label="Change photo"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h2l1-2h6l1 2h2a2 2 0 012 2v8a2 2 0 01-2 2H3a2 2 0 01-2-2V9a2 2 0 012-2zm9 3a3 3 0 100 6 3 3 0 000-6z" />
                  </svg>
                </button>
                {avatarPreview && (
                  <button
                    onClick={handleRemoveAvatar}
                    className="absolute -bottom-1 -left-1 w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:bg-slate-50 transition"
                    aria-label="Remove photo"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
                <p className="text-sm text-slate-500 capitalize">{user.role.toLowerCase()} Account</p>
                {avatarPreview && (
                  <button
                    onClick={handleRemoveAvatar}
                    className="mt-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
                  >
                    Remove photo
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-slate-900">{user.name}</p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Email Address
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-slate-900">{user.email}</p>
              )}
            </div>

            {/* Edit Profile Details Button */}
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full py-3 px-4 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium hover:bg-slate-50 transition"
              >
                Edit Profile Details
              </button>
            )}

            {/* Save Changes Button */}
            {isEditing && (
              <div className="flex space-x-3">
                <button
                  onClick={handleSaveChanges}
                  className="flex-1 py-3 px-4 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: user.name,
                      email: user.email,
                      password: ''
                    });
                  }}
                  className="flex-1 py-3 px-4 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Account Security Section */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Account Security
              </span>
              <button
                onClick={() => setShowPasswordChange(!showPasswordChange)}
                className="text-sm font-semibold text-red-600 hover:text-red-700 uppercase tracking-wider"
              >
                Change Password
              </button>
            </div>

            {showPasswordChange && (
              <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                <div className="space-y-3">
                  <input
                    type="password"
                    placeholder="Current Password"
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="password"
                    placeholder="New Password"
                    value={passwords.next}
                    onChange={(e) => setPasswords({ ...passwords, next: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={async () => {
                      if (!passwords.current || !passwords.next) {
                        setToast({ open: true, message: 'Please fill all fields', type: 'error' });
                        setTimeout(() => setToast({ open: false, message: '', type: 'error' }), 2000);
                        return;
                      }
                      if (passwords.next !== passwords.confirm) {
                        setToast({ open: true, message: 'Passwords do not match', type: 'error' });
                        setTimeout(() => setToast({ open: false, message: '', type: 'error' }), 2000);
                        return;
                      }
                      try {
                        const session = getStore.session();
                        const token = session?.token;
                        if (!token) throw new Error('Please sign in again.');
                        const res = await fetch('http://localhost:4000/api/users/change-password', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                          body: JSON.stringify({ current_password: passwords.current, new_password: passwords.next })
                        });
                        const j = await res.json();
                        if (!res.ok) throw new Error(j?.error || 'Failed to update password');
                        setToast({ open: true, message: 'Password updated successfully', type: 'success' });
                        setTimeout(() => setToast({ open: false, message: '', type: 'success' }), 2200);
                        setPasswords({ current: '', next: '', confirm: '' });
                        setShowPasswordChange(false);
                      } catch (e) {
                        setToast({ open: true, message: e.message, type: 'error' });
                        setTimeout(() => setToast({ open: false, message: '', type: 'error' }), 2200);
                      }
                    }}
                    className="w-full py-2 px-4 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition"
                  >
                    Update Password
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Danger Zone */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Danger Zone</span>
            <div className="mt-3 flex items-center justify-between bg-red-50 border border-red-100 rounded-lg p-4">
              <div>
                <p className="text-sm font-semibold text-red-700">Delete Account</p>
                <p className="text-xs text-red-600">This action is permanent and will remove your account.</p>
              </div>
              <button
                onClick={async () => {
                  if (!confirm('Are you sure you want to delete your account?')) return;
                  try {
                    const session = getStore.session();
                    const token = session?.token;
                    if (!token) throw new Error('Please sign in again.');
                    const res = await fetch('http://localhost:4000/api/users/me', {
                      method: 'DELETE',
                      headers: { Authorization: `Bearer ${token}` }
                    });
                    const j = await res.json();
                    if (!res.ok) throw new Error(j?.error || 'Failed to delete');
                    // Clear session and redirect
                    setStore.session(null);
                    navigate('/signup');
                  } catch (e) {
                    setToast({ open: true, message: e.message, type: 'error' });
                    setTimeout(() => setToast({ open: false, message: '', type: 'error' }), 2200);
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
