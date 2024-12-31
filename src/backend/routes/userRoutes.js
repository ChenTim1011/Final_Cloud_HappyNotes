const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const AuthMiddleware = require("../controllers/loginController");

// Get all users
router.get("/", userController.GET);

// Get a user by ID
router.get("/:id", userController.GET_BY_ID);

// Get a user by NAME
router.get("/name/:userName", userController.GET_BY_NAME);

// Create a new user
router.post("/", userController.POST);

// Update a user by ID
router.put("/:id", userController.PUT);

// Delete a user by ID
router.delete("/:id", userController.DELETE);

module.exports = router;
