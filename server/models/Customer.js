import { DataTypes } from 'sequelize';
import sequelize from '../database/database.js';

const Customer = sequelize.define('Customer', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  middleName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  emailAddress: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  birthday: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },

  // Address fields
  houseNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  street: {
    type: DataTypes.STRING,
    allowNull: true
  },
  barangay: {
    type: DataTypes.STRING,
    allowNull: true
  },
  town: {
    type: DataTypes.STRING,
    allowNull: true
  },
  country: {
    type: DataTypes.STRING,
    allowNull: true
  },
  province: {
    type: DataTypes.STRING,
    allowNull: true
  },
  zipCode: {
    type: DataTypes.STRING,
    allowNull: true
  },

  // Guarantor 1
  guarantor1FullName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  guarantor1Address: {
    type: DataTypes.STRING,
    allowNull: true
  },
  guarantor1MobileNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },

  // Guarantor 2
  guarantor2FullName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  guarantor2Address: {
    type: DataTypes.STRING,
    allowNull: true
  },
  guarantor2MobileNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },

  // ID info
  idType: {
    type: DataTypes.STRING,
    allowNull: true
  },
  idNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  idPhoto: {
    type: DataTypes.STRING, // store file path / URL
    allowNull: true
  },
  role: {
    type: DataTypes.STRING,
    allowNull: true
  }

}, {
  tableName: 'customer',
  timestamps: true
});

export default Customer;
