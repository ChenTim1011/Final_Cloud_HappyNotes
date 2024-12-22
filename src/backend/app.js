require("dotenv").config();
const express = require("express");
const cors = require("cors");
const whiteboardRoutes = require("./routes/whiteboardRoutes");
const cardRoutes = require("./routes/cardRoutes");
const userRoutes = require("./routes/userRoutes");
const loginRoutes = require("./routes/loginRoutes");

const app = express();

// cors middleware to allow cross-origin requests
app.use(
  cors({
    origin: "http://localhost:5173", // frontend server port
    methods: "GET,POST,PUT,DELETE,PATCH",
    credentials: true,
  })
);

app.use(express.json());
app.use("/api/whiteboards", whiteboardRoutes);
app.use("/api/cards", cardRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", loginRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
