import express from "express";
import validate from "../middleware/validate";
import { createBookSchema, updateBookschema } from "../schemas/book.schema";
import { addBook, deleteBook, getAllBooks, getNewReleases, getSingleBook, updateBook } from "../controllers/book.controller";
import upload from "../middleware/multer";
import authenticate from "../middleware/authenticate";
import { authorizeRoles } from "../middleware/authorizeRoles";

const bookRouter = express.Router();

// GET
bookRouter.get("/featured/new-releases", getNewReleases);
bookRouter.get("/", getAllBooks);
bookRouter.get("/:slug", getSingleBook);

// POST
bookRouter.post("/create", authenticate, authorizeRoles("admin"), upload.single("coverBook"), validate(createBookSchema), addBook);

// PUT
bookRouter.put("/edit/:slug", authenticate, authorizeRoles("admin"), upload.single("coverBook"), validate(updateBookschema), updateBook);

// DELETE
bookRouter.delete("/delete/:slug", authenticate, authorizeRoles("admin"), deleteBook);

export default bookRouter;
