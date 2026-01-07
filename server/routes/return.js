import express from 'express';
import { itemReturned, notifyCustomer } from '../controllers/returnController.js';

const router = express.Router();

router.put('/item-returned', itemReturned);
router.post('/notify-customer', notifyCustomer);

export default router;