
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
import About from './pages/About';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';

const Layout = ({ user, onLogout, children }) => {
  const location = useLocation();
  const hideNavFooter = ['/signin', '/signup', '/verify'].includes(location.pathname);

  return (
    <>
      {!hideNavFooter && <Navbar user={user} onLogout={onLogout} />}
      <main>{children}</main>
      {!hideNavFooter && <Footer />}
    </>
  );
};

const App = () => {
  // Initialize user immediately from localStorage to avoid refresh redirect
  const [user, setUser] = useState(() => getStore.session());

  // Component inside Router to sync user on route changes
  const RouteSync = () => {
    const location = useLocation();
    useEffect(() => {
      const session = getStore.session();
      if (session && (!user || session.email !== user.email || session.role !== user.role)) {
        setUser(session);
      }
    }, [location]);
    return null;
  };

  // Session management will be implemented in future; login page handles redirects

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
      <RouteSync />
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/about" element={<About />} />
          <Route path="/notes/:id" element={<NoteDetail user={user} />} />
          <Route path="/signin" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify" element={<VerifyEmail />} />
          <Route path="/reset" element={<ResetPassword />} />
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
