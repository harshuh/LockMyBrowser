import { Router } from "express";
import { userControlller } from "./user.controller";
import { authenticate } from "../../middleware/authenticate";
import { validate } from "../../middleware/validate";
import { registerSchema ,loginSchema } from "../../schemas/auth.schema";

const router = Router();

router.post('/register', validate(registerSchema), userControlller.register);

router.post('/login', validate(loginSchema), userControlller.login)

export default router;