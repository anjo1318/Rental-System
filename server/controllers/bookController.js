import { response } from "express";
import Books from "../models/Book.js";
import Owner from "../models/Owner.js";
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

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
      paymentMethod, // frontend sends this
      customerId,
      ownerId,
    } = req.body;

    console.log("Incoming booking data:", req.body);

    // Calculate the number of days between pickup and return dates
    const pickupDate = new Date(rentalDetails.pickupDate);
    const returnDate = new Date(rentalDetails.returnDate);
    
    // Calculate the difference in milliseconds
    const timeDifference = returnDate.getTime() - pickupDate.getTime();
    
    // Convert milliseconds to days (1 day = 24 * 60 * 60 * 1000 milliseconds)
    const numberOfDays = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
    
    // Ensure minimum 1 day (in case same day pickup/return)
    const rentalDays = Math.max(numberOfDays, 1);
    
    // Calculate total amount
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

    // Extract email variables from the data
    const name = customerDetails.fullName;
    const email = customerDetails.email;
    const phone = customerDetails.phone;
    const address = customerDetails.location;
    const product = itemDetails.title;
    const category = itemDetails.category;
    const location = itemDetails.location;
    const rentalPeriod = rentalDetails.period;
    const requestNumber = response.id;
    
    // Format dates for email display
    const formattedPickupDate = pickupDate.toLocaleDateString();
    const formattedReturnDate = returnDate.toLocaleDateString();
    const rentDuration = `${formattedPickupDate} to ${formattedReturnDate}`;

    // Get owner details
    const ownerDetails = await Owner.findOne({where: {id: itemDetails.ownerId}});
    console.log("Ownerdetails", ownerDetails);

    if (!ownerDetails) {
      throw new Error("Owner not found");
    }

    // Owner details
    const ownerFirstName = ownerDetails.firstName;
    const ownerLastName = ownerDetails.lastName;
    const ownerEmail = ownerDetails.email;
    const ownerFullName = `${ownerFirstName} ${ownerLastName}`;

    // Prepare customer email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email.trim(),
      subject: `Booking Request - ${product}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #28a745; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">EzRent</h1>
            <p style="margin: 5px 0 0 0; font-size: 16px;">Booking Confirmation</p>
          </div>
          
          <div style="padding: 30px; border: 1px solid #ddd; background-color: #fff;">
            <h2 style="color: #333; margin-top: 0;">Dear ${name},</h2>
            
            <p style="font-size: 16px; line-height: 1.6;">
              Your request to rent <strong>${product}</strong> is <strong>PENDING</strong>.
            </p>
            
            <div style="background-color: #d4edda; padding: 15px; border-radius: 6px; border-left: 4px solid #28a745; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #155724;">
                <strong>Status:</strong> Your booking is <strong>PENDING</strong>. Please wait for the response of the owner.
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
                  <td style="padding: 8px 0; border-top: 1px solid #ddd;">${rentDuration} (${rentalDays} days)</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Price Per Day:</td>
                  <td style="padding: 8px 0; border-top: 1px solid #ddd;">₱${Number(pricePerDay).toLocaleString()}</td>
                </tr>
                <tr style="background-color: #d4edda;">
                  <td style="padding: 12px 8px; font-weight: bold; font-size: 18px; border-top: 2px solid #28a745;">Total Amount:</td>
                  <td style="padding: 12px 8px; font-weight: bold; font-size: 18px; color: #28a745; border-top: 2px solid #28a745;">₱${totalAmount.toLocaleString()}</td>
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

    // Prepare owner email options
    const ownerMailOptions = {
      from: process.env.EMAIL_USER,
      to: ownerEmail.trim(),
      subject: `New Booking Request - ${product}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #ffc107; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">EzRent</h1>
            <p style="margin: 5px 0 0 0; font-size: 16px;">New Booking Request</p>
          </div>
          
          <div style="padding: 30px; border: 1px solid #ddd; background-color: #fff;">
            <h2 style="color: #333; margin-top: 0;">Dear ${ownerFullName},</h2>
            
            <p style="font-size: 16px; line-height: 1.6;">
              You have received a new booking request for <strong>${product}</strong>.
            </p>
            
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #856404;">
                <strong>⏳ Action Required:</strong> Please review this booking request and respond accordingly through your EzRent dashboard.
              </p>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #ffc107;">Booking Details</h3>
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
                  <td style="padding: 8px 0; border-top: 1px solid #ddd;">${rentDuration} (${rentalDays} days)</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Price Per Day:</td>
                  <td style="padding: 8px 0; border-top: 1px solid #ddd;">₱${Number(pricePerDay).toLocaleString()}</td>
                </tr>
                <tr style="background-color: #fff3cd;">
                  <td style="padding: 12px 8px; font-weight: bold; font-size: 18px; border-top: 2px solid #ffc107;">Total Amount:</td>
                  <td style="padding: 12px 8px; font-weight: bold; font-size: 18px; color: #856404; border-top: 2px solid #ffc107;">₱${totalAmount.toLocaleString()}</td>
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
            
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107; margin-top: 15px;">
              <p style="margin: 0; font-size: 14px;">
                <strong>ⓘ Confidentiality Notice:</strong> This email and any attached documents are intended solely for the individual to whom they are addressed. If you are not the intended recipient, please notify us immediately and delete this message. Any unauthorized review, use, disclosure, or distribution is strictly prohibited.
              </p>
            </div>
            
            <p style="margin-top: 25px; font-size: 14px; color: #666;">
              If you have any questions regarding this booking request, please contact us at <a href="mailto:ezrentofficialmail@gmail.com">ezrentofficialmail@gmail.com</a>.
            </p>
          </div>
          
          <div style="background-color: #ffc107; padding: 15px; text-align: center; border-radius: 0 0 8px 8px;">
            <p style="margin: 0; font-size: 14px; color: #333;">
             EzRent Company<br>Pinamalayan, Oriental Mindoro<br>Email: ezrentofficialmail@gmail.com | Office Hours: Monday–Saturday, 8:00 AM–5:00 PM
            </p>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #d1ecf1; border-radius: 6px; border-left: 4px solid #17a2b8;">
            <p style="margin: 0; font-size: 13px; color: #0c5460;">
              <strong>Important:</strong> This is an automated email—please do not reply. Please use your EzRent dashboard to respond to this booking request.
            </p>
          </div>
        </div>
      `
    };

    // Send emails separately with proper error handling
    try {
      await transporter.sendMail(mailOptions);
      console.log("Customer email sent successfully");
    } catch (emailError) {
      console.error("Error sending customer email:", emailError);
      // Continue execution even if customer email fails
    }

    try {
      await transporter.sendMail(ownerMailOptions);
      console.log("Owner email sent successfully");
    } catch (emailError) {
      console.error("Error sending owner email:", emailError);
      // Continue execution even if owner email fails
    }

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

const approveBooking = async (req, res) => {
  try {
    const {id} = req.params;

    const booking = await Books.findOne({where:{id}});

    if(!booking){
      return res.status(404).json({success:false, message: "Booking not found"});
    }

    await booking.update({status: "approved"});

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

const startBooking = async (req, res) => {
  try {
    const {id} = req.params;

    const booking = await Books.findOne({where:{id}});

    if(!booking){
      return res.status(404).json({success:false, message: "Booking not found"});
    }

    await booking.update({status: "ongoing"});

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
      subject: `Booking Started - ${product}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #28a745; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">EzRent</h1>
            <p style="margin: 5px 0 0 0; font-size: 16px;">Booking Confirmation</p>
          </div>
          
          <div style="padding: 30px; border: 1px solid #ddd; background-color: #fff;">
            <h2 style="color: #333; margin-top: 0;">Dear ${name},</h2>
            
            <p style="font-size: 16px; line-height: 1.6;">
              Great news! Your request to rent <strong>${product}</strong> has <strong>STARTED</strong>.
            </p>
            
            <div style="background-color: #d4edda; padding: 15px; border-radius: 6px; border-left: 4px solid #28a745; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #155724;">
                <strong>Status:</strong> Your booking is now <strong>ONGOING</strong>. 
              </p>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #28a745;">Rent Details</h3>
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


export { 
  bookItem, 
  bookNotification, 
  bookedItems, 
  cancelBooking, 
  fetchBookRequest, 
  approveBooking, 
  rejectBooking, 
  startBooking, 
  terminateBooking, 
  requestBooking,
  approveBookingRequest,
  rejectBookingRequest,
  fetchAllBooking,
  deleteBooking
};
