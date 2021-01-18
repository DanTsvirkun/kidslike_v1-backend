import { Request, Response, NextFunction } from "express";
import UserModel from "./user.model";
import WeekModel from "../week/week.model";
import TaskModel from "../task/task.model";
import {
  IUser,
  IUserPopulated,
} from "../../helpers/typescript-helpers/interfaces";
import { checkWeek, newWeek } from "../../helpers/function-helpers/new-week";

export const getAllInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user as IUser;
  const currentWeek = await checkWeek(user);
  if (!currentWeek) {
    const week = await newWeek("ru");
    user.currentWeek = week._id;
    await user.save();
  }
  return UserModel.findOne({ _id: req.user?._id })
    .populate({
      path: "currentWeek",
      model: WeekModel,
      populate: [
        {
          path: "tasks",
          model: TaskModel,
        },
      ],
    })
    .exec((err: any, data: IUserPopulated) => {
      if (err) {
        next(err);
      }
      return res.status(200).send({
        message: "Successfully got all info",
        success: true,
        user: {
          email: data.email,
          balance: data.balance,
          id: data._id,
        },
        week: data.currentWeek,
      });
    });
};

export const enGetAllInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user as IUser;
  const currentWeek = await checkWeek(user);
  if (!currentWeek) {
    const week = await newWeek("en");
    user.currentWeek = week._id;
    await user.save();
  }
  return UserModel.findOne({ _id: req.user?._id })
    .populate({
      path: "currentWeek",
      model: WeekModel,
      populate: [
        {
          path: "tasks",
          model: TaskModel,
        },
      ],
    })
    .exec((err: any, data: IUserPopulated) => {
      if (err) {
        next(err);
      }
      return res.status(200).send({
        message: "Successfully got all info",
        success: true,
        user: {
          email: data.email,
          balance: data.balance,
          id: data._id,
        },
        week: data.currentWeek,
      });
    });
};

export const plGetAllInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user as IUser;
  const currentWeek = await checkWeek(user);
  if (!currentWeek) {
    const week = await newWeek("pl");
    user.currentWeek = week._id;
    await user.save();
  }
  return UserModel.findOne({ _id: req.user?._id })
    .populate({
      path: "currentWeek",
      model: WeekModel,
      populate: [
        {
          path: "tasks",
          model: TaskModel,
        },
      ],
    })
    .exec((err: any, data: IUserPopulated) => {
      if (err) {
        next(err);
      }
      return res.status(200).send({
        message: "Successfully got all info",
        success: true,
        user: {
          email: data.email,
          balance: data.balance,
          id: data._id,
        },
        week: data.currentWeek,
      });
    });
};
