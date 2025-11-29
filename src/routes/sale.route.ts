import express from "express";
import { addSale, deleteSale, getActiveSales, getAllSales, getSingleSale, updateSale } from "../controllers/sale.controller";
import validate from "../middleware/validate";
import { createSaleSchema, updateSaleSchema } from "../schemas/sale.schema";
import upload from "../middleware/multer";

const saleRouter = express.Router();

//* GET
saleRouter.get("/", getAllSales);
saleRouter.get("/active", getActiveSales);
saleRouter.get("/:slug", getSingleSale);

//* POST
saleRouter.post("/create", upload.single("bannerImageSale"), validate(createSaleSchema), addSale);

//* PUT
saleRouter.put("/edit/:slug", upload.single("bannerImageSale"), validate(updateSaleSchema), updateSale);

//* DELETE
saleRouter.delete("/delete/:slug", deleteSale);

export default saleRouter;
