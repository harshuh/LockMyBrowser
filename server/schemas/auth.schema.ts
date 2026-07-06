import { email, z } from "zod";

export const registerSchema = z.object({
    name : z.string({error : "Name is required"}).min(2,"Name must be at least 2 characters").max(18,"Name can't be this long"),
    email : z.string({error : "Email is required"}).email("Invalid Email address").toLowerCase(),
    pin: z.number("Pin is rquired").min(4,"Pin must be at least 4 Digits").max(12,"Pin can excedds 12 Digits")
})

export const loginSchema = z.object({
    email : z.string({error : "Email is required"}).email("Invalid Email address").toLowerCase(),
    pin: z.number("Pin is rquired").min(1,"Pin is required")
})