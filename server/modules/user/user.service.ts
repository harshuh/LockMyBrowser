
import { userRepository } from "./user.repo";
import { comparePin, hashPin } from "../../utils/hash";
import { ApiError } from "../../utils/ApiError";
import { ConflictError, UnauthorizedError } from "../../utils/CustomErrors";
import type { RegisterInput, LoginInput, SecretPinInput,} from "../../schemas/auth.schema";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt";


export class UserService {

    async registerUser(data:RegisterInput){

        const existingEmail = await userRepository.findUserByEmail(data.email)

        if(existingEmail) throw new ConflictError('User with this email already exists')

        const pinHash  = await hashPin(data.pin)

        return userRepository.registerUser({
        name: data.name,
        email: data.email,
        pin: pinHash,
        });
    }

    async loginUser(data:LoginInput){
        const existingUser = await userRepository.findUserByEmail(data.email)

        if (!existingUser) throw new UnauthorizedError('Invalid email or password') 
        
        const isPasswordvalid = await comparePin(data.pin,existingUser.pin)

        if(!isPasswordvalid) throw new UnauthorizedError('Invalid email or password')

        const accessToken = signAccessToken({id:existingUser.id})
        const refreshToken = signRefreshToken({id:existingUser.id})
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

        await userRepository.saveRefreshToken(existingUser.id,refreshToken,expiresAt) 

        return {
            user: {
                id: existingUser.id,
                name: existingUser.name,
                email: existingUser.email,
            },
            accessToken,
            refreshToken,
        };
    }

    async unlockBrowser(userId: string, pin: string){
        
        const pinHash = await userRepository.getPinHashToUnlock(userId)

        if(!pinHash) throw new UnauthorizedError("User not found");

        const isValid = await comparePin(pin, pinHash);

        if (!isValid) throw new UnauthorizedError("Invalid PIN");

        return { unlocked: true };

    }

    async refreshAccessToken(refreshToken: string) {

        if (!refreshToken) throw new UnauthorizedError("Refresh token missing");

        let payload
        try {

            payload = verifyRefreshToken(refreshToken)

        } catch (error) {
            throw new UnauthorizedError("Invalid or expired refresh token")
        }

        const storedToken = await userRepository.findRefreshToken(refreshToken)

        if(!storedToken || storedToken.expiresAt<new Date()){
            throw new UnauthorizedError("Refresh token invalid or expired — please login again")
        }

        const accessToken = signAccessToken({id:payload.id})

        return { accessToken };

    }

    async logoutUser(refreshToken: string){
        if(!refreshToken) throw new UnauthorizedError("Refresh token missing")

        await userRepository.deleteRefreshToken(refreshToken)

        return {message: "Logged out successfully"}
    }
}

export const userService = new UserService()