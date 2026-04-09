import db from "../db/connection";
import dayjs from "dayjs";

export const getAttendanceDetails = (payload: any) => {
  const { from_date, to_date, project_id } = payload;
  const fromDate = dayjs(from_date).format("YYYY/MM/DD");
  const toDate = dayjs(to_date).format("YYYY/MM/DD");
  console.log("getAttendanceDetails payload", fromDate, toDate, project_id);

  const stmt = db.prepare(`
  SELECT 
      am.attendance_id,
      am.project_id,
      pm.project_name,
      pm.type_of_work,
      am.date,
      am.status,
      sm.status_name,
      ad.employee_id,
      em.employee_name,
      em.employee_type,
      etm.employee_type_name,
      em.salary,
      ad.attendance_detail_id,
      ad.is_full,
      ad.work_amount,
      ad.extra_hours,
      ad.amount
    FROM attendance_master am
    LEFT JOIN project_master pm 
      ON pm.project_id = am.project_id
    LEFT JOIN status_master sm 
      ON sm.status_id = am.status
    LEFT JOIN attendance_detail ad 
      ON ad.attendance_id = am.attendance_id
    LEFT JOIN employee_master em 
      ON em.employee_id = ad.employee_id   -- ✅ FIXED
    LEFT JOIN employee_type_master etm 
      ON etm.employee_type_id = em.employee_type
    WHERE am.project_id = ?
      AND am.date BETWEEN ? AND ?
    ORDER BY am.date DESC
  `);

  return stmt.all(project_id, fromDate, toDate);
};
export const getEmployeeDetails = (payload: any) => {
  const { employee_ids } = payload;
  const stmt = db.prepare(
    `SELECT * FROM employee_master WHERE employee_id IN (${employee_ids.join(",")})`,
  );
  return stmt.all();
};

export const getCreditDetails = (payload: any) => {
  const { project_id, from_date, to_date } = payload;
  const stmt = db.prepare(
    `SELECT 
     cm.credit_id,
     cm.credit_amount,
     cm.project_id,
     pm.project_name,
     cm.date as credit_date,
     cm.pay_by,
     cm.credit_status,
     sm.status_name
    FROM credit_master cm
    LEFT JOIN project_master pm ON pm.project_id = cm.project_id
    LEFT JOIN status_master sm ON sm.status_id = cm.credit_status
    WHERE cm.project_id = ?
      AND cm.date BETWEEN ? AND ?
    `,
  );
  return stmt.all(project_id, from_date, to_date);
};

export const getDebitDetails = (payload: any) => {
  const { project_id, from_date, to_date } = payload;
  const stmt = db.prepare(
    `SELECT 
     dm.debit_id,
     dm.debit_amount,
     dm.project_id,
     pm.project_name,
     dm.date as credit_date,
     dm.name,
     dm.description,
     dm.debit_status,
     sm.status_name
    FROM debit_master dm
    LEFT JOIN project_master pm ON pm.project_id = dm.project_id
    LEFT JOIN status_master sm ON sm.status_id = dm.debit_status
    WHERE dm.project_id = ?
      AND dm.date BETWEEN ? AND ?
    `,
  );
  return stmt.all(project_id, from_date, to_date);
};
