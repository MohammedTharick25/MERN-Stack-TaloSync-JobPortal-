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
import { fileURLToPath } from "url";

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔑 CORS CONFIG
const allowedOrigins = [
  "http://localhost:5173",
  "https://talosync.onrender.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(null, true); // Less restrictive for deployment debugging
      }
    },
    credentials: true,
  }),
);

// Serve uploads folder (using process.cwd() to ensure it finds it from root)
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "backend", "uploads")),
);

// API ROUTES
app.use("/api/users", userRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/admin", adminRoutes);

// FRONTEND STATIC FILES
const frontendPath = path.join(process.cwd(), "frontend", "dist");
app.use(express.static(frontendPath));

// FIX: Express 5 catch-all syntax
app.get("*path", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() =>
    app.listen(process.env.PORT || 4000, () => {
      console.log(
        `MongoDB is Connected && Server is running on port ${process.env.PORT || 3000}`,
      );
    }),
  )
  .catch((err) => console.error("MongoDB connection error:", err));
