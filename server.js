// import express from "express";
// import bodyParser from "body-parser";
// import cors from "cors";
// import dotenv from "dotenv";
// import { connectDB } from "./lib/connection.js";
// import authRoutes from "./routes/auth.route.js";
// import codeRoutes from "./routes/code.route.js";
// import globalErrorHandler from "./middlewares/error.middleware.js";

// const app = express();
// dotenv.config();

// const port = process.env.PORT || 3000;

// // ✅ CORS setup — don't include backend URL in origins
// const allowedOrigins = [
//   "http://localhost:5173",
//   "https://codesageai.netlify.app",
// ];

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true,
//   })
// );

// // ✅ Handle preflight requests
// app.options("*", cors());

// // ✅ Body parsers
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.static("public"));

// // ✅ Health check
// app.get("/health", (req, res) => res.sendStatus(200));

// // ✅ Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/code", codeRoutes);

// // ✅ Error handler
// app.use(globalErrorHandler);

// // ✅ Start server
// app.listen(port, () => {
//   console.log(`Server is running on port: ${port}`);
//   connectDB();
// });

// Modified server.js
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
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

// ✅ Handle preflight requests
// app.options("*", cors());

// ✅ Body parsers
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// ✅ Health check
app.get("/health", (req, res) => res.sendStatus(200));

// Debug logging for route registration
console.log("About to register routes...");

// ✅ Routes with proper error handling
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

// ✅ Error handler
app.use(globalErrorHandler);

// ✅ Start server
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
  connectDB();
});
