import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, AlertCircle, UserPlus, LogIn, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC<{ initialMode?: 'login' | 'register' }> = ({ initialMode }) => {
  const location = useLocation();
  const [mode, setMode] = useState<'login' | 'register'>(
    initialMode || (location.pathname === '/register' ? 'register' : 'login')
  );

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { login, signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === '/register') {
      setMode('register');
    } else if (location.pathname === '/login') {
      setMode('login');
    }
  }, [location.pathname]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setSubmitting(true);

    try {
      if (mode === 'register') {
        await signup(email, password, displayName.trim() || 'Adhi');
        setSuccessMsg('Account created successfully! Redirecting...');
        setTimeout(() => navigate('/chat'), 800);
      } else {
        await login(email, password);
        setSuccessMsg('Sign in successful! Redirecting...');
        setTimeout(() => navigate('/chat'), 800);
      }
    } catch (err: any) {
      setError(err.message || (mode === 'register' ? 'Account creation failed. Please check details.' : 'Login failed. Please verify credentials.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await loginWithGoogle();
      navigate('/chat');
    } catch (err: any) {
      setError(err.message || 'Google authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await login('demo@adhiijarvis.ai', 'demo1234');
      navigate('/chat');
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#040812] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden select-none">
      {/* Background Matrix/Grid */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(#00f0ff_0.6px,transparent_0.6px)] [background-size:24px_24px] opacity-15" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-3 group">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 group-hover:scale-105 transition">
              <Sparkles className="h-6 w-6 text-cyan-200" />
            </div>
            <span className="text-2xl font-black tracking-wider text-white font-mono uppercase">
              Adhii Jarvis
            </span>
          </Link>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {mode === 'register' ? 'Create Your AI Workspace' : 'Sign In to Your Workspace'}
          </h2>
          <p className="text-xs text-cyan-400/80 font-mono mt-1">
            {mode === 'register'
              ? 'Enter your name, email & password to register your personal AI'
              : 'Authenticate via Supabase Auth or Instant Demo'}
          </p>
        </div>

        {/* Unified Auth Card */}
        <div className="p-7 rounded-3xl bg-[#09111e]/90 border border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.12)] backdrop-blur-2xl">
          {/* TAB SWITCHER: SIGN IN vs CREATE ACCOUNT */}
          <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-slate-950/80 border border-cyan-500/20 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-mono font-bold transition-all ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-900/60'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-mono font-bold transition-all ${
                mode === 'register'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-900/60'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>
          </div>

          {/* Feedback Banners */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle className="h-4 w-4 flex-shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Preferred Name (Register mode only) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-mono text-cyan-300/90 mb-1.5">
                  Preferred Name / Call-Sign
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Adhi"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-white text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono transition"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-mono text-cyan-300/90 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-white text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono transition"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-cyan-300/90 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-white text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono transition"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-500 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-mono font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition active:scale-95 mt-2 cursor-pointer"
            >
              <span>
                {submitting
                  ? mode === 'register'
                    ? 'Creating Workspace...'
                    : 'Authenticating...'
                  : mode === 'register'
                  ? 'Create Workspace Account'
                  : 'Sign In'}
              </span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-[#09111e] px-3 text-slate-500 font-mono">Or quick access</span>
            </div>
          </div>

          {/* Continue with Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700/80 hover:border-slate-600 text-xs font-mono font-semibold transition active:scale-95 mb-2.5 shadow-md group cursor-pointer"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/>
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5.1 3.7-8.9z"/>
              <path fill="#FBBC05" d="M5.6 14.8c-.3-.8-.4-1.8-.4-2.8s.1-2 .4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"/>
              <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Quick Demo Login */}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold transition active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.1)]"
          >
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
            <span>Instant Demo Sign In (1-Click)</span>
          </button>
        </div>

        {/* Footer Helper */}
        <p className="text-center text-xs font-mono text-slate-500 mt-5">
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-cyan-400 hover:text-cyan-300 font-bold underline cursor-pointer ml-1"
              >
                Create account now
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-cyan-400 hover:text-cyan-300 font-bold underline cursor-pointer ml-1"
              >
                Sign in here
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
};
