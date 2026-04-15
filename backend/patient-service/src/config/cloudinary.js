import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

const cloudinaryUrl = process.env.CLOUDINARY_URL || "";
const parsedUrl = cloudinaryUrl ? new URL(cloudinaryUrl) : null;

cloudinary.config({
  cloud_name: parsedUrl?.hostname || "",
  api_key: parsedUrl?.username || "",
  api_secret: parsedUrl?.password || "",
  signature_algorithm: "sha256",
});

// Use memory storage — file buffer is uploaded to Cloudinary manually
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG, and PDF files are allowed."), false);
    }
  },
});

/**
 * Upload a buffer to Cloudinary.
 * @param {Buffer} buffer - File buffer
 * @param {string} folder - Cloudinary folder
 * @returns {Promise<{ url: string, publicId: string }>}
 */
const uploadToCloudinary = (buffer, folder = "mediconnect/medical-reports") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "auto" },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
};

export { cloudinary, upload, uploadToCloudinary };
