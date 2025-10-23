import sequelize from "../database/database.js";
import { DataTypes } from "sequelize";

const Books = sequelize.define("Books", {
    id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    },
  itemId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  customerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  ownerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  product: {
    type: DataTypes.STRING,
    allowNull:false 
  },
  category: {
    type: DataTypes.STRING,
    allowNull:false 
  },
  location: {
    type: DataTypes.STRING,
    allowNull:false 
  },
  pricePerDay: {
    type: DataTypes.STRING,
    allowNull:false 
  },
  name: {
    type: DataTypes.STRING,
    allowNull:false 
  },
  email: {
    type: DataTypes.STRING,
    allowNull:false 
  },
  phone: {
    type: DataTypes.STRING,
    allowNull:false 
  },
  address: {
    type: DataTypes.STRING,
    allowNull:false 
  },
  gender: {
    type: DataTypes.STRING,
    allowNull:false 
  },
  itemImage: {
    type: DataTypes.STRING,
    allowNull:false 
  },
  rentalPeriod: {
    type: DataTypes.STRING,
    allowNull:false 
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  pickUpDate: {
    type: DataTypes.DATE,
    allowNull:false 
  },
  returnDate: {
    type: DataTypes.DATE,
    allowNull:false 
  },
  amount: {
    type: DataTypes.DECIMAL,
    allowNull:false 
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
 status: {
    type: DataTypes.ENUM(
      'approved', 
      'pending', 
      'rejected', 
      'ongoing', 
      'terminated', 
      'cancelled', 
      'booked',
      'Approved to Rent', 
      'Rejected to Rent',
      'cart'
    ),
    allowNull: false
  },

}, {
  timestamps: true,
  createdAt: 'created_at',  // if your column is named 'created_at'
  updatedAt: 'updated_at'   // if your column is named 'updated_at'
  // OR if your columns are named 'createdAt' and 'updatedAt', just use:
  // timestamps: true
});

export default Books;