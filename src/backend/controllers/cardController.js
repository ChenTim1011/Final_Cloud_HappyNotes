const Card = require("../models/Card");
const Whiteboard = require("../models/Whiteboard");
const sanitizeHTML = require("../utils/sanitize");
// Get all cards
const GET_CARDS = async (req, res) => {
  try {
    const cards = await Card.find();
    const formattedCards = cards.map((card) => ({
      ...card.toObject(),
    }));
    res.json(formattedCards);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch cards" });
  }
};

// Create a new card
const POST_CARD = async (req, res) => {
  try {
    const {
      cardTitle,
      content,
      dueDate,
      tag,
      foldOrNot,
      position,
      dimensions,
      connection,
    } = req.body;

    const sanitizedContent = sanitizeHTML(content);

    const newCard = new Card({
      cardTitle,
      content: sanitizedContent,
      dueDate,
      tag,
      foldOrNot: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      position,
      dimensions,
      connection,
    });
    const savedCard = await newCard.save();
    res.status(201).json(savedCard.toObject());
  } catch (error) {
    res.status(400).json({
      error: "Failed to create card",
      details: error.message,
    });
  }
};

// Create a new card and associate it with a whiteboard
const POST_CARD_WHITEBOARD_ID = async (req, res) => {
  try {
    const {
      whiteboardId,
      cardTitle,
      content,
      dueDate,
      tag,
      foldOrNot,
      position,
      dimensions,
      connection,
    } = req.body;

    console.log("Received request body:", req.body);

    // Check if whiteboardId is provided
    if (!whiteboardId) {
      console.error("白板 ID 缺失");
      return res.status(400).json({ error: "whiteboardId 是必填項目" });
    }

    const sanitizedContent = sanitizeHTML(content);

    // Check if whiteboardId is valid
    const newCard = new Card({
      cardTitle,
      content: sanitizedContent,
      dueDate: dueDate || null,
      tag,
      foldOrNot: foldOrNot || false,
      createdAt: new Date(),
      updatedAt: new Date(),
      position,
      dimensions,
      connection,
    });

    console.log("Creating new card:", newCard);

    const savedCard = await newCard.save();
    console.log("Saved card:", savedCard);

    // Associate the card with the whiteboard
    const whiteboard = await Whiteboard.findById(whiteboardId).populate(
      "cards"
    );
    if (!whiteboard) {
      console.error("找不到指定的白板 ID:", whiteboardId);
      return res.status(404).json({ error: "找不到指定的白板" });
    }

    whiteboard.cards.push(savedCard._id);
    await whiteboard.save();
    console.log("Updated whiteboard:", whiteboard);

    // Return the saved card
    res.status(201).json(savedCard.toObject());
  } catch (error) {
    console.error("Error in POST_CARD_WHITEBOARD_ID:", error);
    res.status(400).json({
      error: "新增卡片並關聯白板失敗",
      details: error.message,
    });
  }
};

// Update a card by ID
const PUT_CARD = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      cardTitle,
      content,
      dueDate,
      tag,
      foldOrNot,
      position,
      dimensions,
      connection,
    } = req.body;

    const sanitizedContent = sanitizeHTML(content);

    const updatedCard = await Card.findByIdAndUpdate(
      id,
      {
        cardTitle,
        content: sanitizedContent,
        dueDate,
        tag,
        foldOrNot,
        position,
        dimensions,
        connection,
        updatedAt: new Date(),
      },
      { new: true }
    );
    if (!updatedCard) {
      return res.status(404).json({ error: "Card not found" });
    }
    res.json(updatedCard.toObject());
  } catch (error) {
    res.status(400).json({
      error: "Failed to update card",
      details: error.message,
    });
  }
};

//

// Delete a card by ID
const DELETE_CARD = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCard = await Card.findByIdAndDelete(id);
    if (!deletedCard) {
      return res.status(404).json({ error: "Card not found" });
    }
    res.json({ message: "Card deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete card" });
  }
};

// PATCH a card by ID
const PATCH_CARD = async (req, res) => {
  try {
    const { id } = req.params;
    const { changes } = req.body;

    if (!changes || Object.keys(changes).length === 0) {
      return res.status(400).json({ error: "No changes provided" });
    }

    const currentCard = await Card.findById(id);
    if (!currentCard) {
      return res.status(404).json({ error: "Card not found" });
    }

    const updates = {
      updatedAt: new Date(),
    };

    const allowedFields = [
      "cardTitle",
      "content",
      "dueDate",
      "tag",
      "foldOrNot",
    ];

    allowedFields.forEach((field) => {
      if (
        changes[field] !== undefined &&
        changes[field] !== currentCard[field]
      ) {
        if (field === "content") {
          updates[field] = sanitizeHTML(changes[field]);
        } else {
          updates[field] = changes[field];
        }
      }
    });

    if (changes.position) {
      if (
        changes.position.x !== currentCard.position.x ||
        changes.position.y !== currentCard.position.y
      ) {
        updates.position = changes.position;
      }
    }

    if (changes.dimensions) {
      if (
        changes.dimensions.width !== currentCard.dimensions.width ||
        changes.dimensions.height !== currentCard.dimensions.height
      ) {
        updates.dimensions = changes.dimensions;
      }
    }

    if (Object.keys(updates).length === 1) {
      return res.json(currentCard);
    }

    const updatedCard = await Card.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    );

    res.json(updatedCard.toObject());
  } catch (error) {
    console.error("Error updating card:", error);
    res.status(400).json({
      error: "Failed to update card",
      details: error.message,
    });
  }
};

// PATCH_CARDS_BATCH
const PATCH_CARDS_BATCH = async (req, res) => {
  const { updates } = req.body;

  if (!updates || !Array.isArray(updates)) {
    return res.status(400).json({ message: "Invalid updates format." });
  }

  try {
    const bulkOperations = updates.map((update) => {
      const sanitizedChanges = { ...update.changes };

      if (sanitizedChanges.content) {
        sanitizedChanges.content = sanitizeHTML(sanitizedChanges.content);
      }

      return {
        updateOne: {
          filter: { _id: update.id },
          update: { $set: sanitizedChanges },
        },
      };
    });

    await Card.bulkWrite(bulkOperations);
    res.status(200).json({ message: "Batch update successful." });
  } catch (error) {
    console.error("Batch update failed:", error);
    res.status(500).json({ message: "Batch update failed.", error });
  }
};
module.exports = {
  GET_CARDS,
  POST_CARD,
  PUT_CARD,
  DELETE_CARD,
  PATCH_CARD,
  PATCH_CARDS_BATCH,
  POST_CARD_WHITEBOARD_ID,
};
