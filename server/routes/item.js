import express from 'express';
import { 
  fetchItems, 
  fetchItemById, 
  createItem, 
  updateItem, 
  deleteItem,
  fetchOwnerItems 
} from '../controllers/itemController.js';
import { authenticateToken } from '../controllers/ownerController.js';

const router = express.Router();

// Public routes
router.get('/', fetchItems); // GET /api/items - get all items
router.get('/:id', fetchItemById); // GET /api/items/:id - get single item

// Protected routes (require authentication)
router.post('/', authenticateToken, createItem); // POST /api/items - create new item
router.put('/:id', authenticateToken, updateItem); // PUT /api/items/:id - update item
router.delete('/:id', deleteItem); // DELETE /api/items/:id - delete item

// Owner-specific routes
router.get('/owner/:ownerId', authenticateToken, fetchOwnerItems); // GET /api/items/owner/:ownerId - get items by owner

export default router;