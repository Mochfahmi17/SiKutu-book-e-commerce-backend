import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("Please provide MONGODB_URI in .env file.");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Database is connected!");
  } catch (error) {
    console.log("Database connection error!", error);
    process.exit(1);
  }
};

export default connectDB;
