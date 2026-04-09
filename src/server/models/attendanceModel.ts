import dayjs from "dayjs";
import db from "../db/connection";

/**
 * Attendance Master Interface
 */
export interface IAttendanceDetails {
  attendance_detail_id?: number;
  employee_id: number;
  attendance_id: number;
  is_full:number;
  work_amount?: number;
  working_hours?:number;
  extra_hours: number;
  amount: number;
  work_ref?: string;
  status: number;
}

export interface Attendance {
  attendance_id?: number;
  date: string; // YYYY-MM-DD
  project_id: number;
  status: number;
  project_name?: string; // optional (JOIN)
  attendance_details: IAttendanceDetails[];
}

export interface AttendanceSummary {
  attendance_id: number;
  date: string;
  project_id: number;
  project_name: string;
  status_name: string;
  employee_count: number;
}

/**
 * Get all attendance records
 */
export const getAllAttendances = (): AttendanceSummary[] => {
 const stmt = db.prepare(`
  SELECT 
    am.attendance_id,
    am.date,
    am.project_id,
    pm.project_name,

    CASE 
      WHEN am.status = 1 THEN 'Active'
      WHEN am.status = 0 THEN 'Inactive'
      ELSE 'Unknown'
    END AS status_name,

    COUNT(ad.employee_id) AS employee_count

  FROM attendance_master am

  LEFT JOIN project_master pm 
    ON am.project_id = pm.project_id

  LEFT JOIN attendance_detail ad 
    ON am.attendance_id = ad.attendance_id

  GROUP BY 
    am.attendance_id,
    am.date,
    am.project_id,
    pm.project_name,
    am.status

  ORDER BY am.attendance_id DESC
`);
  return stmt.all() as AttendanceSummary[];
};

/**
 * Get attendance by ID
 */
export const getAttendanceById = (
  attendance_id: number,
): Attendance | undefined => {
  const stmt = db.prepare(`
    SELECT 
      a.*, 
      p.project_name,
      d.attendance_detail_id,
      d.employee_id,
      d.is_full,
      d.work_amount,
      d.extra_hours,
      d.amount,
      d.work_ref,
      e.employee_name
    FROM attendance_master a
    LEFT JOIN project_master p 
      ON a.project_id = p.project_id
    LEFT JOIN attendance_detail d 
      ON a.attendance_id = d.attendance_id
      LEFT JOIN employee_master e
      ON e.employee_id = d.employee_id
    WHERE a.attendance_id = ?
  `);

  const rows :any = stmt.all(attendance_id);

  if (rows.length === 0) return undefined;

  // Extract master data from first row
  const attendance: Attendance = {
    attendance_id: rows[0].attendance_id,
    date: rows[0].date,
    project_id: rows[0].project_id,
    project_name: rows[0].project_name,
    status: rows[0].status,
    attendance_details: [],
  };

  // Map details
  attendance.attendance_details = rows
    .filter((row:any) => row.attendance_detail_id !== null)
    .map((row:any) => ({
      attendance_detail_id: row.attendance_detail_id,
      employee_id: row.employee_id,
      employee_name: row.employee_name,
      is_full: row.is_full,
      work_amount: row.work_amount,
      extra_hours: row.extra_hours,
      amount: row.amount,
      work_ref: row.work_ref,
    }));

  return attendance;
};

/**
 * Create new attendance
 */
