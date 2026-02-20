import express from 'express';
import { addAdmin, approveCustomer, approveOwner, rejectCustomer, rejectOwner } from '../controllers/adminController.js';

const router = express.Router();

router.post('/add-admin', addAdmin);
router.put('/approve/customer', approveCustomer);
router.put('/reject/customer', rejectCustomer);
router.put('/approve/owner', approveOwner);
router.put('/reject/owner', rejectOwner);

export default router;