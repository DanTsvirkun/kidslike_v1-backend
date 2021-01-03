import { Router } from "express";
import { authorize } from "./../../auth/auth.controller";
import tryCatchWrapper from "../../helpers/function-helpers/try-catch-wrapper";
import { getWeek, getWeekEn } from "./week.controller";

const router = Router();

router.get("/", tryCatchWrapper(authorize), tryCatchWrapper(getWeek));
router.get("/en", tryCatchWrapper(authorize), tryCatchWrapper(getWeekEn));

export default router;
