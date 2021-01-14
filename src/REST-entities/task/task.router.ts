import { Router } from "express";
import mongoose from "mongoose";
import Joi from "joi";
import { authorize } from "./../../auth/auth.controller";
import tryCatchWrapper from "../../helpers/function-helpers/try-catch-wrapper";
import validate from "../../helpers/function-helpers/validate";
import {
  createTask,
  switchTaskActiveStatus,
  switchTaskCompleteStatus,
  switchSingleTaskActiveStatus,
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

const singleTaskActiveArraySchema = Joi.object({
  days: Joi.array().min(7).max(7).items(Joi.boolean()).required(),
});

const taskActiveArraySchema = Joi.object({
  tasks: Joi.array()
    .items(
      Joi.object({
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
        days: Joi.array()
          .items(
            Joi.object({
              date: Joi.string().required(),
              isActive: Joi.boolean().required(),
              isCompleted: Joi.boolean().required(),
            })
          )
          .required(),
      })
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
  "/active",
  tryCatchWrapper(authorize),
  validate(taskActiveArraySchema),
  tryCatchWrapper(switchTaskActiveStatus)
);
router.patch(
  "/single-active/:taskId",
  tryCatchWrapper(authorize),
  validate(taskIdSchema, "params"),
  validate(singleTaskActiveArraySchema),
  tryCatchWrapper(switchSingleTaskActiveStatus)
);
router.patch(
  "/switch/:taskId",
  tryCatchWrapper(authorize),
  validate(taskIdSchema, "params"),
  validate(taskDateSchema),
  tryCatchWrapper(switchTaskCompleteStatus)
);

export default router;
