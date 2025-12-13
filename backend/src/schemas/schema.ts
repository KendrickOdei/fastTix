import {z} from 'zod';

export const registerSchema = z.object({
  fullName: z.string().optional(),
  userName: z.string().optional(),
  email: z.email('Enter valid email address'),
  role: z.enum(['attendee', 'organizer','admin']),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter'),
  country: z.string('Country is required'),
  organizationName: z.string().optional(),
  location: z.string().optional(),
  isVerified: z.boolean().default(false),
}).superRefine((data, ctx) => {
  if (data.role === 'attendee') {
    if (!data.fullName) {
      ctx.addIssue({
        path: ['fullName'],
        message: 'Full name is required for users',
        code: 'custom',
      });
    }
    if (!data.userName) {
      ctx.addIssue({
        path: ['userName'],
        message: 'Username is required for users',
        code: 'custom',
      });
    }
  }

  if (data.role === 'organizer') {
    if (!data.organizationName) {
      ctx.addIssue({
        path: ['organizationName'],
        message: 'Organization name is required for organizers',
        code: 'custom',
      });
    }
    if (!data.location) {
      ctx.addIssue({
        path: ['location'],
        message: 'Location is required for organizers',
        code: 'custom',
      });
    }
  }
});




export const loginSchema = z.object({
    email: z.email('enter valid email address').optional(),
    userName: z.string().min(1,'Enter your username').optional(),
    password: z.string('invalid password')
}).refine(data => data.email || data.userName,{
 message: 'Either email or username is required',
 path: []
})


export const eventSchema = z.object({
  title: z.string().min(1, 'Title is required').trim(),
  description: z.string().min(1, 'Description is required').trim(),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  venue: z.string().min(1, 'Venue is required').trim(),
  category: z.string().min(1, 'Category is required'),
  price: z.coerce.number().min(0, 'Price must be ≥ 0'),
  ticketsAvailable: z.coerce.number().min(1, 'At least 1 ticket required'),
})

export const ticketSchema = z.object({
    name: z.string().min(1,'Ticket name is required'),
    price: z.number().min(0,'Price must be positive'),
    quantity: z.number().min(0, 'Quantity must be positive'),
    remaining: z.number().optional(),
    saleStart: z.coerce.date().optional(),
    saleEnd: z.coerce.date().optional()

})


    