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
  const users: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    department: string;
    job_title: string;
    avatar: string;
    password?: string;
    eId?: string;
  }> = [
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
    {
      id: "usr-soxit-01",
      eId: "o170917",
      name: "Yenduri Hima Sai Sri",
      email: "Yhima17@soxit.org",
      password: "Yhima17@soxit.org",
      role: "Employee",
      department: "QA | DM",
      job_title: "QA | DM",
      avatar: "https://ui-avatars.com/api/?name=Yenduri+Hima+Sai+Sri&background=2563eb&color=fff&bold=true",
    },
    {
      id: "usr-soxit-02",
      eId: "o170918",
      name: "Dupuguntla Phani Kumar",
      email: "Dphan18@soxit.org",
      password: "Dphan18@soxit.org",
      role: "Employee",
      department: "SDE",
      job_title: "SDE",
      avatar: "https://ui-avatars.com/api/?name=Dupuguntla+Phani+Kumar&background=2563eb&color=fff&bold=true",
    },
    {
      id: "usr-soxit-03",
      eId: "o170919",
      name: "Mutchi Jyothi",
      email: "Mjyot19@soxit.org",
      password: "Mjyot19@soxit.org",
      role: "Employee",
      department: "SDE-FE",
      job_title: "SDE-FE",
      avatar: "https://ui-avatars.com/api/?name=Mutchi+Jyothi&background=2563eb&color=fff&bold=true",
    },
    {
      id: "usr-soxit-04",
      eId: "o170920",
      name: "Koraganji Lavanya",
      email: "Klava20@soxit.org",
      password: "Klava20@soxit.org",
      role: "Employee",
      department: "SDE-FE | DM",
      job_title: "SDE-FE | DM",
      avatar: "https://ui-avatars.com/api/?name=Koraganji+Lavanya&background=2563eb&color=fff&bold=true",
    },
    {
      id: "usr-soxit-05",
      eId: "o170821",
      name: "Gollapalli Bhanu Prasad",
      email: "Gbhan21@soxit.org",
      password: "Gbhan21@soxit.org",
      role: "Employee",
      department: "SDE",
      job_title: "SDE",
      avatar: "https://ui-avatars.com/api/?name=Gollapalli+Bhanu+Prasad&background=2563eb&color=fff&bold=true",
    },
    {
      id: "usr-soxit-06",
      eId: "o170922",
      name: "Paila Ganesh",
      email: "Pgane22@soxit.org",
      password: "Pgane22@soxit.org",
      role: "Employee",
      department: "BA",
      job_title: "BA",
      avatar: "https://ui-avatars.com/api/?name=Paila+Ganesh&background=2563eb&color=fff&bold=true",
    },
    {
      id: "usr-soxit-07",
      eId: "o170923",
      name: "Koduru Dinesh Sree Sai Bhagavan Krishna",
      email: "Kdine23@soxit.org",
      password: "Kdine23@soxit.org",
      role: "Employee",
      department: "SDE",
      job_title: "SDE",
      avatar: "https://ui-avatars.com/api/?name=Koduru+Dinesh&background=2563eb&color=fff&bold=true",
    },
    {
      id: "usr-soxit-08",
      eId: "o170924",
      name: "PATHAN MUSTAQ ALIKHAN",
      email: "pmust24@soxit.org",
      password: "pmust24@soxit.org",
      role: "Employee",
      department: "QA | DM",
      job_title: "QA | DM",
      avatar: "https://ui-avatars.com/api/?name=Pathan+Mustaq+Alikhan&background=2563eb&color=fff&bold=true",
    },
    {
      id: "usr-soxit-09",
      eId: "o170925",
      name: "Siram Anusha",
      email: "sanus25@soxit.org",
      password: "sanus25@soxit.org",
      role: "Employee",
      department: "SDE-FE",
      job_title: "SDE-FE",
      avatar: "https://ui-avatars.com/api/?name=Siram+Anusha&background=2563eb&color=fff&bold=true",
    },
    {
      id: "usr-soxit-10",
      eId: "o170926",
      name: "Kancharla Sai Vivek",
      email: "ksaiv26@soxit.org",
      password: "ksaiv26@soxit.org",
      role: "Employee",
      department: "SDE",
      job_title: "SDE",
      avatar: "https://ui-avatars.com/api/?name=Kancharla+Sai+Vivek&background=2563eb&color=fff&bold=true",
    },
  ];

  for (const u of users) {
    const existingUsers = await db.query<{ id: string }>("SELECT id FROM users WHERE id = ?", [u.id]);
    if (existingUsers.length === 0) {
      const salt = generateSalt();
      const rawPassword = u.password || defaultPassword;
      const hash = hashPassword(rawPassword, salt);
      await db.execute(
        `INSERT OR REPLACE INTO users (id, workspace_id, name, email, avatar, role, department, job_title, salt, password_hash, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [u.id, workspaceId, u.name, u.email, u.avatar, u.role, u.department, u.job_title, salt, hash, now]
      );
    }

    if (u.eId) {
      const empId = u.id.replace("usr-", "emp-");
      const existingEmp = await db.query<{ id: string; personal_email: string }>(
        "SELECT id, personal_email FROM employees WHERE id = ? OR (workspace_id = ? AND employee_number = ?)",
        [empId, workspaceId, u.eId]
      );
      if (existingEmp.length === 0) {
        await db.execute(
          `INSERT INTO employees (id, workspace_id, user_id, full_name, email, work_email, personal_email, employee_number, e_id, department, designation, team, status, salary_basic, bank_account_masked, work_mode, location, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            empId,
            workspaceId,
            u.id,
            u.name,
            u.email,
            u.email,
            "",
            u.eId,
            u.eId,
            "Engineering & Cloud",
            u.job_title,
            u.department,
            "Active",
            0,
            "Bank **** 0000",
            "On-site",
            "Headquarters",
            now,
            now,
          ]
        );
      } else {
        await db.execute(
          `UPDATE employees SET e_id = COALESCE(NULLIF(e_id, ''), employee_number),
                                work_email = COALESCE(NULLIF(work_email, ''), email),
                                team = COALESCE(NULLIF(team, ''), designation)
           WHERE id = ?`,
          [existingEmp[0].id]
        );
      }
    }
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
