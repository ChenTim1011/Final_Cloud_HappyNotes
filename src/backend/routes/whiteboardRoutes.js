const express = require("express");
const router = express.Router();
const whiteboardController = require("../controllers/whiteboardController");

// Get all whiteboards
router.get("/", whiteboardController.GET);

// Get a whiteboard by ID
router.get("/:id", whiteboardController.GET_BY_ID);

// Create a new whiteboard
router.post("/", whiteboardController.POST);

// Update a whiteboard by ID
router.put("/:id", whiteboardController.PUT);

// Delete a whiteboard by ID
router.delete("/:id", whiteboardController.DELETE);

module.exports = router;
