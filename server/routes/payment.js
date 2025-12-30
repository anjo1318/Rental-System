import express from 'express'
import { gcashPayment, qrphPayment, checkPaymentStatus } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/gcash', gcashPayment);
router.post('/qrph', qrphPayment);

router.get('/status/:id',checkPaymentStatus );


export default router;