const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CatagorySchema = new Schema({
  name: {
    type: String,
    required: true
  },
  register_date: {
    type: Date,
    default: Date.now
  }
})

module.exports = Catagory = mongoose.model('catagory', CatagorySchema);