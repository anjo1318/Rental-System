import express from 'express'
import { bookItem } from '../controllers/bookController.js';

const router = express.Router()

router.post('/book-item', bookItem);


export default router;