import { existsSync, unlinkSync } from "node:fs";
import path from "path";

export default function deleteOldImage(folder: string, filename?: string | null) {
  if (!filename) return;

  const filePath = path.join(`uploads/${folder}`, filename);
  if (existsSync(filePath)) {
    unlinkSync(filePath);
  }
}
