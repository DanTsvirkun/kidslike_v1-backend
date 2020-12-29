import { Request, Response } from "express";
import gifts from "./gifts";

export const getGifts = async (req: Request, res: Response) => {
  res.status(200).send(gifts);
};
