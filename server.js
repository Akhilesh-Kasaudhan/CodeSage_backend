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
const clientURL = process.env.CLIENT_URL || "http://localhost:5173";
app.use(
  cors({
    origin: ["http://localhost:5173", clientURL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
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
