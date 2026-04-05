import db from "../connection";

// Create Users table
db.exec(
  `
  PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS attendence_master (
  attendance_id INTEGER PRIMARY KEY AUTOINCREMENT,
  date Date NOT NULL,
  project_id INTEGER NOT NULL,
  status INTEGER NOT NULL,
  FOREIGN KEY (project_id) REFERENCES project_master(project_id)
);

CREATE TABLE IF NOT EXISTS attendence_detail (
  attendence_detail_id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  attendance_id INTEGER NOT NULL,
  working_hours INTEGER NOT NULL,
  extra_hours INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  work_ref TEXT NULL,
  status INTEGER NOT NULL,
  FOREIGN KEY (employee_id) REFERENCES employee_master(employee_id),
  FOREIGN KEY (attendance_id) REFERENCES attendance_master(attendance_id)
);
`,
);

// You can add more tables here: site, employee, attendance, credit_debit, report
console.log("Database initialized");
