import Owner from "../models/Owner.js";
import Item from "../models/Item.js";

const fetchOwners = async (req, res) => {
  try {
    const response = await Owner.findAll();
    return res.status(200).json({ success: true, message: response });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const fetchOwnerItems = async (req, res) => {
  try {
    // Get owner ID from query params or route params
    const { ownerId } = req.query; // For GET request with query params
    // OR const { ownerId } = req.params; // For route params like /owner/:ownerId
    
    console.log('🔍 Received request for owner items');
    console.log('🔍 Query params:', req.query);
    console.log('🔍 Owner ID:', ownerId);
    
    if (!ownerId) {
      console.log('❌ Owner ID is missing');
      return res.status(400).json({ 
        success: false, 
        message: "Owner ID is required" 
      });
    }

    // Simple query without including Owner data for now
    console.log('🔍 Searching for items with ownerId:', ownerId);
    const items = await Item.findAll({
      where: { ownerId: ownerId }
    });

    console.log('🔍 Found items:', items?.length || 0);
    console.log('🔍 Items data:', JSON.stringify(items, null, 2));

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
      message: "Error fetching items for specific owner",
      error: error.message
    });
  }
};

// Add this controller function
const getOwnerItems = async (req, res) => {
  try {
    const { ownerId } = req.query;
    
    // Verify that the requesting user is the owner or use token user ID
    const requestingUserId = req.user.id; // From JWT token
    
    // Use the token user ID if no ownerId provided, or verify ownership
    const targetOwnerId = ownerId || requestingUserId;
    
    // Optional: Add security check to ensure users can only see their own items
    if (req.user.role === 'owner' && targetOwnerId != requestingUserId) {
      return res.status(403).json({ 
        success: false, 
        error: 'Access denied: You can only view your own items' 
      });
    }

    // Fetch items for the owner
    const items = await Item.findAll({
      where: { 
        ownerId: targetOwnerId 
      },
      include: [
        {
          model: Owner,
          as: 'owner', // Make sure this alias matches your model association
          attributes: ['firstName', 'lastName', 'email']
        }
      ],
      order: [['createdAt', 'DESC']] // Most recent items first
    });

    console.log(`Found ${items.length} items for owner ${targetOwnerId}`);

    res.status(200).json({
      success: true,
      data: items,
      count: items.length
    });

  } catch (error) {
    console.error('Error fetching owner items:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch items' 
    });
  }
};

// Authentication middleware (if not already implemented)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ success: false, error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

export { fetchOwners, fetchOwnerItems, authenticateToken, getOwnerItems};