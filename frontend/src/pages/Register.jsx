import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, UserPlus, Eye, EyeOff, AlertCircle } from 'lucide-react';

export const Register = ({ onRegisterSuccess, onNavigateLogin }) => {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      await register({ email, password, confirm_password: confirmPassword });
      if (onRegisterSuccess) onRegisterSuccess();
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-8 sm:py-12 px-4 my-auto flex items-center justify-center bg-slate-50 min-h-[calc(100vh-8rem)]">
      <div className="w-full max-w-[420px] bg-white border border-slate-200 rounded-2xl shadow-xl p-6 sm:p-8">
        <div className="text-center mb-6">
          <img src="/logo.svg" alt="PollNow" className="w-10 h-10 mx-auto mb-2.5 rounded-xl shadow-xs" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 block mb-0.5">
            CREATE YOUR ACCOUNT
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Join PollNow
          </h2>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
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
                className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
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
                className="w-full pl-9 pr-9 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
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

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition shadow-md shadow-indigo-600/20 cursor-pointer flex justify-center items-center gap-2 mt-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>{loading ? 'Creating account...' : 'Create Account'}</span>
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-600 border-t border-slate-100 pt-4">
          <span>Already have an account? </span>
          <button
            onClick={onNavigateLogin}
            className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer ml-1"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
};
