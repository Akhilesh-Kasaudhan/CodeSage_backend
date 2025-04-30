import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./lib/connection.js";
import authRoutes from "./routes/auth.route.js";
import codeRoutes from "./routes/code.route.js";
import globalErrorHandler from "./middlewares/error.middleware.js";
const app = express();
dotenv.config();

const port = process.env.PORT || 3000;
const clientURL =
  process.env.CLIENT_URL ||
  "http://localhost:5173" ||
  "https://codesageai.netlify.app";
const allowedOrigins = [
  "http://localhost:5173",
  clientURL,
  "https://codesageai.netlify.app.",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.includes(origin) ||
        allowedOrigins.some((allowed) => origin.includes(allowed))
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use("/api/auth", authRoutes);
app.use("/api/code", codeRoutes);

app.use(globalErrorHandler);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
  connectDB();
});
