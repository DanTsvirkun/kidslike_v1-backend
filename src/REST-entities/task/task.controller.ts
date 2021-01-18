import { Request, Response, NextFunction } from "express";
import { DateTime } from "luxon";
import { uploadImage } from "../../helpers/function-helpers/multer-config";
import {
  IUser,
  IUserPopulated,
  IWeek,
  ITask,
  IDay,
} from "../../helpers/typescript-helpers/interfaces";
import WeekModel from "../week/week.model";
import TaskModel from "./task.model";
import UserModel from "../user/user.model";

export const createTask = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const { title, reward } = req.body;
  if (req.fileValidationError) {
    return res
      .status(415)
      .send({ message: req.fileValidationError, success: false });
  }
  let imageUrl: string;
  if (!req.file) {
    imageUrl =
      "https://storage.googleapis.com/kidslikev2_bucket/default-task.jpg";
  } else {
    imageUrl = (await uploadImage(req.file)) as string;
  }
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
    message: "Task successfully created",
    success: true,
    title,
    reward: Number(reward),
    imageUrl,
    id: task._id,
    days,
  });
};

export const switchTaskActiveStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user as IUser;
  const { tasks } = req.body;
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
    .exec(async (err: any, data: IUserPopulated) => {
      if (err) {
        next(err);
      }
      if (tasks.length !== data.currentWeek.tasks.length) {
        return res.status(400).send({
          message: "Invalid tasks amount",
          neededTasksAmount: data.currentWeek.tasks.length,
          success: false,
        });
      }
      const week = await WeekModel.findById(data.currentWeek._id);
      for (let i = 0; i < tasks.length; i++) {
        const task = await TaskModel.findById(tasks[i].taskId);
        if (
          !task ||
          !data.currentWeek.tasks.find(
            (userTask) => userTask._id.toString() === task._id.toString()
          )
        ) {
          return res
            .status(404)
            .send({ message: "Task not found", success: false });
        }
        for (let j = 0; j < task.days.length; j++) {
          if (task.days[j].date !== tasks[i].days[j].date) {
            return res
              .status(400)
              .send({ message: "Invalid day date", success: false });
          }
          if (!task.days[j].isActive && tasks[i].days[j].isActive) {
            (week as IWeek).rewardsPlanned += task.reward;
          }
          if (task.days[j].isActive && !tasks[i].days[j].isActive) {
            (week as IWeek).rewardsPlanned -= task.reward;
          }
          task.days[j].isActive = tasks[i].days[j].isActive;
          tasks[i].days[j]._id = task.days[j]._id;
        }
        await task.save();
      }
      await (week as IWeek).save();
      return res.status(200).send({
        message: "Tasks successfully updated",
        success: true,
        updatedWeekPlannedRewards: week?.rewardsPlanned,
        updatedTasks: tasks,
      });
    });
};

export const switchSingleTaskActiveStatus = async (
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
    .exec(async (err: any, data: IUserPopulated) => {
      const week = await WeekModel.findById(data.currentWeek._id);
      if (err) {
        next(err);
      }
      if (
        !task ||
        !data.currentWeek.tasks.find(
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

export const switchTaskCompleteStatus = async (
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
    .exec(async (err: any, data: IUserPopulated) => {
      if (err) {
        next(err);
      }
      if (
        !task ||
        !data.currentWeek.tasks.find(
          (userTask) => userTask._id.toString() === taskId
        )
      ) {
        return res
          .status(404)
          .send({ message: "Task not found", success: false });
      }
      const dayToUpdate = task.days.find((day: IDay) => day.date === date);
      if (!dayToUpdate) {
        return res
          .status(404)
          .send({ message: "Day not found", success: false });
      }
      if (!dayToUpdate.isActive) {
        return res.status(400).send({
          message: "This task doesn't exist on provided day",
          success: false,
        });
      }
      const week = await WeekModel.findById(data.currentWeek._id);
      if (!dayToUpdate.isCompleted) {
        user.balance += task.reward;
        (week as IWeek).rewardsGained += task.reward;
      } else {
        user.balance -= task.reward;
        (week as IWeek).rewardsGained -= task.reward;
      }
      dayToUpdate.isCompleted = !dayToUpdate.isCompleted;
      await task.save();
      await user.save();
      await (week as IWeek).save();
      return res.status(200).send({
        message: "Task has been successfully switched",
        success: true,
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
