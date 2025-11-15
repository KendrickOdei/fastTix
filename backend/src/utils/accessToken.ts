import jwt from 'jsonwebtoken'
import {v4 as uuidv4} from 'uuid'
import redisClient from './redisClient'
import dotenv from 'dotenv';

dotenv.config()

// access secrete and expire variables
const JWT_SECRET = process.env.JWT_SECRET as string
const ACCESS_EXPIRES_IN = 60 * 15

//create a short lived access token
export function signAccessToken(payLoad: object, options?: {expiresIn: number}){
    const jwtId = uuidv4() // unique token ID

    const expiresIn = options?.expiresIn ?? ACCESS_EXPIRES_IN

    //INCLUDE Jwt Id

    const token = jwt.sign({...payLoad, jwtId}, JWT_SECRET, {expiresIn})

    return {token , jwtId, expiresIn}
}

//Allow list a token jti in redis
export async function allowListJti(jwtId: string, userId: string, ttlSeconds: number) {
    await redisClient.setEx(`allowlist:jti:${jwtId}`, ttlSeconds, userId)

    await redisClient.sAdd(`userSessions:${userId}`, jwtId)

    await redisClient.expire(`userSessions:${userId}`, ttlSeconds + 60)
}

//check if jwtId is still valid
export async function isJtiAllowed(jwtId: string, userId?: string) {
   const v = await redisClient.get(`allowlist:jti:${jwtId}`)

   return v;

}


export async function revokeJti(jwtId: string, userId?: string){
    await redisClient.del(`allowlist:jti:${jwtId}`)

    if (userId){
        await redisClient.sRem(`userSessions:${userId}`, jwtId)
    }
}

export async function 
revokeAllUserSessions(userId: string){
    const jwtIds = await redisClient.sMembers(`userSessions:${userId}`)

    if (jwtIds && jwtIds.length){
        const pipeline = redisClient.multi();

        for( const id of jwtIds)
        pipeline.del(`allowlist:jti:${id}`)
            pipeline.del(`userSessions:${userId}`)

            await pipeline.exec()
    }
}