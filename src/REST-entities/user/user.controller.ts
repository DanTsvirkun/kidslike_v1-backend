import { Request, Response, NextFunction } from "express";
import UserModel from "./user.model";
import WeekModel from "../week/week.model";
import TaskModel from "../task/task.model";
import { IUserPopulated } from "../../helpers/typescript-helpers/interfaces";

export const getAllInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
