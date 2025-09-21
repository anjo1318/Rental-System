import express from 'express';
import { fetchItems, fetchItemById } from '../controllers/itemController.js';

const router = express.Router();

router.get('/', fetchItems); // all items
router.get('/:id', fetchItemById); // single item by ID

export default router;
