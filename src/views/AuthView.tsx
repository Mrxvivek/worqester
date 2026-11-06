import React, { useState } from "react";
import {
  Lock,
  User,
  Shield,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  Layers,
  KeyRound,
  Send,
  CheckCircle2,
  X,
  HelpCircle,
  Clock,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { AuthApi } from "../services/api";

export const AuthView: React.FC = () => {
  const { login } = useApp();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Password Reset Request Modal State
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetReason, setResetReason] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccessMsg, setResetSuccessMsg] = useState<string | null>(null);
  const [resetErrorMsg, setResetErrorMsg] = useState<string | null>(null);
  const [resetStatusInfo, setResetStatusInfo] = useState<{ status: string; tempPassword?: string; createdAt?: string } | null>(null);

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
        setErrorMessage(res.error || "Invalid credentials. If you forgot your password, send a request to admin below.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      setResetErrorMsg("Please enter your work email or employee ID.");
      return;
    }
    setResetLoading(true);
    setResetErrorMsg(null);
    setResetSuccessMsg(null);
    setResetStatusInfo(null);

    try {
      const res = await AuthApi.requestPasswordReset(
        resetEmail.trim(),
        resetReason.trim() || "Employee requested credential reset from login portal"
      );
      if (res && res.success) {
        setResetSuccessMsg(res.message);
      } else {
        setResetErrorMsg(res?.error || "Failed to submit reset request. Please check your email or contact your administrator.");
      }
    } catch (err: any) {
      setResetErrorMsg(err.message || "An error occurred while submitting reset request.");
    } finally {
      setResetLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    if (!resetEmail.trim()) {
      setResetErrorMsg("Please enter your email to check request status.");
      return;
    }
    setResetLoading(true);
    setResetErrorMsg(null);
    try {
      const res = await AuthApi.checkResetStatus(resetEmail.trim());
      if (res && res.success && res.hasRequest && res.request) {
        setResetStatusInfo(res.request);
      } else {
        setResetErrorMsg("No pending or recent password reset request found for this account.");
      }
    } catch (err: any) {
      setResetErrorMsg(err.message || "Could not check request status.");
    } finally {
      setResetLoading(false);
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
              <div className="flex-1">
                <span>{errorMessage}</span>
              </div>
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
                  placeholder="name@company.com or username"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email.trim());
                    setResetErrorMsg(null);
                    setResetSuccessMsg(null);
                    setResetStatusInfo(null);
                    setIsResetModalOpen(true);
                  }}
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors"
                >
                  Forgot or need reset?
                </button>
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
          </form>

          {/* Send Request to Admin Footer */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 text-[11px]">Password reset required?</span>
            <button
              type="button"
              onClick={() => {
                setResetEmail(email.trim());
                setResetErrorMsg(null);
                setResetSuccessMsg(null);
                setResetStatusInfo(null);
                setIsResetModalOpen(true);
              }}
              className="font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer hover:underline text-[11px]"
            >
              <span>Send Request to Admin</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>

        {/* Security & One-Time Policy Notice */}
        <div className="mt-5 text-center space-y-1.5">
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <Shield size={13} className="text-emerald-600" />
            <span>One-time password setup on first login • Protected by enterprise salted hashing</span>
          </div>
          <p className="text-[10px] text-slate-400">
            Once configured, subsequent logins use your chosen password without repeating setup prompts.
          </p>
        </div>
      </div>

      {/* MODAL: SEND PASSWORD RESET REQUEST TO ADMIN */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 relative overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                  <KeyRound size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Request Password Reset</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Submit request directly to your workspace administrator
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Success State */}
            {resetSuccessMsg ? (
              <div className="space-y-4 py-2">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span>Request Submitted to Administrator</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-emerald-700">
                    {resetSuccessMsg}
                  </p>
                  <div className="text-[10px] text-emerald-600 bg-emerald-100/60 p-2 rounded-lg mt-2">
                    💡 Once approved, your administrator will provision temporary credentials for your next one-time login.
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetModalOpen(false);
                      setResetSuccessMsg(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Done & Return to Sign In
                  </button>
                </div>
              </div>
            ) : (
              /* Request Form */
              <form onSubmit={handleSendResetRequest} className="space-y-4">
                {resetErrorMsg && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                    <AlertCircle size={15} className="shrink-0 mt-0.5" />
                    <span>{resetErrorMsg}</span>
                  </div>
                )}

                {/* Status check info if available */}
                {resetStatusInfo && (
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <Clock size={14} className="text-blue-600" />
                      <span>Request Status: {resetStatusInfo.status}</span>
                    </div>
                    {resetStatusInfo.status === "Approved" ? (
                      <p className="text-[11px] text-blue-700">
                        Your request was approved! Temporary password: <strong className="font-mono bg-blue-100 px-1 py-0.5 rounded">{resetStatusInfo.tempPassword || "soxit123"}</strong>. You can now log in and set your new password.
                      </p>
                    ) : resetStatusInfo.status === "Pending" ? (
                      <p className="text-[11px] text-blue-700">
                        Your request is currently in queue awaiting administrator review.
                      </p>
                    ) : (
                      <p className="text-[11px] text-rose-700">
                        This request was reviewed and closed. Submit a new request if needed.
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Work Email Address or User ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="e.g. employee@soxit.org or username"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Reason / Details <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={resetReason}
                    onChange={(e) => setResetReason(e.target.value)}
                    placeholder="e.g. Forgot password, locked out, or requesting credentials refresh"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                  />
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-start gap-2 text-[11px] text-slate-500 leading-relaxed">
                  <HelpCircle size={15} className="text-blue-500 shrink-0 mt-0.5" />
                  <span>
                    Submitting this form dispatches a priority ticket to your workspace administrator (Jocker / Soxit Admin). They will approve and reset your credentials for a one-time login.
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handleCheckStatus}
                    disabled={resetLoading}
                    className="text-[11px] text-slate-600 hover:text-slate-900 font-medium cursor-pointer underline"
                  >
                    Check Status
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsResetModalOpen(false)}
                      className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={resetLoading}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-blue-600/20 cursor-pointer disabled:opacity-60 transition-colors"
                    >
                      {resetLoading ? (
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send size={13} />
                          <span>Send Request</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

