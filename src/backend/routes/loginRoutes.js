const express = require("express");
const router = express.Router();
const loginController = require("../controllers/loginController");

// Login route
router.post('/login', loginController.GEN_TOKEN);

// Refresh token route
router.post('/refresh', loginController.REFRESH_TOKEN);

// Refresh token route
router.post('/validate-token', loginController.VALIDATE_TOKEN);

// Send verification code
router.post('/send-verification-code', loginController.SEND_VERIFICATION_CODE);

// Verify code
router.post('/verify-code', loginController.VERIFY_CODE);

module.exports = router;