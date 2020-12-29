import mongoose from "mongoose";
import supertest, { Response } from "supertest";
import { Application } from "express";
import Server from "../server/server";
import UserModel from "../REST-entities/user/user.model";
import SessionModel from "../REST-entities/session/session.model";
import WeekModel from "../REST-entities/week/week.model";
import TaskModel from "../REST-entities/task/task.model";
import gifts from "./gifts";

describe("Gift router test suite", () => {
  let app: Application;
  let accessToken: string;
  let secondAccessToken: string;
  let response: Response;
  let secondResponse: Response;

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

  describe("GET /gifts", () => {
    let response: Response;

    context("Valid request", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .get("/gift")
          .set("Authorization", `Bearer ${accessToken}`);
      });

      it("Should return a 200 status code", () => {
        expect(response.status).toBe(200);
      });

      it("Should return an expected result", () => {
        expect(response.body).toEqual(gifts);
      });
    });

    context("Without providing 'accessToken'", () => {
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

    context("With invalid 'accessToken'", () => {
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
});
