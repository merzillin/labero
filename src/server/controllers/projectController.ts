import { Request, Response } from "express";
import * as projectModel from "../models/projectModel";

export const getProjects = (req: Request, res: Response) => {
  try {
    const projects = projectModel.getAllProjects();
    res.json(projects);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getProject = (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const project = projectModel.getProjectById(id);
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json(project);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createProject = (req: Request, res: Response) => {
  try {
    req.body.status = 1; // Set as active on create
    const project = projectModel.createProject(req.body);
    res.status(201).json(project);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProject = (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    projectModel.updateProject(id, req.body);
    res.json({ message: "Project updated successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteProject = (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    projectModel.deleteProject(id);
    res.json({ message: "Project deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const projectDropdown = (req: Request, res: Response) => {
  try {
    const projects = projectModel.projectDrodpown();
    res.json(projects);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
export const getWorkType = (req: Request, res: Response) => {
  try {
    const data = [
      {
        code: "1",
        value: "Construction",
      },
      {
        code: "2",
        value: "Maintance",
      },
    ];
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
