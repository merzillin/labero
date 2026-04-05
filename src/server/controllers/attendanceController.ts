import { Request, Response } from 'express';
import * as attendanceModel from '../models/attendanceModel';

export const getAttendances = (req: Request, res: Response) => {
  try {
    const attendances = attendanceModel.getAllAttendances();
    res.json(attendances);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAttendance = (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const attendance = attendanceModel.getAttendanceById(id);
    if (!attendance) return res.status(404).json({ error: 'Attendance not found' });
    res.json(attendance);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createAttendance = (req: Request, res: Response) => {
  try {
    const attendance = attendanceModel.createAttendance(req.body);
    res.status(201).json(attendance);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateAttendance = (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    attendanceModel.updateAttendance(id, req.body);
    res.json({ message: 'Attendance updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteAttendance = (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    attendanceModel.deleteAttendance(id);
    res.json({ message: 'Attendance deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};