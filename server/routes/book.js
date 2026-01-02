import express from 'express'
import { approveBooking, 
    approveBookingRequest, 
    bookedItems, 
    bookItem, 
    bookItemUpdate, 
    bookNotification, 
    cancelBooking, 
    deleteBooking, 
    fetchAllBooking, 
    fetchBookRequest, 
    rejectBooking, 
    rejectBookingRequest, 
    requestBooking, 
    terminateBooking,
    getUserNotifications,
    markAsRead,
    getUnreadCount,
    cleanupOldNotifications,
    getRentalStatus,
    triggerRentalMonitoring,
    getLateRentals,
    ongoingBook,
    bookedItemForApproval,
    startBookedItem
} from '../controllers/bookController.js';

const router = express.Router()

//for customer
router.post('/book-item', bookItem);
router.put('/book-item/update/:id', bookItemUpdate );
router.get('/notification/:id', bookNotification);
router.get('/booked-items/:id', bookedItems);
router.put('/cancel/:id', cancelBooking);
router.put('/request/:id', requestBooking);
router.put('/approve-request/:id', approveBookingRequest);
router.put('/reject-request/:id', rejectBookingRequest);
router.delete('/delete/:id', deleteBooking);

router.get('/notification/:userId', getUserNotifications);

router.put('/notification/:notificationId/read', markAsRead);

router.get('/notification/:userId/unread-count', getUnreadCount);

router.delete('/notification/cleanup/:userId', cleanupOldNotifications);

//for owners
router.get("/book-request/:id", fetchBookRequest);
router.get("/ongoing-book/:id", ongoingBook);
router.get("/booked-item-approval/:id", bookedItemForApproval);
router.put('/start-booked-item/:id', startBookedItem);
router.put('/approve-booking/:id', approveBooking);
router.put('/reject-booking/:id',rejectBooking);
router.put('/terminate-booking/:id',terminateBooking);

//for admin
router.get("/fetch-bookings", fetchAllBooking);

// Check specific rental status
router.get('/rental-status/:bookingId', getRentalStatus);

// Manually trigger monitoring (for testing)
router.post('/monitor-rentals', triggerRentalMonitoring);

// Get all late rentals
router.get('/late-rentals', getLateRentals);

export default router;