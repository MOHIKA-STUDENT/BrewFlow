import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Coffee, ArrowLeft } from "lucide-react";
import { useAuth } from "../lib/AuthContext";

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await signIn({ email, password });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    navigate("/dashboard");
  }

  return (
    <div className="min-h-screen flex bg-paper-100 dark:bg-ink-950 font-body selection:bg-gold-500 selection:text-white">
      
      {/* Left Panel - Branding (hidden on mobile, shown on md+) */}
      <div className="hidden md:flex md:w-1/2 bg-[#0b0f19] flex-col justify-between p-12 text-white relative overflow-hidden border-r border-slate-900">
        {/* Brand logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gold-500 flex items-center justify-center shadow-md">
            <Coffee size={18} className="text-ink-950" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-semibold text-sm tracking-tight text-white leading-none">
              BrewFlow
            </span>
            <span className="text-[8px] font-mono tracking-widest text-slate-500 uppercase mt-0.5">
              Sales OS
            </span>
          </div>
        </div>

        {/* Center Tagline */}
        <div className="space-y-6 max-w-lg my-auto">
          <p className="text-xs font-mono uppercase tracking-widest text-gold-500 font-bold">
            A Sales OS for real B2B Brands
          </p>
          <h1 className="font-display font-bold text-4xl lg:text-5xl leading-[1.1] tracking-tight">
            Replace the spreadsheet. <br />
            <span className="text-gold-500">Keep every lead in motion.</span>
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Built for oat milk, coffee, bakery suppliers and every B2B brand selling into other businesses. Track leads, follow up on time, and never lose a warm prospect again.
          </p>
        </div>

        {/* Footer */}
        <div className="text-[10px] text-slate-600 font-mono">
          © BrewFlow AI · secure by design
        </div>
      </div>

      {/* Right Panel - Sign-in Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-6 sm:px-12 py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="rounded-2xl bg-white dark:bg-ink-900 border border-ink-100 dark:border-ink-800 p-8 shadow-xl space-y-6">
            <div>
              <Link to="/" className="inline-flex items-center gap-1 text-[9px] uppercase font-bold tracking-widest text-[#14213d]/50 dark:text-slate-400 hover:text-[#d8a64c] transition-colors mb-3 pb-2 border-b border-[#14213d]/5 dark:border-white/5 w-full">
                <ArrowLeft size={10} /> <span>Back to Home</span>
              </Link>
            </div>
            <div className="space-y-1.5">
              <h2 className="font-display font-bold text-2xl text-ink-900 dark:text-paper-50 tracking-tight">
                Sign in
              </h2>
              <p className="text-xs text-ink-500 dark:text-ink-300">
                Welcome back. Enter your credentials to continue.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink-500 dark:text-ink-300 uppercase tracking-wide block">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@company.com"
                  className="w-full px-3.5 py-3 rounded-xl border border-ink-100 dark:border-ink-800 bg-[#eff6ff]/30 focus:bg-white dark:bg-ink-950/40 dark:focus:bg-ink-950 text-sm outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 text-ink-900 dark:text-paper-100 transition-all placeholder:text-ink-300"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink-500 dark:text-ink-300 uppercase tracking-wide block">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-3.5 py-3 rounded-xl border border-ink-100 dark:border-ink-800 bg-[#eff6ff]/30 focus:bg-white dark:bg-ink-950/40 dark:focus:bg-ink-950 text-sm outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 text-ink-900 dark:text-paper-100 transition-all placeholder:text-ink-300"
                />
              </div>

              {error && (
                <p className="text-xs text-coral-500 bg-coral-100 dark:bg-coral-500/15 rounded-lg px-3 py-2 border border-coral-500/10 font-medium">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] text-white text-sm font-semibold hover:shadow-md transition-all cursor-pointer disabled:opacity-60"
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>
            
            <div className="pt-2 border-t border-ink-100 dark:border-ink-800 text-center text-xs text-ink-500 dark:text-ink-300">
              New to BrewFlow?{" "}
              <Link to="/signup" className="text-gold-500 hover:underline font-semibold">
                Create your workspace
              </Link>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
