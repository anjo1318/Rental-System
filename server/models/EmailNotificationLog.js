// models/EmailNotificationLog.js
import { DataTypes } from "sequelize";
import sequelize from "../database/database.js";

const EmailNotificationLog = sequelize.define(
  "EmailNotificationLog",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    bookingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ownerName: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    ownerEmail: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    renterName: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    product: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    productImage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    rentalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.0,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.0,
    },
    bookingDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    deadlineHours: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 24,
    },
    subject: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "⚠️ Payment Pending — Action Required Within 24 Hours",
    },
    status: {
      type: DataTypes.ENUM("sent", "failed", "pending"),
      allowNull: false,
      defaultValue: "pending",
    },
    sentAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "EmailNotificationLogs",
    freezeTableName: true,
    timestamps: true,
  },
);

export default EmailNotificationLog;
