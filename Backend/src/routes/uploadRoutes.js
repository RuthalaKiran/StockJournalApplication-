import express from 'express';
import { uploadTradeImage } from '../controllers/uploadController.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateUser);

router.post('/trade-image', upload.single('image'), uploadTradeImage);

export default router;
