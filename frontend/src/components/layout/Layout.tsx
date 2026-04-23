
import React from 'react';
import { Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Header from './Header';
import { useAuth } from '../../contexts/AuthContext';
import { useEffect } from 'react';

const Layout = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse text-torah-blue">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto py-6 px-6">
        <div key={location.pathname} className="animate-fade-in">
          <Outlet />
        </div>
      </main>
      <footer className="bg-white py-4 text-center text-torah-lightText text-sm">
        © {new Date().getFullYear()} RabbiAssist. All rights reserved.
      </footer>
    </div>
  );
};

export default Layout;
