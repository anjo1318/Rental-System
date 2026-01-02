// models/Message.js
import { DataTypes } from "sequelize";
import sequelize from "../database/database.js";
import Chat from '../models/Chat.js';

const Message = sequelize.define("Message", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  chatId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  timestamps: true,
});

Chat.hasMany(Message, { foreignKey: "chatId" });
Message.belongsTo(Chat, { foreignKey: "chatId" });

export default Message;
