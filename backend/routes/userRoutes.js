import express from "express";
import {
  registerUser,
  loginUser,
  uploadResume,
  updateProfile,
  updateProfilePhoto,
  toggleJobAlerts,
  toggleSaveJob,
  getSavedJobs,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import upload from "../middleware/multer.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

router.post(
  "/upload-resume",
  protect,
  authorizeRoles("candidate"),
  upload.single("resume"),
  uploadResume,
);

router.post(
  "/profile/photo",
  protect,
  upload.single("profilePhoto"),
  updateProfilePhoto,
);

// router.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

router.put("/profile/update", protect, updateProfile);
// The resume upload route (make sure you have multer setup)
router.post("/profile/resume", protect, upload.single("resume"), uploadResume);

// Candidate-only route
router.get(
  "/candidate-dashboard",
  protect,
  authorizeRoles("candidate"),
  (req, res) => {
    res.json({ message: "Welcome Candidate" });
  },
);

router.post(
  "/save-job/:jobId",
  protect,
  authorizeRoles("candidate"),
  toggleSaveJob,
);
router.post(
  "/toggle-alerts",
  protect,
  authorizeRoles("candidate"),
  toggleJobAlerts,
);
router.get("/saved-jobs", protect, authorizeRoles("candidate"), getSavedJobs);

// Employer-only route
router.get(
  "/employer-dashboard",
  protect,
  authorizeRoles("employer"),
  (req, res) => {
    res.json({ message: "Welcome Employer" });
  },
);

export default router;
