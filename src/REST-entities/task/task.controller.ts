import { Request, Response } from "express";
import { DateTime } from "luxon";
import { uploadImage } from "../../helpers/function-helpers/multer-config";
import { IWeek, IDay } from "../../helpers/typescript-helpers/interfaces";
import WeekModel from "../week/week.model";
import TaskModel from "./task.model";

export const createTask = async (req: Request, res: Response) => {
  const user = req.user;
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
      date: startOfTheWeek.plus({ days: i }).toLocaleString(),
      isActive: false,
      isCompleted: false,
    };
    days.push(day);
  }
  const userCurrentWeek = await WeekModel.findById(user?.currentWeek);
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
