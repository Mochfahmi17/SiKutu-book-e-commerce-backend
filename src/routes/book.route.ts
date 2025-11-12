import express from "express";
import validate from "../middleware/validate";
import { createBookSchema, updateBookschema } from "../schemas/book.schema";
import { addBook, deleteBook, getAllBooks, getSingleBook, updateBook } from "../controllers/book.controller";
import upload from "../middleware/multer";

const bookRouter = express.Router();

// GET
bookRouter.get("/", getAllBooks);
bookRouter.get("/:slug", getSingleBook);

// POST
bookRouter.post("/create", upload.single("coverBook"), validate(createBookSchema), addBook);

// PUT
bookRouter.put("/edit/:slug", upload.single("coverBook"), validate(updateBookschema), updateBook);

// DELETE
bookRouter.delete("/delete/:slug", deleteBook);

export default bookRouter;
