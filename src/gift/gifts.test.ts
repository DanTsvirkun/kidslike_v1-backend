import mongoose from "mongoose";
import supertest, { Response } from "supertest";
import { Application } from "express";
import Server from "../server/server";
import UserModel from "../REST-entities/user/user.model";
import SessionModel from "../REST-entities/session/session.model";
import WeekModel from "../REST-entities/week/week.model";
import TaskModel from "../REST-entities/task/task.model";
import { ruGifts, enGifts } from "./gifts";
import {
  IUser,
  IUserPopulated,
} from "../helpers/typescript-helpers/interfaces";

describe("Gift router test suite", () => {
  let app: Application;
  let token: string;
  let response: Response;
  let createdUser: IUser | IUserPopulated | null;
  let updatedUser: IUser | IUserPopulated | null;

  beforeAll(async () => {
    app = new Server().startForTesting();
    const url = `mongodb://127.0.0.1/gift`;
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
    createdUser = await UserModel.findOne({ _id: response.body.user.id });
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

  describe("GET /gift", () => {
    let response: Response;

    context("Valid request", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .get("/gift")
          .set("Authorization", `Bearer ${token}`);
      });

      it("Should return a 200 status code", () => {
        expect(response.status).toBe(200);
      });

      it("Should return an expected result", () => {
        expect(response.body).toEqual({
          message: "Gifts successfully loaded",
          success: true,
          ruGifts,
        });
      });
    });

    context("Without providing 'token'", () => {
      beforeAll(async () => {
        response = await supertest(app).get("/gift");
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
          .get("/gift")
          .set("Authorization", `Bearer qwerty123`);
      });

      it("Should return a 401 status code", () => {
        expect(response.status).toBe(401);
      });

      it("Should return an unauthorized status", () => {
        expect(response.body.message).toEqual("Unauthorized");
      });
    });
  });

  describe("GET /gift/en", () => {
    let response: Response;

    context("Valid request", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .get("/gift/en")
          .set("Authorization", `Bearer ${token}`);
      });

      it("Should return a 200 status code", () => {
        expect(response.status).toBe(200);
      });

      it("Should return an expected result", () => {
        expect(response.body).toEqual({
          message: "Gifts successfully loaded",
          success: true,
          enGifts,
        });
      });
    });

    context("Without providing 'token'", () => {
      beforeAll(async () => {
        response = await supertest(app).get("/gift/en");
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
          .get("/gift/en")
          .set("Authorization", `Bearer qwerty123`);
      });

      it("Should return a 401 status code", () => {
        expect(response.status).toBe(401);
      });

      it("Should return an unauthorized status", () => {
        expect(response.body.message).toEqual("Unauthorized");
      });
    });
  });

  describe("PATCH /gift", () => {
    let response: Response;

    const validReqBody = {
      giftIds: [1, 2, 8],
    };

    const invalidReqBody = {
      giftIds: [1, 2, 2],
    };

    context("With validReqBody", () => {
      beforeAll(async () => {
        (createdUser as IUser).balance = 230;
        await (createdUser as IUser).save();
        response = await supertest(app)
          .patch("/gift")
          .set("Authorization", `Bearer ${token}`)
          .send(validReqBody);
        updatedUser = await UserModel.findOne({
          _id: (createdUser as IUser)._id,
        });
      });

      it("Should return a 200 status code", () => {
        expect(response.status).toBe(200);
      });

      it("Should return an expected result", () => {
        expect(response.body).toEqual({
          message: "Gift successfully purchased",
          success: true,
          updatedBalance: 0,
          purchasedGiftIds: [1, 2, 8],
        });
      });

      it("Should update user's balance in DB", () => {
        expect((updatedUser as IUser).balance).toBe(0);
      });
    });

    context("Invalid request (not enough rewards)", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .patch("/gift")
          .set("Authorization", `Bearer ${token}`)
          .send(validReqBody);
      });

      it("Should return a 409 status code", () => {
        expect(response.status).toBe(409);
      });

      it("Should say there are no enough rewards to purchase provided gift(-s)", () => {
        expect(response.body.message).toBe("Not enough rewards");
      });
    });

    context("With invalidReqBody (not unique ids)", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .patch("/gift")
          .set("Authorization", `Bearer ${token}`)
          .send(invalidReqBody);
      });

      it("Should return a 400 status code", () => {
        expect(response.status).toBe(400);
      });

      it("Should return a validation error", () => {
        expect(response.body.message).toBe(
          '"giftIds[2]" contains a duplicate value'
        );
      });
    });

    context("Without providing 'token'", () => {
      beforeAll(async () => {
        response = await supertest(app).patch("/gift").send(validReqBody);
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
          .patch("/gift")
          .set("Authorization", `Bearer qwerty123`)
          .send(validReqBody);
      });

      it("Should return a 401 status code", () => {
        expect(response.status).toBe(401);
      });

      it("Should return an unauthorized status", () => {
        expect(response.body.message).toEqual("Unauthorized");
      });
    });
  });
});
