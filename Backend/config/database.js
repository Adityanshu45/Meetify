import mongoose from "mongoose";
import config from "./config.js";

async function connectDB() {
  try {
    await mongoose.connect(config.MONGO_URI);
    console.log("DataBase Connected");
  } catch (error) {
    console.log(`DataBase connection failed : ${error}`);
  }
}

export default connectDB;
