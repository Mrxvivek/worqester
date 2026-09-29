import React, { useState } from "react";
import { Modal } from "../common/Modal";
import { useApp } from "../../context/AppContext";

export const GlobalCreateModal: React.FC = () => {
  const {
    isCreateModalOpen,
    closeCreateModal,
    createModalType,
    createLead,
    createDeal,
    createProject,
    createTask,
    createCompany,
    createEmployee,
    createLeaveRequest,
    createExpense,
    createNote,
    currentUser,
    companies,
    projects,
    departments,
    employees,
    modalPrefill,
  } = useApp();

  // Tab switcher inside modal
  const [activeType, setActiveType] = useState(createModalType || "task");

  // Keep in sync with opened modal type
  React.useEffect(() => {
    if (createModalType) setActiveType(createModalType);
    if (modalPrefill?.projectId) {
      setTaskProjectId(modalPrefill.projectId);
    }
    if (modalPrefill?.dueDate) {
      setTaskDueDate(modalPrefill.dueDate);
    }
    if (modalPrefill?.title) {
      setTaskTitle(modalPrefill.title);
    }
  }, [createModalType, modalPrefill]);

  // Lead Form State
  const [leadName, setLeadName] = useState("");
  const [leadCompany, setLeadCompany] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadExpectedValue, setLeadExpectedValue] = useState(2500000);
  const [leadIndustry, setLeadIndustry] = useState("Software & Cloud");

  // Deal Form State
  const [dealName, setDealName] = useState("");
  const [dealCompanyId, setDealCompanyId] = useState(companies[0]?.id || "");
  const [dealAmount, setDealAmount] = useState(4500000);
  const [dealStage, setDealStage] = useState<any>("New");
  const [dealExpectedClose, setDealExpectedClose] = useState(
    () => new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0]
  );

  // Project Form State
  const [projectName, setProjectName] = useState("");
  const [projectCode, setProjectCode] = useState(`PRJ-${new Date().getFullYear()}`);
  const [projectBudget, setProjectBudget] = useState(5000000);
  const [projectPriority, setProjectPriority] = useState<any>("High");
  const [projectDesc, setProjectDesc] = useState("");

  // Task Form State
  const [taskTitle, setTaskTitle] = useState("");
  const [taskProjectId, setTaskProjectId] = useState(projects[0]?.id || "");
  const [taskAssigneeId, setTaskAssigneeId] = useState(currentUser.id);
  const [taskPriority, setTaskPriority] = useState<any>("High");
  const [taskDueDate, setTaskDueDate] = useState(
    () => new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0]
  );
  const [taskHours, setTaskHours] = useState(16);

  // Employee Form State
  const [empEId, setEmpEId] = useState("");
  const [empFirstName, setEmpFirstName] = useState("");
  const [empLastName, setEmpLastName] = useState("");
  const [empEmail, setEmpEmail] = useState("");
  const [empPersonalEmail, setEmpPersonalEmail] = useState("");
  const [empDesignation, setEmpDesignation] = useState("SDE");
  const [empDept, setEmpDept] = useState(departments[0]?.name || "Engineering & Cloud");

  // Leave Form State
  const [leaveType, setLeaveType] = useState<any>("Casual");
  const [leaveDays, setLeaveDays] = useState(2);
  const [leaveReason, setLeaveReason] = useState("");

  // Expense Form State
  const [expCategory, setExpCategory] = useState<any>("Travel");
  const [expAmount, setExpAmount] = useState(5000);
  const [expDesc, setExpDesc] = useState("");

  // Note Form State
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeType === "lead") {
      createLead({
        name: leadName || "New Lead Contact",
        company: leadCompany || "Enterprise Prospect Ltd",
        email: leadEmail || "contact@prospect.demo",
        phone: leadPhone || "+91 98765 00000",
        industry: leadIndustry,
        source: "Direct Web Request",
        ownerId: currentUser.id,
        ownerName: currentUser.name,
        status: "New",
        priority: "High",
        score: 75,
        expectedValue: Number(leadExpectedValue) || 2000000,
        nextFollowUp: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      });
    } else if (activeType === "deal") {
      let selectedComp = companies.find((c) => c.id === dealCompanyId) || companies[0];
      if (!selectedComp) {
        // Auto-provision initial company if workspace has zero companies
        const defaultCompany = {
          name: leadCompany || "Primary Enterprise Account",
          industry: "Technology",
          revenue: 10000000,
          employeesCount: 50,
          country: "India",
          status: "Active" as const,
          primaryContact: currentUser.name,
          tier: "Tier 1" as const,
        };
        createCompany(defaultCompany);
        selectedComp = {
          id: "comp-default",
          name: defaultCompany.name,
          ...defaultCompany,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          organizationId: currentUser.organizationId || "org-01",
        };
      }
      createDeal({
        name: dealName || "Enterprise Platform Expansion Deal",
        companyId: selectedComp?.id || "comp-default",
        companyName: selectedComp?.name || "Primary Enterprise Account",
        contactId: "cont-01",
        contactName: "Lead Stakeholder",
        ownerId: currentUser.id,
        ownerName: currentUser.name,
        stage: dealStage,
        amount: Number(dealAmount) || 3000000,
        probability: dealStage === "Closed Won" ? 100 : 50,
        expectedCloseDate: dealExpectedClose || new Date().toISOString().split("T")[0],
        priority: "High",
        source: "Inbound Expansion",
      });
    } else if (activeType === "project") {
      createProject({
        name: projectName || "Strategic Initiative Project",
        code: projectCode || `PRJ-${Date.now().toString().slice(-4)}`,
        projectManagerId: currentUser.id,
        projectManagerName: currentUser.name,
        teamMemberIds: [currentUser.id],
        startDate: new Date().toISOString().split("T")[0],
        endDate: "2026-12-31",
        priority: projectPriority,
        status: "In Progress",
        health: "Healthy",
        budget: Number(projectBudget) || 4000000,
        spent: 0,
        progress: 0,
        description: projectDesc || "Initiated from executive dashboard.",
      });
    } else if (activeType === "task") {
      let selectedProj = projects.find((p) => p.id === taskProjectId) || projects[0];
      if (!selectedProj) {
        // Auto-provision default project if workspace has zero projects
        const defaultProjData = {
          name: "Core Operational Deliverables",
          code: "PRJ-CORE",
          projectManagerId: currentUser.id,
          projectManagerName: currentUser.name,
          teamMemberIds: [currentUser.id],
          startDate: new Date().toISOString().split("T")[0],
          endDate: "2026-12-31",
          priority: "High" as const,
          status: "In Progress" as const,
          health: "Healthy" as const,
          budget: 2500000,
          spent: 0,
          progress: 0,
          description: "Default workspace operational project container.",
        };
        selectedProj = createProject(defaultProjData);
      }
      const selectedUser = employees.find((e) => e.id === taskAssigneeId) || employees[0];
      createTask({
        title: taskTitle || "Execute Deliverable Milestones",
        description: "Task created from quick action modal.",
        projectId: selectedProj?.id || "prj-default",
        projectName: selectedProj?.name || "Core Operational Deliverables",
        assigneeId: selectedUser?.id || currentUser.id,
        assigneeName: selectedUser?.fullName || currentUser.name,
        assigneeAvatar: selectedUser?.avatar || currentUser.avatar,
        reporterId: currentUser.id,
        reporterName: currentUser.name,
        priority: taskPriority,
        status: "To Do",
        labels: ["Core", "SLA-Active"],
        dueDate: taskDueDate || new Date().toISOString().split("T")[0],
        estimatedHours: Number(taskHours) || 8,
        actualHours: 0,
      });
    } else if (activeType === "employee") {
      const eIdVal = empEId.trim() || `o${170917 + employees.length}`;
      const fullNameVal = `${empFirstName.trim() || "New"} ${empLastName.trim() || "Employee"}`.trim();
      const workEmailVal = empEmail.trim() || `${eIdVal}@soxit.org`;
      createEmployee({
        employeeNumber: eIdVal,
        eId: eIdVal,
        firstName: empFirstName.trim() || "New",
        lastName: empLastName.trim() || "Employee",
        fullName: fullNameVal,
        email: workEmailVal,
        workEmail: workEmailVal,
        personalEmail: empPersonalEmail.trim(),
        phone: "+91 98000 00000",
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullNameVal)}&background=2563eb&color=fff&bold=true`,
        department: empDept,
        team: empDesignation || "SDE",
        designation: empDesignation || "SDE",
        location: "Headquarters",
        employmentType: "Full Time",
        joiningDate: new Date().toISOString().split("T")[0],
        status: "Active",
        workMode: "On-site",
        skills: [empDesignation || "SDE"],
        capacityHoursPerWeek: 40,
        loggedHoursThisWeek: 0,
        leaveBalanceDays: 18,
        salaryBasic: 0,
        bankAccountMasked: "Bank **** 0000",
      });
    } else if (activeType === "leave") {
      createLeaveRequest({
        employeeId: currentUser.id,
        employeeName: currentUser.name,
        type: leaveType,
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0],
        days: Number(leaveDays) || 2,
        reason: leaveReason || "Personal rest and errands.",
        approverName: "Elena Rostova",
        status: "Pending",
      });
    } else if (activeType === "expense") {
      createExpense({
        employeeId: currentUser.id,
        employeeName: currentUser.name,
        category: expCategory,
        amount: Number(expAmount) || 2500,
        date: new Date().toISOString().split("T")[0],
        description: expDesc || "Business operational expenditure.",
        status: "Pending",
      });
    } else if (activeType === "note") {
      createNote({
        title: noteTitle || "Meeting Takeaways & Action Points",
        content: noteContent || "Reviewed deliverables with team. Follow up scheduled for next sprint.",
        tags: ["Executive", "Internal"],
        pinned: false,
      });
    }

    closeCreateModal();
  };

  return (
    <Modal
      isOpen={isCreateModalOpen}
      onClose={closeCreateModal}
      title="Create New Entity"
      subtitle="Unified business item generation with immediate persistence & audit trail"
      maxWidth="2xl"
    >
      {/* Entity Selector Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 text-xs mb-5 scrollbar-none">
        {[
          { id: "task", label: "Task" },
          { id: "lead", label: "Lead" },
          { id: "deal", label: "Deal" },
          { id: "project", label: "Project" },
          { id: "employee", label: "Employee" },
          { id: "leave", label: "Leave" },
          { id: "expense", label: "Expense" },
          { id: "note", label: "Note" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveType(tab.id)}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
              activeType === tab.id
                ? "bg-blue-600 text-white shadow-sm font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* TASK FORM */}
        {activeType === "task" && (
          <>
            <div>
              <label className="block text-slate-700 dark:text-slate-200 font-semibold mb-1">
                Task Title *
              </label>
              <input
                type="text"
                required
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="e.g. Implement Kafka telemetry consumers for real-time fleet"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-semibold mb-1">
                  Project *
                </label>
                <select
                  value={taskProjectId}
                  onChange={(e) => setTaskProjectId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                >
                  {projects.length === 0 ? (
                    <option value="">(Auto-create Core Operational Project)</option>
                  ) : (
                    projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-semibold mb-1">
                  Assignee
                </label>
                <select
                  value={taskAssigneeId}
                  onChange={(e) => setTaskAssigneeId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                >
                  {employees.length === 0 ? (
                    <option value={currentUser.id}>
                      {currentUser.name} ({currentUser.role})
                    </option>
                  ) : (
                    employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.fullName} ({e.designation})
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-semibold mb-1">
                  Priority
                </label>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="Critical">Critical (P0)</option>
                  <option value="High">High (P1)</option>
                  <option value="Medium">Medium (P2)</option>
                  <option value="Low">Low (P3)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-semibold mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-semibold mb-1">
                  Est. Hours
                </label>
                <input
                  type="number"
                  value={taskHours}
                  onChange={(e) => setTaskHours(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </>
        )}

        {/* LEAD FORM */}
        {activeType === "lead" && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-semibold mb-1">
                  Lead Name *
                </label>
                <input
                  type="text"
                  required
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  placeholder="e.g. Alok Singhania"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-semibold mb-1">
                  Company / Organization *
                </label>
                <input
                  type="text"
                  required
                  value={leadCompany}
                  onChange={(e) => setLeadCompany(e.target.value)}
                  placeholder="e.g. Apex Global Systems"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-semibold mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)}
                  placeholder="alok@apexglobal.demo"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-semibold mb-1">
                  Expected Deal Value (₹)
                </label>
                <input
                  type="number"
                  value={leadExpectedValue}
                  onChange={(e) => setLeadExpectedValue(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </>
        )}

        {/* DEAL FORM */}
        {activeType === "deal" && (
          <>
            <div>
              <label className="block text-slate-700 dark:text-slate-200 font-semibold mb-1">
                Deal Name *
              </label>
              <input
                type="text"
                required
                value={dealName}
                onChange={(e) => setDealName(e.target.value)}
                placeholder="e.g. Enterprise Cloud Modernization Contract"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-semibold mb-1">
                  Target Account (Company)
                </label>
                <select
                  value={dealCompanyId}
                  onChange={(e) => setDealCompanyId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                >
                  {companies.length === 0 ? (
                    <option value="">(Auto-create Primary Enterprise Account)</option>
                  ) : (
                    companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-semibold mb-1">
                  Deal Value (₹)
                </label>
                <input
                  type="number"
                  value={dealAmount}
                  onChange={(e) => setDealAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-semibold mb-1">
                  Pipeline Stage
                </label>
                <select
                  value={dealStage}
                  onChange={(e) => setDealStage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="New">New</option>
                  <option value="Qualification">Qualification</option>
                  <option value="Discovery">Discovery</option>
                  <option value="Proposal">Proposal</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Closed Won">Closed Won</option>
                  <option value="Closed Lost">Closed Lost</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-semibold mb-1">
                  Expected Close Date
                </label>
                <input
                  type="date"
                  value={dealExpectedClose}
                  onChange={(e) => setDealExpectedClose(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </>
        )}

        {/* PROJECT FORM */}
        {activeType === "project" && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-slate-700 dark:text-slate-200 font-semibold mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. NextGen Microservices Refactor"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-semibold mb-1">
                  Project Code
                </label>
                <input
                  type="text"
                  value={projectCode}
                  onChange={(e) => setProjectCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-semibold mb-1">
                  Allocated Budget (₹)
                </label>
                <input
                  type="number"
                  value={projectBudget}
                  onChange={(e) => setProjectBudget(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-semibold mb-1">
                  Priority
                </label>
                <select
                  value={projectPriority}
                  onChange={(e) => setProjectPriority(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-200 font-semibold mb-1">
                Description & Scope
              </label>
              <textarea
                rows={3}
                value={projectDesc}
                onChange={(e) => setProjectDesc(e.target.value)}
                placeholder="Key deliverables, timeline expectations, architectural objectives..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </>
        )}

        {/* EMPLOYEE FORM */}
        {activeType === "employee" && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-semibold mb-1">
                  eID (Employee ID) *
                </label>
                <input
                  type="text"
                  required
                  value={empEId}
                  onChange={(e) => setEmpEId(e.target.value)}
                  placeholder="e.g. o170917"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-semibold mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={empFirstName}
                  onChange={(e) => setEmpFirstName(e.target.value)}
                  placeholder="e.g. Yenduri"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-semibold mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={empLastName}
                  onChange={(e) => setEmpLastName(e.target.value)}
                  placeholder="e.g. Hima Sai Sri"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-semibold mb-1">
                  Work Mail *
                </label>
                <input
                  type="email"
                  required
                  value={empEmail}
                  onChange={(e) => setEmpEmail(e.target.value)}
                  placeholder="e.g. Yhima17@soxit.org"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-semibold mb-1">
                  Personal Mail
                </label>
                <input
                  type="email"
                  value={empPersonalEmail}
                  onChange={(e) => setEmpPersonalEmail(e.target.value)}
                  placeholder="e.g. personal@gmail.com"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors font-mono"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-semibold mb-1">
                  Team / Designation
                </label>
                <input
                  type="text"
                  value={empDesignation}
                  onChange={(e) => setEmpDesignation(e.target.value)}
                  placeholder="e.g. SDE, SDE-FE, QA | DM, BA"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-semibold mb-1">
                  Department
                </label>
                <select
                  value={empDept}
                  onChange={(e) => setEmpDept(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}

        {/* LEAVE FORM */}
        {activeType === "leave" && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-semibold mb-1">
                  Leave Category
                </label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="Casual">Casual Leave</option>
                  <option value="Sick">Sick Leave</option>
                  <option value="Annual">Annual / Privilege</option>
                  <option value="Maternity">Maternity</option>
                  <option value="Unpaid">Unpaid Leave</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-semibold mb-1">
                  Number of Days
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={leaveDays}
                  onChange={(e) => setLeaveDays(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-200 font-semibold mb-1">
                Reason
              </label>
              <textarea
                rows={2}
                value={leaveReason}
                onChange={(e) => setLeaveReason(e.target.value)}
                placeholder="Provide brief context for approving manager..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </>
        )}

        {/* EXPENSE FORM */}
        {activeType === "expense" && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-semibold mb-1">
                  Expense Category
                </label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="Travel">Travel & Transit</option>
                  <option value="Food">Food & Meals</option>
                  <option value="Client Meeting">Client Entertainment</option>
                  <option value="Software">Software & Cloud Licenses</option>
                  <option value="Office">Office Supplies</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-semibold mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={expAmount}
                  onChange={(e) => setExpAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-200 font-semibold mb-1">
                Description & Purpose
              </label>
              <input
                type="text"
                value={expDesc}
                onChange={(e) => setExpDesc(e.target.value)}
                placeholder="Dinner with Acme CTO / flight to Mumbai client office"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </>
        )}

        {/* NOTE FORM */}
        {activeType === "note" && (
          <>
            <div>
              <label className="block text-slate-700 dark:text-slate-200 font-semibold mb-1">
                Note Title *
              </label>
              <input
                type="text"
                required
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="e.g. Q4 Executive Strategy Sync"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-200 font-semibold mb-1">
                Content
              </label>
              <textarea
                rows={4}
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Record notes, action items, dependencies..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={closeCreateModal}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all active:scale-95 cursor-pointer"
          >
            Create {activeType.charAt(0).toUpperCase() + activeType.slice(1)}
          </button>
        </div>
      </form>
    </Modal>
  );
};
