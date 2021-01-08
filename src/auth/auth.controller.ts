import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as queryString from "query-string";
import axios from "axios";
import { URL } from "url";
import {
  IUserPopulated,
  ISession,
  IJWTPayload,
} from "../helpers/typescript-helpers/interfaces";
import UserModel from "../REST-entities/user/user.model";
import SessionModel from "../REST-entities/session/session.model";
import WeekModel from "../REST-entities/week/week.model";
import TaskModel from "../REST-entities/task/task.model";
import { newWeek } from "../helpers/function-helpers/new-week";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;
  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    return res
      .status(409)
      .send({ message: `User with this email already exists`, status: false });
  }
  const passwordHash = await bcrypt.hash(
    password,
    Number(process.env.HASH_POWER)
  );
  const week = await newWeek("ru");
  const user = await UserModel.create({
    email,
    passwordHash,
    originUrl: req.headers.origin as string,
    balance: 0,
    currentWeek: week._id,
  });
  const session = await SessionModel.create({
    uid: user._id,
  });
  const token = jwt.sign(
    { uid: user._id, sid: session._id },
    process.env.JWT_SECRET as string
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
      return res.status(201).send({
        message: "Successfully registered",
        status: true,
        token,
        user: {
          email: (data as IUserPopulated).email,
          balance: (data as IUserPopulated).balance,
          id: (data as IUserPopulated)._id,
        },
        week: (data as IUserPopulated).currentWeek,
      });
    });
};

export const registerEn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;
  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    return res
      .status(409)
      .send({ message: `User with this email already exists`, status: false });
  }
  const passwordHash = await bcrypt.hash(
    password,
    Number(process.env.HASH_POWER)
  );
  const week = await newWeek("en");
  const user = await UserModel.create({
    email,
    passwordHash,
    originUrl: req.headers.origin as string,
    balance: 0,
    currentWeek: week._id,
  });
  const session = await SessionModel.create({
    uid: user._id,
  });
  const token = jwt.sign(
    { uid: user._id, sid: session._id },
    process.env.JWT_SECRET as string
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
      return res.status(201).send({
        message: "Successfully registered",
        status: true,
        token,
        user: {
          email: (data as IUserPopulated).email,
          balance: (data as IUserPopulated).balance,
          id: (data as IUserPopulated)._id,
        },
        week: (data as IUserPopulated).currentWeek,
      });
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
      .send({ message: `User with this email doesn't exist`, status: false });
  }
  if (!user.passwordHash) {
    return res.status(403).send({ message: "Forbidden", status: false });
  }
  const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordCorrect) {
    return res
      .status(403)
      .send({ message: "Password is wrong", status: false });
  }
  const session = await SessionModel.create({
    uid: user._id,
  });
  const token = jwt.sign(
    { uid: user._id, sid: session._id },
    process.env.JWT_SECRET as string
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
        message: "Successfully authenticated",
        status: true,
        token,
        user: {
          email: (data as IUserPopulated).email,
          balance: (data as IUserPopulated).balance,
          id: (data as IUserPopulated)._id,
        },
        week: (data as IUserPopulated).currentWeek,
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
    const token = authorizationHeader.replace("Bearer ", "");
    let payload: string | object;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET as string);
    } catch (err) {
      return res.status(401).send({ message: "Unauthorized", status: false });
    }
    const user = await UserModel.findById((payload as IJWTPayload).uid);
    const session = await SessionModel.findById((payload as IJWTPayload).sid);
    if (!user) {
      return res.status(404).send({ message: "Invalid user", status: false });
    }
    if (!session) {
      return res
        .status(404)
        .send({ message: "Invalid session", status: false });
    }
    req.user = user;
    req.session = session;
    next();
  } else
    return res
      .status(400)
      .send({ message: "No token provided", status: false });
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
      status: false,
    });
  }
  const session = await SessionModel.create({
    uid: existingUser._id,
  });
  const token = jwt.sign(
    { uid: existingUser._id, sid: session._id },
    process.env.JWT_SECRET as string
  );
  return res.redirect(`${existingUser.originUrl}?token=${token}`);
};
