import { Request, Response } from 'express';
import * as debitModel from '../models/debitModel';

export const getDebits = (req: Request, res: Response) => {
  try {
    const debits = debitModel.getAllDebits();
    res.json(debits);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getDebit = (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const debit = debitModel.getDebitById(id);
    if (!debit) return res.status(404).json({ error: 'Debit not found' });
    res.json(debit);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createDebit = (req: Request, res: Response) => {
  try {
    const debit = debitModel.createDebit(req.body);
    res.status(201).json(debit);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateDebit = (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    debitModel.updateDebit(id, req.body);
    res.json({ message: 'Debit updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteDebit = (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    debitModel.deleteDebit(id);
    res.json({ message: 'Debit deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
