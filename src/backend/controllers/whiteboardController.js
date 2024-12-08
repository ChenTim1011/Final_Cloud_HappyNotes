const Whiteboard = require("../models/Whiteboard"); // import the Whiteboard model
const CacheService = require("../services/cacheService");

// GET api/whiteboards
// Get all whiteboards
const GET = async (req, res) => {
  try {
    // Check if whiteboards are cached
    const cachedWhiteboards = await CacheService.getAllWhiteboards();
    if (cachedWhiteboards) {
      return res.json(cachedWhiteboards);
    }
    // If not cached, fetch whiteboards from the database
    const whiteboards = await Whiteboard.find();
    const formattedWhiteboards = whiteboards.map((whiteboard) => ({
      ...whiteboard.toObject(),
    }));
    await CacheService.setAllWhiteboards(formattedWhiteboards);
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

    // Check if whiteboard is cached
    const cachedWhiteboard = await CacheService.getWhiteboard(id);
    if (cachedWhiteboard) {
      return res.json(cachedWhiteboard);
    }

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
    await CacheService.setWhiteboard(id, whiteboard);
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
    const formattedWhiteboard = {
      ...savedWhiteboard.toObject(),
    };
    await CacheService.setWhiteboard(savedWhiteboard._id, formattedWhiteboard);
    await CacheService.invalidateAllWhiteboards();

    res.status(201).json(formattedWhiteboard);
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
    const formattedWhiteboard = {
      ...updatedWhiteboard.toObject(),
    };

    await CacheService.setWhiteboard(id, formattedWhiteboard);
    await CacheService.invalidateAllWhiteboards();

    res.json(formattedWhiteboard);
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

    await CacheService.invalidateWhiteboard(id);
    await CacheService.invalidateAllWhiteboards();

    res.json({ message: "Whiteboard deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete whiteboard" });
  }
};

module.exports = { GET, GET_BY_ID, POST, PUT, DELETE }; // export the controller functions
