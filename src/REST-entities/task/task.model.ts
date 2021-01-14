import mongoose, { Schema } from "mongoose";
import { ITask } from "../../helpers/typescript-helpers/interfaces";

const taskSchema = new Schema({
  title: String,
  reward: Number,
  imageUrl: String,
  days: [{ date: String, isActive: Boolean, isCompleted: Boolean }],
});

export default mongoose.model<ITask>("Task", taskSchema);
