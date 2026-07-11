
import { Router } from "express";
import { userController } from "./user.controller";
import { authenticate } from "../../middleware/authenticate";
import { validate } from "../../middleware/validate";
import { registerSchema ,loginSchema, pinSchema } from "../../schemas/auth.schema";

const router = Router();

router.post('/register', validate(registerSchema), userController.register);

router.post('/login', validate(loginSchema), userController.login)

router.post('/unlock', authenticate, validate(pinSchema), userController.unlock);

router.post('/refresh',authenticate , userController.refresh)

router.post('/logout', authenticate, userController.logout )

export default router;

