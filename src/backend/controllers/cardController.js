const Card = require("../models/Card");
const Whiteboard = require("../models/Whiteboard");
const sanitizeHTML = require("../utils/sanitize");

const MAX_CONTENT_LENGTH = Infinity;
const MAX_TITLE_LENGTH = Infinity;

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
    const { cardTitle, content } = req.body;

    // Validate title length
    if (cardTitle.length > MAX_TITLE_LENGTH) {
      return res
        .status(400)
        .json({ error: `Title cannot exceed ${MAX_TITLE_LENGTH} characters` });
    }

    // Validate content length
    if (content.length > MAX_CONTENT_LENGTH) {
      return res.status(400).json({
        error: `Content cannot exceed ${MAX_CONTENT_LENGTH} characters`,
      });
    }

    // Sanitize content to prevent XSS attacks
    const sanitizedContent = sanitizeHTML(content);

    // Create a new card
    const newCard = new Card({
      ...req.body,
      content: sanitizedContent,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedCard = await newCard.save();
    res.status(201).json(savedCard.toObject());
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to create card", details: error.message });
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

    // Check if whiteboardId is provided
    if (!whiteboardId) {
      return res.status(400).json({ error: "whiteboardId is required" });
    }

    // Sanitize content
    const sanitizedContent = sanitizeHTML(content);

    // Create a new card
    const newCard = new Card({
      cardTitle,
      content,
      dueDate: dueDate || null,
      tag,
      foldOrNot: foldOrNot || false,
      createdAt: new Date(),
      updatedAt: new Date(),
      position,
      dimensions,
      connection,
    });

    const savedCard = await newCard.save();

    // Associate the card with the whiteboard
    const whiteboard = await Whiteboard.findById(whiteboardId).populate(
      "cards"
    );
    if (!whiteboard) {
      return res.status(404).json({ error: "Whiteboard not found" });
    }

    whiteboard.cards.push(savedCard._id);
    await whiteboard.save();

    res.status(201).json(savedCard.toObject());
  } catch (error) {
    res.status(400).json({
      error: "Failed to create card and associate with whiteboard",
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

    // Sanitize content
    const sanitizedContent = sanitizeHTML(content);

    // Update the card
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

// Partially update a card by ID
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

    // Apply changes to allowed fields
    allowedFields.forEach((field) => {
      if (
        changes[field] !== undefined &&
        changes[field] !== currentCard[field]
      ) {
        updates[field] = changes[field];
      }
    });

    // Update card position and dimensions if provided
    if (changes.position) {
      updates.position = changes.position;
    }

    if (changes.dimensions) {
      updates.dimensions = changes.dimensions;
    }

    const updatedCard = await Card.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    );

    res.json(updatedCard.toObject());
  } catch (error) {
    res.status(400).json({
      error: "Failed to update card",
      details: error.message,
    });
  }
};

// Batch update multiple cards
const PATCH_CARDS_BATCH = async (req, res) => {
  const { updates } = req.body;

  if (!updates || !Array.isArray(updates)) {
    return res.status(400).json({ error: "Invalid updates format" });
  }

  try {
    const bulkOperations = updates.map((update) => ({
      updateOne: {
        filter: { _id: update.id },
        update: { $set: update.changes },
      },
    }));

    await Card.bulkWrite(bulkOperations);
    res.status(200).json({ message: "Batch update successful" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Batch update failed", details: error.message });
  }
};

// PATCH connections of a card
const PATCH_CONNECTIONS = async (req, res) => {
  //console.log("LLLLLLLLLLLLLLLLLLLLLL");
  //console.log("Received request for PATCH /cards/:id/connections");
  //console.log("Request body:", req.body);
  try {
    const { id } = req.params; // 獲取卡片 ID
    const { connections } = req.body; // 獲取更新的 connections 數據

    // 驗證連線數據
    if (!Array.isArray(connections)) {
      return res.status(400).json({ error: "Connections must be an array." });
    }

    // 找到目標卡片
    const card = await Card.findById(id);
    //console.log("Found card:", card);

    if (!card) {
      return res.status(404).json({ error: "Card not found." });
    }

    // 更新卡片的連線字段
    //card.connections.push(connections);
    //card.connections.push(...connections);
    card.connections = [...card.connections, ...connections];
    card.updatedAt = new Date(); // 更新時間

    // 保存更新
    console.log("Before saving:", card.connections);
    await card.save();
    console.log("After saving:", card.connections);

    res.status(200).json({
      message: "Connections updated successfully.",
      connections: card.connections,
    });
  } catch (error) {
    console.error("Error updating connections:", error);
    res.status(500).json({
      error: "Failed to update connections.",
      details: error.message,
    });
  }
};

const DELETE_CONNECTION = async (req, res) => {
  try {
    const id = req.params.id; // 確保這行在使用 id 之前
    const connectionId = req.params.connectionId;
    //console.log("PPPPDELETE_CONNECTION:",id,connectionId)

    // 查找卡片
    const card = await Card.findById(id);
    console.log("OOOODELETE_CONNECTION:", id, connectionId);
    //console.log("OOOO",card)
    if (!card) {
      return res.status(404).json({ error: "Card not found." });
    }

    // 查找並移除連線
    const originalConnections = card.connections;
    //console.log("Original Connections:", originalConnections);
    const updatedConnections = originalConnections.filter(
      (connection) => connection.id !== connectionId
    );

    if (originalConnections.length === updatedConnections.length) {
      return res.status(404).json({ error: "Connection not found." });
    }
    // console.log("PPPPbefore_connections", card.connections)
    card.connections = updatedConnections;
    //console.log("PPPPafter_connections", card.connections)
    card.updatedAt = new Date(); // 更新時間戳

    // 保存更新後的卡片
    await card.save();

    res.status(200).json({
      message: "Connection deleted successfully.",
      connections: card.connections,
    });
  } catch (error) {
    console.error("Error deleting connection:", error);
    res.status(500).json({
      error: "Failed to delete connection.",
      details: error.message,
    });
  }
};

const UPDATE_CONNECTION = async (req, res) => {
  const { id, connectionId } = req.params; // 卡片 ID 和連線 ID
  const updates = req.body; // 動態接收需要更新的屬性

  try {
    const card = await Card.findById(id); // 假設連線存儲在 Card 中
    if (!card) {
      return res.status(404).json({ error: "Card not found" });
    }

    const connection = card.connections.find(
      (conn) => conn.id === connectionId
    );
    if (!connection) {
      return res.status(404).json({ error: "Connection not found" });
    }

    // 動態更新屬性
    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined) {
        connection[key] = updates[key];
      }
    });

    await card.save(); // 保存更新後的卡片
    res
      .status(200)
      .json({ message: "Connection updated successfully", connection });
  } catch (err) {
    console.error("Error updating connection:", err);
    res.status(500).json({ error: "Failed to update connection" });
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
  PATCH_CONNECTIONS,
  DELETE_CONNECTION,
  UPDATE_CONNECTION,
};
