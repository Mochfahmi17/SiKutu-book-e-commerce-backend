import multer from "multer";
import path from "path";
import { existsSync, mkdirSync, PathLike } from "node:fs";

const ensureDirExists = (dir: PathLike) => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = "uploads/others";

    switch (file.fieldname) {
      case "coverBook":
        uploadPath = "uploads/cover";
        break;
      case "profileImage":
        uploadPath = "uploads/profile";
        break;
      default:
        break;
    }

    ensureDirExists(uploadPath);
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed) {
      return cb(new Error("Only image file are allowed."));
    }

    cb(null, true);
  },
});

export default upload;
