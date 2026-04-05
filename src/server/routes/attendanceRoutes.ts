import { Router } from 'express';
import { getAttendances, getAttendance, createAttendance, updateAttendance, deleteAttendance } from '../controllers/attendanceController';

const router = Router();

router.get('/', getAttendances);
router.get('/:id', getAttendance);
router.post('/', createAttendance);
router.put('/:id', updateAttendance);
router.delete('/:id', deleteAttendance);

export default router;