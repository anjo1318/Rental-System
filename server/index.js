import express from "express";
import dotenv from "dotenv";
import { connectToDatabase } from "./database/database.js";
import adminRouter from "./routes/admin.js";
import userRouter from "./routes/user.js";
import ownerRouter from "./routes/owner.js";
import authRouter from "./routes/auth.js";
import customerRouter from "./routes/customer.js";
import itemRouter from "./routes/item.js";
import chatRouter from "./routes/chat.js";
import messageRouter from "./routes/message.js";
import bookRouter from "./routes/book.js";
import uploadRouter from "./routes/upload.js";
import paymentRouter from "./routes/payment.js";
import reviewRouter from "./routes/review.js";
import returnRouter from "./routes/return.js";
import historyRouter from "./routes/history.js";
import dashboardRouter from "./routes/dashboard.js";
import loginHistoryRouter from "./routes/loginHistory.js";
import notificationsRouter from "./routes/notifications.js";
import bookPhotoRouter from "./routes/bookPhotoRoutes.js";
import {
  restoreActiveTimers,
  setupRentalMonitoring,
} from "./controllers/bookController.js";
import cors from "cors";
import EmailNotificationLog from "./models/EmailNotificationLog.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ------------------ Middleware ------------------

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// ------------------ Health Check ------------------

app.get("/", (req, res) => {
  res.json({
    message: "Rental System API is running",
    timestamp: new Date().toISOString(),
    storage: "Cloudinary",
  });
});

// ------------------ API Routes ------------------

app.use("/api/admin", adminRouter);
app.use("/api/user", userRouter);
app.use("/api/owner", ownerRouter);
app.use("/api/auth", authRouter);
app.use("/api/customer", customerRouter);
app.use("/api/item", itemRouter);
app.use("/api/chat", chatRouter);
app.use("/api/message", messageRouter);
app.use("/api/book", bookRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/review", reviewRouter);
app.use("/api/return", returnRouter);
app.use("/api/history", historyRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/login-history", loginHistoryRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/book-photos", bookPhotoRouter);

// ------------------ 404 Handler ------------------

app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

// ------------------ Error Handler ------------------

app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: err.message,
  });
});

// ------------------ Database + Server Start ------------------

connectToDatabase()
  .then(async () => {
    app.listen(PORT, async () => {
      const PUBLIC_URL = process.env.PUBLIC_URL || `http://localhost:${PORT}`;
      console.log(`Server running on port ${PORT}`);
      console.log(`Images stored on Cloudinary`);
      console.log(`Health check: ${PUBLIC_URL}`);
      console.log(`Upload endpoint: ${PUBLIC_URL}/api/upload/image`);
      console.log("Restoring deadline timers...");
      await restoreActiveTimers();
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });

setupRentalMonitoring();
