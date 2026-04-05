import { Router } from "express";
import { downloadReport, getReports } from "../controllers/reportController";

const router = Router();

router.post("/", getReports);
router.post("/download", downloadReport);

export default router;
