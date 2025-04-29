import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../utils/error.js";

const auth = (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new UnauthorizedError("Authorization token required");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new UnauthorizedError("Access token expired"));
    }
    next(new UnauthorizedError("Invalid authentication token"));
  }
};

export default auth;
