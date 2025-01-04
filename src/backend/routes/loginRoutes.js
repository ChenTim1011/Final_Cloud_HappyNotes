const express = require("express");
const router = express.Router();
const loginController = require("../controllers/loginController");
const { body } = require("express-validator");
const loginLimiter = require("../middlewares/loginLimiter");

// Login route
router.post(
  "/login",
  loginLimiter,
  [
    body("userName")
      .trim()
      .notEmpty()
      .withMessage("帳號是必需的")
      .isAlphanumeric()
      .withMessage("帳號只能包含字母和數字"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("密碼是必需的")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)
      .withMessage("密碼必須包含大小寫字母、數字，且長度至少為8個字元"),
  ],
  loginController.GEN_TOKEN
);

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
