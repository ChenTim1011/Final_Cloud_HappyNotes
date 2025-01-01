// controllers/authController.js

const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const dotenv = require("dotenv");

// Initialize dotenv
dotenv.config();

// Define verificationCodes as an in-memory store
const verificationCodes = {};

// Generate JWT_SECRET & JWT_REFRESH_SECRET
const checkAndGenerateEnv = () => {
  const envPath = path.resolve(__dirname, "../.env");

  // If .env file does not exist, create a new one
  if (!fs.existsSync(envPath)) {
    console.log(".env file does not exist, creating a new one...");
    fs.writeFileSync(envPath, "", "utf8");
  }

  // Read the content of the .env file
  const envContent = fs.readFileSync(envPath, "utf8");

  // Check if .env contains JWT_SECRET and JWT_REFRESH_SECRET
  let jwtSecretExists = envContent.includes("JWT_SECRET");
  let jwtRefreshSecretExists = envContent.includes("JWT_REFRESH_SECRET");

  if (!jwtSecretExists || !jwtRefreshSecretExists) {
    // If they don't exist, generate new secrets
    const generateRandomSecret = () => crypto.randomBytes(64).toString("hex");

    // Generate random JWT_SECRET and JWT_REFRESH_SECRET
    const jwtSecret = generateRandomSecret();
    const jwtRefreshSecret = generateRandomSecret();

    // Add JWT_SECRET and JWT_REFRESH_SECRET to the .env file
    const newEnvContent = `
  ${envContent.trim()}
  JWT_SECRET=${jwtSecret}
  JWT_REFRESH_SECRET=${jwtRefreshSecret}
  `;

    // Write the updated content to the .env file
    fs.writeFileSync(envPath, newEnvContent.trim(), "utf8");
    console.log(
      "JWT_SECRET and JWT_REFRESH_SECRET have been generated and added to the .env file"
    );
    dotenv.config();
  } else {
    console.log(
      "JWT_SECRET and JWT_REFRESH_SECRET already exist in the .env file"
    );
  }
};

// Generate short-lived Access Token
const generateAccessToken = (userName) => {
  // Run the check and generate function
  checkAndGenerateEnv();
  return jwt.sign({ userName }, process.env.JWT_SECRET, { expiresIn: "15m" });
};

// Generate long-lived Refresh Token
const generateRefreshToken = (userName) => {
  // Run the check and generate function
  checkAndGenerateEnv();
  return jwt.sign({ userName }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

// /api/auth/login endpoint
const GEN_TOKEN = async (req, res) => {
  const { userName, password } = req.body;

  // Authenticate user (assuming user is found in the database)
  try {
    // Find user in the database
    const user = await User.findOne({ userName });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Compare the password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.userPassword);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Authentication successful, generate access token and refresh token
    const accessToken = generateAccessToken(userName);
    const refreshToken = generateRefreshToken(userName);

    console.log(accessToken, "\n", refreshToken);
    // Authentication successful, return user data
    return res.json([user, accessToken, refreshToken]);
  } catch (error) {
    return res.status(500).json({ error: "Error during authentication" });
  }
};

// /api/auth/refresh endpoint
const REFRESH_TOKEN = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: "Refresh token is required" });
  }

  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Check if the user exists
    const user = await User.findOne({ userName: decoded.userName });
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Generate a new access token
    const accessToken = generateAccessToken(user.userName);

    return res.json({ accessToken });
  } catch (error) {
    return res.status(403).json({ error: "Invalid or expired refresh token" });
  }
};

// /api/auth/validate-token
const VALIDATE_TOKEN = (req, res) => {
  const authHeader = req.headers.authorization;
  const { userName } = req.body;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.userName !== userName) {
      return res.status(403).json({ error: "Forbidden: Access denied" });
    }

    res.status(200).json({ message: "Token is valid" });
  } catch (error) {
    res.status(403).json({ error: "Invalid or expired token" });
  }
};

// /api/auth/send-verification-code
// API to send verification code
const SEND_VERIFICATION_CODE = async (req, res) => {
  dotenv.config();
  const { userName, email } = req.body;

  if (!userName) {
    return res.status(400).json({ message: "請提供 userName" });
  }

  if (!email) {
    return res.status(400).json({ message: "請提供 email 地址" });
  }

  // Generate a six-digit random verification code
  const verificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();

  // Store the verification code associated with the userName
  verificationCodes[userName] = verificationCode;

  // Use nodemailer to send the email
  const transporter = nodemailer.createTransport({
    service: "Gmail", // Change to your email service
    auth: {
      user: process.env.EMAIL_USER, // Set email service account
      pass: process.env.EMAIL_PASS, // Set email service password
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "您的驗證碼",
    text: `您的驗證碼是：${verificationCode}`,
  };

  try {
    await transporter.sendMail(mailOptions);

    // Send response to client without the verification code for security
    res.status(200).json({
      message: "驗證碼已發送",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "無法發送驗證碼" });
  }
};

// /api/auth/verify-code
// API to verify the verification code
const VERIFY_CODE = async (req, res) => {
  const { userName, email, code } = req.body;

  if (!userName || !email || !code) {
    return res.status(400).json({ message: "請提供 userName, email 和驗證碼" });
  }

  if (verificationCodes[userName] === code) {
    delete verificationCodes[userName]; // Delete the verification code after successful verification
    res.status(200).json({ message: "驗證成功" });
  } else {
    res.status(400).json({ message: "驗證碼錯誤或已過期" });
  }
};

// Middleware for protected routes
const AuthMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract the token from the "Authorization" header

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = decoded; // Attach decoded userName to the request object
    next(); // Proceed to the next middleware or route handler
  });
};

// GET /api/auth/me - Get current user based on token
const ME = async (req, res) => {
  try {
    const userName = req.user.userName;
    const user = await User.findOne({ userName })
      .populate("whiteboards")
      .exec();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user.toObject());
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

module.exports = {
  GEN_TOKEN,
  REFRESH_TOKEN,
  VALIDATE_TOKEN,
  SEND_VERIFICATION_CODE,
  VERIFY_CODE,
  AuthMiddleware,
  ME,
};
