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
import { checkWeek, newWeek } from "../helpers/function-helpers/new-week";

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
      .send({ message: `User with this email already exists`, success: false });
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
    .exec((err: any, data: IUserPopulated) => {
      if (err) {
        next(err);
      }
      return res.status(201).send({
        message: "Successfully registered",
        success: true,
        token,
        user: {
          email: data.email,
          balance: data.balance,
          id: data._id,
        },
        week: data.currentWeek,
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
      .send({ message: `User with this email already exists`, success: false });
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
    .exec((err: any, data: IUserPopulated) => {
      if (err) {
        next(err);
      }
      return res.status(201).send({
        message: "Successfully registered",
        success: true,
        token,
        user: {
          email: data.email,
          balance: data.balance,
          id: data._id,
        },
        week: data.currentWeek,
      });
    });
};

export const registerPl = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;
  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    return res
      .status(409)
      .send({ message: `User with this email already exists`, success: false });
  }
  const passwordHash = await bcrypt.hash(
    password,
    Number(process.env.HASH_POWER)
  );
  const week = await newWeek("pl");
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
    .exec((err: any, data: IUserPopulated) => {
      if (err) {
        next(err);
      }
      return res.status(201).send({
        message: "Successfully registered",
        success: true,
        token,
        user: {
          email: data.email,
          balance: data.balance,
          id: data._id,
        },
        week: data.currentWeek,
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
      .send({ message: `User with this email doesn't exist`, success: false });
  }
  if (!user.passwordHash) {
    return res.status(403).send({ message: "Forbidden", success: false });
  }
  const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordCorrect) {
    return res
      .status(403)
      .send({ message: "Password is wrong", success: false });
  }
  const session = await SessionModel.create({
    uid: user._id,
  });
  const token = jwt.sign(
    { uid: user._id, sid: session._id },
    process.env.JWT_SECRET as string
  );
  const currentWeek = await checkWeek(user);
  if (!currentWeek) {
    const week = await newWeek("ru");
    user.currentWeek = week._id;
    await user.save();
  }
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
    .exec((err: any, data: IUserPopulated) => {
      if (err) {
        next(err);
      }
      return res.status(200).send({
        message: "Successfully authenticated",
        success: true,
        token,
        user: {
          email: data.email,
          balance: data.balance,
          id: data._id,
        },
        week: data.currentWeek,
      });
    });
};

export const loginEn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email });
  if (!user) {
    return res
      .status(403)
      .send({ message: `User with this email doesn't exist`, success: false });
  }
  if (!user.passwordHash) {
    return res.status(403).send({ message: "Forbidden", success: false });
  }
  const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordCorrect) {
    return res
      .status(403)
      .send({ message: "Password is wrong", success: false });
  }
  const session = await SessionModel.create({
    uid: user._id,
  });
  const token = jwt.sign(
    { uid: user._id, sid: session._id },
    process.env.JWT_SECRET as string
  );
  const currentWeek = await checkWeek(user);
  if (!currentWeek) {
    const week = await newWeek("en");
    user.currentWeek = week._id;
    await user.save();
  }
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
    .exec((err: any, data: IUserPopulated) => {
      if (err) {
        next(err);
      }
      return res.status(200).send({
        message: "Successfully authenticated",
        success: true,
        token,
        user: {
          email: data.email,
          balance: data.balance,
          id: data._id,
        },
        week: data.currentWeek,
      });
    });
};

