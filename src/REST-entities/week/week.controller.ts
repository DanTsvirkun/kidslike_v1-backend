import { Request, Response } from "express";
import { IUser } from "./../../helpers/typescript-helpers/interfaces";
import { newWeek, checkWeek } from "../../helpers/function-helpers/new-week";

export const getWeek = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const currentWeek = await checkWeek(user);
  if (currentWeek) {
    return res.status(200).send({
      message: "Week successfully loaded",
      status: true,
      week: currentWeek,
    });
  }
  const week = await newWeek("ru");
  user.currentWeek = week._id;
  await user.save();
  return res
    .status(200)
    .send({ message: "Week successfully loaded", status: true, week });
};

export const getWeekEn = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const currentWeek = await checkWeek(user);
  if (currentWeek) {
    return res.status(200).send({
      message: "Week successfully loaded",
      status: true,
      week: currentWeek,
    });
  }
  const week = await newWeek("en");
  user.currentWeek = week._id;
  await user.save();
  return res
    .status(200)
    .send({ message: "Week successfully loaded", status: true, week });
};
