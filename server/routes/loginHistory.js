import express, { Router } from 'express';
// In your routes file
import { getLoginHistory, getRecentLogins } from '../controllers/loginHistoryController.js';


const router = express.Router();

// Admin routes
router.get('/login-history', getLoginHistory);
router.get('/recent-logins', getRecentLogins);

export default router;