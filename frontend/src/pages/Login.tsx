
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useToast } from '../hooks/use-toast';
import { PlaneTakeoff, CalendarCheck, FileText, MessageSquare } from 'lucide-react';

const features = [
  { icon: PlaneTakeoff, label: 'Trip management & itineraries' },
  { icon: CalendarCheck, label: 'Smart reminders from Notes & email' },
  { icon: FileText, label: 'Document vault & receipts' },
  { icon: MessageSquare, label: 'AI-powered personal assistant' },
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { user, login } = useAuth();
  const { toast } = useToast();

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      await login(email, password);
    } catch (error) {
      // Error handled in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] grid md:grid-cols-2">
      {/* Left panel — brand */}
      <div className="hidden md:flex flex-col justify-between bg-zinc-950 dark:bg-zinc-900 p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-transparent pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="flex items-center gap-2.5 relative z-10">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">RA</span>
          </div>
          <span className="text-white font-semibold tracking-tight">RabbiAssist</span>
        </div>

        {/* Middle content */}
        <div className="relative z-10">
          <p className="text-xs font-medium text-blue-400 uppercase tracking-widest mb-4">
            Your personal assistant
          </p>
          <h2 className="text-3xl font-semibold text-white tracking-tight leading-tight mb-8">
            Everything you need,<br />organized in one place.
          </h2>
          <ul className="space-y-3">
            {features.map((f) => (
              <li key={f.label} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <f.icon className="h-3.5 w-3.5 text-blue-300" />
                </div>
                <span className="text-zinc-300 text-sm">{f.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-zinc-600 text-xs relative z-10">
          © {new Date().getFullYear()} RabbiAssist
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 md:hidden">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">RA</span>
            </div>
            <span className="font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">RabbiAssist</span>
          </div>

          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 tracking-tight mb-1">
            Welcome back
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-8">
            Sign in to your account to continue
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                disabled={isLoading}
                className="w-full"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                className="w-full"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] active:-translate-y-px text-white font-medium transition-all"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
