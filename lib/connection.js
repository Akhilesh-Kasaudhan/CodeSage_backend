import mongoose from "mongoose";

const maxRetries = 5;
const initialDelay = 1000;

export const connectDB = async () => {
  let retryCount = 0;
  while (retryCount < maxRetries) {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log("MongoDB Connected");
      return;
    } catch (error) {
      console.error(
        `MongoDB connection error (attempt ${retryCount + 1}):`,
        error.message
      );
      retryCount++;
      if (retryCount >= maxRetries) {
        console.error("Max retries reached. Exiting process.");
        process.exit(1);
      }
      const delay = initialDelay * Math.pow(2, retryCount);
      console.log(`Retrying in ${delay / 1000} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  } catch (error) {
    console.error("Error disconnecting from MongoDB:", error.message);
  }
};
