import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import {
  BadRequestError,
  UnauthorizedError,
  InternalServerError,
} from "../utils/error.js";

// Token expiration times from .env
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "1d";
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "7d";

export const register = async (req, res, next) => {
  const { username, email, password } = req.body;
  try {
    if (!username || !email || !password) {
      console.log("Missing fields in registration request");
      return next(
        new BadRequestError("Please provide username, email, and password")
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("User already exists with this email");
      return next(new BadRequestError("Username or email already exists."));
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      refreshTokens: [],
    });
    await newUser.save();
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.log("Error during registration:", error);
    return next(new InternalServerError("Error during user registration"));
  }
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      console.log("Missing fields in login request");
      return next(new BadRequestError("Please provide email and password"));
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found with this email");
      return next(new UnauthorizedError("Invalid credentials"));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log("Invalid password for this user");
      return next(new UnauthorizedError("Invalid credentials"));
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    );

    user.refreshTokens.push(refreshToken);
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: "strict",
    });

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      token,
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });
  } catch (error) {
    console.log("Error during login:", error);
    return next(new InternalServerError("Error during user login"));
  }
};

export const refreshToken = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

  try {
    if (!refreshToken) {
      console.log("Refresh token is required");
      return next(new UnauthorizedError("Refresh token is required"));
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || !user.refreshTokens.includes(refreshToken)) {
      console.log("Invalid refresh token");
      return next(new UnauthorizedError("Invalid refresh token"));
    }

    const newAccessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    res.status(200).json({
      success: true,
      token: newAccessToken,
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });
  } catch (error) {
    console.log("Error during token refresh:", error);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Refresh token expired",
      });
    }
    return next(new InternalServerError("Error during token refresh"));
  }
};

export const logout = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

  try {
    if (!refreshToken) {
      console.log("Refresh token is required for logout");
      return next(new BadRequestError("Refresh token is required"));
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);

    if (user) {
      user.refreshTokens = user.refreshTokens.filter(
        (token) => token !== refreshToken
      );
      await user.save();
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.clearCookie("refreshToken");
    console.log("Error during logout:", error);
    return next(new InternalServerError("Error during logout"));
  }
};
