import express from "express";
import authenticate from "../middleware/authenticate";
import { getUserData } from "../controllers/user.controller";

const userRouter = express.Router();

//* GET
userRouter.get("/", authenticate, getUserData);

export default userRouter;
