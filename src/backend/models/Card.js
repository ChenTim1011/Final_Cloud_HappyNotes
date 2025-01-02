const mongoose = require("../config/db");

// Define the Card Schema
const cardSchema = new mongoose.Schema({
  cardTitle: { type: String, default: "New Card" },
  content: { type: mongoose.Schema.Types.Mixed, default: "New Note" },
  dueDate: { type: Date, default: null },
  tag: { type: String, default: "" },
  foldOrNot: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  comments: { type: [String], default: [] }, // comment -> comments
  position: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
  },
  dimensions: {
    width: { type: Number, default: 200 },
    height: { type: Number, default: 150 },
  },
  connections: [
    {
      //startDirection: 'top' | 'bottom' | 'left' | 'right',
      //startCardId: { type: String},
      id: { type: String},
      startOffset: { x: Number, y: Number },
      endPoint: { // 連線的終點座標
        x: { type: Number, required: true },
        y: { type: Number, required: true },
      },
      text: { type:String ,required: false },
    },
  ],
});

// Create the Card Model
const Card = mongoose.model("Card", cardSchema);

module.exports = Card;
