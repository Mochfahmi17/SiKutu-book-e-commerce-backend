import express from "express";
import validate from "../middleware/validate";
import { createAuthorSchema } from "../schemas/author.schema";
import { addAuthor, getAllAuthors } from "../controllers/author.controller";

const authorRouter = express.Router();

// GET
authorRouter.get("/", getAllAuthors);

// POST
authorRouter.post("/create", validate(createAuthorSchema), addAuthor);

export default authorRouter;
