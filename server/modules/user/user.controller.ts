
import type { Request, Response , NextFunction } from "express";
import { userService } from "./user.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { UnauthorizedError } from "../../utils/CustomErrors";



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
    }

    unlock = async (req:Request, res: Response , next:NextFunction)=>{
        try {
            const { pin } = req.body

            const userId = req.user?.id

            if(!userId) throw new UnauthorizedError('User not authenticated')

            const data = await userService.unlockBrowser(userId, pin);

            res.status(200).json(new ApiResponse(200, "Unlocked successfully", data));            

        } catch (error) {
            next(error)
        }
    }

    refresh = async (req:Request, res:Response, next:NextFunction)=>{
        try {

            const refreshToken = req.cookies?.refreshToken;

            if (!refreshToken) throw new UnauthorizedError("No refresh token provided");

            const data = await userService.refreshAccessToken(refreshToken);

            res.status(200).json(new ApiResponse(200, "Token refreshed", data));


        } catch (error) {
            next(error)
        }
    }

    
    logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies?.refreshToken

      if (!refreshToken) throw new UnauthorizedError("No refresh token provided")

      const data = await userService.logoutUser(refreshToken);

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      res.status(200).json(new ApiResponse(200, data.message));
    } catch (error) {
      next(error)
    }
    }
}
export const userController = new UserController()

