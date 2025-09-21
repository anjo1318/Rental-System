// models/Message.js
import { DataTypes } from "sequelize";
import sequelize from "../database/database.js";

const Message = sequelize.define("Message", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  chatId: { type: DataTypes.STRING, allowNull: false }, // Can be itemId or generated chat ID
  sender: { type: DataTypes.ENUM("user", "owner"), allowNull: false },
  text: { type: DataTypes.TEXT, allowNull: false },
});

export default Message;
