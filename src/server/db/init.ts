import db from "./connection";

// Create Users table
db.exec(
  `
  PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS status_master (
  status_id INTEGER PRIMARY KEY AUTOINCREMENT,
  status_name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS project_master (
  project_id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  contractor_name TEXT,
  address TEXT NOT NULL,
  type_of_work INTEGER NOT NULL,
  status INTEGER NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT,
  FOREIGN KEY (status) REFERENCES status_master(status_id)
);

CREATE TABLE IF NOT EXISTS employee_master (
  employee_id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_name TEXT NOT NULL,
  employee_type INTEGER NOT NULL,
  salary INTEGER NOT NULL,
  contact_number TEXT,
  status INTEGER NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT,
  FOREIGN KEY (status) REFERENCES status_master(status_id)
);

CREATE TABLE IF NOT EXISTS credit_master (
  credit_id INTEGER PRIMARY KEY AUTOINCREMENT,
  credit_amount INTEGER NOT NULL,
  project_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  pay_by TEXT NOT NULL,
  status INTEGER NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT,
  FOREIGN KEY (project_id) REFERENCES project_master(project_id),
  FOREIGN KEY (status) REFERENCES status_master(status_id)
);

CREATE TABLE IF NOT EXISTS debit_master (
  debit_id INTEGER PRIMARY KEY AUTOINCREMENT,
  debit_amount INTEGER NOT NULL,
  project_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  date TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT,
  FOREIGN KEY (project_id) REFERENCES project_master(project_id)
);

CREATE TABLE IF NOT EXISTS attendance_master (
  attendance_id INTEGER PRIMARY KEY AUTOINCREMENT,
  attendance_details TEXT NOT NULL,
  overtime_details TEXT NOT NULL,
  date TEXT NOT NULL,
  project_id INTEGER NOT NULL,
  FOREIGN KEY (project_id) REFERENCES project_master(project_id)
);
`,
);

// You can add more tables here: site, employee, attendance, credit_debit, report
console.log("Database initialized");
