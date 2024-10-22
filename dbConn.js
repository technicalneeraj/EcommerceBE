const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("MongoDB is connected");
  } catch (err) {
    console.log(err);
  }
};

module.exports = connectDB;
