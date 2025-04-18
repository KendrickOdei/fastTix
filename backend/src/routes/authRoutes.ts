import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user';
import { body, validationResult } from 'express-validator';

const router = express.Router();

router.post(
  '/register',
  [
    body('firstName').if(body('role').equals('user')).notEmpty().withMessage('First name is required for users'),
    body('lastName').if(body('role').equals('user')).notEmpty().withMessage('Last name is required for users'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['user', 'organizer']).withMessage('Invalid role'),
    body('country').notEmpty().withMessage('Country is required'),
    body('organizationName')
      .if(body('role').equals('organizer'))
      .notEmpty()
      .withMessage('Organization name is required for organizers'),
    body('organizationLocation')
      .if(body('role').equals('organizer'))
      .notEmpty()
      .withMessage('Location is required for organizers'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { firstName, lastName, email, password, role, organizationName, organizationLocation, country } =
      req.body;

    try {
      const userExists = await User.findOne({ email: email.trim().toLowerCase() });
      console.log('Normalized email for lookup:', email);

      if (userExists) {
        res.status(400).json({ message: 'User already exists' });
        return;
      }

      console.log('Request body:', req.body);

      const user = new User({
        firstName: role === 'user' ? firstName : undefined,
        lastName: role === 'user' ? lastName : undefined,
        email: email.trim().toLowerCase(),
        password,
        role,
        country,
        organizationName: role === 'organizer' ? organizationName : undefined,
        organizationLocation: role === 'organizer' ? organizationLocation : undefined,
        
        isVerified: false,
      });

      await user.save();
      console.log('Saved user:', user);

      res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email: email.trim().toLowerCase() });

      if (!user) {
        res.status(400).json({ message: 'Invalid credentials' });
        return;
      }

      if (!user.isVerified) {
        res.status(403).json({ message: 'Please verify your email before logging in.' });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        res.status(400).json({ message: 'Invalid credentials' });
        return;
      }

      const payload = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '1h' });

      res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

export default router;