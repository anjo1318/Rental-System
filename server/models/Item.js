// models/Item.js
import { DataTypes } from "sequelize";
import sequelize from "../database/database.js";
import Owner from "./Owner.js";

const Item = sequelize.define("Item", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  pricePerDay: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },

  category: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  location: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  availability: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },

  // Updated to handle multiple images as JSON array
  itemImages: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    get() {
      const value = this.getDataValue('itemImages');
      // Ensure we always return an array
      if (!value) return [];
      return Array.isArray(value) ? value : [value];
    },
    set(value) {
      // Handle both single string and array of strings
      if (typeof value === 'string') {
        this.setDataValue('itemImages', [value]);
      } else if (Array.isArray(value)) {
        this.setDataValue('itemImages', value);
      } else {
        this.setDataValue('itemImages', []);
      }
    }
  },

  // Add quantity field
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 0
    }
  },

  // Available quantity (tracks current availability)
  availableQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: function() {
      return this.quantity || 1;
    },
    validate: {
      min: 0,
      max: function(value) {
        if (value > this.quantity) {
          throw new Error('Available quantity cannot exceed total quantity');
        }
      }
    }
  }
});

// Hook to set availableQuantity equal to quantity when creating new item
Item.addHook('beforeCreate', (item) => {
  if (item.availableQuantity === undefined || item.availableQuantity === null) {
    item.availableQuantity = item.quantity;
  }
});

// Relations
Owner.hasMany(Item, { foreignKey: "ownerId" });
Item.belongsTo(Owner, { foreignKey: "ownerId" });

export default Item;