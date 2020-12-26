import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as queryString from "query-string";
import { DateTime } from "luxon";
import axios from "axios";
import { URL } from "url";
import {
  IUserPopulated,
  IWeek,
  IDay,
  ISession,
  IJWTPayload,
} from "../helpers/typescript-helpers/interfaces";
import { MongoDBObjectId } from "../helpers/typescript-helpers/types";
import UserModel from "../REST-entities/user/user.model";
import SessionModel from "../REST-entities/session/session.model";
import WeekModel from "../REST-entities/week/week.model";
import TaskModel from "../REST-entities/task/task.model";
import defaultTasks from "../REST-entities/task/default-tasks";

export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    return res
      .status(409)
      .send({ message: `User with ${email} email already exists` });
  }
  const passwordHash = await bcrypt.hash(
    password,
    Number(process.env.HASH_POWER)
  );
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
  let tasks: MongoDBObjectId[] = [];
  // defaultTasks.forEach(async (defaultTask) => {
  //   const task = await TaskModel.create({
  //     title: defaultTask.title,
  //     reward: defaultTask.reward,
  //     imageUrl: defaultTask.imageUrl,
  //     days,
  //   });
  //   tasks.push(task._id);
  // });
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
    dates: `${startOfTheWeek.toLocaleString()}/${startOfTheWeek
      .plus({ days: 6 })
      .toLocaleString()}`,
    rewardsGained: 0,
    rewardsPlanned: 0,
    tasks,
  });
  const newUser = await UserModel.create({
    email,
    passwordHash,
    originUrl: req.headers.origin as string,
    balance: 0,
    currentWeek: week._id,
  });
  return res.status(201).send({
    email,
    id: newUser._id,
  });
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email });
  if (!user) {
    return res
      .status(403)
      .send({ message: `User with ${email} email doesn't exist` });
  }
  if (!user.passwordHash) {
    return res.status(403).send({ message: "Forbidden" });
  }
  const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordCorrect) {
    return res.status(403).send({ message: "Password is wrong" });
  }
  const newSession = await SessionModel.create({
    uid: user._id,
  });
  const accessToken = jwt.sign(
    { uid: user._id, sid: newSession._id },
    process.env.JWT_SECRET as string,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRE_TIME,
    }
  );
  const refreshToken = jwt.sign(
    { uid: user._id, sid: newSession._id },
    process.env.JWT_SECRET as string,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRE_TIME,
    }
  );
  return UserModel.findOne({ email })
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
    .exec((err, data) => {
      if (err) {
        next(err);
      }
      return res.status(200).send({
        accessToken,
        refreshToken,
        sid: newSession._id,
        data: {
          email: (data as IUserPopulated).email,
          balance: (data as IUserPopulated).balance,
          id: (data as IUserPopulated)._id,
          week: (data as IUserPopulated).currentWeek,
        },
      });
    });
};

export const authorize = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authorizationHeader = req.get("Authorization");
  if (authorizationHeader) {
    const accessToken = authorizationHeader.replace("Bearer ", "");
    let payload: string | object;
    try {
      payload = jwt.verify(accessToken, process.env.JWT_SECRET as string);
    } catch (err) {
      return res.status(401).send({ message: "Unauthorized" });
    }
    const user = await UserModel.findById((payload as IJWTPayload).uid);
    const session = await SessionModel.findById((payload as IJWTPayload).sid);
    if (!user) {
      return res.status(404).send({ message: "Invalid user" });
    }
    if (!session) {
      return res.status(404).send({ message: "Invalid session" });
    }
    req.user = user;
    req.session = session;
    next();
  } else return res.status(400).send({ message: "No token provided" });
};

export const refreshTokens = async (req: Request, res: Response) => {
  const authorizationHeader = req.get("Authorization");
  if (authorizationHeader) {
    const activeSession = await SessionModel.findById(req.body.sid);
    if (!activeSession) {
      return res.status(404).send({ message: "Invalid session" });
    }
    const reqRefreshToken = authorizationHeader.replace("Bearer ", "");
    let payload: string | object;
    try {
      payload = jwt.verify(reqRefreshToken, process.env.JWT_SECRET as string);
    } catch (err) {
      await SessionModel.findByIdAndDelete(req.body.sid);
      return res.status(401).send({ message: "Unauthorized" });
    }
    const user = await UserModel.findById((payload as IJWTPayload).uid);
    const session = await SessionModel.findById((payload as IJWTPayload).sid);
    if (!user) {
      return res.status(404).send({ message: "Invalid user" });
    }
    if (!session) {
      return res.status(404).send({ message: "Invalid session" });
    }
    await SessionModel.findByIdAndDelete((payload as IJWTPayload).sid);
    const newSession = await SessionModel.create({
      uid: user._id,
    });
    const newAccessToken = jwt.sign(
      { uid: user._id, sid: newSession._id },
      process.env.JWT_SECRET as string,
      {
        expiresIn: process.env.JWT_ACCESS_EXPIRE_TIME,
      }
    );
    const newRefreshToken = jwt.sign(
      { uid: user._id, sid: newSession._id },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_REFRESH_EXPIRE_TIME }
    );
    return res
      .status(200)
      .send({ newAccessToken, newRefreshToken, newSid: newSession._id });
  }
  return res.status(400).send({ message: "No token provided" });
};

export const logout = async (req: Request, res: Response) => {
  const currentSession = req.session;
  await SessionModel.deleteOne({ _id: (currentSession as ISession)._id });
  req.user = null;
  req.session = null;
  return res.status(204).end();
};

export const googleAuth = async (req: Request, res: Response) => {
  const stringifiedParams = queryString.stringify({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: `${process.env.BASE_URL}/auth/google-redirect`,
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ].join(" "),
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
  });
  return res.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${stringifiedParams}`
  );
};

export const googleRedirect = async (req: Request, res: Response) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  const urlObj = new URL(fullUrl);
  const urlParams = queryString.parse(urlObj.search);
  const code = urlParams.code;
  const tokenData = await axios({
    url: `https://oauth2.googleapis.com/token`,
    method: "post",
    data: {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${process.env.BASE_URL}/auth/google-redirect`,
      grant_type: "authorization_code",
      code,
    },
  });
  const userData = await axios({
    url: "https://www.googleapis.com/oauth2/v2/userinfo",
    method: "get",
    headers: {
      Authorization: `Bearer ${tokenData.data.access_token}`,
    },
  });
  let existingUser = await UserModel.findOne({ email: userData.data.email });
  if (!existingUser || !existingUser.originUrl) {
    return res.status(403).send({
      message:
        "You should register from front-end first (not postman). Google is only for sign-in",
    });
  }
  const newSession = await SessionModel.create({
    uid: existingUser._id,
  });
  const accessToken = jwt.sign(
    { uid: existingUser._id, sid: newSession._id },
    process.env.JWT_SECRET as string,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRE_TIME,
    }
  );
  const refreshToken = jwt.sign(
    { uid: existingUser._id, sid: newSession._id },
    process.env.JWT_SECRET as string,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRE_TIME,
    }
  );
  return res.redirect(
    `${existingUser.originUrl}?accessToken=${accessToken}&refreshToken=${refreshToken}&sid=${newSession._id}`
  );
};
