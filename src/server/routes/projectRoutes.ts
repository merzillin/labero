import { Router } from "express";
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  projectDropdown,
  getWorkType,
} from "../controllers/projectController";

const router = Router();

router.get("/", getProjects);
router.get("/dropdown", projectDropdown);
router.get("/get-work-type", getWorkType);
router.get("/:id", getProject);
router.post("/", createProject);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);

export default router;
