// import mongoose from "mongoose";

// export const connectDB = async () => {
//   try {
//     const conn = await mongoose.connect(process.env.MONGODB_URI);
//     console.log(`MongoDB Connected`);
//   } catch (error) {
//     console.log(error);
//     process.exit(1);
//   }
// };

import mongoose from "mongoose";

const maxRetries = 5; // Maximum number of retries
const initialDelay = 1000; // Initial delay in milliseconds

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
      const delay = initialDelay * Math.pow(2, retryCount); // Exponential backoff
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
