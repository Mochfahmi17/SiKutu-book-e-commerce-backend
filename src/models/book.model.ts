import mongoose, { Schema } from "mongoose";

const bookSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
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
    discounts: {
      type: Schema.Types.ObjectId,
      ref: "Discount",
    },
    stock: {
      type: Number,
      default: 0,
    },
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
  },
  { timestamps: true }
);

const Book = mongoose.model("Book", bookSchema);
export default Book;
