const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ServiceSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'user'
    },
    vendorName: {
        type: String,
        required: true
    },
    detail: [{
        description: String,
        location: String,
        contact: String
    }],
    rating: {
        type: Number,
        default: -1
    },
    register_date: {
        type: Date,
        default: Date.now
    }
})

module.exports = Service = mongoose.model('service', ServiceSchema);