// payments.routes.ts
import express from 'express';
 import { checkOrderStatus, initializeTransaction, verifyTransactionWebhook } from '../controllers/paymentsController'; 
import authMiddleware from '../middleware/authMiddleware';


const router = express.Router();

router.get('/status', checkOrderStatus)

// Route to initiate payment and get the Paystack authorization URL
router.post('/initialize-transaction', authMiddleware, initializeTransaction); 




 export default router;