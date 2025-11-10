import Book from "../../models/book.model";
import Category from "../../models/category.model";

const categorySeeder = async () => {
  try {
    await Book.deleteMany({});

    await Category.insertMany([{ name: "Fiction" }, { name: "Non-Fiction" }, { name: "Science" }, { name: "History" }, { name: "Mystery" }, { name: "Sci-Fi & Fantasy" }]);

    console.log("categories seed done!");
  } catch (error) {
    console.log("Error seeding categories: ", error);
  }
};

export default categorySeeder;
