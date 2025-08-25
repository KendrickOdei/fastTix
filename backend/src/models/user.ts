import mongoose, { Schema, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: Types.ObjectId;
  firstName?: string;
  lastName?: string;
  userName?: string;
  email: string;
  password: string;
  role: 'user' | 'organizer';
  organizationName?: string;
  organizationLocation?: string;
  phone?: number;
  isVerified: boolean;
  isPhoneVerified: boolean;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const userSchema: Schema<IUser> = new Schema({
  firstName: { type: String, required: false },
  lastName: { type: String, required: false },
  userName: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'organizer'], default: 'user' },
  organizationName: { type: String },
  organizationLocation: { type: String },
  phone: { type: Number },
  isVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },
});

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;