import { DateTime } from "luxon";
import { IDay, IUser, IWeek } from "../typescript-helpers/interfaces";
import { MongoDBObjectId } from "../typescript-helpers/types";
import { ruTasks, enTasks } from "../../REST-entities/task/default-tasks";
import TaskModel from "../../REST-entities/task/task.model";
import WeekModel from "../../REST-entities/week/week.model";

export const newWeek = async (lang: "ru" | "en") => {
  let defaultTasks: { title: string; reward: number; imageUrl: string }[];
  lang === "ru" ? (defaultTasks = [...ruTasks]) : (defaultTasks = [...enTasks]);
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
  let tasks: MongoDBObjectId[] = [];
  for (let i = 0; i < defaultTasks.length; i++) {
    const task = await TaskModel.create({
      title: defaultTasks[i].title,
      reward: defaultTasks[i].reward,
      imageUrl: defaultTasks[i].imageUrl,
      days,
    });
    tasks.push(task._id);
  }
  const week = await WeekModel.create({
    startWeekDate: startOfTheWeek.toFormat("yyyy-MM-dd"),
    endWeekDate: startOfTheWeek.plus({ days: 6 }).toFormat("yyyy-MM-dd"),
    rewardsGained: 0,
    rewardsPlanned: 0,
    tasks,
  });
  return week;
};

export const checkWeek = async (user: IUser) => {
  const startOfTheWeek = DateTime.local().startOf("week");
  const userCurrentWeek = await WeekModel.findOne({
    _id: user.currentWeek,
  }).populate("tasks");
  if (
    (userCurrentWeek as IWeek).startWeekDate ===
    startOfTheWeek.toFormat("yyyy-MM-dd")
  ) {
    return userCurrentWeek;
  }
  return false;
};
