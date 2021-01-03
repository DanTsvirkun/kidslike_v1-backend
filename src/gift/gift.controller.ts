import { Request, Response } from "express";
import { ruGifts, enGifts } from "./gifts";
import { IUser } from "../helpers/typescript-helpers/interfaces";

export const getGifts = async (req: Request, res: Response) => {
  res.status(200).send(ruGifts);
};

export const getGiftsEn = async (req: Request, res: Response) => {
  res.status(200).send(enGifts);
};

export const buyGifts = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const { giftIds } = req.body;
  let price = 0;
  let purchasedGifts: number[] = [];
  giftIds.forEach((giftId: number) => {
    const giftToBuy = ruGifts.find((gift) => gift.id === giftId);
    if (!giftToBuy) {
      return res.status(404).send({ message: "Gift not found" });
    }
    price += giftToBuy.price;
    purchasedGifts.push(giftToBuy.id);
  });
  if (user.balance >= price) {
    user.balance -= price;
    await user.save();
    return res.status(200).send({
      updatedBalance: user.balance,
      purchasedGiftIds: purchasedGifts,
    });
  }
  return res.status(409).send({ message: "Not enough rewards" });
};
