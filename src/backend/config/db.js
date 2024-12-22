const mongoose = require("mongoose");
const fs = require("fs");
require("dotenv").config();

const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT;
const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;
const DB_SSL_CA = process.env.DB_SSL_CA;

const sslCA = fs.readFileSync(DB_SSL_CA, "utf8");

const uri = `mongodb://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

mongoose
  .connect(uri, {
    ssl: true,
    sslCA: sslCA,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to AWS DocumentDB"))
  .catch((error) =>
    console.error("Error connecting to AWS DocumentDB:", error)
  );

module.exports = mongoose;
