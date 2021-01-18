import mongoose from "mongoose";
import supertest, { Response } from "supertest";
import { Application } from "express";
import { DateTime } from "luxon";
import {
  IDay,
  IUser,
  IUserPopulated,
} from "../../helpers/typescript-helpers/interfaces";
import Server from "../../server/server";
import UserModel from "./user.model";
import SessionModel from "../session/session.model";
import WeekModel from "../week/week.model";
import TaskModel from "../task/task.model";

describe("User router test suite", () => {
  let app: Application;
  let createdUser: IUser | IUserPopulated | null;
  let secondCreatedUser: IUser | IUserPopulated | null;
  let thirdCreatedUser: IUser | IUserPopulated | null;
  let token: string;
  let secondToken: string;
  let thirdToken: string;
  let response: Response;
  let secondResponse: Response;
  let thirdResponse: Response;
  const startOfTheWeek = DateTime.local().startOf("week");

  beforeAll(async () => {
    app = new Server().startForTesting();
    const url = `mongodb://127.0.0.1/user`;
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
      .post("/auth/register-en")
      .send({ email: "testt@email.com", password: "qwerty123" });
    await supertest(app)
      .post("/auth/register-pl")
      .send({ email: "testtt@email.com", password: "qwerty123" });
    response = await supertest(app)
      .post("/auth/login")
      .send({ email: "test@email.com", password: "qwerty123" });
    secondResponse = await supertest(app)
      .post("/auth/login")
      .send({ email: "testt@email.com", password: "qwerty123" });
    thirdResponse = await supertest(app)
      .post("/auth/login")
      .send({ email: "testtt@email.com", password: "qwerty123" });
    token = response.body.token;
    secondToken = secondResponse.body.token;
    thirdToken = thirdResponse.body.token;
    createdUser = await UserModel.findOne({ _id: response.body.user.id });
    secondCreatedUser = await UserModel.findOne({
      _id: secondResponse.body.user.id,
    });
    thirdCreatedUser = await UserModel.findOne({
      _id: thirdResponse.body.user.id,
    });
  });

  afterAll(async () => {
    await UserModel.deleteOne({ _id: response.body.user.id });
    await UserModel.deleteOne({ _id: secondResponse.body.user.id });
    await UserModel.deleteOne({ _id: thirdResponse.body.user.id });
    await SessionModel.deleteMany({ uid: response.body.user.id });
    await SessionModel.deleteMany({ uid: secondResponse.body.user.id });
    await SessionModel.deleteMany({ uid: thirdResponse.body.user.id });
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

  describe("GET /user/info", () => {
    let response: Response;
    let days: IDay[][] = [[], [], [], [], [], [], [], []];

    context("Valid request", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .get("/user/info")
          .set("Authorization", `Bearer ${token}`);
        for (let i = 0; i < 8; i++) {
          for (let j = 0; j < 7; j++) {
            days[i][j] = {
              date: startOfTheWeek.plus({ days: j }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
              _id: response.body.week.tasks[i].days[j]._id,
            };
          }
        }
      });

      it("Should return a 200 status code", () => {
        expect(response.status).toBe(200);
      });

      it("Should return an expected result", () => {
        expect(response.body).toEqual({
          message: "Successfully got all info",
          success: true,
          user: {
            email: "test@email.com",
            balance: 0,
            id: (createdUser as IUser)._id.toString(),
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
                days: days[0],
                __v: 0,
                _id: response.body.week.tasks[0]._id,
              },
              {
                title: "Пропылесосить",
                reward: 5,
                imageUrl:
                  "https://storage.googleapis.com/kidslikev2_bucket/Rectangle%2025%20(1).png",
                days: days[1],
                __v: 0,
                _id: response.body.week.tasks[1]._id,
              },
              {
                title: "Полить цветы",
                reward: 2,
                imageUrl:
                  "https://storage.googleapis.com/kidslikev2_bucket/Rectangle%2025%20(2).png",
                days: days[2],
                __v: 0,
                _id: response.body.week.tasks[2]._id,
              },
              {
                title: "Почитать книгу",
                reward: 4,
                imageUrl:
                  "https://storage.googleapis.com/kidslikev2_bucket/Rectangle%2025%20(3).png",
                days: days[3],
                __v: 0,
                _id: response.body.week.tasks[3]._id,
              },
              {
                title: "Выкинуть мусор",
                reward: 1,
                imageUrl:
                  "https://storage.googleapis.com/kidslikev2_bucket/Rectangle%2025%20(4).png",
                days: days[4],
                __v: 0,
                _id: response.body.week.tasks[4]._id,
              },
              {
                title: "Почистить зубы",
                reward: 4,
                imageUrl:
                  "https://storage.googleapis.com/kidslikev2_bucket/Rectangle%2025%20(5).png",
                days: days[5],
                __v: 0,
                _id: response.body.week.tasks[5]._id,
              },
              {
                title: "Подмести",
                reward: 4,
                imageUrl:
                  "https://storage.googleapis.com/kidslikev2_bucket/Rectangle%2025%20(6).png",
                days: days[6],
                __v: 0,
                _id: response.body.week.tasks[6]._id,
              },
              {
                title: "Собрать игрушки",
                reward: 2,
                imageUrl:
                  "https://storage.googleapis.com/kidslikev2_bucket/Rectangle%2025%20(7).png",
                days: days[7],
                __v: 0,
                _id: response.body.week.tasks[7]._id,
              },
            ],
          },
        });
      });
    });

    context("Without providing 'accessToken'", () => {
      beforeAll(async () => {
        response = await supertest(app).get("/user/info");
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
          .get("/user/info")
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

  describe("GET /user/info-en", () => {
    let response: Response;
    let days: IDay[][] = [[], [], [], [], [], [], [], []];

    context("Valid request", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .get("/user/info-en")
          .set("Authorization", `Bearer ${secondToken}`);
        for (let i = 0; i < 8; i++) {
          for (let j = 0; j < 7; j++) {
            days[i][j] = {
              date: startOfTheWeek.plus({ days: j }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
              _id: response.body.week.tasks[i].days[j]._id,
            };
          }
        }
      });

      it("Should return a 200 status code", () => {
        expect(response.status).toBe(200);
      });

      it("Should return an expected result", () => {
        expect(response.body).toEqual({
          message: "Successfully got all info",
          success: true,
          user: {
            email: "testt@email.com",
            balance: 0,
            id: (secondCreatedUser as IUser)._id.toString(),
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
                days: days[0],
                __v: 0,
                _id: response.body.week.tasks[0]._id,
              },
              {
                title: "Vacuum-clean",
                reward: 5,
                imageUrl:
                  "https://storage.googleapis.com/kidslikev2_bucket/Rectangle%2025%20(1).png",
                days: days[1],
                __v: 0,
                _id: response.body.week.tasks[1]._id,
              },
              {
                title: "To water flowers",
                reward: 2,
                imageUrl:
                  "https://storage.googleapis.com/kidslikev2_bucket/Rectangle%2025%20(2).png",
                days: days[2],
                __v: 0,
                _id: response.body.week.tasks[2]._id,
              },
              {
                title: "Read a book",
                reward: 4,
                imageUrl:
                  "https://storage.googleapis.com/kidslikev2_bucket/Rectangle%2025%20(3).png",
                days: days[3],
                __v: 0,
                _id: response.body.week.tasks[3]._id,
              },
              {
                title: "Throw out the trash",
                reward: 1,
                imageUrl:
                  "https://storage.googleapis.com/kidslikev2_bucket/Rectangle%2025%20(4).png",
                days: days[4],
                __v: 0,
                _id: response.body.week.tasks[4]._id,
              },
              {
                title: "Brush your teeth",
                reward: 4,
                imageUrl:
                  "https://storage.googleapis.com/kidslikev2_bucket/Rectangle%2025%20(5).png",
                days: days[5],
                __v: 0,
                _id: response.body.week.tasks[5]._id,
              },
              {
                title: "Sweep",
                reward: 4,
                imageUrl:
                  "https://storage.googleapis.com/kidslikev2_bucket/Rectangle%2025%20(6).png",
                days: days[6],
                __v: 0,
                _id: response.body.week.tasks[6]._id,
              },
              {
                title: "Collect toys",
                reward: 2,
                imageUrl:
                  "https://storage.googleapis.com/kidslikev2_bucket/Rectangle%2025%20(7).png",
                days: days[7],
                __v: 0,
                _id: response.body.week.tasks[7]._id,
              },
            ],
          },
        });
      });
    });
  });

  describe("GET /user/info-pl", () => {
    let response: Response;
    let days: IDay[][] = [[], [], [], [], [], [], [], []];

    context("Valid request", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .get("/user/info-pl")
          .set("Authorization", `Bearer ${thirdToken}`);
        for (let i = 0; i < 8; i++) {
          for (let j = 0; j < 7; j++) {
            days[i][j] = {
              date: startOfTheWeek.plus({ days: j }).toFormat("yyyy-MM-dd"),
              isActive: false,
              isCompleted: false,
              _id: response.body.week.tasks[i].days[j]._id,
            };
          }
        }
      });

      it("Should return a 200 status code", () => {
        expect(response.status).toBe(200);
      });

      it("Should return an expected result", () => {
        expect(response.body).toEqual({
          message: "Successfully got all info",
          success: true,
          user: {
            email: "testtt@email.com",
            balance: 0,
            id: (thirdCreatedUser as IUser)._id.toString(),
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
                title: "Pościelić łóżko",
                reward: 3,
                imageUrl:
                  "https://storage.googleapis.com/kidslikev2_bucket/Rectangle%2025.png",
                days: days[0],
                __v: 0,
                _id: response.body.week.tasks[0]._id,
              },
              {
                title: "Odkurzyć",
                reward: 5,
                imageUrl:
                  "https://storage.googleapis.com/kidslikev2_bucket/Rectangle%2025%20(1).png",
                days: days[1],
                __v: 0,
                _id: response.body.week.tasks[1]._id,
              },
              {
                title: "Podlać kwiaty",
                reward: 2,
                imageUrl:
                  "https://storage.googleapis.com/kidslikev2_bucket/Rectangle%2025%20(2).png",
                days: days[2],
                __v: 0,
                _id: response.body.week.tasks[2]._id,
              },
              {
                title: "Poczytać książkę",
                reward: 4,
                imageUrl:
                  "https://storage.googleapis.com/kidslikev2_bucket/Rectangle%2025%20(3).png",
                days: days[3],
                __v: 0,
                _id: response.body.week.tasks[3]._id,
              },
              {
                title: "Wyrzucić śmieci",
                reward: 1,
                imageUrl:
                  "https://storage.googleapis.com/kidslikev2_bucket/Rectangle%2025%20(4).png",
                days: days[4],
                __v: 0,
                _id: response.body.week.tasks[4]._id,
              },
              {
                title: "Umyć zęby",
                reward: 4,
                imageUrl:
                  "https://storage.googleapis.com/kidslikev2_bucket/Rectangle%2025%20(5).png",
                days: days[5],
                __v: 0,
                _id: response.body.week.tasks[5]._id,
              },
              {
                title: "Zamieść",
                reward: 4,
                imageUrl:
                  "https://storage.googleapis.com/kidslikev2_bucket/Rectangle%2025%20(6).png",
                days: days[6],
                __v: 0,
                _id: response.body.week.tasks[6]._id,
              },
              {
                title: "Posprzątać zabawki",
                reward: 2,
                imageUrl:
                  "https://storage.googleapis.com/kidslikev2_bucket/Rectangle%2025%20(7).png",
                days: days[7],
                __v: 0,
                _id: response.body.week.tasks[7]._id,
              },
            ],
          },
        });
      });
    });
  });
});
