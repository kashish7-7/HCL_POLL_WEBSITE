import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { soundFx } from '../utils/sound';
import { UserPlus, Key, Mail, User, AlertCircle } from 'lucide-react';

export const Register = ({ onRegisterSuccess, onNavigateLogin }) => {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (username.length < 3) {
      setError('Editor handle must be at least 3 characters');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Passphrase must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      soundFx.playMechanicalClick();
      await register({ username, email, password });
      soundFx.playFanfare();
      if (onRegisterSuccess) {
        onRegisterSuccess();
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto px-4 py-8">
      <div className="newspaper-container border-2 border-[#2c251e] p-6 sm:p-8">
        <div className="border-b-4 border-double border-[#2c251e] pb-4 mb-6 text-center">
          <span className="text-xs font-serif uppercase tracking-widest text-[#8b5e34] font-bold">
            ★ PRESS REGISTRATION ★
          </span>
          <h2 className="font-serif text-2xl font-black uppercase text-[#1f1b18] mt-1">
            JOIN THE GAZETTE CORPS
          </h2>
          <p className="font-serif italic text-xs text-[#4a423a] mt-1">
            Create an editor credentials profile to publish dispatches.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-6 bg-red-100 border-l-4 border-red-800 text-red-900 font-serif text-xs font-semibold">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 font-serif">
          <div>
            <label className="block text-xs font-bold uppercase text-[#1f1b18] mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-amber-800" />
              Editor Handle / Full Name
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. Samuel Clemens"
              className="w-full p-2.5 border-2 border-[#2c251e] bg-[#fdf8ee] text-[#1f1b18] text-sm focus:bg-[#f6ebd6] focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-[#1f1b18] mb-1 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-amber-800" />
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="editor@gazette.com"
              className="w-full p-2.5 border-2 border-[#2c251e] bg-[#fdf8ee] text-[#1f1b18] text-sm focus:bg-[#f6ebd6] focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-[#1f1b18] mb-1 flex items-center gap-1">
              <Key className="w-3.5 h-3.5 text-amber-800" />
              Passphrase (Min. 6 characters)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-2.5 border-2 border-[#2c251e] bg-[#fdf8ee] text-[#1f1b18] text-sm focus:bg-[#f6ebd6] focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 border-2 border-[#2c251e] bg-[#1f1b18] text-[#f6ebd6] font-serif uppercase font-bold text-xs hover:bg-[#3d342c] cursor-pointer transition flex justify-center items-center gap-2 mt-4"
          >
            <UserPlus className="w-4 h-4 text-amber-500" />
            {loading ? 'Registering...' : 'Complete Press Registration'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-dashed border-[#594939] text-center font-serif text-xs">
          <span className="text-[#4a423a] italic">Already registered as an Editor? </span>
          <button
            onClick={onNavigateLogin}
            className="font-bold underline text-[#1f1b18] hover:text-amber-900 cursor-pointer ml-1 uppercase"
          >
            Sign In Here
          </button>
        </div>
      </div>
    </main>
  );
};
