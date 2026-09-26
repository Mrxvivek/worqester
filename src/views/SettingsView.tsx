import React, { useState, useRef } from "react";
import { useApp } from "../context/AppContext";
import {
  Shield,
  Layers,
  Database,
  History,
  Check,
  RotateCcw,
  Download,
  Upload,
  FileSpreadsheet,
  Building,
  Users,
  Plus,
  Trash2,
  Mail,
  UserCheck,
} from "lucide-react";
import { InviteUserModal } from "../components/modals/EditModals";

export const SettingsView: React.FC = () => {
  const {
    currentSubView,
    navigateTo,
    settings,
    updateSettings,
    auditLogs,
    resetToDemoData,
    currentUser,
    availableUsers,
    invitations,
    inviteUser,
    revokeInvitation,
    rbacPermissions,
    toggleRbacPermission,
    companies,
    contacts,
    leads,
    deals,
    projects,
    tasks,
    employees,
    expenses,
    assets,
    documents,
    notes,
    milestones,
    createCompany,
    createLead,
    createDeal,
    createProject,
    createTask,
    createEmployee,
    createExpense,
    createAsset,
  } = useApp();

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const activeSubView = currentSubView || "general";

  const [companyName, setCompanyName] = useState(settings?.companyName || "Worqester Technologies");
  const [tagline, setTagline] = useState(settings?.tagline || "");
  const [currency, setCurrency] = useState(settings?.currency || "INR");
  const [currencySymbol, setCurrencySymbol] = useState(settings?.currencySymbol || "₹");
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Original Data Import State
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importCategory, setImportCategory] = useState<string>("auto");
  const [importStatus, setImportStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const currentModules: Record<string, boolean> = {
    crm: true,
    projects: true,
    tasks: true,
    hrm: true,
    recruitment: true,
    attendance: true,
    expenses: true,
    assets: true,
    documents: true,
    reports: true,
    ai: true,
    automations: true,
    ...(settings?.modulesEnabled || {}),
    ...(settings?.enabledModules || {}),
  };

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      companyName,
      tagline,
      currency,
      currencySymbol,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleToggleModule = (modKey: string) => {
    const isCurrentlyEnabled = currentModules[modKey] ?? true;
    const nextModules = {
      ...currentModules,
      [modKey]: !isCurrentlyEnabled,
    };
    updateSettings({
      modulesEnabled: nextModules,
      enabledModules: nextModules as any,
    });
  };

  const exportSystemJson = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      version: "2.0.0",
      app: "Worqester",
      companies,
      contacts,
      leads,
      deals,
      projects,
      tasks,
      employees,
      expenses,
      assets,
      documents,
      notes,
      milestones,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `worqester-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const parseCsvRows = (text: string): Record<string, string>[] => {
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length < 2) return [];
    const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
    return lines.slice(1).map((line) => {
      const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => {
        obj[h] = cols[i] ?? "";
      });
      return obj;
    });
  };

  const ingestRecords = (category: string, items: any[]): number => {
    let count = 0;
    const today = new Date().toISOString().split("T")[0];
    items.forEach((item) => {
      if (category === "projects") {
        createProject({
          name: item.name || item.title || "Imported Project",
          code: item.code || `PRJ-${Math.floor(100 + Math.random() * 900)}`,
          companyId: item.companyId || companies[0]?.id,
          companyName: item.companyName || companies[0]?.name || settings?.companyName || "Organization",
          projectManagerId: currentUser.id,
          projectManagerName: item.projectManagerName || currentUser.name,
          teamMemberIds: [currentUser.id],
          startDate: item.startDate || today,
          endDate: item.endDate || today,
          priority: (item.priority as any) || "High",
          status: (item.status as any) || "In Progress",
          health: (item.health as any) || "Healthy",
          budget: Number(item.budget) || 0,
          spent: Number(item.spent) || 0,
          progress: Number(item.progress) || 0,
          description: item.description || "Imported project record.",
        });
        count++;
      } else if (category === "tasks") {
        createTask({
          title: item.title || item.name || "Imported Task",
          description: item.description || "",
          projectId: item.projectId || projects[0]?.id || "prj-default",
          projectName: item.projectName || projects[0]?.name || "General Project",
          assigneeId: currentUser.id,
          assigneeName: item.assigneeName || currentUser.name,
          reporterId: currentUser.id,
          reporterName: currentUser.name,
          priority: (item.priority as any) || "Medium",
          status: (item.status as any) || "To Do",
          labels: Array.isArray(item.labels) ? item.labels : ["Imported"],
          dueDate: item.dueDate || today,
          estimatedHours: Number(item.estimatedHours) || 8,
          actualHours: Number(item.actualHours) || 0,
        });
        count++;
      } else if (category === "employees") {
        const fullName = item.fullName || item.name || `${item.firstName || "Team"} ${item.lastName || "Member"}`.trim();
        const parts = fullName.split(" ");
        createEmployee({
          employeeNumber: item.employeeNumber || `WQ-${1000 + employees.length + count + 1}`,
          firstName: item.firstName || parts[0] || "Team",
          lastName: item.lastName || parts.slice(1).join(" ") || "Member",
          fullName,
          email: item.email || `${parts[0]?.toLowerCase() || "user"}@worqester.internal`,
          phone: item.phone || "+91 98000 00000",
          avatar: item.avatar || currentUser.avatar,
          department: item.department || "Engineering & Cloud",
          team: item.team || "Core Operations",
          designation: item.designation || item.role || "Specialist",
          location: item.location || "Headquarters",
          employmentType: (item.employmentType as any) || "Full Time",
          joiningDate: item.joiningDate || today,
          status: (item.status as any) || "Active",
          workMode: (item.workMode as any) || "Hybrid",
          skills: Array.isArray(item.skills) ? item.skills : (item.skills ? String(item.skills).split(";") : ["Operations"]),
          capacityHoursPerWeek: Number(item.capacityHoursPerWeek) || 40,
          loggedHoursThisWeek: Number(item.loggedHoursThisWeek) || 0,
          leaveBalanceDays: Number(item.leaveBalanceDays) || 18,
          salaryBasic: Number(item.salaryBasic || item.salary) || 0,
          bankAccountMasked: item.bankAccountMasked || "Bank **** 0000",
        });
        count++;
      } else if (category === "deals") {
        createDeal({
          name: item.name || item.title || "Imported Deal",
          companyId: item.companyId || companies[0]?.id || "comp-default",
          companyName: item.companyName || item.company || "Client Account",
          contactId: "cont-01",
          contactName: item.contactName || "Primary Contact",
          ownerId: currentUser.id,
          ownerName: item.ownerName || currentUser.name,
          stage: (item.stage as any) || "Qualification",
          amount: Number(item.amount || item.value) || 0,
          probability: Number(item.probability) || 50,
          expectedCloseDate: item.expectedCloseDate || today,
          priority: (item.priority as any) || "High",
          source: item.source || "Direct Import",
        });
        count++;
      } else if (category === "leads") {
        createLead({
          name: item.name || "Imported Lead",
          company: item.company || item.companyName || "Prospect Organization",
          email: item.email || "",
          phone: item.phone || "",
          industry: item.industry || "Technology",
          source: item.source || "Imported",
          ownerId: currentUser.id,
          ownerName: item.ownerName || currentUser.name,
          status: (item.status as any) || "New",
          priority: (item.priority as any) || "High",
          score: Number(item.score) || 75,
          expectedValue: Number(item.expectedValue || item.amount) || 0,
          nextFollowUp: item.nextFollowUp || today,
        });
        count++;
      } else if (category === "companies") {
        createCompany({
          name: item.name || "Imported Company",
          industry: item.industry || "Enterprise",
          website: item.website || "",
          revenue: Number(item.revenue) || 0,
          employeesCount: Number(item.employeesCount) || 50,
          country: item.country || "India",
          location: item.city || item.location || "",
          status: (item.status as any) || "Active",
          ownerName: currentUser.name,
          primaryContact: item.primaryContact || "",
          tier: (item.tier as any) || "Enterprise",
        });
        count++;
      } else if (category === "expenses") {
        createExpense({
          employeeId: currentUser.id,
          employeeName: item.employeeName || currentUser.name,
          category: (item.category as any) || "Office",
          amount: Number(item.amount) || 0,
          date: item.date || today,
          description: item.description || "Imported expense claim",
          status: (item.status as any) || "Pending",
        });
        count++;
      } else if (category === "assets") {
        createAsset({
          name: item.name || "Imported Asset",
          category: (item.category as any) || "Laptop",
          serialNumber: item.serialNumber || `SN-${Date.now()}`,
          employeeId: currentUser.id,
          assignedToName: item.assignedToName || currentUser.name,
          allocatedDate: item.purchaseDate || item.allocatedDate || today,
          status: (item.status as any) || "Assigned",
          condition: (item.condition as any) || "Good",
        });
        count++;
      }
    });
    return count;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportStatus(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = String(evt.target?.result || "");
        let totalImported = 0;

        if (file.name.toLowerCase().endsWith(".csv")) {
          const rows = parseCsvRows(text);
          const targetCat = importCategory === "auto" ? "employees" : importCategory;
          totalImported = ingestRecords(targetCat, rows);
        } else {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) {
            const targetCat = importCategory === "auto" ? "projects" : importCategory;
            totalImported = ingestRecords(targetCat, parsed);
          } else if (parsed && typeof parsed === "object") {
            const keys = ["companies", "leads", "deals", "projects", "tasks", "employees", "expenses", "assets"];
            keys.forEach((k) => {
              if (Array.isArray(parsed[k]) && parsed[k].length > 0) {
                totalImported += ingestRecords(k, parsed[k]);
              }
            });
          }
        }

        setImportStatus({
          type: "success",
          message: `Successfully uploaded and imported ${totalImported} original record(s) from "${file.name}".`,
        });
      } catch (err: any) {
        setImportStatus({
          type: "error",
          message: `Failed to parse "${file.name}": ${err?.message || "Invalid JSON/CSV format"}`,
        });
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsText(file);
  };

  const downloadSampleTemplate = () => {
    const sample = {
      companies: [
        { name: "Your Client Corp", industry: "Technology", revenue: 15000000, country: "India", status: "Active" },
      ],
      projects: [
        { name: "Q4 Production Rollout", code: "PRJ-101", budget: 2500000, spent: 0, progress: 0, priority: "High", status: "In Progress", health: "Healthy" },
      ],
      tasks: [
        { title: "Initial Architecture Setup", projectName: "Q4 Production Rollout", priority: "High", status: "To Do", dueDate: new Date().toISOString().split("T")[0], estimatedHours: 16 },
      ],
      employees: [
        { fullName: "Aarav Verma", email: "aarav@company.com", department: "Engineering & Cloud", designation: "Senior Engineer", salaryBasic: 150000 },
      ],
      deals: [
        { name: "Annual Platform License", companyName: "Your Client Corp", stage: "Proposal", amount: 1800000, probability: 70 },
      ],
      leads: [
        { name: "Neha Kapoor", company: "Global Retail Ltd", email: "neha@globalretail.com", expectedValue: 1200000 },
      ],
    };
    const blob = new Blob([JSON.stringify(sample, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "worqester-original-data-template.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Sub Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none text-xs border-b border-slate-800 pb-4">
        {[
          { id: "general", label: "Organization Profile", icon: Building },
          { id: "users", label: "Users & Invitations", icon: Users },
          { id: "modules", label: "Active Modules", icon: Layers },
          { id: "rbac", label: "RBAC Security Matrix", icon: Shield },
          { id: "audit", label: "Audit Trail Logs", icon: History },
          { id: "data", label: "Data & Persistence", icon: Database },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => navigateTo("settings", tab.id)}
              className={`px-3.5 py-2 rounded-xl font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeSubView === tab.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800/80"
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* VIEW: GENERAL SETTINGS */}
      {activeSubView === "general" && (
        <div className="max-w-2xl space-y-6">
          <form
            onSubmit={handleSaveGeneral}
            className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-sm space-y-4 text-xs"
          >
            <div>
              <h3 className="text-sm font-bold text-white">Enterprise Organization Profile</h3>
              <p className="text-xs text-slate-400">
                Configure primary identity, reporting currency, and corporate metadata
              </p>
            </div>

            {savedSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <Check size={16} />
                <span>Organization settings updated successfully!</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold">Company / Enterprise Name</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold">Corporate Tagline / Descriptor</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold">Reporting Currency Code</label>
                <select
                  value={currency}
                  onChange={(e) => {
                    setCurrency(e.target.value);
                    if (e.target.value === "INR") setCurrencySymbol("₹");
                    if (e.target.value === "USD") setCurrencySymbol("$");
                    if (e.target.value === "EUR") setCurrencySymbol("€");
                    if (e.target.value === "GBP") setCurrencySymbol("£");
                  }}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="INR">INR (Indian Rupee)</option>
                  <option value="USD">USD (US Dollar)</option>
                  <option value="EUR">EUR (Euro)</option>
                  <option value="GBP">GBP (British Pound)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold">Currency Symbol</label>
                <input
                  type="text"
                  value={currencySymbol}
                  onChange={(e) => setCurrencySymbol(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-sm transition-all"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VIEW: USERS & INVITATIONS */}
      {activeSubView === "users" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Enterprise User Management</h3>
              <p className="text-xs text-slate-400">
                Manage active platform users, credentials, and pending team workspace invitations
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsInviteOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-blue-600/20"
            >
              <Plus size={14} />
              <span>Invite Team Member</span>
            </button>
          </div>

          {/* Active Users Table */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800/80 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <UserCheck size={14} className="text-emerald-400" />
              <span>Active Workspace Members ({availableUsers.length})</span>
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                    <th className="pb-3">User</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3">Department</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {availableUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/30">
                      <td className="py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center text-xs">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-white">{u.name}</div>
                            <div className="text-[11px] text-slate-400">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-medium border border-slate-700">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 text-slate-400">{u.department || "Enterprise Core"}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold border border-emerald-500/20">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pending Invitations */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800/80 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Mail size={14} className="text-amber-400" />
              <span>Pending Invitations ({invitations.length})</span>
            </h4>
            {invitations.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No pending invitations. Click "Invite Team Member" above to invite colleagues.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                      <th className="pb-3">Email</th>
                      <th className="pb-3">Assigned Role</th>
                      <th className="pb-3">Invited By</th>
                      <th className="pb-3">Sent Date</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {invitations.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-800/30">
                        <td className="py-3 font-semibold text-white">{inv.email}</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[11px] font-medium border border-blue-500/20">
                            {inv.role}
                          </span>
                        </td>
                        <td className="py-3 text-slate-400">{inv.invitedBy}</td>
                        <td className="py-3 text-slate-400">{inv.sentDate}</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[11px] font-semibold border border-amber-500/20">
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            type="button"
                            onClick={() => revokeInvitation(inv.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Revoke Invitation"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW: MODULE TOGGLES */}
      {activeSubView === "modules" && (
        <div className="max-w-2xl space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800/80 space-y-4 text-xs">
            <div>
              <h3 className="text-sm font-bold text-white">Installed Platform Modules</h3>
              <p className="text-xs text-slate-400">
                Enable or disable operational modules based on organization maturity
              </p>
            </div>

            <div className="space-y-3">
              {[
                { key: "crm" as const, name: "Customer Relationship Management (CRM)", desc: "Deals, leads pipeline, company accounts, customer 360" },
                { key: "hrm" as const, name: "Human Resource Management (HRM)", desc: "Employee directory, attendance, leaves, recruitment ATS" },
                { key: "projects" as const, name: "Project Management & Roadmaps", desc: "Initiatives, milestone tracking, budget burn" },
                { key: "tasks" as const, name: "Task Execution & Kanban", desc: "Interactive sprint boards, SLA compliance, time tracking" },
                { key: "ai" as const, name: "Worqester AI & Automations", desc: "Autonomous briefings, smart priority, operations audits" },
              ].map((mod) => {
                const isEnabled = Boolean(currentModules[mod.key]);
                return (
                  <div
                    key={mod.key}
                    className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-white text-xs">{mod.name}</h4>
                      <p className="text-slate-400 text-[11px] mt-0.5">{mod.desc}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleModule(mod.key)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-colors ${
                        isEnabled
                          ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-slate-800 text-slate-500"
                      }`}
                    >
                      {isEnabled ? "ENABLED" : "DISABLED"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW: RBAC SECURITY MATRIX */}
      {activeSubView === "rbac" && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800/80 space-y-4 text-xs">
            <div>
              <h3 className="text-sm font-bold text-white">Role-Based Access Control (RBAC) Matrix</h3>
              <p className="text-xs text-slate-400">
                Simulated permissions and security boundaries across enterprise user roles
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                    <th className="pb-3">Permission Capability</th>
                    <th className="pb-3 text-center">Super Admin</th>
                    <th className="pb-3 text-center">Executive</th>
                    <th className="pb-3 text-center">Project Manager</th>
                    <th className="pb-3 text-center">Employee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {Object.entries(rbacPermissions).map(([capability, roles], idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30">
                      <td className="py-3 font-medium text-white">{capability}</td>
                      {(roles as boolean[]).map((granted, rIdx) => (
                        <td key={rIdx} className="py-3 text-center">
                          <button
                            type="button"
                            onClick={() => toggleRbacPermission(capability, rIdx)}
                            title={`Toggle ${capability} permission`}
                            className={`w-6 h-6 rounded-lg font-bold text-xs inline-flex items-center justify-center transition-all ${
                              granted
                                ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30"
                                : "bg-slate-800/60 text-slate-500 hover:bg-slate-800 hover:text-slate-300 border border-slate-700/40"
                            }`}
                          >
                            {granted ? "✓" : "—"}
                          </button>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: AUDIT TRAIL LOGS */}
      {activeSubView === "audit" && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800/80 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">System Security & Audit Trail</h3>
                <p className="text-xs text-slate-400">
                  Immutable log of all user CRUD operations, stage changes, and administrative actions
                </p>
              </div>
              <span className="font-mono text-xs text-slate-400">
                {auditLogs.length} Total Events
              </span>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center justify-between text-xs font-mono"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-400 font-bold">{log.userName}</span>
                      <span className="text-slate-500 font-sans">({log.userRole})</span>
                      <span className="text-emerald-400 font-bold uppercase text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10">
                        {log.action}
                      </span>
                      <span className="text-slate-300">{log.entityType}</span>
                    </div>
                    <p className="text-slate-400 text-[11px] font-sans">{log.details}</p>
                  </div>
                  <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW: DATA & PERSISTENCE */}
      {activeSubView === "data" && (
        <div className="max-w-2xl space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-sm space-y-6 text-xs">
            <div>
              <h3 className="text-sm font-bold text-white">Original Data Upload, Export & Persistence</h3>
              <p className="text-xs text-slate-400">
                Upload your organization's original data (JSON or CSV), export full workspace backups, or clear records
              </p>
            </div>

            {importStatus && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  importStatus.type === "success"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                }`}
              >
                <Check size={16} />
                <span>{importStatus.message}</span>
              </div>
            )}

            {/* Upload Original Data Card */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-bold text-white flex items-center gap-1.5">
                    <Upload size={14} className="text-emerald-400" />
                    <span>Upload Original Data (JSON or CSV)</span>
                  </h4>
                  <p className="text-slate-400 text-[11px]">
                    Import projects, tasks, employees, deals, leads, companies, expenses, or assets
                  </p>
                </div>
                <button
                  type="button"
                  onClick={downloadSampleTemplate}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <FileSpreadsheet size={13} className="text-blue-400" />
                  <span>Download Template</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
                <select
                  value={importCategory}
                  onChange={(e) => setImportCategory(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="auto">Auto-detect (Full Workspace JSON)</option>
                  <option value="projects">Projects (CSV / JSON Array)</option>
                  <option value="tasks">Tasks (CSV / JSON Array)</option>
                  <option value="employees">Employees (CSV / JSON Array)</option>
                  <option value="deals">CRM Deals (CSV / JSON Array)</option>
                  <option value="leads">CRM Leads (CSV / JSON Array)</option>
                  <option value="companies">Companies (CSV / JSON Array)</option>
                  <option value="expenses">Expenses (CSV / JSON Array)</option>
                  <option value="assets">Assets (CSV / JSON Array)</option>
                </select>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Upload size={14} />
                  <span>Select & Upload File (.json / .csv)</span>
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white">Full JSON Export</h4>
                <p className="text-slate-400 text-[11px]">Download all current records, pipeline deals, projects, tasks, and employees</p>
              </div>
              <button
                type="button"
                onClick={exportSystemJson}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Download size={14} />
                <span>Export JSON</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-rose-400">Clear All Workspace Records</h4>
                <p className="text-slate-400 text-[11px]">
                  Remove all projects, tasks, deals, leads, and employee records to reset to a blank workspace
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (confirm("Clear all workspace records and reset to a blank database?")) {
                    resetToDemoData();
                  }
                }}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw size={14} />
                <span>Clear All Data</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite User Modal */}
      <InviteUserModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onInvite={inviteUser}
      />
    </div>
  );
};
