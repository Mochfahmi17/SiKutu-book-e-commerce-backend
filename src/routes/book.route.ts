import express from "express";
import validate from "../middleware/validate";
import { createBookSchema } from "../schemas/book.schema";
import { addBook, getAllBooks } from "../controllers/book.controller";

const bookRouter = express.Router();

// GET
bookRouter.get("/", getAllBooks);

// POST
bookRouter.post("/create", validate(createBookSchema), addBook);

export default bookRouter;
