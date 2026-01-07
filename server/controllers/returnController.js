import Book from '../models/Book.js';
import Item from '../models/Item.js';
import History from '../models/History.js';

export const itemReturned = async (req, res) => {
  try {
    const { bookingId } = req.body;

    // Validate input
    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID is required'
      });
    }

    // Find the booking
    const booking = await Book.findOne({
      where: { id: bookingId }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if the booking is in ongoing status
    if (booking.status !== 'ongoing') {
      return res.status(400).json({
        success: false,
        message: `Cannot return item. Current status is: ${booking.status}`
      });
    }

    // Find the item and increment available quantity
    const item = await Item.findOne({
      where: { id: booking.itemId }
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Increment the available quantity
    await item.increment('availableQuantity', { by: 1 });

    // Create history record from booking data
    const historyData = {
      itemId: booking.itemId,
      customerId: booking.customerId,
      ownerId: booking.ownerId,
      product: booking.product,
      category: booking.category,
      location: booking.location,
      pricePerDay: booking.pricePerDay,
      name: booking.name,
      email: booking.email,
      phone: booking.phone,
      address: booking.address,
      gender: booking.gender,
      itemImage: booking.itemImage,
      rentalPeriod: booking.rentalPeriod,
      paymentMethod: booking.paymentMethod,
      pickUpDate: booking.pickUpDate,
      returnDate: booking.returnDate,
      amount: booking.amount,
      rentalDuration: booking.rentalDuration,
      ratePerPeriod: booking.ratePerPeriod,
      deliveryCharge: booking.deliveryCharge,
      grandTotal: booking.grandTotal,
      guarantor1FullName: booking.guarantor1FullName,
      guarantor1PhoneNumber: booking.guarantor1PhoneNumber,
      guarantor1Address: booking.guarantor1Address,
      guarantor1Email: booking.guarantor1Email,
      guarantor2FullName: booking.guarantor2FullName,
      guarantor2PhoneNumber: booking.guarantor2PhoneNumber,
      guarantor2Address: booking.guarantor2Address,
      guarantor2Email: booking.guarantor2Email,
      isRead: booking.isRead,
      readAt: booking.readAt,
      status: 'terminated', // Mark as terminated in history
    };

    // Create history record
    const history = await History.create(historyData);

    // Delete the booking from Books table
    await booking.destroy();

    return res.status(200).json({
      success: true,
      message: 'Item returned successfully',
      data: {
        history,
        itemAvailableQuantity: item.availableQuantity
      }
    });

  } catch (error) {
    console.error('Error in itemReturned:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process item return',
      error: error.message
    });
  }
};

export const notifyCustomer = async (req, res) => {
  try {
    const { bookingId, message } = req.body;

    // Validate input
    if (!bookingId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID and message are required'
      });
    }

    // Find the booking
    const booking = await Book.findOne({
      where: { id: bookingId }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Here you can implement your notification logic
    // For example: send email, push notification, SMS, etc.
    // Example: await sendEmail(booking.email, 'Return Notification', message);

    return res.status(200).json({
      success: true,
      message: 'Customer notified successfully',
      data: {
        customerId: booking.customerId,
        customerEmail: booking.email,
        customerPhone: booking.phone
      }
    });

  } catch (error) {
    console.error('Error in notifyCustomer:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to notify customer',
      error: error.message
    });
  }
};