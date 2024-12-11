const Card = require("../models/Card");

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
    const newCard = new Card({
      cardTitle,
      content,
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
    const updatedCard = await Card.findByIdAndUpdate(
      id,
      {
        cardTitle,
        content,
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
        updates[field] = changes[field];
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

module.exports = { GET_CARDS, POST_CARD, PUT_CARD, DELETE_CARD, PATCH_CARD };
