import { Router } from 'express';
import { getCredits, getCredit, createCredit, updateCredit, deleteCredit } from '../controllers/creditController';

const router = Router();

router.get('/', getCredits);
router.get('/:id', getCredit);
router.post('/', createCredit);
router.put('/:id', updateCredit);
router.delete('/:id', deleteCredit);

export default router;
