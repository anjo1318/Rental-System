// controllers/itemController.js
import Item from "../models/Item.js";
import Owner from "../models/Owner.js";
import jwt from 'jsonwebtoken';

// GET - Fetch all items
const fetchItems = async (req, res) => {
  try {
    const items = await Item.findAll({
      include: [
        {
          model: Owner,
          attributes: ['id', 'firstName', 'lastName', 'email', 'profileImage']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      data: items,
      message: "Items fetched successfully"
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch items"
    });
  }
};

// GET - Fetch single item by ID
const fetchItemById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const item = await Item.findByPk(id, {
      include: [
        {
          model: Owner,
          attributes: ['id', 'firstName', 'lastName', 'email', 'profileImage']
        }
      ]
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
    console.error('Error fetching item:', error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch item"
    });
  }
};

// GET - Fetch items for specific owner
const fetchOwnerItems = async (req, res) => {
  try {
    const { ownerId } = req.params;
    const requestingUserId = req.user.id;
    
    console.log(`🔍 Fetching items for owner: ${ownerId}, requested by: ${requestingUserId}`);

    // If user is an owner, they can only see their own items
    if (req.user.role === 'owner' && ownerId != requestingUserId) {
      return res.status(403).json({ 
        success: false, 
        error: 'Access denied: You can only view your own items' 
      });
    }

    const items = await Item.findAll({
      where: { ownerId: ownerId },
      include: [
        {
          model: Owner,
          attributes: ['id', 'firstName', 'lastName', 'email', 'profileImage']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    console.log(`✅ Found ${items.length} items for owner ${ownerId}`);

    return res.status(200).json({
      success: true,
      data: items,
      count: items.length,
      message: "Items fetched successfully"
    });

  } catch (error) {
    console.error('❌ Error fetching owner items:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch items' 
    });
  }
};

// CREATE - Add new item
const createItem = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      pricePerDay, 
      category, 
      location,
      quantity = 1,
      availability = true, 
      itemImage,        // Single image (backward compatibility)
      itemImages,       // Multiple images (new feature)
      ownerId          // Allow manual ownerId or use authenticated user
    } = req.body;

    // Use provided ownerId or authenticated user's ID
    const finalOwnerId = ownerId || req.user.id;

    console.log('📝 Creating item with data:', {
      title,
      description,
      pricePerDay,
      category,
      location,
      quantity,
      itemImages: itemImages?.length || 'none',
      itemImage: itemImage || 'none',
      ownerId: finalOwnerId
    });

    // Validation
    if (!title || !pricePerDay) {
      return res.status(400).json({
        success: false,
        error: "Title and price per day are required"
      });
    }

    if (isNaN(pricePerDay) || parseFloat(pricePerDay) <= 0) {
      return res.status(400).json({
        success: false,
        error: "Price per day must be a positive number"
      });
    }

    if (isNaN(quantity) || parseInt(quantity) < 1) {
      return res.status(400).json({
        success: false,
        error: "Quantity must be at least 1"
      });
    }

    // Verify owner exists
    const owner = await Owner.findByPk(finalOwnerId);
    if (!owner) {
      return res.status(404).json({
        success: false,
        error: "Owner not found"
      });
    }

    // Handle images - prioritize itemImages array, fallback to single itemImage
    let finalItemImages = [];
    if (itemImages && Array.isArray(itemImages) && itemImages.length > 0) {
      finalItemImages = itemImages;
      console.log('📸 Using multiple images:', itemImages.length);
    } else if (itemImage) {
      finalItemImages = [itemImage];
      console.log('📸 Using single image:', itemImage);
    } else {
      // Use default placeholder
      finalItemImages = ["https://via.placeholder.com/300x200?text=No+Image"];
      console.log('📸 Using default placeholder image');
    }

    const newItem = await Item.create({
      title: title.trim(),
      description: description?.trim() || null,
      pricePerDay: parseFloat(pricePerDay),
      category: category?.trim() || null,
      location: location?.trim() || null,
      quantity: parseInt(quantity),
      availability: Boolean(availability),
      itemImages: finalItemImages, // Store as array directly
      ownerId: parseInt(finalOwnerId)
    });

    // Fetch the created item with owner details
    const createdItem = await Item.findOne({
      where: { id: newItem.id },
      include: [
        {
          model: Owner,
          attributes: ['id', 'firstName', 'lastName', 'email', 'profileImage']
        }
      ]
    });

    console.log(`✅ Item created successfully by owner ${finalOwnerId}`);

    return res.status(201).json({
      success: true,
      data: createdItem,
      message: "Item created successfully"
    });

  } catch (error) {
    console.error('❌ Error creating item:', error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to create item"
    });
  }
};

