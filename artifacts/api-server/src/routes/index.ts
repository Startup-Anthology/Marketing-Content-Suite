import { Router, type IRouter } from "express";
import healthRouter from "./health";
import contentRouter from "./content";
import storyboardsRouter from "./storyboards";
import researchNotesRouter from "./research-notes";
import scheduledPostsRouter from "./scheduled-posts";
import aiRouter from "./ai";
import brandGuideRouter from "./brand-guide";
import podcastScriptsRouter from "./podcast-scripts";
import interviewPrepsRouter from "./interview-preps";
import googleCalendarRouter from "./google-calendar";

const router: IRouter = Router();

router.use(healthRouter);
router.use(contentRouter);
router.use(storyboardsRouter);
router.use(researchNotesRouter);
router.use(scheduledPostsRouter);
router.use(aiRouter);
router.use(brandGuideRouter);
router.use(podcastScriptsRouter);
router.use(interviewPrepsRouter);
router.use(googleCalendarRouter);

export default router;
