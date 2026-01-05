import {Request,Response, NextFunction} from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { loginSchema } from '../schemas/schema'
import { AppError } from '../utils/AppError'
import User from '../models/user'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { RefreshToken } from '../models/refreshToken'
import {v4 as uuidv4} from 'uuid'


export const login = asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    const results = loginSchema.safeParse(req.body)
    if(!results.success) throw new AppError('Invalid data', 400);

    const {email,userName, password} = results.data

//check if user exists
    const user = await User.findOne({
      $or: [
        email ? {email: email.trim().toLowerCase()} : {},
        userName ? {userName: userName.trim().toLowerCase()}: {},
      ],
    })

    if(!user) throw new AppError('invalid credentials', 400)

  
// check if user email is verified
    if(!user.isVerified) throw new AppError('email not verified', 403)
  
//check if user password matches with hashed
  const isMatch = await bcrypt.compare(password,user.password)
    if(!isMatch) throw new AppError('invalid credentials', 400)

    const payLoad = {
      userId: user._id,
      email: user.email,
      userName: user.userName,
      organizationName: user.organizationName,
      role: user.role

    }

    // access token

    const accessToken = jwt.sign(payLoad,process.env.JWT_SECRET as string, {expiresIn: '1h'})

    const rawRefreshToken = uuidv4()
    const refreshToken = new RefreshToken({
      userId: user._id,
      token: rawRefreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    })

    await refreshToken.save();
  
    res.cookie('refreshToken', rawRefreshToken,{
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    })
 

    //send token to client
    res.status(200).json({
      accessToken,
      
      user: {id: user._id, email: user.email, userName: user.userName, 
        organizationName: user.organizationName, role: user.role},
      message: 'Login successfull',
})

})