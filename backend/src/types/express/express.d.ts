// /types/express/index.d.ts
import  User  from '../../models/user'
import Otp from '../../models/otp';

declare global {
  namespace Express {
    interface Request {
      user?: User; 
      otp?: Otp;
    }
  }
}
