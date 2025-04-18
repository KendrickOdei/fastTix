// /types/express/index.d.ts
import  User  from '../../models/user'
import Otp from '../../models/otp';

declare global {
  namespace Express {
    interface Request {
      user?: User; // Assuming your User model has an 'id' field and other details
      otp?: Otp;
    }
  }
}
