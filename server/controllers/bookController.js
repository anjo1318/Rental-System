import Books from "../models/Book.js";
import Owner from "../models/Owner.js";
import Item from '../models/Item.js'
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { Op } from "sequelize";
import sequelize from '../database/database.js'

dotenv.config();

const transporter = nodemailer.createTransport({
  service:"gmail",
  auth:{
    user:process.env.EMAIL_USER,
    pass:process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized:false,
  }
});

transporter.verify((error, success)=>{
  if(error){
    console.error("SMTP Connection failer", error);
  } else {
    console.log("SMTP Server Ready");
  }
});

const bookItem = async (req, res) => {
  try {
    const {
      itemId,
      itemDetails,
      customerDetails,
      rentalDetails,
      paymentMethod,
      customerId,
      ownerId,
    } = req.body;

    console.log("Incoming booking data:", req.body);

    const pickupDate = new Date(rentalDetails.pickupDate);
    const returnDate = new Date(rentalDetails.returnDate);
    
    const timeDifference = returnDate.getTime() - pickupDate.getTime();
    const numberOfDays = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
    const rentalDays = Math.max(numberOfDays, 1);
    
    const pricePerDay = parseFloat(itemDetails.pricePerDay);
    const totalAmount = rentalDays * pricePerDay;

    console.log(`Rental calculation: ${rentalDays} days × ₱${pricePerDay} = ₱${totalAmount}`);

    const response = await Books.create({
      itemId,
      customerId: customerDetails.customerId,
      ownerId: itemDetails.ownerId,
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
      amount: totalAmount,
      status: "pending",
      paymentMethod,
    });

    console.log("Success in adding request for booking");
    console.log(`Total amount calculated: ₱${totalAmount} for ${rentalDays} days`);

    return res.status(200).json({
      success: true,
      message: "Success in sending rent request",
      bookingDetails: {
        bookingId: response.id,
        rentalDays: rentalDays,
        totalAmount: totalAmount,
        pricePerDay: pricePerDay
      }
    });
  } catch (error) {
    console.error("Booking error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
      
const bookNotification = async (req, res) => {
  const { id } = req.params;

  try {
    const response = await Books.findAll({
      where: { customerId: id }, 
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
  console.log("Incoming data", req.params);
  console.log("Ito yung specific na booking item para sa time tas sa right side ay yung id nung user", req.params);
  
  try {
    const bookings = await Books.findAll({
      where: { customerId: id },
      order: [["created_at", "DESC"]]
    });

    // ✅ Fetch owner profile images for each booking
    const bookingsWithOwnerImages = await Promise.all(
      bookings.map(async (booking) => {
        const bookingData = booking.toJSON();
        
        // Fetch owner's profileImage
        const owner = await Owner.findByPk(booking.ownerId, {
          attributes: ['profileImage', 'firstName', 'lastName', 'idPhoto', 'selfie']
        });
        
        // Add owner data to booking
        bookingData.ownerProfileImage = owner?.profileImage || null;
        bookingData.ownerFirstName = owner?.firstName || null;
        bookingData.ownerLastName = owner?.lastName || null;
        bookingData.ownerIdPhoto = owner?.idPhoto || null;
        bookingData.ownerSelfie = owner?.selfie || null;
        
        return bookingData;
      })
    );

    return res.status(200).json({ success: true, data: bookingsWithOwnerImages });
  } catch (error) {
    console.error("Booking fetch error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const requestBooking = async (req, res) => {
  try {

    console.log("requestBooking function in bookController.js is hit");
    const {id} = req.params;

    const booking = await Books.findOne({where:{id}});

    if(!booking){
      return res.status(404).json({success:false, message: "Booking not found"});
    }

    await booking.update({status: "booked"});

    // Extract all booking details from the database record
    const {
      name,
      email,
      product,
      pricePerDay,
      rentalPeriod,
      paymentMethod,
      pickUpDate,
      returnDate,
      category,
      location,
      phone,
      address,
      amount
    } = booking;

    // Format dates for display
    const formattedPickupDate = new Date(pickUpDate).toLocaleDateString();
    const formattedReturnDate = new Date(returnDate).toLocaleDateString();
    const rentDuration = `${formattedPickupDate} to ${formattedReturnDate}`;

    // Calculate total days and amount
    const totalDays = Math.ceil((new Date(returnDate) - new Date(pickUpDate)) / (1000 * 60 * 60 * 24));
    const totalAmount = totalDays * Number(pricePerDay);

    // Generate request number (you might want to use the booking ID or create a proper request number)
    const requestNumber = booking.id;

    // Prepare email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email.trim(),
      subject: `Booking Approved - ${product}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #28a745; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">EzRent</h1>
            <p style="margin: 5px 0 0 0; font-size: 16px;">Booking Confirmation</p>
          </div>
          
          <div style="padding: 30px; border: 1px solid #ddd; background-color: #fff;">
            <h2 style="color: #333; margin-top: 0;">Dear ${name},</h2>
            
            <p style="font-size: 16px; line-height: 1.6;">
              A request to rent <strong>${product}</strong> has been placed.
            </p>
            
            <div style="background-color: #d4edda; padding: 15px; border-radius: 6px; border-left: 4px solid #28a745; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #155724;">
               Please check the request as soon as possible.
              </p>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #28a745;">Booking Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; width: 40%;">Booking Number:</td>
                  <td style="padding: 8px 0;">${requestNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Item:</td>
                  <td style="padding: 8px 0; border-top: 1px solid #ddd;">${product}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Category:</td>
                  <td style="padding: 8px 0; border-top: 1px solid #ddd;">${category}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Location:</td>
                  <td style="padding: 8px 0; border-top: 1px solid #ddd;">${location}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Payment Method:</td>
                  <td style="padding: 8px 0; border-top: 1px solid #ddd;">${paymentMethod || 'Not specified'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Rental Period:</td>
                  <td style="padding: 8px 0; border-top: 1px solid #ddd;">${rentalPeriod}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Rental Duration:</td>
                  <td style="padding: 8px 0; border-top: 1px solid #ddd;">${rentDuration} (${totalDays} days)</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Price Per Day:</td>
                  <td style="padding: 8px 0; border-top: 1px solid #ddd;">₱${Number(pricePerDay).toLocaleString()}</td>
                </tr>
                <tr style="background-color: #d4edda;">
                  <td style="padding: 12px 8px; font-weight: bold; font-size: 18px; border-top: 2px solid #28a745;">Total Amount:</td>
                  <td style="padding: 12px 8px; font-weight: bold; font-size: 18px; color: #28a745; border-top: 2px solid #28a745;">₱${amount.toLocaleString()}</td>
                </tr>
              </table>
            </div>

            <div style="background-color: #e8f4f8; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #0093DD;">Customer Information</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; width: 30%;">Name:</td>
                  <td style="padding: 8px 0;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Email:</td>
                  <td style="padding: 8px 0; border-top: 1px solid #ddd;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Phone:</td>
                  <td style="padding: 8px 0; border-top: 1px solid #ddd;">${phone}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Address:</td>
                  <td style="padding: 8px 0; border-top: 1px solid #ddd;">${address}</td>
                </tr>
              </table>
            </div>
            
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107;">
              <h4 style="margin-top: 0; color: #856404;">Next Steps:</h4>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Contact the owner to arrange pickup details</li>
                <li>Prepare the required payment as specified</li>
                <li>Bring a valid ID for verification</li>
                <li>Review the terms and conditions before pickup</li>
              </ul>
            </div>
            
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107; margin-top: 15px;">
              <p style="margin: 0; font-size: 14px;">
                <strong>ⓘ Confidentiality Notice:</strong> This email and any attached documents are intended solely for the individual to whom they are addressed. If you are not the intended recipient, please notify us immediately and delete this message. Any unauthorized review, use, disclosure, or distribution is strictly prohibited.
              </p>
            </div>
            
            <p style="margin-top: 25px; font-size: 14px; color: #666;">
              If you have any questions regarding your booking, please contact us at <a href="mailto:ezrentofficialmail@gmail.com">ezrentofficialmail@gmail.com</a>.
            </p>
          </div>
          
          <div style="background-color: #28a745; padding: 15px; text-align: center; border-radius: 0 0 8px 8px;">
            <p style="margin: 0; font-size: 14px; color: white;">
             EzRent Company<br>Pinamalayan, Oriental Mindoro<br>Email: ezrentofficialmail@gmail.com | Office Hours: Monday–Saturday, 8:00 AM–5:00 PM
            </p>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #d1ecf1; border-radius: 6px; border-left: 4px solid #17a2b8;">
            <p style="margin: 0; font-size: 13px; color: #0c5460;">
              <strong>Important:</strong> This is an automated email—please do not reply. Keep this confirmation for your records.
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true, 
      message: "Booking approved successfully", 
      booking: {
        id: booking.id,
        product: booking.product,
        name: booking.name,
        email: booking.email,
        status: booking.status,
        totalAmount: totalAmount
      }
    });

  } catch(error) {
    console.error('Error approving booking:', error);
    return res.status(500).json({success:false, message:error.message});
  }
}

const approveBookingRequest = async (req, res) => {
  try {

    console.log("requestBooking function in bookController.js is hit");
    const {id} = req.params;

    const booking = await Books.findOne({where:{id}});

    if(!booking){
      return res.status(404).json({success:false, message: "Booking not found"});
    }

    await booking.update({status: "Approved to Rent"});

    // Extract all booking details from the database record
    const {
      name,
      email,
      product,
      pricePerDay,
      rentalPeriod,
      paymentMethod,
      pickUpDate,
      returnDate,
      category,
      location,
      phone,
      address,
      amount
    } = booking;

    // Format dates for display
    const formattedPickupDate = new Date(pickUpDate).toLocaleDateString();
    const formattedReturnDate = new Date(returnDate).toLocaleDateString();
    const rentDuration = `${formattedPickupDate} to ${formattedReturnDate}`;

    // Calculate total days and amount
    const totalDays = Math.ceil((new Date(returnDate) - new Date(pickUpDate)) / (1000 * 60 * 60 * 24));
    const totalAmount = totalDays * Number(pricePerDay);

    // Generate request number (you might want to use the booking ID or create a proper request number)
    const requestNumber = booking.id;

    // Prepare email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email.trim(),
      subject: `Booking Approved - ${product}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #28a745; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">EzRent</h1>
            <p style="margin: 5px 0 0 0; font-size: 16px;">Booking Confirmation</p>
          </div>
          
          <div style="padding: 30px; border: 1px solid #ddd; background-color: #fff;">
            <h2 style="color: #333; margin-top: 0;">Dear ${name},</h2>
            
            <p style="font-size: 16px; line-height: 1.6;">
              A request to rent <strong>${product}</strong> has been placed.
            </p>
            
            <div style="background-color: #d4edda; padding: 15px; border-radius: 6px; border-left: 4px solid #28a745; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #155724;">
               Please check the request as soon as possible.
              </p>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #28a745;">Booking Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; width: 40%;">Booking Number:</td>
                  <td style="padding: 8px 0;">${requestNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Item:</td>
                  <td style="padding: 8px 0; border-top: 1px solid #ddd;">${product}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Category:</td>
                  <td style="padding: 8px 0; border-top: 1px solid #ddd;">${category}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Location:</td>
                  <td style="padding: 8px 0; border-top: 1px solid #ddd;">${location}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Payment Method:</td>
                  <td style="padding: 8px 0; border-top: 1px solid #ddd;">${paymentMethod || 'Not specified'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Rental Period:</td>
                  <td style="padding: 8px 0; border-top: 1px solid #ddd;">${rentalPeriod}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Rental Duration:</td>
                  <td style="padding: 8px 0; border-top: 1px solid #ddd;">${rentDuration} (${totalDays} days)</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Price Per Day:</td>
                  <td style="padding: 8px 0; border-top: 1px solid #ddd;">₱${Number(pricePerDay).toLocaleString()}</td>
                </tr>
                <tr style="background-color: #d4edda;">
                  <td style="padding: 12px 8px; font-weight: bold; font-size: 18px; border-top: 2px solid #28a745;">Total Amount:</td>
                  <td style="padding: 12px 8px; font-weight: bold; font-size: 18px; color: #28a745; border-top: 2px solid #28a745;">₱${amount.toLocaleString()}</td>
                </tr>
              </table>
            </div>

            <div style="background-color: #e8f4f8; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #0093DD;">Customer Information</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; width: 30%;">Name:</td>
                  <td style="padding: 8px 0;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Email:</td>
                  <td style="padding: 8px 0; border-top: 1px solid #ddd;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Phone:</td>
                  <td style="padding: 8px 0; border-top: 1px solid #ddd;">${phone}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Address:</td>
                  <td style="padding: 8px 0; border-top: 1px solid #ddd;">${address}</td>
                </tr>
              </table>
            </div>
            
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107;">
              <h4 style="margin-top: 0; color: #856404;">Next Steps:</h4>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Contact the owner to arrange pickup details</li>
                <li>Prepare the required payment as specified</li>
                <li>Bring a valid ID for verification</li>
                <li>Review the terms and conditions before pickup</li>
              </ul>
            </div>
            
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107; margin-top: 15px;">
              <p style="margin: 0; font-size: 14px;">
                <strong>ⓘ Confidentiality Notice:</strong> This email and any attached documents are intended solely for the individual to whom they are addressed. If you are not the intended recipient, please notify us immediately and delete this message. Any unauthorized review, use, disclosure, or distribution is strictly prohibited.
              </p>
            </div>
            
            <p style="margin-top: 25px; font-size: 14px; color: #666;">
              If you have any questions regarding your booking, please contact us at <a href="mailto:ezrentofficialmail@gmail.com">ezrentofficialmail@gmail.com</a>.
            </p>
          </div>
          
          <div style="background-color: #28a745; padding: 15px; text-align: center; border-radius: 0 0 8px 8px;">
            <p style="margin: 0; font-size: 14px; color: white;">
             EzRent Company<br>Pinamalayan, Oriental Mindoro<br>Email: ezrentofficialmail@gmail.com | Office Hours: Monday–Saturday, 8:00 AM–5:00 PM
            </p>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #d1ecf1; border-radius: 6px; border-left: 4px solid #17a2b8;">
            <p style="margin: 0; font-size: 13px; color: #0c5460;">
              <strong>Important:</strong> This is an automated email—please do not reply. Keep this confirmation for your records.
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true, 
      message: "Booking approved successfully", 
      booking: {
        id: booking.id,
        product: booking.product,
        name: booking.name,
        email: booking.email,
        status: booking.status,
        totalAmount: totalAmount
      }
    });

  } catch(error) {
    console.error('Error approving booking:', error);
    return res.status(500).json({success:false, message:error.message});
  }
}

const rejectBookingRequest = async (req, res) => {
  try {

    console.log("requestBooking function in bookController.js is hit");
    const {id} = req.params;

    const booking = await Books.findOne({where:{id}});

    if(!booking){
      return res.status(404).json({success:false, message: "Booking not found"});
    }

    await booking.update({status: "Rejected to Rent"});

    // Extract all booking details from the database record
    const {
      name,
      email,
      product,
      pricePerDay,
      rentalPeriod,
      paymentMethod,
      pickUpDate,
      returnDate,
      category,
      location,
      phone,
      address,
      amount
    } = booking;

    // Format dates for display
    const formattedPickupDate = new Date(pickUpDate).toLocaleDateString();
    const formattedReturnDate = new Date(returnDate).toLocaleDateString();
    const rentDuration = `${formattedPickupDate} to ${formattedReturnDate}`;

    // Calculate total days and amount
    const totalDays = Math.ceil((new Date(returnDate) - new Date(pickUpDate)) / (1000 * 60 * 60 * 24));
    const totalAmount = totalDays * Number(pricePerDay);

    // Generate request number (you might want to use the booking ID or create a proper request number)
    const requestNumber = booking.id;

    // Prepare email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email.trim(),
      subject: `Booking Approved - ${product}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #28a745; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">EzRent</h1>
            <p style="margin: 5px 0 0 0; font-size: 16px;">Booking Confirmation</p>
          </div>
          
          <div style="padding: 30px; border: 1px solid #ddd; background-color: #fff;">
            <h2 style="color: #333; margin-top: 0;">Dear ${name},</h2>
            
            <p style="font-size: 16px; line-height: 1.6;">
              A request to rent <strong>${product}</strong> has been placed.
            </p>
            
            <div style="background-color: #d4edda; padding: 15px; border-radius: 6px; border-left: 4px solid #28a745; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #155724;">
               Please check the request as soon as possible.
              </p>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #28a745;">Booking Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; width: 40%;">Booking Number:</td>
                  <td style="padding: 8px 0;">${requestNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Item:</td>
                  <td style="padding: 8px 0; border-top: 1px solid #ddd;">${product}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Category:</td>
                  <td style="padding: 8px 0; border-top: 1px solid #ddd;">${category}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Location:</td>
                  <td style="padding: 8px 0; border-top: 1px solid #ddd;">${location}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Payment Method:</td>
                  <td style="padding: 8px 0; border-top: 1px solid #ddd;">${paymentMethod || 'Not specified'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Rental Period:</td>
                  <td style="padding: 8px 0; border-top: 1px solid #ddd;">${rentalPeriod}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Rental Duration:</td>
                  <td style="padding: 8px 0; border-top: 1px solid #ddd;">${rentDuration} (${totalDays} days)</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Price Per Day:</td>
                  <td style="padding: 8px 0; border-top: 1px solid #ddd;">₱${Number(pricePerDay).toLocaleString()}</td>
                </tr>
                <tr style="background-color: #d4edda;">
                  <td style="padding: 12px 8px; font-weight: bold; font-size: 18px; border-top: 2px solid #28a745;">Total Amount:</td>
                  <td style="padding: 12px 8px; font-weight: bold; font-size: 18px; color: #28a745; border-top: 2px solid #28a745;">₱${amount.toLocaleString()}</td>
                </tr>
              </table>
            </div>

            <div style="background-color: #e8f4f8; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #0093DD;">Customer Information</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; width: 30%;">Name:</td>
                  <td style="padding: 8px 0;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Email:</td>
                  <td style="padding: 8px 0; border-top: 1px solid #ddd;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Phone:</td>
                  <td style="padding: 8px 0; border-top: 1px solid #ddd;">${phone}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Address:</td>
                  <td style="padding: 8px 0; border-top: 1px solid #ddd;">${address}</td>
                </tr>
              </table>
            </div>
            
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107;">
              <h4 style="margin-top: 0; color: #856404;">Next Steps:</h4>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Contact the owner to arrange pickup details</li>
                <li>Prepare the required payment as specified</li>
                <li>Bring a valid ID for verification</li>
                <li>Review the terms and conditions before pickup</li>
              </ul>
            </div>
            
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107; margin-top: 15px;">
              <p style="margin: 0; font-size: 14px;">
                <strong>ⓘ Confidentiality Notice:</strong> This email and any attached documents are intended solely for the individual to whom they are addressed. If you are not the intended recipient, please notify us immediately and delete this message. Any unauthorized review, use, disclosure, or distribution is strictly prohibited.
              </p>
            </div>
            
            <p style="margin-top: 25px; font-size: 14px; color: #666;">
              If you have any questions regarding your booking, please contact us at <a href="mailto:ezrentofficialmail@gmail.com">ezrentofficialmail@gmail.com</a>.
            </p>
          </div>
          
          <div style="background-color: #28a745; padding: 15px; text-align: center; border-radius: 0 0 8px 8px;">
            <p style="margin: 0; font-size: 14px; color: white;">
             EzRent Company<br>Pinamalayan, Oriental Mindoro<br>Email: ezrentofficialmail@gmail.com | Office Hours: Monday–Saturday, 8:00 AM–5:00 PM
            </p>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #d1ecf1; border-radius: 6px; border-left: 4px solid #17a2b8;">
            <p style="margin: 0; font-size: 13px; color: #0c5460;">
              <strong>Important:</strong> This is an automated email—please do not reply. Keep this confirmation for your records.
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true, 
      message: "Booking approved successfully", 
      booking: {
        id: booking.id,
        product: booking.product,
        name: booking.name,
        email: booking.email,
        status: booking.status,
        totalAmount: totalAmount
      }
    });

  } catch(error) {
    console.error('Error approving booking:', error);
    return res.status(500).json({success:false, message:error.message});
  }
}

const cancelBooking = async(req, res) => {
  try {
    const {id} = req.params;
    
    const booking = await Books.findOne({where:{id}});

    if(!booking){
      return res.status(404).json({success:false, message: "Booking not found"});
    }

    await booking.update({status:"cancelled"});

    // Extract all booking details from the database record
    const {
      name,
      email,
      product,
      pricePerDay,
      rentalPeriod,
      paymentMethod,
      pickUpDate,
      returnDate,
      amount
    } = booking;

    console.log(booking);

    // Format dates for display
    const formattedPickupDate = new Date(pickUpDate).toLocaleDateString();
    const formattedReturnDate = new Date(returnDate).toLocaleDateString();
    const rentDuration = `${formattedPickupDate} to ${formattedReturnDate}`;

    // Generate request number (you might want to use the booking ID or create a proper request number)
    const requestNumber = booking.id;

    // Prepare email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email.trim(),
      subject: `Booking Rejection - ${product}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #dc3545; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">EzRent</h1>
            <p style="margin: 5px 0 0 0; font-size: 16px;">Booking Rejection Notice</p>
          </div>
          
          <div style="padding: 30px; border: 1px solid #ddd; background-color: #fff;">
            <h2 style="color: #333; margin-top: 0;">Dear ${name},</h2>
            
            <p style="font-size: 16px; line-height: 1.6;">
              We regret to inform you that your request to rent <strong>${product}</strong> has been rejected by the owner.
            </p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #dc3545;">Request Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; width: 40%;">Request Number:</td>
                  <td style="padding: 8px 0;">${requestNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Item:</td>
                  <td style="padding: 8px 0; border-top: 1px solid #ddd;">${product}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Payment Method:</td>
                  <td style="padding: 8px 0; border-top: 1px solid #ddd;">${paymentMethod || 'Not specified'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Rental Period:</td>
                  <td style="padding: 8px 0; border-top: 1px solid #ddd;">${rentalPeriod}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Requested Duration:</td>
                  <td style="padding: 8px 0; border-top: 1px solid #ddd;">${rentDuration}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Price Per Day:</td>
                  <td style="padding: 8px 0; border-top: 1px solid #ddd;">₱${Number(pricePerDay).toLocaleString()}</td>
                </tr>
                <tr style="background-color: #d4edda;">
                  <td style="padding: 12px 8px; font-weight: bold; font-size: 18px; border-top: 2px solid #28a745;">Total Amount:</td>
                  <td style="padding: 12px 8px; font-weight: bold; font-size: 18px; color: #28a745; border-top: 2px solid #28a745;">₱${amount.toLocaleString()}</td>
                </tr>
              </table>
            </div>
            
            <div style="background-color: #f8d7da; padding: 15px; border-radius: 6px; border-left: 4px solid #dc3545;">
              <p style="margin: 0; font-size: 14px; color: #721c24;">
                <strong>Status:</strong> Your booking request has been <strong>REJECTED</strong>. You may try booking other available items or contact the owner for more information.
              </p>
            </div>
            
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107; margin-top: 15px;">
              <p style="margin: 0; font-size: 14px;">
                <strong>ⓘ Confidentiality Notice:</strong> This email and any attached documents are intended solely for the individual to whom they are addressed. If you are not the intended recipient, please notify us immediately and delete this message. Any unauthorized review, use, disclosure, or distribution is strictly prohibited.
              </p>
            </div>
            
            <p style="margin-top: 25px; font-size: 14px; color: #666;">
              If you have any questions regarding this decision, please contact us at <a href="mailto:ezrentofficialmail@gmail.com">ezrentofficialmail@gmail.com</a>.
            </p>
          </div>
          
          <div style="background-color: #6c757d; padding: 15px; text-align: center; border-radius: 0 0 8px 8px;">
            <p style="margin: 0; font-size: 14px; color: white;">
             EzRent Company<br>Pinamalayan, Oriental Mindoro<br>Email: ezrentofficialmail@gmail.com | Office Hours: Monday–Saturday, 8:00 AM–5:00 PM
            </p>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #f8d7da; border-radius: 6px; border-left: 4px solid #dc3545;">
            <p style="margin: 0; font-size: 13px; color: #721c24;">
              <strong>Important:</strong> This is an automated email—please do not reply. Keep this notification for your records.
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true, 
      message: "Successfully rejected the request", 
      booking: {
        id: booking.id,
        product: booking.product,
        name: booking.name,
        email: booking.email,
        status: booking.status
      }
    });

  } catch (error) {
    console.error('Error rejecting booking:', error);
    return res.status(500).json({success:false, message: error.message});
  }
}

const rejectBooking = async(req, res) => {
  try {
    const {id} = req.params;
    
    const booking = await Books.findOne({where:{id}});

    if(!booking){
      return res.status(404).json({success:false, message: "Booking not found"});
    }

    await booking.update({status:"rejected"});

    // Extract all booking details from the database record
    const {
      name,
      email,
      product,
      pricePerDay,
      rentalPeriod,
      paymentMethod,
      pickUpDate,
      returnDate,
      amount
    } = booking;

    console.log(booking);

    // Format dates for display
    const formattedPickupDate = new Date(pickUpDate).toLocaleDateString();
    const formattedReturnDate = new Date(returnDate).toLocaleDateString();
    const rentDuration = `${formattedPickupDate} to ${formattedReturnDate}`;

    // Generate request number (you might want to use the booking ID or create a proper request number)
    const requestNumber = booking.id;

    // Prepare email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email.trim(),
      subject: `Booking Rejection - ${product}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #dc3545; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">EzRent</h1>
            <p style="margin: 5px 0 0 0; font-size: 16px;">Booking Rejection Notice</p>
          </div>
          
          <div style="padding: 30px; border: 1px solid #ddd; background-color: #fff;">
            <h2 style="color: #333; margin-top: 0;">Dear ${name},</h2>
            
            <p style="font-size: 16px; line-height: 1.6;">
              We regret to inform you that your request to rent <strong>${product}</strong> has been rejected by the owner.
            </p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #dc3545;">Request Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; width: 40%;">Request Number:</td>
                  <td style="padding: 8px 0;">${requestNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Item:</td>
                  <td style="padding: 8px 0; border-top: 1px solid #ddd;">${product}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Payment Method:</td>
                  <td style="padding: 8px 0; border-top: 1px solid #ddd;">${paymentMethod || 'Not specified'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Rental Period:</td>
                  <td style="padding: 8px 0; border-top: 1px solid #ddd;">${rentalPeriod}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Requested Duration:</td>
                  <td style="padding: 8px 0; border-top: 1px solid #ddd;">${rentDuration}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Price Per Day:</td>
                  <td style="padding: 8px 0; border-top: 1px solid #ddd;">₱${Number(pricePerDay).toLocaleString()}</td>
                </tr>
                <tr style="background-color: #d4edda;">
                  <td style="padding: 12px 8px; font-weight: bold; font-size: 18px; border-top: 2px solid #28a745;">Total Amount:</td>
                  <td style="padding: 12px 8px; font-weight: bold; font-size: 18px; color: #28a745; border-top: 2px solid #28a745;">₱${amount.toLocaleString()}</td>
                </tr>
              </table>
            </div>
            
            <div style="background-color: #f8d7da; padding: 15px; border-radius: 6px; border-left: 4px solid #dc3545;">
              <p style="margin: 0; font-size: 14px; color: #721c24;">
                <strong>Status:</strong> Your booking request has been <strong>REJECTED</strong>. You may try booking other available items or contact the owner for more information.
              </p>
            </div>
            
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107; margin-top: 15px;">
              <p style="margin: 0; font-size: 14px;">
                <strong>ⓘ Confidentiality Notice:</strong> This email and any attached documents are intended solely for the individual to whom they are addressed. If you are not the intended recipient, please notify us immediately and delete this message. Any unauthorized review, use, disclosure, or distribution is strictly prohibited.
              </p>
            </div>
            
            <p style="margin-top: 25px; font-size: 14px; color: #666;">
              If you have any questions regarding this decision, please contact us at <a href="mailto:ezrentofficialmail@gmail.com">ezrentofficialmail@gmail.com</a>.
            </p>
          </div>
          
          <div style="background-color: #6c757d; padding: 15px; text-align: center; border-radius: 0 0 8px 8px;">
            <p style="margin: 0; font-size: 14px; color: white;">
             EzRent Company<br>Pinamalayan, Oriental Mindoro<br>Email: ezrentofficialmail@gmail.com | Office Hours: Monday–Saturday, 8:00 AM–5:00 PM
            </p>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #f8d7da; border-radius: 6px; border-left: 4px solid #dc3545;">
            <p style="margin: 0; font-size: 13px; color: #721c24;">
              <strong>Important:</strong> This is an automated email—please do not reply. Keep this notification for your records.
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true, 
      message: "Successfully rejected the request", 
      booking: {
        id: booking.id,
        product: booking.product,
        name: booking.name,
        email: booking.email,
        status: booking.status
      }
    });

  } catch (error) {
    console.error('Error rejecting booking:', error);
    return res.status(500).json({success:false, message: error.message});
  }
}

const fetchBookRequest = async (req, res) => {
  console.log("Using fetchBookRequest");

  try {
    const { id } = req.params;
    console.log("Id of the incoming request:", id);

    const response = await Books.findAll({
      where: { ownerId: id },
      order: [["created_at", "DESC"]], // ✅ use the alias you defined in the model
    });

    return res.status(200).json({ success: true, data: response });

  } catch (error) {
    console.error("Error in fetchBookRequest:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const ongoingBook = async (req, res) => {
  console.log("Using ongoingBook");

  try {
    const { id } = req.params;
    console.log("Id of the incoming request:", id);

    const response = await Books.findAll({
      where: { ownerId: id, status: "ongoing" },
      order: [["created_at", "DESC"]], 
    });

    return res.status(200).json({ success: true, data: response });

  } catch (error) {
    console.error("Error in ongoingBook:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const ongoingBookAndForApproval = async (req, res) => {
  console.log("Using ongoingBookAndForApproval");

  try {
    const { id } = req.params;

    const response = await Books.findAll({
      where: {
        ownerId: id,
        status: {
          [Op.in]: ["ongoing", "booked"]
        }
      },
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({ success: true, data: response });
  } catch (error) {
    console.error("Error in ongoingBookAndForApproval:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const ongoingBookAndForApprovalCustomer = async (req, res) => {
  console.log("Using ongoingBookAndForApprovalCustomer");

  try {
    const { id } = req.params;

    const response = await Books.findAll({
      where: {
        customerId: id,
        status: {
          [Op.in]: ["ongoing", "booked"]
        }      },
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({ success: true, data: response });
  } catch (error) {
    console.error("Error in ongoingBookAndForApprovalCustomer:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


const bookedItemForApproval = async (req, res) => {
  console.log("Using bookedItemForApproval");

  try {
    const { id } = req.params;
    console.log("Id of the incoming request:", id);

    const response = await Books.findAll({
      where: { ownerId: id, status: "booked" },
      order: [["created_at", "DESC"]], 
    });

    return res.status(200).json({ success: true, data: response });

  } catch (error) {
    console.error("Error in bookedItemForApproval:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


const approveBooking = async (req, res) => {
  try {
    const {id} = req.params;

    const booking = await Books.findOne({where:{id}});

    if(!booking){
      return res.status(404).json({success:false, message: "Booking not found"});
    }

    await booking.update({status: "approved"});
    startDeadlineTimer({
      id: booking.id,
      product: booking.product,
      email: booking.email,
      returnDate: booking.returnDate,
      userId: booking.customerId
    });

    // Extract all booking details from the database record
    const {
      name,
      email,
      product,
      pricePerDay,
      rentalPeriod,
      paymentMethod,
      pickUpDate,
      returnDate,
      category,
      location,
      phone,
      address,
      amount
    } = booking;

    // Format dates for display
    const formattedPickupDate = new Date(pickUpDate).toLocaleDateString();
    const formattedReturnDate = new Date(returnDate).toLocaleDateString();
    const rentDuration = `${formattedPickupDate} to ${formattedReturnDate}`;

    // Calculate total days and amount
    const totalDays = Math.ceil((new Date(returnDate) - new Date(pickUpDate)) / (1000 * 60 * 60 * 24));
    const totalAmount = totalDays * Number(pricePerDay);

    // Generate request number (you might want to use the booking ID or create a proper request number)
    const requestNumber = booking.id;

    // Prepare email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email.trim(),
      subject: `Booking Approved - ${product}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #28a745; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">EzRent</h1>
            <p style="margin: 5px 0 0 0; font-size: 16px;">Booking Confirmation</p>
          </div>
          
          <div style="padding: 30px; border: 1px solid #ddd; background-color: #fff;">
            <h2 style="color: #333; margin-top: 0;">Dear ${name},</h2>
            
            <p style="font-size: 16px; line-height: 1.6;">
              Great news! Your request to rent <strong>${product}</strong> has been <strong>APPROVED</strong> by the owner.
            </p>
            
            <div style="background-color: #d4edda; padding: 15px; border-radius: 6px; border-left: 4px solid #28a745; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #155724;">
                <strong>Status:</strong> Your booking has been <strong>APPROVED</strong>. Please proceed with the next steps as outlined below.
              </p>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #28a745;">Booking Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; width: 40%;">Booking Number:</td>
                  <td style="padding: 8px 0;">${requestNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Item:</td>
                  <td style="padding: 8px 0; border-top: 1px solid #ddd;">${product}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Category:</td>
                  <td style="padding: 8px 0; border-top: 1px solid #ddd;">${category}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Location:</td>
                  <td style="padding: 8px 0; border-top: 1px solid #ddd;">${location}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Payment Method:</td>
                  <td style="padding: 8px 0; border-top: 1px solid #ddd;">${paymentMethod || 'Not specified'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Rental Period:</td>
                  <td style="padding: 8px 0; border-top: 1px solid #ddd;">${rentalPeriod}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Rental Duration:</td>
                  <td style="padding: 8px 0; border-top: 1px solid #ddd;">${rentDuration} (${totalDays} days)</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Price Per Day:</td>
                  <td style="padding: 8px 0; border-top: 1px solid #ddd;">₱${Number(pricePerDay).toLocaleString()}</td>
                </tr>
                <tr style="background-color: #d4edda;">
                  <td style="padding: 12px 8px; font-weight: bold; font-size: 18px; border-top: 2px solid #28a745;">Total Amount:</td>
                  <td style="padding: 12px 8px; font-weight: bold; font-size: 18px; color: #28a745; border-top: 2px solid #28a745;">₱${amount.toLocaleString()}</td>
                </tr>
              </table>
            </div>

            <div style="background-color: #e8f4f8; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #0093DD;">Customer Information</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; width: 30%;">Name:</td>
                  <td style="padding: 8px 0;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Email:</td>
                  <td style="padding: 8px 0; border-top: 1px solid #ddd;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Phone:</td>
                  <td style="padding: 8px 0; border-top: 1px solid #ddd;">${phone}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Address:</td>
                  <td style="padding: 8px 0; border-top: 1px solid #ddd;">${address}</td>
                </tr>
              </table>
            </div>
            
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107;">
              <h4 style="margin-top: 0; color: #856404;">Next Steps:</h4>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Contact the owner to arrange pickup details</li>
                <li>Prepare the required payment as specified</li>
                <li>Bring a valid ID for verification</li>
                <li>Review the terms and conditions before pickup</li>
              </ul>
            </div>
            
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107; margin-top: 15px;">
              <p style="margin: 0; font-size: 14px;">
                <strong>ⓘ Confidentiality Notice:</strong> This email and any attached documents are intended solely for the individual to whom they are addressed. If you are not the intended recipient, please notify us immediately and delete this message. Any unauthorized review, use, disclosure, or distribution is strictly prohibited.
              </p>
            </div>
            
            <p style="margin-top: 25px; font-size: 14px; color: #666;">
              If you have any questions regarding your booking, please contact us at <a href="mailto:ezrentofficialmail@gmail.com">ezrentofficialmail@gmail.com</a>.
            </p>
          </div>
          
          <div style="background-color: #28a745; padding: 15px; text-align: center; border-radius: 0 0 8px 8px;">
            <p style="margin: 0; font-size: 14px; color: white;">
             EzRent Company<br>Pinamalayan, Oriental Mindoro<br>Email: ezrentofficialmail@gmail.com | Office Hours: Monday–Saturday, 8:00 AM–5:00 PM
            </p>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #d1ecf1; border-radius: 6px; border-left: 4px solid #17a2b8;">
            <p style="margin: 0; font-size: 13px; color: #0c5460;">
              <strong>Important:</strong> This is an automated email—please do not reply. Keep this confirmation for your records.
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true, 
      message: "Booking approved successfully", 
      booking: {
        id: booking.id,
        product: booking.product,
        name: booking.name,
        email: booking.email,
        status: booking.status,
        totalAmount: totalAmount
      }
    });

  } catch(error) {
    console.error('Error approving booking:', error);
    return res.status(500).json({success:false, message:error.message});
  }
}


const terminateBooking = async(req, res) => {
  try {
    const {id} = req.params;
    
    const booking = await Books.findOne({where:{id}});

    if(!booking){
      return res.status(404).json({success:false, message: "Booking not found"});
    }

    await booking.update({status:"terminated"});

    // Extract all booking details from the database record
    const {
      name,
      email,
      product,
      pricePerDay,
      rentalPeriod,
      paymentMethod,
      pickUpDate,
      returnDate,
      amount
    } = booking;

    console.log(booking);

    // Format dates for display
    const formattedPickupDate = new Date(pickUpDate).toLocaleDateString();
    const formattedReturnDate = new Date(returnDate).toLocaleDateString();
    const rentDuration = `${formattedPickupDate} to ${formattedReturnDate}`;

    // Generate request number (you might want to use the booking ID or create a proper request number)
    const requestNumber = booking.id;

    // Prepare email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email.trim(),
      subject: `Booking Terminated - ${product}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #dc3545; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">EzRent</h1>
            <p style="margin: 5px 0 0 0; font-size: 16px;">Booking Terminated Notice</p>
          </div>
          
          <div style="padding: 30px; border: 1px solid #ddd; background-color: #fff;">
            <h2 style="color: #333; margin-top: 0;">Dear ${name},</h2>
            
            <p style="font-size: 16px; line-height: 1.6;">
              We regret to inform you that your transaction <strong>${product}</strong> has been terminated by the owner.
            </p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #dc3545;">Request Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; width: 40%;">Request Number:</td>
                  <td style="padding: 8px 0;">${requestNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Item:</td>
                  <td style="padding: 8px 0; border-top: 1px solid #ddd;">${product}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Payment Method:</td>
                  <td style="padding: 8px 0; border-top: 1px solid #ddd;">${paymentMethod || 'Not specified'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Rental Period:</td>
                  <td style="padding: 8px 0; border-top: 1px solid #ddd;">${rentalPeriod}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Requested Duration:</td>
                  <td style="padding: 8px 0; border-top: 1px solid #ddd;">${rentDuration}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Price Per Day:</td>
                  <td style="padding: 8px 0; border-top: 1px solid #ddd;">₱${Number(pricePerDay).toLocaleString()}</td>
                </tr>
                 <tr style="background-color: #d4edda;">
                  <td style="padding: 12px 8px; font-weight: bold; font-size: 18px; border-top: 2px solid #28a745;">Total Amount:</td>
                  <td style="padding: 12px 8px; font-weight: bold; font-size: 18px; color: #28a745; border-top: 2px solid #28a745;">₱${amount.toLocaleString()}</td>
                </tr>
              </table>
            </div>
            
            <div style="background-color: #f8d7da; padding: 15px; border-radius: 6px; border-left: 4px solid #dc3545;">
              <p style="margin: 0; font-size: 14px; color: #721c24;">
                <strong>Status:</strong> Your transaction has been <strong>TERMINATED</strong>. Contact the owner for more information.
              </p>
            </div>
            
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107; margin-top: 15px;">
              <p style="margin: 0; font-size: 14px;">
                <strong>ⓘ Confidentiality Notice:</strong> This email and any attached documents are intended solely for the individual to whom they are addressed. If you are not the intended recipient, please notify us immediately and delete this message. Any unauthorized review, use, disclosure, or distribution is strictly prohibited.
              </p>
            </div>
            
            <p style="margin-top: 25px; font-size: 14px; color: #666;">
              If you have any questions regarding this decision, please contact us at <a href="mailto:ezrentofficialmail@gmail.com">ezrentofficialmail@gmail.com</a>.
            </p>
          </div>
          
          <div style="background-color: #6c757d; padding: 15px; text-align: center; border-radius: 0 0 8px 8px;">
            <p style="margin: 0; font-size: 14px; color: white;">
             EzRent Company<br>Pinamalayan, Oriental Mindoro<br>Email: ezrentofficialmail@gmail.com | Office Hours: Monday–Saturday, 8:00 AM–5:00 PM
            </p>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #f8d7da; border-radius: 6px; border-left: 4px solid #dc3545;">
            <p style="margin: 0; font-size: 13px; color: #721c24;">
              <strong>Important:</strong> This is an automated email—please do not reply. Keep this notification for your records.
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true, 
      message: "Successfully rejected the request", 
      booking: {
        id: booking.id,
        product: booking.product,
        name: booking.name,
        email: booking.email,
        status: booking.status
      }
    });

  } catch (error) {
    console.error('Error rejecting booking:', error);
    return res.status(500).json({success:false, message: error.message});
  }
}

const fetchAllBooking = async (req, res) => {
  try {
    const response = await Books.findAll();

    return res.status(200).json({success:true, message: "Success in fetching all booking", data: response});
  }catch (error) {
    return res.status(500).json({success:false, message:error.message});
  }
}

const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    
    // ✅ Correct: where clause should be an object with the field name
    const booking = await Books.findOne({ where: { id: id } });
    // Or shorter: { where: { id } }
    
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: "Booking not found" 
      });
    }

    await booking.destroy();

    return res.status(200).json({ 
      success: true, 
      message: "Success deleting booking" 
    });
    
  } catch (error) {
    console.error("Error deleting booking:", error);
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
}

const activeTimers = new Map();

const sendDeadlineNotification = async (booking, message) => {
  try {
    console.log(`🔔 Deadline alert for booking ${booking.id}: ${message}`);
    
    // Send email to customer
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: booking.email,
      subject: `⏰ Rental Deadline Alert - ${booking.product}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #f57c00;">Rental Deadline Alert</h2>
          <p>${message}</p>
          <p><strong>Item:</strong> ${booking.product}</p>
          <p><strong>Return Date:</strong> ${new Date(booking.returnDate).toLocaleDateString()}</p>
        </div>
      `
    });

    console.log('✅ Notification sent successfully');

  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

const startDeadlineTimer = (booking) => {
  const bookingId = booking.id;
  
  // Clear existing timer if any
  if (activeTimers.has(bookingId)) {
    const timers = activeTimers.get(bookingId);
    timers.forEach(timer => clearTimeout(timer));
    activeTimers.delete(bookingId);
  }

  const returnDate = new Date(booking.returnDate);
  const now = new Date();
  
  // Calculate when to send notifications
  const threeDaysBefore = new Date(returnDate);
  threeDaysBefore.setDate(threeDaysBefore.getDate() - 3);
  threeDaysBefore.setHours(8, 0, 0, 0); // 8 AM
  
  const oneDayBefore = new Date(returnDate);
  oneDayBefore.setDate(oneDayBefore.getDate() - 1);
  oneDayBefore.setHours(8, 0, 0, 0); // 8 AM
  
  const dueDate = new Date(returnDate);
  dueDate.setHours(8, 0, 0, 0); // 8 AM on due date
  
  const oneDayAfter = new Date(returnDate);
  oneDayAfter.setDate(oneDayAfter.getDate() + 1);
  oneDayAfter.setHours(8, 0, 0, 0); // 8 AM

  const timers = [];

  // Schedule: 3 days before
  if (threeDaysBefore > now) {
    const timer1 = setTimeout(() => {
      sendDeadlineNotification(booking, 
        '📅 Reminder: Your rental is due in 3 days. Please prepare for return.'
      );
    }, threeDaysBefore - now);
    timers.push(timer1);
    console.log(`⏰ Timer set: 3 days before (${threeDaysBefore.toLocaleString()})`);
  }

  // Schedule: 1 day before
  if (oneDayBefore > now) {
    const timer2 = setTimeout(() => {
      sendDeadlineNotification(booking, 
        '⚠️ Important: Your rental is due tomorrow! Please arrange return.'
      );
    }, oneDayBefore - now);
    timers.push(timer2);
    console.log(`⏰ Timer set: 1 day before (${oneDayBefore.toLocaleString()})`);
  }

  // Schedule: Due date
  if (dueDate > now) {
    const timer3 = setTimeout(() => {
      sendDeadlineNotification(booking, 
        '🚨 Your rental is due TODAY! Please return the item by end of day.'
      );
    }, dueDate - now);
    timers.push(timer3);
    console.log(`⏰ Timer set: Due date (${dueDate.toLocaleString()})`);
  }

  // Schedule: 1 day overdue
  if (oneDayAfter > now) {
    const timer4 = setTimeout(() => {
      sendDeadlineNotification(booking, 
        '🔴 OVERDUE: Your rental was due yesterday. Please return immediately to avoid additional charges.'
      );
    }, oneDayAfter - now);
    timers.push(timer4);
    console.log(`⏰ Timer set: 1 day overdue (${oneDayAfter.toLocaleString()})`);
  }

  // Store timers
  if (timers.length > 0) {
    activeTimers.set(bookingId, timers);
    console.log(`✅ Started ${timers.length} timers for booking ${bookingId}`);
  } else {
    console.log(`⚠️ No timers needed for booking ${bookingId} (return date passed)`);
  }
};

/**
 * Cancel timer for a booking (when returned/cancelled)
 */
const cancelDeadlineTimer = (bookingId) => {
  if (activeTimers.has(bookingId)) {
    const timers = activeTimers.get(bookingId);
    timers.forEach(timer => clearTimeout(timer));
    activeTimers.delete(bookingId);
    console.log(`🛑 Cancelled timers for booking ${bookingId}`);
  }
};

/**
 * Restore timers on server restart
 */
const restoreActiveTimers = async () => {
  try {
    console.log('🔄 Restoring deadline timers...');
    
    const { Op } = await import('sequelize');
    
    const activeBookings = await Books.findAll({
      where: {
        status: ['pending', 'confirmed', 'active'],
        returnDate: {
          [Op.gte]: new Date() // Only future/current rentals
        }
      }
    });

    console.log(`Found ${activeBookings.length} active bookings`);

    for (const booking of activeBookings) {
      startDeadlineTimer({
        id: booking.id,
        product: booking.product,
        email: booking.email,
        returnDate: booking.returnDate,
        userId: booking.customerId
      });
    }

    console.log('✅ Timers restored successfully');
  } catch (error) {
    console.error('Error restoring timers:', error);
  }
};

const bookItemUpdate = async (req, res) => {
  try {
    const {
      itemId,
      itemDetails,
      customerDetails,
      rentalDetails,
      paymentMethod,
      pricing,
      guarantors,
    } = req.body;

    console.log("Incoming booking update:", req.body);

    const existingBooking = await Books.findOne({ where: { itemId } });

    if (!existingBooking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    const pickupDate = new Date(rentalDetails.pickupDate);
    const returnDate = new Date(rentalDetails.returnDate);
    const rentalPeriod = rentalDetails.period; 
    const rentalDuration = rentalDetails.duration; 
    
    const ratePerPeriod = pricing?.rate ? parseFloat(pricing.rate) : parseFloat(itemDetails.pricePerDay);
    const deliveryCharge = pricing?.deliveryCharge ? parseFloat(pricing.deliveryCharge) : 25.00;
    const grandTotal = pricing?.grandTotal ? parseFloat(pricing.grandTotal) : 0;

    let calculatedAmount = grandTotal;
    if (!grandTotal) {
      const timeDiff = returnDate - pickupDate;
      let duration = rentalDuration;
      
      if (!duration) {
        if (rentalPeriod === "Hour") {
          duration = Math.max(Math.ceil(timeDiff / (1000 * 60 * 60)), 1);
        } else if (rentalPeriod === "Week") {
          duration = Math.max(Math.ceil(timeDiff / (1000 * 60 * 60 * 24 * 7)), 1);
        } else {
          duration = Math.max(Math.ceil(timeDiff / (1000 * 60 * 60 * 24)), 1);
        }
      }
      
      calculatedAmount = (ratePerPeriod * duration) + deliveryCharge;
    }

    console.log(`Rental calculation: ${rentalDuration} ${rentalPeriod}(s) × ₱${ratePerPeriod} + ₱${deliveryCharge} delivery = ₱${calculatedAmount}`);

    const guarantor1 = guarantors && guarantors[0] ? guarantors[0] : {};
    const guarantor2 = guarantors && guarantors[1] ? guarantors[1] : {};

    await existingBooking.update({
      itemId,
      customerId: customerDetails.customerId,
      ownerId: itemDetails.ownerId,
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
      rentalPeriod: rentalPeriod,
      pickUpDate: rentalDetails.pickupDate,
      returnDate: rentalDetails.returnDate,
      amount: calculatedAmount,
      rentalDuration: rentalDuration,
      ratePerPeriod: ratePerPeriod,
      deliveryCharge: deliveryCharge,
      grandTotal: calculatedAmount,
      guarantor1FullName: guarantor1.fullName || null,
      guarantor1PhoneNumber: guarantor1.phoneNumber || null,
      guarantor1Address: guarantor1.address || null,
      guarantor1Email: guarantor1.email || null,
      guarantor2FullName: guarantor2.fullName || null,
      guarantor2PhoneNumber: guarantor2.phoneNumber || null,
      guarantor2Address: guarantor2.address || null,
      guarantor2Email: guarantor2.email || null,
      status: "booked",
      paymentMethod,
    });

    const updatedBooking = existingBooking;

    startDeadlineTimer({
      id: updatedBooking.id,
      product: updatedBooking.product,
      email: updatedBooking.email,
      returnDate: updatedBooking.returnDate,
      userId: updatedBooking.customerId
    });

    // Owner details
    const ownerDetails = await Owner.findOne({ where: { id: itemDetails.ownerId } });
    if (!ownerDetails) throw new Error("Owner not found");

    const formattedPickupDate = rentalPeriod === "Hour" 
      ? pickupDate.toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })
      : pickupDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    
    const formattedReturnDate = rentalPeriod === "Hour"
      ? returnDate.toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })
      : returnDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    
    const rentDuration = `${formattedPickupDate} to ${formattedReturnDate}`;
    const durationLabel = rentalPeriod === "Hour" ? "hours" : rentalPeriod === "Week" ? "weeks" : "days";

    const guarantorInfo = [];
    if (guarantor1.fullName) {
      guarantorInfo.push(`
        <div style="margin-top: 10px;">
          <h4 style="margin-bottom: 5px;">Guarantor 1:</h4>
          <p style="margin: 2px 0;"><strong>Name:</strong> ${guarantor1.fullName}</p>
          <p style="margin: 2px 0;"><strong>Phone:</strong> ${guarantor1.phoneNumber || 'N/A'}</p>
          <p style="margin: 2px 0;"><strong>Email:</strong> ${guarantor1.email || 'N/A'}</p>
          <p style="margin: 2px 0;"><strong>Address:</strong> ${guarantor1.address || 'N/A'}</p>
        </div>
      `);
    }
    // Send confirmation emails
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: customerDetails.email.trim(),
      subject: `Booking Request Updated - ${itemDetails.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h2 style="color: #28a745;">Booking Updated Successfully</h2>
          <p>Your booking for <strong>${itemDetails.title}</strong> has been updated.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Rental Summary</h3>
            <p><strong>Duration:</strong> ${rentalDuration} ${durationLabel} (${rentDuration})</p>
            <p><strong>Rate per ${rentalPeriod}:</strong> ₱${ratePerPeriod.toLocaleString()}</p>
            <p><strong>Delivery Charge:</strong> ₱${deliveryCharge.toLocaleString()}</p>
            <p style="font-size: 18px; color: #057474;"><strong>Grand Total:</strong> ₱${calculatedAmount.toLocaleString()}</p>
          </div>

          <p><strong>Payment Method:</strong> ${paymentMethod}</p>
          
          ${guarantorInfo.length > 0 ? `
            <div style="margin-top: 20px;">
              <h3>Guarantor Information</h3>
              ${guarantorInfo.join('')}
            </div>
          ` : ''}
          
          <p style="color: #666; margin-top: 20px;">
            ⏰ You will receive reminders before your return date.
          </p>
        </div>
      `
    };

    const ownerMailOptions = {
      from: process.env.EMAIL_USER,
      to: ownerDetails.email.trim(),
      subject: `New Booking Request - ${itemDetails.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h2 style="color: #ffc107;">New Booking Notification</h2>
          <p><strong>${customerDetails.fullName}</strong> has made a booking request for <strong>${itemDetails.title}</strong>.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Rental Details</h3>
            <p><strong>Duration:</strong> ${rentalDuration} ${durationLabel} (${rentDuration})</p>
            <p><strong>Rate per ${rentalPeriod}:</strong> ₱${ratePerPeriod.toLocaleString()}</p>
            <p><strong>Delivery Charge:</strong> ₱${deliveryCharge.toLocaleString()}</p>
            <p style="font-size: 18px; color: #057474;"><strong>Grand Total:</strong> ₱${calculatedAmount.toLocaleString()}</p>
          </div>

          <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Customer Information</h3>
            <p><strong>Name:</strong> ${customerDetails.fullName}</p>
            <p><strong>Email:</strong> ${customerDetails.email}</p>
            <p><strong>Phone:</strong> ${customerDetails.phone}</p>
            <p><strong>Address:</strong> ${customerDetails.location}</p>
            <p><strong>Payment Method:</strong> ${paymentMethod}</p>
          </div>

          ${guarantorInfo.length > 0 ? `
            <div style="background-color: #e7f3ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Guarantor Information</h3>
              ${guarantorInfo.join('')}
            </div>
          ` : ''}
          
          <p style="margin-top: 20px;">Please review and approve/reject this booking request in your dashboard.</p>
        </div>
      `
    };

    // Send emails
    try {
      await transporter.sendMail(mailOptions);
      console.log("Customer email sent");
    } catch (err) {
      console.error("Error sending customer email:", err.message);
    }

    try {
      await transporter.sendMail(ownerMailOptions);
      console.log("Owner email sent");
    } catch (err) {
      console.error("Error sending owner email:", err.message);
    }

    const guarantorEmails = [];
    
    if (guarantor1.email && guarantor1.fullName) {
      const guarantor1MailOptions = {
        from: process.env.EMAIL_USER,
        to: guarantor1.email.trim(),
        subject: `You are listed as a Guarantor - ${itemDetails.title} Rental`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
            <h2 style="color: #057474;">Guarantor Notification</h2>
            <p>Dear <strong>${guarantor1.fullName}</strong>,</p>
            <p>You have been listed as a <strong>Guarantor</strong> for a rental booking made by <strong>${customerDetails.fullName}</strong>.</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Rental Details</h3>
              <p><strong>Item:</strong> ${itemDetails.title}</p>
              <p><strong>Category:</strong> ${itemDetails.category}</p>
              <p><strong>Duration:</strong> ${rentalDuration} ${durationLabel} (${rentDuration})</p>
              <p><strong>Total Amount:</strong> ₱${calculatedAmount.toLocaleString()}</p>
            </div>

            <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Renter Information</h3>
              <p><strong>Name:</strong> ${customerDetails.fullName}</p>
              <p><strong>Email:</strong> ${customerDetails.email}</p>
              <p><strong>Phone:</strong> ${customerDetails.phone}</p>
              <p><strong>Address:</strong> ${customerDetails.location}</p>
            </div>

            <p style="color: #666; margin-top: 20px;">
              ⚠️ As a guarantor, you may be contacted regarding this rental agreement. 
              Please ensure the contact information provided is correct.
            </p>
            
            <p style="color: #666;">
              If you have any questions or did not authorize being listed as a guarantor, 
              please contact <strong>${customerDetails.fullName}</strong> at ${customerDetails.phone} or ${customerDetails.email}.
            </p>
          </div>
        `
      };
      guarantorEmails.push(guarantor1MailOptions);
    }

    // Send guarantor emails
    for (const emailOptions of guarantorEmails) {
      try {
        await transporter.sendMail(emailOptions);
        console.log(`Guarantor email sent to ${emailOptions.to}`);
      } catch (err) {
        console.error(`Error sending guarantor email to ${emailOptions.to}:`, err.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      updatedBooking,
    });

  } catch (error) {
    console.error("Booking update error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    // Fetch all bookings for this customer, ordered by newest first
    const notifications = await Books.findAll({
      where: {
        customerId: userId
      },
      order: [['created_at', 'DESC']], // Newest first
      // Optionally limit to recent notifications
      // limit: 50
    });


    return res.status(200).json({
      success: true,
      data: notifications,
      count: notifications.length
    });

  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      error: error.message
    });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Books.findByPk(notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    // If you want to add a 'read' status, add this column to your database
    await notification.update({
      isRead: true,
      readAt: new Date()
    });

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification
    });

  } catch (error) {
    console.error("Error marking notification as read:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
      error: error.message
    });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const { userId } = req.params;

    const count = await Books.count({
      where: {
        customerId: userId,
        isRead: false // Requires 'isRead' column in database
      }
    });

    return res.status(200).json({
      success: true,
      unreadCount: count
    });

  } catch (error) {
    console.error("Error getting unread count:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get unread count",
      error: error.message
    });
  }
};

const cleanupOldNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const daysToKeep = 30; // Keep notifications for 30 days

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const deleted = await Books.destroy({
      where: {
        customerId: userId,
        created_at: {
          [Op.lt]: cutoffDate
        },
        status: ['completed', 'cancelled'] // Only delete completed/cancelled
      }
    });

    return res.status(200).json({
      success: true,
      message: `Deleted ${deleted} old notifications`,
      deletedCount: deleted
    });

  } catch (error) {
    console.error("Error cleaning up notifications:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to cleanup notifications",
      error: error.message
    });
  }
};

const addNotificationReadStatus = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('bookings', 'isRead', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });
    
    await queryInterface.addColumn('bookings', 'readAt', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('bookings', 'isRead');
    await queryInterface.removeColumn('bookings', 'readAt');
  }
};


