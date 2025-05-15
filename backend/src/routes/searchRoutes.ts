
import express from 'express';
import Event from '../models/event'
const router = express.Router();

router.get('/search', async (req, res) => {
  const query = req.query.q?.toString() || '';
  try {
    const events = await Event.find({
      name: { $regex: query, $options: 'i' }
    });
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
