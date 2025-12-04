// payments.routes.ts
import express from 'express';
 import { initializeTransaction, verifyTransactionWebhook } from '../controllers/paymentsController'; 
import authMiddleware from '../middleware/authMiddleware';
import bodyParser from "body-parser"

const router = express.Router();

// Route to initiate payment and get the Paystack authorization URL
router.post('/initialize-transaction', authMiddleware, initializeTransaction); 


router.post('/paystack-webhook', verifyTransactionWebhook);

 export default router;