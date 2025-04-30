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
// Body parsers
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://codesageai.netlify.app",
      "https://codesage-backend.onrender.com",
    ],
    credentials: true,
  })
);

// Health check
app.get("/health", (req, res) => res.sendStatus(200));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/code", codeRoutes);

// Error handler
app.use(globalErrorHandler);

// Start server
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
  connectDB();
});
