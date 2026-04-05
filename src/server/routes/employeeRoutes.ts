import { Router } from "express";
import {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  employeeDropdown,
  getEmployeeType,
} from "../controllers/employeeController";

const router = Router();

router.get("/", getEmployees);
router.get("/dropdown", employeeDropdown);
router.get("/get-employee-type", getEmployeeType);
router.get("/:id", getEmployee);
router.post("/", createEmployee);
router.put("/:id", updateEmployee);
router.delete("/:id", deleteEmployee);

export default router;
