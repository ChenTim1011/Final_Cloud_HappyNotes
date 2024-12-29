// config/db.js
const mongoose = require("mongoose");
const fs = require("fs");

// Load environment variables
const NODE_ENV = process.env.NODE_ENV || "development";

let uri;
let options = {};

if (NODE_ENV === "production") {
  // AWS DocumentDB
  const ca = [fs.readFileSync(process.env.DB_SSL_CA)];
  uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?tls=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false`;

  options = {
    tls: true,
    ca: ca,
  };
} else {
  // Local MongoDB
  uri = `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
}

mongoose
  .connect(uri, options)
  .then(() => {
    if (NODE_ENV === "production") {
      console.log("Connected to AWS DocumentDB");
    } else {
      console.log("Connected to local MongoDB");
    }
  })
  .catch((error) => {
    if (NODE_ENV === "production") {
      console.error("Error connecting to AWS DocumentDB:", error);
    } else {
      console.error("Error connecting to local MongoDB:", error);
    }
  });

module.exports = mongoose;
