import mongoose from "mongoose";
import supertest, { Response } from "supertest";
import { Application } from "express";
import { DateTime } from "luxon";
import {
  IWeek,
  ITask,
  IWeekPopulated,
} from "../../helpers/typescript-helpers/interfaces";
import Server from "../../server/server";
import UserModel from "../user/user.model";
import SessionModel from "../session/session.model";
import WeekModel from "./week.model";
import TaskModel from "../task/task.model";

describe("Week router test suite", () => {
  let app: Application;
  let createdWeek: IWeek | IWeekPopulated | null;
  let token: string;
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
    token = response.body.token;
    createdWeek = await WeekModel.findById(response.body.week._id)
      .populate("tasks")
      .lean();
  });

  afterAll(async () => {
    await UserModel.deleteOne({ _id: response.body.user.id });
    await SessionModel.deleteMany({ uid: response.body.user.id });
    await WeekModel.deleteOne({ _id: response.body.week._id });
    await TaskModel.deleteOne({
      _id: response.body.week.tasks[0]._id,
    });
    await TaskModel.deleteOne({
      _id: response.body.week.tasks[1]._id,
    });
    await TaskModel.deleteOne({
      _id: response.body.week.tasks[2]._id,
    });
    await TaskModel.deleteOne({
      _id: response.body.week.tasks[3]._id,
    });
    await TaskModel.deleteOne({
      _id: response.body.week.tasks[4]._id,
    });
    await TaskModel.deleteOne({
      _id: response.body.week.tasks[5]._id,
    });
    await TaskModel.deleteOne({
      _id: response.body.week.tasks[6]._id,
    });
    await TaskModel.deleteOne({
      _id: response.body.week.tasks[7]._id,
    });
    await mongoose.connection.close();
  });

  describe("GET /week", () => {
    let response: Response;
    let startOfTheWeek: DateTime;

    context("Valid request", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .get("/week")
          .set("Authorization", `Bearer ${token}`);
        startOfTheWeek = DateTime.local().startOf("week");
      });

      it("Should return a 200 status code", () => {
        expect(response.status).toBe(200);
      });

      it("Should return an expected result", () => {
        expect(response.body).toEqual({
          message: "Week successfully loaded",
          success: true,
          week: {
            startWeekDate: startOfTheWeek.toFormat("yyyy-MM-dd"),
            endWeekDate: startOfTheWeek
              .plus({ days: 6 })
              .toFormat("yyyy-MM-dd"),
            rewardsGained: 0,
            rewardsPlanned: 0,
            _id: createdWeek?._id.toString(),
            __v: 0,
            tasks: (createdWeek as IWeekPopulated).tasks.map((task: ITask) => {
              task._id = task._id.toString();
              task.days.forEach((day) => {
                day._id = day._id?.toString();
              });
              return task;
            }),
          },
        });
      });
    });

    context("Without providing 'token'", () => {
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

    context("With invalid 'token'", () => {
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
