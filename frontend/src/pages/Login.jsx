import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';

export const Login = ({ onLoginSuccess, onNavigateRegister }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login({ email, password });
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Invalid email address or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-6 sm:py-10 px-4 my-auto flex items-center justify-center bg-slate-50 min-h-[calc(100vh-8rem)]">
      <div className="w-full max-w-[400px] bg-white border border-slate-200 rounded-2xl shadow-xl p-6 sm:p-7">
        <div className="text-center mb-5">
          <img src="/logo.svg" alt="PollNow" className="w-9 h-9 mx-auto mb-2 rounded-xl shadow-xs" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 block mb-0.5">
            WELCOME BACK
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Sign in to PollNow
          </h2>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-9 py-2 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition shadow-sm cursor-pointer flex justify-center items-center gap-2 mt-1"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-slate-600">
          <span>Don't have an account? </span>
          <button
            onClick={onNavigateRegister}
            className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer ml-1"
          >
            Create account
          </button>
        </div>
      </div>
    </div>
  );
};
