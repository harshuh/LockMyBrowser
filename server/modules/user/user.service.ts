import { userRepository, UserRepository } from "./user.repo";
import { hashPin } from "../../utils/hash";
import { ApiError } from "../../utils/ApiError";
import { ConflictError } from "../../utils/CustomErrors";
import type { RegisterInput, LoginInput, SecretPinInput,} from "../../schemas/auth.schema";


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
}

export const userService = new UserService()