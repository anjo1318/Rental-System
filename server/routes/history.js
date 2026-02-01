import express from 'express';
import { fetchHistory } from '../controllers/historyController.js';

const router = express.Router()

router.get('/:id', fetchHistory );

export default router;