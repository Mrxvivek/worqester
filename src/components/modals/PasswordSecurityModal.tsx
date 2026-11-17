import React, { useState } from "react";
import {
  Lock,
  Eye,
  EyeOff,
  Shield,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  Clock,
  ArrowRight,
} from "lucide-react";
import { useApp } from "../../context/AppContext";

export const PasswordSecurityModal: React.FC = () => {
  const {
    currentUser,
    isPasswordModalOpen,
    setIsPasswordModalOpen,
    changePassword,
    requestPasswordChange,
    cancelPasswordChangeRequest,
  } = useApp();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (!isPasswordModalOpen) return null;

  const isAdmin =
    currentUser.role === "Super Admin" ||
    currentUser.role === "Admin" ||
    currentUser.id === "jocker";

  const isApproved = currentUser.passwordChangeStatus === "approved";
  const isRequested = currentUser.passwordChangeStatus === "requested";
  const canDirectlyChange = isAdmin || isApproved;

  const handleRequest = async () => {
    setError(null);
    setMessage(null);
    setRequestLoading(true);
    try {
      const res = await requestPasswordChange();
      if (res.success) {
        setMessage(res.message || "Request submitted to your workspace administrators.");
      } else {
        setError(res.error || "Failed to submit request.");
      }
    } catch (err: any) {
      setError(err.message || "Unexpected error occurred.");
    } finally {
      setRequestLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    setError(null);
    setMessage(null);
    setRequestLoading(true);
    try {
      const res = await cancelPasswordChangeRequest();
      if (res.success) {
        setMessage("Password change request cancelled.");
      } else {
        setError(res.error || "Failed to cancel request.");
      }
    } catch (err: any) {
      setError(err.message || "Unexpected error.");
    } finally {
      setRequestLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!newPassword || newPassword.trim().length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await changePassword(newPassword, currentPassword || undefined);
      if (res.success) {
        setMessage("Password updated successfully!");
        setNewPassword("");
        setConfirmPassword("");
        setCurrentPassword("");
        setTimeout(() => {
          setIsPasswordModalOpen(false);
          setMessage(null);
        }, 1800);
      } else {
        setError(res.error || "Failed to update password.");
      }
    } catch (err: any) {
      setError(err.message || "Unexpected error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden font-sans text-slate-900 dark:text-white">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Lock size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold">Password & Security</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Manage your credentials and access permissions
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsPasswordModalOpen(false);
              setError(null);
              setMessage(null);
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {/* User Status Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
            <div>
              <div className="font-semibold text-slate-800 dark:text-slate-200">{currentUser.name}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">{currentUser.email}</div>
            </div>
            <div className="text-right">
              <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold text-[10px]">
                {currentUser.role}
              </span>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {isAdmin ? "Full Admin Access" : "Employee Role"}
              </div>
            </div>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-start gap-2 text-xs text-rose-700 dark:text-rose-400">
              <AlertCircle size={15} className="text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-start gap-2 text-xs text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
              <span>{message}</span>
            </div>
          )}

          {/* Flow 1: Employee with NO permission yet */}
          {!isAdmin && !isApproved && !isRequested && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200">
                  <ShieldAlert size={16} className="text-amber-600 dark:text-amber-400" />
                  <span>Admin Permission Required</span>
                </div>
                <p className="text-amber-800 dark:text-amber-300/90 text-[11px] leading-relaxed">
                  As an employee in the internal system, changing your password requires administrator approval.
                  Click below to submit an instant permission request to your workspace administrators.
                </p>
              </div>

              <button
                type="button"
                onClick={handleRequest}
                disabled={requestLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-60"
              >
                {requestLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Request Permission from Admin</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          )}

          {/* Flow 2: Employee with REQUEST PENDING */}
          {!isAdmin && !isApproved && isRequested && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-blue-900 dark:text-blue-200">
                  <Clock size={16} className="text-blue-600 dark:text-blue-400 animate-pulse" />
                  <span>Permission Request Pending Approval</span>
                </div>
                <p className="text-blue-800 dark:text-blue-300/90 text-[11px] leading-relaxed">
                  Your request has been submitted to workspace administrators. Once an administrator approves it, you will be able to change your password immediately.
                </p>
                {currentUser.passwordChangeRequestedAt && (
                  <div className="text-[10px] text-blue-600 dark:text-blue-400 font-mono">
                    Requested on: {new Date(currentUser.passwordChangeRequestedAt).toLocaleString()}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleCancelRequest}
                disabled={requestLoading}
                className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer"
              >
                {requestLoading ? "Cancelling..." : "Cancel Request"}
              </button>
            </div>
          )}

          {/* Flow 3: Permission APPROVED or User is ADMIN */}
          {canDirectlyChange && (
            <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
              {isApproved && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
                  <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                  <span>
                    <strong>Permission Granted!</strong> An administrator has authorized you to update your password.
                  </span>
                </div>
              )}

              {isAdmin && (
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
                  <Shield size={15} className="text-blue-600 shrink-0" />
                  <span>Administrator Account: You can update your credentials directly.</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Current Password <span className="text-slate-400 font-normal">(optional if unknown)</span>
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password if known"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 bg-white dark:bg-slate-800 focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  New Password <span className="text-slate-400 font-normal">(minimum 8 characters)</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new strong password"
                    className="w-full pl-3.5 pr-10 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 bg-white dark:bg-slate-800 focus:outline-none focus:border-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 bg-white dark:bg-slate-800 focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-60"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Save New Password</span>
                      <ArrowRight size={13} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
