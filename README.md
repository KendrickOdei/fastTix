#  fastTix - Event Ticketing Platform

A modern, full-stack event ticketing platform built with **React**, **TypeScript**, **Node.js**, and **MongoDB**. fastTix enables event organizers to create and manage events while providing attendees with a seamless ticket purchasing experience with integrated payment processing and automated ticket delivery.

##  Features

### For Attendees
-  **Event Discovery** - Browse and search events by category, date, venue
-  **Easy Ticket Purchase** - Secure checkout with guest or authenticated purchase
-  **Paystack Integration** - Secure payment processing with Paystack
-  **Instant Ticket Delivery** - Receive tickets via email immediately after purchase
-  **PDF Tickets** - Professional PDF tickets with QR codes
-  **Responsive Design** - Seamless experience on desktop, tablet, and mobile
-  **User Dashboard** - Track purchased tickets and event history
-  **Real-time Search** - Live search suggestions as you type

### For Organizers
-  **Event Creation** - Create and manage events with rich details
-  **Ticket Management** - Create multiple ticket tiers with different pricing
-  **Analytics Dashboard** - Track sales, revenue, and attendance
-  **Event Editing** - Update event details and ticket information
-  **Revenue Tracking** - Monitor ticket sales and earnings
-  **Sales Reports** - Detailed insights into ticket sales
-  **Event Customization** - Upload images and customize event pages

### For Admins
-  **User Management** - View, edit, and manage all users with advanced filtering
-  **Role Management** - Assign and modify user roles (Attendee, Organizer, Admin)
-  **Platform Analytics** - Monitor platform-wide statistics and metrics
-  **Event Moderation** - Review and manage all events on the platform
-  **Payout Management** - Handle organizer payouts and financial tracking
- **System Settings** - Configure platform settings and preferences
-  **Comprehensive Dashboard** - Real-time platform statistics
-  **Advanced Search** - Search and filter users by multiple criteria

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library with hooks
- **TypeScript** - Type safety and better developer experience
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Modern icon library
- **React Toastify** - Toast notifications
- **Vite** - Fast build tool and dev server

### Backend
- **Node.js & Express** - Server framework (TypeScript)
- **MongoDB & Mongoose** - Database and ODM with TypeScript interfaces
- **JWT** - Secure authentication with access and refresh tokens
- **bcryptjs** - Password hashing
- **Paystack** - Payment processing integration
- **Nodemailer** - Email service for ticket delivery
- **PDFKit** - PDF ticket generation
- **QR Code Generator** - Generate unique QR codes for tickets
- **cookie-parser** - Cookie handling
- **cors** - Cross-origin resource sharing

### DevOps & Tools
- **MongoDB Atlas** - Cloud database hosting
- **Git** - Version control
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 📁 Project Structure

```
fastTix/
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── NavBar.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── ScrollToTop.tsx
│   │   │   └── OrganizerRoute.tsx
│   │   ├── pages/               # Page components
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── EventsPage.tsx
│   │   │   ├── EventDetails.tsx
│   │   │   ├── Checkout.tsx
│   │   │   ├── GuestCheckout.tsx
│   │   │   ├── PaymentSuccess.tsx
│   │   │   ├── SearchResults.tsx
│   │   │   ├── admin-dashboard/  # Admin pages
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── UserManagement.tsx
│   │   │   │   ├── components/
│   │   │   │   │   ├── adminNavbar.tsx
│   │   │   │   │   ├── adminSidebar.tsx
│   │   │   │   │   └── StatsCard.tsx
│   │   │   │   ├── layouts/
│   │   │   │   │   └── AdminLayout.tsx
│   │   │   │   ├── routes/
│   │   │   │   │   └── AdminRoutes.tsx
│   │   │   │   └── services/
│   │   │   │       └── adminService.ts
│   │   │   └── dashboard/       # Organizer dashboard
│   │   │       ├── organizer/
│   │   │       │   ├── CreateEvents.tsx
│   │   │       │   ├── MyEvents.tsx
│   │   │       │   ├── EditEvent.tsx
│   │   │       │   ├── CreateTicket.tsx
│   │   │       │   └── TicketList.tsx
│   │   │       ├── Overview.tsx
│   │   │       └── layouts/
│   │   │           └── DashboardLayout.tsx
│   │   ├── Context/             # React Context providers
│   │   │   └── AuthContext.tsx
│   │   ├── services/            # API service functions
│   │   │   └── adminService.ts
│   │   ├── utils/               # Utility functions
│   │   │   └── apiClient.ts
│   │   └── App.tsx              # Main app component
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── backend/
│   ├── src/
│   │   ├── models/              # Mongoose schemas (TypeScript)
│   │   │   ├── User.ts
│   │   │   ├── Event.ts
│   │   │   ├── Ticket.ts
│   │   │   └── Booking.ts
│   │   ├── routes/              # API routes (TypeScript)
│   │   │   ├── auth.ts
│   │   │   ├── events.ts
│   │   │   ├── tickets.ts
│   │   │   ├── bookings.ts
│   │   │   ├── admin.ts
│   │   │   └── payment.ts
│   │   ├── middleware/          # Express middleware
│   │   │   └── authMiddleware.ts
│   │   ├── config/              # Configuration files
│   │   │   ├── db.ts
│   │   │   └── email.ts
│   │   ├── services/            # Business logic services
│   │   │   ├── emailService.ts
│   │   │   ├── pdfService.ts
│   │   │   └── paystackService.ts
│   │   ├── types/               # TypeScript type definitions
│   │   │   └── index.ts
│   │   └── server.ts            # Express app entry point
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

##  Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB Atlas** account or local MongoDB instance
- **Paystack Account** for payment processing
- **npm** or **yarn** package manager
- **Email Service** (Gmail, SendGrid, or similar)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/fasttix.git
   cd fasttix
   ```

