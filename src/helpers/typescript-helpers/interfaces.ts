import { Document } from "mongoose";
import { MongoDBObjectId } from "./types";

export interface IUser extends Document {
  email: string;
  passwordHash?: string;
  originUrl: string;
  balance: number;
  currentWeek: MongoDBObjectId;
}

export interface IUserPopulated extends Document {
  email: string;
  passwordHash?: string;
  originUrl: string;
  balance: number;
  currentWeek: IWeek;
}

export interface IWeek extends Document {
  dates: string;
  rewardsGained: number;
  rewardsPlanned: number;
  tasks: MongoDBObjectId[];
}

export interface IWeekPopulated extends Document {
  dates: string;
  rewardsGained: number;
  rewardsPlanned: number;
  tasks: ITask[];
}

export interface ITask extends Document {
  title: string;
  reward: number;
  imageUrl: string;
  days: IDay[];
}

export interface IDay {
  date: string;
  isActive: boolean;
  isCompleted: boolean;
}

export interface ISession extends Document {
  uid: string;
}

export interface IJWTPayload {
  uid: string;
  sid: string;
}
