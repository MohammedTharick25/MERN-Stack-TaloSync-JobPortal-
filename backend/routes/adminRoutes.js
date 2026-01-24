import express from "express";
import {
  getAllUsers,
  getAdminStats,
  deleteUser,
  toggleBlockUser,
  getAllJobsAdmin,
  deleteJobAdmin,
  getAllCompaniesAdmin,
  deleteCompanyAdmin,
} from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { registerUser } from "../controllers/userController.js";

const router = express.Router();

// Stats
router.get("/stats", protect, authorizeRoles("admin"), getAdminStats);

// Users
router.post("/users/create", protect, authorizeRoles("admin"), registerUser);
router.get("/users", protect, authorizeRoles("admin"), getAllUsers);
router.delete("/users/:id", protect, authorizeRoles("admin"), deleteUser);
router.patch(
  "/users/:id/block",
  protect,
  authorizeRoles("admin"),
  toggleBlockUser,
);

// Jobs
router.get("/jobs", protect, authorizeRoles("admin"), getAllJobsAdmin);
router.delete("/jobs/:id", protect, authorizeRoles("admin"), deleteJobAdmin);

// Companies
router.get(
  "/companies",
  protect,
  authorizeRoles("admin"),
  getAllCompaniesAdmin,
);
router.delete(
  "/companies/:id",
  protect,
  authorizeRoles("admin"),
  deleteCompanyAdmin,
);
router.delete(
  "/companies/:id",
  protect,
  authorizeRoles("admin"),
  deleteCompanyAdmin,
);

export default router;
