import { DataTypes } from 'sequelize';
import sequelize from '../database/database.js';
import UserPushToken from '../models/UserPushToken.js';

const Customer = sequelize.define('Customer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  
  // Personal Information (Step 1)
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 50]
    }
  },

  middleName: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [0, 50]
    }
  },

  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 50]
    }
  },

  emailAddress: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true
    }
  },

  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [10, 15]
    }
  },
  
  birthday: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: true
    }
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [6, 255]
    }
  },

  country: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Philippines',
    validate: {
      len: [0, 100]
    }
  },

  province: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [0, 100]
    }
  },

  town: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [0, 100]
    }
  },

  barangay: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [0, 100]
    }
  },

  street: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [0, 100]
    }
  },

  
  // Address Information (Step 2)
  houseNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [0, 20]
    }
  },

  zipCode: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [0, 10]
    }
  },

  // ID Information (Step 3)
  idType: {
    type: DataTypes.ENUM(
      'national_id', 
      'drivers_license', 
      'passport', 
      'voters_id', 
      'sss_id', 
      'tin_id', 
      'philhealth_id',
      'senior_citizen_id',
      'pwd_id',
      'other'
    ),
    allowNull: true
  },
  idNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [0, 50]
    }
  },
  idPhoto: {
    type: DataTypes.TEXT, // For file path or base64
    allowNull: true
  },
  selfie: {
    type: DataTypes.TEXT, // For file path or base64 - ADDED THIS
    allowNull: true
  },
  
  // Status fields
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
}, {
  tableName: 'Customer',
  freezeTableName: true,
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['emailAddress']
    },
    {
      fields: ['phoneNumber']
    }
  ]
});

Customer.hasMany(UserPushToken, { foreignKey: 'userId' });
UserPushToken.belongsTo(Customer, { foreignKey: 'userId' });


export default Customer;