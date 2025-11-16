import {z} from 'zod';

export const registerSchema = z.object({
  fullName: z.string().min(7, 'first name must be seven or more'),
  userName: z.string().min(3, 'username must be three or more characters').optional(),
  email: z.email('enter valid email address'),
  role: z.enum(['user', 'organizer']),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/[0-9]/, 'password must contain at least one number')
    .regex(/[A-Z]/, 'password must contain at least one upper case letter'),
  country: z.string().min(1, 'country is required'),
  organizationName: z.string().optional(),
  organizationLocation: z.string().optional(),
  isVerified: z.boolean().default(false)
}).superRefine((data, ctx) => {
  if (data.role === 'organizer') {
    if (!data.organizationName) {
      ctx.addIssue({
        path: ['organizationName'],
        message: 'organizationName is required for organizers',
        code: 'custom'
      });
    }
    if (!data.organizationLocation) {
      ctx.addIssue({
        path: ['organizationLocation'],
        message: 'organization location is required for organizers',
        code: 'custom'
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
    title: z.string(),
    description: z.string().min(20,'description must be twenty or more characters'),
     date: z.date(), 
     time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/,{
        message: 'Invalid time format'
     }),
    venue: z.string(),
     price: z.number(),
     category: z.string()
})

export const ticketSchema = z.object({
    name: z.string().min(1,'Ticket name is required'),
    price: z.number().min(0,'Price must be positive'),
    quantity: z.number().min(0, 'Quantity must be positive'),
    remaining: z.number().optional(),
    saleStart: z.coerce.date().optional(),
    saleEnd: z.coerce.date().optional()

})


    