const startBookedItem = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id: bookingId } = req.params;

    // 1. Get booking
    const booking = await Books.findByPk(bookingId, { transaction });

    if (!booking) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // 2. Get item
    const item = await Item.findByPk(booking.itemId, { transaction });

    if (!item) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    // 3. Check availability
    if (item.availableQuantity <= 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Item is out of stock",
      });
    }

    // 4. Update booking status
    await booking.update(
      {
        status: "ongoing",
        isRead: false,
      },
      { transaction }
    );

    // 5. Decrement available quantity
    await item.update(
      {
        availableQuantity: item.availableQuantity - 1,
        availability: item.availableQuantity - 1 > 0, // optional auto-toggle
      },
      { transaction }
    );

    // 6. Commit transaction
    await transaction.commit();

    res.json({
      success: true,
      message: "Booking confirmed and item quantity updated",
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ====================================
// CONFIGURATION
// ====================================
const VIOLATION_CONFIG = {
  // Grace period in hours before marking as late
  gracePeriodHours: 2,
  
  // Late fee structure
  lateFees: {
    perDay: 50,      // ₱50 per day late
    perHour: 10,     // ₱10 per hour late (for hourly rentals)
    perWeek: 300,    // ₱300 per week late
  },
  
  // Maximum late fee cap (optional)
  maxLateFee: 5000,  // ₱5000 maximum late fee
  
  // Penalty multiplier after certain days
  penaltyMultiplier: {
    after7Days: 1.5,   // 1.5x fee after 7 days
    after14Days: 2.0,  // 2x fee after 14 days
    after30Days: 3.0,  // 3x fee after 30 days
  }
};

// ====================================
// MONITOR ACTIVE RENTALS
// ====================================
/**
 * Check all active/ongoing rentals for late returns
 * This should be run periodically (e.g., every hour via cron job)
 */
const monitorActiveRentals = async () => {
  try {
    console.log('🔍 Starting rental monitoring check...');
    
    const now = new Date();
    const gracePeriod = new Date(now.getTime() + (VIOLATION_CONFIG.gracePeriodHours * 60 * 60 * 1000));
    
    // Find all active/ongoing rentals
    const activeRentals = await Books.findAll({
      where: {
        status: {
          [Op.in]: ['approved', 'ongoing', 'Approved to Rent']
        }
      }
    });

    console.log(`📊 Found ${activeRentals.length} active rentals to monitor`);

    for (const rental of activeRentals) {
      const returnDate = new Date(rental.returnDate);
      const daysLate = calculateDaysLate(returnDate, now);
      
      // Check if rental is approaching due date (within 24 hours)
      if (returnDate > now && returnDate <= gracePeriod) {
        await sendDueDateReminder(rental, returnDate);
      }
      
      // Check if rental is overdue
      if (returnDate < now && daysLate > 0) {
        const violationFee = calculateViolationFee(rental, daysLate);
        await handleLateReturn(rental, daysLate, violationFee);
      }
    }

    console.log('✅ Rental monitoring completed');
    return { success: true, checked: activeRentals.length };

  } catch (error) {
    console.error('❌ Error monitoring rentals:', error);
    return { success: false, error: error.message };
  }
};

// ====================================
// CALCULATE LATE DAYS/HOURS
// ====================================
/**
 * Calculate how late a rental is based on return date
 */
const calculateDaysLate = (returnDate, currentDate = new Date()) => {
  const gracePeriodMs = VIOLATION_CONFIG.gracePeriodHours * 60 * 60 * 1000;
  const returnWithGrace = new Date(returnDate.getTime() + gracePeriodMs);
  
  if (currentDate <= returnWithGrace) {
    return 0; // Not late yet (within grace period)
  }
  
  const msLate = currentDate - returnWithGrace;
  const daysLate = Math.ceil(msLate / (1000 * 60 * 60 * 24));
  
  return Math.max(0, daysLate);
};

/**
 * Calculate hours late for hourly rentals
 */
const calculateHoursLate = (returnDate, currentDate = new Date()) => {
  const gracePeriodMs = VIOLATION_CONFIG.gracePeriodHours * 60 * 60 * 1000;
  const returnWithGrace = new Date(returnDate.getTime() + gracePeriodMs);
  
  if (currentDate <= returnWithGrace) {
    return 0;
  }
  
  const msLate = currentDate - returnWithGrace;
  const hoursLate = Math.ceil(msLate / (1000 * 60 * 60));
  
  return Math.max(0, hoursLate);
};

// ====================================
// CALCULATE VIOLATION FEE
// ====================================
/**
 * Calculate violation fee based on rental period type and days late
 */
const calculateViolationFee = (rental, daysLate = null) => {
  const now = new Date();
  const returnDate = new Date(rental.returnDate);
  
  // Calculate days late if not provided
  if (daysLate === null) {
    daysLate = calculateDaysLate(returnDate, now);
  }
  
  if (daysLate <= 0) {
    return 0; // No violation
  }

  let baseFee = 0;
  const rentalPeriod = rental.rentalPeriod || 'Day';

  // Calculate base fee based on rental period type
  switch (rentalPeriod.toLowerCase()) {
    case 'hour':
      const hoursLate = calculateHoursLate(returnDate, now);
      baseFee = hoursLate * VIOLATION_CONFIG.lateFees.perHour;
      break;
      
    case 'week':
      const weeksLate = Math.ceil(daysLate / 7);
      baseFee = weeksLate * VIOLATION_CONFIG.lateFees.perWeek;
      break;
      
    case 'day':
    default:
      baseFee = daysLate * VIOLATION_CONFIG.lateFees.perDay;
      break;
  }

  // Apply penalty multipliers for extended lateness
  let multiplier = 1.0;
  if (daysLate >= 30) {
    multiplier = VIOLATION_CONFIG.penaltyMultiplier.after30Days;
  } else if (daysLate >= 14) {
    multiplier = VIOLATION_CONFIG.penaltyMultiplier.after14Days;
  } else if (daysLate >= 7) {
    multiplier = VIOLATION_CONFIG.penaltyMultiplier.after7Days;
  }

  let totalFee = baseFee * multiplier;

  // Apply maximum cap if configured
  if (VIOLATION_CONFIG.maxLateFee && totalFee > VIOLATION_CONFIG.maxLateFee) {
    totalFee = VIOLATION_CONFIG.maxLateFee;
  }

  return Math.round(totalFee * 100) / 100; // Round to 2 decimals
};

// ====================================
// HANDLE LATE RETURN
// ====================================
/**
 * Process a late return and update booking with violation fee
 */
const handleLateReturn = async (rental, daysLate, violationFee) => {
  try {
    // Update booking with late status and violation fee
    await rental.update({
      status: 'late',
      daysLate: daysLate,
      violationFee: violationFee,
      lateNotificationSent: true,
      lateDetectedAt: new Date()
    });

    // Send late notification email
    await sendLateNotificationEmail(rental, daysLate, violationFee);

    console.log(`⚠️ Booking ${rental.id} marked as LATE: ${daysLate} days, Fee: ₱${violationFee}`);

    return {
      success: true,
      bookingId: rental.id,
      daysLate,
      violationFee
    };

  } catch (error) {
    console.error('Error handling late return:', error);
    return { success: false, error: error.message };
  }
};

// ====================================
// SEND NOTIFICATIONS
// ====================================
/**
 * Send email notification for late return
 */
const sendLateNotificationEmail = async (rental, daysLate, violationFee) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: rental.email.trim(),
      subject: `🚨 OVERDUE: Late Return Fee - ${rental.product}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #dc3545; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">⚠️ EzRent - Late Return Notice</h1>
          </div>
          
          <div style="padding: 30px; border: 1px solid #ddd; background-color: #fff;">
            <h2 style="color: #dc3545; margin-top: 0;">OVERDUE RENTAL</h2>
            
            <p style="font-size: 16px; line-height: 1.6;">
              Dear <strong>${rental.name}</strong>,
            </p>
            
            <p style="font-size: 16px; line-height: 1.6;">
              Your rental of <strong>${rental.product}</strong> was due on 
              <strong>${new Date(rental.returnDate).toLocaleDateString()}</strong>.
            </p>
            
            <div style="background-color: #f8d7da; padding: 20px; border-radius: 6px; border-left: 4px solid #dc3545; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #721c24;">Late Return Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Days Late:</td>
                  <td style="padding: 8px 0; color: #dc3545; font-weight: bold;">${daysLate} days</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Original Amount:</td>
                  <td style="padding: 8px 0; border-top: 1px solid #ddd;">₱${rental.amount.toLocaleString()}</td>
                </tr>
                <tr style="background-color: #dc3545; color: white;">
                  <td style="padding: 12px 8px; font-weight: bold; font-size: 18px;">Late Fee:</td>
                  <td style="padding: 12px 8px; font-weight: bold; font-size: 18px;">₱${violationFee.toLocaleString()}</td>
                </tr>
                <tr style="background-color: #f8f9fa;">
                  <td style="padding: 12px 8px; font-weight: bold; font-size: 18px;">Total Amount Due:</td>
                  <td style="padding: 12px 8px; font-weight: bold; font-size: 18px; color: #dc3545;">₱${(parseFloat(rental.amount) + violationFee).toLocaleString()}</td>
                </tr>
              </table>
            </div>
            
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107; margin: 20px 0;">
              <h4 style="margin-top: 0; color: #856404;">⚠️ URGENT ACTION REQUIRED</h4>
              <p style="margin: 5px 0; font-size: 14px;">
                Please return the item immediately to avoid additional late fees. 
                Late fees continue to accumulate daily.
              </p>
            </div>
            
            <div style="background-color: #e7f3ff; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <h4 style="margin-top: 0;">Contact the Owner</h4>
              <p style="margin: 5px 0;">
                Please contact the owner immediately to arrange the return and payment of late fees.
              </p>
            </div>
            
            <p style="margin-top: 25px; font-size: 14px; color: #666;">
              For questions, contact: <a href="mailto:ezrentofficialmail@gmail.com">ezrentofficialmail@gmail.com</a>
            </p>
          </div>
          
          <div style="background-color: #dc3545; padding: 15px; text-align: center; border-radius: 0 0 8px 8px;">
            <p style="margin: 0; font-size: 14px; color: white;">
              EzRent Company | Pinamalayan, Oriental Mindoro
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Late notification sent to ${rental.email}`);

  } catch (error) {
    console.error('Error sending late notification:', error);
  }
};

