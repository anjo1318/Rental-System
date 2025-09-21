import express from 'express';
import { authenticateToken, fetchOwnerItems, fetchOwners, getOwnerItems } from '../controllers/ownerController.js';

const router = express.Router();

// Get all owners
router.get('/all', fetchOwners);

// Get items for a specific owner
// Option 1: Using query params - /owner/items?ownerId=123
router.get('/items', fetchOwnerItems);
router.get('/owner/items', authenticateToken, getOwnerItems);


// Option 2: Using route params - /owner/items/123
// router.get('/items/:ownerId', fetchOwnerItems);

export default router;