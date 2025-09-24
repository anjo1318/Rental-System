import express from 'express'
import { bookedItems, bookItem, bookNotification, cancelBooking, fetchBookRequest } from '../controllers/bookController.js';

const router = express.Router()

//for customer
router.post('/book-item', bookItem);
router.get('/notification/:id', bookNotification);
router.get('/booked-items/:id', bookedItems);
router.put('/cancel/:id', cancelBooking);

//for owners
router.get("/book-request/:id", fetchBookRequest);

export default router;