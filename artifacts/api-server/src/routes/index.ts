import { Router, type IRouter } from "express";
import healthRouter from "./health";
import contentRouter from "./content";
import storyboardsRouter from "./storyboards";
import researchNotesRouter from "./research-notes";
import scheduledPostsRouter from "./scheduled-posts";
import aiRouter from "./ai";
import brandGuideRouter from "./brand-guide";

const router: IRouter = Router();

router.use(healthRouter);
router.use(contentRouter);
router.use(storyboardsRouter);
router.use(researchNotesRouter);
router.use(scheduledPostsRouter);
router.use(aiRouter);
router.use(brandGuideRouter);

export default router;
