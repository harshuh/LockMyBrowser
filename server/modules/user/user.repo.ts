
import { prisma } from "../../lib/prisma";
import type {
  RegisterInput,
  LoginInput,
  SecretPinInput,
} from "../../schemas/auth.schema";
import redis from "../../config/redisClient";



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

  async getPinHashToUnlock(userId: string) {
    const cacheKey = `user:pinhash:${userId}`;

    const cached = await redis.get(cacheKey);

    if (cached) return cached;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { pin: true },
    });

    if (!user) return null;

    await redis.set(cacheKey, user.pin, { EX: 60 * 60 * 6 });
    return user.pin;
  }

  async invalidateUserCache(userId: string, email: string) {
    await redis.del(`user:login:${email}`);
    await redis.del(`user:pinhash:${userId}`);
  } 
}

export const userRepository = new UserRepository();