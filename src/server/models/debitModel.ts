import db from "../db/connection";

export interface Debit {
  debit_id?: number;
  debit_amount: number;
  project_id: number;
  name: string;
  description?: string | null;
  date: string;
  created_at?: string;
  updated_at?: string | null;
}

export const getAllDebits = (): Debit[] => {
  const stmt = db.prepare(`SELECT * FROM debit_master 
    LEFT JOIN project_master ON debit_master.project_id = project_master.project_id
    LEFT JOIN status_master ON debit_master.debit_status = status_master.status_id 
    order by debit_id desc`);
  return stmt.all() as Debit[];
};

export const getDebitById = (debit_id: number): Debit | undefined => {
  const stmt = db.prepare("SELECT * FROM debit_master WHERE debit_id = ?");
  return stmt.get(debit_id) as Debit | undefined;
};

export const createDebit = (debit: Debit): Debit => {
  const stmt = db.prepare(`
    INSERT INTO debit_master (debit_amount, project_id, name, description, date, debit_status)
    VALUES (@debit_amount, @project_id, @name, @description, @date, @debit_status)
  `);
  const info = stmt.run({
    debit_amount: debit.debit_amount,
    project_id: debit.project_id,
    name: debit.name,
    description: debit.description || null,
    date: debit.date,
    debit_status: 8
  });
  return { ...debit, debit_id: info.lastInsertRowid as number };
};

export const updateDebit = (debit_id: number, debit: Partial<Debit>): void => {
  const updateFields: string[] = [];
  const values: any = { debit_id };

  if (debit.debit_amount !== undefined) {
    updateFields.push("debit_amount = @debit_amount");
    values.debit_amount = debit.debit_amount;
  }
  if (debit.project_id !== undefined) {
    updateFields.push("project_id = @project_id");
    values.project_id = debit.project_id;
  }
  if (debit.name !== undefined) {
    updateFields.push("name = @name");
    values.name = debit.name;
  }
  if (debit.description !== undefined) {
    updateFields.push("description = @description");
    values.description = debit.description;
  }
  if (debit.date !== undefined) {
    updateFields.push("date = @date");
    values.date = debit.date;
  }

  updateFields.push("updated_at = CURRENT_TIMESTAMP");

  const stmt = db.prepare(`
    UPDATE debit_master 
    SET ${updateFields.join(", ")}
    WHERE debit_id = @debit_id
  `);

  stmt.run(values);
};

export const deleteDebit = (debit_id: number): void => {
  const stmt = db.prepare("DELETE FROM debit_master WHERE debit_id = ?");
  stmt.run(debit_id);
};
