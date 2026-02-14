import { DataTypes } from 'sequelize';
import sequelize from '../database/database.js';

const LoginHistory = sequelize.define('LoginHistory', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('customer', 'owner', 'admin'),
    allowNull: false
  },
  loginTime: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  ipAddress: {
    type: DataTypes.STRING(45), // IPv6 can be up to 45 characters
    allowNull: true
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  platform: {
    type: DataTypes.STRING,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'loginhistory',
  timestamps: true,
  indexes: [
    {
      fields: ['role']
    },
    {
      fields: ['loginTime']
    },
    {
      fields: ['ipAddress']
    }
  ]
});

export default LoginHistory;