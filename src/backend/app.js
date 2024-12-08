require("dotenv").config();
const express = require("express");
const cors = require("cors");
const whiteboardRoutes = require("./routes/whiteboardRoutes");
const cardRoutes = require("./routes/cardRoutes");
const redisClient = require("./config/redis");

const app = express();

// cors middleware to allow cross-origin requests
app.use(
  cors({
    origin: "http://localhost:5173", // frontend server port
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

app.use(express.json());
app.use("/api/whiteboards", whiteboardRoutes);
app.use("/api/cards", cardRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
