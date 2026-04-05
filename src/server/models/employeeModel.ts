import db from "../db/connection";

export interface Employee {
  employee_id?: number;
  employee_name: string;
  employee_type: number;
  salary: number;
  contact_number?: string | null;
  status: number;
  created_at?: string;
  updated_at?: string | null;
}

export const getAllEmployees = (): Employee[] => {
  const stmt = db.prepare("SELECT * FROM employee_master");
  return stmt.all() as Employee[];
};

export const getEmployeeById = (employee_id: number): Employee | undefined => {
  const stmt = db.prepare(
    "SELECT * FROM employee_master WHERE employee_id = ?",
  );
  return stmt.get(employee_id) as Employee | undefined;
};

export const createEmployee = (employee: Employee): Employee => {
  const stmt = db.prepare(`
    INSERT INTO employee_master (employee_name, employee_type, salary, contact_number, status)
    VALUES (@employee_name, @employee_type, @salary, @contact_number, @status)
  `);
  const info = stmt.run({
    employee_name: employee.employee_name,
    employee_type: employee.employee_type,
    salary: employee.salary,
    contact_number: employee.contact_number || null,
    status: employee.status,
  });
  return { ...employee, employee_id: info.lastInsertRowid as number };
};

export const updateEmployee = (
  employee_id: number,
  employee: Partial<Employee>,
): void => {
  const updateFields: string[] = [];
  const values: any = { employee_id };

  if (employee.employee_name !== undefined) {
    updateFields.push("employee_name = @employee_name");
    values.employee_name = employee.employee_name;
  }
  if (employee.employee_type !== undefined) {
    updateFields.push("employee_type = @employee_type");
    values.employee_type = employee.employee_type;
  }
  if (employee.salary !== undefined) {
    updateFields.push("salary = @salary");
    values.salary = employee.salary;
  }
  if (employee.contact_number !== undefined) {
    updateFields.push("contact_number = @contact_number");
    values.contact_number = employee.contact_number;
  }
  if (employee.status !== undefined) {
    updateFields.push("status = @status");
    values.status = employee.status;
  }

  updateFields.push("updated_at = CURRENT_TIMESTAMP");

  const stmt = db.prepare(`
    UPDATE employee_master 
    SET ${updateFields.join(", ")}
    WHERE employee_id = @employee_id
  `);

  stmt.run(values);
};

export const deleteEmployee = (employee_id: number): void => {
  const stmt = db.prepare("DELETE FROM employee_master WHERE employee_id = ?");
  stmt.run(employee_id);
};

export const employeeDropdown = (): Employee[] => {
  const stmt = db.prepare(
    "SELECT employee_id, employee_name FROM employee_master WHERE status = 1",
  );
  return stmt.all() as Employee[];
};
