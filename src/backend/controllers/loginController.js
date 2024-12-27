const User = require("../models/User");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const dotenv = require('dotenv');



// Generate JWT_SECRET & JWT_REFRESH_SECRET
const checkAndGenerateEnv = () => {
    const envPath = path.resolve(__dirname, '../.env');
  
    // If .env file does not exist, create a new .env file
    if (!fs.existsSync(envPath)) {
      console.log('.env file does not exist, creating a new one...');
      fs.writeFileSync(envPath, '', 'utf8');
    }
  
    // Read the content of the .env file
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    // Check if .env contains JWT_SECRET and JWT_REFRESH_SECRET
    let jwtSecretExists = envContent.includes('JWT_SECRET');
    let jwtRefreshSecretExists = envContent.includes('JWT_REFRESH_SECRET');
  
    if (!jwtSecretExists || !jwtRefreshSecretExists) {
      // If they don't exist, generate new secrets
      const generateRandomSecret = () => crypto.randomBytes(64).toString('hex');
      
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
      fs.writeFileSync(envPath, newEnvContent.trim(), 'utf8');
      console.log('JWT_SECRET and JWT_REFRESH_SECRET have been generated and added to the .env file');
    } else {
      console.log('JWT_SECRET and JWT_REFRESH_SECRET already exist in the .env file');
    }
};

// Generate short-lived Access Token
const generateAccessToken = (userId) => {
    // Run the check and generate function
    checkAndGenerateEnv();
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

// Generate long-lived Refresh Token
const generateRefreshToken = (userId) => {
    // Run the check and generate function
    checkAndGenerateEnv();
    return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

// /api/auth/login endpoint
const GEN_TOKEN = async (req, res) => {
    const { userName, password } = req.body;

    // Authenticate user (assuming user is found in the database)
    const user = await User.findOne({ userName });
    if (!user || (password !== user.userPassword)) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    // const accessToken = generateAccessToken(user._id);
    // const refreshToken = generateRefreshToken(user._id);

    // // Store the Refresh Token in an HttpOnly cookie
    // res.cookie('refreshToken', refreshToken, {
    //     httpOnly: true, // Prevent client-side JavaScript access
    //     secure: process.env.NODE_ENV === 'production', // Transmit only over HTTPS in production
    //     sameSite: 'Strict', // Prevent CSRF attacks
    //     maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    // });

    // res.json({ accessToken });
    return res.json(user);
};

// /api/auth/refresh endpoint
const REFRESH_TOKEN = async (req, res) => {
    const refreshToken = req.cookies.refreshToken; // Retrieve from HttpOnly cookie

    if (!refreshToken) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        // Validate the Refresh Token (e.g., check if it exists in the database)
        const user = await User.findById(decoded.userId);
        if (!user || user.refreshToken !== refreshToken) {
            return res.status(403).json({ error: 'Invalid refresh token' });
        }

        const newAccessToken = generateAccessToken(user._id);
        res.json({ accessToken: newAccessToken });
    } catch (err) {
        res.status(403).json({ error: 'Invalid refresh token' });
    }
};

// Store verification codes (can be replaced with Redis or other storage for better security)
const verificationCodes  = {};

// /api/auth/send-verification-code
// API to send verification code
const SEND_VERIFICATION_CODE = async (req, res) => {
    dotenv.config();
    const { userName, email } = req.body;

    if (!userName) {
        return res.status(400).json({ message: '請提供 userName' });
    }

    if (!email) {
        return res.status(400).json({ message: '請提供 email 地址' });
    }

    // Generate a six-digit random verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Use nodemailer to send the email
    const transporter = nodemailer.createTransport({
        service: 'Gmail', // Change to your email service
        auth: {
            user: process.env.EMAIL_USER, // Set email service account
            pass: process.env.EMAIL_PASS, // Set email service password
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: '您的驗證碼',
        text: `您的驗證碼是：${verificationCode}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        verificationCodes[userName] = verificationCode; // Save the verification code

        // Send response to client with the verification code
        res.status(200).json({
            message: '驗證碼已發送',
            verificationCode, // Include the verification code in the response (only for testing/demo purposes)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '無法發送驗證碼' });
    }
};


// /api/auth/verify-code
// API to verify the verification code
const VERIFY_CODE = async (req, res) => {
    const { userName, email, code } = req.body;

    if (!userName || !email || !code) {
        return res.status(400).json({ message: '請提供 userName, email 和驗證碼' });
    }

    if (verificationCodes[userName] === code) {
        delete verificationCodes[userName]; // Delete the verification code after successful verification
        res.status(200).json({ message: '驗證成功' });
    } else {
        res.status(400).json({ message: '驗證碼錯誤或已過期' });
    }
};

// Middleware for protected routes
const AuthMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Extract the token from the "Authorization" header

    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = decoded; // Attach decoded userId to the request object
        next(); // Proceed to the next middleware or route handler
    });
};

module.exports = { GEN_TOKEN, REFRESH_TOKEN, SEND_VERIFICATION_CODE, VERIFY_CODE, AuthMiddleware };