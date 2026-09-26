import { DatabaseAdapter, generateSalt, hashPassword } from "./db";

export async function seedDatabase(db: DatabaseAdapter, isAutoSeed = false): Promise<void> {
  const startTime = Date.now();
  if (!isAutoSeed) {
    console.log("[Seed] Target Database: " + (db.isPostgres() ? "PostgreSQL" : "SQLite"));
  }

  const now = new Date().toISOString();
  const workspaceId = "org-worqester-01";

  // 1. Workspace
  if (!isAutoSeed) console.log("[Seed] Initializing primary tenant workspace...");
  await db.execute(
    "INSERT OR IGNORE INTO workspaces (id, name, slug, plan, created_at) VALUES (?, ?, ?, ?, ?)",
    [workspaceId, "Worqester Technologies", "worqester", "Enterprise Cloud", now]
  );

  // 2. Users (PBKDF2-HMAC-SHA256 with 600k iterations)
  if (!isAutoSeed) console.log("[Seed] Initializing authentication accounts...");
  const defaultPassword = "password123";
  const users = [
    {
      id: "usr-01",
      name: "Alex Vance",
      email: "alex.vance@worqester.internal",
      role: "Super Admin",
      department: "Executive",
      job_title: "Chief Executive Officer",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
    {
      id: "usr-02",
      name: "Priya Sharma",
      email: "priya.sharma@worqester.internal",
      role: "Executive",
      department: "Operations",
      job_title: "Chief Operating Officer",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    },
    {
      id: "usr-03",
      name: "Marcus Reed",
      email: "marcus.reed@worqester.internal",
      role: "Project Manager",
      department: "Engineering",
      job_title: "VP of Engineering",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    },
    {
      id: "usr-04",
      name: "Elena Rostova",
      email: "elena.rostova@worqester.internal",
      role: "HR Manager",
      department: "People & Talent",
      job_title: "Head of People & Culture",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    },
    {
      id: "usr-05",
      name: "Vikram Patel",
      email: "vikram.patel@worqester.internal",
      role: "Employee",
      department: "Engineering",
      job_title: "Staff Cloud Architect",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    },
  ];

  for (const u of users) {
    const salt = generateSalt();
    const hash = hashPassword(defaultPassword, salt);
    await db.execute(
      `INSERT OR REPLACE INTO users (id, workspace_id, name, email, avatar, role, department, job_title, salt, password_hash, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [u.id, workspaceId, u.name, u.email, u.avatar, u.role, u.department, u.job_title, salt, hash, now]
    );
  }

  // 3. RBAC Matrix
  if (!isAutoSeed) console.log("[Seed] Initializing role-based access control capabilities...");
  const rbacCapabilities = [
    { cap: "View Enterprise Dashboard & KPIs", super: 1, exec: 1, pm: 1, emp: 1 },
    { cap: "Create & Edit CRM Deals / Accounts", super: 1, exec: 1, pm: 1, emp: 0 },
    { cap: "Manage Employee Profiles & Salaries", super: 1, exec: 0, pm: 0, emp: 0 },
    { cap: "Approve / Reject Leave Requests", super: 1, exec: 1, pm: 1, emp: 0 },
    { cap: "Manage Project Budgets & Roadmaps", super: 1, exec: 1, pm: 1, emp: 0 },
    { cap: "Execute AI Operations Audit", super: 1, exec: 1, pm: 1, emp: 0 },
    { cap: "Mark Personal Daily Attendance", super: 1, exec: 1, pm: 1, emp: 1 },
    { cap: "Access Organization System Settings", super: 1, exec: 0, pm: 0, emp: 0 },
  ];
  for (const r of rbacCapabilities) {
    await db.execute(
      `INSERT OR REPLACE INTO rbac_permissions (workspace_id, capability, super_admin, executive, project_manager, employee, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [workspaceId, r.cap, r.super, r.exec, r.pm, r.emp, now]
    );
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  if (!isAutoSeed) {
    console.log(`\n[Seed] SUCCESS: Clean workspace initialized in ${duration}s (no demo business records).`);
    console.log(`[Seed] Default Admin Login: alex.vance@worqester.internal / ${defaultPassword}`);
  }
}
