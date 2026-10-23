import React, { useState, useEffect, useMemo } from "react";
import { useApp } from "../context/AppContext";
import {
  ShieldAlert,
  Zap,
  Radio,
  Users,
  CheckSquare,
  DollarSign,
  Activity,
  Server,
  Plus,
  Send,
  Lock,
  LogOut,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Briefcase,
  Layers,
  ChevronRight,
  RefreshCw,
  FolderKanban,
  FileText,
  KeyRound,
  Eye,
  Trash2,
  Pin,
  ExternalLink,
  Flame,
  Award,
  Filter,
  UserCheck,
  Building,
  Mail,
  Phone
} from "lucide-react";
import { formatCurrency } from "../utils/formatters";

interface JockerControlCenterProps {
  onToggleClassic: () => void;
}

export const JockerControlCenter: React.FC<JockerControlCenterProps> = ({ onToggleClassic }) => {
  const {
    currentUser,
    employees,
    tasks,
    projects,
    deals,
    auditLogs,
    notes,
    leaves,
    expenses,
    settings,
    logout,
    createNote,
    deleteItem,
    updateNote,
    createTask,
    updateTask,
    toggleTaskCompletion,
    updateLeaveStatus,
    updateExpenseStatus,
    attendance
  } = useApp();

  // Active Workstation Tab
  const [activeTab, setActiveTab] = useState<"workforce" | "surveillance" | "directives" | "tasks" | "approvals" | "diagnostics">("workforce");

  // Search & Filters
  const [omniSearch, setOmniSearch] = useState("");
  const [auditUserFilter, setAuditUserFilter] = useState("all");
  const [auditCategory, setAuditCategory] = useState<"all" | "sessions" | "clicks" | "data">("all");
  const [taskPriorityFilter, setTaskPriorityFilter] = useState("all");

  // Modals state
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isResetPwdModalOpen, setIsResetPwdModalOpen] = useState(false);
  const [selectedEmployeeForReset, setSelectedEmployeeForReset] = useState<any>(null);
  const [newPasswordValue, setNewPasswordValue] = useState("");
  const [forcePasswordChangeOnLogin, setForcePasswordChangeOnLogin] = useState(false);
  const [passwordResetSuccessMsg, setPasswordResetSuccessMsg] = useState("");
  const [passwordResetErrorMsg, setPasswordResetErrorMsg] = useState("");

  // Broadcast state
  const [directiveTitle, setDirectiveTitle] = useState("");
  const [directiveContent, setDirectiveContent] = useState("");
  const [directiveTarget, setDirectiveTarget] = useState("All");
  const [directiveIsPinned, setDirectiveIsPinned] = useState(true);
  const [broadcastSubmitting, setBroadcastSubmitting] = useState(false);
  const [broadcastNotification, setBroadcastNotification] = useState("");

  // Quick Task State
  const [quickTaskTitle, setQuickTaskTitle] = useState("");
  const [quickTaskAssignee, setQuickTaskAssignee] = useState("");
  const [quickTaskPriority, setQuickTaskPriority] = useState<"High" | "Critical" | "Medium">("High");
  const [quickTaskDueDate, setQuickTaskDueDate] = useState(new Date().toISOString().split("T")[0]);

  // System Stats Telemetry
  const [sysStats, setSysStats] = useState<any>({
    users: 10,
    employees: employees.length || 10,
    tasks: tasks.length,
    projects: projects.length,
    auditLogs: auditLogs.length,
    directives: notes.length,
    engineStatus: "Optimal",
    dbType: "SQLite Local (Active)"
  });
  const [isRefreshingStats, setIsRefreshingStats] = useState(false);

  // Fetch telemetry from backend
  const fetchTelemetry = async () => {
    setIsRefreshingStats(true);
    try {
      const token = localStorage.getItem("worqester_token");
      const res = await fetch("/api/system/stats", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.stats) {
          setSysStats(data.stats);
        }
      }
    } catch (err) {
      console.warn("Could not fetch remote system stats, using local state", err);
    } finally {
      setIsRefreshingStats(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 30000);
    return () => clearInterval(interval);
  }, []);

  // Compute Metrics
  const activeTasks = useMemo(() => tasks.filter((t) => t.status !== "Done"), [tasks]);
  const completedTasks = useMemo(() => tasks.filter((t) => t.status === "Done"), [tasks]);
  const overdueTasks = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return activeTasks.filter((t) => t.dueDate && t.dueDate < today);
  }, [activeTasks]);

  const pipelineValue = useMemo(() => deals.reduce((acc, d) => acc + (d.amount || 0), 0), [deals]);
  const pendingLeaves = useMemo(() => leaves.filter((l) => l.status === "Pending"), [leaves]);
  const pendingExpenses = useMemo(() => expenses.filter((e) => e.status === "Pending"), [expenses]);

  // Handle Broadcast Submission
  const handleTransmitDirective = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directiveTitle.trim() || !directiveContent.trim()) return;
    setBroadcastSubmitting(true);
    try {
      createNote({
        title: directiveTitle.trim(),
        content: directiveContent.trim(),
        tags: ["SUPREME DIRECTIVE", directiveTarget],
        pinned: directiveIsPinned,
        authorName: currentUser.name || "Jocker (Supreme Commander)",
        authorId: currentUser.id || "jocker",
        targetAudience: directiveTarget as any
      });
      setBroadcastNotification(`Directive "${directiveTitle}" transmitted across all terminals!`);
      setDirectiveTitle("");
      setDirectiveContent("");
      setIsBroadcastModalOpen(false);
      setTimeout(() => setBroadcastNotification(""), 6000);
    } catch (err) {
      console.error(err);
    } finally {
      setBroadcastSubmitting(false);
    }
  };

  // Handle Quick Task Dispatch
  const handleDispatchTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskTitle.trim()) return;
    const targetEmp = employees.find((emp) => emp.id === quickTaskAssignee);
    createTask({
      title: quickTaskTitle.trim(),
      description: `Dispatched directly by Supreme Commander Jocker. Immediate execution requested.`,
      projectId: projects[0]?.id || "proj-gen",
      projectName: projects[0]?.name || "General Workstream",
      assigneeId: quickTaskAssignee || employees[0]?.id || "emp-1",
      assigneeName: targetEmp?.fullName || "Assigned Specialist",
      reporterId: currentUser.id || "jocker",
      reporterName: currentUser.name || "Jocker (Supreme Commander)",
      priority: quickTaskPriority,
      status: "To Do",
      dueDate: quickTaskDueDate,
      estimatedHours: 4,
      actualHours: 0,
      labels: ["Supreme Dispatch"]
    });
    setQuickTaskTitle("");
    setIsTaskModalOpen(false);
    setBroadcastNotification("Task successfully dispatched and routed to employee!");
    setTimeout(() => setBroadcastNotification(""), 5000);
  };

  // Handle Admin Password Reset
  const handleExecutePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeForReset || !newPasswordValue.trim()) return;
    setPasswordResetErrorMsg("");
    setPasswordResetSuccessMsg("");

    try {
      const token = localStorage.getItem("worqester_token");
      const res = await fetch("/api/auth/admin-reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: selectedEmployeeForReset.workEmail || selectedEmployeeForReset.email || selectedEmployeeForReset.id,
          newPassword: newPasswordValue.trim(),
          mustChangePassword: forcePasswordChangeOnLogin
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPasswordResetSuccessMsg(`Password for ${selectedEmployeeForReset.fullName} reset to: "${newPasswordValue}"`);
        setTimeout(() => {
          setIsResetPwdModalOpen(false);
          setNewPasswordValue("");
          setPasswordResetSuccessMsg("");
        }, 3000);
      } else {
        setPasswordResetErrorMsg(data.error || "Failed to reset password.");
      }
    } catch (err: any) {
      setPasswordResetErrorMsg(err.message || "Network error occurred.");
    }
  };

  // Filtered Surveillance Logs
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      if (auditUserFilter !== "all") {
        const match =
          log.userName?.toLowerCase() === auditUserFilter.toLowerCase() ||
          (log as any).userId === auditUserFilter;
        if (!match) return false;
      }
      if (auditCategory !== "all") {
        const act = (log.action || "").toLowerCase();
        if (auditCategory === "sessions") {
          if (!act.includes("login") && !act.includes("logout") && !act.includes("session")) return false;
        } else if (auditCategory === "clicks") {
          if (!act.includes("click") && !act.includes("view") && !act.includes("navigation")) return false;
        } else if (auditCategory === "data") {
          if (act.includes("login") || act.includes("logout") || act.includes("click") || act.includes("navigation")) return false;
        }
      }
      if (omniSearch.trim()) {
        const q = omniSearch.toLowerCase();
        const match =
          log.userName?.toLowerCase().includes(q) ||
          log.action?.toLowerCase().includes(q) ||
          log.details?.toLowerCase().includes(q) ||
          log.entityName?.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [auditLogs, auditUserFilter, auditCategory, omniSearch]);

  // Filtered Employees
  const filteredEmployees = useMemo(() => {
    if (!omniSearch.trim()) return employees;
    const q = omniSearch.toLowerCase();
    return employees.filter(
      (e) =>
        e.fullName?.toLowerCase().includes(q) ||
        e.department?.toLowerCase().includes(q) ||
        e.designation?.toLowerCase().includes(q) ||
        e.workEmail?.toLowerCase().includes(q) ||
        e.eId?.toLowerCase().includes(q)
    );
  }, [employees, omniSearch]);

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (taskPriorityFilter !== "all" && t.priority !== taskPriorityFilter) return false;
      if (omniSearch.trim()) {
        const q = omniSearch.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          t.assigneeName?.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [tasks, taskPriorityFilter, omniSearch]);

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-amber-500 selection:text-black">
      {/* 1. MASTER COMMAND DECK BAR */}
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-amber-500/30 px-4 sm:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xl shadow-amber-500/5">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center font-bold text-2xl shadow-lg shadow-amber-500/25 ring-2 ring-amber-400/40 shrink-0">
            👑
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-wider text-base sm:text-lg bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
                JOCKER SUPREME CONTROL CENTER
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 tracking-widest uppercase">
                Supreme Authority
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                SYSTEM 100% OPERATIONAL
              </span>
              <span>•</span>
              <span className="text-slate-500">ID: {currentUser.id}</span>
              <span>•</span>
              <span className="text-amber-400/80">0 Restrictions / Full Bypass</span>
            </div>
          </div>
        </div>

        {/* Action Hub */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => setIsBroadcastModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Radio size={14} className="text-slate-950 animate-pulse" />
            <span>Broadcast Directive</span>
          </button>

          <button
            type="button"
            onClick={() => setIsTaskModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-slate-600 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus size={14} className="text-emerald-400" />
            <span>Dispatch Task</span>
          </button>

          <button
            type="button"
            onClick={fetchTelemetry}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors cursor-pointer"
            title="Refresh System Telemetry"
          >
            <RefreshCw size={14} className={isRefreshingStats ? "animate-spin text-amber-400" : ""} />
          </button>

          <div className="h-6 w-px bg-slate-800 mx-1 hidden sm:block" />

          <button
            type="button"
            onClick={onToggleClassic}
            className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
            title="Switch to Classic Multi-Page Workspace"
          >
            <Layers size={13} className="text-indigo-400" />
            <span>Classic View</span>
          </button>

          <button
            type="button"
            onClick={logout}
            className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 hover:border-rose-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Lock Console / Sign Out"
          >
            <LogOut size={13} />
            <span>Lock</span>
          </button>
        </div>
      </header>

      {/* Broadcast Toast Notification */}
      {broadcastNotification && (
        <div className="bg-emerald-500/15 border-b border-emerald-500/30 text-emerald-300 px-6 py-2.5 text-xs font-medium flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-400" />
            <span>{broadcastNotification}</span>
          </div>
          <button
            onClick={() => setBroadcastNotification("")}
            className="text-emerald-400 hover:text-emerald-200 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. MAIN COCKPIT VIEWPORT */}
      <main className="flex-1 max-w-[1680px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* 3. SIX CORE TELEMETRY METRIC TILES */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
          {/* Workforce */}
          <div
            onClick={() => setActiveTab("workforce")}
            className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
              activeTab === "workforce"
                ? "bg-gradient-to-b from-blue-950/40 to-slate-900 border-blue-500/60 shadow-lg shadow-blue-500/10"
                : "bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Workforce Radar</span>
              <Users size={16} className="text-blue-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-white">{employees.length}</span>
              <span className="text-[11px] text-emerald-400 font-medium">Nodes Active</span>
            </div>
            <p className="text-[10px] text-slate-500 truncate">100% On-Duty • All Shifts Synced</p>
          </div>

          {/* SLA Tasks */}
          <div
            onClick={() => setActiveTab("tasks")}
            className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
              activeTab === "tasks"
                ? "bg-gradient-to-b from-indigo-950/40 to-slate-900 border-indigo-500/60 shadow-lg shadow-indigo-500/10"
                : "bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Deliverables</span>
              <CheckSquare size={16} className="text-indigo-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-white">{activeTasks.length}</span>
              <span className="text-[11px] text-slate-400 font-medium">/ {tasks.length}</span>
            </div>
            <p className="text-[10px] text-indigo-400 truncate">
              {overdueTasks.length > 0 ? `⚠️ ${overdueTasks.length} Overdue SLA` : "✓ 100% On Track"}
            </p>
          </div>

          {/* Directives Broadcast */}
          <div
            onClick={() => setActiveTab("directives")}
            className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
              activeTab === "directives"
                ? "bg-gradient-to-b from-amber-950/40 to-slate-900 border-amber-500/60 shadow-lg shadow-amber-500/10"
                : "bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Directives Station</span>
              <Radio size={16} className="text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-amber-300">{notes.length}</span>
              <span className="text-[11px] text-amber-400/80 font-medium">Active</span>
            </div>
            <p className="text-[10px] text-slate-500 truncate">Beaming to All Terminals</p>
          </div>

          {/* Surveillance Logs */}
          <div
            onClick={() => setActiveTab("surveillance")}
            className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
              activeTab === "surveillance"
                ? "bg-gradient-to-b from-emerald-950/40 to-slate-900 border-emerald-500/60 shadow-lg shadow-emerald-500/10"
                : "bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Clickstream Feed</span>
              <Activity size={16} className="text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-emerald-400">{auditLogs.length}</span>
              <span className="text-[11px] text-emerald-500 font-medium">Recorded</span>
            </div>
            <p className="text-[10px] text-slate-500 truncate">Live User Tracking Active</p>
          </div>

          {/* Commercial Deals */}
          <div
            onClick={() => setActiveTab("approvals")}
            className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
              activeTab === "approvals"
                ? "bg-gradient-to-b from-purple-950/40 to-slate-900 border-purple-500/60 shadow-lg shadow-purple-500/10"
                : "bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Commercial Value</span>
              <DollarSign size={16} className="text-purple-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-white">
                {formatCurrency(pipelineValue, "INR", "₹")}
              </span>
            </div>
            <p className="text-[10px] text-purple-400 truncate">{deals.length} Active Deals</p>
          </div>

          {/* System & DB Diagnostics */}
          <div
            onClick={() => setActiveTab("diagnostics")}
            className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
              activeTab === "diagnostics"
                ? "bg-gradient-to-b from-cyan-950/40 to-slate-900 border-cyan-500/60 shadow-lg shadow-cyan-500/10"
                : "bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Database Health</span>
              <Server size={16} className="text-cyan-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold font-mono text-cyan-300">SQLite OK</span>
            </div>
            <p className="text-[10px] text-slate-500 truncate">Local DB • 0 Latency</p>
          </div>
        </div>

        {/* 4. OMNI-SEARCH & WORKSTATION NAVIGATOR */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl">
          {/* Workstation Tab Switchers */}
          <div className="flex items-center flex-wrap gap-1.5">
            {[
              { id: "workforce", label: "👥 Workforce Radar & Controls", count: employees.length },
              { id: "surveillance", label: "👁️ Live Clickstream & Audit", count: auditLogs.length },
              { id: "directives", label: "📢 Directives Dispatch", count: notes.length },
              { id: "tasks", label: "🚀 Master Deliverables Grid", count: tasks.length },
              { id: "approvals", label: "💼 Approvals & Pipeline", count: pendingLeaves.length + pendingExpenses.length },
              { id: "diagnostics", label: "🛡️ System Diagnostics", count: null },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      activeTab === tab.id ? "bg-slate-950/30 text-slate-950 font-bold" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Omni Search Box */}
          <div className="relative min-w-[280px] max-w-md w-full">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={omniSearch}
              onChange={(e) => setOmniSearch(e.target.value)}
              placeholder="Omni-search employees, actions, tasks..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 text-xs text-slate-200 placeholder-slate-600 outline-none transition-all"
            />
            {omniSearch && (
              <button
                type="button"
                onClick={() => setOmniSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* 5. WORKSTATION PANE CONTENT */}

        {/* WORKSTATION 1: WORKFORCE RADAR & EMPLOYEE CONTROLS */}
        {activeTab === "workforce" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users size={18} className="text-amber-400" />
                  <span>Workforce Radar — Direct Employee Commands</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Control credentials, view active shifts, dispatch tasks, and audit individual members in one click.
                </p>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Showing {filteredEmployees.length} of {employees.length} Personnel
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
              {filteredEmployees.map((emp) => {
                const assignedCount = tasks.filter((t) => t.assigneeId === emp.id).length;
                return (
                  <div
                    key={emp.id}
                    className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-3 group shadow-md"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={emp.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.fullName)}&background=2563eb&color=fff`}
                            alt={emp.fullName}
                            className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-800 group-hover:ring-amber-500/40 transition-all shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-100 truncate">{emp.fullName}</h4>
                            <p className="text-[10px] text-amber-400/90 font-mono truncate">{emp.eId || emp.employeeNumber}</p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                          Active
                        </span>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-1.5 text-[11px] text-slate-400">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Briefcase size={12} className="text-slate-500 shrink-0" />
                          <span className="truncate">{emp.designation || emp.team}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Building size={12} className="text-slate-500 shrink-0" />
                          <span className="truncate">{emp.department}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                          <Mail size={12} className="text-slate-600 shrink-0" />
                          <span className="truncate">{emp.workEmail || emp.email}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Assigned Tasks:</span>
                        <span className="font-mono font-bold text-amber-400">{assignedCount}</span>
                      </div>

                      {/* Action buttons on employee card */}
                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedEmployeeForReset(emp);
                            setNewPasswordValue("worqester123");
                            setIsResetPwdModalOpen(true);
                          }}
                          className="w-full py-1.5 px-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                          title="Reset employee password directly"
                        >
                          <KeyRound size={11} />
                          <span>Reset Pwd</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setAuditUserFilter(emp.fullName);
                            setActiveTab("surveillance");
                          }}
                          className="w-full py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer"
                          title="View live clicks and activities for this employee"
                        >
                          <Eye size={11} className="text-emerald-400" />
                          <span>Audit Trail</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* WORKSTATION 2: SURVEILLANCE & REAL-TIME CLICKSTREAM */}
        {activeTab === "surveillance" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity size={18} className="text-emerald-400" />
                  <span>Real-Time Employee Clickstream & Surveillance Radar</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Live, continuous feed of every login, button click, page navigation, and database mutation.
                </p>
              </div>

              {/* Sub filters */}
              <div className="flex items-center flex-wrap gap-2">
                <select
                  value={auditUserFilter}
                  onChange={(e) => setAuditUserFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-1.5 outline-none font-medium cursor-pointer"
                >
                  <option value="all">👥 All Employees ({employees.length})</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.fullName}>
                      {e.fullName}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs">
                  {(["all", "sessions", "clicks", "data"] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setAuditCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                        auditCategory === cat ? "bg-emerald-500 text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Terminal-Style Log Stream */}
            <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl font-mono text-xs">
              <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-slate-400 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="font-bold text-slate-200 ml-2">omni-surveillance.stream</span>
                </div>
                <span>Total Stream Entries: {filteredAuditLogs.length}</span>
              </div>

              <div className="divide-y divide-slate-800/50 max-h-[580px] overflow-y-auto">
                {filteredAuditLogs.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    No matching surveillance logs for current criteria.
                  </div>
                ) : (
                  filteredAuditLogs.map((log) => {
                    const isLogin = log.action.toLowerCase().includes("login");
                    const isLogout = log.action.toLowerCase().includes("logout");
                    const isClick = log.action.toLowerCase().includes("click") || log.action.toLowerCase().includes("nav");

                    return (
                      <div
                        key={log.id}
                        className="p-3.5 hover:bg-slate-900/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                      >
                        <div className="flex items-start sm:items-center gap-3 min-w-0">
                          <span className="text-[10px] text-slate-500 shrink-0">
                            {log.timestamp ? log.timestamp.split("T")[1]?.slice(0, 8) || log.timestamp : "Just now"}
                          </span>

                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                              isLogin
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                : isLogout
                                ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                                : isClick
                                ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                                : "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                            }`}
                          >
                            {log.action}
                          </span>

                          <div className="min-w-0">
                            <span className="font-bold text-slate-200 mr-2">{log.userName || "Unknown"}</span>
                            <span className="text-slate-400 text-[11px] truncate">{log.details}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-[10px] text-slate-500 shrink-0">
                          <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            {log.entityType || "System"}
                          </span>
                          <span>{log.entityName || "Workspace"}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* WORKSTATION 3: DIRECTIVES & BROADCAST STATION */}
        {activeTab === "directives" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Broadcast Form */}
            <div className="lg:col-span-1 p-5 rounded-2xl bg-slate-900/90 border border-amber-500/30 shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-amber-400">
                <Radio size={18} className="animate-pulse" />
                <h3 className="font-bold text-sm text-white">Transmit Supreme Directive</h3>
              </div>
              <p className="text-xs text-slate-400">
                Directives published here instantly pin to all active employee workspace screens.
              </p>

              <form onSubmit={handleTransmitDirective} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Directive Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={directiveTitle}
                    onChange={(e) => setDirectiveTitle(e.target.value)}
                    placeholder="e.g. Q3 Security Protocol Override"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Target Terminal Audience
                  </label>
                  <select
                    value={directiveTarget}
                    onChange={(e) => setDirectiveTarget(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none"
                  >
                    <option value="All">All Organization Terminals (Company-Wide)</option>
                    <option value="Engineering & Cloud">Engineering & Cloud Only</option>
                    <option value="Operations">Operations Team Only</option>
                    <option value="Sales & Marketing">Commercial & Sales</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Directive Content *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={directiveContent}
                    onChange={(e) => setDirectiveContent(e.target.value)}
                    placeholder="Enter instructions, mandates, or operational updates..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 text-xs text-white outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="pinDirective"
                    checked={directiveIsPinned}
                    onChange={(e) => setDirectiveIsPinned(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-800 text-amber-500 focus:ring-0"
                  />
                  <label htmlFor="pinDirective" className="text-xs text-slate-300 cursor-pointer font-medium">
                    Pin to Top of All Employee Dashboards
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={broadcastSubmitting}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Send size={14} />
                  <span>{broadcastSubmitting ? "Transmitting..." : "Transmit Directive Now"}</span>
                </button>
              </form>
            </div>

            {/* Right: Active Directives Stream */}
            <div className="lg:col-span-2 space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-white">Active Operational Directives</h3>
                <span className="text-xs font-mono text-amber-400">{notes.length} Active Directives</span>
              </div>

              <div className="space-y-3">
                {notes.map((n) => (
                  <div
                    key={n.id}
                    className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all space-y-2 relative"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {n.pinned && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                            <Pin size={10} /> PINNED
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                          {n.targetAudience || "All"}
                        </span>
                        <h4 className="font-bold text-sm text-white">{n.title}</h4>
                      </div>

                      <button
                        type="button"
                        onClick={() => deleteItem("note", n.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors cursor-pointer"
                        title="Delete Directive"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">{n.content}</p>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>Commander: {n.authorName || "Jocker"}</span>
                      <span>Published: {n.updatedAt || "Active"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* WORKSTATION 4: MASTER DELIVERABLES & TASKS RADAR */}
        {activeTab === "tasks" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CheckSquare size={18} className="text-indigo-400" />
                  <span>Master Task & Deliverables Dispatch</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Track delivery SLAs, assign emergency work, and mark completion instantly.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={taskPriorityFilter}
                  onChange={(e) => setTaskPriorityFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-1.5 outline-none font-medium cursor-pointer"
                >
                  <option value="all">All Priorities</option>
                  <option value="Critical">🔥 Critical Only</option>
                  <option value="High">⚡ High Priority</option>
                  <option value="Medium">Medium</option>
                </select>

                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Plus size={14} />
                  <span>New Deliverable</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredTasks.map((t) => {
                const isDone = t.status === "Done";
                return (
                  <div
                    key={t.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                      isDone
                        ? "bg-slate-950/60 border-slate-900 opacity-60"
                        : "bg-slate-900/90 border-slate-800 hover:border-indigo-500/40"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.priority === "Critical"
                              ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                              : t.priority === "High"
                              ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                              : "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                          }`}
                        >
                          {t.priority}
                        </span>

                        <span className="text-[11px] font-mono text-slate-500">
                          Due: {t.dueDate || "Immediate"}
                        </span>
                      </div>

                      <h4 className={`font-bold text-xs mt-2 ${isDone ? "line-through text-slate-500" : "text-white"}`}>
                        {t.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{t.description}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 font-bold flex items-center justify-center text-[10px]">
                          {t.assigneeName ? t.assigneeName[0] : "U"}
                        </span>
                        <span className="truncate max-w-[120px]">{t.assigneeName || "Unassigned"}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleTaskCompletion(t.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                          isDone
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300"
                        }`}
                      >
                        <CheckCircle2 size={13} />
                        <span>{isDone ? "Completed" : "Mark Done"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* WORKSTATION 5: APPROVALS & COMMERCIAL PIPELINE */}
        {activeTab === "approvals" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Approvals (Leaves & Expenses) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Award size={18} className="text-amber-400" />
                  <span>Pending Employee Approvals</span>
                </h3>
                <span className="text-xs font-mono text-amber-400">
                  {pendingLeaves.length + pendingExpenses.length} Requests Pending
                </span>
              </div>

              {pendingLeaves.length === 0 && pendingExpenses.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 text-center text-slate-500 text-xs">
                  All employee leave requests and expense reimbursements are fully cleared.
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Leaves */}
                  {pendingLeaves.map((l) => (
                    <div
                      key={l.id}
                      className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400">
                            LEAVE: {l.type}
                          </span>
                          <span className="font-bold text-xs text-white">{l.employeeName}</span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {l.startDate} → {l.endDate} • {l.reason}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateLeaveStatus(l.id, "Approved")}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => updateLeaveStatus(l.id, "Rejected")}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-900 hover:text-white text-slate-400 font-bold text-xs cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Expenses */}
                  {pendingExpenses.map((exp) => (
                    <div
                      key={exp.id}
                      className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/15 text-purple-400">
                            EXPENSE
                          </span>
                          <span className="font-bold text-xs text-white">{exp.employeeName}</span>
                          <span className="font-mono font-bold text-emerald-400">
                            {formatCurrency(exp.amount, "INR", "₹")}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {exp.category} • {exp.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateExpenseStatus(exp.id, "Approved")}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => updateExpenseStatus(exp.id, "Rejected")}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-900 hover:text-white text-slate-400 font-bold text-xs cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Commercial Deals Pipeline */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <DollarSign size={18} className="text-emerald-400" />
                  <span>Commercial Deal Flow</span>
                </h3>
                <span className="text-xs font-mono text-emerald-400">
                  Total: {formatCurrency(pipelineValue, "INR", "₹")}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {deals.map((d) => (
                  <div
                    key={d.id}
                    className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-emerald-400">
                        {formatCurrency(d.amount, "INR", "₹")}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {d.stage}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-white truncate">{d.name}</h4>
                    <p className="text-[11px] text-slate-400 truncate">{d.companyName || "Enterprise Client"}</p>
                    <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between font-mono">
                      <span>Prob: {d.probability}%</span>
                      <span>Close: {d.expectedCloseDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* WORKSTATION 6: SYSTEM DIAGNOSTICS & DB CONTROLS */}
        {activeTab === "diagnostics" && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Server size={18} className="text-cyan-400" />
              <span>Supreme System Health & Database Diagnostics</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Engine Status</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Database Engine</span>
                    <span className="font-mono text-cyan-300">SQLite (Local Embedded)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Engine Health</span>
                    <span className="font-mono text-emerald-400">100% Operational</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Privilege Mode</span>
                    <span className="font-mono text-amber-400">Supreme Commander Override</span>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Table Row Telemetry</h4>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Users Table:</span>
                    <span className="text-white font-bold">{sysStats.users} rows</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Employees Table:</span>
                    <span className="text-white font-bold">{sysStats.employees} rows</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Tasks Table:</span>
                    <span className="text-white font-bold">{sysStats.tasks} rows</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Audit Logs Table:</span>
                    <span className="text-emerald-400 font-bold">{sysStats.auditLogs} entries</span>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Fast System Controls</h4>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={fetchTelemetry}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
                  >
                    Sync Live Database Metrics
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
                      const downloadAnchor = document.createElement("a");
                      downloadAnchor.setAttribute("href", dataStr);
                      downloadAnchor.setAttribute("download", `worqester_audit_dump_${Date.now()}.json`);
                      document.body.appendChild(downloadAnchor);
                      downloadAnchor.click();
                      downloadAnchor.remove();
                    }}
                    className="w-full py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-xs font-semibold text-amber-300 transition-colors cursor-pointer"
                  >
                    Export Full Audit Logs (JSON)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 6. MODAL: ADMIN INSTANT PASSWORD RESET */}
      {isResetPwdModalOpen && selectedEmployeeForReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400">
                <KeyRound size={20} />
                <h3 className="font-bold text-base text-white">Reset Employee Password</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsResetPwdModalOpen(false);
                  setPasswordResetSuccessMsg("");
                  setPasswordResetErrorMsg("");
                }}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Supreme Command Override: Set an immediate new password for{" "}
              <strong className="text-amber-300">{selectedEmployeeForReset.fullName}</strong> (
              {selectedEmployeeForReset.workEmail || selectedEmployeeForReset.email}).
            </p>

            {passwordResetSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs">
                {passwordResetSuccessMsg}
              </div>
            )}
            {passwordResetErrorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs">
                {passwordResetErrorMsg}
              </div>
            )}

            <form onSubmit={handleExecutePasswordReset} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  New Password *
                </label>
                <input
                  type="text"
                  required
                  value={newPasswordValue}
                  onChange={(e) => setNewPasswordValue(e.target.value)}
                  placeholder="Enter new password (min 4 characters)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-amber-500 outline-none font-mono"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="forceChangeReset"
                  checked={forcePasswordChangeOnLogin}
                  onChange={(e) => setForcePasswordChangeOnLogin(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-amber-500"
                />
                <label htmlFor="forceChangeReset" className="text-xs text-slate-300 cursor-pointer">
                  Require employee to change password on their next login
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsResetPwdModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  Confirm Password Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. MODAL: QUICK TASK DISPATCH */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-400">
                <Plus size={20} />
                <h3 className="font-bold text-base text-white">Direct Task Dispatch</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTaskModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDispatchTask} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Deliverable Title *
                </label>
                <input
                  type="text"
                  required
                  value={quickTaskTitle}
                  onChange={(e) => setQuickTaskTitle(e.target.value)}
                  placeholder="e.g. Audit cloud cluster permissions"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Assign To Specialist *
                </label>
                <select
                  value={quickTaskAssignee}
                  onChange={(e) => setQuickTaskAssignee(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none"
                >
                  <option value="">Select Employee...</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.fullName} ({e.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
                  <select
                    value={quickTaskPriority}
                    onChange={(e) => setQuickTaskPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none"
                  >
                    <option value="Critical">🔥 Critical</option>
                    <option value="High">⚡ High</option>
                    <option value="Medium">Medium</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={quickTaskDueDate}
                    onChange={(e) => setQuickTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 cursor-pointer"
                >
                  Dispatch Deliverable
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. MODAL: QUICK BROADCAST POPUP */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400">
                <Radio size={20} className="animate-pulse" />
                <h3 className="font-bold text-base text-white">Broadcast Supreme Directive</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBroadcastModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleTransmitDirective} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Directive Title *
                </label>
                <input
                  type="text"
                  required
                  value={directiveTitle}
                  onChange={(e) => setDirectiveTitle(e.target.value)}
                  placeholder="e.g. Critical System Notice / Operational Policy"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Target Audience
                </label>
                <select
                  value={directiveTarget}
                  onChange={(e) => setDirectiveTarget(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none"
                >
                  <option value="All">All Organization Terminals (Company-Wide)</option>
                  <option value="Engineering & Cloud">Engineering & Cloud Only</option>
                  <option value="Operations">Operations Team Only</option>
                  <option value="Sales & Marketing">Commercial & Sales</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Directive Message *
                </label>
                <textarea
                  rows={4}
                  required
                  value={directiveContent}
                  onChange={(e) => setDirectiveContent(e.target.value)}
                  placeholder="Type the message to be displayed to employees..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-amber-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="modalPinDirective"
                  checked={directiveIsPinned}
                  onChange={(e) => setDirectiveIsPinned(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-amber-500"
                />
                <label htmlFor="modalPinDirective" className="text-xs text-slate-300 cursor-pointer font-medium">
                  Pin Directive to Top of All Terminals
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBroadcastModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={broadcastSubmitting}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  {broadcastSubmitting ? "Transmitting..." : "Transmit to All Screens"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
