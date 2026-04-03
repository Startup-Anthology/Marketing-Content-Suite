import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import contentRouter from "./content";
import storyboardsRouter from "./storyboards";
import researchNotesRouter from "./research-notes";
import scheduledPostsRouter from "./scheduled-posts";
import aiRouter from "./ai";
import brandGuideRouter from "./brand-guide";
import podcastScriptsRouter from "./podcast-scripts";
import interviewPrepsRouter from "./interview-preps";
import googleCalendarRouter from "./google-calendar";
import socialAccountsRouter from "./social-accounts";
import adminRouter from "./admin";
import utmLinksRouter from "./utm-links";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(contentRouter);
router.use(storyboardsRouter);
router.use(researchNotesRouter);
router.use(scheduledPostsRouter);
router.use(aiRouter);
router.use(brandGuideRouter);
router.use(podcastScriptsRouter);
router.use(interviewPrepsRouter);
router.use(googleCalendarRouter);
router.use(socialAccountsRouter);
router.use(adminRouter);
router.use(utmLinksRouter);

export default router;
