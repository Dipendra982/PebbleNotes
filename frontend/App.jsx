
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { getStore, setStore } from './store';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import Marketplace from './pages/Marketplace';
import NoteDetail from './pages/NoteDetail';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminUpload from './pages/AdminUpload';
import Profile from './pages/Profile';

const Layout = ({ user, onLogout, children }) => {
  const location = useLocation();
  const hideNavFooter = ['/signin', '/signup'].includes(location.pathname);

  return (
    <>
      {!hideNavFooter && <Navbar user={user} onLogout={onLogout} />}
      <main>{children}</main>
      {!hideNavFooter && <Footer />}
    </>
  );
};

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const session = getStore.session();
    if (session) setUser(session);
  }, []);

  const handleLogin = (email, role) => {
    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      name: email.split('@')[0],
      email: email,
      role: role
    };
    setUser(newUser);
    setStore.session(newUser);
    setStore.user(newUser);
  };

  const handleLogout = () => {
    setUser(null);
    setStore.session(null);
  };

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
    setStore.session(updatedUser);
  };

  return (
    <Router>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/notes/:id" element={<NoteDetail user={user} />} />
          <Route path="/signin" element={<Login onLogin={handleLogin} />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard user={user} />} />
          <Route path="/admin/upload" element={<AdminUpload user={user} />} />
          <Route path="/profile" element={<Profile user={user} onUserUpdate={handleUserUpdate} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
