import { Router } from "express";
import { authorize } from "./../../auth/auth.controller";
import tryCatchWrapper from "../../helpers/function-helpers/try-catch-wrapper";
import { getAllInfo } from "./user.controller";

const router = Router();

router.get("/info", tryCatchWrapper(authorize), tryCatchWrapper(getAllInfo));
router.get("/info-en", tryCatchWrapper(authorize), tryCatchWrapper(getAllInfo));
router.get("/info-pl", tryCatchWrapper(authorize), tryCatchWrapper(getAllInfo));

export default router;
