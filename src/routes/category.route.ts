import express from "express";
import { addCategory, deleteCategory, getAllCategories, getSingleCategory, updateCategory } from "../controllers/category.controller";
import validate from "../middleware/validate";
import { createCategorySchema, updateCategorySchema } from "../schemas/category.schema";
import authenticate from "../middleware/authenticate";
import { authorizeRoles } from "../middleware/authorizeRoles";

const categoryRouter = express.Router();

//* GET
categoryRouter.get("/", getAllCategories);
categoryRouter.get("/:slug", getSingleCategory);

//* POST
categoryRouter.post("/create", authenticate, authorizeRoles("admin"), validate(createCategorySchema), addCategory);

//* PUT
categoryRouter.put("/edit/:slug", authenticate, authorizeRoles("admin"), validate(updateCategorySchema), updateCategory);

//* DELETE
categoryRouter.delete("/delete/:slug", authenticate, authorizeRoles("admin"), deleteCategory);

export default categoryRouter;
