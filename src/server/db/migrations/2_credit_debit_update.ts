import db from "../connection";

// Create Users table
db.exec(
  `
  PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS credit_master (
  credit_id INTEGER PRIMARY KEY AUTOINCREMENT,
  credit_amount INTEGER NOT NULL,
  project_id INTEGER NOT NULL,
  date Date NOT NULL,
  pay_by TEXT NOT NULL,
  credit_status INTEGER NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT,
  FOREIGN KEY (project_id) REFERENCES project_master(project_id),
  FOREIGN KEY (credit_status) REFERENCES status_master(status_id)
);

CREATE TABLE IF NOT EXISTS debit_master (
  debit_id INTEGER PRIMARY KEY AUTOINCREMENT,
  debit_amount INTEGER NOT NULL,
  project_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  date Date NOT NULL,
  debit_status INTEGER NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT,
  FOREIGN KEY (project_id) REFERENCES project_master(project_id)
  FOREIGN KEY (debit_status) REFERENCES status_master(status_id)

);
`,
);

// You can add more tables here: site, employee, attendance, credit_debit, report
console.log("Database initialized");
