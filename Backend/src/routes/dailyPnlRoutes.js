import express from 'express';
import {
  saveDailyPnL,
  getCalendarData,
  deleteDailyPnL,
} from '../controllers/dailyPnlController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

// All daily PnL routes require authentication
router.use(authenticateUser);

router.post('/', saveDailyPnL);
router.get('/calendar', getCalendarData);
router.delete('/:date', deleteDailyPnL);

export default router;
