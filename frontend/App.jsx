
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { getSession, clearSession, setSession, verifySession } from './authUtils';

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
  // Initialize user from session
  const [user, setUser] = useState(() => getSession());
  const [isVerifying, setIsVerifying] = useState(true);

  // Verify session on mount
  useEffect(() => {
    const checkSession = async () => {
      const session = getSession();
      if (session && session.token) {
        // Verify token is still valid
        const validUser = await verifySession();
        if (validUser) {
          setUser(validUser);
        } else {
          setUser(null);
        }
      }
      setIsVerifying(false);
    };
    checkSession();
  }, []);

  // Component inside Router to sync user on route changes
  const RouteSync = () => {
    const location = useLocation();
    useEffect(() => {
      const session = getSession();
      if (session && (!user || session.email !== user.email || session.role !== user.role)) {
        setUser(session);
      }
    }, [location]);
    return null;
  };

  const handleLogout = () => {
    setUser(null);
    clearSession();
  };

  const handleUserUpdate = (updatedUser, token) => {
    setUser(updatedUser);
    if (token) {
      setSession(updatedUser, token);
    } else {
      // Keep existing token
      const session = getSession();
      if (session?.token) {
        setSession(updatedUser, session.token);
      }
    }
  };

  // Show loading while verifying session
  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

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
