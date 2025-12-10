import mongoose, { Schema, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs'

export interface IRefresh extends Document {
    userId: Types.ObjectId,
    token: string,
    expiresAt: Date

}

const refreshTokenSchema: Schema<IRefresh> = new mongoose.Schema({
    userId: {type: Schema.Types.ObjectId, required: true , ref: 'User' },
    token: {type: String, required: true},
    expiresAt: {type: Date, required: true, }
},{timestamps: true})



export const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema)