import express from 'express'
import { bookItem, bookNotification } from '../controllers/bookController.js';

const router = express.Router()

router.post('/book-item', bookItem);
router.get('/notification/:id', bookNotification);

export default router;