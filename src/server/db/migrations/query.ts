import db from "../connection";



export function ExeQuery(payload: any): any[] {
  const { fromDate, toDate, project_id } = payload;

  const query = `
    SELECT 
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
const data = ExeQuery({ fromDate: "2026-04-01", toDate: "2026-04-13", project_id:1 });
console.log(data);

// need to work