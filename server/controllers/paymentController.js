import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const gcashPayment = async (req, res) => {
  try {
    const {
      itemId,
      itemDetails,
      customerDetails,
      rentalDetails,
      paymentMethod, // frontend sends this
      customerId,
      ownerId,
      amount,
      description,
    } = req.body;

    console.log("Incoming booking data:", req.body);

    // 🔹 Extract dates from rentalDetails
    const pickupDate = new Date(rentalDetails.pickupDate);
    const returnDate = new Date(rentalDetails.returnDate);

    // 🔹 Calculate rental days
    const timeDifference = returnDate.getTime() - pickupDate.getTime();
    const numberOfDays = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
    const rentalDays = Math.max(numberOfDays, 1);

    // 🔹 Total price in pesos
    const pricePerDay = parseFloat(itemDetails.pricePerDay);
    const totalAmountPesos = rentalDays * pricePerDay;

    // 🔹 Convert to centavos (PayMongo requires this!)
    const totalAmountCentavos = Math.round(totalAmountPesos * 100);

    // ✅ PayMongo requires `line_items`
    const response = await axios.post(
      "https://api.paymongo.com/v1/checkout_sessions",
      {
        data: {
          attributes: {
            line_items: [
              {
                name: itemDetails.title || description || "Rental Item",
                amount: totalAmountCentavos,
                currency: "PHP",
                quantity: 1,
              },
            ],
            payment_method_types: ["gcash"],
            success_url: `${process.env.FRONTEND_URL}/payment-success`,
            cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
            customer_email: customerDetails?.email, // 🔹 optional, attaches customer info
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
      checkout_url: response.data.data.attributes.checkout_url,
    });
  } catch (err) {
    console.error("PayMongo Error:", err.response?.data || err.message);
    res.status(500).json({ error: "Payment initialization failed" });
  }
};

export { gcashPayment };
