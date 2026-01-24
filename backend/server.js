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

app.use(express.urlencoded({ extended: true }));

// 🔑 CORS CONFIG

const allowedOrigins = [
  "http://localhost:5173",
  "https://talosync.onrender.com", // Add your Render URL
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        return callback(null, true); // Set to true to be less restrictive during debug
      }
      return callback(null, true);
    },
    credentials: true,
  }),
);

app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "backend", "uploads")),
);

app.use(express.json());

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/users", userRoutes);

app.use("/api/companies", companyRoutes);

app.use("/api/jobs", jobRoutes);

app.use("/api/applications", applicationRoutes);

app.use("/api/admin", adminRoutes);

const frontendPath = path.join(process.cwd(), "frontend", "dist");
app.use(express.static(frontendPath));

app.get("*", (req, res) => {
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
