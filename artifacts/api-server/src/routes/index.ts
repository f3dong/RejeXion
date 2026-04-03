import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import profileRouter from "./profile";
import promptsRouter from "./prompts";
import entriesRouter from "./entries";
import growthNotesRouter from "./growthNotes";
import pointsRouter from "./points";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(profileRouter);
router.use(promptsRouter);
router.use(entriesRouter);
router.use(growthNotesRouter);
router.use(pointsRouter);
router.use(statsRouter);

export default router;
