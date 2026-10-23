import React, { useState } from "react";
import {
  Briefcase,
  Mail,
  Lock,
  User,
  Shield,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Building,
  Sparkles,
  Layers,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { UserRole } from "../types";

export const AuthView: React.FC = () => {
  const { login } = useApp();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      if (!email.trim() || !password.trim()) {
        setErrorMessage("Please enter both email address and password.");
        setLoading(false);
        return;
      }

      const res = await login(email.trim(), password);
      if (!res.success) {
        setErrorMessage(res.error || "Invalid credentials. Please verify and try again.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col justify-center items-center bg-slate-50 px-4 py-8 relative overflow-hidden font-sans">
      {/* Background Accent Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      {/* Decorative Brand Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-60 pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md">
        {/* App Emblem & Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-600/20 mb-3">
            <Layers size={26} strokeWidth={2.2} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Worqester
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Unified Enterprise Operations & Project Management
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6 sm:p-8 backdrop-blur-sm">
          <div className="mb-5 pb-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">Sign In to Workspace</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Internal portal access. Accounts are provisioned by your workspace administrator.
            </p>
          </div>

          {/* Alerts */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Work Email or User ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User size={15} />
                </div>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. jocker or name@company.com"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={15} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-60 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Command Center</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>

            {/* Quick Fill for Ultimate & Admin Accounts */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setEmail("jocker");
                  setPassword("viki");
                }}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-blue-500/10 hover:from-amber-500/20 hover:to-blue-500/20 border border-amber-500/30 text-amber-900 dark:text-amber-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>👑 Quick-Fill Ultimate Account (jocker : viki)</span>
              </button>

              <div className="pt-1">
                <div className="flex items-center justify-between mb-1 px-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Soxit Admins (Initial Pass: Email, Name, or soxit123)
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("suman@soxit.org");
                      setPassword("suman@soxit.org");
                    }}
                    title="Login as Suman (suman@soxit.org)"
                    className="py-1.5 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-center font-medium truncate cursor-pointer transition-colors shadow-xs"
                  >
                    🛡️ Suman
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("raja@soxit.org");
                      setPassword("raja@soxit.org");
                    }}
                    title="Login as Raja (raja@soxit.org)"
                    className="py-1.5 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-center font-medium truncate cursor-pointer transition-colors shadow-xs"
                  >
                    🛡️ Raja
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("chriss@soxit.org");
                      setPassword("chriss@soxit.org");
                    }}
                    title="Login as Chriss (chriss@soxit.org)"
                    className="py-1.5 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-center font-medium truncate cursor-pointer transition-colors shadow-xs"
                  >
                    🛡️ Chriss
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Security & Encryption Notice */}
        <div className="mt-6 text-center flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium">
          <Shield size={13} className="text-emerald-600" />
          <span>Secured with cryptographic PBKDF2 salted password encryption & session tokens</span>
        </div>
      </div>
    </div>
  );
};
