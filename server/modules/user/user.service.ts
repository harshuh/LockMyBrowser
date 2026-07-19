import { userRepository } from "./user.repo";
import { comparePin, hashPin } from "../../utils/hash";
import { ApiError } from "../../utils/ApiError";
import { ConflictError, UnauthorizedError } from "../../utils/CustomErrors";
import type {
  RegisterInput,
  LoginInput,
  SecretPinInput,
  ResetPinInput,
} from "../../schemas/auth.schema";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt";

export class UserService {
  async registerUser(data: RegisterInput) {
    const existingEmail = await userRepository.findUserByEmail(data.email);

    if (existingEmail)
      throw new ConflictError("User with this email already exists");

    const pinHash = await hashPin(data.pin);

    return userRepository.registerUser({
      name: data.name,
      email: data.email,
      pin: pinHash,
    });
  }

  async loginUser(data: LoginInput) {
    const existingUser = await userRepository.findUserByEmail(data.email);

    if (!existingUser) throw new UnauthorizedError("Invalid email or password");

    const isPasswordvalid = await comparePin(data.pin, existingUser.pin);

    if (!isPasswordvalid)
      throw new UnauthorizedError("Invalid email or password");

    const accessToken = signAccessToken({ id: existingUser.id });
    const refreshToken = signRefreshToken({ id: existingUser.id });
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await userRepository.saveRefreshToken(
      existingUser.id,
      refreshToken,
      expiresAt,
    );

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

  async unlockBrowser(userId: string, pin: string) {
    const pinHash = await userRepository.getPinHashToUnlock(userId);

    if (!pinHash) throw new UnauthorizedError("User not found");

    const isValid = await comparePin(pin, pinHash);

    if (!isValid) throw new UnauthorizedError("Invalid PIN");

    return { unlocked: true };
  }

  async resetPin(userId: string, data: ResetPinInput) {
    const user = await userRepository.findUserById(userId);
    if (!user) throw new UnauthorizedError("User not found");

    const isValid = await comparePin(data.currentPin, user.pin);
    if (!isValid) throw new UnauthorizedError("Current PIN is incorrect");

    const newPinHash = await hashPin(data.newPin);
    await userRepository.updatePin(userId, newPinHash);
    await userRepository.invalidateUserCache(userId, user.email);

    return { message: "PIN updated successfully" };
  }

  async setSecretPin(userId: string, pin: string) {
    const user = await userRepository.findUserById(userId);
    if (!user) throw new UnauthorizedError("User not found");

    const secretPinHash = await hashPin(pin);
    await userRepository.updateSecretPin(userId, secretPinHash);

    return { message: "Secret PIN Created" };
  }

  async toggleSecretPin(userId: string, enabled: boolean) {
    const user = await userRepository.findUserById(userId);
    if (!user) throw new UnauthorizedError("User not found");

    await userRepository.setSecretPinEnabled(userId, enabled);
    if (!enabled) {
      await userRepository.updateSecretPin(userId, null);
    }

    return { message: enabled ? "Secret PIN enabled" : "Secret PIN disabled" };
  }

  async sendVerificationCode(userId: string) {
    const user = await userRepository.findUserById(userId);
    if (!user) throw new UnauthorizedError("User not found");

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await userRepository.saveCode(user.email, "email-verify", code);

    return { message: "Verification code sent" }; // abhi smtp mailer nahi hai so abhi no mail send
  }

  async verifyEmailCode(userId: string, code: string) {
    const user = await userRepository.findUserById(userId);
    if (!user) throw new UnauthorizedError("User not found");

    const storedCode = await userRepository.getCode(user.email, "email-verify");
    if (!storedCode || storedCode !== code) {
      throw new UnauthorizedError("Invalid or expired code");
    }

    await userRepository.markEmailVerified(userId);
    await userRepository.deleteCode(user.email, "email-verify");

    return { message: "Email verified" };
  }

  async requestPinReset(email: string) {
    const user = await userRepository.findUserByEmail(email);
    if (!user)
      return {
        message: "If that email is registered, a reset code has been sent.",
      };

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await userRepository.saveCode(user.email, "pin-reset", code);

    return {
      message: "If that email is registered, a reset code has been sent.",
    }; // abhi smtp mailer nahi hai so abhi no mail send
  }

  async confirmPinReset(email: string, code: string, newPin: string) {
    const user = await userRepository.findUserByEmail(email);
    if (!user) throw new UnauthorizedError("Invalid or expired code");

    const storedCode = await userRepository.getCode(user.email, "pin-reset");
    if (!storedCode || storedCode !== code) {
      throw new UnauthorizedError("Invalid or expired code");
    }

    const newPinHash = await hashPin(newPin);
    await userRepository.updatePin(user.id, newPinHash);
    await userRepository.invalidateUserCache(user.id, user.email);
    await userRepository.deleteCode(user.email, "pin-reset");

    return { message: "PIN reset successfully. You can now log in." };
  }

  async refreshAccessToken(refreshToken: string) {
    if (!refreshToken) throw new UnauthorizedError("Refresh token missing");

    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch (error) {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    const storedToken = await userRepository.findRefreshToken(refreshToken);

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedError(
        "Refresh token invalid or expired — please login again",
      );
    }

    const accessToken = signAccessToken({ id: payload.id });

    return { accessToken };
  }

  async logoutUser(refreshToken: string) {
    if (!refreshToken) throw new UnauthorizedError("Refresh token missing");

    await userRepository.deleteRefreshToken(refreshToken);

    return { message: "Logged out successfully" };
  }
}

export const userService = new UserService();
