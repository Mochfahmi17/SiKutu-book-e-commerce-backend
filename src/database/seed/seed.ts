import mongoose from "mongoose";
import "dotenv/config";
import categorySeeder from "./categorySeeder";

async function seed() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("Please provide MONGODB_URI in .env file.");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    await categorySeeder();

    await mongoose.disconnect();
    console.log("All seeding done and MongoDB disconnected.");
  } catch (error) {
    console.log("Error seeding database: ", error);
    process.exit(1);
  }
}

seed();
