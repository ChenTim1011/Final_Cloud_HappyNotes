const mongoose = require("../config/db");

// Define the User Schema
const userSchema = new mongoose.Schema({
    userName: { type: String, required: true },
    userPassword: { type: String, required: true },
    email: { type: String, required: true },
    isLoggedin: {type: Boolean, require: true, default: false},
    whiteboards: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Whiteboard' }], // Reference to Whiteboard's _id
    activityLog: [
        {
            logId: { type: mongoose.Schema.Types.ObjectId },
            action: { type: String }, // e.g., "new", "delete", "edit"
            timestamp: { type: Date, default: Date.now },
            entityType: { type: String }, // e.g., "card", "board"
            entityId: { type: mongoose.Schema.Types.ObjectId },
            detail: { type: String }
        }
    ],
    tags: [
        {
            tagName: { type: String },
            cardIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Card' }] // Reference to Card's _id
        }
    ]
});

// Create the User Model
const User = mongoose.model("User", userSchema);

module.exports = User;
