import express from 'express'
import { approveBooking, bookedItems, bookItem, bookNotification, cancelBooking, fetchBookRequest, rejectBooking } from '../controllers/bookController.js';

const router = express.Router()

//for customer
router.post('/book-item', bookItem);
router.get('/notification/:id', bookNotification);
router.get('/booked-items/:id', bookedItems);
router.put('/cancel/:id', cancelBooking);

//for owners
router.get("/book-request/:id", fetchBookRequest);
router.put('/approve-booking/:id', approveBooking);
router.put('/reject-booking/:id',rejectBooking);

export default router;