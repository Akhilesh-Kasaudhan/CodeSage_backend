import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// Token expiration times from .env
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "15m";
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "7d";

export const register = async (req, res, next) => {
  const { username, email, password } = req.body;
  try {
    if (!username || !email || !password) {
      console.log("Missing fields in registration request");
      return res.status(400).json({
        message: "Please provide username, email, and password",
      });
      //   throw new BadRequestError("Please provide username, email, and password");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("User already exists with this email");
      return res.status(400).json({
        message: "Username or email already exists.",
      });
      // return next(new BadRequestError("Username or email already exists."));
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
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      console.log("Missing fields in login request");
      return res.status(400).json({
        message: "Please provide email and password",
      });
      // throw new BadRequestError("Please provide email and password");
    }

    const user = await User.findOne({ email });
    if (!user) {
      // throw new UnauthorizedError("Invalid credentials");
      console.log("User not found with this email");
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // throw new UnauthorizedError("Invalid credentials");
      console.log("Invalid password for this user");
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }
    // Generate tokens
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    );

    // Save refresh token
    user.refreshTokens.push(refreshToken);
    await user.save();

    // Set refresh token as HTTP-only cookie
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
    // next(error);
    console.log("Error during login:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const refreshToken = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

  try {
    if (!refreshToken) {
      // throw new UnauthorizedError("Refresh token is required");
      console.log("Refresh token is required");
      return res.status(401).json({
        message: "Refresh token is required",
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || !user.refreshTokens.includes(refreshToken)) {
      // throw new UnauthorizedError("Invalid refresh token");
      console.log("Invalid refresh token");
      return res.status(401).json({
        message: "Invalid refresh token",
      });
    }

    // Generate new access token
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
    // next(error);
    console.log("Error during token refresh:", error);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Refresh token expired",
      });
    }
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const logout = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

  try {
    if (!refreshToken) {
      // throw new BadRequestError("Refresh token is required");
      return res.status(400).json({
        message: "Refresh token is required",
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);

    if (user) {
      // Remove the refresh token
      user.refreshTokens = user.refreshTokens.filter(
        (token) => token !== refreshToken
      );
      await user.save();
    }

    // Clear cookie
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
    // Even if token is invalid, clear the cookie
    res.clearCookie("refreshToken");
    // next(error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
