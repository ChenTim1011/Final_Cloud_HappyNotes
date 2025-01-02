const express = require("express");
const router = express.Router();
const cardController = require("../controllers/cardController");

// Partial update of multiple cards
router.patch("/batch", cardController.PATCH_CARDS_BATCH);

// Get all cards
router.get("/", cardController.GET_CARDS);

// Create a new card
router.post("/", cardController.POST_CARD);

// Create a new card and associate it with a whiteboard
router.post("/withWhiteboardId", cardController.POST_CARD_WHITEBOARD_ID);

// Update a card by ID
router.put("/:id", cardController.PUT_CARD);

router.delete("/:id/:connectionId", cardController.DELETE_CONNECTION);

// Delete a card by ID
router.delete("/:id", cardController.DELETE_CARD);

router.patch("/:id/connections", cardController.PATCH_CONNECTIONS);
router.patch("/:id/connections/:connectionId", cardController.UPDATE_CONNECTION);

// Partial update of a card
router.patch("/:id", cardController.PATCH_CARD);

module.exports = router;
