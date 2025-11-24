import mongoose, { CallbackError, Schema } from "mongoose";

const authorSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    bio: {
      type: String,
      required: true,
    },
    profileImage: {
      type: String,
    },
    books: [
      {
        type: Schema.Types.ObjectId,
        ref: "Book",
      },
    ],
  },
  { timestamps: true }
);

authorSchema.pre("findOneAndDelete", async function (next) {
  try {
    const query = this.getFilter();
    const author = await this.model.findOne(query);

    if (!author) return next();

    await mongoose.model("Book").deleteMany({ author: author._id });

    next();
  } catch (error) {
    next(error as CallbackError);
  }
});

const Author = mongoose.model("Author", authorSchema);
export default Author;
