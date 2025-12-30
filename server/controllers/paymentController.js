import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

// GCash Payment
const gcashPayment = async (req, res) => {
  try {
    const { amount, description, bookingData } = req.body;
    console.log("Incoming GCash booking data:", req.body);

    const response = await axios.post(
      "https://api.paymongo.com/v1/checkout_sessions",
      {
        data: {
          attributes: {
            line_items: [
              {
                name: description || "Rental Item",
                amount: parseInt(amount),
                currency: "PHP",
                quantity: 1,
              },
            ],
            payment_method_types: ["gcash"],
            success_url: `${process.env.FRONTEND_URL}/payment-success?booking_id=${bookingData?.itemId || ''}`,
            cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
            metadata: {
              booking_id: bookingData?.itemId || '',
              payment_type: 'gcash'
            }
          },
        },
      },
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            process.env.PAYMONGO_SECRET_KEY + ":"
          ).toString("base64")}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({
      success: true,
      checkout_url: response.data.data.attributes.checkout_url,
      session_id: response.data.data.id
    });
  } catch (err) {
    console.error("PayMongo GCash Error:", err.response?.data || err.message);
    res.status(500).json({ 
      success: false,
      error: "GCash payment initialization failed" 
    });
  }
};

// QRPh Payment - Generate QR Code
const qrphPayment = async (req, res) => {
  try {
    const { amount, description, bookingData } = req.body;

    console.log("Incoming QRPh booking data:", req.body);

    // 1️⃣ Create Payment Intent
    const paymentIntentResponse = await axios.post(
      "https://api.paymongo.com/v1/payment_intents",
      {
        data: {
          attributes: {
            amount: parseInt(amount),
            currency: "PHP",
            description: description || "Rental Payment",
            payment_method_allowed: ["qrph"],
            metadata: {
              booking_id: String(bookingData?.itemId || ""),
              payment_type: "qrph",
              customer_name: bookingData?.customerDetails?.fullName || "",
              customer_email: bookingData?.customerDetails?.email || "",
            },
          },
        },
      },
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            process.env.PAYMONGO_SECRET_KEY + ":"
          ).toString("base64")}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    const paymentIntent = paymentIntentResponse.data.data;
    console.log("Payment Intent Created:", paymentIntent.id);

    // 2️⃣ Create QRPh Payment Method
    const paymentMethodResponse = await axios.post(
      "https://api.paymongo.com/v1/payment_methods",
      {
        data: {
          attributes: {
            type: "qrph",
            billing: {
              name: bookingData?.customerDetails?.fullName || "Customer",
              email: bookingData?.customerDetails?.email || "customer@example.com",
              phone: bookingData?.customerDetails?.phone || "09171234567",
            },
          },
        },
      },
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            process.env.PAYMONGO_SECRET_KEY + ":"
          ).toString("base64")}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    const paymentMethod = paymentMethodResponse.data.data;
    console.log("Payment Method Created:", paymentMethod.id);

    // 3️⃣ Attach Payment Method
    const attachResponse = await axios.post(
      `https://api.paymongo.com/v1/payment_intents/${paymentIntent.id}/attach`,
      {
        data: {
          attributes: {
            payment_method: paymentMethod.id,
          },
        },
      },
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            process.env.PAYMONGO_SECRET_KEY + ":"
          ).toString("base64")}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    const attachedIntent = attachResponse.data.data;
    const nextAction = attachedIntent.attributes.next_action;
    const qrCodeData = nextAction?.code;

    console.log("QR Code generated successfully");

    res.json({
      success: true,
      paymentIntentId: paymentIntent.id,
      status: attachedIntent.attributes.status,
      qrCode: {
        id: qrCodeData?.id,
        imageUrl: qrCodeData?.image_url,
        amount: qrCodeData?.amount,
        label: qrCodeData?.label,
      },
    });

  } catch (err) {
    console.error("PayMongo QRPh Error:", err.response?.data || err.message);
    res.status(500).json({
      success: false,
      error: err.response?.data || "QRPh payment initialization failed",
    });
  }
};


const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY;

const checkPaymentStatus = async (req, res) => {
  try {
    const paymentIntentId = req.params.id;

    console.log('Checking payment intent:', paymentIntentId);

    const response = await axios.get(
      `https://api.paymongo.com/v1/payment_intents/${paymentIntentId}`,
      {
        headers: {
          Authorization:
            'Basic ' +
            Buffer.from(PAYMONGO_SECRET_KEY + ':').toString('base64'),
        },
      }
    );

    const status = response.data.data.attributes.status;

    console.log('Payment status:', status);

    return res.status(200).json({
      success: true,
      status,
      paymentIntent: response.data.data,
    });

  } catch (error) {
    console.error(
      'Payment Status Check Error:',
      error.response?.data || error.message
    );

    return res.status(500).json({
      success: false,
      error: error.response?.data || error.message,
    });
  }
};




// Webhook handler for PayMongo events
const paymongoWebhook = async (req, res) => {
  try {
    const event = req.body.data;
    console.log("Webhook received:", event.attributes.type);

    // Handle different event types
    switch (event.attributes.type) {
      case "payment.paid":
        // Payment successful - update booking status
        const paymentData = event.attributes.data;
        const metadata = paymentData.attributes.metadata;
        
        console.log("Payment successful for booking:", metadata.booking_id);
        
        // Here you would update your booking in the database
        // Example: await updateBookingStatus(metadata.booking_id, 'paid');
        
        break;
        
      case "payment.failed":
        console.log("Payment failed:", event.attributes.data.id);
        break;
        
      default:
        console.log("Unhandled event type:", event.attributes.type);
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Webhook Error:", err.message);
    res.status(400).json({ error: "Webhook processing failed" });
  }
};

export { 
  gcashPayment, 
  qrphPayment, 
  checkPaymentStatus,
  paymongoWebhook 
};