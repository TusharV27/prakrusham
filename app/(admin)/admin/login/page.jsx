"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || 'Unable to authenticate admin.');
      return;
    }

    router.push('/admin');
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfaf5] p-6">
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl p-10 border border-green-50">
        <div className="text-center mb-10">
          <div className="inline-block p-4 rounded-3xl bg-green-50 mb-6 font-black text-2xl text-[#14532d]">
            P
          </div>
          <h1 className="text-3xl font-bold text-[#14532d]">Admin Portal</h1>
          <p className="mt-3 text-[#14532d]/60 text-sm">Welcome back to Prakrushi management</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-[#14532d]/40 mb-2 ml-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl bg-[#fdfaf5] border border-green-100 focus:outline-none focus:ring-2 focus:ring-[#16a34a] transition-all text-[#14532d]"
              placeholder="admin@prakrushi.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-[#14532d]/40 mb-2 ml-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl bg-[#fdfaf5] border border-green-100 focus:outline-none focus:ring-2 focus:ring-[#16a34a] transition-all text-[#14532d]"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-[#14532d] hover:bg-[#16a34a] text-white font-bold py-5 rounded-2xl shadow-lg transition-all transform hover:-translate-y-1 active:scale-95 text-center"
            >
              Secure Login
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-xs text-[#14532d]/30 font-medium">
          &copy; 2026 Prakrushi Organic Farming. All Rights Reserved.
        </p>
      </div>
    </div>
  );
}