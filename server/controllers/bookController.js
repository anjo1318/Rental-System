import { response } from "express";
import Books from "../models/Book.js";

const bookItem = async (req, res) => {
  try {
    const {
      itemId,
      itemDetails,
      customerDetails,
      rentalDetails,
      paymentMethod, // frontend sends this
      customerId,
      ownerId,
    } = req.body;

    console.log("Incoming booking data:", req.body);

    const response = await Books.create({
    itemId,
    customerId:customerDetails.customerId,
    ownerId:itemDetails.ownerId,
    product: itemDetails.title,
    category: itemDetails.category,
    location: itemDetails.location,
    pricePerDay: itemDetails.pricePerDay,
    name: customerDetails.fullName,         
    email: customerDetails.email,
    phone: customerDetails.phone,
    address: customerDetails.location,
    gender: customerDetails.gender,
    itemImage: itemDetails.itemImage,
    rentalPeriod: rentalDetails.period,
    pickUpDate: rentalDetails.pickupDate,
    returnDate: rentalDetails.returnDate,
    status: "pending",
    paymentMethod, // ✅ include this
    });

    console.log("Success in adding request for booking");

    return res.status(200).json({
      success: true,
      message:"Success in sending rent request"
    });
  } catch (error) {
    console.error("Booking error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const bookNotification = async (req, res) => {
  const { id } = req.params; // this will be the customerId coming from the mobile app

  try {
    const response = await Books.findAll({
      where: { customerId: id }, // ✅ find all bookings for this customer
      order: [["created_at", "DESC"]]
    });

    return res.status(200).json({ success: true, data: response });
  } catch (error) {
    console.error("Notification fetch error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const bookedItems = async (req, res) => {
  const { id } = req.params; // this will be the customerId coming from the mobile 
  
  console.log("Incoming data",req.params);

  try {
    const response = await Books.findAll({
      where: { customerId: id }, // ✅ find all bookings for this customer
      order: [["created_at", "DESC"]]
    });

    return res.status(200).json({ success: true, data: response });
  } catch (error) {
    console.error("Notification fetch error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const cancelBooking = async (req, res) => {
  console.log("cancelBooking");
  try {
    const { id } = req.params; 
    console.log("Incoming data", req.params);

    // use "id" since that's your PK
    const booking = await Books.findOne({ where: { id } });
    console.log("Found booking:", booking);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    await booking.update({ status: "cancelled" });

    return res.json({ success: true, message: "Booking cancelled successfully", booking });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


export { bookItem, bookNotification, bookedItems, cancelBooking };
