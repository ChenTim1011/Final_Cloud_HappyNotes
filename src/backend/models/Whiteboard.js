const mongoose = require("../config/db");

// Define the Whiteboard Schema
const whiteboardSchema = new mongoose.Schema({
  whiteboardTitle: { type: String, default: "New Whiteboard" },
  isPrivate: { type: Boolean, default: false },
  //TODO: delete
  userId: { type: String, required: true },
  //TODO: userId: mongoose.Schema.Types.ObjectId,
  // reference to the User 's _id but we dont have User model yet,so we use String temporarily.
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  position: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
  },
  dimensions: {
    width: { type: Number, default: 200 },
    height: { type: Number, default: 150 },
  },

  cards: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Card",
      default: [],
    },
  ], // reference to Card's _id , to store the many-to-many relation about cards.
});

// Create the Whiteboard Model
const Whiteboard = mongoose.model("Whiteboard", whiteboardSchema);

module.exports = Whiteboard;
