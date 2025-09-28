import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const gcashPayment = async (req, res) => {
  try {
    const { amount, description } = req.body; // ✅ only take what frontend sends

    console.log("Incoming booking data:", req.body);

    const response = await axios.post(
      "https://api.paymongo.com/v1/checkout_sessions",
      {
        data: {
          attributes: {
            line_items: [
              {
                name: description || "Rental Item",
                amount: parseInt(amount), // ✅ already in centavos (₱100 = 10000)
                currency: "PHP",
                quantity: 1,
              },
            ],
            payment_method_types: ["gcash"],
            success_url: `${process.env.FRONTEND_URL}/payment-success`,
            cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
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
