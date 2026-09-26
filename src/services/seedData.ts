import {
  Company,
  Contact,
  Lead,
  Deal,
  Project,
  Task,
  Employee,
  Department,
  AttendanceRecord,
  LeaveRequest,
  Candidate,
  JobPosition,
  Expense,
  Asset,
  DocumentItem,
  NoteItem,
  ActivityItem,
  AuditLogItem,
  AutomationRule,
  SystemSettings,
  User,
  Milestone,
  UserInvitation,
} from "../types";

export const initialUsers: User[] = [
  {
    id: "usr-01",
    name: "Alex Vance",
    email: "alex.vance@worqester.internal",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    role: "Admin",
    department: "Executive Management",
    jobTitle: "Chief Operations Officer",
    organizationId: "org-worqester-01",
  },
  {
    id: "usr-02",
    name: "Priya Sharma",
    email: "priya.sharma@worqester.internal",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    role: "HR Manager",
    department: "Human Resources",
    jobTitle: "Head of People & Culture",
    organizationId: "org-worqester-01",
  },
  {
    id: "usr-03",
    name: "Marcus Reed",
    email: "marcus.reed@worqester.internal",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    role: "Sales Manager",
    department: "Sales & Revenue",
    jobTitle: "Director of Enterprise Sales",
    organizationId: "org-worqester-01",
  },
  {
    id: "usr-04",
    name: "Elena Rostova",
    email: "elena.rostova@worqester.internal",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    role: "Project Manager",
    department: "Engineering",
    jobTitle: "Principal Technical Program Manager",
    organizationId: "org-worqester-01",
  },
  {
    id: "usr-05",
    name: "Vikram Patel",
    email: "vikram.patel@worqester.internal",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    role: "Employee",
    department: "Engineering",
    jobTitle: "Lead Full Stack Engineer",
    organizationId: "org-worqester-01",
  },
];

export const initialSettings: SystemSettings = {
  companyName: "Worqester Technologies",
  tagline: "Manage Customers. People. Projects. Growth.",
  currency: "INR",
  currencySymbol: "₹",
  timezone: "Asia/Kolkata (IST, UTC+5:30)",
  theme: "dark",
  enabledModules: {
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
  },
  modulesEnabled: {
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
  },
};

export const initialCompanies: Company[] = [];

export const initialContacts: Contact[] = [];

export const initialLeads: Lead[] = [];

export const initialDeals: Deal[] = [];

export const initialProjects: Project[] = [];

export const initialTasks: Task[] = [];

export const initialDepartments: Department[] = [
  {
    id: "dept-01",
    name: "Engineering & Cloud",
    headName: "Unassigned",
    headEmail: "",
    location: "Headquarters",
    budget: 0,
    employeeCount: 0,
    description: "Core cloud infrastructure, backend APIs, frontend client systems, and DevOps.",
  },
  {
    id: "dept-02",
    name: "Sales & Strategic Partnerships",
    headName: "Unassigned",
    headEmail: "",
    location: "Headquarters",
    budget: 0,
    employeeCount: 0,
    description: "Enterprise accounts, outbound expansion, solution architecture, and customer pipeline.",
  },
  {
    id: "dept-03",
    name: "Human Resources & Talent",
    headName: "Unassigned",
    headEmail: "",
    location: "Headquarters",
    budget: 0,
    employeeCount: 0,
    description: "Talent acquisition, employee experience, compensation & benefits, and compliance.",
  },
  {
    id: "dept-04",
    name: "Product & UX Design",
    headName: "Unassigned",
    headEmail: "",
    location: "Headquarters",
    budget: 0,
    employeeCount: 0,
    description: "Product roadmap, user research, interaction design, and design systems.",
  },
  {
    id: "dept-05",
    name: "Finance & Operations",
    headName: "Unassigned",
    headEmail: "",
    location: "Headquarters",
    budget: 0,
    employeeCount: 0,
    description: "Financial governance, budgeting, audit, billing, and organizational operations.",
  },
];

export const initialEmployees: Employee[] = [];

export const initialAttendance: AttendanceRecord[] = [];

export const initialLeaveRequests: LeaveRequest[] = [];

export const initialJobPositions: JobPosition[] = [];

export const initialCandidates: Candidate[] = [];

export const initialExpenses: Expense[] = [];

export const initialAssets: Asset[] = [];

export const initialDocuments: DocumentItem[] = [];

export const initialNotes: NoteItem[] = [];

export const initialActivities: ActivityItem[] = [];

export const initialAuditLogs: AuditLogItem[] = [];

export const initialAutomations: AutomationRule[] = [];

export const initialMilestones: Milestone[] = [];

export const initialInvitations: UserInvitation[] = [];
