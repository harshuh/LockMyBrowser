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

    login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await userService.loginUser(req.body);

            res.cookie("refreshToken", data.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 30 * 24 * 60 * 60 * 1000,
            });

            res.status(200).json(new ApiResponse(200, "Login successful", { user: data.user, accessToken: data.accessToken,}));

        } catch (error) {
            next(error);
        }
  };
}
export const userControlller = new UserController()