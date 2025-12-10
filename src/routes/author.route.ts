import express from "express";
import validate from "../middleware/validate";
import { createAuthorSchema, updateAuthorSchema } from "../schemas/author.schema";
import { addAuthor, deleteAuthor, getAllAuthors, getSingleAuthor, updateAuthor } from "../controllers/author.controller";
import upload from "../middleware/multer";
import authenticate from "../middleware/authenticate";
import { authorizeRoles } from "../middleware/authorizeRoles";

const authorRouter = express.Router();

// GET
authorRouter.get("/", getAllAuthors);
authorRouter.get("/:slug", getSingleAuthor);

// POST
authorRouter.post("/create", authenticate, authorizeRoles("admin"), upload.single("profileImage"), validate(createAuthorSchema), addAuthor);

// PUT
authorRouter.put("/edit/:slug", authenticate, authorizeRoles("admin"), upload.single("profileImage"), validate(updateAuthorSchema), updateAuthor);

// DELETE
authorRouter.delete("/delete/:slug", authenticate, authorizeRoles("admin"), deleteAuthor);

export default authorRouter;
