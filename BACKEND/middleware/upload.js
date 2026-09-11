// Shared upload middleware.
//
// Container filesystems are ephemeral: anything written to disk is lost on
// every redeploy and restart, while the database keeps pointing at it. So
// uploads go to Cloudinary when it is configured, and fall back to local
// disk only for development without credentials.

import multer from "multer";
import path from "path";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} = process.env;

export const usingCloudinary = Boolean(
  CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET
);

if (usingCloudinary) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });
}

const cloudStorage = () =>
  new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "yong-smart",
      allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
      // Cap stored dimensions - phone photos are far larger than any view
      // on the site needs, and this keeps the free tier comfortable.
      transformation: [{ width: 1600, height: 1600, crop: "limit" }],
    },
  });

const diskStorage = () => {
  fs.mkdirSync("uploads", { recursive: true });
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) =>
      cb(null, Date.now() + path.extname(file.originalname)),
  });
};

const imagesOnly = (req, file, cb) => {
  if (/^image\//.test(file.mimetype)) return cb(null, true);
  cb(new Error("Only image files are allowed"));
};

const upload = multer({
  storage: usingCloudinary ? cloudStorage() : diskStorage(),
  fileFilter: imagesOnly,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per file
});

/**
 * The public URL for one uploaded file.
 *
 * Cloudinary returns an absolute https URL on `path`; disk storage yields a
 * bare filename, which stays a server-relative path so existing records and
 * the frontend's own resolver keep working.
 */
export const fileUrl = (file) =>
  usingCloudinary ? file.path : `/uploads/${file.filename}`;

/** Map an array of uploaded files to their public URLs. */
export const fileUrls = (files) => (files || []).map(fileUrl);

export default upload;
