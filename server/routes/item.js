  import express from 'express';
  import { 
    fetchItems, 
    fetchItemById, 
    createItem, 
    updateItem, 
    deleteItem,
    fetchOwnerItems ,
    approveItem,
    rejectItem
  } from '../controllers/itemController.js';
  import { authenticateToken } from '../controllers/ownerController.js';

  const router = express.Router();

  // Public routes
  router.get('/', fetchItems);

  // Owner-specific routes FIRST
  router.get('/owner/:ownerId', authenticateToken, fetchOwnerItems);

  // Then parameterized route
  router.get('/:id', fetchItemById);

  // Protected routes
  router.post('/', authenticateToken, createItem);
  router.put('/:id', authenticateToken, updateItem);
  router.delete('/:id', deleteItem);

  //for approve
  router.put('/approve/:id', approveItem);
  router.put('/reject/:id', rejectItem);  
  export default router;