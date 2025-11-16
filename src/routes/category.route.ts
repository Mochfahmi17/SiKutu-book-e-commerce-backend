import express from "express";
import { addCategory, deleteCategory, getAllCategories, getSingleCategory, updateCategory } from "../controllers/category.controller";
import validate from "../middleware/validate";
import { createCategorySchema, updateCategorySchema } from "../schemas/category.schema";

const categoryRouter = express.Router();

//* GET
categoryRouter.get("/", getAllCategories);
categoryRouter.get("/:slug", getSingleCategory);

//* POST
categoryRouter.post("/create", validate(createCategorySchema), addCategory);

//* PUT
categoryRouter.put("/edit/:slug", validate(updateCategorySchema), updateCategory);

//* DELETE
categoryRouter.delete("/delete/:slug", deleteCategory);

export default categoryRouter;
