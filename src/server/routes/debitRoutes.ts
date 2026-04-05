import { Router } from 'express';
import { getDebits, getDebit, createDebit, updateDebit, deleteDebit } from '../controllers/debitController';

const router = Router();

router.get('/', getDebits);
router.get('/:id', getDebit);
router.post('/', createDebit);
router.put('/:id', updateDebit);
router.delete('/:id', deleteDebit);

export default router;
