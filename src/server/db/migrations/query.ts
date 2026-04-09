import db from "../connection";



export function ExeQuery(payload: any): any[] {
  const { fromDate, toDate, project_id } = payload;

  const query = `
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
      em.salary,
      ad.working_hours,
      ad.extra_hours,
      ad.amount
    FROM attendance_master am
    LEFT JOIN project_master pm ON pm.project_id = am.project_id
    LEFT JOIN status_master sm ON sm.status_id = am.status
    LEFT JOIN attendance_detail ad on ad.attendance_id  = am.attendance_id
    LEFT JOIN employee_master em ON em.employee_id  = em.employee_id
    WHERE am.project_id = ?
      AND am.date BETWEEN ? AND ?
  `;

  try {
    const stmt = db.prepare(query);
    const result = stmt.all(project_id, fromDate, toDate);

    return result;
  } catch (error) {
    console.error("Error fetching attendance:", error);
    throw error;
  }
}

// Example usage
const data = ExeQuery({ fromDate: "2026/04/01", toDate: "2026/04/13", project_id:1 });
console.log(data);

// need to work