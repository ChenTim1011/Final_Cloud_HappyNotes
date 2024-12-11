const express = require("express");
const router = express.Router();
const cardController = require("../controllers/cardController");

// Get all cards
router.get("/", cardController.GET_CARDS);

// Create a new card
router.post("/", cardController.POST_CARD);

// Update a card by ID
router.put("/:id", cardController.PUT_CARD);

// Delete a card by ID
router.delete("/:id", cardController.DELETE_CARD);

// Partial update of a card
router.patch("/:id", cardController.PATCH_CARD);

module.exports = router;
