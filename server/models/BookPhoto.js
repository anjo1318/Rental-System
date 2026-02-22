// models/BookPhoto.js
import { DataTypes } from "sequelize";
import sequelize from "../database/database.js";

const BookPhoto = sequelize.define(
  "BookPhoto",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    bookId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Books", // your Books table name
        key: "id",
      },
      onDelete: "CASCADE",
    },

    pickupPhoto: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    returnPhoto: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "BookPhotos",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default BookPhoto;
