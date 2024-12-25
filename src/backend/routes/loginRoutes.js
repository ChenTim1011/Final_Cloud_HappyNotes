const express = require("express");
const router = express.Router();
const loginController = require("../controllers/loginController");

// Login route
router.post('/login', loginController.GEN_TOKEN);

// Refresh token route
router.post('/refresh', loginController.REFRESH_TOKEN);

module.exports = router;