import express from 'express';
import { addAdmin, approveCustomer, rejectCustomer } from '../controllers/adminController.js';

const router = express.Router();

router.post('/add-admin', addAdmin);
router.put('/approve/customer', approveCustomer);
router.put('/reject/customer', rejectCustomer);

export default router;