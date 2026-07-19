import { Router } from "express";
import { userController } from "./user.controller";
import { authenticate } from "../../middleware/authenticate";
import { validate } from "../../middleware/validate";
import {
  registerSchema,
  loginSchema,
  pinSchema,
  resetPinSchema,
  setSecretPinSchema,
  toggleSecretPinSchema,
  verifyEmailCodeSchema,
  forgotPinRequestSchema,
  forgotPinConfirmSchema,
} from "../../schemas/auth.schema";

const router = Router();

router.post("/register", validate(registerSchema), userController.register);

router.post("/login", validate(loginSchema), userController.login);

router.post(
  "/unlock",
  authenticate,
  validate(pinSchema),
  userController.unlock,
);

router.post(
  "/resetpin",
  authenticate,
  validate(resetPinSchema),
  userController.resetPin,
);

router.post(
  "/secretpin",
  authenticate,
  validate(setSecretPinSchema),
  userController.setSecretPin,
);

router.post(
  "/secretpin/toggle",
  authenticate,
  validate(toggleSecretPinSchema),
  userController.toggleSecretPin,
);

router.post(
  "/verify-email/send",
  authenticate,
  userController.sendVerificationCode,
);

router.post(
  "/verify-email/confirm",
  authenticate,
  validate(verifyEmailCodeSchema),
  userController.verifyEmailCode,
);

router.post(
  "/forgot-pin",
  validate(forgotPinRequestSchema),
  userController.requestPinReset,
);

router.post(
  "/forgot-pin/confirm",
  validate(forgotPinConfirmSchema),
  userController.confirmPinReset,
);

router.post("/refresh", authenticate, userController.refresh);

router.post("/logout", authenticate, userController.logout);

export default router;
