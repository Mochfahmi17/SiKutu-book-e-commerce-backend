import cron from "node-cron";
import Sale from "../models/sale.model";
import Book from "../models/book.model";

cron.schedule("*/1 * * * *", async () => {
  try {
    const now = new Date();

    const expiredSales = await Sale.find({ endDate: { $lte: now }, isActive: true });

    if (expiredSales.length === 0) return;

    for (const sale of expiredSales) {
      console.log("Nonactive sale: ", sale.name);

      sale.isActive = false;
      await sale.save();

      await Book.updateMany({ discounts: sale._id }, { $unset: { discountPrice: "", discounts: "" } });
    }
  } catch (error) {
    console.error("Error on cron job: ", error);
  }
});
