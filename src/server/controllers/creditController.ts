import { Request, Response } from "express";
import * as creditModel from "../models/creditModel";

export const getCredits = (req: Request, res: Response) => {
  try {
    const credits = creditModel.getAllCredits();
    res.json(credits);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getCredit = (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const credit = creditModel.getCreditById(id);
    if (!credit) return res.status(404).json({ error: "Credit not found" });
    res.json(credit);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createCredit = (req: Request, res: Response) => {
  try {
    const credit = creditModel.createCredit({ ...req.body, status: 9 });
    res.status(201).json(credit);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateCredit = (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    creditModel.updateCredit(id, req.body);
    res.json({ message: "Credit updated successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteCredit = (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    creditModel.deleteCredit(id);
    res.json({ message: "Credit deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
