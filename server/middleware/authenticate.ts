
import type { Request , Response , NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { ApiError } from "../utils/ApiError";


export const authenticate  = async (
    req  : Request,
    _res : Response,
    next : NextFunction
): Promise<void> => {
    
    try {
        const authHeader = req.headers.authorization

        const parts = authHeader?.split(' ');

        if (!parts || parts.length !== 2 || parts[0] !== 'Bearer') {
             throw new ApiError(401, 'Authorization header missing or modified');
        }       

        const token = parts[1];

        if(!token) throw new ApiError (401, 'Access token missing')


        const payload = verifyAccessToken(token);

        req.user= { id : payload.id }
        
        next();
    } catch (error) {
        next(error)
        
    }
}