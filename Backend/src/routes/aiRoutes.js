import express from 'express';
import {
  analyzeTradeById,
  generateNotes,
  chatWithCoach,
  getStatus,
} from '../controllers/aiController.js';
import { protectRoute } from '../middleware/authMiddleware.js';

const router = express.Router();

// All AI endpoints are secured by JWT authentication
router.use(protectRoute);

router.post('/analyze-trade/:id', analyzeTradeById);
router.post('/generate-notes', generateNotes);
router.post('/coach', chatWithCoach);
router.get('/status', getStatus);

export default router;
