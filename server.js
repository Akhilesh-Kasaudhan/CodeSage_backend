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
  "https://codesage-backend.onrender.com",
];

// Enhanced CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Check if origin is in allowedOrigins or includes any allowed domain
    if (
      allowedOrigins.some((allowed) => origin === allowed) ||
      allowedOrigins.some((allowed) =>
        origin.includes(new URL(allowed).hostname)
      )
    ) {
      return callback(null, true);
    }

    callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options("*", cors(corsOptions));

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
