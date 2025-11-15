import express from "express";
import validate from "../middleware/validate";
import { createAuthorSchema, updateAuthorSchema } from "../schemas/author.schema";
import { addAuthor, deleteAuthor, getAllAuthors, getSingleAuthor, updateAuthor } from "../controllers/author.controller";
import upload from "../middleware/multer";

const authorRouter = express.Router();

// GET
authorRouter.get("/", getAllAuthors);
authorRouter.get("/:slug", getSingleAuthor);

// POST
authorRouter.post("/create", upload.single("profileImage"), validate(createAuthorSchema), addAuthor);

// PUT
authorRouter.put("/edit/:slug", upload.single("profileImage"), validate(updateAuthorSchema), updateAuthor);

// DELETE
authorRouter.delete("/delete/:slug", deleteAuthor);

export default authorRouter;
