const express = require("express");
const router = express.Router();
const loginController = require("../controllers/loginController");

// Login route
router.post("/login", loginController.GEN_TOKEN);

// Refresh token route
router.post("/refresh", loginController.REFRESH_TOKEN);

// Validate token route
router.post("/validate-token", loginController.VALIDATE_TOKEN);

// Send verification code
router.post("/send-verification-code", loginController.SEND_VERIFICATION_CODE);

// Verify code
router.post("/verify-code", loginController.VERIFY_CODE);

// Get current user
router.get("/me", loginController.AuthMiddleware, loginController.ME);

module.exports = router;
