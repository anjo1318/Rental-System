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
 status: {
    type: DataTypes.ENUM('approved', 'pending', 'rejected'),
    allowNull: false
  },

});

export default Books;