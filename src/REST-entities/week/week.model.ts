import mongoose, { Schema } from "mongoose";
import {
  IWeek,
  IWeekPopulated,
} from "../../helpers/typescript-helpers/interfaces";

const weekSchema = new Schema({
  startWeekDate: String,
  endWeekDate: String,
  rewardsGained: Number,
  rewardsPlanned: Number,
  tasks: [{ type: mongoose.Types.ObjectId, ref: "Task" }],
});

export default mongoose.model<IWeek | IWeekPopulated>("Week", weekSchema);
