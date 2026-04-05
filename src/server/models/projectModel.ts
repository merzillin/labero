import db from "../db/connection";

export interface Project {
  project_id?: number;
  project_name: string;
  owner_name: string;
  contractor_name?: string | null;
  address: string;
  type_of_work: number;
  status: number;
  created_at?: string;
  updated_at?: string | null;
}

export const getAllProjects = (): Project[] => {
  const stmt = db.prepare("SELECT * FROM project_master");
  return stmt.all() as Project[];
};

export const getProjectById = (project_id: number): Project | undefined => {
  const stmt = db.prepare("SELECT * FROM project_master WHERE project_id = ?");
  return stmt.get(project_id) as Project | undefined;
};

export const createProject = (project: Project): Project => {
  const stmt = db.prepare(`
    INSERT INTO project_master (project_name, owner_name, contractor_name, address, type_of_work, status)
    VALUES (@project_name, @owner_name, @contractor_name, @address, @type_of_work, @status)
  `);
  const info = stmt.run({
    project_name: project.project_name,
    owner_name: project.owner_name,
    contractor_name: project.contractor_name || null,
    address: project.address,
    type_of_work: project.type_of_work,
    status: project.status,
  });
  return { ...project, project_id: info.lastInsertRowid as number };
};

export const updateProject = (
  project_id: number,
  project: Partial<Project>,
): void => {
  const updateFields: string[] = [];
  const values: any = { project_id };

  if (project.project_name !== undefined) {
    updateFields.push("project_name = @project_name");
    values.project_name = project.project_name;
  }
  if (project.owner_name !== undefined) {
    updateFields.push("owner_name = @owner_name");
    values.owner_name = project.owner_name;
  }
  if (project.contractor_name !== undefined) {
    updateFields.push("contractor_name = @contractor_name");
    values.contractor_name = project.contractor_name;
  }
  if (project.address !== undefined) {
    updateFields.push("address = @address");
    values.address = project.address;
  }
  if (project.type_of_work !== undefined) {
    updateFields.push("type_of_work = @type_of_work");
    values.type_of_work = project.type_of_work;
  }
  if (project.status !== undefined) {
    updateFields.push("status = @status");
    values.status = project.status;
  }

  updateFields.push("updated_at = CURRENT_TIMESTAMP");

  const stmt = db.prepare(`
    UPDATE project_master 
    SET ${updateFields.join(", ")}
    WHERE project_id = @project_id
  `);

  stmt.run(values);
};

export const deleteProject = (project_id: number): void => {
  const stmt = db.prepare("DELETE FROM project_master WHERE project_id = ?");
  stmt.run(project_id);
};

export const projectDrodpown = (): Project[] => {
  const stmt = db.prepare(
    "SELECT project_id, project_name FROM project_master WHERE status = 1",
  );
  return stmt.all() as Project[];
};
