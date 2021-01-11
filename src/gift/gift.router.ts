import { Router } from "express";
import Joi from "joi";
import tryCatchWrapper from "../helpers/function-helpers/try-catch-wrapper";
import { getGifts, getGiftsEn, getGiftsPl, buyGifts } from "./gift.controller";
import validate from "../helpers/function-helpers/validate";
import { authorize } from "../auth/auth.controller";

const buyGiftsSchema = Joi.object({
  giftIds: Joi.array()
    .min(1)
    .max(8)
    .items(Joi.number().min(1).max(8))
    .unique()
    .required(),
});

const router = Router();

router.get("/", tryCatchWrapper(authorize), tryCatchWrapper(getGifts));
router.get("/en", tryCatchWrapper(authorize), tryCatchWrapper(getGiftsEn));
router.get("/pl", tryCatchWrapper(authorize), tryCatchWrapper(getGiftsPl));
router.patch(
  "/",
  tryCatchWrapper(authorize),
  validate(buyGiftsSchema),
  tryCatchWrapper(buyGifts)
);

export default router;
