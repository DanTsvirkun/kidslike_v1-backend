import { Request, Response, NextFunction } from "express";
import { DateTime } from "luxon";
import { uploadImage } from "../../helpers/function-helpers/multer-config";
import {
  IUser,
  IUserPopulated,
  IWeek,
  IDay,
} from "../../helpers/typescript-helpers/interfaces";
import WeekModel from "../week/week.model";
import TaskModel from "./task.model";
import UserModel from "../user/user.model";

export const createTask = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const { title, reward } = req.body;
  if (!req.file) {
    return res
      .status(400)
      .send({ message: "Please, upload an image", success: false });
  }
  if (req.fileValidationError) {
    return res
      .status(415)
      .send({ message: req.fileValidationError, success: false });
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
    .exec(async (err, data) => {
      if (err) {
        next(err);
      }
      if (tasks.length !== (data as IUserPopulated).currentWeek.tasks.length) {
        return res.status(400).send({
          message: "Invalid tasks amount",
          neededTasksAmount: (data as IUserPopulated).currentWeek.tasks.length,
          success: false,
        });
      }
      const week = await WeekModel.findById(
        (data as IUserPopulated).currentWeek._id
      );
      for (let i = 0; i < tasks.length; i++) {
        const task = await TaskModel.findById(tasks[i].taskId);
        if (
          !task ||
          !(data as IUserPopulated).currentWeek.tasks.find(
            (userTask) => userTask._id.toString() === task._id.toString()
          )
        ) {
          return res
            .status(404)
            .send({ message: "Task not found", success: false });
        }
        for (let n = 0; n < task.days.length; n++) {
          if (task.days[n].date !== tasks[i].days[n].date) {
            return res
              .status(400)
              .send({ message: "Invalid day date", success: false });
          }
          if (!task.days[n].isActive && tasks[i].days[n].isActive) {
            (week as IWeek).rewardsPlanned += task.reward;
          }
          if (task.days[n].isActive && !tasks[i].days[n].isActive) {
            (week as IWeek).rewardsPlanned -= task.reward;
          }
          task.days[n].isActive = tasks[i].days[n].isActive;
        }
        await task.save();
      }
      //   task.days.forEach((day, idx) => {
      //     if (day.date !== tasks[i].days[idx].date) {
      //       return res
      //         .status(400)
      //         .send({ message: "Invalid day date", success: false });
      //     }
      //     if (!day.isActive && tasks[i].days[idx].isActive) {
      //       (week as IWeek).rewardsPlanned += task.reward;
      //     }
      //     if (day.isActive && !tasks[i].days[idx].isActive) {
      //       (week as IWeek).rewardsPlanned -= task.reward;
      //     }
      //     day.isActive = tasks[i].days[idx].isActive;
      //   });
      //   await task.save();
      // }
      await (week as IWeek).save();
      return res.status(200).send({
        message: "Tasks successfully updated",
        success: true,
        updatedWeekPlannedRewards: week?.rewardsPlanned,
        updatedTasks: tasks,
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
        return res
          .status(404)
          .send({ message: "Task not found", success: false });
      }
      const dayToUpdate = task.days.find((day) => day.date === date);
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
      const week = await WeekModel.findById(
        (data as IUserPopulated).currentWeek._id
      );
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
