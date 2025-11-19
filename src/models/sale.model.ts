import mongoose, { Schema } from "mongoose";

const saleSchema = new Schema(
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
    description: {
      type: String,
      required: true,
    },
    discountPercentage: {
      type: Number,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    books: [
      {
        type: Schema.Types.ObjectId,
        ref: "Book",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Sale = mongoose.model("Sale", saleSchema);
export default Sale;
