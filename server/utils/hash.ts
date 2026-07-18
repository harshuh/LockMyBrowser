import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export const hashPin = async (pin: string): Promise<string> => {
  return bcrypt.hash(pin, SALT_ROUNDS);
};

export const comparePin = async (
  pin: string,
  hashPin: string,
): Promise<boolean> => {
  return bcrypt.compare(pin, hashPin);
};
