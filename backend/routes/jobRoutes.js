import {
  createJob,
  getAllJobs,
  getJobById,
  getEmployerJobs,
  updateJob,
  deleteJob,
} from "../controllers/jobController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import express from "express";

const router = express.Router();

// Public
router.get("/", getAllJobs);

// ✅ EMPLOYER ROUTE — MUST COME BEFORE "/:id"
router.get("/employer", protect, authorizeRoles("employer"), getEmployerJobs);

// Public single job
router.get("/:id", getJobById);

// Employer-only
router.post("/", protect, authorizeRoles("employer"), createJob);

router.put("/:id", protect, authorizeRoles("employer"), updateJob);
router.delete("/:id", protect, authorizeRoles("employer"), deleteJob);
export default router;