export const loginPl = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email });
  if (!user) {
    return res
      .status(403)
      .send({ message: `User with this email doesn't exist`, success: false });
  }
  if (!user.passwordHash) {
    return res.status(403).send({ message: "Forbidden", success: false });
  }
  const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordCorrect) {
    return res
      .status(403)
      .send({ message: "Password is wrong", success: false });
  }
  const session = await SessionModel.create({
    uid: user._id,
  });
  const token = jwt.sign(
    { uid: user._id, sid: session._id },
    process.env.JWT_SECRET as string
  );
  const currentWeek = await checkWeek(user);
  if (!currentWeek) {
    const week = await newWeek("pl");
    user.currentWeek = week._id;
    await user.save();
  }
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
    .exec((err: any, data: IUserPopulated) => {
      if (err) {
        next(err);
      }
      return res.status(200).send({
        message: "Successfully authenticated",
        success: true,
        token,
        user: {
          email: data.email,
          balance: data.balance,
          id: data._id,
        },
        week: data.currentWeek,
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
      return res.status(401).send({ message: "Unauthorized", success: false });
    }
    const user = await UserModel.findById((payload as IJWTPayload).uid);
    const session = await SessionModel.findById((payload as IJWTPayload).sid);
    if (!user) {
      return res.status(404).send({ message: "Invalid user", success: false });
    }
    if (!session) {
      return res
        .status(404)
        .send({ message: "Invalid session", success: false });
    }
    req.user = user;
    req.session = session;
    next();
  } else
    return res
      .status(400)
      .send({ message: "No token provided", success: false });
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
      success: false,
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

export const ruGoogleAuth = async (req: Request, res: Response) => {
  const stringifiedParams = queryString.stringify({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: `${process.env.BASE_URL}/auth/google-redirect-ru`,
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

export const ruGoogleRedirect = async (req: Request, res: Response) => {
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
      redirect_uri: `${process.env.BASE_URL}/auth/google-redirect-ru`,
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
  if (!existingUser) {
    const week = await newWeek("ru");
    const existingUser = await UserModel.create({
      email: userData.data.email,
      balance: 0,
      currentWeek: week._id,
    });
    const session = await SessionModel.create({
      uid: existingUser._id,
    });
    const token = jwt.sign(
      { uid: existingUser._id, sid: session._id },
      process.env.JWT_SECRET as string
    );
    return res.redirect(
      `https://goit.global/ru/student_projects/kidslike?token=${token}`
    );
  }
  const session = await SessionModel.create({
    uid: existingUser._id,
  });
  const token = jwt.sign(
    { uid: existingUser._id, sid: session._id },
    process.env.JWT_SECRET as string
  );
  return res.redirect(
    `https://goit.global/ru/student_projects/kidslike?token=${token}`
  );
};

export const plGoogleAuth = async (req: Request, res: Response) => {
  const stringifiedParams = queryString.stringify({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: `${process.env.BASE_URL}/auth/google-redirect-pl`,
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

export const plGoogleRedirect = async (req: Request, res: Response) => {
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
      redirect_uri: `${process.env.BASE_URL}/auth/google-redirect-pl`,
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
  if (!existingUser) {
    const week = await newWeek("pl");
    const existingUser = await UserModel.create({
      email: userData.data.email,
      balance: 0,
      currentWeek: week._id,
    });
    const session = await SessionModel.create({
      uid: existingUser._id,
    });
    const token = jwt.sign(
      { uid: existingUser._id, sid: session._id },
      process.env.JWT_SECRET as string
    );
    return res.redirect(
      `https://goit.global/pl/student_projects/kidslike?token=${token}`
    );
  }
  const session = await SessionModel.create({
    uid: existingUser._id,
  });
  const token = jwt.sign(
    { uid: existingUser._id, sid: session._id },
    process.env.JWT_SECRET as string
  );
  return res.redirect(
    `https://goit.global/pl/student_projects/kidslike?token=${token}`
  );
};

export const enGoogleAuth = async (req: Request, res: Response) => {
  const stringifiedParams = queryString.stringify({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: `${process.env.BASE_URL}/auth/google-redirect-en`,
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

export const enGoogleRedirect = async (req: Request, res: Response) => {
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
      redirect_uri: `${process.env.BASE_URL}/auth/google-redirect-en`,
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
  if (!existingUser) {
    const week = await newWeek("en");
    const existingUser = await UserModel.create({
      email: userData.data.email,
      balance: 0,
      currentWeek: week._id,
    });
    const session = await SessionModel.create({
      uid: existingUser._id,
    });
    const token = jwt.sign(
      { uid: existingUser._id, sid: session._id },
      process.env.JWT_SECRET as string
    );
    return res.redirect(`https://kidslike.goit.global?token=${token}`);
  }
  const session = await SessionModel.create({
    uid: existingUser._id,
  });
  const token = jwt.sign(
    { uid: existingUser._id, sid: session._id },
    process.env.JWT_SECRET as string
  );
  return res.redirect(`https://kidslike.goit.global?token=${token}`);
};

export const qaGoogleAuth = async (req: Request, res: Response) => {
  const stringifiedParams = queryString.stringify({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: `${process.env.BASE_URL}/auth/google-redirect-qa`,
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

export const qaGoogleRedirect = async (req: Request, res: Response) => {
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
      redirect_uri: `${process.env.BASE_URL}/auth/google-redirect-qa`,
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
  if (!existingUser) {
    const week = await newWeek("ru");
    const existingUser = await UserModel.create({
      email: userData.data.email,
      balance: 0,
      currentWeek: week._id,
    });
    const session = await SessionModel.create({
      uid: existingUser._id,
    });
    const token = jwt.sign(
      { uid: existingUser._id, sid: session._id },
      process.env.JWT_SECRET as string
    );
    return res.redirect(`https://goit.global/qa/kidslike?token=${token}`);
  }
  const session = await SessionModel.create({
    uid: existingUser._id,
  });
  const token = jwt.sign(
    { uid: existingUser._id, sid: session._id },
    process.env.JWT_SECRET as string
  );
  return res.redirect(`https://goit.global/qa/kidslike?token=${token}`);
};
