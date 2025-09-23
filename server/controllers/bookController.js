import Book from "../models/Book.js";
import Item from "../models/Item.js";

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

    const response = await Book.create({
      itemId,
      customerId,
      ownerId,
      product: itemDetails.title,
      category: itemDetails.category,
      location: itemDetails.location,
      pricePerDay: itemDetails.pricePerDay,
      name: customerDetails.fullName,
      email: customerDetails.email,
      phone: customerDetails.phone,
      address: customerDetails.location,
      gender: customerDetails.gender,
      rentalPeriod: rentalDetails.period,
      pickUpDate: rentalDetails.pickupDate,
      returnDate: rentalDetails.returnDate,
      status: "pending",
      // ⚠️ paymentMethod is not in model yet, see note below
    });

    return res.status(200).json({
      success: true,
      message: "Booking saved successfully",
      response,
    });
  } catch (error) {
    console.error("Booking error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export { bookItem };
