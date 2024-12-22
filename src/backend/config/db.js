// config/db.js
const mongoose = require("mongoose");
const fs = require("fs");
require("dotenv").config();

const ca = [fs.readFileSync(process.env.DB_SSL_CA)];

const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?tls=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false`;

mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    tls: true,
    ca: ca,
  })
  .then(() => console.log("Connected to AWS DocumentDB"))
  .catch((error) =>
    console.error("Error connecting to AWS DocumentDB:", error)
  );

module.exports = mongoose;
