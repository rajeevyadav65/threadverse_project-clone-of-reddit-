'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Layers, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ usernameOrEmail: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const ok = await login(form.usernameOrEmail, form.password);
    if (ok) router.push('/');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#f97316] flex items-center justify-center">
            <Layers size={22} className="text-white" />
          </div>
          <span className="text-2xl font-extrabold text-white">
            Thread<span className="text-[#f97316]">Verse</span>
          </span>
        </div>

        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-8">
          <h1 className="text-xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-sm text-[#8b949e] mb-6">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#8b949e] uppercase tracking-wide">
                Username or Email
              </label>
              <input
                type="text"
                value={form.usernameOrEmail}
                onChange={e => setForm({ ...form, usernameOrEmail: e.target.value })}
                className="mt-1.5 w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-sm text-[#e6edf3] outline-none focus:border-[#f97316] transition-colors placeholder:text-[#8b949e]"
                placeholder="u/username or email"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#8b949e] uppercase tracking-wide">
                Password
              </label>
              <div className="relative mt-1.5">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-sm text-[#e6edf3] outline-none focus:border-[#f97316] transition-colors placeholder:text-[#8b949e] pr-10"
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b949e] hover:text-white">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#f97316] text-white font-bold text-sm hover:bg-[#ea6c0a] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-[#8b949e] mt-6">
            New to ThreadVerse?{' '}
            <Link href="/auth/register" className="text-[#f97316] font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-[#8b949e] mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
