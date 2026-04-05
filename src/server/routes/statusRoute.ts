import { Router } from "express";
import { getStatusDropdown } from "../controllers/statusController";

const router = Router();

router.get("/dropdown", getStatusDropdown);

export default router;
