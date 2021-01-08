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
  IUser,
  IUserPopulated,
} from "../../helpers/typescript-helpers/interfaces";
import Server from "../../server/server";
import UserModel from "../user/user.model";
import SessionModel from "../session/session.model";
import WeekModel from "../week/week.model";
import TaskModel from "./task.model";

describe("Task router test suite", () => {
  let app: Application;
  let createdTask: ITask | null;
  let createdWeek: IWeek | IWeekPopulated | null;
  let createdUser: IUser | IUserPopulated | null;
  let updatedUser: IUser | IUserPopulated | null;
  let updatedWeek: IWeek | IWeekPopulated | null;
  let token: string;
  let secondToken: string;
  let response: Response;
  let secondResponse: Response;
  const startOfTheWeek = DateTime.local().startOf("week");

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
    token = response.body.token;
    secondToken = secondResponse.body.token;
    createdWeek = await WeekModel.findById(response.body.week._id);
    createdUser = await UserModel.findOne({ _id: response.body.user.id });
  });

  afterAll(async () => {
    await UserModel.deleteOne({ _id: response.body.user.id });
    await UserModel.deleteOne({ _id: secondResponse.body.user.id });
    await SessionModel.deleteMany({ uid: response.body.user.id });
    await SessionModel.deleteMany({ uid: secondResponse.body.user.id });
    await WeekModel.deleteOne({ _id: response.body.week._id });
    await WeekModel.deleteOne({ _id: secondResponse.body.week._id });
    await TaskModel.deleteOne({ title: "Test" });
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
    await TaskModel.deleteOne({
      _id: secondResponse.body.week.tasks[0]._id,
    });
    await TaskModel.deleteOne({
      _id: secondResponse.body.week.tasks[1]._id,
    });
    await TaskModel.deleteOne({
      _id: secondResponse.body.week.tasks[2]._id,
    });
    await TaskModel.deleteOne({
      _id: secondResponse.body.week.tasks[3]._id,
    });
    await TaskModel.deleteOne({
      _id: secondResponse.body.week.tasks[4]._id,
    });
    await TaskModel.deleteOne({
      _id: secondResponse.body.week.tasks[5]._id,
    });
    await TaskModel.deleteOne({
      _id: secondResponse.body.week.tasks[6]._id,
    });
    await TaskModel.deleteOne({
      _id: secondResponse.body.week.tasks[7]._id,
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
          .set("Authorization", `Bearer ${token}`)
          .field("title", "Test")
          .field("reward", 1)
          .attach("file", path.join(__dirname, "./test-files/test.jpg"));
        createdTask = await TaskModel.findById(response.body.id);
        updatedWeek = await WeekModel.findOne({
          _id: (createdWeek as IWeek)._id,
        });
        days = [
          {
            date: startOfTheWeek.plus({ days: 0 }).toFormat("yyyy-MM-dd"),
            isActive: false,
            isCompleted: false,
          },
          {
            date: startOfTheWeek.plus({ days: 1 }).toFormat("yyyy-MM-dd"),
            isActive: false,
            isCompleted: false,
          },
          {
            date: startOfTheWeek.plus({ days: 2 }).toFormat("yyyy-MM-dd"),
            isActive: false,
            isCompleted: false,
          },
          {
            date: startOfTheWeek.plus({ days: 3 }).toFormat("yyyy-MM-dd"),
            isActive: false,
            isCompleted: false,
          },
          {
            date: startOfTheWeek.plus({ days: 4 }).toFormat("yyyy-MM-dd"),
            isActive: false,
            isCompleted: false,
          },
          {
            date: startOfTheWeek.plus({ days: 5 }).toFormat("yyyy-MM-dd"),
            isActive: false,
            isCompleted: false,
          },
          {
            date: startOfTheWeek.plus({ days: 6 }).toFormat("yyyy-MM-dd"),
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
          message: "Task successfully created",
          success: true,
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
          .set("Authorization", `Bearer ${token}`)
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
          .set("Authorization", `Bearer ${token}`)
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

    context("Invalid request (without providing 'token')", () => {
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

    context("Invalid request (with invalid 'token')", () => {
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

  describe("PATCH /task/active/{taskId}", () => {
    let response: Response;
    let updatedTask: ITask | null;

    const validReqBody = {
      tasks: [
        {
          taskId: "",
          days: [
            {
              date: startOfTheWeek.plus({ days: 0 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 1 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 2 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 3 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 4 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 5 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 6 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
          ],
        },
        {
          taskId: "",
          days: [
            {
              date: startOfTheWeek.plus({ days: 0 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 1 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 2 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 3 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 4 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 5 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 6 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
          ],
        },
        {
          taskId: "",
          days: [
            {
              date: startOfTheWeek.plus({ days: 0 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 1 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 2 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 3 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 4 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 5 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 6 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
          ],
        },
        {
          taskId: "",
          days: [
            {
              date: startOfTheWeek.plus({ days: 0 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 1 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 2 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 3 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 4 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 5 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 6 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
          ],
        },
        {
          taskId: "",
          days: [
            {
              date: startOfTheWeek.plus({ days: 0 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 1 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 2 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 3 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 4 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 5 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 6 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
          ],
        },
        {
          taskId: "",
          days: [
            {
              date: startOfTheWeek.plus({ days: 0 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 1 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 2 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 3 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 4 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 5 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 6 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
          ],
        },
        {
          taskId: "",
          days: [
            {
              date: startOfTheWeek.plus({ days: 0 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 1 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 2 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 3 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 4 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 5 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 6 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
          ],
        },
        {
          taskId: "",
          days: [
            {
              date: startOfTheWeek.plus({ days: 0 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 1 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 2 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 3 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 4 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 5 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 6 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
          ],
        },
        {
          taskId: "",
          days: [
            {
              date: startOfTheWeek.plus({ days: 0 }).toFormat("yyyy-MM-dd"),
              isActive: true,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 1 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 2 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 3 }).toFormat("yyyy-MM-dd"),
              isActive: true,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 4 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 5 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 6 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
          ],
        },
      ],
    };

    const invalidReqBody = {
      tasks: [
        {
          taskId: "",
          days: [
            {
              date: startOfTheWeek.plus({ days: 0 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 1 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 2 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 3 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 4 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 5 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 6 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
          ],
        },
        {
          taskId: "",
          days: [
            {
              date: startOfTheWeek.plus({ days: 0 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 1 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 2 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 3 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 4 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 5 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 6 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
          ],
        },
        {
          taskId: "",
          days: [
            {
              date: startOfTheWeek.plus({ days: 0 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 1 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 2 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 3 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 4 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 5 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 6 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
          ],
        },
        {
          taskId: "",
          days: [
            {
              date: startOfTheWeek.plus({ days: 0 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 1 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 2 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 3 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 4 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 5 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 6 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
          ],
        },
        {
          taskId: "",
          days: [
            {
              date: startOfTheWeek.plus({ days: 0 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 1 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 2 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 3 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 4 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 5 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 6 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
          ],
        },
        {
          taskId: "",
          days: [
            {
              date: startOfTheWeek.plus({ days: 0 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 1 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 2 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 3 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 4 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 5 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 6 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
          ],
        },
        {
          taskId: "",
          days: [
            {
              date: startOfTheWeek.plus({ days: 0 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 1 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 2 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 3 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 4 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 5 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 6 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
          ],
        },
        {
          taskId: "",
          days: [
            {
              date: startOfTheWeek.plus({ days: 0 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 1 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 2 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 3 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 4 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 5 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 6 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
          ],
        },
        {
          taskId: "qwerty123",
          days: [
            {
              date: startOfTheWeek.plus({ days: 0 }).toFormat("yyyy-MM-dd"),
              isActive: true,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 1 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 2 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 3 }).toFormat("yyyy-MM-dd"),
              isActive: true,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 4 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 5 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 6 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
          ],
        },
      ],
    };

    const secondInvalidReqBody = {
      tasks: [],
    };

    const thirdInvalidReqBody = {
      tasks: [
        {
          taskId: "",
          days: [
            {
              date: startOfTheWeek.plus({ days: 0 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 1 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 2 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 3 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 4 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 5 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 6 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
          ],
        },
        {
          taskId: "",
          days: [
            {
              date: startOfTheWeek.plus({ days: 0 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 1 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 2 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 3 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 4 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 5 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 6 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
          ],
        },
        {
          taskId: "",
          days: [
            {
              date: startOfTheWeek.plus({ days: 0 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 1 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 2 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 3 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 4 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 5 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 6 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
          ],
        },
        {
          taskId: "",
          days: [
            {
              date: startOfTheWeek.plus({ days: 0 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 1 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 2 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 3 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 4 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 5 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 6 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
          ],
        },
        {
          taskId: "",
          days: [
            {
              date: startOfTheWeek.plus({ days: 0 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 1 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 2 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 3 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 4 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 5 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 6 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
          ],
        },
        {
          taskId: "",
          days: [
            {
              date: startOfTheWeek.plus({ days: 0 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 1 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 2 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 3 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 4 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 5 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 6 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
          ],
        },
        {
          taskId: "",
          days: [
            {
              date: startOfTheWeek.plus({ days: 0 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 1 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 2 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 3 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 4 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 5 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 6 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
          ],
        },
        {
          taskId: "",
          days: [
            {
              date: startOfTheWeek.plus({ days: 0 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 1 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 2 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 3 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 4 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 5 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 6 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
          ],
        },
        {
          taskId: "",
          days: [
            {
              date: "qwerty123",
              isActive: true,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 1 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 2 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 3 }).toFormat("yyyy-MM-dd"),
              isActive: true,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 4 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 5 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
            {
              date: startOfTheWeek.plus({ days: 6 }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
            },
          ],
        },
      ],
    };

    it("Init endpoint testing", () => {
      expect(true).toBe(true);
    });

    context("Valid request", () => {
      beforeAll(async () => {
        validReqBody.tasks[0].taskId = (createdWeek as IWeek).tasks[0].toString();
        validReqBody.tasks[1].taskId = (createdWeek as IWeek).tasks[1].toString();
        validReqBody.tasks[2].taskId = (createdWeek as IWeek).tasks[2].toString();
        validReqBody.tasks[3].taskId = (createdWeek as IWeek).tasks[3].toString();
        validReqBody.tasks[4].taskId = (createdWeek as IWeek).tasks[4].toString();
        validReqBody.tasks[5].taskId = (createdWeek as IWeek).tasks[5].toString();
        validReqBody.tasks[6].taskId = (createdWeek as IWeek).tasks[6].toString();
        validReqBody.tasks[7].taskId = (createdWeek as IWeek).tasks[7].toString();
        validReqBody.tasks[8].taskId = (createdTask as ITask)._id.toString();
        response = await supertest(app)
          .patch(`/task/active`)
          .set("Authorization", `Bearer ${token}`)
          .send(validReqBody);
        updatedTask = await TaskModel.findOne({
          _id: (createdTask as ITask)._id,
        });
        updatedWeek = await WeekModel.findOne({
          _id: (createdUser as IUser).currentWeek,
        });
      });

      it("Should return a 200 status code", () => {
        expect(response.status).toBe(200);
      });

      it("Should return an expected result", () => {
        expect(response.body).toEqual({
          message: "Tasks successfully updated",
          success: true,
          updatedWeekPlannedRewards: 2,
          updatedTasks: validReqBody.tasks,
        });
      });

      it("Should update task's days in DB", () => {
        expect((updatedTask as ITask).days[0].isActive).toBeTruthy();
        expect((updatedTask as ITask).days[3].isActive).toBeTruthy();
      });

      it("Should update week's planned rewards in DB", () => {
        expect((updatedWeek as IWeek).rewardsPlanned).toBe(2);
      });
    });

    context("With invalidReqBody (invalid 'taskId')", () => {
      beforeAll(async () => {
        invalidReqBody.tasks[0].taskId = (createdWeek as IWeek).tasks[0].toString();
        invalidReqBody.tasks[1].taskId = (createdWeek as IWeek).tasks[1].toString();
        invalidReqBody.tasks[2].taskId = (createdWeek as IWeek).tasks[2].toString();
        invalidReqBody.tasks[3].taskId = (createdWeek as IWeek).tasks[3].toString();
        invalidReqBody.tasks[4].taskId = (createdWeek as IWeek).tasks[4].toString();
        invalidReqBody.tasks[5].taskId = (createdWeek as IWeek).tasks[5].toString();
        invalidReqBody.tasks[6].taskId = (createdWeek as IWeek).tasks[6].toString();
        invalidReqBody.tasks[7].taskId = (createdWeek as IWeek).tasks[7].toString();
        response = await supertest(app)
          .patch(`/task/active`)
          .set("Authorization", `Bearer ${token}`)
          .send(invalidReqBody);
      });

      it("Should return a 400 status code", () => {
        expect(response.status).toBe(400);
      });

      it("Should say that 'taskId' is invalid", () => {
        expect(response.body.message).toBe(
          "Invalid 'taskId'. Must be a MongoDB ObjectId"
        );
      });
    });

    context("With secondInvalidReqBody (invalid tasks amount)", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .patch(`/task/active`)
          .set("Authorization", `Bearer ${token}`)
          .send(secondInvalidReqBody);
      });

      it("Should return a 400 status code", () => {
        expect(response.status).toBe(400);
      });

      it("Should say that tasks amount is invalid", () => {
        expect(response.body.message).toBe("Invalid tasks amount");
        expect(response.body.neededTasksAmount).toBe(9);
      });
    });

    context("With thirdInvalidReqBody (one of 'date' is invalid)", () => {
      beforeAll(async () => {
        thirdInvalidReqBody.tasks[0].taskId = (createdWeek as IWeek).tasks[0].toString();
        thirdInvalidReqBody.tasks[1].taskId = (createdWeek as IWeek).tasks[1].toString();
        thirdInvalidReqBody.tasks[2].taskId = (createdWeek as IWeek).tasks[2].toString();
        thirdInvalidReqBody.tasks[3].taskId = (createdWeek as IWeek).tasks[3].toString();
        thirdInvalidReqBody.tasks[4].taskId = (createdWeek as IWeek).tasks[4].toString();
        thirdInvalidReqBody.tasks[5].taskId = (createdWeek as IWeek).tasks[5].toString();
        thirdInvalidReqBody.tasks[6].taskId = (createdWeek as IWeek).tasks[6].toString();
        thirdInvalidReqBody.tasks[7].taskId = (createdWeek as IWeek).tasks[7].toString();
        thirdInvalidReqBody.tasks[8].taskId = (createdTask as ITask)._id;
        response = await supertest(app)
          .patch(`/task/active`)
          .set("Authorization", `Bearer ${token}`)
          .send(thirdInvalidReqBody);
      });

      it("Should return a 400 status code", () => {
        expect(response.status).toBe(400);
      });

      it("Should say that 'date' is invalid", () => {
        expect(response.body.message).toBe("Invalid day date");
      });
    });

    context("Without providing 'token'", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .patch(`/task/active`)
          .send(validReqBody);
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
          .patch(`/task/active`)
          .set("Authorization", `Bearer qwerty123`)
          .send(validReqBody);
      });

      it("Should return a 401 status code", () => {
        expect(response.status).toBe(401);
      });

      it("Should return an unauthorized status", () => {
        expect(response.body.message).toBe("Unauthorized");
      });
    });

    context("With another account", () => {
      beforeAll(async () => {
        const secondValidReqBody = validReqBody.tasks.slice(
          0,
          validReqBody.tasks.length - 1
        );
        response = await supertest(app)
          .patch(`/task/active`)
          .set("Authorization", `Bearer ${secondToken}`)
          .send({ tasks: secondValidReqBody });
      });

      it("Should return a 404 status code", () => {
        expect(response.status).toBe(404);
      });

      it("Should say that task wasn't found", () => {
        expect(response.body.message).toBe("Task not found");
      });
    });
  });

  describe("PATCH /task/switch/{taskId}", () => {
    let response: Response;
    let days: IDay[];
    let newDays: IDay[];
    let updatedTask: ITask | null;

    const validReqBody = {
      date: startOfTheWeek.plus({ days: 3 }).toFormat("yyyy-MM-dd"),
    };

    const invalidReqBody = {
      date: startOfTheWeek.plus({ days: 2 }).toFormat("yyyy-MM-dd"),
    };

    const secondInvalidReqBody = {
      date: "qwerty123",
    };

    it("Init endpoint testing", () => {
      expect(true).toBe(true);
    });

    context("Valid request", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .patch(`/task/switch/${(createdTask as ITask)._id}`)
          .set("Authorization", `Bearer ${token}`)
          .send(validReqBody);
        updatedTask = await TaskModel.findOne({
          _id: (createdTask as ITask)._id,
        });
        updatedUser = await UserModel.findOne({
          _id: (createdUser as IUser)._id,
        });
        updatedWeek = await WeekModel.findOne({
          _id: (createdUser as IUser).currentWeek,
        });
        days = [
          {
            date: startOfTheWeek.plus({ days: 0 }).toFormat("yyyy-MM-dd"),
            isActive: true,
            isCompleted: false,
          },
          {
            date: startOfTheWeek.plus({ days: 1 }).toFormat("yyyy-MM-dd"),
            isActive: false,
            isCompleted: false,
          },
          {
            date: startOfTheWeek.plus({ days: 2 }).toFormat("yyyy-MM-dd"),
            isActive: false,
            isCompleted: false,
          },
          {
            date: startOfTheWeek.plus({ days: 3 }).toFormat("yyyy-MM-dd"),
            isActive: true,
            isCompleted: true,
          },
          {
            date: startOfTheWeek.plus({ days: 4 }).toFormat("yyyy-MM-dd"),
            isActive: false,
            isCompleted: false,
          },
          {
            date: startOfTheWeek.plus({ days: 5 }).toFormat("yyyy-MM-dd"),
            isActive: false,
            isCompleted: false,
          },
          {
            date: startOfTheWeek.plus({ days: 6 }).toFormat("yyyy-MM-dd"),
            isActive: false,
            isCompleted: false,
          },
        ];
      });

      it("Should return a 200 status code", () => {
        expect(response.status).toBe(200);
      });

      it("Should return an expected result", () => {
        expect(response.body).toEqual({
          message: "Task has been successfully switched",
          success: true,
          updatedBalance: 1,
          updatedWeekGainedRewards: 1,
          updatedTask: {
            title: "Test",
            reward: 1,
            imageUrl: (createdTask as ITask).imageUrl,
            days,
            id: (createdTask as ITask)._id.toString(),
          },
        });
      });

      it("Should update task's day in DB", () => {
        expect((updatedTask as ITask).days[3].isCompleted).toBeTruthy();
      });

      it("Should update user's balance in DB", () => {
        expect((updatedUser as IUser).balance).toBe(1);
      });

      it("Should update week's gained rewards in DB", () => {
        expect((updatedWeek as IWeek).rewardsGained).toBe(1);
      });
    });

    context("Valid request (switching task back to uncompleted)", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .patch(`/task/switch/${(createdTask as ITask)._id}`)
          .set("Authorization", `Bearer ${token}`)
          .send(validReqBody);
        newDays = days;
        newDays[3].isCompleted = false;
      });

      it("Should return a 200 status code", () => {
        expect(response.status).toBe(200);
      });

      it("Should return an expected result", () => {
        expect(response.body).toEqual({
          message: "Task has been successfully switched",
          success: true,
          updatedBalance: 0,
          updatedWeekGainedRewards: 0,
          updatedTask: {
            title: "Test",
            reward: 1,
            imageUrl: (createdTask as ITask).imageUrl,
            days: newDays,
            id: (createdTask as ITask)._id.toString(),
          },
        });
      });
    });

    context("With invalidReqBody (task is not active on provided day)", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .patch(`/task/switch/${(createdTask as ITask)._id}`)
          .set("Authorization", `Bearer ${token}`)
          .send(invalidReqBody);
      });

      it("Should return a 400 status code", () => {
        expect(response.status).toBe(400);
      });

      it("Should say that this task doesn't exist on provided day", () => {
        expect(response.body.message).toBe(
          "This task doesn't exist on provided day"
        );
      });
    });

    context("With secondInvalidReqBody ('date' is invalid)", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .patch(`/task/switch/${(createdTask as ITask)._id}`)
          .set("Authorization", `Bearer ${token}`)
          .send(secondInvalidReqBody);
      });

      it("Should return a 400 status code", () => {
        expect(response.status).toBe(400);
      });

      it("Should say that 'date' is invalid", () => {
        expect(response.body.message).toBe(
          "Invalid 'date'. Please, use YYYY-MM-DD string format"
        );
      });
    });

    context("With invalid 'taskId'", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .patch(`/task/switch/qwerty123`)
          .set("Authorization", `Bearer ${token}`)
          .send(validReqBody);
      });

      it("Should return a 400 status code", () => {
        expect(response.status).toBe(400);
      });

      it("Should say that 'taskId' is invalid", () => {
        expect(response.body.message).toBe(
          "Invalid 'taskId'. Must be a MongoDB ObjectId"
        );
      });
    });

    context("Without providing 'token'", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .patch(`/task/switch/${(createdTask as ITask)._id}`)
          .send(validReqBody);
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
          .patch(`/task/switch/${(createdTask as ITask)._id}`)
          .set("Authorization", `Bearer qwerty123`)
          .send(validReqBody);
      });

      it("Should return a 401 status code", () => {
        expect(response.status).toBe(401);
      });

      it("Should return an unauthorized status", () => {
        expect(response.body.message).toBe("Unauthorized");
      });
    });

    context("With another account", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .patch(`/task/switch/${(createdTask as ITask)._id}`)
          .set("Authorization", `Bearer ${secondToken}`)
          .send(validReqBody);
      });

      it("Should return a 404 status code", () => {
        expect(response.status).toBe(404);
      });

      it("Should say that task wasn't found", () => {
        expect(response.body.message).toBe("Task not found");
      });
    });
  });
});
