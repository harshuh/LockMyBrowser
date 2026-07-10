import { Router } from "express";
import { userControlller } from "./user.controller";
import { authenticate } from "../../middleware/authenticate";
import { validate } from "../../middleware/validate";
import { registerSchema } from "../../schemas/auth.schema";

const router: Router = Router();

router.post('/register', validate(registerSchema), userControlller.register);

export default router;