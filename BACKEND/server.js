const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8070;

app.use(cors());
app.use(bodyParser.json());

const URL = process.env.MONGODB_URL;

mongoose.connect(URL)
  .then(() => {
    console.log("MongoDB connectiomn successful");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
