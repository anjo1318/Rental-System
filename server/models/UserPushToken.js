import { DataTypes } from 'sequelize';
import sequelize from '../database/database.js';
import Customer from '../models/Customer.js';

const UserPushToken = sequelize.define('UserPushToken', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Customer',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  
  token: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },

  platform: {
    type: DataTypes.ENUM('ios', 'android'),
    allowNull: true,
  },
}, {
  tableName: 'user_push_tokens',
});

export default UserPushToken;
