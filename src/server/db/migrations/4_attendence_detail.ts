import db from "../connection";

// Disable foreign keys temporarily during drop
db.pragma('foreign_keys = OFF');

db.exec(`
  DROP TABLE IF EXISTS attendance_detail;
  DROP TABLE IF EXISTS attendance_master;

  CREATE TABLE IF NOT EXISTS attendance_master (
    attendance_id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    project_id INTEGER NOT NULL,
    status INTEGER NOT NULL,
    FOREIGN KEY (project_id) REFERENCES project_master(project_id)
  );

  CREATE TABLE IF NOT EXISTS attendance_detail (
    attendance_detail_id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    attendance_id INTEGER NOT NULL,
    is_full INTEGER,
    work_amount INTEGER NOT NULL,
    extra_hours INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    work_ref TEXT,
    status INTEGER NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES employee_master(employee_id),
    FOREIGN KEY (attendance_id) REFERENCES attendance_master(attendance_id)
  );
`);

// Re-enable foreign key constraints
db.pragma('foreign_keys = ON');

console.log("Database initialized with new attendance tables");