import mongoose from "mongoose";
import supertest, { Response } from "supertest";
import { Application } from "express";
import jwt from "jsonwebtoken";
import { DateTime } from "luxon";
import {
  IUser,
  IUserPopulated,
  ISession,
  IDay,
} from "../helpers/typescript-helpers/interfaces";
import Server from "../server/server";
import UserModel from "../REST-entities/user/user.model";
import SessionModel from "../REST-entities/session/session.model";
import WeekModel from "../REST-entities/week/week.model";
import TaskModel from "../REST-entities/task/task.model";

describe("Auth router test suite", () => {
  let app: Application;
  let createdSession: ISession | null;
  let token: string;
  let secondToken: string;
  let user: IUser | IUserPopulated | null;
  let startOfTheWeek: DateTime;
  let days: IDay[];

  beforeAll(async () => {
    app = new Server().startForTesting();
    const url = `mongodb://127.0.0.1/auth`;
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
  });

  afterAll(async () => {
    const createdUser = await UserModel.findOne({ email: "test@email.com" });
    const secondCreatedUser = await UserModel.findOne({
      email: "testt@email.com",
    });
    await UserModel.deleteOne({ email: "test@email.com" });
    await UserModel.deleteOne({ email: "testt@email.com" });
    await SessionModel.deleteMany({ uid: createdUser?._id });
    await SessionModel.deleteMany({ uid: secondCreatedUser?._id });
    await mongoose.connection.close();
  });

  describe("POST /auth/register", () => {
    let response: Response;

    const validReqBody = {
      email: "test@email.com",
      password: "qwerty123",
    };

    const invalidReqBody = {
      email: "test@email.com",
    };

    it("Init endpoint testing", () => {
      expect(true).toBe(true);
    });

    context("With validReqBody", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .post("/auth/register")
          .send(validReqBody);
        user = await UserModel.findById(response.body.user.id);
        token = response.body.token;
        startOfTheWeek = DateTime.local().startOf("week");
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
          message: "Successfully registered",
          success: true,
          token,
          user: {
            email: validReqBody.email,
            balance: 0,
            id: (user as IUser)._id.toString(),
          },
          week: {
            startWeekDate: startOfTheWeek.toFormat("yyyy-MM-dd"),
            endWeekDate: startOfTheWeek
              .plus({ days: 6 })
              .toFormat("yyyy-MM-dd"),
            rewardsGained: 0,
            rewardsPlanned: 0,
            __v: 0,
            _id: response.body.week._id,
            tasks: [
              {
                title: "Застелить постель",
                reward: 3,
                imageUrl:
                  "https://storage.googleapis.com/kidslikev2_bucket/Rectangle%2025.png",
                days,
                __v: 0,
                _id: response.body.week.tasks[0]._id,
              },
              {
                title: "Пропылесосить",
                reward: 5,
                imageUrl:
                  "https://storage.googleapis.com/kidslikev2_bucket/Rectangle%2025%20(1).png",
                days,
                __v: 0,
                _id: response.body.week.tasks[1]._id,
              },
              {
                title: "Полить цветы",
                reward: 2,
                imageUrl:
                  "https://storage.googleapis.com/kidslikev2_bucket/Rectangle%2025%20(2).png",
                days,
                __v: 0,
                _id: response.body.week.tasks[2]._id,
              },
              {
                title: "Почитать книгу",
                reward: 4,
                imageUrl:
                  "https://storage.googleapis.com/kidslikev2_bucket/Rectangle%2025%20(3).png",
                days,
                __v: 0,
                _id: response.body.week.tasks[3]._id,
              },
              {
                title: "Выкинуть мусор",
                reward: 1,
                imageUrl:
                  "https://storage.googleapis.com/kidslikev2_bucket/Rectangle%2025%20(4).png",
                days,
                __v: 0,
                _id: response.body.week.tasks[4]._id,
              },
              {
                title: "Почистить зубы",
                reward: 4,
                imageUrl:
                  "https://storage.googleapis.com/kidslikev2_bucket/Rectangle%2025%20(5).png",
                days,
                __v: 0,
                _id: response.body.week.tasks[5]._id,
              },
              {
                title: "Подмести",
                reward: 4,
                imageUrl:
                  "https://storage.googleapis.com/kidslikev2_bucket/Rectangle%2025%20(6).png",
                days,
                __v: 0,
                _id: response.body.week.tasks[6]._id,
              },
              {
                title: "Собрать игрушки",
                reward: 2,
                imageUrl:
                  "https://storage.googleapis.com/kidslikev2_bucket/Rectangle%2025%20(7).png",
                days,
                __v: 0,
                _id: response.body.week.tasks[7]._id,
              },
            ],
          },
        });
      });

      it("Should create a new user", () => {
        expect(user).toBeTruthy();
      });
    });

    context("With same email", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .post("/auth/register")
          .send(validReqBody);
      });

      it("Should return a 409 status code", () => {
        expect(response.status).toBe(409);
      });

      it("Should say if email is already in use", () => {
        expect(response.body.message).toBe(
          `User with this email already exists`
        );
      });
    });

    context("With invalidReqBody (no 'password' provided)", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .post("/auth/register")
          .send(invalidReqBody);
      });

      it("Should return a 400 status code", () => {
        expect(response.status).toBe(400);
      });

      it("Should say that 'username' is required", () => {
        expect(response.body.message).toBe('"password" is required');
      });
    });
  });

  describe("POST /auth/register-en", () => {
    let response: Response;

    const validReqBody = {
      email: "testt@email.com",
      password: "qwerty123",
    };

    const invalidReqBody = {
      email: "testt@email.com",
    };

    it("Init endpoint testing", () => {
      expect(true).toBe(true);
    });

    context("With validReqBody", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .post("/auth/register-en")
          .send(validReqBody);
        secondToken = response.body.token;
      });

      it("Should return a 201 status code", () => {
        expect(response.status).toBe(201);
      });

      it("Should return an expected result", () => {
        expect(response.body).toEqual({
          message: "Successfully registered",
          success: true,
          token: secondToken,
          user: {
            email: validReqBody.email,
            balance: 0,
            id: response.body.user.id.toString(),
          },
          week: {
            startWeekDate: startOfTheWeek.toFormat("yyyy-MM-dd"),
            endWeekDate: startOfTheWeek
              .plus({ days: 6 })
              .toFormat("yyyy-MM-dd"),
            rewardsGained: 0,
            rewardsPlanned: 0,
            __v: 0,
            _id: response.body.week._id,
            tasks: [
              {
                title: "Make the bed",
                reward: 3,
                imageUrl:
                  "https://storage.googleapis.com/kidslikev2_bucket/Rectangle%2025.png",
                days,
                __v: 0,
                _id: response.body.week.tasks[0]._id,
              },
              {
                title: "Vacuum-clean",
                reward: 5,
                imageUrl:
                  "https://storage.googleapis.com/kidslikev2_bucket/Rectangle%2025%20(1).png",
                days,
                __v: 0,
                _id: response.body.week.tasks[1]._id,
              },
              {
                title: "To water flowers",
                reward: 2,
                imageUrl:
                  "https://storage.googleapis.com/kidslikev2_bucket/Rectangle%2025%20(2).png",
                days,
                __v: 0,
                _id: response.body.week.tasks[2]._id,
              },
              {
                title: "Read a book",
                reward: 4,
                imageUrl:
                  "https://storage.googleapis.com/kidslikev2_bucket/Rectangle%2025%20(3).png",
                days,
                __v: 0,
                _id: response.body.week.tasks[3]._id,
              },
              {
                title: "Throw out the trash",
                reward: 1,
                imageUrl:
                  "https://storage.googleapis.com/kidslikev2_bucket/Rectangle%2025%20(4).png",
                days,
                __v: 0,
                _id: response.body.week.tasks[4]._id,
              },
              {
                title: "Brush your teeth",
                reward: 4,
                imageUrl:
                  "https://storage.googleapis.com/kidslikev2_bucket/Rectangle%2025%20(5).png",
                days,
                __v: 0,
                _id: response.body.week.tasks[5]._id,
              },
              {
                title: "Sweep",
                reward: 4,
                imageUrl:
                  "https://storage.googleapis.com/kidslikev2_bucket/Rectangle%2025%20(6).png",
                days,
                __v: 0,
                _id: response.body.week.tasks[6]._id,
              },
              {
                title: "Collect toys",
                reward: 2,
                imageUrl:
                  "https://storage.googleapis.com/kidslikev2_bucket/Rectangle%2025%20(7).png",
                days,
                __v: 0,
                _id: response.body.week.tasks[7]._id,
              },
            ],
          },
        });
      });

      it("Should create a new user", () => {
        expect(user).toBeTruthy();
      });
    });

    context("With same email", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .post("/auth/register-en")
          .send(validReqBody);
      });

      it("Should return a 409 status code", () => {
        expect(response.status).toBe(409);
      });

      it("Should say if email is already in use", () => {
        expect(response.body.message).toBe(
          `User with this email already exists`
        );
      });
    });

    context("With invalidReqBody (no 'password' provided)", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .post("/auth/register-en")
          .send(invalidReqBody);
      });

      it("Should return a 400 status code", () => {
        expect(response.status).toBe(400);
      });

      it("Should say that 'username' is required", () => {
        expect(response.body.message).toBe('"password" is required');
      });
    });
  });

  describe("POST /auth/login", () => {
    let response: Response;

    const validReqBody = {
      email: "test@email.com",
      password: "qwerty123",
    };

    const secondValidReqBody = {
      email: "testt@email.com",
      password: "qwerty123",
    };

    const invalidReqBody = {
      email: "test@email.com",
    };

    const secondInvalidReqBody = {
      email: "test@email.com",
      password: "qwerty12",
    };

    const thirdInvalidReqBody = {
      email: "tes@email.com",
      password: "qwerty123",
    };

    it("Init endpoint testing", () => {
      expect(true).toBe(true);
    });

    context("With validReqBody", () => {
      beforeAll(async () => {
        response = await supertest(app).post("/auth/login").send(validReqBody);
        createdSession = await SessionModel.findOne({
          uid: response.body.user.id,
        });
        token = response.body.token;
      });

      afterAll(async () => {
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
      });

      it("Should return a 200 status code", () => {
        expect(response.status).toBe(200);
      });

      it("Should return an expected result", () => {
        expect(response.body).toEqual({
          message: "Successfully authenticated",
          success: true,
          token,
          user: {
            email: validReqBody.email,
            balance: 0,
            id: (user as IUser)._id.toString(),
          },
          week: {
            startWeekDate: startOfTheWeek.toFormat("yyyy-MM-dd"),
            endWeekDate: startOfTheWeek
              .plus({ days: 6 })
              .toFormat("yyyy-MM-dd"),
            rewardsGained: 0,
            rewardsPlanned: 0,
            __v: 0,
            _id: response.body.week._id,
            tasks: [
              {
                title: "Застелить постель",
                reward: 3,
                imageUrl:
                  "https://storage.googleapis.com/kidslikev2_bucket/Rectangle%2025.png",
                days,
                __v: 0,
                _id: response.body.week.tasks[0]._id,
              },
              {
                title: "Пропылесосить",
                reward: 5,
                imageUrl:
                  "https://storage.googleapis.com/kidslikev2_bucket/Rectangle%2025%20(1).png",
                days,
                __v: 0,
                _id: response.body.week.tasks[1]._id,
              },
              {
                title: "Полить цветы",
                reward: 2,
                imageUrl:
                  "https://storage.googleapis.com/kidslikev2_bucket/Rectangle%2025%20(2).png",
                days,
                __v: 0,
                _id: response.body.week.tasks[2]._id,
              },
              {
                title: "Почитать книгу",
                reward: 4,
                imageUrl:
                  "https://storage.googleapis.com/kidslikev2_bucket/Rectangle%2025%20(3).png",
                days,
                __v: 0,
                _id: response.body.week.tasks[3]._id,
              },
              {
                title: "Выкинуть мусор",
                reward: 1,
                imageUrl:
                  "https://storage.googleapis.com/kidslikev2_bucket/Rectangle%2025%20(4).png",
                days,
                __v: 0,
                _id: response.body.week.tasks[4]._id,
              },
              {
                title: "Почистить зубы",
                reward: 4,
                imageUrl:
                  "https://storage.googleapis.com/kidslikev2_bucket/Rectangle%2025%20(5).png",
                days,
                __v: 0,
                _id: response.body.week.tasks[5]._id,
              },
              {
                title: "Подмести",
                reward: 4,
                imageUrl:
                  "https://storage.googleapis.com/kidslikev2_bucket/Rectangle%2025%20(6).png",
                days,
                __v: 0,
                _id: response.body.week.tasks[6]._id,
              },
              {
                title: "Собрать игрушки",
                reward: 2,
                imageUrl:
                  "https://storage.googleapis.com/kidslikev2_bucket/Rectangle%2025%20(7).png",
                days,
                __v: 0,
                _id: response.body.week.tasks[7]._id,
              },
            ],
          },
        });
      });

      it("Should create valid 'token'", () => {
        expect(
          jwt.verify(response.body.token, process.env.JWT_SECRET as string)
        ).toBeTruthy();
      });

      it("Should create a new session", () => {
        expect(createdSession).toBeTruthy();
      });
    });

    context("With secondValidReqBody", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .post("/auth/login")
          .send(secondValidReqBody);
        secondToken = response.body.token;
      });

      afterAll(async () => {
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
      });

      it("Should return a 200 status code", () => {
        expect(response.status).toBe(200);
      });

      it("Should return an expected result", () => {
        expect(response.body).toEqual({
          message: "Successfully authenticated",
          success: true,
          token: secondToken,
          user: {
            email: secondValidReqBody.email,
            balance: 0,
            id: response.body.user.id.toString(),
          },
          week: {
            startWeekDate: startOfTheWeek.toFormat("yyyy-MM-dd"),
            endWeekDate: startOfTheWeek
              .plus({ days: 6 })
              .toFormat("yyyy-MM-dd"),
            rewardsGained: 0,
            rewardsPlanned: 0,
            __v: 0,
            _id: response.body.week._id,
            tasks: [
              {
                title: "Make the bed",
                reward: 3,
                imageUrl:
                  "https://storage.googleapis.com/kidslikev2_bucket/Rectangle%2025.png",
                days,
                __v: 0,
                _id: response.body.week.tasks[0]._id,
              },
              {
                title: "Vacuum-clean",
                reward: 5,
                imageUrl:
                  "https://storage.googleapis.com/kidslikev2_bucket/Rectangle%2025%20(1).png",
                days,
                __v: 0,
                _id: response.body.week.tasks[1]._id,
              },
              {
                title: "To water flowers",
                reward: 2,
                imageUrl:
                  "https://storage.googleapis.com/kidslikev2_bucket/Rectangle%2025%20(2).png",
                days,
                __v: 0,
                _id: response.body.week.tasks[2]._id,
              },
              {
                title: "Read a book",
                reward: 4,
                imageUrl:
                  "https://storage.googleapis.com/kidslikev2_bucket/Rectangle%2025%20(3).png",
                days,
                __v: 0,
                _id: response.body.week.tasks[3]._id,
              },
              {
                title: "Throw out the trash",
                reward: 1,
                imageUrl:
                  "https://storage.googleapis.com/kidslikev2_bucket/Rectangle%2025%20(4).png",
                days,
                __v: 0,
                _id: response.body.week.tasks[4]._id,
              },
              {
                title: "Brush your teeth",
                reward: 4,
                imageUrl:
                  "https://storage.googleapis.com/kidslikev2_bucket/Rectangle%2025%20(5).png",
                days,
                __v: 0,
                _id: response.body.week.tasks[5]._id,
              },
              {
                title: "Sweep",
                reward: 4,
                imageUrl:
                  "https://storage.googleapis.com/kidslikev2_bucket/Rectangle%2025%20(6).png",
                days,
                __v: 0,
                _id: response.body.week.tasks[6]._id,
              },
              {
                title: "Collect toys",
                reward: 2,
                imageUrl:
                  "https://storage.googleapis.com/kidslikev2_bucket/Rectangle%2025%20(7).png",
                days,
                __v: 0,
                _id: response.body.week.tasks[7]._id,
              },
            ],
          },
        });
      });
    });

    context("With invalidReqBody (no 'password' provided)", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .post("/auth/login")
          .send(invalidReqBody);
      });

      it("Should return a 400 status code", () => {
        expect(response.status).toBe(400);
      });

      it("Should say that 'password' is required", () => {
        expect(response.body.message).toBe('"password" is required');
      });
    });

    context("With secondInvalidReqBody (wrong 'password')", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .post("/auth/login")
          .send(secondInvalidReqBody);
      });

      it("Should return a 403 status code", () => {
        expect(response.status).toBe(403);
      });

      it("Should say that 'password' is wrong", () => {
        expect(response.body.message).toBe("Password is wrong");
      });
    });

    context("With thirdInvalidReqBody (wrong 'email')", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .post("/auth/login")
          .send(thirdInvalidReqBody);
      });

      it("Should return a 403 status code", () => {
        expect(response.status).toBe(403);
      });

      it("Should say that email doesn't exist", () => {
        expect(response.body.message).toBe(
          `User with this email doesn't exist`
        );
      });
    });
  });

  describe("POST /auth/logout", () => {
    let response: Response;

    it("Init endpoint testing", () => {
      expect(true).toBe(true);
    });

    context("Valid request", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .post("/auth/logout")
          .set("Authorization", `Bearer ${token}`);
      });

      it("Should return a 204 status code", () => {
        expect(response.status).toBe(204);
      });
    });

    context("Valid request", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .post("/auth/logout")
          .set("Authorization", `Bearer ${secondToken}`);
      });

      it("Should return a 204 status code", () => {
        expect(response.status).toBe(204);
      });
    });

    context("Without providing 'token'", () => {
      beforeAll(async () => {
        response = await supertest(app).post("/auth/logout");
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
          .post("/auth/logout")
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
