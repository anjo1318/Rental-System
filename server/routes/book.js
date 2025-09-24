import express from 'express'
import { bookedItems, bookItem, bookNotification, cancelBooking } from '../controllers/bookController.js';

const router = express.Router()

router.post('/book-item', bookItem);
router.get('/notification/:id', bookNotification);
router.get('/booked-items/:id', bookedItems);
router.put('/cancel/:id', cancelBooking);

export default router;