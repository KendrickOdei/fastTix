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








dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// app.use(cors({
  
//     origin: ['https://fast-tix-sigma.vercel.app'], //process.env.FRONTEND_URL,
//     credentials: true
// }));

const allowedOrigins = [
  'http://localhost:5173', // Vite local
  'https://fast-tix-sigma.vercel.app', // Vercel production
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));


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
//app.use('/api/events', eventRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

