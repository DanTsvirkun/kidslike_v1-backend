import { Router } from "express";
import Joi from "joi";
import { authorize } from "./../../auth/auth.controller";
import tryCatchWrapper from "../../helpers/function-helpers/try-catch-wrapper";
import validate from "../../helpers/function-helpers/validate";
import { createTask } from "./task.controller";
import { multerMid } from "../../helpers/function-helpers/multer-config";

const createTaskSchema = Joi.object({
  title: Joi.string().required(),
  reward: Joi.number().required().min(1),
});

const router = Router();

router.post(
  "/",
  tryCatchWrapper(authorize),
  multerMid.single("file"),
  validate(createTaskSchema),
  tryCatchWrapper(createTask)
);

export default router;
