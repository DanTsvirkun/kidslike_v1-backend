import { Router } from "express";
import Joi from "joi";
import mongoose from "mongoose";
import tryCatchWrapper from "../helpers/function-helpers/try-catch-wrapper";
import { getGifts } from "./gift.controller";
import validate from "../helpers/function-helpers/validate";
import { authorize } from "../auth/auth.controller";

const router = Router();

router.get("/", tryCatchWrapper(authorize), tryCatchWrapper(getGifts));

export default router;
