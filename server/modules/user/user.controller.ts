import type { Request, Response , NextFunction } from "express";
import { userService } from "./user.service";
import { ApiResponse } from "../../utils/ApiResponse";


export class UserController {

    register = async (req: Request, res: Response , next: NextFunction)=>{
        try {
            const data = await userService.registerUser(req.body)
            res.status(201).json(new ApiResponse(201, 'user created', data))
        } catch (error) {
            next(error)
        }
    }
}
export const userControlller = new UserController()