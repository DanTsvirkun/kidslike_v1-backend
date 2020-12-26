import path from "path";
import mongoose from "mongoose";
import supertest, { Response } from "supertest";
import { Application } from "express";
import { DateTime } from "luxon";
import {
  IWeek,
  IWeekPopulated,
  ITask,
  IDay,
} from "../../helpers/typescript-helpers/interfaces";
import Server from "../../server/server";
import UserModel from "../../REST-entities/user/user.model";
import SessionModel from "../../REST-entities/session/session.model";
import WeekModel from "../week/week.model";
import TaskModel from "./task.model";

describe("Task router test suite", () => {
  let app: Application;
  let createdTask: ITask | null;
  let createdWeek: IWeek | IWeekPopulated | null;
  let accessToken: string;
  let secondAccessToken: string;
  let response: Response;
  let secondResponse: Response;

  beforeAll(async () => {
    app = new Server().startForTesting();
    const url = `mongodb://127.0.0.1/task`;
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
    await supertest(app)
      .post("/auth/register")
      .send({ email: "test@email.com", password: "qwerty123" });
    await supertest(app)
      .post("/auth/register")
      .send({ email: "testt@email.com", password: "qwerty123" });
    response = await supertest(app)
      .post("/auth/login")
      .send({ email: "test@email.com", password: "qwerty123" });
    secondResponse = await supertest(app)
      .post("/auth/login")
      .send({ email: "testt@email.com", password: "qwerty123" });
    accessToken = response.body.accessToken;
    secondAccessToken = secondResponse.body.accessToken;
    createdWeek = await WeekModel.findById(response.body.data.week._id);
  });

  afterAll(async () => {
    await UserModel.deleteOne({ _id: response.body.data.id });
    await UserModel.deleteOne({ _id: secondResponse.body.data.id });
    await SessionModel.deleteOne({ _id: response.body.sid });
    await SessionModel.deleteOne({ _id: secondResponse.body.sid });
    await WeekModel.deleteOne({ _id: response.body.data.week._id });
    await WeekModel.deleteOne({ _id: secondResponse.body.data.week._id });
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
    await TaskModel.deleteOne({
      _id: secondResponse.body.data.week.tasks[0]._id,
    });
    await TaskModel.deleteOne({
      _id: secondResponse.body.data.week.tasks[1]._id,
    });
    await TaskModel.deleteOne({
      _id: secondResponse.body.data.week.tasks[2]._id,
    });
    await TaskModel.deleteOne({
      _id: secondResponse.body.data.week.tasks[3]._id,
    });
    await TaskModel.deleteOne({
      _id: secondResponse.body.data.week.tasks[4]._id,
    });
    await TaskModel.deleteOne({
      _id: secondResponse.body.data.week.tasks[5]._id,
    });
    await TaskModel.deleteOne({
      _id: secondResponse.body.data.week.tasks[6]._id,
    });
    await TaskModel.deleteOne({
      _id: secondResponse.body.data.week.tasks[7]._id,
    });
    await mongoose.connection.close();
  });

  describe("POST /task", () => {
    let response: Response;
    let days: IDay[];
    let updatedWeek: IWeek | IWeekPopulated | null;

    it("Init endpoint testing", () => {
      expect(true).toBe(true);
    });

    context("Valid request", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .post("/task")
          .set("Authorization", `Bearer ${accessToken}`)
          .field("title", "Test")
          .field("reward", 1)
          .attach("file", path.join(__dirname, "./test-files/test.jpg"));
        createdTask = await TaskModel.findById(response.body.id);
        updatedWeek = await WeekModel.findOne({
          _id: (createdWeek as IWeek)._id,
        });
        const startOfTheWeek = DateTime.local().startOf("week");
        days = [
          {
            date: startOfTheWeek.plus({ days: 0 }).toLocaleString(),
            isActive: false,
            isCompleted: false,
          },
          {
            date: startOfTheWeek.plus({ days: 1 }).toLocaleString(),
            isActive: false,
            isCompleted: false,
          },
          {
            date: startOfTheWeek.plus({ days: 2 }).toLocaleString(),
            isActive: false,
            isCompleted: false,
          },
          {
            date: startOfTheWeek.plus({ days: 3 }).toLocaleString(),
            isActive: false,
            isCompleted: false,
          },
          {
            date: startOfTheWeek.plus({ days: 4 }).toLocaleString(),
            isActive: false,
            isCompleted: false,
          },
          {
            date: startOfTheWeek.plus({ days: 5 }).toLocaleString(),
            isActive: false,
            isCompleted: false,
          },
          {
            date: startOfTheWeek.plus({ days: 6 }).toLocaleString(),
            isActive: false,
            isCompleted: false,
          },
        ];
      });

      it("Should return a 201 status code", () => {
        expect(response.status).toBe(201);
      });

      it("Should return an expected result", () => {
        expect(response.body).toEqual({
          title: "Test",
          reward: 1,
          imageUrl: (createdTask as ITask).imageUrl,
          days,
          id: (createdTask as ITask)._id.toString(),
        });
      });

      it("Should create a new task", () => {
        expect(createdTask).toBeTruthy();
      });

      it("Should add task to user's current week in DB", () => {
        expect((updatedWeek as IWeek).tasks[8]).toEqual(
          (createdTask as ITask)._id
        );
      });

      it("Should create an image URL", () => {
        expect((createdTask as ITask).imageUrl).toBeTruthy();
      });
    });

    context("Invalid request ('reward' is below 1)", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .post("/task")
          .set("Authorization", `Bearer ${accessToken}`)
          .field("title", "Test")
          .field("reward", 0);
      });

      it("Should return a 400 status code", () => {
        expect(response.status).toBe(400);
      });

      it("Should say that 'reward' must be greater than or equal to 1", () => {
        expect(response.body.message).toBe(
          '"reward" must be greater than or equal to 1'
        );
      });
    });

    context("Invalid request ('file' not provided)", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .post("/task")
          .set("Authorization", `Bearer ${accessToken}`)
          .field("title", "Test")
          .field("reward", 1);
      });

      it("Should return a 400 status code", () => {
        expect(response.status).toBe(400);
      });

      it("Should say that image is required", () => {
        expect(response.body.message).toBe("Please, upload an image");
      });
    });

    context("Invalid request (without providing 'accessToken')", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .post("/task")
          .field("title", "Test")
          .field("reward", 1);
      });

      it("Should return a 400 status code", () => {
        expect(response.status).toBe(400);
      });

      it("Should say that token wasn't provided", () => {
        expect(response.body.message).toBe("No token provided");
      });
    });

    context("Invalid request (with invalid 'accessToken')", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .post("/task")
          .set("Authorization", `Bearer qwerty123`)
          .field("title", "Test")
          .field("reward", 1);
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
