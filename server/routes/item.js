import express from 'express';
import { fetchItems } from '../controllers/itemController.js';

const router = express.Router();

router.get('/', fetchItems);


export default router;