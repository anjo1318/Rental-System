import express from 'express';
import { savePushToken } from '../controllers/notificationsController.js';
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router();

router.post('/push-token', authMiddleware, savePushToken);

export default router;
