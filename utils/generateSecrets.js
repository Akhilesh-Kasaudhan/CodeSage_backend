import { writeFileSync } from "fs";
import { randomBytes } from "node:crypto";

// Generate secure random strings using built-in crypto
const jwtSecret = randomBytes(32).toString("hex");
const jwtRefreshSecret = randomBytes(32).toString("hex");

// Update .env file
const envConfig = `
PORT=3000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb+srv://akhil2003kd:PpN6u5Me4ccNUuXA@cluster0.u1eroej.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
GEMINI_API_KEY=AIzaSyA8VZXSOzdPnq0hK3mwJJCASkKFGOkImfg
JWT_SECRET=${jwtSecret}

JWT_REFRESH_SECRET=${jwtRefreshSecret}
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
`;

writeFileSync(".env", envConfig);
console.log("JWT secrets generated and .env file updated");
