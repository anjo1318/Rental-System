import express from 'express'
import { reviewProduct, getItemReviews } from '../controllers/reviewController.js';

const router = express.Router();

router.post('/review-product', reviewProduct);
router.get('/item-reviews/:itemId', getItemReviews); // Optional: to display reviews

export default router;