const express = require("express");
const router = express.Router();
const cardController = require("../controllers/cardController");

// Partial update of multiple cards
router.patch("/batch", cardController.PATCH_CARDS_BATCH);

// Get all cards
router.get("/", cardController.GET_CARDS);

// Create a new card
router.post("/", cardController.POST_CARD);

// Update a card by ID
router.put("/:id", cardController.PUT_CARD);

// Delete a card by 
router.delete("/:id/:connectionId", cardController.DELETE_CONNECTION);
router.delete("/:id", cardController.DELETE_CARD);

router.patch("/:id/connections", cardController.PATCH_CONNECTIONS);

router.patch("/:id/connections/:connectionId", cardController.UPDATE_CONNECTION); 

/*router.patch("/:id/connections", (req, res, next) => {
    console.log("Matched route: PATCH /:cardId/connections");
    console.log("Params:", req.params);
    console.log("Body:", req.body);
    next();
  }, cardController.addConnection);*/

// Partial update of a card
router.patch("/:id", cardController.PATCH_CARD);



// Add connection to a card



module.exports = router;
