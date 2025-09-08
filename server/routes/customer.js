import express from 'express';
import { mobileSignUp } from '../controllers/customerController.js';

const router = express.Router();

//router.post('/login', )
router.post('/sign-up', mobileSignUp );


export default router; 