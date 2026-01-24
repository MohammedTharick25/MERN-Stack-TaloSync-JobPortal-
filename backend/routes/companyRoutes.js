import express from "express";
import {
  createCompany,
  updateCompany,
  getMyCompany,
} from "../controllers/companyController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import upload from "../middleware/multer.js";
import path from "path";
import multer from "../middleware/multer.js";

const router = express.Router();

router.get("/me", protect, authorizeRoles("employer"), getMyCompany);

router.post(
  "/",
  protect,
  authorizeRoles("employer"),
  upload.single("logo"),
  createCompany,
);
// Employer creates company
router.post("/", protect, authorizeRoles("employer"), createCompany);

router.put(
  "/update",
  protect,
  authorizeRoles("employer"),
  upload.single("logo"),
  updateCompany,
);

export default router;
