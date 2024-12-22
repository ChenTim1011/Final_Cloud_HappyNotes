const User = require("../models/User");

// GET api/users
// Get all users
const GET = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users.map(user => user.toObject()));
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// GET api/users/:id
// Get a user by ID
const GET_BY_ID = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user.toObject());
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

// GET api/users/name/:userName
// Get a user by userName
const GET_BY_NAME = async (req, res) => {
  try {
    // const { userName } = req.params;
    const { userName } = req.params;
    console.log("Received query params:", userName);

    const users = await User.find({ userName }).populate('whiteboards').exec();

    if (!users) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(users.map(user => user.toObject()));
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

// POST api/users
// Create a new user
const POST = async (req, res) => {
  try {
    const { userName, userPassword, email } = req.body;

    if (!userName || !userPassword || !email) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newUser = new User({
      userName,
      userPassword,
      email,
      whiteboards: [],
      activityLog: [],
      tags: []
    });

    const savedUser = await newUser.save();
    res.status(201).json(savedUser.toObject());
  } catch (error) {
    res.status(400).json({ error: "Failed to create user", details: error.message });
  }
};

// PUT api/users/:id
// Update a user by ID
const PUT = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(updatedUser.toObject());
  } catch (error) {
    res.status(400).json({ error: "Failed to update user", details: error.message });
  }
};

// DELETE api/users/:id
// Delete a user by ID
const DELETE = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
};

module.exports = { GET, GET_BY_ID, GET_BY_NAME, POST, PUT, DELETE };
