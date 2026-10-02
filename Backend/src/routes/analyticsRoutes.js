import express from 'express';
import { getDashboardAnalytics } from '../controllers/analyticsController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateUser);

router.get('/dashboard', getDashboardAnalytics);

export default router;
