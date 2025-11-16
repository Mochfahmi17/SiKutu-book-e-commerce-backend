import mongoose, { CallbackError, Schema } from "mongoose";

const categorySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  books: [
    {
      type: Schema.Types.ObjectId,
      ref: "Book",
    },
  ],
});

categorySchema.pre("findOneAndDelete", async function (next) {
  try {
    const query = this.getQuery();

    const category = await this.model.findOne(query);
    if (!category) return next();

    await mongoose.model("Book").deleteMany({ category: category._id });

    next();
  } catch (error) {
    next(error as CallbackError);
  }
});

const Category = mongoose.model("Category", categorySchema);

export default Category;
