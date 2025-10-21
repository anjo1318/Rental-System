import express from 'express'
import { approveBooking, 
    approveBookingRequest, 
    bookedItems, 
    bookItem, 
    bookNotification, 
    cancelBooking, 
    fetchAllBooking, 
    fetchBookRequest, 
    rejectBooking, 
    rejectBookingRequest, 
    requestBooking, 
    startBooking, 
    terminateBooking } from '../controllers/bookController.js';

const router = express.Router()

//for customer
router.post('/book-item', bookItem);
router.get('/notification/:id', bookNotification);
router.get('/booked-items/:id', bookedItems);
router.put('/cancel/:id', cancelBooking);
router.put('/request/:id', requestBooking);
router.put('/approve-request/:id', approveBookingRequest);
router.put('/reject-request/:id', rejectBookingRequest);

//for owners
router.get("/book-request/:id", fetchBookRequest);
router.put('/approve-booking/:id', approveBooking);
router.put('/reject-booking/:id',rejectBooking);
router.put('/start-booking/:id',startBooking);
router.put('/terminate-booking/:id',terminateBooking);

//for admin
router.get("/fetch-bookings", fetchAllBooking);

export default router;