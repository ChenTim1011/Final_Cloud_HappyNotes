const Whiteboard = require("../models/Whiteboard");

// GET api/whiteboards
// Get all whiteboards
const GET = async (req, res) => {
  try {
    const whiteboards = await Whiteboard.find();
    const formattedWhiteboards = whiteboards.map((whiteboard) => ({
      ...whiteboard.toObject(),
    }));
    res.json(formattedWhiteboards);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch whiteboards" });
  }
};

// GET api/whiteboards/:id
// Get a whiteboard by ID
const GET_BY_ID = async (req, res) => {
  try {
    const { id } = req.params;

    // use populate() to get the cards associated with the whiteboard
    const whiteboard = await Whiteboard.findById(id).populate("cards");

    if (!whiteboard) {
      return res.status(404).json({ error: "Whiteboard not found" });
    }

    console.log("Populated Whiteboard:", whiteboard);

    // check if the whiteboard has cards
    if (!Array.isArray(whiteboard.cards)) {
      whiteboard.cards = [];
    }
    res.json(whiteboard);
  } catch (error) {
    console.error("Error fetching whiteboard:", error);
    res.status(500).json({ error: "Failed to fetch whiteboard" });
  }
};

// POST api/whiteboards
// Create a new whiteboard
const POST = async (req, res) => {
  try {
    console.log("Request Body:", req.body);

    const { whiteboardTitle, isPrivate, userId, position, dimensions, cards } =
      req.body;

    if (!whiteboardTitle || !userId || !position || !dimensions) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newWhiteboard = new Whiteboard({
      whiteboardTitle,
      isPrivate,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      position,
      dimensions,
      cards: Array.isArray(cards) ? cards : [],
    });
    const savedWhiteboard = await newWhiteboard.save();
    res.status(201).json(savedWhiteboard.toObject());
  } catch (error) {
    console.error("Error creating whiteboard:", error);
    res
      .status(400)
      .json({ error: "Failed to create whiteboard", details: error.message });
  }
};

// PUT api/whiteboards/:id
// Update a whiteboard by ID
const PUT = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body, updatedAt: new Date() };

    if (updates.cards && !Array.isArray(updates.cards)) {
      return res
        .status(400)
        .json({ error: "Cards should be an array of card IDs" });
    }

    const updatedWhiteboard = await Whiteboard.findByIdAndUpdate(id, updates, {
      new: true,
    }).populate("cards");

    if (!updatedWhiteboard) {
      return res.status(404).json({ error: "Whiteboard not found" });
    }

    res.json(updatedWhiteboard.toObject());
  } catch (error) {
    res
      .status(400)
      .json({ error: "Failed to update whiteboard", details: error.message });
  }
};

// DELETE api/whiteboards/:id
// Delete a whiteboard by ID
const DELETE = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBoard = await Whiteboard.findByIdAndDelete(id);
    if (!deletedBoard) {
      return res.status(404).json({ error: "Whiteboard not found" });
    }

    res.json({ message: "Whiteboard deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete whiteboard" });
  }
};

module.exports = { GET, GET_BY_ID, POST, PUT, DELETE };
