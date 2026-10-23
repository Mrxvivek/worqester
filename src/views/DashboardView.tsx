import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { KpiCard } from "../components/common/KpiCard";
import { StatusBadge } from "../components/common/StatusBadge";
import { PriorityBadge } from "../components/common/PriorityBadge";
import { formatCurrency, formatDate } from "../utils/formatters";
import {
  DollarSign,
  Briefcase,
  FolderKanban,
  CheckSquare,
  Users,
  ShieldCheck,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
  Calendar,
  Sparkles,
  AlertCircle,
  Activity,
  CheckCircle2,
  Building,
  Laptop,
  MessageSquare,
  Pencil,
  Download,
  Upload,
  Check,
  ExternalLink,
  FileText,
  UserCheck,
  Radio,
  Send,
  Eye,
  MousePointer,
  LogIn,
  LogOut,
  Filter,
  Search,
  RefreshCw,
  Pin,
  Shield,
  Layers,
  Zap,
  BookOpen,
  X,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Task, Employee } from "../types";
import { EditTaskModal } from "../components/modals/EditModals";
import { generatePayslipPDF } from "../utils/payslipGenerator";

const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#f43f5e"];

type RangePreset = "today" | "7d" | "30d" | "quarter" | "ytd" | "all";

export const DashboardView: React.FC = () => {
  const {
    kpis,
    projects,
    tasks,
    deals,
    leads,
    employees,
    activities,
    settings,
    navigateTo,
    openCreateModal,
    setIsAiAssistantOpen,
    setIsAiAuditOpen,
    checkInCurrentUser,
    checkOutCurrentUser,
    currentUser,
    attendance,
    updateTask,
    addTaskComment,
    notes,
    createNote,
    auditLogs,
    availableUsers,
  } = useApp();

  const isJocker =
    currentUser.id === "jocker" ||
    currentUser.email?.toLowerCase() === "jocker" ||
    currentUser.name.toLowerCase().includes("jocker");

  // Command Center Navigation Tabs
  const [commandTab, setCommandTab] = useState<"cockpit" | "audit" | "broadcasts" | "projects" | "sales" | "team">("cockpit");
  const [employeeMode, setEmployeeMode] = useState<"personal" | "command">(isJocker ? "command" : "command");

  // Quick Broadcast Announcement Modal State
  const [isQuickPostOpen, setIsQuickPostOpen] = useState(false);
  const [quickPostTitle, setQuickPostTitle] = useState("");
  const [quickPostContent, setQuickPostContent] = useState("");
  const [quickPostAudience, setQuickPostAudience] = useState<"All" | "Employees" | "Executives">("All");
  const [quickPostPinned, setQuickPostPinned] = useState(true);

  // Command Center Audit Subview State
  const [cockpitAuditUserFilter, setCockpitAuditUserFilter] = useState<string>("all");
  const [cockpitAuditCategory, setCockpitAuditCategory] = useState<string>("all");
  const [cockpitAuditSearchQuery, setCockpitAuditSearchQuery] = useState<string>("");

  const todayIso = new Date().toISOString().split("T")[0];
  const [rangePreset, setRangePreset] = useState<RangePreset>("all");
  const [startDate, setStartDate] = useState("2020-01-01");
  const [endDate, setEndDate] = useState("2030-12-31");
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const isEmployee = currentUser.role === "Employee";

  const handleQuickPostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPostTitle.trim()) return;
    createNote({
      title: quickPostTitle.trim(),
      content: quickPostContent.trim(),
      tags: ["Announcement", "Command Directive"],
      targetAudience: quickPostAudience,
      pinned: quickPostPinned,
    });
    setQuickPostTitle("");
    setQuickPostContent("");
    setIsQuickPostOpen(false);
  };

  const handlePresetChange = (preset: RangePreset) => {
    setRangePreset(preset);
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    if (preset === "today") {
      setStartDate(today);
      setEndDate(today);
    } else if (preset === "7d") {
      const d = new Date(now.getTime() - 7 * 86400000).toISOString().split("T")[0];
      setStartDate(d);
      setEndDate(today);
    } else if (preset === "30d") {
      const d = new Date(now.getTime() - 30 * 86400000).toISOString().split("T")[0];
      setStartDate(d);
      setEndDate(today);
    } else if (preset === "quarter") {
      const qMonth = Math.floor(now.getMonth() / 3) * 3;
      const d = new Date(now.getFullYear(), qMonth, 1).toISOString().split("T")[0];
      setStartDate(d);
      setEndDate(today);
    } else if (preset === "ytd") {
      setStartDate(`${now.getFullYear()}-01-01`);
      setEndDate(today);
    } else if (preset === "all") {
      setStartDate("2020-01-01");
      setEndDate("2030-12-31");
    }
  };

  const pipelineTrendData = useMemo(() => {
    const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"];
    if (deals.length === 0) {
      return months.map((month) => ({ month, revenue: 0, pipeline: 0 }));
    }
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const buckets: Record<string, { revenue: number; pipeline: number }> = {};
    months.forEach((m) => {
      buckets[m] = { revenue: 0, pipeline: 0 };
    });
    deals.forEach((d) => {
      const dt = d.expectedCloseDate ? new Date(d.expectedCloseDate) : new Date();
      const mName = monthNames[dt.getMonth()] || "Sep";
      const targetKey = buckets[mName] ? mName : "Sep";
      if (d.stage === "Closed Won") {
        buckets[targetKey].revenue += Number(d.amount) || 0;
      } else if (d.stage !== "Closed Lost") {
        buckets[targetKey].pipeline += Number(d.amount) || 0;
      }
    });
    return months.map((month) => ({
      month,
      revenue: buckets[month].revenue,
      pipeline: buckets[month].pipeline,
    }));
  }, [deals]);

  const periodDeals = useMemo(() => {
    return deals.filter((d) => {
      const dt = d.expectedCloseDate || "";
      if (startDate && dt && dt < startDate) return false;
      if (endDate && dt && dt > endDate) return false;
      return true;
    });
  }, [deals, startDate, endDate]);

  const periodTasks = useMemo(() => {
    return tasks.filter((t) => {
      const dt = t.dueDate || "";
      if (startDate && dt && dt < startDate) return false;
      if (endDate && dt && dt > endDate) return false;
      return true;
    });
  }, [tasks, startDate, endDate]);

  const periodWonRevenue = useMemo(() => {
    const val = periodDeals
      .filter((d) => d.stage === "Closed Won")
      .reduce((sum, d) => sum + (d.amount || 0), 0);
    return val > 0 ? val : kpis.wonRevenue;
  }, [periodDeals, kpis.wonRevenue]);

  const periodPipelineValue = useMemo(() => {
    const val = periodDeals
      .filter((d) => d.stage !== "Closed Won" && d.stage !== "Closed Lost")
      .reduce((sum, d) => sum + (d.amount || 0), 0);
    return val > 0 ? val : kpis.pipelineValue;
  }, [periodDeals, kpis.pipelineValue]);

  const periodOverdueTasks = useMemo(() => {
    const count = periodTasks.filter(
      (t) => t.status !== "Done" && (t.slaBreached || (t.dueDate && t.dueDate < todayIso))
    ).length;
    return count > 0 ? count : kpis.overdueTasks;
  }, [periodTasks, kpis.overdueTasks, todayIso]);

  const userAttendedToday = attendance.some(
    (a) => a.employeeName === currentUser.name && a.status === "Present"
  );

  // Employee personalized memoized calculations
  const myTasks = useMemo(() => {
    return tasks.filter((t) => {
      const isAssigned =
        (t.assigneeName && t.assigneeName.toLowerCase() === currentUser.name.toLowerCase()) ||
        t.assigneeId === currentUser.id;
      if (!isAssigned) return false;
      const dt = t.dueDate || "";
      if (startDate && dt && dt < startDate) return false;
      if (endDate && dt && dt > endDate) return false;
      return true;
    });
  }, [tasks, currentUser, startDate, endDate]);

  const myActiveTasks = useMemo(() => myTasks.filter((t) => t.status !== "Done"), [myTasks]);
  const myCompletedTasks = useMemo(() => myTasks.filter((t) => t.status === "Done"), [myTasks]);
  const myOverdueTasks = useMemo(
    () =>
      myTasks.filter(
        (t) => t.status !== "Done" && (t.slaBreached || (t.dueDate && t.dueDate < todayIso))
      ),
    [myTasks, todayIso]
  );

  const myProjects = useMemo(() => {
    return projects.filter(
      (p) =>
        p.teamMemberIds?.includes(currentUser.id) ||
        p.projectManagerId === currentUser.id ||
        myTasks.some((t) => t.projectId === p.id)
    );
  }, [projects, currentUser, myTasks]);

  const currentUserEmployee = useMemo(() => {
    return (
      employees.find((e) => e.email === currentUser.email) ||
      employees.find((e) => e.fullName && currentUser.name && e.fullName.toLowerCase() === currentUser.name.toLowerCase()) ||
      employees[0] || {
        fullName: currentUser.name,
        employeeNumber: "WQ-1001",
        designation: currentUser.jobTitle || "Software Engineer",
        department: currentUser.department,
        salaryBasic: 125000,
        bankAccountMasked: "HDFC **** 8841",
        workMode: "On-site" as const,
        location: "Bengaluru",
      }
    );
  }, [employees, currentUser]);

  if (isEmployee && !isJocker && employeeMode === "personal") {
    return (
      <div className="space-y-6 pb-12">
        {/* Top Welcome & Quick Actions Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
              <span>Employee Workspace & Daily Overview</span>
              <span>•</span>
              <span className="font-mono text-slate-400 dark:text-slate-500">Worqester Team Hub</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Welcome back, {currentUser.name}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {currentUser.jobTitle || "Team Member"} • {currentUser.department} • {myActiveTasks.length} active deliverables, {myProjects.length} active workstreams.
            </p>
          </div>

          <div className="flex flex-col items-start lg:items-end gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEmployeeMode("command")}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Zap size={14} className="text-amber-300" />
                <span>Switch to Command Center (See Everything)</span>
              </button>
            </div>

            {/* Time Filter Presets */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 px-2 py-0.5 text-[11px] font-medium border-r border-slate-200 dark:border-slate-700">
                <Calendar size={13} className="text-blue-600 dark:text-blue-400" />
                <span>Timeframe:</span>
              </div>
              {[
                { id: "today", label: "Today" },
                { id: "7d", label: "7D" },
                { id: "30d", label: "30D" },
                { id: "quarter", label: "QTD" },
                { id: "ytd", label: "YTD" },
                { id: "all", label: "All Time" },
              ].map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handlePresetChange(preset.id as any)}
                  className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all cursor-pointer ${
                    rangePreset === preset.id
                      ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs border border-slate-200/80 dark:border-slate-600"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center flex-wrap gap-2.5">
              {!userAttendedToday ? (
                <button
                  type="button"
                  onClick={checkInCurrentUser}
                  className="px-3.5 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Clock size={14} className="text-emerald-600 dark:text-emerald-400" />
                  <span>Mark Today's Check-In</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={checkOutCurrentUser}
                  className="px-3.5 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-700 dark:hover:text-rose-300 hover:border-rose-200 transition-colors"
                  title="Click to Clock Out"
                >
                  <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" />
                  <span>Checked In (Clock Out)</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => openCreateModal("task")}
                className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <Plus size={14} />
                <span>New Task</span>
              </button>

              <button
                type="button"
                onClick={() => openCreateModal("leave")}
                className="px-3.5 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Calendar size={14} className="text-amber-500" />
                <span>Apply for Leave</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAiAssistantOpen(true)}
                className="px-3.5 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles size={14} className="text-indigo-600 dark:text-indigo-400" />
                <span>AI Briefing</span>
              </button>
            </div>
          </div>
        </div>

        {/* Employee Personal KPIs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
          <KpiCard
            title="My Assigned Tasks"
            value={myActiveTasks.length}
            subValue={`${myCompletedTasks.length} Completed`}
            change={myActiveTasks.length > 0 ? `${myActiveTasks.length} In Progress` : "All Done"}
            trend="up"
            comparisonPeriod="Assigned to me"
            icon={<CheckSquare size={18} />}
            iconBg="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800"
            onClick={() => navigateTo("tasks", "kanban")}
          />

          <KpiCard
            title="Due Today / Overdue"
            value={myOverdueTasks.length}
            subValue={myOverdueTasks.length > 0 ? "Requires Attention" : "All on Track"}
            change={myOverdueTasks.length > 0 ? "SLA Breached" : "100% on track"}
            trend={myOverdueTasks.length > 0 ? "down" : "up"}
            comparisonPeriod="High Priority"
            icon={<AlertCircle size={18} />}
            iconBg="bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-800"
            onClick={() => navigateTo("tasks", "all")}
          />

          <KpiCard
            title="My Active Projects"
            value={myProjects.length}
            subValue="Active Workstreams"
            change="Team Contributor"
            trend="up"
            comparisonPeriod="Current sprint"
            icon={<FolderKanban size={18} />}
            iconBg="bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800"
            onClick={() => navigateTo("projects", "all")}
          />

          <KpiCard
            title="Attendance Status"
            value={userAttendedToday ? "Present" : "Pending"}
            subValue={userAttendedToday ? "In: 09:15 AM IST" : "Check-in Required"}
            change={userAttendedToday ? "Shift Active" : "Action Needed"}
            trend={userAttendedToday ? "up" : "down"}
            comparisonPeriod="Today's Shift"
            icon={<Clock size={18} />}
            iconBg="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800"
            onClick={() => navigateTo("hrm", "attendance")}
          />

          <KpiCard
            title="Available Leaves"
            value="18 Days"
            subValue="12 Casual • 6 Sick"
            change="Accrued & Ready"
            trend="up"
            comparisonPeriod="FY 2026-27"
            icon={<Calendar size={18} />}
            iconBg="bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800"
            onClick={() => navigateTo("hrm", "leave")}
          />

          <KpiCard
            title="Reimbursements"
            value="₹12,400"
            subValue="1 Claim Pending"
            change="Under Review"
            trend="up"
            comparisonPeriod="Corporate Claims"
            icon={<DollarSign size={18} />}
            iconBg="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800"
            onClick={() => navigateTo("hrm", "expenses")}
          />
        </div>

        {/* Main Content Area: Left (Deliverables & Projects) + Right (Self-Service Hub) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 Cols): Tasks & Project Status */}
          <div className="lg:col-span-2 space-y-6">
            {/* My Active Tasks & Deliverables */}
            <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <CheckSquare size={16} className="text-blue-600 dark:text-blue-400" />
                    <span>My Assigned Tasks & Deliverables ({myTasks.length})</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Tasks assigned to {currentUser.name} with due dates, priority, and direct edit & comment controls
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openCreateModal("task")}
                    className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 text-xs font-semibold flex items-center gap-1 cursor-pointer border border-blue-200 dark:border-blue-800"
                  >
                    <Plus size={13} />
                    <span>Add Task</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateTo("tasks", "kanban")}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Kanban Board →
                  </button>
                </div>
              </div>

              {myTasks.length === 0 ? (
                <div className="py-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  <CheckSquare size={32} className="mx-auto text-slate-400 mb-2" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No tasks assigned in this timeframe</p>
                  <p className="text-xs text-slate-500 mt-1">Create a new task or pick one from the backlog</p>
                  <button
                    type="button"
                    onClick={() => openCreateModal("task")}
                    className="mt-3 px-3.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5"
                  >
                    <Plus size={14} /> Create Task
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {myTasks.slice(0, 6).map((task) => (
                    <div
                      key={task.id}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <PriorityBadge priority={task.priority} size="sm" />
                          <span className="font-semibold text-slate-900 dark:text-white truncate">
                            {task.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5 text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="text-blue-600 dark:text-blue-400 font-medium">{task.projectName}</span>
                          <span>•</span>
                          <span className="font-mono">Est: {task.estimatedHours || 0}h</span>
                          {task.notes && (
                            <>
                              <span>•</span>
                              <span className="italic text-slate-600 dark:text-slate-400 truncate max-w-[200px]">
                                📝 {task.notes}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-700">
                        <StatusBadge status={task.status} size="sm" />
                        
                        <span
                          className={`text-[10px] font-mono font-medium ${
                            task.slaBreached
                              ? "text-rose-600 dark:text-rose-400 font-bold"
                              : "text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          Due {formatDate(task.dueDate)}
                        </span>

                        {/* Direct Edit Button */}
                        <button
                          type="button"
                          onClick={() => setEditingTask(task)}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-800/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 font-semibold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                          title="Edit Task & Manage Comments/Notes"
                        >
                          <Pencil size={12} />
                          <span>Edit</span>
                        </button>

                        {/* Comments Badge */}
                        <button
                          type="button"
                          onClick={() => setEditingTask(task)}
                          className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px] flex items-center gap-1 cursor-pointer font-mono"
                          title="View comments"
                        >
                          <MessageSquare size={12} />
                          <span>{task.comments?.length || 0}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* My Assigned Projects */}
            <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <FolderKanban size={16} className="text-purple-600 dark:text-purple-400" />
                    <span>My Project Assignments & Milestones</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Workstreams where you are assigned as a contributor or engineer
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigateTo("projects", "all")}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-bold uppercase tracking-wider cursor-pointer"
                >
                  All Projects →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {myProjects.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => navigateTo("projects", "all")}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer space-y-2.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-mono text-[11px] text-blue-600 dark:text-blue-400 font-bold">
                          {p.code}
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white truncate">
                          {p.name}
                        </span>
                      </div>
                      <StatusBadge status={p.health} size="sm" />
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                      {p.description}
                    </p>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          p.health === "Critical"
                            ? "bg-rose-500"
                            : p.health === "At Risk"
                            ? "bg-amber-500"
                            : "bg-blue-600"
                        }`}
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      <span>{p.progress}% Delivered</span>
                      <span>Target: {formatDate(p.endDate)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (1 Col): Employee Self-Service Quick Portal */}
          <div className="space-y-6">
            <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-blue-500/40"
                />
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                    {currentUser.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {currentUser.jobTitle || "Engineer"} • {currentUser.department}
                  </p>
                  <p className="text-[10px] font-mono text-blue-600 dark:text-blue-400">
                    ID: {currentUserEmployee.employeeNumber || "WQ-1001"}
                  </p>
                </div>
              </div>

              {/* Attendance Shift Clock */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Shift Schedule</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    {userAttendedToday ? "Active Shift" : "Shift Not Started"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  09:30 AM – 06:30 PM IST • Bangalore Centre
                </p>
                <div className="pt-1">
                  {!userAttendedToday ? (
                    <button
                      type="button"
                      onClick={checkInCurrentUser}
                      className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    >
                      <Clock size={14} /> Mark Check-In Now
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={checkOutCurrentUser}
                      className="w-full py-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-rose-100 hover:text-rose-700 dark:hover:bg-rose-900/60 dark:hover:text-rose-300 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <CheckCircle2 size={14} className="text-emerald-600" /> Clock Out for the Day
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Actions List */}
              <div className="space-y-2 pt-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                  Self-Service Shortcuts
                </span>

                <button
                  type="button"
                  onClick={() => openCreateModal("leave")}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-medium cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-amber-500" />
                    <span>Apply for Annual / Sick Leave</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">18 Days</span>
                </button>

                <button
                  type="button"
                  onClick={() => openCreateModal("expense")}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-medium cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <DollarSign size={14} className="text-emerald-500" />
                    <span>Claim Travel / Expense</span>
                  </div>
                  <ArrowRight size={13} className="text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => generatePayslipPDF(currentUserEmployee as Employee, "August 2026")}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-semibold cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Download size={14} className="text-blue-600 dark:text-blue-400" />
                    <span>Download August Payslip (PDF)</span>
                  </div>
                  <span className="text-[10px] font-mono">PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo("hrm", "assets")}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-medium cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Laptop size={14} className="text-indigo-500" />
                    <span>My Allocated Hardware Assets</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">2 Devices</span>
                </button>
              </div>
            </div>

            {/* Recent Team Updates */}
            <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Activity size={15} className="text-indigo-600 dark:text-indigo-400" />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                    Recent Operations Feed
                  </h4>
                </div>
                <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-mono font-semibold border border-emerald-200 dark:border-emerald-800">
                  Live
                </span>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-1 text-xs">
                {(activities || []).slice(0, 4).map((act) => (
                  <div key={act.id || Math.random()} className="pb-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{act.title || "Untitled Activity"}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{act.timestamp || ""}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">{act.description || ""}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Edit Task Modal Drawer for Employee */}
        {editingTask && (
          <EditTaskModal
            isOpen={!!editingTask}
            task={editingTask}
            onClose={() => setEditingTask(null)}
            onSave={(updated) => {
              updateTask(editingTask.id, updated);
              setEditingTask(null);
            }}
            onAddComment={addTaskComment}
            projects={projects}
            employees={employees}
          />
        )}
      </div>
    );
  }

  const userOptions = Array.from(
    new Set([
      ...availableUsers.map((u) => u.name),
      ...employees.map((e) => e.fullName || `${e.firstName} ${e.lastName}`).filter(Boolean),
      ...auditLogs.map((l) => l.userName).filter(Boolean),
    ])
  ).sort();

  const filteredCockpitLogs = auditLogs.filter((log) => {
    if (cockpitAuditUserFilter !== "all") {
      const match =
        log.userName?.toLowerCase() === cockpitAuditUserFilter.toLowerCase() ||
        (log as any).userId === cockpitAuditUserFilter;
      if (!match) return false;
    }
    if (cockpitAuditCategory !== "all") {
      const act = log.action.toLowerCase();
      if (cockpitAuditCategory === "sessions") {
        if (!act.includes("login") && !act.includes("logout") && !act.includes("session")) return false;
      } else if (cockpitAuditCategory === "clicks") {
        if (!act.includes("click") && !act.includes("navigation") && !act.includes("view")) return false;
      } else if (cockpitAuditCategory === "data") {
        if (act.includes("login") || act.includes("logout") || act.includes("session") || act.includes("click") || act.includes("navigation")) return false;
      }
    }
    if (cockpitAuditSearchQuery.trim()) {
      const q = cockpitAuditSearchQuery.toLowerCase();
      const match =
        log.userName?.toLowerCase().includes(q) ||
        log.action?.toLowerCase().includes(q) ||
        log.details?.toLowerCase().includes(q) ||
        log.entityName?.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* 1. TOP COMMAND CENTER HERO & STATUS BANNER */}
      <div className={`p-6 rounded-2xl border transition-all shadow-xl backdrop-blur-md ${
        isJocker
          ? "bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 border-amber-500/40 shadow-amber-500/5 text-white"
          : "bg-slate-900/90 dark:bg-slate-900/90 border-slate-800 text-white"
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>COMMAND CENTER LIVE • ALL SYSTEMS ONLINE</span>
              </span>
              {isJocker && (
                <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold tracking-tight flex items-center gap-1 shadow-xs">
                  <Sparkles size={12} className="text-amber-300" />
                  <span>SUPREME OVERLORD PRIVILEGES</span>
                </span>
              )}
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
                {isJocker ? (
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-purple-300 to-blue-400">
                    Jocker Executive Command Center
                  </span>
                ) : (
                  <span>Executive Operations Command Center</span>
                )}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Single Pane of Glass Telemetry for <strong className="text-slate-200">{settings?.companyName || "Worqester Technologies"}</strong> • Real-time visibility across {projects.length} workstreams, {deals.length} deals, {employees.length} personnel, and {auditLogs.length} audit transactions.
              </p>
            </div>
          </div>

          {/* Quick Launchpad & Controls */}
          <div className="flex flex-col sm:flex-row items-start lg:items-end gap-3 shrink-0">
            {/* Timeframe Presets */}
            <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center gap-1 text-slate-400 px-2 py-0.5 text-[11px] font-medium border-r border-slate-800">
                <Calendar size={13} className="text-blue-400" />
                <span>Range:</span>
              </div>
              {[
                { id: "today", label: "Today" },
                { id: "7d", label: "7D" },
                { id: "30d", label: "30D" },
                { id: "all", label: "All Time" },
              ].map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handlePresetChange(preset.id as any)}
                  className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all cursor-pointer ${
                    rangePreset === preset.id
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Emergency & Quick Launch Buttons */}
            <div className="flex items-center flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setIsQuickPostOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer active:scale-95 transition-all"
                title="Broadcast an announcement across all user accounts"
              >
                <Radio size={14} className="text-slate-950" />
                <span>Broadcast Post</span>
              </button>

              <button
                type="button"
                onClick={() => setCommandTab("audit")}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
                title="View live employee logins, clicks, and logout logs"
              >
                <Shield size={14} className="text-blue-400" />
                <span>Employee Logs</span>
              </button>

              <button
                type="button"
                onClick={() => openCreateModal("task")}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Plus size={14} />
                <span>New Task</span>
              </button>

              {!userAttendedToday ? (
                <button
                  type="button"
                  onClick={checkInCurrentUser}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Clock size={14} />
                  <span>Clock In</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={checkOutCurrentUser}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 hover:bg-rose-950 hover:text-rose-300 hover:border-rose-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span>Clock Out</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 2. COMMAND CENTER TABS: SINGLE PANE OF GLASS NAVIGATION */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-5 border-t border-slate-800/80 scrollbar-none">
          {[
            { id: "cockpit", label: "🛰️ Unified Cockpit", count: null },
            { id: "audit", label: "👥 Live Employee Logs & Audit Feed", count: auditLogs.length },
            { id: "broadcasts", label: "📢 Workspace Directives & Posts", count: notes.length },
            { id: "projects", label: "🚀 Projects Radar", count: projects.length },
            { id: "sales", label: "💼 Commercial Pipeline", count: deals.length },
            { id: "team", label: "🕒 Workforce & Attendance", count: employees.length },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCommandTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl font-semibold text-xs whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
                commandTab === tab.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold"
                  : "bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  commandTab === tab.id ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 3. TAB CONTENT: UNIFIED COCKPIT (SEE EVERYTHING IN ONE PLACE) */}
      {commandTab === "cockpit" && (
        <div className="space-y-6">
          {/* Top Vital HUD Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
            <KpiCard
              title="Open Pipeline Value"
              value={formatCurrency(periodPipelineValue, settings?.currency || "INR", settings?.currencySymbol || "₹")}
              change={`${kpis.openDealsCount} Open Deals`}
              trend="up"
              comparisonPeriod={rangePreset === "all" ? "cumulative" : `for ${rangePreset}`}
              icon={<DollarSign size={18} />}
              iconBg="bg-blue-500/10 text-blue-400 border-blue-500/20"
              onClick={() => setCommandTab("sales")}
            />

            <KpiCard
              title="Won Booked Revenue"
              value={formatCurrency(periodWonRevenue, settings?.currency || "INR", settings?.currencySymbol || "₹")}
              change={periodWonRevenue > 0 ? "Booked" : "0 Won"}
              trend="up"
              comparisonPeriod="realized"
              icon={<Briefcase size={18} />}
              iconBg="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              onClick={() => setCommandTab("sales")}
            />

            <KpiCard
              title="Active Projects"
              value={kpis.activeProjects}
              subValue={`(${kpis.projectsAtRisk} At Risk)`}
              change={kpis.projectsAtRisk > 0 ? `${kpis.projectsAtRisk} Attention` : "100% on track"}
              trend={kpis.projectsAtRisk > 0 ? "down" : "up"}
              comparisonPeriod=""
              icon={<FolderKanban size={18} />}
              iconBg="bg-purple-500/10 text-purple-400 border-purple-500/20"
              onClick={() => setCommandTab("projects")}
            />

            <KpiCard
              title="Overdue Tasks"
              value={periodOverdueTasks}
              subValue={`of ${periodTasks.length} in period`}
              change={periodOverdueTasks > 0 ? "SLA Breached" : "Clear"}
              trend={periodOverdueTasks > 0 ? "down" : "up"}
              comparisonPeriod=""
              icon={<CheckSquare size={18} />}
              iconBg="bg-rose-500/10 text-rose-400 border-rose-500/20"
              onClick={() => navigateTo("tasks")}
            />

            <KpiCard
              title="Total Workforce"
              value={kpis.totalEmployees}
              subValue={`${kpis.attendanceToday} In Office`}
              change={`${kpis.activeEmployees} Active`}
              trend="up"
              comparisonPeriod="roster"
              icon={<Users size={18} />}
              iconBg="bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
              onClick={() => setCommandTab("team")}
            />

            <KpiCard
              title="Health Index"
              value={`${kpis.businessHealthScore}/100`}
              change={kpis.businessHealthStatus}
              trend={kpis.businessHealthScore >= 80 ? "up" : "down"}
              comparisonPeriod="Stability"
              icon={<ShieldCheck size={18} />}
              iconBg="bg-amber-500/10 text-amber-400 border-amber-500/20"
              onClick={() => setIsAiAuditOpen(true)}
            />
          </div>

          {/* DUAL COLUMN COMMAND DECK */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 Columns: Projects Portfolio + SLA Watchlist + Revenue Velocity */}
            <div className="lg:col-span-7 space-y-6">
              {/* Projects Portfolio Radar */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <FolderKanban size={16} className="text-blue-500" />
                      <span>Projects Portfolio Radar</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Active workstreams, completion progress, and budget burn
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCommandTab("projects")}
                    className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                  >
                    View All ({projects.length})
                  </button>
                </div>

                <div className="space-y-3">
                  {projects.length === 0 ? (
                    <p className="text-xs text-slate-500 py-4 text-center">No active projects registered.</p>
                  ) : (
                    projects.slice(0, 4).map((p) => (
                      <div
                        key={p.id}
                        onClick={() => navigateTo("projects", "all")}
                        className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500 transition-all cursor-pointer space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-mono text-[11px] text-blue-600 dark:text-blue-400 font-bold">
                              {p.code}
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white truncate">{p.name}</span>
                          </div>
                          <StatusBadge status={p.health} size="sm" />
                        </div>

                        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              p.health === "Critical"
                                ? "bg-rose-500"
                                : p.health === "At Risk"
                                ? "bg-amber-500"
                                : "bg-blue-600"
                            }`}
                            style={{ width: `${p.progress}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                          <span>{p.progress}% Completed</span>
                          <span>Spent: ₹{(p.spent / 100000).toFixed(1)}L / ₹{(p.budget / 100000).toFixed(1)}L</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Critical Deliverables & SLA Watchlist */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <AlertCircle size={16} className="text-rose-500" />
                      <span>Critical Deliverables & SLA Watchlist</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      High-priority tasks requiring operational attention
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigateTo("tasks")}
                    className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                  >
                    Task Board
                  </button>
                </div>

                <div className="space-y-2.5">
                  {tasks.filter((t) => t.priority === "Critical" || t.priority === "High").slice(0, 4).map((task) => (
                    <div
                      key={task.id}
                      onClick={() => navigateTo("tasks")}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 text-xs cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                    >
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <PriorityBadge priority={task.priority} size="sm" />
                          <span className="font-bold text-slate-900 dark:text-white truncate">{task.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {task.projectName} • Assigned to {task.assigneeName}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <StatusBadge status={task.status} size="sm" />
                        <span className={`text-[10px] font-mono ${task.slaBreached ? "text-rose-500 font-bold" : "text-slate-500"}`}>
                          Due {formatDate(task.dueDate)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Revenue Velocity Chart */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <TrendingUp size={16} className="text-emerald-500" />
                      <span>Enterprise Revenue Velocity & Pipeline</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Closed revenue vs pipeline opportunities
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCommandTab("sales")}
                    className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                  >
                    Sales Deck
                  </button>
                </div>

                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={pipelineTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="pipeGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v / 100000}L`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          borderColor: "#334155",
                          borderRadius: "8px",
                          fontSize: "12px",
                          color: "#ffffff",
                        }}
                        formatter={(val: any) => [formatCurrency(Number(val)), ""]}
                      />
                      <Area type="monotone" dataKey="pipeline" name="Pipeline" stroke="#3b82f6" strokeWidth={2} fill="url(#pipeGrad)" />
                      <Area type="monotone" dataKey="revenue" name="Closed Revenue" stroke="#10b981" strokeWidth={2} fill="url(#revGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Workspace Broadcasts + Live Employee Activity Feed */}
            <div className="lg:col-span-5 space-y-6">
              {/* Workspace Broadcasts & Directives */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radio size={16} className="text-amber-500" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Workspace Directives & Posts</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Company-wide broadcasts & announcements</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsQuickPostOpen(true)}
                    className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <Plus size={12} /> Post
                  </button>
                </div>

                <div className="space-y-3">
                  {notes.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      No broadcast directives posted yet. Click "Post" to broadcast across the organization.
                    </div>
                  ) : (
                    notes.slice(0, 3).map((n) => (
                      <div
                        key={n.id}
                        className={`p-3.5 rounded-xl border text-xs space-y-2 transition-all ${
                          n.pinned
                            ? "bg-amber-500/5 border-amber-500/30"
                            : "bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-900 dark:text-white truncate text-xs flex items-center gap-1.5">
                            {n.pinned && <Pin size={12} className="text-amber-500 shrink-0" />}
                            <span>{n.title}</span>
                          </h4>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            n.targetAudience === "Employees"
                              ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          }`}>
                            {n.targetAudience || "All"}
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 text-[11px] line-clamp-2 leading-relaxed">
                          {n.content}
                        </p>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800/60 text-[10px] text-slate-500 dark:text-slate-400">
                          <span>By <strong className="text-slate-700 dark:text-slate-300">{n.authorName || "Admin"}</strong></span>
                          <span>{n.updatedAt}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setCommandTab("broadcasts")}
                  className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold text-center cursor-pointer transition-colors"
                >
                  View All Announcements ({notes.length})
                </button>
              </div>

              {/* Live Employee Security & Activity Stream */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield size={16} className="text-blue-500" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Live Employee Activity Stream</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Logins, UI clicks, navigations & logouts</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                    LIVE
                  </span>
                </div>

                <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                  {auditLogs.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No employee audit events recorded yet.
                    </div>
                  ) : (
                    auditLogs.slice(0, 6).map((log) => {
                      const act = log.action.toLowerCase();
                      const isLogin = act.includes("login");
                      const isLogout = act.includes("logout") || act.includes("exit");
                      const isClick = act.includes("click");
                      const isNav = act.includes("navigation") || act.includes("view");
                      const isClock = act.includes("clock");

                      let badgeColor = "bg-blue-500/10 text-blue-400 border-blue-500/20";
                      let Icon = Activity;
                      if (isLogin) {
                        badgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
                        Icon = LogIn;
                      } else if (isLogout) {
                        badgeColor = "bg-rose-500/10 text-rose-400 border-rose-500/30";
                        Icon = LogOut;
                      } else if (isClick) {
                        badgeColor = "bg-purple-500/10 text-purple-400 border-purple-500/30";
                        Icon = MousePointer;
                      } else if (isNav) {
                        badgeColor = "bg-sky-500/10 text-sky-400 border-sky-500/30";
                        Icon = Eye;
                      } else if (isClock) {
                        badgeColor = "bg-amber-500/10 text-amber-400 border-amber-500/30";
                        Icon = Clock;
                      }

                      return (
                        <div
                          key={log.id}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 flex items-start gap-2.5 text-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                        >
                          <div className={`p-1.5 rounded-lg border ${badgeColor} shrink-0 mt-0.5`}>
                            <Icon size={12} />
                          </div>
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-slate-900 dark:text-white truncate">{log.userName}</span>
                              <span className="text-[10px] font-mono text-slate-400 shrink-0">{log.timestamp ? log.timestamp.split("T")[1]?.slice(0, 8) || log.timestamp : ""}</span>
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded border ${badgeColor}`}>
                                {log.action}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">[{log.entityName}]</span>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-tight mt-0.5">{log.details}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setCommandTab("audit")}
                  className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold text-center cursor-pointer transition-colors"
                >
                  Open Full Employee Audit Monitor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB CONTENT: LIVE EMPLOYEE LOGS & AUDIT MONITOR */}
      {commandTab === "audit" && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Shield size={18} className="text-blue-500" />
                <span>Live Employee Activity & Security Feed</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Inspect every employee's journey: login timestamp, IP address, buttons clicked, view navigation, and logout
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigateTo("settings", "audit")}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-semibold text-xs flex items-center gap-1.5 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              <ExternalLink size={13} />
              <span>Full Audit Settings</span>
            </button>
          </div>

          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Filter by Employee:</label>
              <select
                value={cockpitAuditUserFilter}
                onChange={(e) => setCockpitAuditUserFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-semibold"
              >
                <option value="all">All Employees & Accounts ({userOptions.length} users)</option>
                {userOptions.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Event Category:</label>
              <select
                value={cockpitAuditCategory}
                onChange={(e) => setCockpitAuditCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-semibold"
              >
                <option value="all">All Categories</option>
                <option value="sessions">🔑 Logins & Logouts</option>
                <option value="clicks">🖱️ Clicks & Navigations</option>
                <option value="data">📝 Data Operations</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Search Logs:</label>
              <input
                type="text"
                value={cockpitAuditSearchQuery}
                onChange={(e) => setCockpitAuditSearchQuery(e.target.value)}
                placeholder="Search action or details..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs"
              />
            </div>
          </div>

          {/* Stream list */}
          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {filteredCockpitLogs.length === 0 ? (
              <div className="p-12 text-center text-slate-400 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                No events found matching criteria.
              </div>
            ) : (
              filteredCockpitLogs.map((log) => {
                const act = log.action.toLowerCase();
                const isLogin = act.includes("login");
                const isLogout = act.includes("logout") || act.includes("exit");
                const isClick = act.includes("click");
                const isNav = act.includes("navigation") || act.includes("view");
                const isClock = act.includes("clock");

                let badgeColor = "bg-blue-500/10 text-blue-400 border-blue-500/20";
                let Icon = Activity;
                if (isLogin) {
                  badgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
                  Icon = LogIn;
                } else if (isLogout) {
                  badgeColor = "bg-rose-500/10 text-rose-400 border-rose-500/30";
                  Icon = LogOut;
                } else if (isClick) {
                  badgeColor = "bg-purple-500/10 text-purple-400 border-purple-500/30";
                  Icon = MousePointer;
                } else if (isNav) {
                  badgeColor = "bg-sky-500/10 text-sky-400 border-sky-500/30";
                  Icon = Eye;
                } else if (isClock) {
                  badgeColor = "bg-amber-500/10 text-amber-400 border-amber-500/30";
                  Icon = Clock;
                }

                return (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:border-blue-500/40 transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <div className={`p-2 rounded-lg border ${badgeColor} shrink-0`}>
                        <Icon size={14} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white text-xs">{log.userName}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-sans">
                            {log.userRole}
                          </span>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${badgeColor}`}>
                            {log.action}
                          </span>
                          <span className="text-slate-400 font-mono text-[10px]">[{log.entityName}]</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">{log.details}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 shrink-0">{log.timestamp}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 5. TAB CONTENT: WORKSPACE BROADCASTS & DIRECTIVES */}
      {commandTab === "broadcasts" && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 text-xs">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Radio size={18} className="text-amber-500" />
                <span>Workspace Directives & Shared Broadcasts</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Announcements and operational guidance distributed across all users and employee accounts
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsQuickPostOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus size={14} /> New Announcement
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note) => (
              <div
                key={note.id}
                className={`p-5 rounded-2xl border transition-all text-xs space-y-3 flex flex-col justify-between ${
                  note.pinned
                    ? "bg-amber-500/5 border-amber-500/40 shadow-sm"
                    : "bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm tracking-tight flex items-center gap-1.5">
                      {note.pinned && <Pin size={13} className="text-amber-500 shrink-0" />}
                      <span>{note.title}</span>
                    </h4>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                      note.targetAudience === "Employees"
                        ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    }`}>
                      {note.targetAudience || "All Members"}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Posted by <strong className="text-slate-700 dark:text-slate-300">{note.authorName || "Workspace Admin"}</strong></span>
                  <span className="font-mono text-[10px]">{note.updatedAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. TAB CONTENT: PROJECTS PORTFOLIO RADAR */}
      {commandTab === "projects" && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 text-xs">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FolderKanban size={18} className="text-blue-500" />
                <span>Enterprise Projects Radar</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Portfolio health, delivery milestones, and financial burn
              </p>
            </div>
            <button
              type="button"
              onClick={() => openCreateModal("project")}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus size={14} /> New Project
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => (
              <div
                key={p.id}
                onClick={() => navigateTo("projects", "all")}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 hover:border-blue-500 transition-all cursor-pointer space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-blue-600 dark:text-blue-400 font-bold">{p.code}</span>
                  <StatusBadge status={p.health} size="sm" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{p.name}</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">{p.description || "Operational project delivery workstream."}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span>Progress</span>
                    <span>{p.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${p.progress}%` }} />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-500">
                  <span>Budget: ₹{(p.budget / 100000).toFixed(1)}L</span>
                  <span>Spent: ₹{(p.spent / 100000).toFixed(1)}L</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. TAB CONTENT: SALES & COMMERCIAL PIPELINE */}
      {commandTab === "sales" && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 text-xs">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Briefcase size={18} className="text-emerald-500" />
                <span>Commercial Pipeline & Opportunities</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Active commercial negotiations, deal stages, and realized revenue
              </p>
            </div>
            <button
              type="button"
              onClick={() => openCreateModal("deal")}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus size={14} /> New Deal
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {deals.map((d) => (
              <div
                key={d.id}
                onClick={() => navigateTo("crm", "deals")}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition-all cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(d.amount, settings?.currency || "INR", settings?.currencySymbol || "₹")}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">{d.stage}</span>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate">{d.name}</h4>
                <p className="text-slate-500 text-[11px]">{d.companyName || "Enterprise Account"}</p>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>Prob: {d.probability}%</span>
                  <span>Close: {d.expectedCloseDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. TAB CONTENT: WORKFORCE & ATTENDANCE ROSTER */}
      {commandTab === "team" && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 text-xs">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users size={18} className="text-indigo-500" />
                <span>Workforce Directory & Live Attendance Roster</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Staff capacity, attendance check-in logs, and operational assignments
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigateTo("hrm", "employees")}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus size={14} /> Full HRM Hub
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.map((emp) => (
              <div
                key={emp.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                    {(emp.fullName || emp.firstName || "E").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate">{emp.fullName || `${emp.firstName} ${emp.lastName}`}</h4>
                    <p className="text-slate-500 text-[11px] truncate">{emp.designation} • {emp.department}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 font-mono">
                  <span>Mode: <strong className="text-slate-700 dark:text-slate-300">{emp.workMode || "On-site"}</strong></span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[10px]">
                    {emp.status || "Active"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QUICK BROADCAST DIRECTIVE MODAL */}
      {isQuickPostOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Radio size={16} className="text-amber-500" />
                <span>Broadcast Workspace Directive</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsQuickPostOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleQuickPostSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Announcement Headline:
                </label>
                <input
                  type="text"
                  required
                  value={quickPostTitle}
                  onChange={(e) => setQuickPostTitle(e.target.value)}
                  placeholder="e.g. Q4 Executive Strategy Meeting / Product Launch"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Directive Details:
                </label>
                <textarea
                  rows={4}
                  required
                  value={quickPostContent}
                  onChange={(e) => setQuickPostContent(e.target.value)}
                  placeholder="Write clear instructions, schedule, or company-wide announcements..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Audience:
                  </label>
                  <select
                    value={quickPostAudience}
                    onChange={(e) => setQuickPostAudience(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-semibold"
                  >
                    <option value="All">All Members (Company-Wide)</option>
                    <option value="Employees">Employees Only</option>
                    <option value="Executives">Executives & Leadership</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 font-semibold text-xs">
                    <input
                      type="checkbox"
                      checked={quickPostPinned}
                      onChange={(e) => setQuickPostPinned(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Pin to top</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsQuickPostOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Send size={13} />
                  <span>Publish Directive</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Task Modal Drawer for Executive/Manager View */}
      {editingTask && (
        <EditTaskModal
          isOpen={!!editingTask}
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={(updated) => {
            updateTask(editingTask.id, updated);
            setEditingTask(null);
          }}
          onAddComment={addTaskComment}
          projects={projects}
          employees={employees}
        />
      )}
    </div>
  );
};

