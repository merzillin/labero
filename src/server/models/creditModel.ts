import db from "../db/connection";

export interface Credit {
  credit_id?: number;
  credit_amount: number;
  project_id: number;
  date: string;
  pay_by: string;
  status: number | string;
  created_at?: string;
  updated_at?: string | null;
}

export const getAllCredits = (): Credit[] => {
  const stmt = db.prepare(
    `SELECT * FROM credit_master 
    LEFT JOIN project_master ON credit_master.project_id = project_master.project_id 
    LEFT JOIN status_master ON credit_master.credit_status = status_master.status_id ORDER BY credit_id DESC`,
  );
  return stmt.all() as Credit[];
};

export const getCreditById = (credit_id: number): Credit | undefined => {
  const stmt = db.prepare("SELECT * FROM credit_master WHERE credit_id = ?");
  return stmt.get(credit_id) as Credit | undefined;
};

export const createCredit = (credit: Credit): Credit => {
  const stmt = db.prepare(`
    INSERT INTO credit_master (credit_amount, project_id, date, pay_by, credit_status)
    VALUES (@credit_amount, @project_id, @date, @pay_by, @credit_status)
  `);
  const info = stmt.run({
    credit_amount: credit.credit_amount,
    project_id: credit.project_id,
    date: credit.date,
    pay_by: credit.pay_by,
    credit_status: 7,
  });
  return {
    ...credit,
    credit_id: info.lastInsertRowid as number,
    status: "Paid",
  };
};

export const updateCredit = (
  credit_id: number,
  credit: Partial<Credit>,
): void => {
  const updateFields: string[] = [];
  const values: any = { credit_id };

  if (credit.credit_amount !== undefined) {
    updateFields.push("credit_amount = @credit_amount");
    values.credit_amount = credit.credit_amount;
  }
  if (credit.project_id !== undefined) {
    updateFields.push("project_id = @project_id");
    values.project_id = credit.project_id;
  }
  if (credit.date !== undefined) {
    updateFields.push("date = @date");
    values.date = credit.date;
  }
  if (credit.pay_by !== undefined) {
    updateFields.push("pay_by = @pay_by");
    values.pay_by = credit.pay_by;
  }
  if (credit.status !== undefined) {
    updateFields.push("credit_status = @status");
    values.status = credit.status;
  }

  updateFields.push("updated_at = CURRENT_TIMESTAMP");

  const stmt = db.prepare(`
    UPDATE credit_master 
    SET ${updateFields.join(", ")}
    WHERE credit_id = @credit_id
  `);

  stmt.run(values);
};

export const deleteCredit = (credit_id: number): void => {
  const stmt = db.prepare("DELETE FROM credit_master WHERE credit_id = ?");
  stmt.run(credit_id);
};
