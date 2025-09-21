// models/Chat.js
import { DataTypes } from "sequelize";
import sequelize from "../database/database.js";

const Chat = sequelize.define("Chat", {
  id: {
    type: DataTypes.STRING, // UUID
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
  // Optional: add a status or lastMessage column
  status: {
    type: DataTypes.ENUM("active", "closed"),
    defaultValue: "active",
  },
});

export default Chat;
