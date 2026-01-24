// backend/middleware/multer.js
import multer from "multer";
// import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = "uploads/others"; // default

    if (file.fieldname === "resume") {
      folder = "uploads/resumes";
    } else if (file.fieldname === "logo") {
      folder = "uploads/logos"; // Dedicated folder for company logos
    } else if (file.fieldname === "profilePhoto") {
      folder = "uploads/photos";
    }

    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "resume") {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDFs allowed for resumes"), false);
  } else if (file.fieldname === "logo" || file.fieldname === "profilePhoto") {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only images allowed"), false);
  } else {
    cb(null, true);
  }
};

const upload = multer({ storage, fileFilter });
export default upload;
