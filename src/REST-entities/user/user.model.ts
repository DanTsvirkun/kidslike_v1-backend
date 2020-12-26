import mongoose, { Schema } from "mongoose";
import {
  IUser,
  IUserPopulated,
} from "../../helpers/typescript-helpers/interfaces";

const userSchema = new Schema({
  email: String,
  passwordHash: String,
  originUrl: String,
  balance: Number,
  currentWeek: { type: mongoose.Types.ObjectId, ref: "Week" },
});

export default mongoose.model<IUser | IUserPopulated>("User", userSchema);
