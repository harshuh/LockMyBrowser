import jwt from 'jsonwebtoken';
import type { Secret, SignOptions } from 'jsonwebtoken';
import { env } from '../envs/env';
import { ApiError } from './ApiError';

export interface JwtPayload {
  id  : string;
}


// Here we Sign the JWTs 
export const signAccessToken  = (payload:JwtPayload) =>{
    return jwt.sign(payload, env.JWT_ACCESS_SECRET as Secret, {expiresIn: env.JWT_ACCESS_EXPIRES_IN} as SignOptions)
}

export const signRefreshToken = (payload:JwtPayload)=>{
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {expiresIn: env.JWT_ACCESS_EXPIRES_IN}as SignOptions)
}


// Here we Verify the JWTs
export const VerifyAccessToken = (token:string)=>{
    try {
        return jwt.verify(token,env.JWT_ACCESS_SECRET as Secret) as JwtPayload
    } catch (error) {
        throw new ApiError(401,'Invalid or expired access token');
    }
}

export const VerifyRefreshToken = (token:string)=>{
    try {
        return jwt.verify(token,env.JWT_REFRESH_SECRET as Secret) as JwtPayload
    } catch (error) {
        throw new ApiError(401,'Invalid or expired access token')
    }
}