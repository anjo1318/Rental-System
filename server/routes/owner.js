import express from 'express';
import { 
  authenticateToken, 
  fetchOwnerItems, 
  fetchOwners, 
  getOwnerItems,
  createOwnerItem,
  updateOwnerItem,
  deleteOwnerItem
} from '../controllers/ownerController.js';

const router = express.Router();

// Public routes
router.get('/all', fetchOwners); // Get all owners
router.get('/items/:ownerId', fetchOwnerItems);

// Protected routes (require authentication)
router.get('/owner/items', authenticateToken, getOwnerItems); // Get authenticated owner's items
router.post('/items', authenticateToken, createOwnerItem); // Create new item
router.put('/items/:id', authenticateToken, updateOwnerItem); // Update item
router.delete('/items/:id', authenticateToken, deleteOwnerItem); // Delete item

// Alternative route structure if you prefer
// router.get('/items/:ownerId', fetchOwnerItems); // Using route params

export default router;