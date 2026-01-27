import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine the type based on the file
    const isPDF = file.mimetype === 'application/pdf';
    
    return {
      folder: "job_portal_assets",
      // Force 'raw' for PDFs so they are treated as documents, not images
      resource_type: isPDF ? "raw" : "image", 
      format: isPDF ? "pdf" : undefined, // explicitly set pdf format
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
    };
  },
});

const upload = multer({ storage });

export default upload;

