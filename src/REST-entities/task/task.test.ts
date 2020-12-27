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
import UserModel from "../../REST-entities/user/user.model";
import SessionModel from "../../REST-entities/session/session.model";
import WeekModel from "../week/week.model";
import TaskModel from "./task.model";

describe("Task router test suite", () => {
  let app: Application;
  let createdTask: ITask | null;
  let createdWeek: IWeek | IWeekPopulated | null;
  let createdUser: IUser | IUserPopulated | null;
  let updatedUser: IUser | IUserPopulated | null;
  let accessToken: string;
  let secondAccessToken: string;
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
    accessToken = response.body.accessToken;
    secondAccessToken = secondResponse.body.accessToken;
    createdWeek = await WeekModel.findById(response.body.data.week._id);
    createdUser = await UserModel.findOne({ _id: response.body.data.id });
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

  describe("PATCH /task/active/{taskId}", () => {
    let response: Response;
    let days: IDay[];
    let updatedTask: ITask | null;

    const validReqBody = {
      dates: [
        startOfTheWeek.plus({ days: 2 }).toFormat("yyyy-MM-dd"),
        startOfTheWeek.plus({ days: 6 }).toFormat("yyyy-MM-dd"),
      ],
    };

    const invalidReqBody = {
      dates: [
        startOfTheWeek.plus({ days: 2 }).toFormat("yyyy-MM-dd"),
        "qwerty123",
      ],
    };

    const secondInvalidReqBody = {
      dates: [
        startOfTheWeek.plus({ days: 2 }).toFormat("yyyy-MM-dd"),
        startOfTheWeek.plus({ days: 7 }).toFormat("yyyy-MM-dd"),
      ],
    };

    it("Init endpoint testing", () => {
      expect(true).toBe(true);
    });

    context("Valid request", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .patch(`/task/active/${(createdTask as ITask)._id}`)
          .set("Authorization", `Bearer ${accessToken}`)
          .send(validReqBody);
        updatedTask = await TaskModel.findOne({
          _id: (createdTask as ITask)._id,
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
            isActive: true,
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
            isActive: true,
            isCompleted: false,
          },
        ];
      });

      it("Should return a 200 status code", () => {
        expect(response.status).toBe(200);
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

      it("Should update task's days in DB", () => {
        expect((updatedTask as ITask).days[2].isActive).toBeTruthy();
        expect((updatedTask as ITask).days[6].isActive).toBeTruthy();
      });
    });

    context("With invalidReqBody (one of dates is invalid)", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .patch(`/task/active/${(createdTask as ITask)._id}`)
          .set("Authorization", `Bearer ${accessToken}`)
          .send(invalidReqBody);
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

    context(
      "With secondInvalidReqBody (one of dates doesn't exist on task)",
      () => {
        beforeAll(async () => {
          response = await supertest(app)
            .patch(`/task/active/${(createdTask as ITask)._id}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send(secondInvalidReqBody);
        });

        it("Should return a 404 status code", () => {
          expect(response.status).toBe(404);
        });

        it("Should say that day wasn't found", () => {
          expect(response.body.message).toBe("Day not found");
        });
      }
    );

    context("With invalid 'taskId'", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .patch(`/task/active/qwerty123`)
          .set("Authorization", `Bearer ${accessToken}`)
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

    context("Without providing 'accessToken'", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .patch(`/task/active/${(createdTask as ITask)._id}`)
          .send(validReqBody);
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
          .patch(`/task/active/${(createdTask as ITask)._id}`)
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
          .patch(`/task/active/${(createdTask as ITask)._id}`)
          .set("Authorization", `Bearer ${secondAccessToken}`)
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

  describe("PATCH /task/complete/{taskId}", () => {
    let response: Response;
    let days: IDay[];
    let updatedTask: ITask | null;

    const validReqBody = {
      date: startOfTheWeek.plus({ days: 2 }).toFormat("yyyy-MM-dd"),
    };

    const invalidReqBody = {
      date: startOfTheWeek.plus({ days: 3 }).toFormat("yyyy-MM-dd"),
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
          .patch(`/task/complete/${(createdTask as ITask)._id}`)
          .set("Authorization", `Bearer ${accessToken}`)
          .send(validReqBody);
        updatedTask = await TaskModel.findOne({
          _id: (createdTask as ITask)._id,
        });
        updatedUser = await UserModel.findOne({
          _id: (createdUser as IUser)._id,
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
            isActive: true,
            isCompleted: true,
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
            isActive: true,
            isCompleted: false,
          },
        ];
      });

      it("Should return a 200 status code", () => {
        expect(response.status).toBe(200);
      });

      it("Should return an expected result", () => {
        expect(response.body).toEqual({
          newBalance: 1,
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
        expect((updatedTask as ITask).days[2].isCompleted).toBeTruthy();
      });

      it("Should update user's balance in DB", () => {
        expect((updatedUser as IUser).balance).toBe(1);
      });
    });

    context("Invalid request (completing task on the same day)", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .patch(`/task/complete/${(createdTask as ITask)._id}`)
          .set("Authorization", `Bearer ${accessToken}`)
          .send(validReqBody);
      });

      it("Should return a 400 status code", () => {
        expect(response.status).toBe(400);
      });

      it("Should say that this task has already been completed on this day", () => {
        expect(response.body.message).toBe(
          "This task is already completed on provided day"
        );
      });
    });

    context("With invalidReqBody (task is not active on provided day)", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .patch(`/task/complete/${(createdTask as ITask)._id}`)
          .set("Authorization", `Bearer ${accessToken}`)
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
          .patch(`/task/complete/${(createdTask as ITask)._id}`)
          .set("Authorization", `Bearer ${accessToken}`)
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
          .patch(`/task/complete/qwerty123`)
          .set("Authorization", `Bearer ${accessToken}`)
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

    context("Without providing 'accessToken'", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .patch(`/task/complete/${(createdTask as ITask)._id}`)
          .send(validReqBody);
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
          .patch(`/task/complete/${(createdTask as ITask)._id}`)
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
          .patch(`/task/complete/${(createdTask as ITask)._id}`)
          .set("Authorization", `Bearer ${secondAccessToken}`)
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
