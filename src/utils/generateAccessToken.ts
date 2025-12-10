import jwt from "jsonwebtoken";
import { Types } from "mongoose";

export default function generateAccessToken(userId: Types.ObjectId, userRole: "customer" | "admin") {
  const secret = process.env.SECRET_KEY_ACCESS_TOKEN;
  if (!secret) {
    throw new Error("SECRET_KEY_ACCESS_TOKEN not found!");
  }
  const token = jwt.sign({ id: userId, role: userRole }, secret, { expiresIn: "24h" });

  return token;
}
