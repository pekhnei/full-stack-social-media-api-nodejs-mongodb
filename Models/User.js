const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  followers: {
    type: Array,
  },
  following: {
    type: Array,
  },
  phoneNumber: {
    type: Number,
    required: true,
  },
  profile: {
    type: String,
  },
});

module.exports = mongoose.model("User", userSchema);