// UPDATE - Update item
const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      description, 
      pricePerDay, 
      category,
      location, 
      quantity,
      availability, 
      itemImage,
      itemImages
    } = req.body;

    const ownerId = req.user.id;

    // Check if item exists and belongs to the authenticated owner
    const item = await Item.findOne({
      where: { id, ownerId }
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        error: "Item not found or you don't have permission to update it"
      });
    }

    // Prepare update data
    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description?.trim();
    if (pricePerDay !== undefined) {
      if (isNaN(pricePerDay) || parseFloat(pricePerDay) <= 0) {
        return res.status(400).json({
          success: false,
          error: "Price per day must be a positive number"
        });
      }
      updateData.pricePerDay = parseFloat(pricePerDay);
    }
    if (category !== undefined) updateData.category = category?.trim();
    if (location !== undefined) updateData.location = location?.trim();
    if (quantity !== undefined) {
      if (isNaN(quantity) || parseInt(quantity) < 1) {
        return res.status(400).json({
          success: false,
          error: "Quantity must be at least 1"
        });
      }
      updateData.quantity = parseInt(quantity);
    }
    if (availability !== undefined) updateData.availability = Boolean(availability);
    
    // Handle images update
    if (itemImages !== undefined && Array.isArray(itemImages)) {
      updateData.itemImages = itemImages;
    } else if (itemImage !== undefined) {
      updateData.itemImages = [itemImage];
    }

    // Update the item
    await Item.update(updateData, {
      where: { id, ownerId }
    });

    // Fetch updated item with owner details
    const updatedItem = await Item.findOne({
      where: { id },
      include: [
        {
          model: Owner,
          attributes: ['id', 'firstName', 'lastName', 'email', 'profileImage']
        }
      ]
    });

    console.log(`✅ Item ${id} updated successfully by owner ${ownerId}`);

    return res.status(200).json({
      success: true,
      data: updatedItem,
      message: "Item updated successfully"
    });

  } catch (error) {
    console.error('❌ Error updating item:', error);
    return res.status(500).json({
      success: false,
      error: "Failed to update item"
    });
  }
};

// DELETE - Delete item
const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user.id;

    console.log(`🗑️ Attempting to delete item ${id} by owner ${ownerId}`);

    // Check if item exists and belongs to the authenticated owner
    const item = await Item.findOne({
      where: { id, ownerId }
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        error: "Item not found or you don't have permission to delete it"
      });
    }

    // Delete the item
    await Item.destroy({
      where: { id, ownerId }
    });

    console.log(`✅ Item ${id} deleted successfully by owner ${ownerId}`);

    return res.status(200).json({
      success: true,
      message: "Item deleted successfully"
    });

  } catch (error) {
    console.error('❌ Error deleting item:', error);
    return res.status(500).json({
      success: false,
      error: "Failed to delete item"
    });
  }
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Access token required' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.JWT_KEY);
    req.user = decoded;
    console.log(`🔐 Authenticated user:`, decoded.id);
    next();
  } catch (error) {
    return res.status(403).json({ 
      success: false, 
      error: 'Invalid or expired token' 
    });
  }
};

export { 
  fetchItems, 
  fetchItemById, 
  fetchOwnerItems,
  createItem,
  updateItem,
  deleteItem,
  authenticateToken 
};