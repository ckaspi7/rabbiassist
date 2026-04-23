
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
      <div className="flex min-h-[100dvh] items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">RA</span>
          </div>
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      <Header />
      <main className="flex-grow w-full max-w-[1400px] mx-auto py-8 px-6">
        <div key={location.pathname} className="animate-fade-in">
          <Outlet />
        </div>
      </main>
      <footer className="py-4 text-center text-zinc-400 dark:text-zinc-600 text-xs border-t border-zinc-100 dark:border-zinc-900">
        © {new Date().getFullYear()} RabbiAssist
      </footer>
    </div>
  );
};

export default Layout;
