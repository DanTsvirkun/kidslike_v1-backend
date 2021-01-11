import { Request, Response } from "express";
import { ruGifts, enGifts, plGifts } from "./gifts";
import { IUser } from "../helpers/typescript-helpers/interfaces";

export const getGifts = async (req: Request, res: Response) => {
  res
    .status(200)
    .send({ message: "Gifts successfully loaded", success: true, ruGifts });
};

export const getGiftsEn = async (req: Request, res: Response) => {
  res
    .status(200)
    .send({ message: "Gifts successfully loaded", success: true, enGifts });
};

export const getGiftsPl = async (req: Request, res: Response) => {
  res
    .status(200)
    .send({ message: "Gifts successfully loaded", success: true, plGifts });
};

export const buyGifts = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const { giftIds } = req.body;
  let price = 0;
  let purchasedGifts: number[] = [];
  giftIds.forEach((giftId: number) => {
    const giftToBuy = ruGifts.find((gift) => gift.id === giftId);
    if (!giftToBuy) {
      return res
        .status(404)
        .send({ message: "Gift not found", success: false });
    }
    price += giftToBuy.price;
    purchasedGifts.push(giftToBuy.id);
  });
  if (user.balance >= price) {
    user.balance -= price;
    await user.save();
    return res.status(200).send({
      message: "Gift successfully purchased",
      success: true,
      updatedBalance: user.balance,
      purchasedGiftIds: purchasedGifts,
    });
  }
  return res
    .status(409)
    .send({ message: "Not enough rewards", success: false });
};
