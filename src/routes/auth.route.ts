import express from "express";
import { loginSchema, registerSchema } from "../schemas/auth.schema";
import { isAuthenticated, login, logout, register } from "../controllers/auth.controller";
import validate from "../middleware/validate";
import authenticate from "../middleware/authenticate";

const authRouter = express.Router();

//* GET
authRouter.get("/is-auth", authenticate, isAuthenticated);

//* POST
authRouter.post("/register", validate(registerSchema), register);
authRouter.post("/login", validate(loginSchema), login);
authRouter.post("/logout", authenticate, logout);

export default authRouter;
