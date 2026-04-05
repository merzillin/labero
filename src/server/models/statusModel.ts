import db from "../db/connection";

interface Status {
  status_id: number;
  status_name: string;
}

export const statusDrodpown = (): Status[] => {
  const stmt = db.prepare("SELECT status_id, status_name FROM status_master;");
  return stmt.all() as Status[];
};
