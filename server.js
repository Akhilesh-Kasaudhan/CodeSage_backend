import dotenv from "dotenv";
dotenv.config();
console.log("ENV KEY LOADED? ", process.env.GEMINI_API_KEY ? true : false);

import express from "express";

import bodyParser from "body-parser";
import cors from "cors";

import { connectDB } from "./lib/connection.js";
import authRoutes from "./routes/auth.route.js";
import codeRoutes from "./routes/code.route.js";
import errorHandler from "./middlewares/errorHandler.js";

const app = express();

const port = process.env.PORT;

// ✅ CORS setup
const allowedOrigins = [
  "http://localhost:5173",
  "https://codesageai.netlify.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    allowedHeaders: "Content-Type,Authorization",
    methods: "GET,POST,PUT,DELETE",
  })
);

app.use(bodyParser.json());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

try {
  app.use("/api/auth", authRoutes);
  console.log("Auth routes registered successfully");
} catch (error) {
  console.error("Error registering auth routes:", error);
}

try {
  app.use("/api/code", codeRoutes);
  console.log("Code routes registered successfully");
} catch (error) {
  console.error("Error registering code routes:", error);
}

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
  connectDB();
});
