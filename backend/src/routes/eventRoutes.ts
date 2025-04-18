import express, {Response, Request} from "express";
import Event from "../models/Event"; 
import authMiddleware from "../middleware/authMiddleware";  // Import AuthRequest
import { body, validationResult } from 'express-validator';
import { IUser } from "../models/user";
import multer , { FileFilterCallback } from 'multer';
import path from "path";

interface AuthRequest extends Request {
  user?: IUser; // Match index.d.ts
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.jpg', '.jpeg', '.png'].includes(ext)) {
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
    const newEvent = new Event({
        name,
        description,
        date,
        time,
        venue,
        price,
        ticketsAvailable,
        organizerId: req.user._id,// Gets user ID from token
        image: files['image']?.[0]?.filename ? `/uploads/${files['image'][0].filename}` : undefined,
        promoImages: files['promoImages']?.map(file => `/uploads/${file.filename}`) || [],
      
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
