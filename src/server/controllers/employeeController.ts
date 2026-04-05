import { Request, Response } from "express";
import * as employeeModel from "../models/employeeModel";

export const getEmployees = (req: Request, res: Response) => {
  try {
    const employees = employeeModel.getAllEmployees();
    res.json(employees);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getEmployee = (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const employee = employeeModel.getEmployeeById(id);
    if (!employee) return res.status(404).json({ error: "Employee not found" });
    res.json(employee);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createEmployee = (req: Request, res: Response) => {
  try {
    req.body.status = 1; // Set as active on create
    const employee = employeeModel.createEmployee(req.body);
    res.status(201).json(employee);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateEmployee = (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    employeeModel.updateEmployee(id, req.body);
    res.json({ message: "Employee updated successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteEmployee = (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    employeeModel.deleteEmployee(id);
    res.json({ message: "Employee deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const employeeDropdown = (req: Request, res: Response) => {
  try {
    const employees = employeeModel.employeeDropdown();
    res.json(employees);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getEmployeeType = (req: Request, res: Response) => {
  try {
    const data = [
      {
        code: "1",
        value: "Maison",
      },
      {
        code: "2",
        value: "Helper",
      },
      {
        code: "3",
        value: "Hindi Maison",
      },
    ];
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
