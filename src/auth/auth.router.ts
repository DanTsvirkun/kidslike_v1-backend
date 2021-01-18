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
  ruGoogleAuth,
  ruGoogleRedirect,
  enGoogleAuth,
  enGoogleRedirect,
  plGoogleAuth,
  plGoogleRedirect,
  qaGoogleAuth,
  qaGoogleRedirect,
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
router.post("/login-en", validate(signUpInSchema), tryCatchWrapper(login));
router.post("/login-pl", validate(signUpInSchema), tryCatchWrapper(login));
router.post("/logout", tryCatchWrapper(authorize), tryCatchWrapper(logout));
router.get("/google", tryCatchWrapper(googleAuth));
router.get("/google-redirect", tryCatchWrapper(googleRedirect));
router.get("/google-ru", tryCatchWrapper(ruGoogleAuth));
router.get("/google-redirect-ru", tryCatchWrapper(ruGoogleRedirect));
router.get("/google-en", tryCatchWrapper(enGoogleAuth));
router.get("/google-redirect-en", tryCatchWrapper(enGoogleRedirect));
router.get("/google-pl", tryCatchWrapper(plGoogleAuth));
router.get("/google-redirect-pl", tryCatchWrapper(plGoogleRedirect));
router.get("/google-qa", tryCatchWrapper(qaGoogleAuth));
router.get("/google-redirect-qa", tryCatchWrapper(qaGoogleRedirect));

export default router;
