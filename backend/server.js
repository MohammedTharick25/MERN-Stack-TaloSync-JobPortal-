import express from "express";
import { config } from "dotenv";
import mongoose from "mongoose";
import userRoutes from "./routes/userRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import path from "path";
import cors from "cors";

config();

const app = express();

app.use(express.urlencoded({ extended: true }));

// 🔑 CORS CONFIG
app.use(
  cors({
    origin: "http://localhost:5173", // frontend URL
    credentials: true,
  }),
);

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use(express.json());

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/users", userRoutes);

app.use("/api/companies", companyRoutes);

app.use("/api/jobs", jobRoutes);

app.use("/api/applications", applicationRoutes);

app.use("/api/admin", adminRoutes);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() =>
    app.listen(process.env.PORT || 3000, () => {
      console.log(
        `MongoDB is Connected && Server is running on port ${process.env.PORT || 3000}`,
      );
    }),
  )
  .catch((err) => console.error("MongoDB connection error:", err));
