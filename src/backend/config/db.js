const mongoose = require("mongoose");
const fs = require("fs");
require("dotenv").config();

const sslCA = fs.readFileSync(process.env.DB_SSL_CA, "utf8");

const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?tls=true&tlsCAFile=${process.env.DB_SSL_CA}&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false`;

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
