import {Request,Response, NextFunction} from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { loginSchema } from '../schemas/schema'
import { AppError } from '../utils/AppError'
import User from '../models/user'
import bcrypt from 'bcryptjs'


import { signAccessToken,allowListJti } from '../utils/accessToken'
import { signRefreshToken,allowListRefreshJwtId } from '../utils/refreshToken'



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


    // create token with jti
    const payload = {id:
      user._id.toString(), role: user.role, email: user.email,
      userName: user.userName
    }
    
    const { token: accessToken, jwtId: accessJwtId, expiresIn} = signAccessToken(payload)

    // allowlist the jti in redis
    await allowListJti(accessJwtId, user._id.toString(), expiresIn)

    //Refresh token

    const { token: refreshToken, jwtId: refreshJwtId} = signRefreshToken(user.id);

    await allowListRefreshJwtId(refreshJwtId,user.id)

    //send token to client
    res.status(200).json({
      accessToken,
      refreshToken,
      user: {id: user.id, email: user.email},
      message: 'Login successfull',
       expiresIn})

})