import cron from "node-cron";
import Sale from "../models/sale.model";
import Book from "../models/book.model";

cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();

    const activeSales = await Sale.find({ startDate: { $lte: now }, endDate: { $gte: now }, isActive: false });
    const expiredSales = await Sale.find({ endDate: { $lte: now }, isActive: true });

    if (expiredSales.length > 0) {
      for (const sale of expiredSales) {
        console.log("Nonactive sale: ", sale.name);

        sale.isActive = false;
        await sale.save();

        await Book.updateMany({ discounts: sale._id }, { $unset: { discountPrice: "", sales: "" } });
      }
    }

    if (activeSales.length > 0) {
      for (const sale of activeSales) {
        console.log("Active sale: ", sale.name);

        sale.isActive = true;
        await sale.save();
      }
    }
  } catch (error) {
    console.error("Error on cron job: ", error);
  }
});
