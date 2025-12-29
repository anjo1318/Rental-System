import axios from "axios";
import dotenv from "dotenv";
const { Server } = require("socket.io");


dotenv.config();



let io;

module.exports = {
  init: (server) => {
    io = new Server(server, {
      cors: { origin: "*" },
    });

    io.on("connection", (socket) => {
      console.log("Connected:", socket.id);

      socket.on("join-booking", ({ bookingId, role }) => {
        socket.join(`booking-${bookingId}`);
        socket.role = role;
      });

      // CUSTOMER selects GCash
      socket.on("request-gcash", async ({ bookingId, ownerQR }) => {
        // Send QR to customer
        io.to(`booking-${bookingId}`).emit("show-gcash-qr", {
          qr: ownerQR,
        });

        // Notify owner
        io.to(`booking-${bookingId}`).emit("gcash-requested");
      });

      // OWNER accepts payment
      socket.on("owner-accept", async ({ bookingData }) => {
        // ✅ SAVE TO DATABASE HERE
        await Booking.create({
          ...bookingData,
          paymentMethod: "GCash",
          paymentStatus: "PAID",
        });

        io.to(`booking-${bookingData.itemId}`).emit("payment-success");
      });

      // OWNER rejects payment
      socket.on("owner-reject", ({ bookingId }) => {
        io.to(`booking-${bookingId}`).emit("payment-failed");
      });

      socket.on("disconnect", () => {
        console.log("Disconnected:", socket.id);
      });
    });
  },
};

