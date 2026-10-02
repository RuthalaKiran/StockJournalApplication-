import express from 'express';
import {
  createTrade,
  getTrades,
  getTradeById,
  updateTrade,
  deleteTrade,
} from '../controllers/tradeController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

// All trade routes require authentication
router.use(authenticateUser);

router.route('/')
  .post(createTrade)
  .get(getTrades);

router.route('/:id')
  .get(getTradeById)
  .put(updateTrade)
  .delete(deleteTrade);

export default router;
