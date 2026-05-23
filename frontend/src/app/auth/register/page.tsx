'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Layers, Loader2, Check, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const pwd = form.password;
  const rules = [
    { label: 'At least 8 characters', ok: pwd.length >= 8 },
    { label: 'Contains a number', ok: /\d/.test(pwd) },
    { label: 'Contains a letter', ok: /[a-zA-Z]/.test(pwd) },
    { label: 'Passwords match', ok: pwd === form.confirm && form.confirm.length > 0 },
  ];
  const allOk = rules.every(r => r.ok);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allOk) return;
    setLoading(true);
    const ok = await register(form.username, form.email, form.password);
    if (ok) router.push('/');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#f97316] flex items-center justify-center">
            <Layers size={22} className="text-white" />
          </div>
          <span className="text-2xl font-extrabold text-white">
            Thread<span className="text-[#f97316]">Verse</span>
          </span>
        </div>

        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-8">
          <h1 className="text-xl font-bold text-white mb-2">Create your account</h1>
          <p className="text-sm text-[#8b949e] mb-6">Join the community today</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'Username', key: 'username', type: 'text', ph: 'u/coolusername' },
              { label: 'Email', key: 'email', type: 'email', ph: 'you@example.com' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs font-semibold text-[#8b949e] uppercase tracking-wide">{f.label}</label>
                <input
                  type={f.type}
                  value={(form as any)[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  className="mt-1.5 w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-sm text-[#e6edf3] outline-none focus:border-[#f97316] transition-colors placeholder:text-[#8b949e]"
                  placeholder={f.ph}
                  required
                />
              </div>
            ))}

            <div>
              <label className="text-xs font-semibold text-[#8b949e] uppercase tracking-wide">Password</label>
              <div className="relative mt-1.5">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-sm text-[#e6edf3] outline-none focus:border-[#f97316] transition-colors placeholder:text-[#8b949e] pr-10"
                  placeholder="Create a strong password"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b949e] hover:text-white">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#8b949e] uppercase tracking-wide">Confirm Password</label>
              <input
                type="password"
                value={form.confirm}
                onChange={e => setForm({ ...form, confirm: e.target.value })}
                className="mt-1.5 w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-sm text-[#e6edf3] outline-none focus:border-[#f97316] transition-colors placeholder:text-[#8b949e]"
                placeholder="Confirm your password"
                required
              />
            </div>

            {/* Password strength */}
            {form.password && (
              <div className="space-y-1.5 p-3 bg-[#0d1117] rounded-xl border border-[#30363d]">
                {rules.map(r => (
                  <div key={r.label} className="flex items-center gap-2 text-xs">
                    {r.ok ? <Check size={12} className="text-green-400" /> : <X size={12} className="text-[#8b949e]" />}
                    <span className={r.ok ? 'text-green-400' : 'text-[#8b949e]'}>{r.label}</span>
                  </div>
                ))}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !allOk}
              className="w-full py-3 rounded-xl bg-[#f97316] text-white font-bold text-sm hover:bg-[#ea6c0a] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-[#8b949e] mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-[#f97316] font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
