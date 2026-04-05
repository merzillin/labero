import db from "../db/connection";
import dayjs from "dayjs";

export const getAttendanceDetails = (payload: any) => {
  const { from_date, to_date, project_id } = payload;
  const fromDate = dayjs(from_date, "DD/MM/YYYY").format("YYYY-MM-DD");
  const toDate = dayjs(to_date, "DD/MM/YYYY").format("YYYY-MM-DD");

  const stmt = db.prepare(`
    SELECT *
    FROM attendance_master
    WHERE 
      date(
        substr(date, 7, 4) || '-' || substr(date, 4, 2) || '-' || substr(date, 1, 2)
      )
      BETWEEN ? AND ?
      AND project_id = ?
  `);
  console.log("getAttendanceDetails payload", fromDate, toDate, project_id);
  return stmt.all(fromDate, toDate, project_id);
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
    "SELECT * FROM credit_master WHERE project_id = ? AND date BETWEEN ? AND ?",
  );
  return stmt.all(project_id, from_date, to_date);
};

export const getDebitDetails = (payload: any) => {
  const { project_id, from_date, to_date } = payload;
  const stmt = db.prepare(
    "SELECT * FROM debit_master WHERE project_id = ? AND date BETWEEN ? AND ?",
  );
  return stmt.all(project_id, from_date, to_date);
};
