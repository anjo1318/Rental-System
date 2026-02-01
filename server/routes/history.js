import express from 'express';
import { fetchHistory, fetchOwnerHistory } from '../controllers/historyController.js';

const router = express.Router()

router.get('/:id', fetchHistory );
router.get('/owner/:id', fetchOwnerHistory );

export default router;