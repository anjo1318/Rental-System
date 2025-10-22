import Owner from "../models/Owner.js";
import Item from "../models/Item.js";
import jwt from 'jsonwebtoken';

// GET - Fetch all owners
const fetchOwners = async (req, res) => {
  try {
    const response = await Owner.findAll({
      attributes: { exclude: ['password'] } // Don't send passwords
    });
    return res.status(200).json({ 
      success: true, 
      data: response,
      message: "Owners fetched successfully" 
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

const updateOwnerProfile = async (req, res) => {
  const { id } = req.params;
  try {
    const owner = await Owner.findByPk(id);
    if (!owner) {
      return res.status(404).json({ success: false, message: "Owner not found" });
    }

    // handle uploaded files
    let gcashQRPath = owner.gcashQR;
    let profileImagePath = owner.profileImage;

    if (req.files?.gcashQR) {
      gcashQRPath = `/uploads/${req.files.gcashQR[0].filename}`;
    }
    if (req.files?.profileImage) {
      profileImagePath = `/uploads/${req.files.profileImage[0].filename}`;
    }

    await owner.update({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      gcashQR: gcashQRPath,
      profileImage: profileImagePath
    });

    return res.status(200).json({
      success: true,
      message: "Successfully updated owner details",
      updatedOwner: owner,
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


// GET - Fetch items for specific owner (public route)
const fetchOwnerItems = async (req, res) => {
  try {
    const { ownerId } = req.query;
    
    console.log('🔍 Received request for owner items');
    console.log('🔍 Query params:', req.query);
    console.log('🔍 Owner ID:', ownerId);
    
    if (!ownerId) {
      console.log('❌ Owner ID is missing');
      return res.status(400).json({ 
        success: false, 
        error: "Owner ID is required" 
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

    console.log('🔍 Searching for items with ownerId:', ownerId);
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

    console.log('🔍 Found items:', items?.length || 0);

    return res.status(200).json({
      success: true, 
      message: "Items fetched successfully",
      data: items,
      count: items.length
    });

  } catch (error) {
    console.error("❌ Error fetching owner items:", error);
    return res.status(500).json({
      success: false, 
      error: "Error fetching items for specific owner"
    });
  }
};

// Updated backend controller - Alternative approach
const getOwnerItems = async (req, res) => {
  try {
    const { ownerId } = req.query;
    const requestingUserId = req.user.id;
    
    // If ownerId is provided and user is owner, they can only see their own items
    let targetOwnerId = requestingUserId; // Default to authenticated user
    
    if (ownerId) {
      // If ownerId is provided, check permissions
      if (req.user.role === 'owner' && ownerId != requestingUserId) {
        return res.status(403).json({ 
          success: false, 
          error: 'Access denied: You can only view your own items' 
        });
      }
      targetOwnerId = ownerId;
    }
    
    console.log(`🔍 Fetching items for owner: ${targetOwnerId}, requested by: ${requestingUserId}`);

    const items = await Item.findAll({
      where: { ownerId: targetOwnerId },
      include: [
        {
          model: Owner,
          attributes: ['id', 'firstName', 'lastName', 'email', 'profileImage']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    console.log(`✅ Found ${items.length} items for owner ${targetOwnerId}`);

    res.status(200).json({
      success: true,
      data: items,
      count: items.length,
      message: "Items fetched successfully"
    });

  } catch (error) {
    console.error('❌ Error fetching owner items:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch items' 
    });
  }
};

// CREATE - Add new item for owner
const createOwnerItem = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      pricePerDay, 
      category, 
      location,
      quantity,
      availability = true, 
      itemImage,
      itemImages
    } = req.body;

    const ownerId = req.user.id; // Get from authenticated user

    console.log('📝 Creating item with data:', {
      title,
      description,
      pricePerDay,
      category,
      location,
      quantity,
      itemImages: itemImages?.length || 'none',
      itemImage: itemImage || 'none',
      ownerId: ownerId
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

    // Verify owner exists
    const owner = await Owner.findByPk(ownerId);
    if (!owner) {
      return res.status(404).json({
        success: false,
        error: "Owner not found"
      });
    }

    const newItem = await Item.create({
      title: title.trim(),
      description: description?.trim() || null,
      pricePerDay: parseFloat(pricePerDay),
      category: category?.trim() || null,
      location: location?.trim() || null,
      quantity: parseInt(quantity || 1),
      availability: Boolean(availability),
      itemImages: itemImages || [],
      ownerId: parseInt(ownerId)
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

    console.log(`✅ Item created successfully by owner ${ownerId}`);

    return res.status(201).json({
      success: true,
      data: createdItem,
      message: "Item created successfully"
    });

  } catch (error) {
    console.error('❌ Error creating item:', error);
    return res.status(500).json({
      success: false,
      error: "Failed to create item"
    });
  }
};

// UPDATE - Update owner's existing item
const updateOwnerItem = async (req, res) => {
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
      where: { id, ownerId } // Must belong to the authenticated owner
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        error: "Item not found or you don't have permission to update it"
      });
    }

    // Prepare update data (only update provided fields)
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
    if (quantity !== undefined) updateData.quantity = parseInt(quantity);
    if (availability !== undefined) updateData.availability = Boolean(availability);
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

// DELETE - Delete owner's item
const deleteOwnerItem = async (req, res) => {
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
  fetchOwners, 
  updateOwnerProfile,
  fetchOwnerItems, 
  getOwnerItems,
  createOwnerItem,
  updateOwnerItem,
  deleteOwnerItem,
  authenticateToken 
};