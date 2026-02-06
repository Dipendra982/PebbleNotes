import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error', 'already_verified'
  const [message, setMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided.');
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/verify?token=${encodeURIComponent(token)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setUserEmail(data.user?.email || '');
        
        if (data.message.toLowerCase().includes('already verified')) {
          setStatus('already_verified');
          setMessage('Your email is already verified.');
        } else {
          setStatus('success');
          setMessage('Email verified successfully!');
        }

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/signin');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Verification failed. The link may be expired or invalid.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('error');
      setMessage('Unable to verify email. Please check your connection and try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        {/* Verifying State */}
        {status === 'verifying' && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
              <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Verifying Your Email</h2>
            <p className="text-slate-600">Please wait while we verify your email address...</p>
          </div>
        )}

        {/* Success State */}
        {status === 'success' && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Email Verified!</h2>
            <p className="text-slate-600 mb-4">{message}</p>
            {userEmail && (
              <p className="text-sm text-slate-500 mb-6">
                <span className="font-semibold">{userEmail}</span> has been successfully verified.
              </p>
            )}
            <div className="space-y-3">
              <p className="text-sm text-slate-500">Redirecting to sign in page...</p>
              <Link 
                to="/signin"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Sign In Now
              </Link>
            </div>
          </div>
        )}

        {/* Already Verified State */}
        {status === 'already_verified' && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Already Verified</h2>
            <p className="text-slate-600 mb-6">{message}</p>
            <div className="space-y-3">
              <p className="text-sm text-slate-500">Redirecting to sign in page...</p>
              <Link 
                to="/signin"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Verification Failed</h2>
            <p className="text-slate-600 mb-6">{message}</p>
            <div className="space-y-3">
              <Link 
                to="/signin"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Go to Sign In
              </Link>
              <p className="text-sm text-slate-500 mt-4">
                Need help? <Link to="/about" className="text-blue-600 hover:underline">Contact support</Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
