import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoute from "./routes/authRoutes"
import eventRoutes from "./routes/eventRoutes"; // Events
import sendOtpRoute from "./routes/sendOtpRoutes"
import verifyOtpRoute from "./routes/verifyOtpRoutes"
import path from 'path';
import searchRoutes from './routes/searchRoutes';
import { errorHandler } from './middleware/errorHandler';
import cookieParser from 'cookie-parser';
import dashboardRoutes from './routes/dashboard.route'
import PaymentRoute from './routes/payments'
import { verifyTransactionWebhook } from './controllers/paymentsController';




dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use('/api/payments/paystack-webhook', express.raw({ type: 'application/json' }),verifyTransactionWebhook);
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser())
app.use(express.urlencoded({ extended: true, limit: '10mb' }));



const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "https://fast-tix-sigma.vercel.app",
  
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (health checks, server → server)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Database Connection
mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log('MongoDB Connected'))
  .catch((error) => console.log('MongoDB connection error:', error));

// Use routes
app.get("/", (req, res) => {
  res.send("CORS enabled!");
})


app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/auth', authRoute)
app.use("/api/events", eventRoutes); 
app.use("/api/", eventRoutes); 
app.use('/api/sendotp', sendOtpRoute);
app.use('/api/verifyotp', verifyOtpRoute);
app.use('/api', searchRoutes);
app.use("/api/organizer", dashboardRoutes)
app.use("/api/payments", PaymentRoute)

app.use(errorHandler)



// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

