import Item from "../models/Item.js";
import Owner from "../models/Owner.js";

// READ - Get all items
const fetchItems = async (req, res) => {
  try {
    const response = await Item.findAll({
      include: [
        {
          model: Owner,
          attributes: [
            "id",
            "firstName",
            "lastName",
            "email",
            "idPhoto",
            "gcashQR"
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    

    return res.status(200).json({ 
      success: true, 
      data: response,
      message: "Items fetched successfully" 
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// READ - Get single item by ID
const fetchItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Item.findOne({
      where: { id },
       include: [
        {
          model: Owner,
          attributes: ["id", "firstName", "lastName", "emailAddress", "idPhoto", "gcashQR"], // Changed from "email" to "emailAddress"
        },
      ],
    });

    if (!item) {
      return res.status(404).json({ 
        success: false, 
        error: "Item not found" 
      });
    }

    return res.status(200).json({ 
      success: true, 
      data: item,
      message: "Item fetched successfully" 
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// READ - Get items by owner ID
const fetchOwnerItems = async (req, res) => {
  try {
    const { ownerId } = req.params;
    const queryOwnerId = req.query.ownerId || ownerId; // support both params and query

    const items = await Item.findAll({
      where: { ownerId: queryOwnerId },
      include: [
        {
          model: Owner,
          attributes: ["id", "firstName", "lastName", "emailAddress", "idPhoto", "gcashQR"], // Changed from "email" to "emailAddress"
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      data: items,
      message: "Owner items fetched successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

  // CREATE - Add new item
  const createItem = async (req, res) => {
    try {
      const { 
        title, 
        description,
        brand,
        specification,
        pricePerDay, 
        category, 
        location,
        availability = true, 
        itemImages,
        quantity = 1,
        ownerId 
      } = req.body;

      // Validation
      if (!title || !pricePerDay || !ownerId) {
        return res.status(400).json({
          success: false,
          error: "Title, price per day, and owner ID are required"
        });
      }

      // Validate quantity
      const parsedQuantity = parseInt(quantity);
      if (isNaN(parsedQuantity) || parsedQuantity < 0) {
        return res.status(400).json({
          success: false,
          error: "Quantity must be a valid non-negative number"
        });
      }

      // Check if owner exists
      const owner = await Owner.findByPk(ownerId);
      if (!owner) {
        return res.status(404).json({
          success: false,
          error: "Owner not found"
        });
      }

      // Process images - handle both single image and multiple images
      let processedImages = [];
      if (itemImages) {
        if (typeof itemImages === 'string') {
          // Single image URL
          processedImages = [itemImages];
        } else if (Array.isArray(itemImages)) {
          // Multiple image URLs - filter out empty strings
          processedImages = itemImages.filter(img => img && typeof img === 'string' && img.trim() !== '');
        }
      }
      
      // Add default placeholder if no images provided
      if (processedImages.length === 0) {
        processedImages = ["https://via.placeholder.com/150"];
      }

      const newItem = await Item.create({
        title,
        description,
        brand,
        specification,
        pricePerDay: parseFloat(pricePerDay),
        category,
        location,
        availability,
        itemImages: processedImages,
        quantity: parsedQuantity,
        availableQuantity: parsedQuantity,
        ownerId
      });

      // Fetch the created item with owner details
      const createdItem = await Item.findOne({
        where: { id: newItem.id },
        include: [
        {
          model: Owner,
          attributes: ["id", "firstName", "lastName", "emailAddress", "idPhoto", "gcashQR"], // Changed from "email" to "emailAddress"
        },
      ],
      });

      return res.status(201).json({
        success: true,
        data: createdItem,
        message: "Item created successfully"
      });
    } catch (error) {
      console.error('Create item error:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

// UPDATE - Update existing item
const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      description, 
      pricePerDay, 
      category, 
      availability, 
      itemImage 
    } = req.body;

    // Check if item exists
    const item = await Item.findByPk(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        error: "Item not found"
      });
    }

    // Prepare update data (only include provided fields)
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (pricePerDay !== undefined) updateData.pricePerDay = parseFloat(pricePerDay);
    if (category !== undefined) updateData.category = category;
    if (availability !== undefined) updateData.availability = availability;
    if (itemImage !== undefined) updateData.itemImage = itemImage;

    // Update the item
    await Item.update(updateData, {
      where: { id }
    });

    // Fetch updated item with owner details
    const updatedItem = await Item.findOne({
      where: { id },
      include: [
        {
          model: Owner,
          attributes: ["id", "firstName", "lastName", "emailAddress", "idPhoto", "gcashQR",] // Changed from "email" to "emailAddress"
        },
      ],
    });

    return res.status(200).json({
      success: true,
      data: updatedItem,
      message: "Item updated successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// DELETE - Delete item
const deleteItem = async (req, res) => {
  console.log("Trying to delete");
  try {
    const { id } = req.params;

    console.log(req.params);

    // Check if item exists
    const item = await Item.findByPk(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        error: "Item not found"
      });
    }

    // Delete the item
    await Item.destroy({
      where: { id }
    });

    return res.status(200).json({
      success: true,
      message: "Item deleted successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export { 
  fetchItems, 
  fetchItemById, 
  fetchOwnerItems,
  createItem, 
  updateItem, 
  deleteItem 
};