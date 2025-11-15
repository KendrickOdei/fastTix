import jwt from 'jsonwebtoken'
import {v4 as uuidv4} from 'uuid'
import redisClient from './redisClient'

// refresh secret and expire variables
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;
const REFRESH_EXPIRES_IN = 60 * 60 * 24 * 7

//create a long lived refresh token
export function signRefreshToken (userId: string){
    const jwtId = uuidv4();
    const token = jwt.sign({userId, jwtId}, REFRESH_SECRET,{
        expiresIn: REFRESH_EXPIRES_IN
    })

    return {token, jwtId}
}
// allowlist refresh jwtId in redis , so we can revoke later
export async function allowListRefreshJwtId (jwtId: string, userId: string){
    await redisClient.setEx(`allowlist:refresh:${jwtId}`, REFRESH_EXPIRES_IN, userId)
    await redisClient.sAdd(`refreshSessions:${userId}`, jwtId)
    await redisClient.expire(`refreshSessions:${userId}`, REFRESH_EXPIRES_IN + 3600)
}

//check if refresh token is still valid

export async function isRefreshJwtAllowed(jwtId: string): Promise<string | null>{
    return await redisClient.get(`allowlist:refresh:${jwtId}`)
}

//revoke refresh tokens

export async function revokeRefreshJwtId(jwtId: string, userId: string){
    await redisClient.del(`allowlist:refresh:${jwtId}`)

    if(userId){
        await redisClient.sRem(`refreshSessions:${userId}`, jwtId)
    }
}

// revoke all refresh tokens
export async function revokeAllRefreshSessions(userId: string){
    const allSessions = await redisClient.keys(`refreshlist:jwtId:*`)
    if(!allSessions) return;

    const pipeline = redisClient.multi()
    for(const key of allSessions){
        pipeline.del(key)
    }

    await pipeline.exec()
}