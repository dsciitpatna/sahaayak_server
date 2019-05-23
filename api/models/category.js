const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
  name: {
    type: String,
    required: true
  },
  register_date: {
    type: Date,
    default: Date.now
  }
})

module.exports = Categories = mongoose.model('category', CategorySchema);