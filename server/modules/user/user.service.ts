import { userRepository } from "./user.repo";
import { comparePin, hashPin } from "../../utils/hash";
import { ApiError } from "../../utils/ApiError";
import { ConflictError, UnauthorizedError } from "../../utils/CustomErrors";
import type { RegisterInput, LoginInput, SecretPinInput,} from "../../schemas/auth.schema";
import { signAccessToken, signRefreshToken } from "../../utils/jwt";


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
}

export const userService = new UserService()