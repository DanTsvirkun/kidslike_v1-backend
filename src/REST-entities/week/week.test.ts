import mongoose from "mongoose";
import supertest, { Response } from "supertest";
import { Application } from "express";
import {
  IWeek,
  ITask,
  IWeekPopulated,
} from "../../helpers/typescript-helpers/interfaces";
import Server from "../../server/server";
import UserModel from "../user/user.model";
import SessionModel from "../session/session.model";
import WeekModel from "../week/week.model";
import TaskModel from "../task/task.model";

describe("Week router test suite", () => {
  let app: Application;
  let createdWeek: IWeek | IWeekPopulated | null;
  let accessToken: string;
  let response: Response;

  beforeAll(async () => {
    app = new Server().startForTesting();
    const url = `mongodb://127.0.0.1/week`;
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
    await supertest(app)
      .post("/auth/register")
      .send({ email: "test@email.com", password: "qwerty123" });
    response = await supertest(app)
      .post("/auth/login")
      .send({ email: "test@email.com", password: "qwerty123" });
    accessToken = response.body.accessToken;
    createdWeek = await WeekModel.findById(response.body.data.week._id)
      .populate("tasks")
      .lean();
  });

  afterAll(async () => {
    await UserModel.deleteOne({ _id: response.body.data.id });
    await SessionModel.deleteOne({ _id: response.body.sid });
    await WeekModel.deleteOne({ _id: response.body.data.week._id });
    await TaskModel.deleteOne({
      _id: response.body.data.week.tasks[0]._id,
    });
    await TaskModel.deleteOne({
      _id: response.body.data.week.tasks[1]._id,
    });
    await TaskModel.deleteOne({
      _id: response.body.data.week.tasks[2]._id,
    });
    await TaskModel.deleteOne({
      _id: response.body.data.week.tasks[3]._id,
    });
    await TaskModel.deleteOne({
      _id: response.body.data.week.tasks[4]._id,
    });
    await TaskModel.deleteOne({
      _id: response.body.data.week.tasks[5]._id,
    });
    await TaskModel.deleteOne({
      _id: response.body.data.week.tasks[6]._id,
    });
    await TaskModel.deleteOne({
      _id: response.body.data.week.tasks[7]._id,
    });
    await mongoose.connection.close();
  });

  describe("GET /week", () => {
    let response: Response;

    context("Valid request", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .get("/week")
          .set("Authorization", `Bearer ${accessToken}`);
      });

      it("Should return a 200 status code", () => {
        expect(response.status).toBe(200);
      });

      it("Should return an expected result", () => {
        expect(response.body).toEqual({
          dates: createdWeek?.dates,
          rewardsGained: createdWeek?.rewardsGained,
          rewardsPlanned: createdWeek?.rewardsPlanned,
          _id: createdWeek?._id.toString(),
          __v: 0,
          tasks: (createdWeek as IWeekPopulated).tasks.map((task: ITask) => {
            task._id = task._id.toString();
            return task;
          }),
        });
      });
    });

    context("Without providing 'accessToken'", () => {
      beforeAll(async () => {
        response = await supertest(app).get("/week");
      });

      it("Should return a 400 status code", () => {
        expect(response.status).toBe(400);
      });

      it("Should say that token wasn't provided", () => {
        expect(response.body.message).toBe("No token provided");
      });
    });

    context("With invalid 'accessToken'", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .get("/week")
          .set("Authorization", `Bearer qwerty123`);
      });

      it("Should return a 401 status code", () => {
        expect(response.status).toBe(401);
      });

      it("Should return an unauthorized status", () => {
        expect(response.body.message).toBe("Unauthorized");
      });
    });
  });
});
