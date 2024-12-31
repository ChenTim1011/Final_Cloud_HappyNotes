const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Get all users
router.get("/", userController.GET);

// Get a user by NAME
router.get("/name/:userName", userController.GET_BY_NAME);

// Get a user by ID
router.get("/:id", userController.GET_BY_ID);

// Create a new user
router.post("/", userController.POST);

// Update a user by ID
router.put("/:id", userController.PUT);

// Delete a user by ID
router.delete("/:id", userController.DELETE);

module.exports = router;
