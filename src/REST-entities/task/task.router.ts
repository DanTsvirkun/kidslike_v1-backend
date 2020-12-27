import { Router } from "express";
import mongoose from "mongoose";
import Joi from "joi";
import { authorize } from "./../../auth/auth.controller";
import tryCatchWrapper from "../../helpers/function-helpers/try-catch-wrapper";
import validate from "../../helpers/function-helpers/validate";
import {
  createTask,
  makeTaskActive,
  markTaskCompleted,
} from "./task.controller";
import { multerMid } from "../../helpers/function-helpers/multer-config";

const createTaskSchema = Joi.object({
  title: Joi.string().required(),
  reward: Joi.number().required().min(1),
});

const taskIdSchema = Joi.object({
  taskId: Joi.string()
    .custom((value, helpers) => {
      const isValidObjectId = mongoose.Types.ObjectId.isValid(value);
      if (!isValidObjectId) {
        return helpers.message({
          custom: "Invalid 'taskId'. Must be a MongoDB ObjectId",
        });
      }
      return value;
    })
    .required(),
});

const taskDateSchema = Joi.object({
  date: Joi.string()
    .custom((value, helpers) => {
      const dateRegex = /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/;
      const isValidDate = dateRegex.test(value);
      if (!isValidDate) {
        return helpers.message({
          custom: "Invalid 'date'. Please, use YYYY-MM-DD string format",
        });
      }
      return value;
    })
    .required(),
});

const taskArrayDateSchema = Joi.object({
  dates: Joi.array()
    .items(
      Joi.string()
        .custom((value, helpers) => {
          const dateRegex = /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/;
          const isValidDate = dateRegex.test(value);
          if (!isValidDate) {
            return helpers.message({
              custom: "Invalid 'date'. Please, use YYYY-MM-DD string format",
            });
          }
          return value;
        })
        .required()
    )
    .required(),
});

const router = Router();

router.post(
  "/",
  tryCatchWrapper(authorize),
  multerMid.single("file"),
  validate(createTaskSchema),
  tryCatchWrapper(createTask)
);
router.patch(
  "/active/:taskId",
  tryCatchWrapper(authorize),
  validate(taskIdSchema, "params"),
  validate(taskArrayDateSchema),
  tryCatchWrapper(makeTaskActive)
);
router.patch(
  "/complete/:taskId",
  tryCatchWrapper(authorize),
  validate(taskIdSchema, "params"),
  validate(taskDateSchema),
  tryCatchWrapper(markTaskCompleted)
);

export default router;
