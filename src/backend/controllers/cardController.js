const Card = require("../models/Card"); // import the Card model
const CacheService = require("../services/cacheService");

// Get all cards
const GET_CARDS = async (req, res) => {
  try {
    // Check if cards are cached
    const cachedCards = await CacheService.getAllCards();
    if (cachedCards) {
      return res.json(cachedCards);
    }

    const cards = await Card.find();
    const formattedCards = cards.map((card) => ({
      ...card.toObject(),
    }));
    await CacheService.setAllCards(formattedCards);
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
      foldOrNot: false, // card is not folded by default
      createdAt: new Date(),
      updatedAt: new Date(),
      position,
      dimensions,
      connection,
    });
    const savedCard = await newCard.save();
    const formattedCard = {
      ...savedCard.toObject(),
    };

    await CacheService.setCard(savedCard._id, formattedCard);
    await CacheService.invalidateAllCards();

    res.status(201).json(formattedCard);
  } catch (error) {
    res
      .status(400)
      .json({ error: "Failed to create card", details: error.message });
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
      { new: true } // Return the updated document
    );
    if (!updatedCard) {
      return res.status(404).json({ error: "Card not found" });
    }
    const formattedCard = {
      ...updatedCard.toObject(),
    };

    await CacheService.setCard(id, formattedCard);
    await CacheService.invalidateAllCards();

    res.json(formattedCard);
  } catch (error) {
    res
      .status(400)
      .json({ error: "Failed to update card", details: error.message });
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

    await CacheService.invalidateCard(id);
    await CacheService.invalidateAllCards();

    res.json({ message: "Card deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete card" });
  }
};

module.exports = { GET_CARDS, POST_CARD, PUT_CARD, DELETE_CARD }; // export the controller functions
