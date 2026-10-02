import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { TrendingUp, Lock, Mail, ArrowRight, AlertCircle, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await login(email, password);
      if (res.success) {
        toast.success('Welcome back to TradeJournal!');
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('demo@tradejournal.com');
    setPassword('Password123!');
  };

  return (
    <div className="min-h-[100dvh] bg-gray-50 dark:bg-[#0a0e17] flex items-center justify-center p-3.5 sm:p-4">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#1f293d] rounded-2xl p-5 sm:p-8 shadow-xl dark:shadow-2xl">
        {/* Terminal Header */}
        <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/25 mb-3">
            <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">TradeJournal</h1>
          <p className="text-xs uppercase tracking-wider text-cyan-600 dark:text-cyan-400 font-semibold mt-1">
            Forex Trading Journal & Analytics
          </p>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">
            Sign in to access your trading logs and performance terminal.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-rose-600 dark:text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 dark:text-rose-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="trader@tradejournal.com"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#0a0e17] border border-gray-300 dark:border-[#1f293d] text-gray-900 dark:text-white text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#0a0e17] border border-gray-300 dark:border-[#1f293d] text-gray-900 dark:text-white text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-sm shadow-lg shadow-cyan-500/20 active:scale-[0.99] transition flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In to Terminal</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Quick Fill Helper */}
        <div className="mt-5 pt-5 border-t border-gray-200 dark:border-[#1f293d] text-center">
          <button
            type="button"
            onClick={handleDemoFill}
            className="text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-medium underline underline-offset-4 decoration-cyan-500/40 hover:decoration-cyan-400 transition"
          >
            Use Demo Trader Credentials (demo@tradejournal.com)
          </button>
        </div>

        {/* Register Link */}
        <p className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
          Don't have an account?{' '}
          <Link
            to="/auth/register"
            className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 font-semibold inline-flex items-center gap-1"
          >
            Create Journal Account <ArrowRight className="w-3 h-3" />
          </Link>
        </p>
      </div>
    </div>
  );
};
