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

refreshTokenSchema.pre('save', async function(next){
    if(this.isModified('token')){
        const salt = await bcrypt.genSalt(10);
        this.token = await bcrypt.hash(this.token, salt)
    }

    next()
})

export const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema)