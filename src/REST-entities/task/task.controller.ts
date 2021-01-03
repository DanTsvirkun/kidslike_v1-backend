import { Request, Response, NextFunction } from "express";
import { DateTime } from "luxon";
import { uploadImage } from "../../helpers/function-helpers/multer-config";
import {
  IUser,
  IUserPopulated,
  IWeek,
  IDay,
  ITask,
} from "../../helpers/typescript-helpers/interfaces";
import WeekModel from "../week/week.model";
import TaskModel from "./task.model";
import UserModel from "../user/user.model";

export const createTask = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const { title, reward } = req.body;
  if (!req.file) {
    return res.status(400).send({ message: "Please, upload an image" });
  }
  if (req.fileValidationError) {
    return res.status(415).send({ message: req.fileValidationError });
  }
  const imageUrl = (await uploadImage(req.file)) as string;
  const startOfTheWeek = DateTime.local().startOf("week");
  let days: IDay[] = [];
  for (let i = 0; i < 7; i++) {
    const day = {
      date: startOfTheWeek.plus({ days: i }).toFormat("yyyy-MM-dd"),
      isActive: false,
      isCompleted: false,
    };
    days.push(day);
  }
  const userCurrentWeek = await WeekModel.findById(user.currentWeek);
  const task = await TaskModel.create({
    title,
    reward: Number(reward),
    imageUrl,
    days,
  });
  (userCurrentWeek as IWeek).tasks.push(task._id);
  await (userCurrentWeek as IWeek).save();
  return res.status(201).send({
    title,
    reward: Number(reward),
    imageUrl,
    id: task._id,
    days,
  });
};

export const makeTaskActive = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user as IUser;
  const { taskId } = req.params;
  const { days } = req.body;
  const task = await TaskModel.findById(taskId);
  return UserModel.findOne({
    _id: user._id,
  })
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
    .exec(async (err, data) => {
      const week = await WeekModel.findById(
        (data as IUserPopulated).currentWeek._id
      );
      if (err) {
        next(err);
      }
      if (
        !task ||
        !(data as IUserPopulated).currentWeek.tasks.find(
          (userTask) => userTask._id.toString() === taskId
        )
      ) {
        return res.status(404).send({ message: "Task not found" });
      }
      for (let i = 0; i < 7; i++) {
        if (!(task as ITask).days[i].isActive && days[i]) {
          (week as IWeek).rewardsPlanned += task.reward;
        }
        if ((task as ITask).days[i].isActive && !days[i]) {
          (week as IWeek).rewardsPlanned -= task.reward;
        }
        (task as ITask).days[i].isActive = days[i];
      }
      await task.save();
      await (week as IWeek).save();
      return res.status(200).send({
        updatedWeekPlannedRewards: week?.rewardsPlanned,
        updatedTask: {
          title: task.title,
          reward: task.reward,
          imageUrl: task.imageUrl,
          id: task._id,
          days: task.days,
        },
      });
    });
};

export const markTaskCompleted = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user as IUser;
  const { taskId } = req.params;
  const { date } = req.body;
  const task = await TaskModel.findById(taskId);
  return UserModel.findOne({
    _id: user._id,
  })
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
    .exec(async (err, data) => {
      if (err) {
        next(err);
      }
      if (
        !task ||
        !(data as IUserPopulated).currentWeek.tasks.find(
          (userTask) => userTask._id.toString() === taskId
        )
      ) {
        return res.status(404).send({ message: "Task not found" });
      }
      const dayToUpdate = task.days.find((day) => day.date === date);
      if (!dayToUpdate) {
        return res.status(404).send({ message: "Day not found" });
      }
      if (dayToUpdate.isCompleted) {
        return res
          .status(400)
          .send({ message: "This task is already completed on provided day" });
      }
      if (!dayToUpdate.isActive) {
        return res
          .status(400)
          .send({ message: "This task doesn't exist on provided day" });
      }
      const week = await WeekModel.findById(
        (data as IUserPopulated).currentWeek._id
      );
      dayToUpdate.isCompleted = true;
      user.balance += task.reward;
      (week as IWeek).rewardsGained += task.reward;
      await task.save();
      await user.save();
      await (week as IWeek).save();
      return res.status(200).send({
        updatedBalance: user?.balance,
        updatedWeekGainedRewards: week?.rewardsGained,
        updatedTask: {
          title: task.title,
          reward: task.reward,
          imageUrl: task.imageUrl,
          id: task._id,
          days: task.days,
        },
      });
    });
};