2. **Set up the Backend**
   ```bash
   cd backend
   npm install
   ```

3. **Create Backend Environment Variables**
   
   Create a `.env` file in the `backend` directory:
   ```env
   # Server
   PORT=5000
   NODE_ENV=development

   # Database
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/auth_db?retryWrites=true&w=majority

   # JWT
   JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
   JWT_REFRESH_SECRET=your_refresh_token_secret_here_min_32_chars
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d

   # Paystack
   PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key
   PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key

   # Email (Gmail example)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-specific-password
   EMAIL_FROM=FastTix <noreply@fasttix.com>

   # Frontend URL (for email links)
   FRONTEND_URL=http://localhost:5173
   ```

4. **Set up the Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

5. **Create Frontend Environment Variables**
   
   Create a `.env` file in the `frontend` directory:
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key
   ```

6. **Build TypeScript Backend**
   ```bash
   cd backend
   npm run build
   ```

7. **Run the Application**
   
   **Terminal 1 - Backend:**
   ```bash
   cd backend
   npm run dev     # Development with hot reload
   # or
   npm start       # Production
   ```
   
   **Terminal 2 - Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

8. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 🔐 User Roles

### Attendee (Default)
- Browse and search events
- Purchase tickets (authenticated or guest)
- Receive tickets via email with PDF
- View ticket history
- Manage profile

### Organizer
- All attendee permissions
- Create and manage events
- Create ticket tiers with different prices
- View event analytics and sales
- Track revenue and payouts
- Edit and delete own events

### Admin
- All platform permissions
- User management (view, edit, delete, change roles)
- Verify users manually
- Event moderation (approve/reject events)
- Platform-wide analytics
- Payout management
- System configuration

## 📝 API Endpoints

### Authentication
```
POST   /api/auth/register       - Register new user
POST   /api/auth/login          - User login
POST   /api/auth/refresh-token  - Refresh access token
POST   /api/auth/logout         - User logout
GET    /api/auth/me             - Get current user
```

### Events
```
GET    /api/events              - Get all events (with filters)
GET    /api/events/:id          - Get single event
POST   /api/events              - Create event (Organizer)
PUT    /api/events/:id          - Update event (Organizer)
DELETE /api/events/:id          - Delete event (Organizer)
GET    /api/events?q=search     - Search events
```

### Tickets
```
GET    /api/events/:eventId/tickets        - Get event tickets
POST   /api/events/:eventId/tickets        - Create ticket tier (Organizer)
PUT    /api/tickets/:id                    - Update ticket (Organizer)
DELETE /api/tickets/:id                    - Delete ticket (Organizer)
GET    /api/tickets/:id                    - Get single ticket
```


### Payments
```
POST   /api/payment/initialize-transaction             - Initialize Paystack payment
POST   /api/payment/verify-transaction                 - Verify Paystack payment
POST   /api/payment/webhook                - Paystack webhook handler
```

### Admin
```
GET    /api/admin/dashboard-stats          - Platform statistics
GET    /api/admin/users                    - Get all users (with filters)
GET    /api/admin/users/stats              - User statistics
GET    /api/admin/users/:id                - Get user details with activity
PUT    /api/admin/users/:id                - Update user details
PUT    /api/admin/users/:id/role           - Change user role
PUT    /api/admin/users/:id/verify         - Verify user manually
DELETE /api/admin/users/:id                - Delete user
```

## 🗄️ Database Schema

### User Model (TypeScript)
```typescript
interface IUser {
  _id: ObjectId;
  fullName?: string;
  userName?: string;           // Unique, sparse index
  email: string;               // Required, unique
  password: string;            // Hashed with bcrypt
  role: 'attendee' | 'organizer' | 'admin';
  organizationName?: string;
  location?: string;
  country: string;
  phone?: number;
  isVerified: boolean;
  isPhoneVerified: boolean;
  acceptedOrganizerTerms: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Event Model
```typescript
interface IEvent {
 _id: Types.ObjectId
  title: string,
  description: string,
  date: Date,
  time: string,
  venue: string,
  price: number,
  ticketsAvailable: number,
  organizerId: Types.ObjectId,
 createdAt: Date,
  image?: string ,
  category: string
}
```

### Ticket Model
```typescript
interface ITicket {
  _id: ObjectId;
  eventId: ObjectId;           // Reference to Event
  name: string;                // e.g., "VIP", "Regular"
  price: number;
  quantity: number;
  description?: string;
  availableQuantity: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### Booking Model
```typescript
interface IPurchasedTicket {
 _id: Types.ObjectId;
  userId: Types.ObjectId | null;
  name: string;
  email: string;
  eventId: Types.ObjectId;
  //  Multiple ticket types in one order
  tickets: {
    ticketId: Types.ObjectId | (ITicket & { eventId: Types.ObjectId | IEvent });
    quantity: number;
    price: number;
  }[];

