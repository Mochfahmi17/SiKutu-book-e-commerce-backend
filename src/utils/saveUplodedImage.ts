import path from "path";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";

export default function saveUploadedImage(file: Express.Multer.File, folderName: string) {
  const uploadDir = path.join("uploads", folderName);

  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
  }

  const ext = path.extname(file.originalname);
  const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  const filePath = path.join(uploadDir, fileName);

  writeFileSync(filePath, file.buffer);

  return fileName;
}
