const mongoose = require("mongoose");

const stateSchema = new mongoose.Schema({
  state_id: {
    type: Number,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  }
});

module.exports = mongoose.model("State", stateSchema);