/**
 * Send reminder before due date
 */
const sendDueDateReminder = async (rental, returnDate) => {
  // Check if we've already sent a reminder in the last 12 hours
  const twelveHoursAgo = new Date(Date.now() - (12 * 60 * 60 * 1000));
  if (rental.lastReminderSent && new Date(rental.lastReminderSent) > twelveHoursAgo) {
    return; // Don't spam reminders
  }

  try {
    const hoursUntilDue = Math.floor((returnDate - new Date()) / (1000 * 60 * 60));
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: rental.email.trim(),
      subject: `⏰ Reminder: Rental Due Soon - ${rental.product}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h2 style="color: #ffc107;">⏰ Rental Due Soon</h2>
          <p>Dear <strong>${rental.name}</strong>,</p>
          <p>Your rental of <strong>${rental.product}</strong> is due in approximately <strong>${hoursUntilDue} hours</strong>.</p>
          <p style="background-color: #fff3cd; padding: 15px; border-radius: 6px;">
            <strong>Due Date:</strong> ${returnDate.toLocaleString()}<br>
            <strong>Grace Period:</strong> ${VIOLATION_CONFIG.gracePeriodHours} hours after due date<br>
            <strong>Late Fee:</strong> ₱${VIOLATION_CONFIG.lateFees.perDay}/day if returned late
          </p>
          <p>Please arrange to return the item on time to avoid late fees.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    
    // Update last reminder sent time
    await rental.update({ lastReminderSent: new Date() });
    
    console.log(`📧 Due date reminder sent for booking ${rental.id}`);

  } catch (error) {
    console.error('Error sending due date reminder:', error);
  }
};

// ====================================
// API ENDPOINTS
// ====================================

/**
 * GET: Check rental status and calculate current violation fee
 */
const getRentalStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const booking = await Books.findByPk(bookingId);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const now = new Date();
    const returnDate = new Date(booking.returnDate);
    const daysLate = calculateDaysLate(returnDate, now);
    const violationFee = calculateViolationFee(booking, daysLate);
    
    // Calculate time remaining or overdue
    const msRemaining = returnDate - now;
    const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));
    
    const status = {
      bookingId: booking.id,
      product: booking.product,
      status: booking.status,
      returnDate: returnDate,
      currentDate: now,
      isLate: daysLate > 0,
      daysLate: daysLate,
      daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
      gracePeriodHours: VIOLATION_CONFIG.gracePeriodHours,
      originalAmount: parseFloat(booking.amount),
      currentViolationFee: violationFee,
      totalAmountDue: parseFloat(booking.amount) + violationFee,
      rentalPeriod: booking.rentalPeriod
    };

    return res.status(200).json({
      success: true,
      data: status
    });

  } catch (error) {
    console.error('Error getting rental status:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * POST: Manually trigger rental monitoring (for testing or manual runs)
 */
const triggerRentalMonitoring = async (req, res) => {
  try {
    const result = await monitorActiveRentals();
    
    return res.status(200).json({
      success: true,
      message: 'Rental monitoring completed',
      data: result
    });

  } catch (error) {
    console.error('Error triggering monitoring:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * GET: Get all late rentals with violation fees
 */
const getLateRentals = async (req, res) => {
  try {
    const lateRentals = await Books.findAll({
      where: {
        status: {
          [Op.in]: ['late', 'overdue']
        }
      },
      order: [['returnDate', 'ASC']]
    });

    const enrichedRentals = lateRentals.map(rental => {
      const daysLate = calculateDaysLate(new Date(rental.returnDate));
      const violationFee = calculateViolationFee(rental, daysLate);
      
      return {
        ...rental.toJSON(),
        daysLate,
        violationFee,
        totalAmountDue: parseFloat(rental.amount) + violationFee
      };
    });

    return res.status(200).json({
      success: true,
      count: enrichedRentals.length,
      data: enrichedRentals
    });

  } catch (error) {
    console.error('Error getting late rentals:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ====================================
// CRON JOB SETUP
// ====================================
/**
 * Set up automatic monitoring (call this when server starts)
 */
const setupRentalMonitoring = () => {
  console.log('🚀 Setting up automatic rental monitoring...');
  
  // Run every hour
  const intervalMs = 60 * 60 * 1000; // 1 hour
  
  setInterval(async () => {
    console.log('⏰ Running scheduled rental monitoring...');
    await monitorActiveRentals();
  }, intervalMs);
  
  // Run immediately on startup
  monitorActiveRentals();
  
  console.log('✅ Rental monitoring scheduled (every hour)');
};

// ====================================
// EXPORTS
// ====================================

export { 
  bookItem, 
  bookNotification, 
  bookedItems, 
  cancelBooking, 
  fetchBookRequest, 
  approveBooking, 
  rejectBooking, 
  terminateBooking, 
  requestBooking,
  approveBookingRequest,
  rejectBookingRequest,
  fetchAllBooking,
  deleteBooking,
  bookItemUpdate,
  startDeadlineTimer,
  cancelDeadlineTimer,
  restoreActiveTimers,
  getUserNotifications,
  markAsRead,
  getUnreadCount,
  cleanupOldNotifications,
  monitorActiveRentals,
  calculateDaysLate,
  calculateHoursLate,
  calculateViolationFee,
  handleLateReturn,
  getRentalStatus,
  triggerRentalMonitoring,
  getLateRentals,
  setupRentalMonitoring,
  VIOLATION_CONFIG,
  ongoingBook,
  bookedItemForApproval,
  startBookedItem,
  ongoingBookAndForApproval,
  ongoingBookAndForApprovalCustomer
};
