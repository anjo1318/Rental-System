import express from 'express'
import { gcashPayment } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/gcash', gcashPayment);

export default router;