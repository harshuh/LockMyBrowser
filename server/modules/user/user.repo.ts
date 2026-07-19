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

  async findUserById(id: string) {
    return prisma.user.findUnique({ where: { id } });
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

  async findRefreshToken(token: string) {
    return prisma.refreshToken.findUnique({ where: { token } });
  }

  async deleteRefreshToken(token: string) {
    return prisma.refreshToken.deleteMany({ where: { token } });
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

  async updatePin(userId: string, pinHash: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { pin: pinHash },
    });
  }

  async updateSecretPin(userId: string, secretPinHash: string | null) {
    return prisma.user.update({
      where: { id: userId },
      data: { secretPin: secretPinHash },
    });
  }

  async setSecretPinEnabled(userId: string, enabled: boolean) {
    return prisma.user.update({
      where: { id: userId },
      data: { secretPinEnabled: enabled },
    });
  }

  async markEmailVerified(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true },
    });
  }

  async saveCode(
    email: string,
    purpose: string,
    code: string,
    ttlSeconds = 60 * 10,
  ) {
    await redis.set(`code:${purpose}:${email}`, code, { EX: ttlSeconds });
  }

  async getCode(email: string, purpose: string) {
    return redis.get(`code:${purpose}:${email}`);
  }

  async deleteCode(email: string, purpose: string) {
    await redis.del(`code:${purpose}:${email}`);
  }

  async invalidateUserCache(userId: string, email: string) {
    await redis.del(`user:login:${email}`);
    await redis.del(`user:pinhash:${userId}`);
  }
}

export const userRepository = new UserRepository();
