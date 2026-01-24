import express from "express";
import {
  applyForJob,
  getMyApplications,
  getApplicationsForJob,
  updateApplicationStatus,
  withdrawApplication,
  downloadResume,
} from "../controllers/applicationController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Candidate routes
router.post("/:jobId", protect, authorizeRoles("candidate"), applyForJob);

router.get("/my", protect, authorizeRoles("candidate"), getMyApplications);

router.delete(
  "/:id",
  protect,
  authorizeRoles("candidate"),
  withdrawApplication,
);

// Employer routes
router.get(
  "/job/:jobId",
  protect,
  authorizeRoles("employer"),
  getApplicationsForJob,
);

router.patch(
  "/:id/status",
  protect,
  authorizeRoles("employer"),
  updateApplicationStatus,
);

router.get(
  "/:applicationId/resume",
  protect,
  authorizeRoles("employer"),
  downloadResume,
);

export default router;
