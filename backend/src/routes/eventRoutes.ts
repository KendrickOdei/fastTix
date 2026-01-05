import express, {Response, Request} from "express";
import authMiddleware from "../middleware/authMiddleware";  // Import AuthRequest
import { IUser } from "../models/user";
import { uploads } from "../middleware/uploads";
import { createEvent } from "../controllers/createEvent";
import { allEvents } from "../controllers/allEvents";
import { myEvents } from "../controllers/myEvents";
import { eventDetails } from "../controllers/eventDetails";
import { editEvent } from "../controllers/editEvent";
import { deleteEvent } from "../controllers/deleteEvent";

import { getAllTickets } from "../controllers/getAllTickets";
import { getSingleTicket } from "../controllers/getSingleTicket";

import { authorized } from "../middleware/authRole";
import dotenv from 'dotenv'
import { createTicket } from "../controllers/createTicket";
import { createPurchase } from "../controllers/purchased";
import { acceptedOrganizerTerms } from "../controllers/acceptOrganizerTerms";

interface AuthRequest extends Request {
  user?: IUser; // Match index.d.ts
}
dotenv.config();



const router = express.Router();

// Create a new event (protected)
router.post('/create-event',uploads.fields([
    { name: 'image', maxCount: 1 },
    { name: 'promoImages', maxCount: 5 },
  ]),
  authMiddleware,authorized('organizer'),createEvent)


//router to query events category

router.get('/events', allEvents)

//route to fetch event details before booking

router.get('/events/:id',eventDetails)


//route to query all events created by an organizer
router.get('/mine',authMiddleware, authorized('organizer') ,myEvents)

router.put('/edit-event/:id',authMiddleware,authorized('organizer'),editEvent)



router.get('/:eventId/tickets',authMiddleware,getAllTickets)

//create multiple tickets for an event
router.post('/:eventId/tickets',authMiddleware,authorized('organizer'),createTicket)

// purchase ticket
router.post("/purchase", authMiddleware,createPurchase)

router.patch('/accept-organizer-terms',authMiddleware,authorized('organizer'),acceptedOrganizerTerms)





export default router;
