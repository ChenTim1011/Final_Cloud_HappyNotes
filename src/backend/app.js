const path = require("path");
const dotenv = require("dotenv");

const NODE_ENV = process.env.NODE_ENV || "development";
const envPath = NODE_ENV === "production" ? ".env.production" : ".env";
dotenv.config({ path: path.resolve(__dirname, ".", envPath) });

// Debugging
console.log(
  "Loading environment variables from:",
  path.resolve(__dirname, ".", envPath)
);
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("DB_SSL_CA:", process.env.DB_SSL_CA);

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const whiteboardRoutes = require("./routes/whiteboardRoutes");
const cardRoutes = require("./routes/cardRoutes");
const userRoutes = require("./routes/userRoutes");
const loginRoutes = require("./routes/loginRoutes");

require("./config/db");

const app = express();

const allowedOrigins =
  NODE_ENV === "production"
    ? ["https://happynote.online", "https://www.happynote.online"]
    : ["http://localhost:5173"];

// cors middleware to allow cross-origin requests
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like Postman or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    methods: "GET,POST,PUT,DELETE,PATCH",
    credentials: true,
  })
);

app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
app.use(express.json());
app.use("/api/whiteboards", whiteboardRoutes);
app.use("/api/cards", cardRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", loginRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
