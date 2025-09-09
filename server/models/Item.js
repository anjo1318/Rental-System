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

  availability: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
    itemImage: {
  type: DataTypes.STRING,
  allowNull: true,
  defaultValue: "N/A",
  }
});

// Relations
Owner.hasMany(Item, { foreignKey: "ownerId" });
Item.belongsTo(Owner, { foreignKey: "ownerId" });

export default Item;
