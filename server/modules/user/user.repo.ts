import { prisma } from "../../lib/prisma";
import type {
  RegisterInput,
  LoginInput,
  SecretPinInput,
} from "../../schemas/auth.schema";



export class UserRepository {

  async findUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async registerUser(data: RegisterInput) {
    return await prisma.user.create({
      data,
      select: { id: true, name: true, email: true, createdAt: true },
    });
  }

  async saveRefreshToken(userId: string, token: string, expiresAt: Date) {
  return prisma.refreshToken.create({
    data: { userId, token, expiresAt },
  });
  
}
}

export const userRepository = new UserRepository();