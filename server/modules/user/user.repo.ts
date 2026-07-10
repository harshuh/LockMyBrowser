import { prisma } from "../../lib/prisma";
import type {
  RegisterInput,
  LoginInput,
  SecretPinInput,
} from "../../schemas/auth.schema";



export class UserRepository {
  async registerUser(data: RegisterInput) {
    return await prisma.user.create({
      data,
    });
  }

  async updatePin(userId: string, pin: string) {
    return await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        pin,
      },
    });
  }

  async updateSecretPin(userId: string, secretpin: string) {
    return await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        secretpin,
      },
    });
  }

  async deleteUser(userId: string) {
    return await prisma.user.delete({
      where: {
        id: userId,
      },
    });
  }
}

export const userRepository = new UserRepository();