const path = require("path");
const dotenv = require("dotenv");

// Load environment variables
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
const helmet = require("helmet");
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

// CORS middleware to allow cross-origin requests
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (e.g., Postman or curl requests)
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

// Body parser middleware
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

// Content Security Policy (CSP) setup using Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"], // Default to self-hosted resources only
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"], // Allow self-hosted and HTTPS images
        connectSrc: ["'self'", "https://api.happynote.online"], // Allow API connections
        fontSrc: ["'self'", "https://fonts.googleapis.com"], // Allow Google Fonts
        objectSrc: ["'none'"], // Disable all `<object>` elements
        frameAncestors: ["'none'"], // Prevent embedding via `<iframe>`
        upgradeInsecureRequests: [], // Automatically upgrade HTTP to HTTPS
      },
    },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" }, // Referrer Policy
    crossOriginEmbedderPolicy: true, // Prevent embedding untrusted content
    crossOriginOpenerPolicy: { policy: "same-origin" }, // Enforce same-origin opener
    crossOriginResourcePolicy: { policy: "same-origin" }, // Enforce same-origin resources
  })
);

// Define routes
app.use(express.json());
app.use("/api/whiteboards", whiteboardRoutes);
app.use("/api/cards", cardRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", loginRoutes);

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