  totalAmount: number;
  purchaseCode: string;
  qrCode: string;
  status: 'pending' | 'success' | 'failed' | 'not_found';
  createdAt: Date;
  updatedAt: Date;
}
```

## 🎨 Key Features Implementation

### 1. Authentication Flow
- User registers/logs in with email or username (attendees)
- Server generates JWT access token (15min) and refresh token (7 days)
- Access token stored in localStorage
- Refresh token stored in httpOnly cookie
- Automatic token refresh on 401 errors via `apiClient`
- Logout clears both tokens and redirects to login

### 2. Payment Processing (Paystack)
```typescript
// Initialize payment
POST /api/payment/initialize
{
  email: "user@example.com",
  amount: 50000,  // In kobo (GHS 500.00)
  metadata: {
    bookingId: "...",
    eventId: "...",
    ticketId: "..."
  }
}

// Redirect user to Paystack
// After payment, Paystack redirects to callback URL
// Webhook verifies payment and updates booking status
```

### 3. Ticket Generation & Delivery
```typescript
// On successful payment:
1. Update booking status to 'confirmed'
2. Generate PDF ticket with QR code
3. Send email with ticket attachment
4. QR code contains booking ID for verification

// PDF Ticket includes:
- Event details (name, date, venue)
- Ticket type and quantity
- Unique QR code
- Booking reference
- Terms and conditions
```

### 4. Search Functionality
- Real-time search with 300ms debouncing
- Searches: event title, venue, artist, description
- Shows top 5 suggestions with images
- Full-text search on backend with MongoDB `$regex`
- Click suggestion navigates to event details

### 5. Role-Based Access Control
- Route guards protect admin/organizer routes (`AdminRoutes`, `OrganizerRoute`)
- Middleware validates JWT and checks user role
- UI conditionally renders based on role
- API endpoints protected by `protect` and `adminOnly` middleware

### 6. Responsive Design
- Mobile-first approach with Tailwind CSS
- Hamburger menu for mobile navigation
- Card layout for mobile, table for desktop (Admin User Management)
- Touch-friendly buttons and interactions
- Mobile drawer sidebar for admin panel

### 7. Email Service
```typescript
// Ticket delivery email
- Professional HTML template
- Event details
- QR code embedded
- PDF ticket attached
- Call-to-action buttons

// Supported email providers:
- Gmail (with app-specific password)
- SendGrid
- Mailgun
- Custom SMTP
```

##  Testing

### Manual Testing Checklist

**Authentication:**
- [ ] Register new attendee
- [ ] Register new organizer with terms acceptance
- [ ] Login with email
- [ ] Login with username (attendees only)
- [ ] Token refresh on expired access token
- [ ] Logout clears session

**Events (Attendee):**
- [ ] Browse all events
- [ ] Search events with live suggestions
- [ ] Filter by category
- [ ] View event details with tickets
- [ ] Guest checkout flow
- [ ] Authenticated checkout flow

**Payment (Paystack):**
- [ ] Initialize payment
- [ ] Redirect to Paystack
- [ ] Complete payment
- [ ] Webhook processes payment
- [ ] Booking status updated
- [ ] Ticket email sent with PDF

**Events (Organizer):**
- [ ] Create new event
- [ ] Upload event image
- [ ] Edit own event
- [ ] Delete own event
- [ ] Create multiple ticket tiers
- [ ] View event analytics
- [ ] Track ticket sales

**Admin Panel:**
- [ ] View dashboard statistics
- [ ] Search users by name/email
- [ ] Filter users by role
- [ ] View user details with activity
- [ ] Change user roles
- [ ] Verify users manually
- [ ] Delete users (not self)
- [ ] Mobile responsive admin panel

##  Common Issues & Solutions

### 1. MongoDB Connection Error
```
Error: getaddrinfo ENOTFOUND
```
**Solution:** 
- Check MongoDB Atlas IP whitelist
- Add `0.0.0.0/0` in Network Access for development
- Verify connection string in `.env`
- Check internet connection/VPN

### 2. Username Duplicate Key Error
```
E11000 duplicate key error: userName_1
```
**Solution:**
```javascript
// Run in MongoDB shell
use auth_db
db.users.dropIndex("userName_1")
db.users.createIndex({ userName: 1 }, { unique: true, sparse: true })
```

### 3. Paystack Payment Not Processing
**Checklist:**
- Verify `PAYSTACK_SECRET_KEY` is correct
- Ensure amount is in kobo (multiply by 100)
- Check webhook URL is publicly accessible
- Verify payment reference is unique
- Check Paystack dashboard for errors

### 4. Emails Not Sending
**Gmail:**
- Enable 2FA on Google Account
- Generate App-Specific Password
- Use app password in `EMAIL_PASSWORD`

**SendGrid:**
- Verify sender email
- Check API key permissions
- Monitor SendGrid dashboard

### 5. CORS Errors
**Solution:**
```typescript
// backend/src/server.ts
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

### 6. TypeScript Compilation Errors
```bash
# Clear build cache
rm -rf dist/
npm run build

# Check tsconfig.json
```

### 7. Token Refresh Loop
**Solution:**
- Verify refresh token cookie is httpOnly
- Check credentials: 'include' in fetch requests
- Ensure `authRefreshToken` function works correctly

## 🚧 Future Enhancements

### High Priority
- [ ] Password reset functionality
- [ ] SMS notifications via Twilio
- [ ] Event recommendations based on history
- [ ] Social sharing (Twitter, Facebook)

### Medium Priority
- [ ] Event calendar view
- [ ] Event reviews and ratings
- [ ] Refund management system
- [ ] Payout automation
- [ ] Advanced analytics dashboard
- [ ] Multi-currency support

### Nice to Have
- [ ] Dark mode
- [ ] Multi-language support (i18n)
- [ ] Progressive Web App (PWA)
- [ ] Push notifications
- [ ] Event reminders
- [ ] Seat selection for venues
- [ ] Promo codes and discounts
- [ ] Affiliate program

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Standards
- **TypeScript** for all new code (frontend and backend)
- Follow **ESLint** configuration
- Use **Prettier** for formatting
- Write descriptive commit messages
- Add JSDoc comments for complex functions
- Write unit tests for new features

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔧 Scripts

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Backend
```bash
npm run dev          # Start with nodemon 
npm run build        # Compile TypeScript
npm start            # Start production server
npm run lint         # Run ESLint
npm run type-check   # Check TypeScript types
```

##  Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Email: odekendrick@gmail.com
- Documentation: github.com/KendrickOdei/fastTix

##  Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first CSS
- MongoDB team for the excellent database
- Paystack for payment processing
- The TypeScript team for type safety
- The open-source community

---

**Built with ❤️ using TypeScript**

**Version:** 1.0.0  
**Last Updated:** January 2026