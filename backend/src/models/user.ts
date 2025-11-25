import mongoose, { Schema, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: Types.ObjectId;
  fullName?: string;
  userName?: string;
  email: string;
  password: string;
  role: 'user' | 'organizer' | 'admin';
  organizationName?: string;
  location?: string;
  country?: string;
  phone?: number;
  isVerified: boolean;
  isPhoneVerified: boolean;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const userSchema: Schema<IUser> = new Schema({

  fullName: { type: String, required: false },
  userName: { type: String, trim: true, unique: true, required:
    function(){ return this.role === 'user'}
  },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'organizer', 'admin'], default: 'user' },
  organizationName: { type: String },
  location: { type: String, required: function(){return this.role === 'organizer'} },
  country: {type: String, required: true},
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
