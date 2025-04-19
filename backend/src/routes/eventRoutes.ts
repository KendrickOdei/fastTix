import express, {Response, Request} from "express";
import Event from "../models/event"; 
import authMiddleware from "../middleware/authMiddleware";  // Import AuthRequest
import { body, validationResult } from 'express-validator';
import { IUser } from "../models/user";
import multer , { FileFilterCallback } from 'multer';
import path from "path";
import {v2 as cloudinary} from "cloudinary"

interface AuthRequest extends Request {
  user?: IUser; // Match index.d.ts
}
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1].toLowerCase();
    if (['jpg', 'jpeg', 'png'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only .jpg, .jpeg, .png files are allowed'));
    }
  },
  
});
const router = express.Router();

// Create a new event (protected)
router.post("/create-event",
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'promoImages', maxCount: 5 },
  ]),
  authMiddleware,
  [
    body('name').notEmpty().withMessage('Event name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('date').isISO8601().toDate().withMessage('Valid date is required (e.g., 2025-05-30)'),
    body('time').notEmpty().withMessage('Time is required (e.g., 7:00 PM)'),
    body('venue').notEmpty().withMessage('Venue is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('ticketsAvailable').isInt({ min: 0 }).withMessage('Tickets available must be a positive integer'),
  ],
  
  async (req: AuthRequest, res: Response): Promise<void> => { 
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return
    }
 
  const { name, description, date, time, venue, price, ticketsAvailable } = req.body;
  const files = (req.files ?? {}) as { [fieldname: string]: Express.Multer.File[] };
 

  try {

    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }
    const streamUpload = (fileBuffer: Buffer, folder: string): Promise<any> => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(fileBuffer);
      });
    };
    

    let imageUrl: string | undefined;
    if (files['image'] && files['image'][0]) {
      const result = await streamUpload(files['image'][0].buffer, 'fasttix/events');
      imageUrl = result.secure_url;
    }
    
    let promoImageUrls: string[] = [];
    if (files['promoImages'] && files['promoImages'].length > 0) {
      for (const file of files['promoImages']) {
        const result = await streamUpload(file.buffer, 'fasttix/promo');
        promoImageUrls.push(result.secure_url);
      }
    }
    
    const newEvent = new Event({
        name,
        description,
        date,
        time,
        venue,
        price,
        ticketsAvailable,
        organizerId: req.user._id,// Gets user ID from token
        image: imageUrl,
        promoImages: promoImageUrls,
      
    });

    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error: any) {
    console.error("CREATE EVENT ERROR:", error); 
    res.status(500).json({ message: "Server error", error: error.message });
  }
  
});

router.get('/events', async (req: Request, res: Response) => {
  try {
    const events = await Event.find().populate('organizerId', 'organizationName');
    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/events/:id', async (req: Request, res: Response) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizerId', 'organizationName');
    if (!event) {
       res.status(404).json({ message: 'Event not found' });
       return;
    }
    res.status(200).json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
