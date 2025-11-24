import mongoose, { CallbackError, Schema } from "mongoose";
import deleteOldImage from "../utils/deleteOldImage";

const bookSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "Author",
      required: true,
    },
    coverBook: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
    discountPrice: {
      type: Number,
    },
    sales: {
      type: Schema.Types.ObjectId,
      ref: "Sale",
    },
    stock: {
      type: Number,
      default: 0,
    },
    releaseDate: {
      type: Date,
      required: true,
    },
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
  },
  { timestamps: true }
);

bookSchema.pre("findOneAndUpdate", async function (next) {
  try {
    const rawUpdate = this.getUpdate();
    if (!rawUpdate) return next();

    if (Array.isArray(rawUpdate)) return next();
    const update = rawUpdate as mongoose.UpdateQuery<mongoose.Document>;

    const filter = this.getFilter();
    const book = await this.model.findOne(filter);
    if (!book) {
      return next();
    }

    const newAuthor = update.$set.author;
    const newCategory = update.$set.category;

    if (newAuthor && String(newAuthor) !== String(book.author)) {
      await mongoose.model("Author").findByIdAndUpdate(book.author, { $pull: { books: book._id } });
      await mongoose.model("Author").findByIdAndUpdate(newAuthor, { $addToSet: { books: book._id } });
    }

    if (newCategory && String(newCategory) !== String(book.category)) {
      await mongoose.model("Category").findByIdAndUpdate(book.category, { $pull: { books: book._id } });
      await mongoose.model("Category").findByIdAndUpdate(newCategory, { $addToSet: { books: book._id } });
    }

    next();
  } catch (error) {
    next(error as CallbackError);
  }
});

bookSchema.pre("findOneAndDelete", async function (next) {
  try {
    const filter = this.getFilter();

    const book = await this.model.findOne(filter);
    if (!book) {
      return next();
    }

    await mongoose.model("Author").updateOne({ _id: book.author }, { $pull: { books: book._id } });
    await mongoose.model("Category").updateOne({ _id: book.category }, { $pull: { books: book._id } });

    next();
  } catch (error) {
    next(error as CallbackError);
  }
});

bookSchema.pre("deleteMany", async function (next) {
  try {
    const filter = this.getFilter();

    const books = await mongoose.model("Book").find(filter);

    for (const book of books) {
      const coverBook = book.coverBook;
      if (coverBook) {
        try {
          deleteOldImage("cover", coverBook);
        } catch (error) {
          console.warn("Cover image not found or already deleted: ", error);
        }
      }
    }

    const reviewIds = books.flatMap((b) => b.reviews);
    if (reviewIds.length > 0) {
      await mongoose.model("Review").deleteMany({ _id: { $in: reviewIds } });
    }

    const bookIds = books.map((b) => b._id);

    if (bookIds.length > 0) {
      await mongoose.model("Author").updateMany({ books: { $in: bookIds } }, { $pull: { books: { $in: bookIds } } });
    }

    if (bookIds.length > 0) {
      await mongoose.model("Category").updateMany({ books: { $in: bookIds } }, { $pull: { books: { $in: bookIds } } });
    }

    next();
  } catch (error) {
    next(error as CallbackError);
  }
});

const Book = mongoose.model("Book", bookSchema);
export default Book;
