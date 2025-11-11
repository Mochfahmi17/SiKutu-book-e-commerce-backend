import express from "express";
import validate from "../middleware/validate";
import { createBookSchema } from "../schemas/book.schema";
import { addBook, getAllBooks, getSingleBook } from "../controllers/book.controller";
import upload from "../middleware/multer";

const bookRouter = express.Router();

// GET
bookRouter.get("/", getAllBooks);
bookRouter.get("/:slug", getSingleBook);

// POST
bookRouter.post("/create", upload.single("coverBook"), validate(createBookSchema), addBook);

export default bookRouter;