export const createAttendance = (attendance: Attendance): Attendance => {
  // Start a transaction to ensure master + details are consistent
  const transaction = db.transaction((attendance: Attendance) => {
    // 1️⃣ Insert master record
    const masterStmt = db.prepare(`
      INSERT INTO attendance_master (date, project_id, status)
      VALUES (@date, @project_id, @status)
    `);
    const masterInfo = masterStmt.run({
      date: attendance.date,
      project_id: attendance.project_id,
      status: 1,
    });

    const attendance_id = masterInfo.lastInsertRowid as number;

    // 2️⃣ Insert details if provided
    if (
      attendance.attendance_details &&
      attendance.attendance_details.length > 0
    ) {
      const detailStmt = db.prepare(`
        INSERT INTO attendance_detail
          (employee_id, attendance_id, is_full,work_amount, extra_hours, amount, work_ref, status)
        VALUES
          (@employee_id, @attendance_id, @is_full ,@work_amount, @extra_hours, @amount, @work_ref, @status)
      `);

      attendance.attendance_details = attendance.attendance_details.map(
        (detail) => {
          const info = detailStmt.run({
            employee_id: detail.employee_id,
            attendance_id,
            is_full: detail.is_full,
            work_amount: detail.work_amount || 0,
            extra_hours: detail.extra_hours,
            amount: detail.amount,
            work_ref: detail.work_ref ?? null,
            status: 1,
          });

          return {
            ...detail,
            attendance_detail_id: info.lastInsertRowid as number,
            attendance_id,
          };
        },
      );
    }

    return { ...attendance, attendance_id };
  });

  return transaction(attendance);
};

/**
 * Update attendance (dynamic fields)
 */
export const updateAttendance = (
  attendance_id: number,
  attendance: Partial<Attendance>,
): Attendance | Partial<Attendance> => {
  const transaction = db.transaction(
    (attendance: Partial<Attendance>, attendance_id: number) => {
      // 1️⃣ Update master record
      const updateFields: string[] = [];
      const values: any = { attendance_id };

      if (attendance.date !== undefined) {
        updateFields.push("date = @date");
        values.date = dayjs(attendance.date).format("YYYY-MM-DD");
      }

      if (attendance.project_id !== undefined) {
        updateFields.push("project_id = @project_id");
        values.project_id = attendance.project_id;
      }

      if (attendance.status !== undefined) {
        updateFields.push("status = @status");
        values.status = attendance.status;
      }

      if (updateFields.length > 0) {
        const stmt = db.prepare(`
        UPDATE attendance_master
        SET ${updateFields.join(", ")}
        WHERE attendance_id = @attendance_id
      `);
        stmt.run(values);
      }

      // 2️⃣ Update / Insert details if provided
      if (
        attendance.attendance_details &&
        attendance.attendance_details.length > 0
      ) {
        const insertDetailStmt = db.prepare(`
        INSERT INTO attendance_detail
          (employee_id, attendance_id, working_hours, extra_hours, amount, work_ref, status)
        VALUES
          (@employee_id, @attendance_id, @working_hours, @extra_hours, @amount, @work_ref, @status)
      `);

        const updateDetailStmt = db.prepare(`
        UPDATE attendance_detail
        SET employee_id = @employee_id,
            working_hours = @working_hours,
            extra_hours = @extra_hours,
            amount = @amount,
            work_ref = @work_ref,
            status = @status
        WHERE attendance_detail_id = @attendance_detail_id
      `);

        attendance.attendance_details = attendance.attendance_details.map(
          (detail) => {
            if (detail.attendance_detail_id) {
              // Existing detail → update
              updateDetailStmt.run({
                attendance_detail_id: detail.attendance_detail_id,
                employee_id: detail.employee_id,
                working_hours: detail.working_hours,
                extra_hours: detail.extra_hours,
                amount: detail.amount,
                work_ref: detail.work_ref ?? null,
                status: detail.status,
              });
              return { ...detail, attendance_id };
            } else {
              // New detail → insert
              const info = insertDetailStmt.run({
                employee_id: detail.employee_id,
                attendance_id,
                working_hours: detail.working_hours,
                extra_hours: detail.extra_hours,
                amount: detail.amount,
                work_ref: detail.work_ref ?? null,
                status: detail.status,
              });
              return {
                ...detail,
                attendance_detail_id: info.lastInsertRowid as number,
                attendance_id,
              };
            }
          },
        );
      }

      return { ...attendance, attendance_id };
    },
  );

  return transaction(attendance, attendance_id);
};
/**
 * Delete attendance
 */
export const deleteAttendance = (attendance_id: number): void => {
  const stmt = db.prepare(`
    DELETE FROM attendance_master
    WHERE attendance_id = ?
  `);

  stmt.run(attendance_id);
};
