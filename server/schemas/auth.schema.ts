import { z } from "zod";

export const registerSchema = z.object({
    name: z
        .string({ error: "Name is required" })
        .min(2, "Name must be at least 2 characters")
        .max(18, "Name can't be this long"),

    email: z
        .email({ error: "Invalid email address" })
        .toLowerCase(),

    pin: z
        .string({ error: "Pin is required" })
        .regex(/^\d+$/, "Pin must contain only digits")
        .min(4, "Pin must be at least 4 digits")
        .max(12, "Pin can't exceed 12 digits"),
});

export const loginSchema = z.object({
    email: z
        .email({ error: "Invalid email address" })
        .toLowerCase(),

    pin: z
        .string({ error: "Pin is required" })
        .min(1, "Pin is required"),
});

export const setSecretPinSchema = z.object({
    secretPin: z
        .string({ error: "Secret pin is required" })
        .regex(/^\d+$/, "Secret pin must contain only digits")
        .min(4, "Secret pin must be at least 4 digits")
        .max(12, "Secret pin can't exceed 12 digits"),
})

export type RegisterInput     = z.infer<typeof registerSchema>;
export type LoginInput        = z.infer<typeof loginSchema>;
export type SecretPinInput    = z.infer<typeof setSecretPinSchema>;