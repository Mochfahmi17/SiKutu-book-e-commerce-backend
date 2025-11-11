import slugify from "slugify";
import Book from "../../models/book.model";
import Category from "../../models/category.model";

const categorySeeder = async () => {
  try {
    await Book.deleteMany({});

    await Category.insertMany([
      { name: "Fiction", slug: slugify("Fiction", { lower: true, strict: true }) },
      { name: "Non-Fiction", slug: slugify("Non-Fiction", { lower: true, strict: true }) },
      { name: "Education", slug: slugify("Education", { lower: true, strict: true }) },
      { name: "Children & Young Adult", slug: slugify("Children & Young Adult", { lower: true, strict: true }) },
      { name: "Technical", slug: slugify("Technical", { lower: true, strict: true }) },
    ]);

    console.log("categories seed done!");
  } catch (error) {
    console.log("Error seeding categories: ", error);
  }
};

export default categorySeeder;
