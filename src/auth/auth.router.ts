import { Router } from "express";
import Joi from "joi";
import tryCatchWrapper from "../helpers/function-helpers/try-catch-wrapper";
import {
  register,
  registerEn,
  registerPl,
  login,
  googleAuth,
  googleRedirect,
  logout,
  authorize,
} from "./auth.controller";
import validate from "../helpers/function-helpers/validate";

const signUpInSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
});

const router = Router();

router.post("/register", validate(signUpInSchema), tryCatchWrapper(register));
router.post(
  "/register-en",
  validate(signUpInSchema),
  tryCatchWrapper(registerEn)
);
router.post(
  "/register-pl",
  validate(signUpInSchema),
  tryCatchWrapper(registerPl)
);
router.post("/login", validate(signUpInSchema), tryCatchWrapper(login));
router.post("/logout", tryCatchWrapper(authorize), tryCatchWrapper(logout));
router.get("/google", tryCatchWrapper(googleAuth));
router.get("/google-redirect", tryCatchWrapper(googleRedirect));

export default router;
